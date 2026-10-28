from rest_framework import serializers

from .models import AnalyticsEvent


class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = ["id", "user", "event_name", "properties", "utm_source",
                  "utm_campaign", "utm_medium", "created_at"]
        read_only_fields = ["user", "created_at"]


class StudentAnalyticsSerializer(serializers.Serializer):
    study_time_minutes = serializers.IntegerField()
    courses_completed = serializers.IntegerField()
    lessons_completed = serializers.IntegerField()
    quiz_average_percent = serializers.FloatField()
    assignments_submitted = serializers.IntegerField()
    projects_submitted = serializers.IntegerField()
    current_streak_days = serializers.IntegerField()
    weekly_activity = serializers.ListField(child=serializers.DictField())
    monthly_activity = serializers.ListField(child=serializers.DictField())


class AdminOverviewSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    active_students = serializers.IntegerField()
    new_registrations_30d = serializers.IntegerField()
    total_courses = serializers.IntegerField()
    premium_courses = serializers.IntegerField()
    free_courses = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_orders = serializers.IntegerField()
    conversion_rate_percent = serializers.FloatField()
    course_completion_rate_percent = serializers.FloatField()


class YouTubeFunnelSerializer(serializers.Serializer):
    utm_source = serializers.CharField()
    installs = serializers.IntegerField()
    signups = serializers.IntegerField()
    enrollments = serializers.IntegerField()
    purchases = serializers.IntegerField()
