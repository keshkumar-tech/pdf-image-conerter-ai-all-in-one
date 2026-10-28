from rest_framework import serializers
from .models import (FAQ, HandwrittenNotesChapter, HandwrittenNotesPDF, HandwrittenNotesSubject,
                     ImpQuestionChapter, ImpQuestionPDF, ImpQuestionSubject,
                     PYQPaper, SocialLink, StudyMaterial,
                     YouTubeChapter, YouTubeSubject, YouTubeVideo,
                     University, Branch, Year, Semester, Subject, SubjectUnit,
                     BTechStudyMaterial, BTechPYQ, BTechQuestionPaper, BTechVideoLecture,
                     BTechImpQuestion, BTechLabManual,
                     Job, Internship, PlacementMaterial,
                     CodingLanguage, CodingTopic, CodingProblem,
                     Badge, UserBadge)


class HandwrittenNotesSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = HandwrittenNotesSubject
        fields = ["id", "class_level", "name", "sort_order", "is_active", "created_at"]


class HandwrittenNotesChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = HandwrittenNotesChapter
        fields = ["id", "subject", "title", "order", "is_active", "created_at"]


class HandwrittenNotesPDFSerializer(serializers.ModelSerializer):
    pdf = serializers.SerializerMethodField()

    class Meta:
        model = HandwrittenNotesPDF
        fields = ["id", "chapter", "title", "pdf_url", "pdf_file", "pdf", "pages", "is_free", "sort_order", "is_active", "created_at"]

    def get_pdf(self, obj):
        request = self.context.get("request")
        if obj.pdf_file:
            url = obj.pdf_file.url
            return request.build_absolute_uri(url) if request else url
        return obj.pdf_url or None


class ImpQuestionSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpQuestionSubject
        fields = ["id", "class_level", "name", "sort_order", "is_active", "created_at"]


class ImpQuestionChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpQuestionChapter
        fields = ["id", "subject", "title", "order", "is_active", "created_at"]


class ImpQuestionPDFSerializer(serializers.ModelSerializer):
    pdf = serializers.SerializerMethodField()

    class Meta:
        model = ImpQuestionPDF
        fields = ["id", "chapter", "title", "pdf_url", "pdf_file", "pdf", "pages", "is_free", "sort_order", "is_active", "created_at"]

    def get_pdf(self, obj):
        request = self.context.get("request")
        if obj.pdf_file:
            url = obj.pdf_file.url
            return request.build_absolute_uri(url) if request else url
        return obj.pdf_url or None


class PYQPaperSerializer(serializers.ModelSerializer):
    pdf = serializers.SerializerMethodField()

    class Meta:
        model = PYQPaper
        fields = ["id", "title", "subject", "year", "class_level", "pages",
                  "is_free", "pdf_url", "pdf_file", "pdf", "sort_order",
                  "is_active", "created_at"]

    def get_pdf(self, obj):
        request = self.context.get("request")
        if obj.pdf_file:
            url = obj.pdf_file.url
            return request.build_absolute_uri(url) if request else url
        return obj.pdf_url or None


class StudyMaterialSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, allow_null=True, write_only=True)
    pdf = serializers.SerializerMethodField()

    class Meta:
        model = StudyMaterial
        fields = ["id", "title", "category", "subject", "class_level",
                  "description", "file_url", "file", "pdf", "sort_order",
                  "is_active", "created_at"]

    def get_pdf(self, obj):
        request = self.context.get("request")
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return obj.file_url or None


class YouTubeVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = YouTubeVideo
        fields = ["id", "chapter", "title", "video_id", "duration", "order", "is_active"]


class YouTubeChapterSerializer(serializers.ModelSerializer):
    videos = YouTubeVideoSerializer(many=True, read_only=True)

    class Meta:
        model = YouTubeChapter
        fields = ["id", "subject", "title", "order", "is_active", "videos"]


class YouTubeSubjectSerializer(serializers.ModelSerializer):
    chapters = YouTubeChapterSerializer(many=True, read_only=True)
    chapters_count = serializers.SerializerMethodField()

    def get_chapters_count(self, obj):
        return obj.chapters.filter(is_active=True).count()

    class Meta:
        model = YouTubeSubject
        fields = ["id", "subject_id", "name", "icon", "color", "class_level",
                  "sort_order", "is_active", "chapters_count", "chapters"]


class YouTubeSubjectListSerializer(serializers.ModelSerializer):
    """Lightweight — no nested chapters for listing."""
    chapters_count = serializers.SerializerMethodField()

    def get_chapters_count(self, obj):
        return obj.chapters.filter(is_active=True).count()

    class Meta:
        model = YouTubeSubject
        fields = ["id", "subject_id", "name", "icon", "color", "class_level",
                  "sort_order", "is_active", "chapters_count"]


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ["id", "platform", "label", "url", "icon", "color", "sort_order", "is_active"]


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ["id", "question", "answer", "sort_order", "is_active"]


# =============================================================================
# B.TECH ECOSYSTEM SERIALIZERS
# =============================================================================

