"""
Content management models — PYQ Papers, YouTube Videos, Social Links, FAQ.
All previously hard-coded in the frontend; now fully dynamic and admin-manageable.
"""
from django.db import models
from apps.users.models import TimeStampedModel
from .storage import DatabaseStorage


# ---------------------------------------------------------------------------
# PYQ (Previous Year Question) Papers
# ---------------------------------------------------------------------------
CLASS_CHOICES = [
    ("Class 9",  "Class 9"),
    ("Class 10", "Class 10"),
    ("Class 11", "Class 11"),
    ("Class 12", "Class 12"),
]

SUBJECT_CHOICES = [
    ("Mathematics",   "Mathematics"),
    ("Science",       "Science"),
    ("Physics",       "Physics"),
    ("Chemistry",     "Chemistry"),
    ("Biology",       "Biology"),
    ("English",       "English"),
    ("Hindi",         "Hindi"),
    ("Social Science","Social Science"),
    ("All Subjects",  "All Subjects"),
]


class PYQPaper(TimeStampedModel):
    title       = models.CharField(max_length=200)
    subject     = models.CharField(max_length=40, choices=SUBJECT_CHOICES)
    year        = models.CharField(max_length=20, help_text='e.g. "2023" or "2018–2023"')
    class_level = models.CharField(max_length=20, choices=CLASS_CHOICES)
    pages       = models.PositiveIntegerField(default=0)
    is_free     = models.BooleanField(default=False)
    pdf_url     = models.URLField(blank=True, help_text="Direct PDF URL (for free papers)")
    pdf_file    = models.FileField(storage=DatabaseStorage(), upload_to="pyq/%Y/", blank=True, null=True,
                                   help_text="Upload PDF from device (overrides pdf_url)")
    sort_order  = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["class_level", "subject", "sort_order"]

    def __str__(self):
        return f"{self.title} ({self.class_level})"


# ---------------------------------------------------------------------------
# YouTube Content
# ---------------------------------------------------------------------------
class YouTubeSubject(TimeStampedModel):
    """A subject taught on YouTube for a specific class level."""
    subject_id  = models.CharField(max_length=20, unique=True, help_text='e.g. "10-maths"')
    name        = models.CharField(max_length=80)
    icon        = models.CharField(max_length=8, default="📚")
    color       = models.CharField(max_length=10, default="#2E90FA")
    class_level = models.CharField(max_length=20, choices=CLASS_CHOICES)
    sort_order  = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["class_level", "sort_order"]

    def __str__(self):
        return f"{self.class_level} — {self.name}"


class YouTubeChapter(TimeStampedModel):
    """A chapter/unit inside a YouTubeSubject."""
    subject     = models.ForeignKey(YouTubeSubject, on_delete=models.CASCADE, related_name="chapters")
    title       = models.CharField(max_length=200)
    order       = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.subject} / {self.title}"


class YouTubeVideo(TimeStampedModel):
    """An individual YouTube video inside a chapter."""
    chapter     = models.ForeignKey(YouTubeChapter, on_delete=models.CASCADE, related_name="videos")
    title       = models.CharField(max_length=200)
    video_id    = models.CharField(max_length=20, help_text="YouTube video ID (e.g. dQw4w9WgXcQ)")
    duration    = models.CharField(max_length=10, blank=True, help_text='e.g. "14:22"')
    order       = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


# ---------------------------------------------------------------------------
# Social Links
# ---------------------------------------------------------------------------
class SocialLink(TimeStampedModel):
    PLATFORM_CHOICES = [
        ("youtube",   "YouTube"),
        ("instagram", "Instagram"),
        ("telegram",  "Telegram"),
        ("whatsapp",  "WhatsApp"),
        ("facebook",  "Facebook"),
        ("twitter",   "X / Twitter"),
        ("linkedin",  "LinkedIn"),
        ("website",   "Website"),
        ("other",     "Other"),
    ]
    platform    = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    label       = models.CharField(max_length=80, help_text="Display name shown to students")
    url         = models.URLField()
    icon        = models.CharField(max_length=8, blank=True, help_text="Emoji icon")
    color       = models.CharField(max_length=10, default="#1B2B4B")
    sort_order  = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.platform}: {self.label}"


