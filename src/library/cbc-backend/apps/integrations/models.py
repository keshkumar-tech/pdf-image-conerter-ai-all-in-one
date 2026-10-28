import uuid

from django.db import models

from apps.users.models import TimeStampedModel


class IntegrationConfig(TimeStampedModel):
    """Admin-editable config for every third-party integration:
    Payment Gateway, Video/CDN, Firebase, Storage, AI Mentor, Email, SMS.
    Secret fields are stored encrypted-at-rest by the deployment's field
    encryption (see SECURITY.md) and are ALWAYS masked in API responses."""

    PROVIDER_GROUP_CHOICES = [
        ("payment", "Payment Gateway"),
        ("video_cdn", "Video / CDN"),
        ("firebase", "Firebase"),
        ("storage", "Cloud Storage"),
        ("ai_mentor", "AI Mentor"),
        ("email", "Email"),
        ("sms", "SMS"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.CharField(max_length=20, choices=PROVIDER_GROUP_CHOICES)
    provider = models.CharField(max_length=60)  # razorpay, stripe, mux, bunny, s3, r2, gcs, openai, anthropic...
    config = models.JSONField(default=dict, blank=True)  # non-secret fields (env, currency, model, etc.)
    secret_ref = models.CharField(max_length=200, blank=True,
                                   help_text="Reference to the secret in env/secret-manager, never the raw value")
    is_enabled = models.BooleanField(default=False)
    last_test_status = models.CharField(max_length=20, blank=True)  # success | failed | untested
    last_tested_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("group", "provider")

    def __str__(self):
        return f"{self.group}:{self.provider}"


class MediaAsset(TimeStampedModel):
    ACCESS_LEVEL_CHOICES = [("public", "Public"), ("premium", "Premium"), ("private", "Private")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file_name = models.CharField(max_length=255)
    file_url = models.URLField()
    file_type = models.CharField(max_length=40)  # image, video, pdf, zip, other
    size_bytes = models.BigIntegerField(default=0)
    access_level = models.CharField(max_length=10, choices=ACCESS_LEVEL_CHOICES, default="public")
    uploaded_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, related_name="uploads")
