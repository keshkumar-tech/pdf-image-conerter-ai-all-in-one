import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { handwrittenNotesApi } from "@/services/resources";
import type { HandwrittenNotesSubject } from "@/services/types";

export default function HandwrittenNotesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<HandwrittenNotesSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await handwrittenNotesApi.list({ is_active: true });
      setData(res.results ?? []);
      setCount(res.count ?? 0);
    } catch {
      setError("Could not load handwritten notes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<HandwrittenNotesSubject>[] = [
    { key: "name", header: "Subject", render: (s) => s.name },
    { key: "class_level", header: "Class", render: (s) => s.class_level },
    { key: "chapters", header: "Chapters", render: (s) => (
      <button className="btn btn-secondary" onClick={() => navigate(`/content/handwritten-notes/${s.id}/chapters`)}>
        Chapters
      </button>
    )},
    { key: "actions", header: "Actions", render: (s) => (
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/content/handwritten-notes/${s.id}/edit`)}>Edit</button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Handwritten Notes"
        description="Manage subjects, chapters and PDFs for handwritten notes."
        actions={
          <button className="btn btn-primary" onClick={() => navigate("/content/handwritten-notes/new")}>+ Add Subject</button>
        }
      />
      {isLoading ? (
        <LoadingState label="Loading..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div style={{ marginBottom: "var(--space-4)", maxWidth: 360 }}>
            <input
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: 8, width: "100%" }}
            />
          </div>
          <DataTable
            columns={columns}
            rows={filtered}
            isLoading={isLoading}
            error={error}
            onRetry={load}
            emptyTitle="No subjects yet"
            emptyDescription="Create your first handwritten notes subject."
            rowKey={(s) => String(s.id)}
          />
          {!isLoading && !error && count > 0 && (
            <div style={{ marginTop: "var(--space-4)", fontSize: 13, color: "var(--color-muted)" }}>
              {count} total record{count === 1 ? "" : "s"}
            </div>
          )}
        </>
      )}
    </div>
  );
}
