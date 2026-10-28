from rest_framework import serializers

from apps.learning.models import Video
from apps.content.models import StudyMaterial

from .models import Category, Course, Lesson, Module, PricingPlan


class PricingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPlan
        fields = ["id", "name", "price", "currency", "discount_price",
                  "duration_days", "features", "is_active", "sort_order"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon", "sort_order"]


class LessonSerializer(serializers.ModelSerializer):
    video = serializers.SerializerMethodField()
    pdf = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "module", "title", "lesson_type", "order",
                  "is_free_preview", "duration_minutes", "is_published",
                  "video", "pdf"]

    def get_video(self, obj):
        try:
            v = obj.video
            if not v:
                return None
            return {
                "youtube_url": v.youtube_url,
                "provider": v.provider or ("youtube" if v.youtube_url else "self" if v.video_file else ""),
                "playback_url": (
                    (self.context.get("request").build_absolute_uri(v.video_file.url)
                     if v.video_file and self.context.get("request") else v.video_file.url)
                    if v.video_file else v.youtube_url or ""
                ),
            }
        except Video.DoesNotExist:
            return None

    def get_pdf(self, obj):
        # StudyMaterial has no FK to Lesson — match by title as a soft link.
        try:
            mat = StudyMaterial.objects.filter(title=obj.title, is_active=True).first()
        except Exception:
            return None
        if mat and mat.file:
            req = self.context.get("request")
            return {"file_url": req.build_absolute_uri(mat.file.url) if req else mat.file.url}
        return None


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ["id", "course", "title", "description", "order", "lessons"]


class CourseListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    pricing_plan = PricingPlanSerializer(read_only=True)

    class Meta:
        model = Course
        fields = ["id", "title", "slug", "short_description", "thumbnail_url",
                  "banner_url", "category", "level", "instructor_name", "is_free",
                  "pricing_plan", "is_published", "is_featured", "rating_average",
                  "students_count", "duration_minutes", "tags",
                  "batch_name", "start_date", "end_date", "highlights",
                  "learning_outcomes", "requirements", "youtube_playlist_url"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if instance.thumbnail_file:
            data["thumbnail_url"] = request.build_absolute_uri(instance.thumbnail_file.url) if request else instance.thumbnail_file.url
        elif instance.thumbnail_url and request and instance.thumbnail_url.startswith("/"):
            data["thumbnail_url"] = request.build_absolute_uri(instance.thumbnail_url)

        if instance.banner_file:
            data["banner_url"] = request.build_absolute_uri(instance.banner_file.url) if request else instance.banner_file.url
        elif instance.banner_url and request and instance.banner_url.startswith("/"):
            data["banner_url"] = request.build_absolute_uri(instance.banner_url)
        return data


class CourseDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    pricing_plan = PricingPlanSerializer(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if instance.thumbnail_file:
            data["thumbnail_url"] = request.build_absolute_uri(instance.thumbnail_file.url) if request else instance.thumbnail_file.url
        elif instance.thumbnail_url and request and instance.thumbnail_url.startswith("/"):
            data["thumbnail_url"] = request.build_absolute_uri(instance.thumbnail_url)

        if instance.banner_file:
            data["banner_url"] = request.build_absolute_uri(instance.banner_file.url) if request else instance.banner_file.url
        elif instance.banner_url and request and instance.banner_url.startswith("/"):
            data["banner_url"] = request.build_absolute_uri(instance.banner_url)
        return data


class CourseWriteSerializer(serializers.ModelSerializer):
    """Used by the admin Course Editor - accepts writable FKs by id."""

    class Meta:
        model = Course
        fields = [
            "title", "slug", "description", "short_description",
            "thumbnail_url", "thumbnail_file", "banner_url", "banner_file",
            "category", "level", "language", "instructor_name",
            "is_free", "pricing_plan", "is_published", "is_featured",
            "requirements", "learning_outcomes", "tags", "highlights",
            "batch_name", "start_date", "end_date",
            "seo_title", "seo_description", "youtube_playlist_url",
            "duration_minutes",
        ]
