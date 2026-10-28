from rest_framework.routers import DefaultRouter

from .views import (AchievementViewSet, AssignmentSubmissionViewSet,
                     AssignmentViewSet, EnrollmentViewSet,
                     LessonProgressViewSet, LessonResourceViewSet,
                     MyAchievementsView, ProjectSubmissionViewSet,
                     ProjectViewSet, QuizAttemptViewSet, QuizOptionViewSet,
                     QuizQuestionViewSet, QuizViewSet, RoadmapViewSet,
                     StreakView, VideoViewSet)

router = DefaultRouter()
router.register("videos", VideoViewSet, basename="video")
router.register("resources", LessonResourceViewSet, basename="resource")
router.register("quizzes", QuizViewSet, basename="quiz")
router.register("quiz-questions", QuizQuestionViewSet, basename="quiz-question")
router.register("quiz-options", QuizOptionViewSet, basename="quiz-option")
router.register("quiz-attempts", QuizAttemptViewSet, basename="quiz-attempt")
router.register("assignments", AssignmentViewSet, basename="assignment")
router.register("assignment-submissions", AssignmentSubmissionViewSet, basename="assignment-submission")
router.register("projects", ProjectViewSet, basename="project")
router.register("project-submissions", ProjectSubmissionViewSet, basename="project-submission")
router.register("enrollments", EnrollmentViewSet, basename="enrollment")
router.register("progress", LessonProgressViewSet, basename="progress")
router.register("streak", StreakView, basename="streak")
router.register("achievements", AchievementViewSet, basename="achievement")
router.register("my-achievements", MyAchievementsView, basename="my-achievement")
router.register("roadmaps", RoadmapViewSet, basename="roadmap")

urlpatterns = router.urls
