import { IntegrationConfigPage } from "@/components/IntegrationConfigPage";

export default function AiMentorPage() {
  return (
    <IntegrationConfigPage
      title="AI Mentor"
      description="Configure the AI provider powering the student-facing AI Mentor (explain topic, debug code, generate practice questions). API key is never exposed to the student app."
      group="ai_mentor"
      providers={[
        {
          value: "openai", label: "OpenAI", fields: [
            { key: "api_key", label: "API Key", isSecret: true },
            { key: "model", label: "Model", type: "select", options: ["gpt-4.1", "gpt-4o", "gpt-4o-mini"] },
            { key: "system_prompt", label: "System Prompt" },
            { key: "rate_limit_per_min", label: "Rate Limit (per user / min)" },
          ],
        },
        {
          value: "anthropic", label: "Anthropic", fields: [
            { key: "api_key", label: "API Key", isSecret: true },
            { key: "model", label: "Model", type: "select", options: ["claude-sonnet-5", "claude-haiku-4-5"] },
            { key: "system_prompt", label: "System Prompt" },
            { key: "rate_limit_per_min", label: "Rate Limit (per user / min)" },
          ],
        },
        {
          value: "google", label: "Google", fields: [
            { key: "api_key", label: "API Key", isSecret: true },
            { key: "model", label: "Model" },
            { key: "system_prompt", label: "System Prompt" },
          ],
        },
      ]}
    />
  );
}
