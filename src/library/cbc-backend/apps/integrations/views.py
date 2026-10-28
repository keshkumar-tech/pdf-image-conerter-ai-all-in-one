from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import IntegrationConfig, MediaAsset
from .serializers import IntegrationConfigSerializer, MediaAssetSerializer
from .services import test_connection


class IntegrationConfigViewSet(viewsets.ModelViewSet):
    """Backs every 'Configuration' admin screen: Payment Gateway, Video
    Protection/CDN, Firebase, Cloud Storage, AI Mentor, Email/SMS."""
    queryset = IntegrationConfig.objects.all()
    serializer_class = IntegrationConfigSerializer
    filterset_fields = ["group", "is_enabled"]

    @action(detail=True, methods=["post"])
    def test(self, request, pk=None):
        from django.utils import timezone
        config = self.get_object()
        success = test_connection(config)
        config.last_test_status = "success" if success else "failed"
        config.last_tested_at = timezone.now()
        config.save(update_fields=["last_test_status", "last_tested_at"])
        return Response({"status": config.last_test_status})


class MediaAssetViewSet(viewsets.ModelViewSet):
    queryset = MediaAsset.objects.all()
    serializer_class = MediaAssetSerializer
    filterset_fields = ["file_type", "access_level"]
    search_fields = ["file_name"]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
