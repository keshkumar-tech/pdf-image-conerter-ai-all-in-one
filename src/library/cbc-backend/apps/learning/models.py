import uuid

from django.conf import settings
from django.db import models

from apps.courses.models import Course, Lesson
from apps.users.models import TimeStampedModel


def uid():
    return uuid.uuid4()


# ---------------------------------------------------------------------------
# Video (protected playback via CDN provider - see apps.integrations)
# ---------------------------------------------------------------------------
class Video(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name="video")
    provider = models.CharField(max_length=40, blank=True)  # mux, bunny, cloudflare_stream, youtube, self
    provider_asset_id = models.CharField(max_length=200, blank=True)
    youtube_url = models.URLField(blank=True, help_text="YouTube video URL (used when provider='youtube')")
    video_file = models.FileField(
        upload_to="lesson_videos/%Y/%m/", blank=True, null=True,
        help_text="Upload your own video file (mp4) — for lectures which are not on YouTube",
    )
    duration_seconds = models.PositiveIntegerField(default=0)
    captions_url = models.URLField(blank=True)
    is_protected = models.BooleanField(default=True)
    thumbnail_url = models.URLField(blank=True)

    def __str__(self):
        return f"Video<{self.lesson.title}>"


# ---------------------------------------------------------------------------
# Generic downloadable resources attached to a lesson
# ---------------------------------------------------------------------------
class LessonResource(TimeStampedModel):
    RESOURCE_TYPE_CHOICES = [
        ("pdf", "PDF"), ("source_code", "Source Code"), ("zip", "ZIP"),
        ("template", "Template"), ("cheat_sheet", "Cheat Sheet"), ("link", "Link"),
    ]
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="resources")
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    file_url = models.URLField(blank=True)
    external_url = models.URLField(blank=True)
    is_premium_only = models.BooleanField(default=True)
    download_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title


# ---------------------------------------------------------------------------
# Quiz
# ---------------------------------------------------------------------------
CLASS_CHOICES = [
    ("Class 9",  "Class 9"),
    ("Class 10", "Class 10"),
    ("Class 11", "Class 11"),
    ("Class 12", "Class 12"),
]

SUBJECT_CHOICES = [
    ("Mathematics",    "Mathematics"),
    ("Science",        "Science"),
    ("English",        "English"),
    ("Hindi",          "Hindi"),
    ("Social Science", "Social Science"),
    ("Physics",        "Physics"),
    ("Chemistry",      "Chemistry"),
    ("Biology",        "Biology"),
    ("All Subjects",   "All Subjects"),
]

DIFFICULTY_CHOICES = [
    ("Easy",   "Easy"),
    ("Medium", "Medium"),
    ("Hard",   "Hard"),
]


class Quiz(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name="quiz", null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    instructions = models.TextField(blank=True, default="")
    class_level = models.CharField(max_length=20, choices=CLASS_CHOICES, default="Class 10")
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES, default="Mathematics")
    topic = models.CharField(max_length=200, blank=True, default="")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default="Easy")
    time_limit_seconds = models.PositiveIntegerField(default=600)  # 0 = untimed, 600 = 10 mins
    passing_score_percent = models.PositiveIntegerField(default=40)
    marks_per_question = models.PositiveIntegerField(default=1)
    total_marks = models.PositiveIntegerField(default=10)
    is_free = models.BooleanField(default=True)
    is_published = models.BooleanField(default=True)
    allow_back_navigation = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "-created_at"]

    def __str__(self):
        return f"{self.title} ({self.class_level} - {self.subject})"


class QuizQuestion(TimeStampedModel):
    QUESTION_TYPE_CHOICES = [
        ("mcq", "Multiple Choice (single)"),
        ("multi", "Multiple Choice (multi answer)"),
        ("true_false", "True/False"),
        ("code", "Code Question"),
    ]
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default="mcq")
    prompt = models.TextField()
    explanation = models.TextField(blank=True, default="")
    marks = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Q{self.order}: {self.prompt[:50]}"


class QuizOption(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name="options")
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]


class QuizAttempt(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quiz_attempts", null=True, blank=True)
    answers = models.JSONField(default=dict)  # {question_id: [option_id, ...]}
    total_questions = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    incorrect_answers = models.PositiveIntegerField(default=0)
    unattempted_questions = models.PositiveIntegerField(default=0)
    score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    score_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    passed = models.BooleanField(default=False)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-submitted_at", "-created_at"]

    def __str__(self):
        return f"Attempt by {self.user} on {self.quiz} - {self.score_percent}%"


# ---------------------------------------------------------------------------
# Assignment
# ---------------------------------------------------------------------------
class Assignment(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name="assignment")
    title = models.CharField(max_length=200)
    instructions = models.TextField()
    deadline_days = models.PositiveIntegerField(null=True, blank=True, help_text="days after enrollment")
    max_score = models.PositiveIntegerField(default=100)


class AssignmentSubmission(TimeStampedModel):
    STATUS_CHOICES = [("submitted", "Submitted"), ("reviewed", "Reviewed"), ("resubmit", "Needs Resubmission")]
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assignment_submissions")
    text_submission = models.TextField(blank=True)
    link_submission = models.URLField(blank=True)
    file_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    grade = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)


# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------
class Project(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name="project")
    title = models.CharField(max_length=200)
    brief = models.TextField()
    requirements = models.JSONField(default=list, blank=True)
    resources = models.JSONField(default=list, blank=True)


class ProjectSubmission(TimeStampedModel):
    STATUS_CHOICES = [("submitted", "Submitted"), ("approved", "Approved"), ("rejected", "Rejected")]
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="submissions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="project_submissions")
    github_url = models.URLField(blank=True)
    zip_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    grade = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)


# ---------------------------------------------------------------------------
# Enrollment / Progress
# ---------------------------------------------------------------------------
class Enrollment(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    source = models.CharField(max_length=40, default="app")  # app, youtube_funnel, admin_grant

    class Meta:
        unique_together = ("user", "course")


class LessonProgress(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lesson_progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress_entries")
    is_completed = models.BooleanField(default=False)
    watch_time_seconds = models.PositiveIntegerField(default=0)
    last_position_seconds = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "lesson")


class Streak(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="streak")
    current_streak_days = models.PositiveIntegerField(default=0)
    longest_streak_days = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)


class Achievement(TimeStampedModel):
    key = models.CharField(max_length=64, unique=True)
    title = models.CharField(max_length=120)
    description = models.CharField(max_length=280, blank=True)
    icon = models.CharField(max_length=64, blank=True)


class UserAchievement(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="achievements")
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "achievement")


# ---------------------------------------------------------------------------
# Roadmap
# ---------------------------------------------------------------------------
class Roadmap(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)


class RoadmapNode(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uid, editable=False)
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name="nodes")
    title = models.CharField(max_length=200)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name="roadmap_nodes")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
