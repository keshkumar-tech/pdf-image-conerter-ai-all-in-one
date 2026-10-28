import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { Badge } from "@/components/Badge";
import { usersApi } from "@/services/resources";
import type { AdminUser } from "@/services/types";

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    usersApi.retrieve(id).then(setUser).catch(() => setError("Couldn't load this user.")).finally(() => setIsLoading(false));
  };

  useEffect(load, [id]);

  if (isLoading) return <LoadingState label="Loading user..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!user) return null;

  return (
    <div>
      <PageHeader
        title={user.username || user.email}
        description={user.email}
        actions={user.role && <Badge tone="primary">{user.role.label}</Badge>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <div className="card" style={{ padding: "var(--space-6)" }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Contact</h3>
          <p style={{ fontSize: 14, color: "var(--color-muted)" }}>Phone: {user.phone || "—"}</p>
          <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
            Email verified: {user.is_email_verified ? "Yes" : "No"}
          </p>
          <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </p>
          <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
            Last active: {user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : "Never"}
          </p>
        </div>
        <div className="card" style={{ padding: "var(--space-6)" }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Learning Summary</h3>
          <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
            Courses, orders, progress and certificates for this user are available via the
            Courses, Orders, and Certificates screens filtered by this user.
          </p>
        </div>
      </div>
    </div>
  );
}
