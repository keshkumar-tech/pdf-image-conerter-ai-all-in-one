"""Quiz grading + streak tests."""
from django.test import TestCase

from apps.courses.models import Category, Course, Lesson, Module
from apps.learning.models import Quiz, QuizAttempt, QuizOption, QuizQuestion
from apps.learning.services import grade_quiz_attempt
from apps.users.models import Role, User


class QuizGradingTests(TestCase):
    def setUp(self):
        role = Role.objects.create(key="student", label="Student", permissions=[])
        self.user = User.objects.create_user(
            username="quizzer", email="quizzer@example.com", password="Passw0rd!23", role=role
        )
        category = Category.objects.create(name="Python", slug="python")
        course = Course.objects.create(title="Python Basics", category=category, is_free=True)
        module = Module.objects.create(course=course, title="Intro")
        lesson = Lesson.objects.create(module=module, title="Quiz 1", lesson_type="quiz")
        self.quiz = Quiz.objects.create(lesson=lesson, title="Quiz 1", passing_score_percent=50)
        self.q1 = QuizQuestion.objects.create(quiz=self.quiz, prompt="1+1=?", question_type="mcq")
        self.correct = QuizOption.objects.create(question=self.q1, text="2", is_correct=True)
        QuizOption.objects.create(question=self.q1, text="3", is_correct=False)

    def test_correct_answer_passes(self):
        attempt = QuizAttempt.objects.create(
            quiz=self.quiz, user=self.user, answers={str(self.q1.id): [str(self.correct.id)]}
        )
        grade_quiz_attempt(attempt)
        self.assertTrue(attempt.passed)
        self.assertEqual(attempt.score_percent, 100)
        self.assertEqual(attempt.correct_answers, 1)
        self.assertEqual(attempt.incorrect_answers, 0)
        self.assertEqual(attempt.unattempted_questions, 0)

    def test_incorrect_answer_fails(self):
        attempt = QuizAttempt.objects.create(
            quiz=self.quiz, user=self.user, answers={str(self.q1.id): ["wrong_id"]}
        )
        grade_quiz_attempt(attempt)
        self.assertFalse(attempt.passed)
        self.assertEqual(attempt.score_percent, 0)
        self.assertEqual(attempt.correct_answers, 0)
        self.assertEqual(attempt.incorrect_answers, 1)
        self.assertEqual(attempt.unattempted_questions, 0)

    def test_unattempted_question(self):
        attempt = QuizAttempt.objects.create(
            quiz=self.quiz, user=self.user, answers={}
        )
        grade_quiz_attempt(attempt)
        self.assertFalse(attempt.passed)
        self.assertEqual(attempt.correct_answers, 0)
        self.assertEqual(attempt.unattempted_questions, 1)
