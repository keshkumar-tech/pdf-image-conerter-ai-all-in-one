"""Consistent API error envelope for 401/403/404/422/429/500 responses."""
from rest_framework.views import exception_handler


def standard_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {
            "error": {
                "status_code": response.status_code,
                "detail": response.data,
            }
        }
    return response
