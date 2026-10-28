from django.db import models
from rest_framework import viewsets, filters, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from apps.users.permissions import IsAdminOrReadOnly
from apps.courses.models import Course
from apps.learning.models import Quiz
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
from .serializers import (FAQSerializer, HandwrittenNotesChapterSerializer, HandwrittenNotesPDFSerializer,
                          HandwrittenNotesSubjectSerializer, ImpQuestionChapterSerializer, ImpQuestionPDFSerializer,
                          ImpQuestionSubjectSerializer, PYQPaperSerializer, SocialLinkSerializer,
                          StudyMaterialSerializer, YouTubeChapterSerializer,
                          YouTubeSubjectListSerializer, YouTubeSubjectSerializer,
                          YouTubeVideoSerializer,
                          UniversitySerializer, BranchSerializer, YearSerializer, SemesterSerializer,
                          SubjectSerializer, SubjectDetailSerializer, SubjectUnitSerializer,
                          BTechStudyMaterialSerializer, BTechPYQSerializer, BTechQuestionPaperSerializer,
                          BTechVideoLectureSerializer, BTechImpQuestionSerializer, BTechLabManualSerializer,
                          JobSerializer, InternshipSerializer, PlacementMaterialSerializer,
                          CodingLanguageSerializer, CodingTopicSerializer, CodingProblemSerializer,
                          BadgeSerializer, UserBadgeSerializer)


def _is_admin(user):
    return (user.is_superuser or user.is_staff or
            getattr(getattr(user, "role", None), "key", None) in
            ("super_admin", "admin", "content_manager"))


