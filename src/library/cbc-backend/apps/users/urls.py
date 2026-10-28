from rest_framework.routers import DefaultRouter

from .views import RoleViewSet, UserViewSet

router = DefaultRouter()
router.register("", UserViewSet, basename="user")
router.register("roles", RoleViewSet, basename="role")

urlpatterns = router.urls
