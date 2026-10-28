from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification, NotificationCampaign
from .serializers import NotificationCampaignSerializer, NotificationSerializer
from .services import resolve_audience, send_campaign


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=["post"], url_path="read-all")
    def read_all(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"status": "ok"})


class NotificationCampaignViewSet(viewsets.ModelViewSet):
    """Admin: create / schedule / send notification campaigns."""
    queryset = NotificationCampaign.objects.all()
    serializer_class = NotificationCampaignSerializer

    @action(detail=True, methods=["post"])
    def send_now(self, request, pk=None):
        campaign = self.get_object()
        count = send_campaign(campaign)
        return Response(NotificationCampaignSerializer(campaign).data | {"recipients_notified": count})

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        campaign = self.get_object()
        campaign.status = "cancelled"
        campaign.save(update_fields=["status"])
        return Response(NotificationCampaignSerializer(campaign).data)