class StudyMaterialViewSet(viewsets.ModelViewSet):
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category", "class_level", "subject", "is_active"]
    search_fields = ["title", "subject", "description"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not _is_admin(self.request.user):
            qs = qs.filter(is_active=True)
        return qs


class PYQPaperViewSet(viewsets.ModelViewSet):
    queryset = PYQPaper.objects.all()
    serializer_class = PYQPaperSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["class_level", "subject", "is_free", "is_active"]
    search_fields = ["title", "subject", "year"]

    def get_queryset(self):
        qs = super().get_queryset()
        # Students only see active papers; admin sees all
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class YouTubeSubjectViewSet(viewsets.ModelViewSet):
    queryset = YouTubeSubject.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["class_level", "is_active", "subject_id"]

    def get_serializer_class(self):
        if self.action == "list":
            return YouTubeSubjectListSerializer
        return YouTubeSubjectSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class YouTubeChapterViewSet(viewsets.ModelViewSet):
    queryset = YouTubeChapter.objects.select_related("subject").prefetch_related("videos")
    serializer_class = YouTubeChapterSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["subject", "is_active"]


class YouTubeVideoViewSet(viewsets.ModelViewSet):
    queryset = YouTubeVideo.objects.select_related("chapter")
    serializer_class = YouTubeVideoSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["chapter", "is_active"]


class SocialLinkViewSet(viewsets.ModelViewSet):
    queryset = SocialLink.objects.all()
    serializer_class = SocialLinkSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["platform", "is_active"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class ImpQuestionSubjectViewSet(viewsets.ModelViewSet):
    queryset = ImpQuestionSubject.objects.all()
    serializer_class = ImpQuestionSubjectSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["class_level", "is_active"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class ImpQuestionChapterViewSet(viewsets.ModelViewSet):
    queryset = ImpQuestionChapter.objects.all()
    serializer_class = ImpQuestionChapterSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["subject", "is_active"]

    def get_queryset(self):
        qs = super().get_queryset().select_related("subject")
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class ImpQuestionPDFViewSet(viewsets.ModelViewSet):
    queryset = ImpQuestionPDF.objects.all()
    serializer_class = ImpQuestionPDFSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["chapter", "is_free", "is_active"]
    parser_classes = [FormParser, JSONParser, MultiPartParser]

    def get_queryset(self):
        qs = super().get_queryset().select_related("chapter__subject")
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class HandwrittenNotesSubjectViewSet(viewsets.ModelViewSet):
    queryset = HandwrittenNotesSubject.objects.all()
    serializer_class = HandwrittenNotesSubjectSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["class_level", "is_active"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class HandwrittenNotesChapterViewSet(viewsets.ModelViewSet):
    queryset = HandwrittenNotesChapter.objects.all()
    serializer_class = HandwrittenNotesChapterSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["subject", "is_active"]

    def get_queryset(self):
        qs = super().get_queryset().select_related("subject")
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class HandwrittenNotesPDFViewSet(viewsets.ModelViewSet):
    queryset = HandwrittenNotesPDF.objects.all()
    serializer_class = HandwrittenNotesPDFSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["chapter", "is_free", "is_active"]
    parser_classes = [FormParser, JSONParser, MultiPartParser]

    def get_queryset(self):
        qs = super().get_queryset().select_related("chapter__subject")
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class DashboardCountsView(APIView):
    """
    Returns exact counts for all 12 student dashboard cards,
    filtered strictly by the selected class_level (e.g. 'Class 10', 'Class 12', etc.).
    Shows accurate 0 when no data exists for that class instead of showing fallbacks from other classes.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        import re
        class_level_raw = request.query_params.get("class_level", "Class 10").strip()
        num_match = re.search(r"\d+", class_level_raw)
        class_num = num_match.group(0) if num_match else "10"
        norm_class_level = f"Class {class_num}"

        # 1. Paid & Free Courses
        all_courses = Course.objects.filter(is_published=True)
        def filter_courses(is_free):
            qs = all_courses.filter(is_free=is_free)
            matched = []
            for c in qs:
                tags = [str(t).lower() for t in (c.tags or [])]
                if not tags:
                    matched.append(c.id)
                    continue
                tag_match = any(f"class-{class_num}" in t or f"class {class_num}" in t or t == f"class{class_num}" for t in tags)
                title_match = f"class {class_num}" in c.title.lower() or f"class-{class_num}" in c.title.lower()
                if tag_match or title_match:
                    matched.append(c.id)
            return len(matched)

        paid_courses = filter_courses(is_free=False)
        free_courses = filter_courses(is_free=True)

        # 2. Study Materials (NCERT, Paid Test, Paid Notes, Free Notes, Free Test)
        materials_qs = StudyMaterial.objects.filter(is_active=True)
        class_materials = materials_qs.filter(
            models.Q(class_level=norm_class_level) |
            models.Q(class_level=f"CLASS {class_num}th") |
            models.Q(class_level="All Subjects")
        )

        def get_mat_count(cat):
            return class_materials.filter(category=cat).count()

        ncert = get_mat_count("ncert")
        paid_test = get_mat_count("paid-test")
        paid_notes = get_mat_count("paid-notes")
        free_notes = get_mat_count("free-notes")
        free_test = get_mat_count("free-test")

        # 3. Live Classes
        live = Course.objects.filter(is_published=True, tags__icontains="live").count()

        # 4. Social Links
        social = SocialLink.objects.filter(is_active=True).count()

        # 5. PYQ Papers
        pyq_qs = PYQPaper.objects.filter(is_active=True)
        pyq_cnt = pyq_qs.filter(
            models.Q(class_level=norm_class_level) |
            models.Q(class_level=f"CLASS {class_num}th") |
            models.Q(class_level="All Subjects")
        ).count()

        # 6. YouTube Total Videos (filtered strictly by class)
        yt_qs = YouTubeVideo.objects.filter(is_active=True)
        yt_cnt = yt_qs.filter(chapter__subject__class_level=norm_class_level).count()

        # 7. Quizzes (filtered strictly by class)
        quiz_qs = Quiz.objects.filter(is_published=True)
        quiz_cnt = quiz_qs.filter(class_level=norm_class_level).count()

        return Response({
            "paid": paid_courses,
            "free": free_courses,
            "ncert": ncert,
            "tests": paid_test + free_test,
            "paid-test": paid_test,
            "paid-notes": paid_notes,
            "free-notes": free_notes,
            "free-test": free_test,
            "live": live,
            "social": social,
            "pyq": pyq_cnt,
            "youtube": yt_cnt,
            "quizzes": quiz_cnt,
            "imp_questions": ImpQuestionSubject.objects.filter(is_active=True, class_level=norm_class_level).count(),
            "handwritten_notes": HandwrittenNotesSubject.objects.filter(is_active=True, class_level=norm_class_level).count(),
        })

# =============================================================================
# B.TECH ECOSYSTEM VIEWSETS
# =============================================================================

class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["is_active"]
    search_fields = ["name", "code", "state"]


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.select_related("university").all()
    serializer_class = BranchSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["university", "is_active", "code"]
    search_fields = ["name", "code", "short_name"]


class YearViewSet(viewsets.ModelViewSet):
    queryset = Year.objects.select_related("branch__university").all()
    serializer_class = YearSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["branch", "number", "is_active"]


class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.select_related("year__branch__university").all()
    serializer_class = SemesterSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["year", "number", "is_active"]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.select_related(
        "semester__year__branch__university"
    ).prefetch_related("units").all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["semester", "semester__year__branch", "semester__year__branch__university",
                        "category", "is_active"]
    search_fields = ["name", "code", "short_name", "description"]
    ordering_fields = ["code", "name", "created_at"]
    ordering = ["semester__year__branch__university", "semester__year", "semester__number", "sort_order"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return SubjectDetailSerializer
        return SubjectSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class SubjectUnitViewSet(viewsets.ModelViewSet):
    queryset = SubjectUnit.objects.select_related("subject").all()
    serializer_class = SubjectUnitSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["subject", "number"]


class BTechStudyMaterialViewSet(viewsets.ModelViewSet):
    queryset = BTechStudyMaterial.objects.select_related("subject", "unit").all()
    serializer_class = BTechStudyMaterialSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["subject", "unit", "category", "is_free", "is_premium", "is_active"]
    search_fields = ["title", "description", "subject__name", "subject__code"]
    parser_classes = [FormParser, JSONParser, MultiPartParser]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class BTechPYQViewSet(viewsets.ModelViewSet):
    queryset = BTechPYQ.objects.select_related("subject", "university").all()
    serializer_class = BTechPYQSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["subject", "university", "exam_year", "exam_type", "semester", "is_free", "is_active"]
    search_fields = ["title", "subject__name", "subject__code", "exam_year"]
    parser_classes = [FormParser, JSONParser, MultiPartParser]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class BTechQuestionPaperViewSet(viewsets.ModelViewSet):
    queryset = BTechQuestionPaper.objects.select_related("subject", "university").all()
    serializer_class = BTechQuestionPaperSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["subject", "university", "paper_type", "is_free", "is_active"]
    search_fields = ["title", "description", "subject__name", "subject__code"]
    parser_classes = [FormParser, JSONParser, MultiPartParser]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class BTechVideoLectureViewSet(viewsets.ModelViewSet):
    queryset = BTechVideoLecture.objects.select_related("subject", "unit").all()
    serializer_class = BTechVideoLectureSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["subject", "unit", "provider", "is_free", "is_active"]
    search_fields = ["title", "description", "subject__name", "subject__code", "channel"]
    parser_classes = [FormParser, JSONParser, MultiPartParser]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class BTechImpQuestionViewSet(viewsets.ModelViewSet):
    queryset = BTechImpQuestion.objects.select_related("subject", "unit").all()
    serializer_class = BTechImpQuestionSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["subject", "unit", "difficulty", "is_active"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


class BTechLabManualViewSet(viewsets.ModelViewSet):
    queryset = BTechLabManual.objects.select_related("subject").all()
    serializer_class = BTechLabManualSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["subject", "is_free", "is_active"]
    search_fields = ["title", "description", "subject__name", "subject__code"]
    parser_classes = [FormParser, JSONParser, MultiPartParser]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


# Career & Placement ViewSets
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.select_related("posted_by").all()
    serializer_class = JobSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["job_type", "is_active", "is_featured"]
    search_fields = ["company", "job_title", "location", "skills_required"]
    ordering = ["-created_at"]


class InternshipViewSet(viewsets.ModelViewSet):
    queryset = Internship.objects.select_related("posted_by").all()
    serializer_class = InternshipSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["is_active", "is_featured"]
    search_fields = ["company", "title", "location", "skills_required"]
    ordering = ["-created_at"]


class PlacementMaterialViewSet(viewsets.ModelViewSet):
    queryset = PlacementMaterial.objects.all()
    serializer_class = PlacementMaterialSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category", "difficulty", "is_free", "is_active"]
    search_fields = ["title", "description", "tags"]
    parser_classes = [FormParser, JSONParser, MultiPartParser]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_admin = (user.is_superuser or user.is_staff or
                    getattr(getattr(user, "role", None), "key", None) in
                    ("super_admin", "admin", "content_manager"))
        if not is_admin:
            qs = qs.filter(is_active=True)
        return qs


# Coding Hub ViewSets
class CodingLanguageViewSet(viewsets.ModelViewSet):
    queryset = CodingLanguage.objects.all()
    serializer_class = CodingLanguageSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_active"]


class CodingTopicViewSet(viewsets.ModelViewSet):
    queryset = CodingTopic.objects.select_related("language").all()
    serializer_class = CodingTopicSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["language", "difficulty", "is_active"]


class CodingProblemViewSet(viewsets.ModelViewSet):
    queryset = CodingProblem.objects.select_related("topic__language").all()
    serializer_class = CodingProblemSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["topic", "difficulty", "is_active", "is_premium"]
    search_fields = ["title", "description", "tags"]


# Gamification ViewSets
class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_active"]


class UserBadgeViewSet(viewsets.ModelViewSet):
    queryset = UserBadge.objects.select_related("user", "badge").all()
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["user", "badge"]
