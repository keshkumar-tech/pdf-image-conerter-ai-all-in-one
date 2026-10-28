import uuid

from django.conf import settings
from django.db import models

from apps.courses.models import Course
from apps.users.models import TimeStampedModel


class Certificate(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    certificate_number = models.CharField(max_length=40, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="certificates")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="certificates")
    issued_at = models.DateTimeField(auto_now_add=True)
    pdf_url = models.URLField(blank=True)
    qr_code_url = models.URLField(blank=True)

    class Meta:
        unique_together = ("user", "course")

    def __str__(self):
        return self.certificate_number


class CertificateVerification(TimeStampedModel):
    certificate = models.ForeignKey(Certificate, on_delete=models.CASCADE, related_name="verifications")
    verified_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
