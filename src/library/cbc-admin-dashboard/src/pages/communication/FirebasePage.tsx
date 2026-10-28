import { IntegrationConfigPage } from "@/components/IntegrationConfigPage";

export default function FirebasePage() {
  return (
    <IntegrationConfigPage
      title="Firebase"
      description="Firebase Cloud Messaging configuration for push notifications. Private key is masked and never sent to the client."
      group="firebase"
      providers={[
        {
          value: "fcm", label: "Firebase Cloud Messaging", fields: [
            { key: "project_id", label: "Project ID" },
            { key: "client_email", label: "Client Email" },
            { key: "private_key", label: "Private Key", isSecret: true },
          ],
        },
      ]}
    />
  );
}
