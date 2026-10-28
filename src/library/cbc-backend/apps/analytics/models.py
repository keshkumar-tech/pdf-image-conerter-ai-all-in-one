import uuid

from django.conf import settings
from django.db import models

from apps.users.models import TimeStampedModel


class AnalyticsEvent(TimeStampedModel):
    """Generic event stream powering both learning analytics and the
    YouTube -> App business funnel (installs, signups, enrollments, purchases)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                              related_name="analytics_events")
    event_name = models.CharField(max_length=80, db_index=True)
    # e.g. app_install, signup, course_enroll, purchase, lesson_complete, quiz_attempt
    properties = models.JSONField(default=dict, blank=True)
    utm_source = models.CharField(max_length=80, blank=True)
    utm_campaign = models.CharField(max_length=80, blank=True)
    utm_medium = models.CharField(max_length=80, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["event_name", "created_at"])]
