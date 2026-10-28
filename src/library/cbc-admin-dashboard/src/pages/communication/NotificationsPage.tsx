import { ResourceListPage } from "@/components/ResourceListPage";
import { notificationCampaignsApi } from "@/services/resources";
import type { NotificationCampaign } from "@/services/types";
import { Badge, statusTone } from "@/components/Badge";

export default function NotificationsPage() {
  return (
    <ResourceListPage<NotificationCampaign>
      title="Notification Center"
      description="Create, schedule and send push/email/SMS campaigns to targeted student audiences."
      api={notificationCampaignsApi}
      rowKey={(c) => c.id}
      emptyTitle="No campaigns yet"
      actions={<button className="btn btn-primary">+ New Campaign</button>}
      columns={[
        { key: "title", header: "Title" },
        { key: "channel", header: "Channel", render: (c) => <Badge tone="primary">{c.channel}</Badge> },
        { key: "audience", header: "Audience" },
        { key: "status", header: "Status", render: (c) => <Badge tone={statusTone(c.status)}>{c.status}</Badge> },
        { key: "recipients_count", header: "Recipients" },
      ]}
    />
  );
}
