import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { handwrittenNoteChaptersApi, handwrittenNotePDFsApi, handwrittenNotesApi } from "@/services/resources";
import type { HandwrittenNotesChapter, HandwrittenNotesPDF, HandwrittenNotesSubject } from "@/services/types";

export default function HandwrittenNotePDFsPage() {
  const { id: chapterId, subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<HandwrittenNotesSubject | null>(null);
  const [chapter, setChapter] = useState<HandwrittenNotesChapter | null>(null);
  const [data, setData] = useState<HandwrittenNotesPDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!chapterId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [chap, pdfsRes] = await Promise.all([
        handwrittenNoteChaptersApi.retrieve(chapterId),
        handwrittenNotePDFsApi.list({ chapter: chapterId, is_active: true }),
      ]);
      setChapter(chap);
      setData(pdfsRes.results ?? []);
      setCount(pdfsRes.count ?? 0);
      if (chap?.subject) {
        const sub = await handwrittenNotesApi.retrieve(String(chap.subject));
        setSubject(sub);
      }
    } catch {
      setError("Could not load PDFs.");
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  useEffect(() => { load(); }, [load]);

  const columns: Column<HandwrittenNotesPDF>[] = [
    { key: "title", header: "PDF", render: (p) => p.title },
    { key: "pages", header: "Pages", render: (p) => p.pages || "-" },
    { key: "is_free", header: "Free", render: (p) => (p.is_free ? "Yes" : "No") },
    { key: "actions", header: "Actions", render: (p) => (
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/content/handwritten-notes/${subjectId}/chapters/${p.id}/edit`)}>Edit</button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title={subject ? `✍️ ${subject.name}` : "PDFs"}
        description={chapter ? `Chapter: ${chapter.title}` : "Manage PDFs for this chapter."}
        actions={
          <button className="btn btn-primary" onClick={() => navigate(`/content/handwritten-notes/${subjectId}/chapters/${chapterId}/pdfs/new`)}>
            + Add PDF
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
            emptyTitle="No PDFs yet"
            emptyDescription="Upload a PDF to get started."
            rowKey={(p) => String(p.id)}
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
