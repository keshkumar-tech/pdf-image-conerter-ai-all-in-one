from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.learning.models import Enrollment, LessonProgress, QuizAttempt
from apps.payments.models import Order
from apps.users.models import User
from apps.courses.models import Course

from .models import AnalyticsEvent
from .serializers import (AdminOverviewSerializer, AnalyticsEventSerializer,
                           StudentAnalyticsSerializer, YouTubeFunnelSerializer)


class AnalyticsEventViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsEvent.objects.all()
    serializer_class = AnalyticsEventSerializer
    filterset_fields = ["event_name", "utm_source"]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)


class MyAnalyticsView(APIView):
    def get(self, request):
        user = request.user
        lessons_completed = LessonProgress.objects.filter(user=user, is_completed=True).count()
        watch_seconds = LessonProgress.objects.filter(user=user).aggregate(s=Sum("watch_time_seconds"))["s"] or 0
        quiz_avg = QuizAttempt.objects.filter(user=user).aggregate(a=Avg("score_percent"))["a"] or 0
        courses_completed = Enrollment.objects.filter(user=user, completed_at__isnull=False).count()
        streak_days = getattr(getattr(user, "streak", None), "current_streak_days", 0)

        payload = {
            "study_time_minutes": watch_seconds // 60,
            "courses_completed": courses_completed,
            "lessons_completed": lessons_completed,
            "quiz_average_percent": round(float(quiz_avg), 2),
            "assignments_submitted": user.assignment_submissions.count(),
            "projects_submitted": user.project_submissions.count(),
            "current_streak_days": streak_days,
            "weekly_activity": [],
            "monthly_activity": [],
        }
        return Response(StudentAnalyticsSerializer(payload).data)


class AdminOverviewView(APIView):
    """Powers the Admin Dashboard cards + Analytics Overview screen."""

    def get(self, request):
        total_students = User.objects.filter(
            Q(role__key="student") |
            (Q(role__isnull=True) & Q(is_superuser=False) & Q(is_staff=False))
        ).count()
        active_students = User.objects.filter(
            role__key="student", last_active_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        new_registrations = User.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        total_courses = Course.objects.filter(is_deleted=False).count()
        premium_courses = Course.objects.filter(is_deleted=False, is_free=False).count()
        free_courses = total_courses - premium_courses
        revenue = Order.objects.filter(status="success").aggregate(r=Sum("amount"))["r"] or 0
        total_orders = Order.objects.count()
        successful_orders = Order.objects.filter(status="success").count()
        conversion = (successful_orders / total_orders * 100) if total_orders else 0
        total_enrollments = Enrollment.objects.count()
        completed = Enrollment.objects.filter(completed_at__isnull=False).count()
        completion_rate = (completed / total_enrollments * 100) if total_enrollments else 0

        payload = {
            "total_students": total_students, "active_students": active_students,
            "new_registrations_30d": new_registrations, "total_courses": total_courses,
            "premium_courses": premium_courses, "free_courses": free_courses,
            "total_revenue": revenue, "total_orders": total_orders,
            "conversion_rate_percent": round(conversion, 2),
            "course_completion_rate_percent": round(completion_rate, 2),
        }
        return Response(AdminOverviewSerializer(payload).data)


class YouTubeFunnelView(APIView):
    def get(self, request):
        rows = []
        for source in AnalyticsEvent.objects.exclude(utm_source="").values_list("utm_source", flat=True).distinct():
            qs = AnalyticsEvent.objects.filter(utm_source=source)
            rows.append({
                "utm_source": source,
                "installs": qs.filter(event_name="app_install").count(),
                "signups": qs.filter(event_name="signup").count(),
                "enrollments": qs.filter(event_name="course_enroll").count(),
                "purchases": qs.filter(event_name="purchase").count(),
            })
        return Response(YouTubeFunnelSerializer(rows, many=True).data)
