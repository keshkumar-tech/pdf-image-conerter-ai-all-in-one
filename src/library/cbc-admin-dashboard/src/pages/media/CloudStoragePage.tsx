import { IntegrationConfigPage } from "@/components/IntegrationConfigPage";

export default function CloudStoragePage() {
  return (
    <IntegrationConfigPage
      title="Cloud Storage"
      description="Object storage provider used for media uploads. Falls back to local disk in development."
      group="storage"
      providers={[
        {
          value: "s3", label: "AWS S3", fields: [
            { key: "bucket", label: "Bucket" },
            { key: "region", label: "Region" },
            { key: "access_key", label: "Access Key", isSecret: true },
            { key: "secret_key", label: "Secret Key", isSecret: true },
          ],
        },
        {
          value: "r2", label: "Cloudflare R2", fields: [
            { key: "bucket", label: "Bucket" },
            { key: "account_id", label: "Account ID" },
            { key: "access_key", label: "Access Key", isSecret: true },
            { key: "secret_key", label: "Secret Key", isSecret: true },
          ],
        },
        {
          value: "gcs", label: "Google Cloud Storage", fields: [
            { key: "bucket", label: "Bucket" },
            { key: "service_account_json", label: "Service Account JSON", isSecret: true },
          ],
        },
      ]}
    />
  );
}
