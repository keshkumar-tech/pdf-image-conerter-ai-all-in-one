from rest_framework import serializers

from apps.courses.serializers import CourseListSerializer

from .models import (Achievement, Assignment, AssignmentSubmission,
                      Enrollment, LessonProgress, LessonResource, Project,
                      ProjectSubmission, Quiz, QuizAttempt, QuizOption,
                      QuizQuestion, Roadmap, RoadmapNode, Streak,
                      UserAchievement, Video)


class VideoSerializer(serializers.ModelSerializer):
    video_file = serializers.FileField(required=False, allow_null=True, write_only=True, help_text="Upload your own video (mp4)")
    playback_url = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ["id", "lesson", "provider", "provider_asset_id", "youtube_url",
                  "video_file", "playback_url", "duration_seconds", "captions_url",
                  "is_protected", "thumbnail_url"]

    def get_playback_url(self, obj):
        """Absolute URL the client can use to play the video.
        YouTube videos → the YouTube URL; uploaded files → the media URL."""
        request = self.context.get("request")
        if obj.video_file:
            url = obj.video_file.url
            return request.build_absolute_uri(url) if request else url
        return obj.youtube_url or ""


class VideoPlaybackSerializer(serializers.Serializer):
    """Response shape for the signed-URL playback endpoint."""
    signed_url = serializers.URLField(allow_blank=True)
    youtube_url = serializers.URLField(allow_blank=True, required=False)
    provider = serializers.CharField(allow_blank=True, required=False)
    expires_at = serializers.DateTimeField(allow_null=True)
    resume_position_seconds = serializers.IntegerField()


class LessonResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonResource
        fields = ["id", "lesson", "resource_type", "title", "file_url",
                  "external_url", "is_premium_only", "download_count"]


class QuizOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ["id", "text", "order"]  # is_correct hidden from students during quiz


class QuizOptionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ["id", "question", "text", "is_correct", "order"]
        extra_kwargs = {"question": {"required": False}}


class QuizQuestionSerializer(serializers.ModelSerializer):
    options = QuizOptionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ["id", "question_type", "prompt", "marks", "order", "options"]


class QuizQuestionAdminSerializer(serializers.ModelSerializer):
    options = QuizOptionAdminSerializer(many=True, required=False)

    class Meta:
        model = QuizQuestion
        fields = ["id", "quiz", "question_type", "prompt", "explanation", "marks", "order", "options"]
        extra_kwargs = {"quiz": {"required": False}}


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id", "lesson", "title", "description", "instructions",
            "class_level", "subject", "topic", "difficulty",
            "time_limit_seconds", "passing_score_percent", "marks_per_question",
            "total_marks", "is_free", "is_published", "allow_back_navigation",
            "sort_order", "questions_count", "questions"
        ]

    def get_questions_count(self, obj):
        return obj.questions.count()


class QuizAdminSerializer(serializers.ModelSerializer):
    questions = QuizQuestionAdminSerializer(many=True, required=False)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id", "lesson", "title", "description", "instructions",
            "class_level", "subject", "topic", "difficulty",
            "time_limit_seconds", "passing_score_percent", "marks_per_question",
            "total_marks", "is_free", "is_published", "allow_back_navigation",
            "sort_order", "questions_count", "questions"
        ]

    def get_questions_count(self, obj):
        return obj.questions.count()

    def create(self, validated_data):
        questions_data = validated_data.pop("questions", None)
        quiz = Quiz.objects.create(**validated_data)
        if questions_data:
            for q_data in questions_data:
                options_data = q_data.pop("options", [])
                question = QuizQuestion.objects.create(quiz=quiz, **q_data)
                for opt_data in options_data:
                    QuizOption.objects.create(question=question, **opt_data)
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop("questions", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if questions_data is not None:
            instance.questions.all().delete()
            for q_data in questions_data:
                options_data = q_data.pop("options", [])
                question = QuizQuestion.objects.create(quiz=instance, **q_data)
                for opt_data in options_data:
                    QuizOption.objects.create(question=question, **opt_data)
        return instance


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    quiz_subject = serializers.CharField(source="quiz.subject", read_only=True)
    quiz_class_level = serializers.CharField(source="quiz.class_level", read_only=True)
    passing_score_percent = serializers.IntegerField(source="quiz.passing_score_percent", read_only=True)
    review = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt
        fields = [
            "id", "quiz", "user", "answers", "total_questions",
            "correct_answers", "incorrect_answers", "unattempted_questions",
            "score", "score_percent", "passed", "time_taken_seconds",
            "submitted_at", "quiz_title", "quiz_subject", "quiz_class_level",
            "passing_score_percent", "review"
        ]
        read_only_fields = [
            "user", "total_questions", "correct_answers", "incorrect_answers",
            "unattempted_questions", "score", "score_percent", "passed", "submitted_at"
        ]

    def get_review(self, obj):
        questions = obj.quiz.questions.prefetch_related("options").all()
        result = []
        for q in questions:
            correct_options = [str(o.id) for o in q.options.filter(is_correct=True)]
            user_ans = obj.answers.get(str(q.id), [])
            if not isinstance(user_ans, (list, tuple)):
                user_ans = [user_ans] if user_ans else []
            user_ans_str = [str(x) for x in user_ans if x]

            is_correct = bool(user_ans_str) and set(user_ans_str) == set(correct_options)
            is_unattempted = len(user_ans_str) == 0

            result.append({
                "question_id": str(q.id),
                "prompt": q.prompt,
                "explanation": q.explanation,
                "order": q.order,
                "marks": getattr(q, "marks", 1),
                "options": [
                    {
                        "id": str(opt.id),
                        "text": opt.text,
                        "is_correct": opt.is_correct,
                        "order": opt.order,
                    }
                    for opt in q.options.all()
                ],
                "user_selected": user_ans_str,
                "is_correct": is_correct,
                "is_unattempted": is_unattempted,
            })
        return result


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ["id", "lesson", "title", "instructions", "deadline_days", "max_score"]


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = ["id", "assignment", "user", "text_submission", "link_submission",
                  "file_url", "status", "grade", "feedback", "created_at"]
        read_only_fields = ["user", "status", "grade", "feedback"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "lesson", "title", "brief", "requirements", "resources"]


class ProjectSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSubmission
        fields = ["id", "project", "user", "github_url", "zip_url", "demo_url",
                  "status", "grade", "feedback", "created_at"]
        read_only_fields = ["user", "status", "grade", "feedback"]


class EnrollmentSerializer(serializers.ModelSerializer):
    course_detail = CourseListSerializer(source="course", read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "user", "course", "course_detail", "enrolled_at", "completed_at", "source"]
        read_only_fields = ["user", "enrolled_at"]


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ["id", "lesson", "is_completed", "watch_time_seconds",
                  "last_position_seconds", "completed_at"]


class StreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streak
        fields = ["current_streak_days", "longest_streak_days", "last_active_date"]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "key", "title", "description", "icon"]


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ["id", "achievement", "earned_at"]


class RoadmapNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapNode
        fields = ["id", "title", "course", "order"]


class RoadmapSerializer(serializers.ModelSerializer):
    nodes = RoadmapNodeSerializer(many=True, read_only=True)

    class Meta:
        model = Roadmap
        fields = ["id", "title", "description", "is_published", "nodes"]
