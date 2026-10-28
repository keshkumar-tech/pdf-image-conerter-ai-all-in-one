from rest_framework import serializers

from .models import AuditLog, PlatformSetting, SupportTicket


class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ["id", "user", "subject", "message", "status", "priority",
                  "assigned_to", "resolution_notes", "created_at"]
        read_only_fields = ["user", "status", "assigned_to", "resolution_notes"]


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ["id", "user", "action", "entity_type", "entity_id",
                  "ip_address", "before", "after", "created_at"]


class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = ["id", "key", "value", "category"]
