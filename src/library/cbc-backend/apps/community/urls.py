from rest_framework.routers import DefaultRouter

from .views import CommentViewSet, PostViewSet, ReportViewSet

router = DefaultRouter()
router.register("posts", PostViewSet, basename="post")
router.register("comments", CommentViewSet, basename="comment")
router.register("reports", ReportViewSet, basename="report")

urlpatterns = router.urls
