from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import AuditLog, PlatformSetting, SupportTicket
from .serializers import (AuditLogSerializer, PlatformSettingSerializer,
                           SupportTicketSerializer)


class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    filterset_fields = ["status", "priority"]

    def get_queryset(self):
        user = self.request.user
        qs = SupportTicket.objects.select_related("user", "assigned_to")
        if not (user.role and user.role.key != "student"):
            qs = qs.filter(user=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        ticket.assigned_to_id = request.data.get("assigned_to")
        ticket.status = "in_progress"
        ticket.save(update_fields=["assigned_to", "status"])
        return Response(SupportTicketSerializer(ticket).data)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = "resolved"
        ticket.resolution_notes = request.data.get("resolution_notes", "")
        ticket.save(update_fields=["status", "resolution_notes"])
        return Response(SupportTicketSerializer(ticket).data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("user")
    serializer_class = AuditLogSerializer
    filterset_fields = ["entity_type", "user"]


class PlatformSettingViewSet(viewsets.ModelViewSet):
    queryset = PlatformSetting.objects.all()
    serializer_class = PlatformSettingSerializer
    filterset_fields = ["category"]
    lookup_field = "key"
