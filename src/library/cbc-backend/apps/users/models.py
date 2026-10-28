import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class Role(TimeStampedModel):
    """Admin RBAC role. Super Admin / Admin / Content Manager / Support / Moderator / Finance."""

    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    CONTENT_MANAGER = "content_manager"
    SUPPORT = "support"
    MODERATOR = "moderator"
    FINANCE = "finance"
    STUDENT = "student"

    ROLE_CHOICES = [
        (SUPER_ADMIN, "Super Admin"),
        (ADMIN, "Admin"),
        (CONTENT_MANAGER, "Content Manager"),
        (SUPPORT, "Support"),
        (MODERATOR, "Moderator"),
        (FINANCE, "Finance"),
        (STUDENT, "Student"),
    ]

    key = models.CharField(max_length=32, choices=ROLE_CHOICES, unique=True)
    label = models.CharField(max_length=64)
    permissions = models.JSONField(default=list)  # e.g. ["courses.edit", "orders.view"]

    def __str__(self):
        return self.label


class User(AbstractUser, TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, db_index=True)
    avatar_url = models.URLField(blank=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, related_name="users")
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    last_active_at = models.DateTimeField(null=True, blank=True)
    theme_preference = models.CharField(
        max_length=10,
        choices=[("system", "System"), ("light", "Light"), ("dark", "Dark")],
        default="system",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class Profile(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True)
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    occupation = models.CharField(max_length=120, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    onboarding_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Profile<{self.user.email}>"


class OTPCode(TimeStampedModel):
    PURPOSE_CHOICES = [
        ("register", "Register"),
        ("login", "Login"),
        ("reset_password", "Reset Password"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otp_codes")
    # code stores PBKDF2 hash in production; in transition may hold plain for legacy rows
    code = models.CharField(max_length=128)
    # code_hash stores hashed OTP for verification; plain never persisted long-term if set
    code_hash = models.CharField(max_length=128, blank=True, default="")
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() >= self.expires_at
