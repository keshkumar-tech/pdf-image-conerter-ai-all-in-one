from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Profile, Role, User


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "key", "label", "permissions"]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["bio", "city", "country", "date_of_birth", "occupation",
                  "social_links", "onboarding_completed"]


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "username", "phone", "avatar_url", "role",
                  "is_phone_verified", "is_email_verified", "is_active",
                  "theme_preference", "profile", "created_at", "last_active_at"]
        read_only_fields = ["id", "created_at"]


class AdminUserWriteSerializer(serializers.ModelSerializer):
    """Used by admin to create/update users including role assignment."""
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source="role", required=False, allow_null=True
    )
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = ["email", "username", "phone", "avatar_url", "role_id",
                  "is_active", "is_email_verified", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        Profile.objects.get_or_create(user=user)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "username", "phone", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        Profile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(email=attrs["email"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        attrs["user"] = user
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.CharField(max_length=120, required=False, allow_blank=True)
    otp = serializers.CharField(max_length=6)
    purpose = serializers.ChoiceField(choices=["register", "login", "reset_password"], default="login")

    def validate(self, attrs):
        if not attrs.get("phone") and not attrs.get("email"):
            raise serializers.ValidationError("Either phone or email must be provided.")
        return attrs
