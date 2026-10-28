import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { impQuestionChaptersApi, impQuestionsApi } from "@/services/resources";
import type { ImpQuestionChapter, ImpQuestionSubject } from "@/services/types";

export default function ImpQuestionChaptersPage() {
  const { id: subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<ImpQuestionSubject | null>(null);
  const [data, setData] = useState<ImpQuestionChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!subjectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const sub = await impQuestionsApi.retrieve(subjectId);
      setSubject(sub);
      const res = await impQuestionChaptersApi.list({ subject: subjectId, is_active: true });
      setData(res.results ?? []);
      setCount(res.count ?? 0);
    } catch {
      setError("Could not load chapters.");
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  useEffect(() => { load(); }, [load]);

  const columns: Column<ImpQuestionChapter>[] = [
    { key: "title", header: "Chapter", render: (c) => c.title },
    { key: "actions", header: "Actions", render: (c) => (
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/content/imp-questions/${subjectId}/chapters/${c.id}/edit`)}>Edit</button>
        <button className="btn btn-secondary" onClick={() => navigate(`/content/imp-questions/${subjectId}/chapters/${c.id}/pdfs`)}>PDFs</button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title={subject ? `⭐ ${subject.name}` : "Chapters"}
        description="Manage chapters for this subject."
        actions={
          <button className="btn btn-primary" onClick={() => navigate(`/content/imp-questions/${subjectId}/chapters/new`)}>
            + Add Chapter
          </button>
        }
      />
      {isLoading ? (
        <LoadingState label="Loading..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data}
            isLoading={isLoading}
            error={error}
            onRetry={load}
            emptyTitle="No chapters yet"
            emptyDescription="Add a chapter to get started."
            rowKey={(c) => String(c.id)}
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
