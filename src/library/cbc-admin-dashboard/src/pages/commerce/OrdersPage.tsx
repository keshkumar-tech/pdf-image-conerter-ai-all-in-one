import { ResourceListPage } from "@/components/ResourceListPage";
import { ordersApi } from "@/services/resources";
import type { Order } from "@/services/types";
import { Badge, statusTone } from "@/components/Badge";

export default function OrdersPage() {
  return (
    <ResourceListPage<Order>
      title="Orders"
      description="Every checkout attempt: created, pending, success, failed, refunded or cancelled."
      api={ordersApi}
      searchPlaceholder="Search by order ID..."
      rowKey={(o) => o.id}
      emptyTitle="No orders yet"
      columns={[
        { key: "id", header: "Order ID", render: (o) => o.id.slice(0, 8) },
        { key: "amount", header: "Amount", render: (o) => `${o.currency} ${o.amount}` },
        { key: "provider", header: "Provider" },
        { key: "status", header: "Status", render: (o) => <Badge tone={statusTone(o.status)}>{o.status}</Badge> },
        { key: "created_at", header: "Date", render: (o) => new Date(o.created_at).toLocaleString() },
      ]}
    />
  );
}
