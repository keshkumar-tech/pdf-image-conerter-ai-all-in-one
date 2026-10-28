import { IntegrationConfigPage } from "@/components/IntegrationConfigPage";

export default function VideoCdnPage() {
  return (
    <IntegrationConfigPage
      title="Video Protection / CDN"
      description="Configure the video CDN provider used to generate signed, expiring playback URLs. Premium videos are never exposed as raw public URLs."
      group="video_cdn"
      providers={[
        {
          value: "mux", label: "Mux", fields: [
            { key: "api_key", label: "API Key", isSecret: true },
            { key: "signing_secret", label: "Signing Secret", isSecret: true },
            { key: "webhook_url", label: "Webhook URL" },
          ],
        },
        {
          value: "bunny", label: "Bunny Stream", fields: [
            { key: "api_key", label: "API Key", isSecret: true },
            { key: "library_id", label: "Library ID" },
            { key: "signing_secret", label: "Signing Secret", isSecret: true },
          ],
        },
        {
          value: "cloudflare_stream", label: "Cloudflare Stream", fields: [
            { key: "account_id", label: "Account ID" },
            { key: "api_token", label: "API Token", isSecret: true },
          ],
        },
      ]}
    />
  );
}
