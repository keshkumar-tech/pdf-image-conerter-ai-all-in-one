import uuid

from django.conf import settings
from django.db import models

from apps.users.models import TimeStampedModel


class Notification(TimeStampedModel):
    TYPE_CHOICES = [
        ("course", "Course"), ("payment", "Payment"), ("certificate", "Certificate"),
        ("assignment", "Assignment"), ("quiz", "Quiz"), ("community", "Community"),
        ("announcement", "Announcement"), ("promotion", "Promotion"), ("reminder", "Reminder"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]


class NotificationCampaign(TimeStampedModel):
    STATUS_CHOICES = [
        ("draft", "Draft"), ("scheduled", "Scheduled"), ("sent", "Sent"), ("cancelled", "Cancelled"),
    ]
    AUDIENCE_CHOICES = [
        ("all", "All"), ("free_students", "Free Students"), ("premium_students", "Premium Students"),
        ("course_students", "Course Students"), ("inactive_students", "Inactive Students"),
        ("streak_users", "Streak Users"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    body = models.TextField()
    channel = models.CharField(max_length=10, choices=[("push", "Push"), ("email", "Email"), ("sms", "SMS")])
    audience = models.CharField(max_length=30, choices=AUDIENCE_CHOICES, default="all")
    audience_course = models.ForeignKey("courses.Course", on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    recipients_count = models.PositiveIntegerField(default=0)