class UniversitySerializer(serializers.ModelSerializer):
    branches_count = serializers.SerializerMethodField()

    class Meta:
        model = University
        fields = ["id", "code", "name", "short_name", "state", "description",
                  "logo", "website", "is_active", "sort_order", "created_at", "branches_count"]

    def get_branches_count(self, obj):
        return obj.branches.filter(is_active=True).count()


class BranchSerializer(serializers.ModelSerializer):
    university_code = serializers.CharField(source="university.code", read_only=True)
    university_name = serializers.CharField(source="university.name", read_only=True)
    years_count = serializers.SerializerMethodField()
    subjects_count = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = ["id", "university", "university_code", "university_name", "code", "name",
                  "short_name", "icon", "color", "description", "tagline",
                  "is_active", "sort_order", "created_at", "years_count", "subjects_count"]

    def get_years_count(self, obj):
        return obj.years.filter(is_active=True).count()

    def get_subjects_count(self, obj):
        from django.db.models import Count
        return Subject.objects.filter(semester__year__branch=obj, is_active=True).count()


class YearSerializer(serializers.ModelSerializer):
    branch_code = serializers.CharField(source="branch.code", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    semesters_count = serializers.SerializerMethodField()

    class Meta:
        model = Year
        fields = ["id", "branch", "branch_code", "branch_name", "number", "label",
                  "is_active", "sort_order", "created_at", "semesters_count"]

    def get_semesters_count(self, obj):
        return obj.semesters.filter(is_active=True).count()


class SemesterSerializer(serializers.ModelSerializer):
    year_number = serializers.IntegerField(source="year.number", read_only=True)
    branch_code = serializers.CharField(source="year.branch.code", read_only=True)
    subjects_count = serializers.SerializerMethodField()

    class Meta:
        model = Semester
        fields = ["id", "year", "year_number", "branch_code", "number", "label",
                  "start_date", "end_date", "is_active", "sort_order", "created_at", "subjects_count"]

    def get_subjects_count(self, obj):
        return obj.subjects.filter(is_active=True).count()


class SubjectUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectUnit
        fields = ["id", "subject", "number", "title", "key_topics", "outcomes",
                  "lecture_hours", "sort_order", "created_at"]


class SubjectSerializer(serializers.ModelSerializer):
    semester_number = serializers.IntegerField(source="semester.number", read_only=True)
    branch_code = serializers.CharField(source="semester.year.branch.code", read_only=True)
    university_code = serializers.CharField(source="semester.year.branch.university.code", read_only=True)
    units_count = serializers.SerializerMethodField()
    materials_count = serializers.SerializerMethodField()
    pyq_count = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ["id", "semester", "semester_number", "branch_code", "university_code",
                  "code", "name", "short_name", "icon", "color", "credits",
                  "lecture_hours_per_week", "category", "description", "full_name",
                  "is_active", "sort_order", "created_at",
                  "units_count", "materials_count", "pyq_count"]

    def get_units_count(self, obj):
        return obj.units.count()

    def get_materials_count(self, obj):
        return obj.study_materials.filter(is_active=True).count()

    def get_pyq_count(self, obj):
        return obj.pyq_papers.filter(is_active=True).count()


class SubjectDetailSerializer(SubjectSerializer):
    """Detailed serializer with nested units"""
    units = SubjectUnitSerializer(many=True, read_only=True)

    class Meta(SubjectSerializer.Meta):
        fields = SubjectSerializer.Meta.fields + ["units"]


class BTechStudyMaterialSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, allow_null=True, write_only=True)
    pdf = serializers.SerializerMethodField()
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    unit_number = serializers.IntegerField(source="unit.number", read_only=True, allow_null=True)

    class Meta:
        model = BTechStudyMaterial
        fields = ["id", "subject", "subject_code", "subject_name", "unit", "unit_number",
                  "category", "title", "description", "file_url", "file", "pdf",
                  "pages", "size_mb", "year", "is_free", "is_premium",
                  "is_active", "sort_order", "download_count", "view_count", "created_at"]

    def get_pdf(self, obj):
        request = self.context.get("request")
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return obj.file_url or None


class BTechPYQSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, allow_null=True, write_only=True)
    pdf = serializers.SerializerMethodField()
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    university_code = serializers.CharField(source="university.code", read_only=True)

    class Meta:
        model = BTechPYQ
        fields = ["id", "subject", "subject_code", "subject_name", "university",
                  "university_code", "exam_year", "exam_type", "semester",
                  "title", "file_url", "file", "pdf", "pages", "size_mb",
                  "is_free", "is_active", "sort_order", "download_count", "created_at"]

    def get_pdf(self, obj):
        request = self.context.get("request")
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return obj.file_url or None


class BTechQuestionPaperSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, allow_null=True, write_only=True)
    pdf = serializers.SerializerMethodField()
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    university_code = serializers.CharField(source="university.code", read_only=True, allow_null=True)

    class Meta:
        model = BTechQuestionPaper
        fields = ["id", "subject", "subject_code", "subject_name", "university",
                  "university_code", "paper_type", "title", "description",
                  "file_url", "file", "pdf", "pages", "size_mb",
                  "is_free", "is_active", "sort_order", "download_count", "created_at"]

    def get_pdf(self, obj):
        request = self.context.get("request")
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return obj.file_url or None


class BTechVideoLectureSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, allow_null=True, write_only=True)
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    unit_number = serializers.IntegerField(source="unit.number", read_only=True, allow_null=True)

    class Meta:
        model = BTechVideoLecture
        fields = ["id", "subject", "subject_code", "subject_name", "unit", "unit_number",
                  "title", "description", "youtube_id", "youtube_url", "video_file",
                  "provider", "duration_seconds", "channel", "thumbnail_url",
                  "is_free", "is_active", "sort_order", "view_count", "created_at"]


class BTechImpQuestionSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    unit_number = serializers.IntegerField(source="unit.number", read_only=True)
    unit_title = serializers.CharField(source="unit.title", read_only=True)

    class Meta:
        model = BTechImpQuestion
        fields = ["id", "subject", "subject_code", "subject_name", "unit", "unit_number",
                  "unit_title", "title", "questions", "difficulty",
                  "is_active", "sort_order", "created_at"]


class BTechLabManualSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, allow_null=True, write_only=True)
    pdf = serializers.SerializerMethodField()
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = BTechLabManual
        fields = ["id", "subject", "subject_code", "subject_name",
                  "title", "description", "file_url", "file", "pdf",
                  "practicals_count", "pages", "size_mb",
                  "is_free", "is_active", "sort_order", "download_count", "created_at"]

    def get_pdf(self, obj):
        request = self.context.get("request")
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return obj.file_url or None


# Career & Placement Serializers
class JobSerializer(serializers.ModelSerializer):
    posted_by_email = serializers.CharField(source="posted_by.email", read_only=True, allow_null=True)

    class Meta:
        model = Job
        fields = ["id", "company", "job_title", "location", "job_type",
                  "salary_min", "salary_max", "salary_currency",
                  "eligibility", "skills_required", "description",
                  "application_link", "deadline",
                  "is_active", "is_featured", "posted_by", "posted_by_email",
                  "created_at", "updated_at"]


class InternshipSerializer(serializers.ModelSerializer):
    posted_by_email = serializers.CharField(source="posted_by.email", read_only=True, allow_null=True)

    class Meta:
        model = Internship
        fields = ["id", "company", "title", "location",
                  "stipend_min", "stipend_max", "stipend_currency",
                  "duration_months", "eligibility", "skills_required", "description",
                  "application_link", "deadline",
                  "is_active", "is_featured", "posted_by", "posted_by_email",
                  "created_at", "updated_at"]


class PlacementMaterialSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, allow_null=True, write_only=True)
    pdf = serializers.SerializerMethodField()

    class Meta:
        model = PlacementMaterial
        fields = ["id", "category", "title", "description",
                  "file_url", "file", "pdf", "difficulty", "tags",
                  "is_free", "is_active", "sort_order",
                  "download_count", "view_count", "created_at", "updated_at"]

    def get_pdf(self, obj):
        request = self.context.get("request")
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return obj.file_url or None


# Coding Hub Serializers
class CodingLanguageSerializer(serializers.ModelSerializer):
    topics_count = serializers.SerializerMethodField()
    problems_count = serializers.SerializerMethodField()

    class Meta:
        model = CodingLanguage
        fields = ["id", "name", "slug", "icon", "color", "description",
                  "is_active", "sort_order", "created_at", "topics_count", "problems_count"]

    def get_topics_count(self, obj):
        return obj.topics.filter(is_active=True).count()

    def get_problems_count(self, obj):
        return CodingProblem.objects.filter(topic__language=obj, is_active=True).count()


class CodingTopicSerializer(serializers.ModelSerializer):
    language_name = serializers.CharField(source="language.name", read_only=True)
    problems_count = serializers.SerializerMethodField()

    class Meta:
        model = CodingTopic
        fields = ["id", "language", "language_name", "name", "slug", "description",
                  "icon", "difficulty", "is_active", "sort_order", "created_at", "problems_count"]

    def get_problems_count(self, obj):
        return obj.problems.filter(is_active=True).count()


class CodingProblemSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source="topic.name", read_only=True)
    language_name = serializers.CharField(source="topic.language.name", read_only=True)

    class Meta:
        model = CodingProblem
        fields = ["id", "topic", "topic_name", "language_name", "title", "slug",
                  "description", "difficulty", "constraints", "examples",
                  "starter_code", "solution_code", "explanation",
                  "time_limit_seconds", "memory_limit_mb", "tags",
                  "is_active", "is_premium", "sort_order", "created_at", "updated_at"]


# Gamification Serializers
class BadgeSerializer(serializers.ModelSerializer):
    earned_count = serializers.SerializerMethodField()

    class Meta:
        model = Badge
        fields = ["id", "key", "name", "description", "icon", "color",
                  "criteria", "is_active", "created_at", "earned_count"]

    def get_earned_count(self, obj):
        return obj.user_badges.count()


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = UserBadge
        fields = ["id", "user", "user_email", "badge", "earned_at", "metadata"]
