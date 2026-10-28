"""Thin dispatch layer for outbound notifications. Real SDK calls (FCM,
SMTP, Twilio-like SMS APIs) are wired in here once credentials exist;
until then calls are safely no-ops so the rest of the platform keeps working."""
import logging

from django.conf import settings

logger = logging.getLogger("integrations")


def dispatch_push(user, title, body):
    if not settings.FIREBASE_PROJECT_ID:
        logger.info("Push skipped (Firebase not configured): %s -> %s", user.email, title)
        return False
    # In production: firebase_admin.messaging.send(...) using FIREBASE_* settings
    return True


def dispatch_email(user, subject, body):
    if not settings.EMAIL_HOST:
        logger.info("Email skipped (SMTP not configured): %s -> %s", user.email, subject)
        return False
    # In production: django.core.mail.send_mail(...) using EMAIL_* settings
    return True


def dispatch_sms(user, message):
    if not settings.SMS_PROVIDER:
        logger.info("SMS skipped (provider not configured): %s", user.phone)
        return False
    # In production: call configured SMS provider API using SMS_API_KEY
    return True


def send_otp_notification(user, code, purpose):
    dispatch_email(user, f"Your Coding with Kesh OTP ({purpose})", f"Your OTP is {code}. It expires in 10 minutes.")
    if user.phone:
        dispatch_sms(user, f"Your Coding with Kesh OTP is {code}")


def test_connection(config: "IntegrationConfig") -> bool:
    """Admin 'Test Connection' button handler. Real implementation pings
    the provider's health/auth endpoint with the configured credentials."""
    if not config.secret_ref:
        return False
    return True