# ---------------------------------------------------------------------------
# Study Materials — NCERT Books / Paid & Free Notes / Paid & Free Tests
# ---------------------------------------------------------------------------
class StudyMaterial(TimeStampedModel):
    CATEGORY_CHOICES = [
        ("ncert",      "NCERT Book"),
        ("paid-test",  "Paid Test"),
        ("paid-notes", "Paid Notes"),
        ("free-notes", "Free Notes"),
        ("free-test",  "Free Test"),
    ]
    title       = models.CharField(max_length=200)
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    subject     = models.CharField(max_length=40, blank=True, default="All Subjects")
    class_level = models.CharField(max_length=20, choices=CLASS_CHOICES)
    description = models.CharField(max_length=300, blank=True)
    file_url    = models.URLField(blank=True, help_text="External PDF / link URL")
    file        = models.FileField(storage=DatabaseStorage(), upload_to="materials/%Y/", blank=True, null=True,
                                  help_text="Upload PDF from device")
    sort_order  = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["category", "class_level", "sort_order"]

    def __str__(self):
        return f"{self.get_category_display()} — {self.title}"


# ---------------------------------------------------------------------------
# Database-stored uploads (survive Render's ephemeral filesystem)
# ---------------------------------------------------------------------------
class StoredFile(models.Model):
    """Holds PDF bytes for PYQPaper.pdf_file / StudyMaterial.file in Postgres."""

    name = models.CharField(max_length=500, unique=True)
    data = models.BinaryField()
    size = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# FAQ
# ---------------------------------------------------------------------------
class FAQ(TimeStampedModel):
    question    = models.CharField(max_length=300)
    answer      = models.TextField()
    sort_order  = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order"]
        verbose_name = "FAQ"

    def __str__(self):
        return self.question[:60]


# ---------------------------------------------------------------------------
# Important Questions — Subject → Chapter → PDF
# ---------------------------------------------------------------------------
class ImpQuestionSubject(TimeStampedModel):
    class_level = models.CharField(max_length=20, choices=CLASS_CHOICES)
    name        = models.CharField(max_length=120)
    sort_order  = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Imp Question Subject"

    def __str__(self):
        return f"{self.class_level} — {self.name}"


class ImpQuestionChapter(TimeStampedModel):
    subject     = models.ForeignKey(ImpQuestionSubject, on_delete=models.CASCADE, related_name="chapters")
    title       = models.CharField(max_length=200)
    order       = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]
        verbose_name = "Imp Question Chapter"

    def __str__(self):
        return f"{self.subject} / {self.title}"


class ImpQuestionPDF(TimeStampedModel):
    chapter     = models.ForeignKey(ImpQuestionChapter, on_delete=models.CASCADE, related_name="pdfs")
    title       = models.CharField(max_length=200)
    pdf_file    = models.FileField(storage=DatabaseStorage(), upload_to="imp-questions/%Y/", blank=True, null=True)
    pdf_url     = models.URLField(blank=True)
    pages       = models.PositiveIntegerField(default=0)
    is_free     = models.BooleanField(default=True)
    sort_order  = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order"]
        verbose_name = "Imp Question PDF"

    def __str__(self):
        return self.title


class HandwrittenNotesSubject(TimeStampedModel):
    class_level = models.CharField(max_length=20, choices=CLASS_CHOICES)
    name        = models.CharField(max_length=120)
    sort_order  = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Handwritten Notes Subject"

    def __str__(self):
        return f"{self.class_level} — {self.name}"


class HandwrittenNotesChapter(TimeStampedModel):
    subject     = models.ForeignKey(HandwrittenNotesSubject, on_delete=models.CASCADE, related_name="chapters")
    title       = models.CharField(max_length=200)
    order       = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]
        verbose_name = "Handwritten Notes Chapter"

    def __str__(self):
        return f"{self.subject} / {self.title}"


