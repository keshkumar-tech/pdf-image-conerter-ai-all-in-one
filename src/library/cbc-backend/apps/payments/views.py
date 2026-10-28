from decimal import Decimal
import json

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.courses.models import Course

from .models import Coupon, Entitlement, Order, Payment, PaymentAttempt
from .providers import get_provider
from .serializers import (CouponSerializer, CreateOrderSerializer,
                           EntitlementSerializer, OrderSerializer,
                           PaymentSerializer, VerifyPaymentSerializer)
from .services import apply_coupon, grant_entitlement


def _json_safe_payload(data: dict) -> dict:
    return json.loads(json.dumps(data, default=str))


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "provider"]
    search_fields = ["user__email", "user__username", "course__title"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.select_related("user", "course").all()
        if not (user.role and user.role.key != "student"):
            qs = qs.filter(user=user)
        return qs


class CreateOrderView(APIView):
    """Step 1 of the payment flow: Student -> Checkout -> Create Order -> Payment Gateway."""

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        course = get_object_or_404(Course, id=data["course_id"])
        if course.is_free:
            return Response({"detail": "This course is free; no order required."}, status=400)
        if not course.pricing_plan:
            return Response({"detail": "Course has no pricing plan configured."}, status=400)

        amount = course.pricing_plan.discount_price or course.pricing_plan.price
        coupon = None
        code = data.get("coupon_code")
        if code:
            coupon = Coupon.objects.filter(code=code, is_active=True).first()
            if coupon:
                amount = apply_coupon(coupon, amount)

        order = Order.objects.create(
            user=request.user, course=course, pricing_plan=course.pricing_plan,
            coupon=coupon, amount=amount, currency=course.pricing_plan.currency,
            status="pending", provider=data["provider"],
        )
        provider = get_provider(data["provider"])
        try:
            provider_result = provider.create_order(amount, order.currency, str(order.id))
        except RuntimeError as exc:
            order.status = "failed"
            order.save(update_fields=["status"])
            return Response({"detail": str(exc)}, status=503)

        order.provider_order_id = provider_result["provider_order_id"]
        order.save(update_fields=["provider_order_id"])
        PaymentAttempt.objects.create(order=order, provider=provider.name, request_payload=_json_safe_payload(data))

        return Response({"order": OrderSerializer(order).data, "provider_order": provider_result})


class VerifyPaymentView(APIView):
    """Step 2: Payment Gateway -> Webhook/Client callback -> Verify -> Entitlement -> Enrollment."""

    @transaction.atomic
    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        order = get_object_or_404(Order, id=data["order_id"], user=request.user)

        provider = get_provider(order.provider)
        verified = provider.verify_payment(data)

        PaymentAttempt.objects.create(
            order=order, provider=provider.name, request_payload=_json_safe_payload(data),
            succeeded=verified, response_payload={"verified": verified},
        )

        if not verified:
            order.status = "failed"
            order.save(update_fields=["status"])
            return Response({"detail": "Payment verification failed."}, status=402)

        order.status = "success"
        order.save(update_fields=["status"])
        payment, _ = Payment.objects.update_or_create(
            order=order,
            defaults=dict(
                provider=provider.name,
                provider_payment_id=data.get("provider_payment_id") or data.get("stripe_payment_intent_id", ""),
                amount=order.amount, status="success", verified_at=timezone.now(),
            ),
        )
        entitlement = grant_entitlement(request.user, order.course, order=order, reason="purchase")

        return Response({
            "order": OrderSerializer(order).data,
            "payment": PaymentSerializer(payment).data,
            "entitlement": EntitlementSerializer(entitlement).data,
        })


class WebhookView(APIView):
    """Provider webhooks land here (signature verification happens per-provider)."""
    permission_classes = [AllowAny]

    def post(self, request, provider):
        # In production: verify X-Razorpay-Signature / Stripe-Signature header
        # against the configured webhook secret before trusting the payload.
        return Response({"received": True})


class MyEntitlementsView(viewsets.ReadOnlyModelViewSet):
    serializer_class = EntitlementSerializer

    def get_queryset(self):
        return Entitlement.objects.filter(user=self.request.user, is_active=True)
