import uuid

from django.core.files.storage import default_storage
from django.http import Http404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from apps.users.permissions import AllowAuthenticatedRead, IsAdminOrReadOnly
from .models import Category, Course, Lesson, Module, PricingPlan
from .serializers import (CategorySerializer, CourseDetailSerializer,
                           CourseListSerializer, CourseWriteSerializer,
                           LessonSerializer, ModuleSerializer,
                           PricingPlanSerializer)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class PricingPlanViewSet(viewsets.ModelViewSet):
    queryset = PricingPlan.objects.all()
    serializer_class = PricingPlanSerializer
    permission_classes = [IsAdminOrReadOnly]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_deleted=False).select_related("category", "pricing_plan")
    permission_classes = [AllowAuthenticatedRead]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ["category__slug", "level", "is_free", "is_published", "is_featured"]
    search_fields = ["title", "description", "tags"]
    ordering_fields = ["created_at", "rating_average", "students_count"]

    def get_object(self):
        lookup = self.kwargs.get(self.lookup_url_kwarg or self.lookup_field or "pk")
        qs = self.filter_queryset(self.get_queryset())
        try:
            uuid.UUID(str(lookup))
            return qs.get(pk=lookup)
        except (ValueError, Course.DoesNotExist):
            pass
        try:
            return qs.get(slug=lookup)
        except Course.DoesNotExist as exc:
            raise Http404 from exc

    def get_serializer_class(self):
        if self.action == "list":
            return CourseListSerializer
        if self.action in ("create", "update", "partial_update"):
            return CourseWriteSerializer
        return CourseDetailSerializer

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request):
        """Allows uploading an image (thumbnail/banner) and returns its permanent URL."""
        file_obj = request.FILES.get("file") or request.FILES.get("image") or request.FILES.get("thumbnail")
        if not file_obj:
            return Response({"detail": "No image file provided."}, status=400)

        path = default_storage.save(f"courses/uploads/{uuid.uuid4().hex}_{file_obj.name}", file_obj)
        url = default_storage.url(path)
        full_url = request.build_absolute_uri(url) if request else url
        return Response({"url": full_url, "path": path})

    def perform_destroy(self, instance):
        if instance.thumbnail_file:
            instance.thumbnail_file.delete(save=False)
        if instance.banner_file:
            instance.banner_file.delete(save=False)
        super().perform_destroy(instance)


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    filterset_fields = ["course"]
    permission_classes = [AllowAuthenticatedRead]

    @action(detail=False, methods=["get"], url_path="curriculum")
    def curriculum(self, request):
        slug = request.query_params.get("course")
        if not slug:
            return Response({"detail": "course query param is required."}, status=400)
        qs = Course.objects.filter(is_deleted=False)
        try:
            uuid.UUID(str(slug))
            course = qs.get(pk=slug)
        except (ValueError, Course.DoesNotExist):
            try:
                course = qs.get(slug=slug)
            except Course.DoesNotExist:
                return Response({"detail": "Course not found."}, status=404)
        modules = self.get_queryset().filter(course=course).prefetch_related("lessons").order_by("order")
        serializer = self.get_serializer(modules, many=True)
        return Response(serializer.data)


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    filterset_fields = ["module", "lesson_type"]
    permission_classes = [AllowAuthenticatedRead]
