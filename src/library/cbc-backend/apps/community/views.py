from django.db.models import F
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Bookmark, Comment, Like, Post, Report
from .serializers import CommentSerializer, PostSerializer, ReportSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_hidden=False).select_related("author", "course")
    serializer_class = PostSerializer
    filterset_fields = ["course", "is_question"]
    search_fields = ["title", "body", "tags"]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        post = self.get_object()
        _, created = Like.objects.get_or_create(post=post, user=request.user)
        if created:
            Post.objects.filter(pk=post.pk).update(likes_count=F("likes_count") + 1)
        return Response({"liked": True})

    @action(detail=True, methods=["post"])
    def unlike(self, request, pk=None):
        post = self.get_object()
        deleted, _ = Like.objects.filter(post=post, user=request.user).delete()
        if deleted:
            Post.objects.filter(pk=post.pk).update(likes_count=F("likes_count") - 1)
        return Response({"liked": False})

    @action(detail=True, methods=["post"])
    def bookmark(self, request, pk=None):
        post = self.get_object()
        Bookmark.objects.get_or_create(post=post, user=request.user)
        return Response({"bookmarked": True})

    @action(detail=True, methods=["post"])
    def report(self, request, pk=None):
        post = self.get_object()
        Report.objects.create(post=post, reporter=request.user, reason=request.data.get("reason", ""))
        return Response({"reported": True})

    @action(detail=True, methods=["post"])
    def moderate(self, request, pk=None):
        """Admin moderation: hide/unhide a post."""
        post = self.get_object()
        post.is_hidden = request.data.get("is_hidden", True)
        post.save(update_fields=["is_hidden"])
        return Response(PostSerializer(post, context={"request": request}).data)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.filter(is_hidden=False)
    serializer_class = CommentSerializer
    filterset_fields = ["post"]

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        Post.objects.filter(pk=comment.post_id).update(comments_count=F("comments_count") + 1)


class ReportViewSet(viewsets.ModelViewSet):
    """Admin moderation queue."""
    queryset = Report.objects.select_related("post", "reporter")
    serializer_class = ReportSerializer
    filterset_fields = ["status"]
