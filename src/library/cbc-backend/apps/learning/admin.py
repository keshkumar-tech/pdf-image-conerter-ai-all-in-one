from django.contrib import admin
from .models import Quiz, QuizQuestion, QuizOption, QuizAttempt


class QuizOptionInline(admin.TabularInline):
    model = QuizOption
    extra = 4


class QuizQuestionInline(admin.StackedInline):
    model = QuizQuestion
    extra = 1


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ["title", "class_level", "subject", "difficulty", "time_limit_seconds", "is_published", "is_free"]
    list_filter = ["class_level", "subject", "difficulty", "is_published", "is_free"]
    search_fields = ["title", "topic", "description"]
    inlines = [QuizQuestionInline]


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ["prompt", "quiz", "question_type", "marks", "order"]
    list_filter = ["quiz", "question_type"]
    search_fields = ["prompt", "explanation"]
    inlines = [QuizOptionInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ["quiz", "user", "score_percent", "passed", "time_taken_seconds", "submitted_at"]
    list_filter = ["passed", "quiz"]
    search_fields = ["user__email", "quiz__title"]

