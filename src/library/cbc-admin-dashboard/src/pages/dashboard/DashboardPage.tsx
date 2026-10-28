import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { analyticsApi } from "@/services/analytics";
import { ordersApi, usersApi, communityPostsApi, supportTicketsApi } from "@/services/resources";
import type { AdminOverview, Order, AdminUser, SupportTicket } from "@/services/types";
import { DataTable } from "@/components/DataTable";
import { Badge, statusTone } from "@/components/Badge";

export default function DashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      analyticsApi.overview(),
      ordersApi.list({ ordering: "-created_at" }),
      usersApi.list({ ordering: "-created_at" }),
      supportTicketsApi.list({ status: "open" }),
    ])
      .then(([ov, orders, users, tickets]) => {
        setOverview(ov);
        setRecentOrders(orders.results.slice(0, 5));
        setRecentUsers(users.results.slice(0, 5));
        setRecentTickets(tickets.results.slice(0, 5));
      })
      .catch(() => setError("Couldn't load dashboard data."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  if (isLoading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader title="Dashboard" description="Live snapshot of students, courses and revenue." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <StatCard label="Total Students" value={overview?.total_students ?? 0} />
        <StatCard label="Active Students" value={overview?.active_students ?? 0} />
        <StatCard label="Courses" value={overview?.total_courses ?? 0} />
        <StatCard label="Premium Courses" value={overview?.premium_courses ?? 0} />
        <StatCard label="Free Courses" value={overview?.free_courses ?? 0} />
        <StatCard label="Revenue" value={`₹${overview?.total_revenue ?? 0}`} />
        <StatCard label="Orders" value={overview?.total_orders ?? 0} />
        <StatCard label="Conversion" value={`${overview?.conversion_rate_percent ?? 0}%`} />
        <StatCard label="Completion Rate" value={`${overview?.course_completion_rate_percent ?? 0}%`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <section>
          <h3 style={{ fontSize: 15, marginBottom: "var(--space-3)" }}>Recent Orders</h3>
          <DataTable
            rowKey={(r: Order) => r.id}
            columns={[
              { key: "id", header: "Order", render: (r) => r.id.slice(0, 8) },
              { key: "amount", header: "Amount", render: (r) => `${r.currency} ${r.amount}` },
              { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            ]}
            rows={recentOrders}
            emptyTitle="No orders yet"
          />
        </section>
        <section>
          <h3 style={{ fontSize: 15, marginBottom: "var(--space-3)" }}>Recent Users</h3>
          <DataTable
            rowKey={(r: AdminUser) => r.id}
            columns={[
              { key: "email", header: "Email" },
              { key: "role", header: "Role", render: (r) => r.role?.label ?? "—" },
            ]}
            rows={recentUsers}
            emptyTitle="No users yet"
          />
        </section>
      </div>

      <section style={{ marginTop: "var(--space-6)" }}>
        <h3 style={{ fontSize: 15, marginBottom: "var(--space-3)" }}>Open Support Tickets</h3>
        <DataTable
          rowKey={(r: SupportTicket) => r.id}
          columns={[
            { key: "subject", header: "Subject" },
            { key: "priority", header: "Priority", render: (r) => <Badge tone={statusTone(r.priority)}>{r.priority}</Badge> },
            { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          ]}
          rows={recentTickets}
          emptyTitle="No open tickets"
          emptyDescription="Support queue is clear."
        />
      </section>
    </div>
  );
}