class HandwrittenNotesPDF(TimeStampedModel):
    chapter     = models.ForeignKey(HandwrittenNotesChapter, on_delete=models.CASCADE, related_name="pdfs")
    title       = models.CharField(max_length=200)
    pdf_file    = models.FileField(storage=DatabaseStorage(), upload_to="handwritten-notes/%Y/", blank=True, null=True)
    pdf_url     = models.URLField(blank=True)
    pages       = models.PositiveIntegerField(default=0)
    is_free     = models.BooleanField(default=True)
    sort_order  = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order"]
        verbose_name = "Handwritten Notes PDF"

    def __str__(self):
        return self.title


# =============================================================================
# B.TECH ECOSYSTEM MODELS
# =============================================================================

UNIVERSITY_CHOICES = [
    ("aktu", "Dr. A.P.J. Abdul Kalam Technical University (AKTU)"),
    ("rtu", "Rajasthan Technical University (RTU)"),
    ("vtu", "Visvesvaraya Technological University (VTU)"),
    ("mdu", "Maharshi Dayanand University (MDU)"),
    ("ipu", "Guru Gobind Singh Indraprastha University (IPU)"),
    ("mnit", "Malaviya National Institute of Technology (MNIT)"),
    ("nit", "National Institute of Technology (NIT)"),
    ("iit", "Indian Institute of Technology (IIT)"),
    ("other", "Other University"),
]

BRANCH_CHOICES = [
    ("cse", "Computer Science Engineering"),
    ("it", "Information Technology"),
    ("ece", "Electronics & Communication Engineering"),
    ("ee", "Electrical Engineering"),
    ("me", "Mechanical Engineering"),
    ("ce", "Civil Engineering"),
    ("ai", "Artificial Intelligence & Machine Learning"),
    ("ds", "Data Science"),
    ("cyber", "Cyber Security"),
    ("chemical", "Chemical Engineering"),
    ("biotech", "Biotechnology"),
    ("aero", "Aerospace Engineering"),
    ("auto", "Automobile Engineering"),
    ("prod", "Production Engineering"),
    ("other", "Other Branch"),
]

YEAR_CHOICES = [
    (1, "1st Year"),
    (2, "2nd Year"),
    (3, "3rd Year"),
    (4, "4th Year"),
]

SEMESTER_CHOICES = [
    (1, "Semester 1"),
    (2, "Semester 2"),
    (3, "Semester 3"),
    (4, "Semester 4"),
    (5, "Semester 5"),
    (6, "Semester 6"),
    (7, "Semester 7"),
    (8, "Semester 8"),
]

CONTENT_CATEGORY_CHOICES = [
    ("notes", "Notes"),
    ("quantum", "Quantum Series"),
    ("pyq", "Previous Year Questions"),
    ("question_paper", "Question Paper"),
    ("handwritten", "Handwritten Notes"),
    ("video", "Video Lecture"),
    ("lab_manual", "Lab Manual"),
    ("syllabus", "Syllabus"),
    ("reference", "Reference Book"),
    ("other", "Other"),
]

EXAM_TYPE_CHOICES = [
    ("mid_sem", "Mid Semester"),
    ("end_sem", "End Semester"),
    ("sessional", "Sessional"),
    ("practical", "Practical"),
    ("other", "Other"),
]

DIFFICULTY_CHOICES = [
    ("easy", "Easy"),
    ("medium", "Medium"),
    ("hard", "Hard"),
]

JOB_TYPE_CHOICES = [
    ("full_time", "Full Time"),
    ("part_time", "Part Time"),
    ("contract", "Contract"),
    ("internship", "Internship"),
    ("remote", "Remote"),
]

PLACEMENT_CATEGORY_CHOICES = [
    ("aptitude", "Quantitative Aptitude"),
    ("logical", "Logical Reasoning"),
    ("verbal", "Verbal Ability"),
    ("technical", "Technical"),
    ("hr", "HR Interview"),
    ("coding", "Coding"),
    ("dsa", "Data Structures & Algorithms"),
    ("system_design", "System Design"),
    ("puzzle", "Puzzles"),
    ("case_study", "Case Study"),
]


