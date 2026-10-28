from rest_framework.routers import DefaultRouter

from .views import (CategoryViewSet, CourseViewSet, LessonViewSet,
                     ModuleViewSet, PricingPlanViewSet)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("pricing-plans", PricingPlanViewSet, basename="pricing-plan")
router.register("modules", ModuleViewSet, basename="module")
router.register("lessons", LessonViewSet, basename="lesson")
router.register("", CourseViewSet, basename="course")

urlpatterns = router.urls
