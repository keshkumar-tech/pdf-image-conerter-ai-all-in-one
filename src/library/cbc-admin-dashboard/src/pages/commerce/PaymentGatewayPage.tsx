import { IntegrationConfigPage } from "@/components/IntegrationConfigPage";

export default function PaymentGatewayPage() {
  return (
    <IntegrationConfigPage
      title="Payment Gateway"
      description="Configure the active payment provider. Secret keys are masked here and never sent to the student app."
      group="payment"
      providers={[
        {
          value: "razorpay", label: "Razorpay", fields: [
            { key: "key_id", label: "Key ID" },
            { key: "key_secret", label: "Key Secret", isSecret: true },
            { key: "webhook_secret", label: "Webhook Secret", isSecret: true },
            { key: "environment", label: "Environment", type: "select", options: ["test", "live"] },
            { key: "currency", label: "Currency", type: "select", options: ["INR", "USD"] },
          ],
        },
        {
          value: "stripe", label: "Stripe", fields: [
            { key: "public_key", label: "Publishable Key" },
            { key: "secret_key", label: "Secret Key", isSecret: true },
            { key: "webhook_secret", label: "Webhook Secret", isSecret: true },
            { key: "environment", label: "Environment", type: "select", options: ["test", "live"] },
          ],
        },
      ]}
    />
  );
}
