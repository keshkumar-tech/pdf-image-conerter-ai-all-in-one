from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPCode, Profile, Role, User
from .permissions import IsAdminOrSuperAdmin, IsAdminOrReadOnly
from .serializers import (AdminUserWriteSerializer, ForgotPasswordSerializer,
                           LoginSerializer, ProfileSerializer, RegisterSerializer,
                           ResetPasswordSerializer, RoleSerializer,
                           UserSerializer, VerifyOTPSerializer)
from .services import (clean_phone_number, generate_and_send_otp,
                            get_plain_code, verify_otp, verify_otp_result)


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        generate_and_send_otp(user, purpose="register")
        return Response(
            {"user": UserSerializer(user).data, "message": "OTP sent for verification."},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.last_active_at = timezone.now()
        user.save(update_fields=["last_active_at"])
        return Response({"user": UserSerializer(user).data, **_tokens_for(user)})


class RequestOTPView(APIView):
    """
    Send login OTP to mobile number or email.
    If phone user doesn't exist, auto-registers them seamlessly as a Student.
    In development/testing mode (or DEBUG), returns dev_otp in the response.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_phone = request.data.get("phone", "").strip()
        raw_email = request.data.get("email", "").strip()
        purpose = request.data.get("purpose", "login").strip() or "login"

        # Rate limiting: max 5 OTP requests per 10 min per IP is handled by DRF throttle,
        # additional per-phone check below after user is resolved.
        user = None
        phone_digits = clean_phone_number(raw_phone) if raw_phone else ""

        if phone_digits:
            if len(phone_digits) != 10:
                return Response(
                    {"detail": "Please enter a valid 10-digit mobile number."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user = User.objects.filter(phone=phone_digits).first()
            if not user:
                user = User.objects.filter(phone=raw_phone).first()

            # Auto-create user if registering / logging in with mobile number
            if not user and purpose in ("login", "register"):
                student_role = Role.objects.filter(key=Role.STUDENT).first()
                synthetic_email = f"student_{phone_digits}@conceptbuilder.app"
                # Ensure unique email
                existing_by_email = User.objects.filter(email=synthetic_email).first()
                if existing_by_email:
                    user = existing_by_email
                    user.phone = phone_digits
                    user.save(update_fields=["phone"])
                else:
                    user = User.objects.create(
                        username=f"student_{phone_digits}",
                        email=synthetic_email,
                        phone=phone_digits,
                        role=student_role,
                        is_active=True,
                        is_phone_verified=False,
                    )
                    user.set_unusable_password()
                    user.save()
                    Profile.objects.get_or_create(user=user)
        elif raw_email:
            user = User.objects.filter(email=raw_email).first()

        # Per-phone rate limiting & resend cooldown (config-driven)
        if user and phone_digits:
            cooldown = getattr(settings, "OTP_RESEND_COOLDOWN_SECONDS", 30)
            max_req = getattr(settings, "OTP_MAX_REQUESTS_PER_10MIN", 5)
            last_otp = OTPCode.objects.filter(user=user, purpose=purpose).order_by("-created_at").first()
            if last_otp:
                elapsed = (timezone.now() - last_otp.created_at).total_seconds()
                if elapsed < cooldown:
                    wait = int(cooldown - elapsed)
                    return Response(
                        {"detail": f"Please wait {wait}s before requesting a new OTP.", "retry_after": wait},
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                    )
            # Max N OTPs per 10 minutes per phone
            recent_count = OTPCode.objects.filter(
                user=user, purpose=purpose, created_at__gte=timezone.now() - timezone.timedelta(minutes=10)
            ).count()
            if recent_count >= max_req:
                return Response(
                    {"detail": "Too many OTP requests. Please try again after 10 minutes."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

        if not user:
            # For auto-registration flow we allow creation; for pure email flow we 404
            if phone_digits and purpose in ("login", "register"):
                pass  # will create below
            else:
                return Response(
                    {"detail": "Account not found for this mobile number or email."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        # Re-check after possible auto-create branch (user may still be None here if phone_digits)
        if not user and phone_digits and purpose in ("login", "register"):
            pass  # handled in auto-create block above, keep flow
        elif not user:
            return Response(
                {"detail": "Account not found for this mobile number or email."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Auto-create is inside the earlier block; re-fetch if created
        if not user:
            user = User.objects.filter(phone=phone_digits).first()

        otp = generate_and_send_otp(user, purpose=purpose)

        otp_mode = getattr(settings, "OTP_MODE", "development").lower()
        is_dev = settings.DEBUG or otp_mode != "production"
        expires_in = getattr(settings, "OTP_EXPIRY_SECONDS", 300)
        cooldown = getattr(settings, "OTP_RESEND_COOLDOWN_SECONDS", 30)

        payload = {
            "message": "OTP has been generated successfully.",
            "phone": user.phone or phone_digits,
            "email": user.email,
            "expires_in_seconds": expires_in,
            "resend_cooldown_seconds": cooldown,
        }

        # Return OTP only in development/testing mode for popup display
        if is_dev:
            plain = get_plain_code(otp)
            payload["dev_otp"] = plain
            payload["otp"] = plain

        return Response(payload, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    Verifies 6-digit OTP for phone or email.
    Supports up to 5 attempts, validates 5-minute expiry, and single use.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        identifier = data.get("phone") or data.get("email") or ""
        code = data["otp"]
        purpose = data.get("purpose", "login")

        user, err_msg, status_code = verify_otp_result(identifier, code, purpose)
        if not user:
            return Response({"detail": err_msg or "Invalid or expired OTP."}, status=status_code)

        # Mark verification flags
        update_fields = ["last_active_at"]
        user.last_active_at = timezone.now()
        if data.get("phone"):
            user.is_phone_verified = True
            update_fields.append("is_phone_verified")
        if data.get("email") and purpose == "register":
            user.is_email_verified = True
            update_fields.append("is_email_verified")
        user.save(update_fields=update_fields)

        return Response({
            "message": "Login successful.",
            "user": UserSerializer(user).data,
            **_tokens_for(user),
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email=serializer.validated_data["email"])
            generate_and_send_otp(user, purpose="reset_password")
        except User.DoesNotExist:
            pass  # do not leak account existence
        return Response({"message": "If the account exists, an OTP has been sent."})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = verify_otp(data["email"], data["otp"], "reset_password")
        if not user:
            return Response({"detail": "Invalid or expired OTP."}, status=400)
        user.set_password(data["new_password"])
        user.save(update_fields=["password"])
        return Response({"message": "Password updated successfully."})


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        profile_data = request.data.get("profile")
        if profile_data:
            profile, _ = Profile.objects.get_or_create(user=user)
            pserializer = ProfileSerializer(profile, data=profile_data, partial=True)
            pserializer.is_valid(raise_exception=True)
            pserializer.save()
        return Response(UserSerializer(user).data)


class UserViewSet(viewsets.ModelViewSet):
    """Admin: full CRUD for users — list, create, update, delete, ban."""
    queryset = User.objects.select_related("role", "profile").all().order_by("-created_at")
    permission_classes = [IsAdminOrSuperAdmin]
    filterset_fields = ["role__key", "is_active", "is_email_verified"]
    search_fields = ["email", "username", "phone"]
    ordering_fields = ["created_at", "last_active_at"]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return AdminUserWriteSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        # Soft-ban instead of hard delete
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response({"detail": "User deactivated."}, status=status.HTTP_200_OK)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminOrSuperAdmin]