class University(TimeStampedModel):
    """B.Tech University (AKTU, RTU, VTU, etc.)"""
    code = models.CharField(max_length=20, unique=True, help_text="e.g. aktu, rtu, vtu")
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50, blank=True)
    state = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    logo = models.URLField(blank=True)
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class Branch(TimeStampedModel):
    """Engineering Branch (CSE, ECE, ME, etc.)"""
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name="branches")
    code = models.CharField(max_length=20, help_text="e.g. cse, ece, me")
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50)
    icon = models.CharField(max_length=8, default="📚")
    color = models.CharField(max_length=10, default="#3B82F6")
    description = models.TextField(blank=True)
    tagline = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["university", "sort_order", "name"]
        unique_together = ["university", "code"]

    def __str__(self):
        return f"{self.university.code.upper()} - {self.name}"


class Year(TimeStampedModel):
    """Academic Year (1st, 2nd, 3rd, 4th)"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="years")
    number = models.PositiveIntegerField(choices=YEAR_CHOICES)
    label = models.CharField(max_length=50, blank=True, help_text="e.g. First Year")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["branch", "number"]
        unique_together = ["branch", "number"]

    def __str__(self):
        return f"{self.branch} - {self.get_number_display()}"


class Semester(TimeStampedModel):
    """Semester (1-8)"""
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name="semesters")
    number = models.PositiveIntegerField(choices=SEMESTER_CHOICES)
    label = models.CharField(max_length=50, blank=True, help_text="e.g. Semester 1")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["year", "number"]
        unique_together = ["year", "number"]

    def __str__(self):
        return f"{self.year} - {self.get_number_display()}"


class Subject(TimeStampedModel):
    """B.Tech Subject with detailed syllabus"""
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name="subjects")
    code = models.CharField(max_length=30, help_text="e.g. KCS301, BAS103")
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50)
    icon = models.CharField(max_length=8, default="📖")
    color = models.CharField(max_length=10, default="#3B82F6")
    credits = models.PositiveIntegerField(default=4)
    lecture_hours_per_week = models.PositiveIntegerField(default=3)
    category = models.CharField(max_length=50, blank=True, help_text="Core, Elective, Lab, etc.")
    description = models.TextField(blank=True)
    full_name = models.CharField(max_length=300, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["semester", "sort_order", "code"]
        unique_together = ["semester", "code"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class SubjectUnit(TimeStampedModel):
    """Syllabus unit within a subject"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="units")
    number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    key_topics = models.JSONField(default=list, blank=True, help_text="List of key topics")
    outcomes = models.JSONField(default=list, blank=True, help_text="Learning outcomes")
    lecture_hours = models.PositiveIntegerField(default=0)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["subject", "number"]
        unique_together = ["subject", "number"]

    def __str__(self):
        return f"{self.subject.code} - Unit {self.number}: {self.title}"


class BTechStudyMaterial(TimeStampedModel):
    """Study material for B.Tech subjects (Notes, Quantum, Handwritten, etc.)"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="study_materials")
    unit = models.ForeignKey(SubjectUnit, on_delete=models.SET_NULL, null=True, blank=True, related_name="materials")
    category = models.CharField(max_length=30, choices=CONTENT_CATEGORY_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_url = models.URLField(blank=True, help_text="External PDF / link URL")
    file = models.FileField(storage=DatabaseStorage(), upload_to="btech/materials/%Y/", blank=True, null=True,
                             help_text="Upload PDF from device")
    pages = models.PositiveIntegerField(default=0)
    size_mb = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    year = models.CharField(max_length=20, blank=True, help_text="Academic year e.g. 2024-25")
    is_free = models.BooleanField(default=True)
    is_premium = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["subject", "category", "sort_order"]
        verbose_name = "B.Tech Study Material"
        verbose_name_plural = "B.Tech Study Materials"

    def __str__(self):
        return f"{self.subject.code} - {self.get_category_display()} - {self.title}"


class BTechPYQ(TimeStampedModel):
    """Previous Year Question Papers for B.Tech"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="pyq_papers")
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name="pyq_papers")
    exam_year = models.CharField(max_length=20, help_text="e.g. 2024, 2023")
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPE_CHOICES)
    semester = models.PositiveIntegerField(choices=SEMESTER_CHOICES)
    title = models.CharField(max_length=200)
    file_url = models.URLField(blank=True)
    file = models.FileField(storage=DatabaseStorage(), upload_to="btech/pyq/%Y/", blank=True, null=True)
    pages = models.PositiveIntegerField(default=0)
    size_mb = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    is_free = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-exam_year", "exam_type", "sort_order"]
        verbose_name = "B.Tech PYQ"
        verbose_name_plural = "B.Tech PYQs"

    def __str__(self):
        return f"{self.subject.code} - {self.exam_year} {self.get_exam_type_display()}"


