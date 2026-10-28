from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Certificate
        fields = ["id", "certificate_number", "user", "course", "course_title",
                  "issued_at", "pdf_url", "qr_code_url"]
        read_only_fields = ["certificate_number", "issued_at", "pdf_url", "qr_code_url"]


class CertificateVerifyResponseSerializer(serializers.Serializer):
    is_valid = serializers.BooleanField()
    certificate_number = serializers.CharField(required=False)
    student_name = serializers.CharField(required=False)
    course_title = serializers.CharField(required=False)
    issued_at = serializers.DateTimeField(required=False)
