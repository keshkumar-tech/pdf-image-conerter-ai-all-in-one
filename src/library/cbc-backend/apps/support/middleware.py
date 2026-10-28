"""Writes an AuditLog row for every state-changing admin/API request made
by an authenticated staff user (POST/PUT/PATCH/DELETE)."""


class AuditLogMiddleware:
    WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        try:
            user = getattr(request, "user", None)
            if (
                request.method in self.WRITE_METHODS
                and user is not None
                and getattr(user, "is_authenticated", False)
                and getattr(user, "role", None)
                and user.role.key != "student"
                and 200 <= response.status_code < 300
            ):
                from .models import AuditLog
                AuditLog.objects.create(
                    user=user,
                    action=f"{request.method} {request.path}",
                    ip_address=request.META.get("REMOTE_ADDR"),
                )
        except Exception:
            # Audit logging must never break the actual request.
            pass
        return response