class BTechQuestionPaper(TimeStampedModel):
    """Question Papers (Sample, Model, Practice) for B.Tech"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="question_papers")
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True, related_name="question_papers")
    paper_type = models.CharField(max_length=30, choices=[
        ("sample", "Sample Paper"),
        ("model", "Model Paper"),
        ("practice", "Practice Paper"),
        ("assignment", "Assignment"),
        ("tutorial", "Tutorial Sheet"),
    ])
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_url = models.URLField(blank=True)
    file = models.FileField(storage=DatabaseStorage(), upload_to="btech/question-papers/%Y/", blank=True, null=True)
    pages = models.PositiveIntegerField(default=0)
    size_mb = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    is_free = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["subject", "paper_type", "sort_order"]
        verbose_name = "B.Tech Question Paper"
        verbose_name_plural = "B.Tech Question Papers"

    def __str__(self):
        return f"{self.subject.code} - {self.get_paper_type_display()} - {self.title}"


class BTechVideoLecture(TimeStampedModel):
    """Video lectures for B.Tech subjects"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="video_lectures")
    unit = models.ForeignKey(SubjectUnit, on_delete=models.SET_NULL, null=True, blank=True, related_name="videos")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    youtube_id = models.CharField(max_length=20, blank=True, help_text="YouTube video ID")
    youtube_url = models.URLField(blank=True)
    video_file = models.FileField(storage=DatabaseStorage(), upload_to="btech/videos/%Y/", blank=True, null=True)
    provider = models.CharField(max_length=30, default="youtube", help_text="youtube, self, mux, bunny")
    duration_seconds = models.PositiveIntegerField(default=0)
    channel = models.CharField(max_length=100, blank=True)
    thumbnail_url = models.URLField(blank=True)
    is_free = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["subject", "sort_order"]
        verbose_name = "B.Tech Video Lecture"
        verbose_name_plural = "B.Tech Video Lectures"

    def __str__(self):
        return f"{self.subject.code} - {self.title}"


class BTechImpQuestion(TimeStampedModel):
    """Important Questions for B.Tech subjects (unit-wise)"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="imp_questions")
    unit = models.ForeignKey(SubjectUnit, on_delete=models.CASCADE, related_name="imp_questions")
    title = models.CharField(max_length=200)
    questions = models.JSONField(default=list, help_text="List of important questions")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="medium")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["subject", "unit__number", "sort_order"]
        verbose_name = "B.Tech Important Question"
        verbose_name_plural = "B.Tech Important Questions"

    def __str__(self):
        return f"{self.subject.code} - Unit {self.unit.number} - {self.title}"


class BTechLabManual(TimeStampedModel):
    """Lab manuals for B.Tech subjects"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="lab_manuals")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_url = models.URLField(blank=True)
    file = models.FileField(storage=DatabaseStorage(), upload_to="btech/lab-manuals/%Y/", blank=True, null=True)
    practicals_count = models.PositiveIntegerField(default=0)
    pages = models.PositiveIntegerField(default=0)
    size_mb = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    is_free = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["subject", "sort_order"]
        verbose_name = "B.Tech Lab Manual"
        verbose_name_plural = "B.Tech Lab Manuals"

    def __str__(self):
        return f"{self.subject.code} - {self.title}"


