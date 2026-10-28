import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";
import { LoadingState } from "@/components/StatusStates";
import { handwrittenNoteChaptersApi } from "@/services/resources";

export default function HandwrittenNoteChapterFormScreen() {
  const { id, subjectId } = useParams();
  const isEdit = !!id && id !== "new";
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    order: "0",
    is_active: true,
  });

  const load = useCallback(async () => {
    if (!id || !isEdit) return;
    try {
      const data = await handwrittenNoteChaptersApi.retrieve(id);
      setForm({
        title: data.title,
        order: String(data.order ?? 0),
        is_active: data.is_active,
      });
    } catch {
      setError("Could not load chapter.");
    } finally {
      setIsLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        subject: Number(subjectId),
        title: form.title.trim(),
        order: parseInt(form.order) || 0,
        is_active: form.is_active,
      };
      if (isEdit && id) {
        await handwrittenNoteChaptersApi.update(id, payload);
      } else {
        const created = await handwrittenNoteChaptersApi.create(payload);
        navigate(`/content/handwritten-notes/${subjectId}/chapters/${created.id}/edit`);
        return;
      }
      navigate(`/content/handwritten-notes/${subjectId}/chapters`);
    } catch (e: any) {
      setError(e?.response?.data ? JSON.stringify(e.response.data) : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState label="Loading..." />;

  return (
    <div>
      <PageHeader title={isEdit ? "Edit Chapter" : "New Chapter"} description="Add a chapter for handwritten notes." />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 600 }}>
        <FormField label="Chapter Title *" hint="e.g. Chapter 1: Real Numbers">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Chapter title" />
        </FormField>
        <FormField label="Sort Order">
          <input type="number" value={form.order} onChange={(e) => set("order", e.target.value)} />
        </FormField>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
            <span>Active</span>
          </label>
        </div>
        {error && (
          <div style={{ color: "var(--color-danger)", fontSize: 13, marginTop: 12, padding: "10px 14px", background: "#FEF3F2", borderRadius: 8 }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: "var(--space-5)" }}>
          <button className="btn btn-primary" onClick={save} disabled={isSaving} style={{ minWidth: 120 }}>
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create"}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/content/handwritten-notes/${subjectId}/chapters`)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
