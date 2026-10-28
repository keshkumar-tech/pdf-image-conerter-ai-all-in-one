"""
Database-backed media storage for uploaded PDFs.

Render's free web services have an *ephemeral* filesystem: anything written
to MEDIA_ROOT (uploaded PDFs) is wiped on every restart or redeploy. The
Postgres database, however, persists. Storing PDF bytes in the database keeps
uploads alive across deploys/restarts, which is required for the NCERT/PYQ and
material PDF features to work reliably in production.

Only the PDF FileFields (PYQPaper.pdf_file, StudyMaterial.file) are pointed at
this storage. Course images/videos keep the default FileSystemStorage.
"""
import mimetypes
from pathlib import PurePosixPath

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.http import Http404, HttpResponse
from django.utils.deconstruct import deconstructible


@deconstructible
class DatabaseStorage(Storage):
    """Stores file bytes in ``apps.content.StoredFile`` rows."""

    def _open(self, name, mode="rb"):
        from .models import StoredFile

        obj = StoredFile.objects.filter(name=name).first()
        if obj is None:
            raise FileNotFoundError(f"No database-stored file: {name}")
        return ContentFile(obj.data)

    def _save(self, name, content):
        from .models import StoredFile

        data = content.read()
        StoredFile.objects.update_or_create(
            name=name, defaults={"data": data, "size": len(data)}
        )
        return name

    def exists(self, name):
        from .models import StoredFile

        return StoredFile.objects.filter(name=name).exists()

    def size(self, name):
        from .models import StoredFile

        obj = StoredFile.objects.filter(name=name).first()
        return obj.size if obj else 0

    def delete(self, name):
        from .models import StoredFile

        StoredFile.objects.filter(name=name).delete()

    def url(self, name):
        return f"{settings.MEDIA_URL.rstrip('/')}/{name}"


def serve_db_media(request, path):
    """Serve ``/media/<path>`` from DatabaseStorage, falling back to disk.

    Keeps course images/videos (stored on the filesystem) working while PDFs
    that live in the database get served inline with the right content type.
    """
    from .models import StoredFile

    obj = StoredFile.objects.filter(name=path).first()
    if obj is not None:
        content_type, _ = mimetypes.guess_type(path)
        response = HttpResponse(
            obj.data, content_type=content_type or "application/octet-stream"
        )
        response["Content-Disposition"] = (
            f'inline; filename="{PurePosixPath(path).name}"'
        )
        return response

    from django.views.static import serve

    try:
        return serve(request, path, document_root=settings.MEDIA_ROOT)
    except Http404:
        raise Http404(f"Media file not found: {path}")