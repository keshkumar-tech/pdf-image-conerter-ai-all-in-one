from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.payments.services import has_course_entitlement

from .models import (Achievement, Assignment, AssignmentSubmission,
                      Enrollment, LessonProgress, LessonResource, Project,
                      ProjectSubmission, Quiz, QuizAttempt, QuizOption,
                      QuizQuestion, Roadmap, Streak, UserAchievement, Video)
from .serializers import (AchievementSerializer, AssignmentSerializer,
                           AssignmentSubmissionSerializer,
                           EnrollmentSerializer, LessonProgressSerializer,
                           LessonResourceSerializer, ProjectSerializer,
                           ProjectSubmissionSerializer, QuizAdminSerializer,
                           QuizAttemptSerializer, QuizOptionAdminSerializer,
                           QuizQuestionAdminSerializer, QuizSerializer,
                           RoadmapSerializer, StreakSerializer,
                           UserAchievementSerializer, VideoPlaybackSerializer,
                           VideoSerializer)
from .services import (award_streak_tick, grade_quiz_attempt,
                        issue_signed_playback_url)


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.select_related("lesson").all()
    serializer_class = VideoSerializer
    filterset_fields = ["lesson"]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @action(detail=True, methods=["get"])
    def playback(self, request, pk=None):
        """Returns signed URL, self-hosted file URL, or YouTube URL for playback."""
        video = self.get_object()
        course = video.lesson.module.course
        if not course.is_free and not has_course_entitlement(request.user, course):
            return Response({"detail": "Premium entitlement required."}, status=403)

        # Get resume position
        from .models import LessonProgress
        progress = LessonProgress.objects.filter(
            user=request.user, lesson=video.lesson
        ).first()
        resume_pos = getattr(progress, "last_position_seconds", 0)

        # YouTube provider — return the URL directly (no signing needed)
        if video.provider == "youtube" or video.youtube_url:
            payload = {
                "signed_url": "",
                "youtube_url": video.youtube_url,
                "provider": "youtube",
                "expires_at": None,
                "resume_position_seconds": resume_pos,
            }
            return Response(VideoPlaybackSerializer(payload).data)

        # Self-hosted upload — stream the media file directly
        if video.video_file:
            url = request.build_absolute_uri(video.video_file.url) if request else video.video_file.url
            payload = {
                "signed_url": url,
                "youtube_url": "",
                "provider": "self",
                "expires_at": None,
                "resume_position_seconds": resume_pos,
            }
            return Response(VideoPlaybackSerializer(payload).data)

        # CDN provider — generate signed URL
        payload = issue_signed_playback_url(video, request.user)
        payload["youtube_url"] = ""
        payload["provider"] = video.provider
        return Response(VideoPlaybackSerializer(payload).data)


class LessonResourceViewSet(viewsets.ModelViewSet):
    queryset = LessonResource.objects.all()
    serializer_class = LessonResourceSerializer
    filterset_fields = ["lesson", "resource_type"]


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.prefetch_related("questions__options").all()
    serializer_class = QuizSerializer
    filterset_fields = ["lesson", "class_level", "subject", "difficulty", "is_published", "is_free"]
    search_fields = ["title", "topic", "subject"]
    ordering_fields = ["sort_order", "created_at", "title"]
    ordering = ["sort_order", "-created_at"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"] or self.request.query_params.get("admin") == "true":
            return QuizAdminSerializer
        return QuizSerializer

    @action(detail=True, methods=["get"])
    def admin_detail(self, request, pk=None):
        quiz = self.get_object()
        serializer = QuizAdminSerializer(quiz)
        return Response(serializer.data)


class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.prefetch_related("options").all()
    serializer_class = QuizQuestionAdminSerializer
    filterset_fields = ["quiz", "question_type"]
    ordering = ["order"]


class QuizOptionViewSet(viewsets.ModelViewSet):
    queryset = QuizOption.objects.all()
    serializer_class = QuizOptionAdminSerializer
    filterset_fields = ["question"]
    ordering = ["order"]


class QuizAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if getattr(user, "is_staff", False) or (getattr(user, "role", None) and user.role.key in ["admin", "super_admin", "content_manager"]):
                return QuizAttempt.objects.all()
            return QuizAttempt.objects.filter(user=user)
        return QuizAttempt.objects.all()

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        time_taken = self.request.data.get("time_taken_seconds", 0)
        attempt = serializer.save(
            user=user,
            time_taken_seconds=time_taken,
            submitted_at=timezone.now(),
        )
        grade_quiz_attempt(attempt)


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    filterset_fields = ["lesson"]


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSubmissionSerializer

    def get_queryset(self):
        qs = AssignmentSubmission.objects.all()
        if not (self.request.user.role and self.request.user.role.key != "student"):
            qs = qs.filter(user=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def grade(self, request, pk=None):
        """Admin/staff grading endpoint."""
        submission = self.get_object()
        submission.grade = request.data.get("grade")
        submission.feedback = request.data.get("feedback", "")
        submission.status = "reviewed"
        submission.save(update_fields=["grade", "feedback", "status"])
        return Response(AssignmentSubmissionSerializer(submission).data)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filterset_fields = ["lesson"]


class ProjectSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSubmissionSerializer

    def get_queryset(self):
        qs = ProjectSubmission.objects.all()
        if not (self.request.user.role and self.request.user.role.key != "student"):
            qs = qs.filter(user=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        submission = self.get_object()
        submission.status = request.data.get("status", "approved")
        submission.grade = request.data.get("grade")
        submission.feedback = request.data.get("feedback", "")
        submission.save(update_fields=["status", "grade", "feedback"])
        return Response(ProjectSubmissionSerializer(submission).data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related("course")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LessonProgressViewSet(viewsets.ModelViewSet):
    serializer_class = LessonProgressSerializer

    def get_queryset(self):
        return LessonProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        progress = serializer.save(user=self.request.user)
        if progress.is_completed:
            award_streak_tick(self.request.user)

    def perform_update(self, serializer):
        progress = serializer.save()
        if progress.is_completed:
            award_streak_tick(self.request.user)


class StreakView(viewsets.ReadOnlyModelViewSet):
    serializer_class = StreakSerializer

    def get_queryset(self):
        return Streak.objects.filter(user=self.request.user)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer


class MyAchievementsView(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserAchievementSerializer

    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user).select_related("achievement")


class RoadmapViewSet(viewsets.ModelViewSet):
    queryset = Roadmap.objects.prefetch_related("nodes").all()
    serializer_class = RoadmapSerializer
