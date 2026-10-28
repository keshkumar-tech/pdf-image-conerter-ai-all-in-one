import uuid

from django.db import models
from django.utils.text import slugify

from apps.users.models import TimeStampedModel, SoftDeleteModel


class Category(TimeStampedModel):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    icon = models.CharField(max_length=64, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class PricingPlan(TimeStampedModel):
    """Admin-editable pricing. The ₹499 starter price lives here, never hard-coded."""
    name = models.CharField(max_length=80)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default="INR")
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    duration_days = models.PositiveIntegerField(null=True, blank=True, help_text="null = lifetime")
    features = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.name} - {self.currency} {self.price}"


class Course(TimeStampedModel, SoftDeleteModel):
    LEVEL_CHOICES = [("beginner", "Beginner"), ("intermediate", "Intermediate"), ("advanced", "Advanced")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    short_description = models.CharField(max_length=280, blank=True)
    thumbnail_url = models.URLField(blank=True)
    thumbnail_file = models.ImageField(upload_to="courses/thumbnails/%Y/", blank=True, null=True)
    banner_url = models.URLField(blank=True)
    banner_file = models.ImageField(upload_to="courses/banners/%Y/", blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="courses")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="beginner")
    language = models.CharField(max_length=40, default="English")
    instructor_name = models.CharField(max_length=120, default="Kesh")
    is_free = models.BooleanField(default=False)
    pricing_plan = models.ForeignKey(PricingPlan, on_delete=models.SET_NULL, null=True, blank=True,
                                      related_name="courses")
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    rating_average = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    students_count = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=0)
    requirements = models.JSONField(default=list, blank=True)
    learning_outcomes = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.CharField(max_length=300, blank=True)
    youtube_playlist_url = models.URLField(blank=True)

    # ── Batch info (admin-managed, shown to students) ──────────────────
    batch_name = models.CharField(max_length=120, blank=True, help_text="e.g. CHIRAG Batch 2025")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    highlights = models.JSONField(
        default=list, blank=True,
        help_text='List of highlight strings shown on course detail page, e.g. ["🔴 Live Batch", "📝 Notes included"]'
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Module(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} / {self.title}"


class Lesson(TimeStampedModel):
    LESSON_TYPE_CHOICES = [
        ("video", "Video"),
        ("pdf", "PDF"),
        ("source_code", "Source Code"),
        ("template", "Template"),
        ("quiz", "Quiz"),
        ("assignment", "Assignment"),
        ("project", "Project"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES, default="video")
    order = models.PositiveIntegerField(default=0)
    is_free_preview = models.BooleanField(default=False)
    duration_minutes = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title
