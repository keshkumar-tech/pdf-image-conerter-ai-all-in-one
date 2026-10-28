from rest_framework import serializers

from .models import IntegrationConfig, MediaAsset


class IntegrationConfigSerializer(serializers.ModelSerializer):
    secret_configured = serializers.SerializerMethodField()

    class Meta:
        model = IntegrationConfig
        fields = ["id", "group", "provider", "config", "secret_configured",
                  "is_enabled", "last_test_status", "last_tested_at"]

    def get_secret_configured(self, obj):
        return bool(obj.secret_ref)

    def to_internal_value(self, data):
        # Accept a write-only "secret" field from the admin form but never echo it back.
        data = data.copy()
        secret = data.pop("secret", None)
        internal = super().to_internal_value(data)
        if secret:
            internal["secret_ref"] = f"env:{internal.get('group', '')}_{internal.get('provider', '')}".upper()
        return internal


class MediaAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = ["id", "file_name", "file_url", "file_type", "size_bytes",
                  "access_level", "uploaded_by", "created_at"]
        read_only_fields = ["uploaded_by", "created_at"]
