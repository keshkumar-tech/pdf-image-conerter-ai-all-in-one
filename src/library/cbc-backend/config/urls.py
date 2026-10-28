from django.contrib import admin
from django.conf import settings
from django.http import JsonResponse
from django.urls import path, include, re_path

from apps.content.storage import serve_db_media

api_prefix = f"api/{settings.API_VERSION}/"


def health(_request):
    return JsonResponse({"status": "ok"})


from apps.content.views import DashboardCountsView

urlpatterns = [
    path(f"{api_prefix}health/", health),
    path("django-admin/", admin.site.urls),  # internal only, NOT the product admin
    path(f"{api_prefix}auth/", include("apps.users.auth_urls")),
    path(f"{api_prefix}users/", include("apps.users.urls")),
    path(f"{api_prefix}courses/", include("apps.courses.urls")),
    path(f"{api_prefix}", include("apps.learning.urls")),
    path(f"{api_prefix}", include("apps.payments.urls")),
    path(f"{api_prefix}certificates/", include("apps.certificates.urls")),
    path(f"{api_prefix}community/", include("apps.community.urls")),
    path(f"{api_prefix}notifications/", include("apps.notifications.urls")),
    path(f"{api_prefix}analytics/", include("apps.analytics.urls")),
    path(f"{api_prefix}admin/", include("apps.integrations.urls")),
    path(f"{api_prefix}support/", include("apps.support.urls")),
    path(f"{api_prefix}content/", include("apps.content.urls")),
    path(f"{api_prefix}dashboard-counts/", DashboardCountsView.as_view(), name="dashboard-counts-root"),
]

# Serve uploaded media (PYQ/Materials PDFs/Videos) in ALL environments,
# including DEBUG=False on Render. PDFs are served from Postgres (durable),
# everything else falls back to MEDIA_ROOT on disk.
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve_db_media),
]
