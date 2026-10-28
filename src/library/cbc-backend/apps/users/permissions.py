from rest_framework.permissions import BasePermission


class IsAdminOrSuperAdmin(BasePermission):
    """Allow access only to staff / superadmin / admin-role users."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        role_key = getattr(getattr(request.user, "role", None), "key", None)
        return role_key in ("super_admin", "admin", "content_manager", "finance", "support")


class IsAdminOrReadOnly(BasePermission):
    """Read-only for authenticated users; write access only for admins."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        if request.user.is_superuser or request.user.is_staff:
            return True
        role_key = getattr(getattr(request.user, "role", None), "key", None)
        return role_key in ("super_admin", "admin", "content_manager")


class AllowAuthenticatedRead(BasePermission):
    """Public read access for GET/HEAD/OPTIONS; authenticated required for writes."""

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return request.user and request.user.is_authenticated
