import { ResourceListPage } from "@/components/ResourceListPage";
import { pricingPlansApi } from "@/services/resources";
import type { PricingPlan } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function PricingPlansPage() {
  return (
    <ResourceListPage<PricingPlan>
      title="Pricing Plans"
      description="Manage plan pricing without touching code — the ₹499 Starter plan lives here, and future plans (₹699, ₹999...) can be added freely."
      api={pricingPlansApi}
      rowKey={(p) => p.id}
      emptyTitle="No pricing plans yet"
      actions={<button className="btn btn-primary">+ New Plan</button>}
      columns={[
        { key: "name", header: "Plan" },
        { key: "price", header: "Price", render: (p) => `${p.currency} ${p.price}${p.discount_price ? ` (₹${p.discount_price} discounted)` : ""}` },
        { key: "duration_days", header: "Duration", render: (p) => p.duration_days ? `${p.duration_days} days` : "Lifetime" },
        { key: "is_active", header: "Status", render: (p) => p.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge> },
      ]}
    />
  );
}
