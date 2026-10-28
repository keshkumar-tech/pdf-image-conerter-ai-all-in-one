"""Entitlement + payment-flow tests."""
from django.test import TestCase

from apps.courses.models import Category, Course, PricingPlan
from apps.payments.models import Entitlement, Order
from apps.payments.services import apply_coupon, grant_entitlement, has_course_entitlement
from apps.users.models import Role, User


class EntitlementTests(TestCase):
    def setUp(self):
        self.role = Role.objects.create(key="student", label="Student", permissions=[])
        self.user = User.objects.create_user(
            username="stud", email="stud@example.com", password="Passw0rd!23", role=self.role
        )
        self.category = Category.objects.create(name="Backend", slug="backend")
        self.plan = PricingPlan.objects.create(name="Starter", price=499, currency="INR")
        self.course = Course.objects.create(
            title="Django REST API", category=self.category, is_free=False,
            pricing_plan=self.plan, is_published=True,
        )

    def test_no_entitlement_means_no_access(self):
        self.assertFalse(has_course_entitlement(self.user, self.course))

    def test_granting_entitlement_unlocks_access(self):
        grant_entitlement(self.user, self.course, reason="purchase")
        self.assertTrue(has_course_entitlement(self.user, self.course))

    def test_free_course_always_accessible(self):
        free_course = Course.objects.create(title="JavaScript", category=self.category, is_free=True)
        self.assertTrue(has_course_entitlement(self.user, free_course))
