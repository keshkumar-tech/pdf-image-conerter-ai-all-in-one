from rest_framework.routers import DefaultRouter

from .views import IntegrationConfigViewSet, MediaAssetViewSet

router = DefaultRouter()
router.register("integrations", IntegrationConfigViewSet, basename="integration-config")
router.register("media", MediaAssetViewSet, basename="media-asset")

urlpatterns = router.urls
