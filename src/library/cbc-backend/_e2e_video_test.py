# File: backend/_e2e_video_test.py
import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
os.environ["DB_ENGINE"] = "sqlite"
django.setup()

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.courses.models import Course, Module, Lesson, Category
from apps.users.models import User

Course.objects.filter(title="Test Course").delete()
Category.objects.filter(slug="t").delete()

user = User.objects.filter(email="test@example.com").first()
if not user:
    user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")
refresh = RefreshToken.for_user(user)

c = APIClient()
c.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

cat, _ = Category.objects.get_or_create(name="T", slug="t")
course = Course.objects.create(title="Test Course", is_free=True, category=cat)
mod = Module.objects.create(course=course, title="M1")
lesson = Lesson.objects.create(module=mod, title="L1", lesson_type="video")

f = SimpleUploadedFile("lec1.mp4", b"fake-video-bytes", content_type="video/mp4")
r = c.post("/api/v1/videos/", {"lesson": lesson.id, "provider": "self", "video_file": f}, format="multipart")
print("CREATE:", r.status_code)
print("BODY:", r.json())
vid = r.json().get("id")
r2 = c.get(f"/api/v1/videos/{vid}/playback/")
print("PLAYBACK:", r2.status_code, r2.json())

# YouTube flow
lesson2 = Lesson.objects.create(module=mod, title="L2", lesson_type="video")
r3 = c.post(
    "/api/v1/videos/",
    {"lesson": lesson2.id, "provider": "youtube", "youtube_url": "https://www.youtube.com/watch?v=abc123defgh"},
)
print("YT CREATE:", r3.status_code)
vid2 = r3.json().get("id")
r4 = c.get(f"/api/v1/videos/{vid2}/playback/")
print("YT PLAYBACK:", r4.status_code, r4.json())

# Lesson serializer exposes provider badge data
r5 = c.get(f"/api/v1/courses/{course.id}/")
print("LESSON VIDEO FIELD:", r5.json().get("modules", [{}])[0].get("lessons", [])[0].get("video"))