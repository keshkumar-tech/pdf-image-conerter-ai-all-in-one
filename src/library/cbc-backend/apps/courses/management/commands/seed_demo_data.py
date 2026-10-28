"""
Seed Concept Builder Classes demo data — Class 9th to 12th UP Board batches only.

Run: python manage.py seed_demo_data
"""
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.certificates.models import Certificate
from apps.certificates.services import generate_certificate_number
from apps.courses.models import Category, Course, Lesson, Module, PricingPlan
from apps.learning.models import (Enrollment, LessonProgress, Quiz,
                                   QuizOption, QuizQuestion)
from apps.payments.models import Entitlement, Order
from apps.users.models import Profile, Role, User

# title, class_slug, is_free, tags, (mrp, sale) for paid
DEMO_COURSES = [
    # Class 9
    ("CHIRAG BATCH 2026-27", "class-9", False, ["class-9", "batch", "up-board"], (Decimal("2000"), Decimal("899"))),
    ("Class 9 Science (Free Demo)", "class-9", True, ["class-9", "science", "free"], None),
    ("Class 9 Maths Notes", "class-9", True, ["class-9", "maths", "notes"], None),
    # Class 10
    ("SHAKTI BATCH 2026-27", "class-10", False, ["class-10", "batch", "up-board"], (Decimal("3000"), Decimal("1499"))),
    ("ANTIM BATCH 2026-27", "class-10", False, ["class-10", "batch", "up-board"], (Decimal("1500"), Decimal("799"))),
    ("Class 10 Model Papers (Free)", "class-10", True, ["class-10", "model-papers", "free"], None),
    # Class 11
    ("Class 11 Maths", "class-11", False, ["class-11", "maths", "hindi-medium"], (Decimal("1000"), Decimal("499"))),
    ("Class 11 English", "class-11", False, ["class-11", "english", "hindi-medium"], (Decimal("1000"), Decimal("499"))),
    ("Class 11 Physics", "class-11", False, ["class-11", "physics", "hindi-medium"], (Decimal("1200"), Decimal("599"))),
    ("Class 11 Chemistry (Free Notes)", "class-11", True, ["class-11", "chemistry", "free"], None),
    # Class 12
    ("Class 12 Maths (VOD)", "class-12", False, ["class-12", "maths", "vod"], (Decimal("1000"), Decimal("249"))),
    ("Class 12 English", "class-12", False, ["class-12", "english", "hindi-medium"], (Decimal("1000"), Decimal("499"))),
    ("Class 12 Physics", "class-12", False, ["class-12", "physics", "hindi-medium"], (Decimal("1200"), Decimal("599"))),
    ("Class 12 Biology (Free Demo)", "class-12", True, ["class-12", "biology", "free"], None),
]

CLASS_CATEGORIES = [
    ("class-9", "Class 9th"),
    ("class-10", "Class 10th"),
    ("class-11", "Class 11th"),
    ("class-12", "Class 12th"),
]

DESCRIPTION_TEMPLATE = """Complete UP Board batch for {title}.
Live classes, recorded lectures, chapter-wise notes, tests and model papers included."""


