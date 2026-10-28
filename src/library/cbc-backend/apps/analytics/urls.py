from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (AdminOverviewView, AnalyticsEventViewSet,
                     MyAnalyticsView, YouTubeFunnelView)

router = DefaultRouter()
router.register("events", AnalyticsEventViewSet, basename="analytics-event")

urlpatterns = router.urls + [
    path("me/", MyAnalyticsView.as_view(), name="my-analytics"),
    path("admin/overview/", AdminOverviewView.as_view(), name="admin-analytics-overview"),
    path("admin/youtube-funnel/", YouTubeFunnelView.as_view(), name="youtube-funnel"),
]
