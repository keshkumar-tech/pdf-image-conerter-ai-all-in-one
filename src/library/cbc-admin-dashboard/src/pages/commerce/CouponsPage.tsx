import { ResourceListPage } from "@/components/ResourceListPage";
import { couponsApi } from "@/services/resources";
import type { Coupon } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function CouponsPage() {
  return (
    <ResourceListPage<Coupon>
      title="Coupons"
      description="Discount codes applicable to specific courses, with usage limits and validity windows."
      api={couponsApi}
      rowKey={(c) => c.id}
      emptyTitle="No coupons created yet"
      actions={<button className="btn btn-primary">+ New Coupon</button>}
      columns={[
        { key: "code", header: "Code" },
        { key: "discount_value", header: "Discount", render: (c) => c.discount_type === "percent" ? `${c.discount_value}%` : `₹${c.discount_value}` },
        { key: "used_count", header: "Used", render: (c) => `${c.used_count}${c.max_uses ? ` / ${c.max_uses}` : ""}` },
        { key: "is_active", header: "Status", render: (c) => c.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge> },
      ]}
    />
  );
}
