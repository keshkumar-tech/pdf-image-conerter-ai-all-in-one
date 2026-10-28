import { ResourceListPage } from "@/components/ResourceListPage";
import { paymentsApi } from "@/services/resources";
import type { Payment } from "@/services/types";
import { Badge, statusTone } from "@/components/Badge";

export default function PaymentsPage() {
  return (
    <ResourceListPage<Payment>
      title="Payments"
      description="Verified payment records linked to orders, with provider payment IDs."
      api={paymentsApi}
      rowKey={(p) => p.id}
      emptyTitle="No payments recorded yet"
      columns={[
        { key: "provider", header: "Provider" },
        { key: "provider_payment_id", header: "Provider Payment ID" },
        { key: "amount", header: "Amount" },
        { key: "status", header: "Status", render: (p) => <Badge tone={statusTone(p.status)}>{p.status}</Badge> },
        { key: "verified_at", header: "Verified At", render: (p) => p.verified_at ? new Date(p.verified_at).toLocaleString() : "—" },
      ]}
    />
  );
}
