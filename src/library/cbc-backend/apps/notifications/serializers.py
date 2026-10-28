from rest_framework import serializers

from .models import Notification, NotificationCampaign


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "notification_type", "title", "body", "data", "is_read", "created_at"]


class NotificationCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationCampaign
        fields = ["id", "title", "body", "channel", "audience", "audience_course",
                  "status", "scheduled_at", "sent_at", "recipients_count", "created_at"]
        read_only_fields = ["status", "sent_at", "recipients_count"]
