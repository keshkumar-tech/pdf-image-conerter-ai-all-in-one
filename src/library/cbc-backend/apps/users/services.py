"""OTP generation/verification service. SMS/Email delivery goes through
apps.integrations provider abstractions - never hard-coded here."""
import hashlib
import re
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

from .models import OTPCode, Profile, User


def clean_phone_number(phone: str) -> str:
    """Normalize phone number to 10 digits or standard format."""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[2:]
    return digits


def _hash_otp(code: str) -> str:
    return make_password(code)


def _check_otp_hash(code: str, hashed: str) -> bool:
    if not hashed:
        return False
    try:
        return check_password(code, hashed)
    except Exception:
        return False


def generate_and_send_otp(user: User, purpose: str) -> OTPCode:
    """
    Invalidates any previous unused OTP for this user+purpose,
    generates a secure 6-digit OTP valid for 5 minutes, and saves it.
    OTP_MODE=production delegates to SMS provider; otherwise OTP is returned for dev popup.
    """
    # Invalidate previous active OTPs (one-time use + resend invalidates old)
    OTPCode.objects.filter(user=user, purpose=purpose, is_used=False).update(is_used=True)

    # Cryptographically secure 6-digit OTP
    code = f"{secrets.randbelow(1000000):06d}"
    hashed = _hash_otp(code)
    expiry = getattr(settings, "OTP_EXPIRY_SECONDS", 300)
    otp = OTPCode.objects.create(
        user=user,
        code=hashed,  # store hash in code for backward compat
        code_hash=hashed,
        purpose=purpose,
        expires_at=timezone.now() + timedelta(seconds=expiry),
        attempts=0,
    )
    # Keep plain only in-memory for dev return; never log plain in prod
    otp._plain_code = code  # type: ignore[attr-defined]

    otp_mode = getattr(settings, "OTP_MODE", "development").lower()
    if otp_mode == "production":
        try:
            from apps.integrations.services import send_otp_notification
            send_otp_notification(user, code, purpose)
        except Exception:
            pass
    return otp


def get_plain_code(otp: OTPCode) -> str:
    """Return plain OTP for dev mode only (set as _plain_code during generation)."""
    return getattr(otp, "_plain_code", "")


def verify_otp_result(identifier: str, code: str, purpose: str):
    """
    Verifies OTP for a user identified by phone or email.
    Returns: (user, error_message, status_code)
    """
    clean_id = (identifier or "").strip()
    digits = clean_phone_number(clean_id)

    user = None
    if len(digits) == 10:
        user = User.objects.filter(phone=digits).first()
    if not user and "@" in clean_id:
        user = User.objects.filter(email=clean_id).first()
    if not user and clean_id:
        user = User.objects.filter(phone=clean_id).first()

    if not user:
        return None, "Account not found for this mobile number.", 404

    otp = (
        OTPCode.objects.filter(user=user, purpose=purpose, is_used=False)
        .order_by("-created_at")
        .first()
    )

    if not otp:
        return None, "No active OTP found. Please request a new OTP.", 400

    # Check maximum verification attempts (max 5)
    if otp.attempts >= 5:
        otp.is_used = True
        otp.save(update_fields=["is_used"])
        return None, "Maximum verification attempts exceeded. Please request a new OTP.", 400

    # Check expiry (5 minutes)
    if otp.expires_at < timezone.now():
        otp.is_used = True
        otp.save(update_fields=["is_used"])
        return None, "OTP has expired. Please request a new OTP.", 400

    # Validate code — hashed first, fallback to legacy plain for old rows
    supplied = code.strip()
    stored_hash = otp.code_hash or otp.code
    is_valid = False
    if stored_hash and stored_hash.startswith("pbkdf2_"):
        is_valid = _check_otp_hash(supplied, stored_hash)
    else:
        is_valid = (otp.code == supplied)
    max_attempts = getattr(settings, "OTP_MAX_ATTEMPTS", 5)
    if not is_valid:
        otp.attempts += 1
        if otp.attempts >= max_attempts:
            otp.is_used = True
            otp.save(update_fields=["attempts", "is_used"])
            return None, "Maximum verification attempts exceeded. Please request a new OTP.", 400
        otp.save(update_fields=["attempts"])
        remaining = max_attempts - otp.attempts
        return None, f"Incorrect OTP. Please try again. ({remaining} attempts remaining)", 400

    # Mark as used (one-time use)
    otp.is_used = True
    otp.save(update_fields=["is_used"])
    return user, None, 200


def verify_otp(email: str, code: str, purpose: str):
    """Backward-compatible helper for existing email-based OTP callers."""
    user, err, status = verify_otp_result(email, code, purpose)
    return user

