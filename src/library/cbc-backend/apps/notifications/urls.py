from rest_framework.routers import DefaultRouter

from .views import NotificationCampaignViewSet, NotificationViewSet

router = DefaultRouter()
router.register("campaigns", NotificationCampaignViewSet, basename="notification-campaign")
router.register("", NotificationViewSet, basename="notification")

urlpatterns = router.urls
