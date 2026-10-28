from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (DashboardCountsView, FAQViewSet, HandwrittenNotesChapterViewSet,
                     HandwrittenNotesPDFViewSet, HandwrittenNotesSubjectViewSet,
                     ImpQuestionChapterViewSet, ImpQuestionPDFViewSet, ImpQuestionSubjectViewSet,
                     PYQPaperViewSet, SocialLinkViewSet, StudyMaterialViewSet,
                     YouTubeChapterViewSet, YouTubeSubjectViewSet,
                     YouTubeVideoViewSet,
                     UniversityViewSet, BranchViewSet, YearViewSet, SemesterViewSet,
                     SubjectViewSet, SubjectUnitViewSet,
                     BTechStudyMaterialViewSet, BTechPYQViewSet, BTechQuestionPaperViewSet,
                     BTechVideoLectureViewSet, BTechImpQuestionViewSet, BTechLabManualViewSet,
                     JobViewSet, InternshipViewSet, PlacementMaterialViewSet,
                     CodingLanguageViewSet, CodingTopicViewSet, CodingProblemViewSet,
                     BadgeViewSet, UserBadgeViewSet)

router = DefaultRouter()
# Existing Class 9-12 routes
router.register("pyq",               PYQPaperViewSet,       basename="pyq")
router.register("materials",         StudyMaterialViewSet,  basename="material")
router.register("youtube-subjects",  YouTubeSubjectViewSet, basename="youtube-subject")
router.register("youtube-chapters",  YouTubeChapterViewSet, basename="youtube-chapter")
router.register("youtube-videos",    YouTubeVideoViewSet,   basename="youtube-video")
router.register("social-links",      SocialLinkViewSet,     basename="social-link")
router.register("faqs",              FAQViewSet,            basename="faq")
router.register("imp-questions",     ImpQuestionSubjectViewSet, basename="imp-question")
router.register("imp-question-chapters", ImpQuestionChapterViewSet, basename="imp-question-chapter")
router.register("imp-question-pdfs", ImpQuestionPDFViewSet, basename="imp-question-pdf")
router.register("handwritten-notes", HandwrittenNotesSubjectViewSet, basename="handwritten-note")
router.register("handwritten-note-chapters", HandwrittenNotesChapterViewSet, basename="handwritten-note-chapter")
router.register("handwritten-note-pdfs", HandwrittenNotesPDFViewSet, basename="handwritten-note-pdf")

# B.Tech Ecosystem routes
router.register("btech/universities",      UniversityViewSet,      basename="btech-university")
router.register("btech/branches",          BranchViewSet,          basename="btech-branch")
router.register("btech/years",             YearViewSet,            basename="btech-year")
router.register("btech/semesters",         SemesterViewSet,        basename="btech-semester")
router.register("btech/subjects",          SubjectViewSet,         basename="btech-subject")
router.register("btech/subject-units",     SubjectUnitViewSet,     basename="btech-subject-unit")
router.register("btech/materials",         BTechStudyMaterialViewSet, basename="btech-material")
router.register("btech/pyq",               BTechPYQViewSet,        basename="btech-pyq")
router.register("btech/question-papers",   BTechQuestionPaperViewSet, basename="btech-question-paper")
router.register("btech/video-lectures",    BTechVideoLectureViewSet, basename="btech-video-lecture")
router.register("btech/imp-questions",     BTechImpQuestionViewSet, basename="btech-imp-question")
router.register("btech/lab-manuals",       BTechLabManualViewSet,  basename="btech-lab-manual")

# Career & Placement
router.register("btech/jobs",              JobViewSet,             basename="btech-job")
router.register("btech/internships",       InternshipViewSet,      basename="btech-internship")
router.register("btech/placement-material", PlacementMaterialViewSet, basename="btech-placement-material")

# Coding Hub
router.register("btech/coding/languages",  CodingLanguageViewSet,  basename="btech-coding-language")
router.register("btech/coding/topics",     CodingTopicViewSet,     basename="btech-coding-topic")
router.register("btech/coding/problems",   CodingProblemViewSet,   basename="btech-coding-problem")

# Gamification
router.register("btech/badges",            BadgeViewSet,           basename="btech-badge")
router.register("btech/user-badges",       UserBadgeViewSet,       basename="btech-user-badge")

urlpatterns = [
    path("dashboard-counts/", DashboardCountsView.as_view(), name="dashboard-counts"),
] + router.urls
