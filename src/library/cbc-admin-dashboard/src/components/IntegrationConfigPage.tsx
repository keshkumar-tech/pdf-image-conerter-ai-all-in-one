import { useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { FormField } from "./FormField";
import { Badge } from "./Badge";
import { LoadingState } from "./StatusStates";
import { integrationConfigsApi } from "@/services/resources";
import type { IntegrationConfig } from "@/services/types";

/**
 * Shared shell for every third-party configuration screen (Payment
 * Gateway, Video/CDN, Firebase, Cloud Storage, AI Mentor, Email/SMS).
 * Each concrete page (e.g. PaymentGatewayPage) supplies its own group key
 * and field schema - secrets are always masked, never round-tripped.
 */
export interface ConfigField {
  key: string;
  label: string;
  type?: "text" | "password" | "select" | "toggle";
  options?: string[];
  isSecret?: boolean;
}

interface Props {
  title: string;
  description: string;
  group: string;
  providers: { value: string; label: string; fields: ConfigField[] }[];
}

export function IntegrationConfigPage({ title, description, group, providers }: Props) {
  const [selectedProvider, setSelectedProvider] = useState(providers[0]?.value ?? "");
  const [existing, setExisting] = useState<IntegrationConfig | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    integrationConfigsApi
      .list({ group })
      .then((res) => {
        const match = res.results.find((c) => c.provider === selectedProvider);
        setExisting(match ?? null);
        setFormValues((match?.config as Record<string, string>) ?? {});
      })
      .finally(() => setIsLoading(false));
  }, [group, selectedProvider]);

  const activeProvider = providers.find((p) => p.value === selectedProvider);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = { group, provider: selectedProvider, config: formValues, is_enabled: true };
      if (existing) await integrationConfigsApi.update(existing.id, payload);
      else await integrationConfigsApi.create(payload);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!existing) return;
    const result = await integrationConfigsApi.action<{ status: string }>(existing.id, "test");
    setTestResult(result.status);
  };

  if (isLoading) return <LoadingState label="Loading configuration..." />;

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          existing && (
            <Badge tone={existing.is_enabled ? "success" : "neutral"}>
              {existing.is_enabled ? "Enabled" : "Disabled"}
            </Badge>
          )
        }
      />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 560 }}>
        {providers.length > 1 && (
          <FormField label="Provider">
            <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}>
              {providers.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </FormField>
        )}
        {activeProvider?.fields.map((field) => (
          <FormField key={field.key} label={field.label} hint={field.isSecret ? "Never exposed to the student app or web preview" : undefined}>
            {field.type === "select" ? (
              <select
                value={formValues[field.key] ?? ""}
                onChange={(e) => setFormValues((v) => ({ ...v, [field.key]: e.target.value }))}
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input
                type={field.isSecret ? "password" : "text"}
                placeholder={field.isSecret && existing?.secret_configured ? "•••••••• (configured)" : ""}
                value={formValues[field.key] ?? ""}
                onChange={(e) => setFormValues((v) => ({ ...v, [field.key]: e.target.value }))}
              />
            )}
          </FormField>
        ))}
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
          {existing && (
            <button className="btn btn-secondary" onClick={handleTest}>Test Connection</button>
          )}
        </div>
        {testResult && (
          <div style={{ marginTop: "var(--space-4)" }}>
            <Badge tone={testResult === "success" ? "success" : "danger"}>
              Test {testResult === "success" ? "passed" : "failed"}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
