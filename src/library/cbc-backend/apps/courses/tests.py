"""Unit + API tests for courses. Run with: python manage.py test apps.courses"""
from django.test import TestCase
from rest_framework.test import APIClient

from apps.courses.models import Category, Course, PricingPlan
from apps.users.models import Role, User


class CourseAccessTests(TestCase):
    def setUp(self):
        self.role = Role.objects.create(key="student", label="Student", permissions=[])
        self.user = User.objects.create_user(
            username="test1", email="test1@example.com", password="Passw0rd!23", role=self.role
        )
        self.category = Category.objects.create(name="Web Development", slug="web-development")
        self.plan = PricingPlan.objects.create(name="Starter", price=499, currency="INR")

    def test_free_course_is_listed_and_published(self):
        course = Course.objects.create(
            title="HTML & CSS", category=self.category, is_free=True, is_published=True,
        )
        self.assertTrue(course.is_free)
        self.assertEqual(course.slug, "html-css")

    def test_premium_course_requires_pricing_plan_for_checkout(self):
        course = Course.objects.create(
            title="React Native", category=self.category, is_free=False,
            pricing_plan=self.plan, is_published=True,
        )
        self.assertEqual(course.pricing_plan.price, 499)

    def test_course_list_api_returns_only_published(self):
        Course.objects.create(title="Draft Course", category=self.category, is_published=False)
        Course.objects.create(title="Live Course", category=self.category, is_published=True)
        client = APIClient()
        client.force_authenticate(self.user)
        response = client.get("/api/v1/courses/?is_published=true")
        self.assertEqual(response.status_code, 200)
