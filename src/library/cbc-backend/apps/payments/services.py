from django.utils import timezone

from .models import Entitlement


def has_course_entitlement(user, course) -> bool:
    if not user or not user.is_authenticated:
        return False
    if course.is_free:
        return True
    entitlement = Entitlement.objects.filter(user=user, course=course, is_active=True).first()
    if not entitlement:
        return False
    if entitlement.expires_at and entitlement.expires_at < timezone.now():
        return False
    return True


def grant_entitlement(user, course, order=None, reason="purchase", expires_at=None):
    entitlement, _ = Entitlement.objects.update_or_create(
        user=user, course=course,
        defaults={"order": order, "is_active": True, "expires_at": expires_at, "granted_reason": reason},
    )
    from apps.learning.models import Enrollment
    Enrollment.objects.get_or_create(user=user, course=course, defaults={"source": "app"})
    return entitlement


def apply_coupon(coupon, amount):
    if coupon.discount_type == "percent":
        discount = amount * (coupon.discount_value / 100)
    else:
        discount = coupon.discount_value
    return max(amount - discount, 0)
