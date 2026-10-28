from rest_framework.routers import DefaultRouter

from .views import AuditLogViewSet, PlatformSettingViewSet, SupportTicketViewSet

router = DefaultRouter()
router.register("tickets", SupportTicketViewSet, basename="support-ticket")
router.register("audit-logs", AuditLogViewSet, basename="audit-log")
router.register("settings", PlatformSettingViewSet, basename="platform-setting")

urlpatterns = router.urls
