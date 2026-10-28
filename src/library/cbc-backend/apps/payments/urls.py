from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (CouponViewSet, CreateOrderView, MyEntitlementsView,
                     OrderViewSet, VerifyPaymentView, WebhookView)

router = DefaultRouter()
router.register("coupons", CouponViewSet, basename="coupon")
router.register("orders", OrderViewSet, basename="order")
router.register("entitlements", MyEntitlementsView, basename="my-entitlement")

urlpatterns = router.urls + [
    path("checkout/create-order/", CreateOrderView.as_view(), name="checkout-create-order"),
    path("checkout/verify-payment/", VerifyPaymentView.as_view(), name="checkout-verify-payment"),
    path("webhooks/<str:provider>/", WebhookView.as_view(), name="payment-webhook"),
]
