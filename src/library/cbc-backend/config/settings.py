"""
Django settings for Coding with Kesh backend.

All secrets and provider credentials are loaded from environment variables.
NOTHING is hard-coded. See /.env.example for the full list of variables.
"""
import os
from datetime import timedelta
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-insecure-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() == "true"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")

ENVIRONMENT = os.environ.get("APP_ENVIRONMENT", "development")  # development|staging|production
API_VERSION = os.environ.get("API_VERSION", "v1")

# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",  # kept only for Django internal needs (auth, sessions) -
    # the PRODUCT admin dashboard is a separate custom React app, never this UI.
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "apps.users",
    "apps.courses",
    "apps.learning",
    "apps.payments",
    "apps.certificates",
    "apps.community",
    "apps.notifications",
    "apps.analytics",
    "apps.integrations",
    "apps.support",
    "apps.content",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "apps.support.middleware.AuditLogMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

AUTH_USER_MODEL = "users.User"

# ---------------------------------------------------------------------------
# Database - MySQL (falls back to sqlite for quick local checks if unset)
# ---------------------------------------------------------------------------
_database_url = os.environ.get("DATABASE_URL", "")

if _database_url:
    # Production (Render/Postgres or any provider that gives DATABASE_URL)
    DATABASES = {"default": dj_database_url.parse(_database_url, conn_max_age=600)}
    CACHES = {
        "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}
    }
elif os.environ.get("DB_ENGINE", "mysql") == "sqlite":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
    CACHES = {
        "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.environ.get("DB_NAME", "coding_with_kesh"),
            "USER": os.environ.get("DB_USER", "root"),
            "PASSWORD": os.environ.get("DB_PASSWORD", ""),
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "3306"),
            "OPTIONS": {"charset": "utf8mb4"},
        }
    }

# ---------------------------------------------------------------------------
# Redis / Celery
# ---------------------------------------------------------------------------
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"

# Redis cache only for explicit MySQL+Redis local setups
if "DATABASES" not in globals() or "default" not in DATABASES:
    CACHES = {
        "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}
    }
elif DATABASES["default"].get("ENGINE") == "django.db.backends.mysql":
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
        }
    }

# ---------------------------------------------------------------------------
# DRF / JWT
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
    "EXCEPTION_HANDLER": "apps.support.exceptions.standard_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.AnonRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {"user": "1000/hour", "anon": "100/hour"},
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=14),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174"
).split(",")
CORS_ALLOW_CREDENTIALS = True

# Trust proxy headers (Render / Fly / Railway / similar PaaS terminate TLS upstream).
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# ---------------------------------------------------------------------------
# Static / Media
# ---------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
MEDIA_URL = "/media/"
# Render et al. have read-only filesystems except /tmp — fall back there so
# PDF uploads (PYQ/StudyMaterial) don't 500. Set MEDIA_ROOT env to override.
def _ensure_writable(p):
    try:
        Path(p).mkdir(parents=True, exist_ok=True)
        return os.access(p, os.W_OK)
    except OSError:
        return False

MEDIA_ROOT = Path(os.environ.get("MEDIA_ROOT", BASE_DIR / "media"))
if not _ensure_writable(MEDIA_ROOT):
    MEDIA_ROOT = Path("/tmp/media")
    _ensure_writable(MEDIA_ROOT)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

LANGUAGE_CODE = "en-us"
TIME_ZONE = os.environ.get("APP_TIMEZONE", "Asia/Kolkata")
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Third-party integration credentials
# These are ONLY read from environment. Never hard-code real values.
# Admin-configured values (stored via apps.integrations.models.IntegrationConfig)
# override env at runtime for things editable from the admin dashboard.
# ---------------------------------------------------------------------------
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")

STRIPE_PUBLIC_KEY = os.environ.get("STRIPE_PUBLIC_KEY", "")
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

VIDEO_CDN_PROVIDER = os.environ.get("VIDEO_CDN_PROVIDER", "")
VIDEO_CDN_API_KEY = os.environ.get("VIDEO_CDN_API_KEY", "")
VIDEO_CDN_SIGNING_SECRET = os.environ.get("VIDEO_CDN_SIGNING_SECRET", "")
VIDEO_SIGNED_URL_TTL_SECONDS = int(os.environ.get("VIDEO_SIGNED_URL_TTL_SECONDS", "300"))

FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "")
FIREBASE_CLIENT_EMAIL = os.environ.get("FIREBASE_CLIENT_EMAIL", "")
FIREBASE_PRIVATE_KEY = os.environ.get("FIREBASE_PRIVATE_KEY", "")

STORAGE_PROVIDER = os.environ.get("STORAGE_PROVIDER", "local")  # local|s3|r2|gcs
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "")
STORAGE_ACCESS_KEY = os.environ.get("STORAGE_ACCESS_KEY", "")
STORAGE_SECRET_KEY = os.environ.get("STORAGE_SECRET_KEY", "")
STORAGE_REGION = os.environ.get("STORAGE_REGION", "")
STORAGE_ENDPOINT = os.environ.get("STORAGE_ENDPOINT", "")

AI_MENTOR_PROVIDER = os.environ.get("AI_MENTOR_PROVIDER", "")  # openai|anthropic|google
AI_MENTOR_API_KEY = os.environ.get("AI_MENTOR_API_KEY", "")
AI_MENTOR_MODEL = os.environ.get("AI_MENTOR_MODEL", "")
AI_MENTOR_RATE_LIMIT_PER_MIN = int(os.environ.get("AI_MENTOR_RATE_LIMIT_PER_MIN", "10"))

EMAIL_PROVIDER = os.environ.get("EMAIL_PROVIDER", "smtp")
EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")

SMS_PROVIDER = os.environ.get("SMS_PROVIDER", "")
SMS_API_KEY = os.environ.get("SMS_API_KEY", "")

# OTP configuration — modular for future SMS integration
OTP_MODE = os.environ.get("OTP_MODE", "development")  # development | production
OTP_LENGTH = 6
OTP_EXPIRY_SECONDS = int(os.environ.get("OTP_EXPIRY_SECONDS", "300"))  # 5 min
OTP_RESEND_COOLDOWN_SECONDS = int(os.environ.get("OTP_RESEND_COOLDOWN_SECONDS", "30"))
OTP_MAX_ATTEMPTS = int(os.environ.get("OTP_MAX_ATTEMPTS", "5"))
OTP_MAX_REQUESTS_PER_10MIN = int(os.environ.get("OTP_MAX_REQUESTS_PER_10MIN", "5"))

DEFAULT_CURRENCY = os.environ.get("DEFAULT_CURRENCY", "INR")
MAINTENANCE_MODE = os.environ.get("MAINTENANCE_MODE", "false").lower() == "true"
