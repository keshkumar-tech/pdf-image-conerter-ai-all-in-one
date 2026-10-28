import uuid

from django.conf import settings
from django.db import models

from apps.courses.models import Course, PricingPlan
from apps.users.models import TimeStampedModel


def uid():
    return uuid.uuid4()


class Coupon(TimeStampedModel):
    DISCOUNT_TYPE_CHOICES = [("percent", "Percent"), ("flat", "Flat Amount")]

    code = models.CharField(max_length=40, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, default="percent")
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    applicable_courses = models.ManyToManyField(Course, blank=True, related_name="coupons")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.code


class Order(TimeStampedModel):
    STATUS_CHOICES = [
        ("created", "Created"), ("pending", "Pending"), ("success", "Success"),
        ("failed", "Failed"), ("refunded", "Refunded"), ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, related_name="orders")
    pricing_plan = models.ForeignKey(PricingPlan, on_delete=models.SET_NULL, null=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default="INR")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="created")
    provider = models.CharField(max_length=30, blank=True)  # razorpay | stripe
    provider_order_id = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order<{self.id}>"


class PaymentAttempt(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="attempts")
    provider = models.CharField(max_length=30)
    request_payload = models.JSONField(default=dict, blank=True)
    response_payload = models.JSONField(default=dict, blank=True)
    succeeded = models.BooleanField(default=False)


class Payment(TimeStampedModel):
    STATUS_CHOICES = [
        ("pending", "Pending"), ("success", "Success"), ("failed", "Failed"), ("refunded", "Refunded"),
    ]
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    provider = models.CharField(max_length=30)
    provider_payment_id = models.CharField(max_length=200, blank=True)
    signature = models.CharField(max_length=500, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    verified_at = models.DateTimeField(null=True, blank=True)


class Entitlement(TimeStampedModel):
    """The single source of truth for whether a user may access a course.
    Never derive access from price/frontend checks - always check this table."""
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="entitlements")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="entitlements")
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # null = lifetime
    is_active = models.BooleanField(default=True)
    granted_reason = models.CharField(
        max_length=30,
        choices=[("purchase", "Purchase"), ("admin_grant", "Admin Grant"), ("free_course", "Free Course")],
        default="purchase",
    )

    class Meta:
        unique_together = ("user", "course")
