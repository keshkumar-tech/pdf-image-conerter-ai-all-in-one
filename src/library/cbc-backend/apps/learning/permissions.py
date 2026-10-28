from rest_framework.permissions import BasePermission

from apps.payments.services import has_course_entitlement


class HasLessonAccess(BasePermission):
    """Free-preview lessons are open; otherwise the user must hold an
    entitlement for the parent course (never a plain frontend price check)."""

    def has_object_permission(self, request, view, obj):
        lesson = getattr(obj, "lesson", obj)
        if getattr(lesson, "is_free_preview", False):
            return True
        course = lesson.module.course
        if course.is_free:
            return True
        return has_course_entitlement(request.user, course)
