# Seed one NCERT book so student side shows content immediately
from django.db import migrations


NCERT_BOOKS = [
    {
        "title": "NCERT Mathematics — Class 10 (Full Book)",
        "subject": "Mathematics",
        "description": "Official NCERT Class 10 Mathematics textbook PDF.",
        "file_url": "https://ncert.nic.in/textbook/pdf/jemh101.pdf",
    },
    {
        "title": "NCERT Science — Class 10 (Full Book)",
        "subject": "Science",
        "description": "Official NCERT Class 10 Science textbook PDF.",
        "file_url": "https://ncert.nic.in/textbook/pdf/jesc101.pdf",
    },
    {
        "title": "NCERT Contemporary India (Geography) — Class 10",
        "subject": "Social Science",
        "description": "Official NCERT Class 10 Geography textbook PDF.",
        "file_url": "https://ncert.nic.in/textbook/pdf/jess101.pdf",
    },
    {
        "title": "NCERT India and the Contemporary World (History) — Class 10",
        "subject": "Social Science",
        "description": "Official NCERT Class 10 History textbook PDF.",
        "file_url": "https://ncert.nic.in/textbook/pdf/jess103.pdf",
    },
    {
        "title": "NCERT First Flight (English) — Class 10",
        "subject": "English",
        "description": "Official NCERT Class 10 English reader PDF.",
        "file_url": "https://ncert.nic.in/textbook/pdf/jefp101.pdf",
    },
    {
        "title": "NCERT Kshitij (Hindi) — Class 10",
        "subject": "Hindi",
        "description": "Official NCERT Class 10 Hindi textbook PDF.",
        "file_url": "https://ncert.nic.in/textbook/pdf/jhsk101.pdf",
    },
]


def seed_ncert_book(apps, schema_editor):
    StudyMaterial = apps.get_model("content", "StudyMaterial")
    for i, book in enumerate(NCERT_BOOKS):
        if not StudyMaterial.objects.filter(title=book["title"]).exists():
            StudyMaterial.objects.create(
                title=book["title"],
                category="ncert",
                subject=book["subject"],
                class_level="Class 10",
                description=book["description"],
                file_url=book["file_url"],
                sort_order=i,
                is_active=True,
            )


def unseed(apps, schema_editor):
    StudyMaterial = apps.get_model("content", "StudyMaterial")
    StudyMaterial.objects.filter(
        title__in=[b["title"] for b in NCERT_BOOKS]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0002_studymaterial_pyqpaper_pdf_file"),
    ]

    operations = [
        migrations.RunPython(seed_ncert_book, unseed),
    ]
