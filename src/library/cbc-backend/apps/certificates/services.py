import random
import string

from django.utils import timezone


def generate_certificate_number(course) -> str:
    year = timezone.now().year
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"CWK-{year}-{course.slug[:6].upper()}-{suffix}"


def issue_certificate(user, course):
    from apps.learning.models import Enrollment
    from .models import Certificate

    enrollment = Enrollment.objects.filter(user=user, course=course).first()
    if not enrollment or not enrollment.completed_at:
        raise ValueError("Course must be fully completed before issuing a certificate.")

    certificate, created = Certificate.objects.get_or_create(
        user=user, course=course,
        defaults={"certificate_number": generate_certificate_number(course)},
    )
    return certificate
