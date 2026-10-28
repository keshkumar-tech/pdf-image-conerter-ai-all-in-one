from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.courses.models import Course

from .models import Coupon, Entitlement, Order, Payment, PaymentAttempt

User = get_user_model()


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ["id", "code", "discount_type", "discount_value", "max_uses",
                  "used_count", "valid_from", "valid_until", "applicable_courses", "is_active"]


class OrderUserSerializer(serializers.ModelSerializer):
    """Compact student details for the order record."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "full_name", "email", "phone"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class OrderCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "title", "slug"]


class OrderSerializer(serializers.ModelSerializer):
    user = OrderUserSerializer(read_only=True)
    course = OrderCourseSerializer(read_only=True)
    payment_method = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["id", "user", "course", "pricing_plan", "coupon", "amount",
                  "currency", "status", "provider", "provider_order_id",
                  "payment_method", "created_at"]
        read_only_fields = ["user", "status", "provider_order_id", "created_at"]

    def get_payment_method(self, obj):
        payment = getattr(obj, "payment", None)
        return payment.provider if payment and payment.provider else (obj.provider or "—")


class CreateOrderSerializer(serializers.Serializer):
    course_id = serializers.UUIDField()
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    provider = serializers.ChoiceField(choices=["razorpay", "stripe"], default="razorpay")


class VerifyPaymentSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    provider_payment_id = serializers.CharField(required=False, allow_blank=True)
    provider_signature = serializers.CharField(required=False, allow_blank=True)
    stripe_payment_intent_id = serializers.CharField(required=False, allow_blank=True)


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "order", "provider", "provider_payment_id", "amount", "status", "verified_at"]


class EntitlementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entitlement
        fields = ["id", "user", "course", "order", "granted_at", "expires_at",
                  "is_active", "granted_reason"]
