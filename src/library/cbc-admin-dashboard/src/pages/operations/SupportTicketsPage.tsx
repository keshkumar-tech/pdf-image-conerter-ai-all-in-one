import { ResourceListPage } from "@/components/ResourceListPage";
import { supportTicketsApi } from "@/services/resources";
import type { SupportTicket } from "@/services/types";
import { Badge, statusTone } from "@/components/Badge";

export default function SupportTicketsPage() {
  return (
    <ResourceListPage<SupportTicket>
      title="Support Tickets"
      description="Student support queue — assign, resolve and track priority."
      api={supportTicketsApi}
      searchPlaceholder="Search tickets..."
      rowKey={(t) => t.id}
      emptyTitle="No tickets"
      emptyDescription="Support queue is clear."
      columns={[
        { key: "subject", header: "Subject" },
        { key: "priority", header: "Priority", render: (t) => <Badge tone={statusTone(t.priority)}>{t.priority}</Badge> },
        { key: "status", header: "Status", render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
        { key: "created_at", header: "Opened", render: (t) => new Date(t.created_at).toLocaleDateString() },
      ]}
    />
  );
}
