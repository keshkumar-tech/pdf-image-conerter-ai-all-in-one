from rest_framework import serializers

from .models import Bookmark, Comment, Like, Post, Report


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["id", "post", "author", "parent", "body", "created_at"]
        read_only_fields = ["author"]


class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "author", "course", "title", "body", "tags", "is_question",
                  "is_hidden", "likes_count", "comments_count", "created_at",
                  "comments", "is_liked"]
        read_only_fields = ["author", "likes_count", "comments_count", "is_hidden"]

    def get_is_liked(self, obj):
        user = self.context.get("request").user if self.context.get("request") else None
        if not user or not user.is_authenticated:
            return False
        return obj.likes.filter(user=user).exists()


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["id", "post", "reporter", "reason", "status", "created_at"]
        read_only_fields = ["reporter", "status"]