class Command(BaseCommand):
    help = "Seed Concept Builder Classes — Class 9th to 12th batches only"

    def handle(self, *args, **options):
        self.stdout.write("Removing old non-academic courses...")
        keep_titles = {row[0] for row in DEMO_COURSES}
        removed = Course.objects.exclude(title__in=keep_titles).update(is_deleted=True)
        self.stdout.write(f"  Soft-deleted {removed} old courses.")

        self.stdout.write("Seeding roles...")
        roles = {}
        for key, label in Role.ROLE_CHOICES:
            roles[key], _ = Role.objects.get_or_create(
                key=key, defaults={"label": label, "permissions": ["*"] if key == "super_admin" else []}
            )

        self.stdout.write("Seeding admin user...")
        admin, created = User.objects.get_or_create(
            email="admin@codingwithkesh.com",
            defaults={"username": "admin", "role": roles["super_admin"], "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("Admin@12345")
            admin.save()
            Profile.objects.create(user=admin)

        self.stdout.write("Seeding class categories...")
        categories = {}
        for slug, name in CLASS_CATEGORIES:
            categories[slug], _ = Category.objects.update_or_create(
                slug=slug, defaults={"name": name}
            )

        self.stdout.write("Seeding courses...")
        courses = []
        for title, class_slug, is_free, tags, pricing in DEMO_COURSES:
            plan = None
            if not is_free and pricing:
                mrp, sale = pricing
                plan, _ = PricingPlan.objects.update_or_create(
                    name=f"{title} Plan",
                    defaults={
                        "price": mrp,
                        "discount_price": sale,
                        "currency": "INR",
                        "features": ["Live batch", "Recorded lectures", "Notes & tests", "Model papers"],
                    },
                )

            course, _ = Course.objects.update_or_create(
                title=title,
                defaults={
                    "category": categories[class_slug],
                    "is_free": is_free,
                    "pricing_plan": plan,
                    "is_published": True,
                    "is_deleted": False,
                    "short_description": f"UP Board {title} — Hindi Medium",
                    "description": DESCRIPTION_TEMPLATE.format(title=title),
                    "instructor_name": "Concept Builder Faculty",
                    "language": "Hindi",
                    "level": "beginner",
                    "tags": tags,
                    "learning_outcomes": [
                        "📌 OFFER लागू",
                        "🔴 Live Batch",
                        "🎥 Recording Available (if you miss the Class)",
                        "📝 Chapter Wise Notes",
                        "📊 Chapter Wise Test",
                        "📄 Panel Pdf",
                        "💸 Model Paper Solution",
                    ],
                    "students_count": 1200,
                    "rating_average": Decimal("4.80"),
                    "duration_minutes": 1800,
                },
            )
            if not is_free and plan:
                course.pricing_plan = plan
                course.save(update_fields=["pricing_plan"])
            courses.append(course)

            if not Module.objects.filter(course=course).exists():
                module = Module.objects.create(course=course, title="Batch Content", order=1)
                Lesson.objects.create(
                    module=module, title=f"Introduction — {title}",
                    lesson_type="video", order=1, is_free_preview=True, duration_minutes=45,
                )
                Lesson.objects.create(module=module, title="Chapter 1 Notes", lesson_type="pdf", order=2)
                quiz_lesson = Lesson.objects.create(
                    module=module, title="Chapter 1 Test", lesson_type="quiz", order=3,
                )
                quiz = Quiz.objects.create(lesson=quiz_lesson, title="Chapter 1 Quiz")
                q = QuizQuestion.objects.create(
                    quiz=quiz, prompt="Which board is this batch for?",
                    question_type="mcq", order=1,
                )
                QuizOption.objects.create(question=q, text="UP Board", is_correct=True, order=1)
                QuizOption.objects.create(question=q, text="CBSE", is_correct=False, order=2)

        self.stdout.write("Seeding demo students...")
        students = []
        for i in range(1, 6):
            student, created = User.objects.get_or_create(
                email=f"student{i}@example.com",
                defaults={"username": f"student{i}", "role": roles["student"]},
            )
            if created:
                student.set_password("Student@123")
                student.save()
                Profile.objects.create(user=student)
            if i == 1 and not student.phone:
                student.phone = "9876543210"
                student.save(update_fields=["phone"])
            students.append(student)

        self.stdout.write("Seeding enrollments...")
        free_course = next(c for c in courses if c.is_free)
        premium_course = next(c for c in courses if c.title.startswith("SHAKTI"))
        plan = premium_course.pricing_plan

        for student in students:
            Enrollment.objects.get_or_create(user=student, course=free_course, defaults={"source": "app"})
            lesson = free_course.modules.first().lessons.first()
            if lesson:
                LessonProgress.objects.get_or_create(
                    user=student, lesson=lesson,
                    defaults={"is_completed": True, "completed_at": timezone.now()},
                )

        paying_student = students[0]
        order, _ = Order.objects.get_or_create(
            user=paying_student, course=premium_course, pricing_plan=plan,
            defaults={
                "amount": plan.discount_price or plan.price,
                "currency": "INR",
                "status": "success",
                "provider": "razorpay",
            },
        )
        Entitlement.objects.get_or_create(
            user=paying_student, course=premium_course,
            defaults={"order": order, "granted_reason": "purchase"},
        )
        Enrollment.objects.get_or_create(
            user=paying_student, course=premium_course,
            defaults={"source": "app"},
        )
        Certificate.objects.get_or_create(
            user=paying_student, course=premium_course,
            defaults={"certificate_number": generate_certificate_number(premium_course)},
        )

        published = Course.objects.filter(is_deleted=False, is_published=True).count()
        self.stdout.write(self.style.SUCCESS(
            f"Done — {published} published courses (Class 9–12 only), "
            f"{User.objects.count()} users."
        ))
