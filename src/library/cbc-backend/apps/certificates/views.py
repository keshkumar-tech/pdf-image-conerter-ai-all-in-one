from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Certificate, CertificateVerification
from .serializers import CertificateSerializer, CertificateVerifyResponseSerializer
from .services import issue_certificate


class CertificateViewSet(viewsets.ModelViewSet):
    serializer_class = CertificateSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Certificate.objects.select_related("course", "user")
        if not (user.role and user.role.key != "student"):
            qs = qs.filter(user=user)
        return qs

    @action(detail=False, methods=["post"], url_path="issue")
    def issue(self, request):
        course_id = request.data.get("course_id")
        from apps.courses.models import Course
        course = Course.objects.get(id=course_id)
        certificate = issue_certificate(request.user, course)
        return Response(CertificateSerializer(certificate).data)

    @action(detail=False, methods=["get"], url_path="verify/(?P<number>[^/.]+)",
            permission_classes=[AllowAny])
    def verify(self, request, number=None):
        certificate = Certificate.objects.filter(certificate_number=number).select_related("user", "course").first()
        if not certificate:
            return Response(CertificateVerifyResponseSerializer({"is_valid": False}).data)
        CertificateVerification.objects.create(
            certificate=certificate, ip_address=request.META.get("REMOTE_ADDR")
        )
        payload = {
            "is_valid": True,
            "certificate_number": certificate.certificate_number,
            "student_name": certificate.user.get_full_name() or certificate.user.username,
            "course_title": certificate.course.title,
            "issued_at": certificate.issued_at,
        }
        return Response(CertificateVerifyResponseSerializer(payload).data)
