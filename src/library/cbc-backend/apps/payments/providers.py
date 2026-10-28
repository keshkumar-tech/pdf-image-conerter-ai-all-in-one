"""Payment provider abstraction. Concrete providers implement create_order()
and verify_payment(); admin picks the active provider via IntegrationConfig.
Secrets are read from settings/env and NEVER sent to the client."""
from abc import ABC, abstractmethod

from django.conf import settings


class PaymentProvider(ABC):
    name = "base"

    @abstractmethod
    def create_order(self, amount, currency, receipt: str) -> dict:
        ...

    @abstractmethod
    def verify_payment(self, payload: dict) -> bool:
        ...


class RazorpayProvider(PaymentProvider):
    name = "razorpay"

    def create_order(self, amount, currency, receipt: str) -> dict:
        if not settings.RAZORPAY_KEY_ID:
            if settings.DEBUG:
                return {"provider": self.name, "provider_order_id": f"order_stub_{receipt}",
                        "amount": amount, "currency": currency}
            raise RuntimeError("Razorpay is not configured. Set RAZORPAY_KEY_ID/SECRET in admin settings.")
        # In production: call razorpay.Client(auth=(key_id, key_secret)).order.create(...)
        return {"provider": self.name, "provider_order_id": f"order_stub_{receipt}",
                "amount": amount, "currency": currency}

    def verify_payment(self, payload: dict) -> bool:
        # In production: verify payload["razorpay_signature"] via hmac with RAZORPAY_KEY_SECRET
        return bool(payload.get("razorpay_payment_id") or payload.get("provider_payment_id"))


class StripeProvider(PaymentProvider):
    name = "stripe"

    def create_order(self, amount, currency, receipt: str) -> dict:
        if not settings.STRIPE_SECRET_KEY:
            raise RuntimeError("Stripe is not configured. Set STRIPE_SECRET_KEY in admin settings.")
        return {"provider": self.name, "provider_order_id": f"pi_stub_{receipt}",
                "amount": amount, "currency": currency}

    def verify_payment(self, payload: dict) -> bool:
        return bool(payload.get("stripe_payment_intent_id"))


PROVIDERS = {
    "razorpay": RazorpayProvider(),
    "stripe": StripeProvider(),
}


def get_provider(name: str) -> PaymentProvider:
    provider = PROVIDERS.get(name)
    if not provider:
        raise ValueError(f"Unknown or future payment provider: {name}")
    return provider