# =============================================================================
# CAREER & PLACEMENT MODELS
# =============================================================================

class Job(TimeStampedModel):
    """Job postings for placements"""
    company = models.CharField(max_length=200)
    job_title = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=8, default="INR")
    eligibility = models.TextField(blank=True, help_text="Eligibility criteria")
    skills_required = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True)
    application_link = models.URLField(blank=True)
    deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    posted_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, related_name="jobs_posted")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.company} - {self.job_title}"


class Internship(TimeStampedModel):
    """Internship postings"""
    company = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    stipend_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stipend_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stipend_currency = models.CharField(max_length=8, default="INR")
    duration_months = models.PositiveIntegerField(default=0)
    eligibility = models.TextField(blank=True)
    skills_required = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True)
    application_link = models.URLField(blank=True)
    deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    posted_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, related_name="internships_posted")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.company} - {self.title}"


class PlacementMaterial(TimeStampedModel):
    """Placement preparation material (Aptitude, Technical, HR, etc.)"""
    category = models.CharField(max_length=30, choices=PLACEMENT_CATEGORY_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_url = models.URLField(blank=True)
    file = models.FileField(storage=DatabaseStorage(), upload_to="placement/%Y/", blank=True, null=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="medium")
    tags = models.JSONField(default=list, blank=True)
    is_free = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["category", "sort_order"]
        verbose_name = "Placement Material"
        verbose_name_plural = "Placement Materials"

    def __str__(self):
        return f"{self.get_category_display()} - {self.title}"


# =============================================================================
# CODING HUB MODELS
# =============================================================================

class CodingLanguage(TimeStampedModel):
    """Programming languages for Coding Hub"""
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50, unique=True)
    icon = models.CharField(max_length=8, default="💻")
    color = models.CharField(max_length=10, default="#3B82F6")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Coding Language"
        verbose_name_plural = "Coding Languages"

    def __str__(self):
        return self.name


class CodingTopic(TimeStampedModel):
    """Topics within a coding language"""
    language = models.ForeignKey(CodingLanguage, on_delete=models.CASCADE, related_name="topics")
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=8, default="📁")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="medium")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["language", "sort_order", "name"]
        unique_together = ["language", "slug"]

    def __str__(self):
        return f"{self.language.name} - {self.name}"


class CodingProblem(TimeStampedModel):
    """Coding problems for practice"""
    topic = models.ForeignKey(CodingTopic, on_delete=models.CASCADE, related_name="problems")
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="medium")
    constraints = models.TextField(blank=True)
    examples = models.JSONField(default=list, blank=True)
    starter_code = models.JSONField(default=dict, blank=True, help_text="Language -> starter code")
    solution_code = models.JSONField(default=dict, blank=True, help_text="Language -> solution")
    explanation = models.TextField(blank=True)
    time_limit_seconds = models.PositiveIntegerField(default=2)
    memory_limit_mb = models.PositiveIntegerField(default=256)
    tags = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    is_premium = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["topic", "sort_order", "title"]
        unique_together = ["topic", "slug"]

    def __str__(self):
        return f"{self.topic.language.name} - {self.title}"


# =============================================================================
# ACHIEVEMENTS & GAMIFICATION
# =============================================================================

class Badge(TimeStampedModel):
    """Badges/Achievements for students"""
    key = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=120)
    description = models.CharField(max_length=280, blank=True)
    icon = models.CharField(max_length=64, blank=True)
    color = models.CharField(max_length=10, default="#F59E0B")
    criteria = models.JSONField(default=dict, blank=True, help_text="Auto-award criteria")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserBadge(TimeStampedModel):
    """User earned badges"""
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="badges")
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ["user", "badge"]
        ordering = ["-earned_at"]

    def __str__(self):
        return f"{self.user.email} - {self.badge.name}"
