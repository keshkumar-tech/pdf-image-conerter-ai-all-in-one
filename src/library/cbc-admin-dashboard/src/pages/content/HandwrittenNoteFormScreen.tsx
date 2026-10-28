import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";
import { LoadingState } from "@/components/StatusStates";
import { handwrittenNotesApi } from "@/services/resources";

const CLASS_OPTIONS = ["Class 9", "Class 10", "Class 11", "Class 12"];

export default function HandwrittenNoteFormScreen() {
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    class_level: "Class 10",
    sort_order: "0",
    is_active: true,
  });

  const load = useCallback(async () => {
    if (!id || !isEdit) return;
    try {
      const data = await handwrittenNotesApi.retrieve(id);
      setForm({
        name: data.name,
        class_level: data.class_level,
        sort_order: String(data.sort_order ?? 0),
        is_active: data.is_active,
      });
    } catch {
      setError("Could not load subject.");
    } finally {
      setIsLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        class_level: form.class_level,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active,
      };
      if (isEdit && id) {
        await handwrittenNotesApi.update(id, payload);
      } else {
        const created = await handwrittenNotesApi.create(payload);
        navigate(`/content/handwritten-notes/${created.id}/edit`);
        return;
      }
      navigate("/content/handwritten-notes");
    } catch (e: any) {
      setError(e?.response?.data ? JSON.stringify(e.response.data) : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState label="Loading..." />;

  return (
    <div>
      <PageHeader title={isEdit ? "Edit Subject" : "New Subject"} description="Add a subject for handwritten notes." />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 600 }}>
        <FormField label="Subject Name *" hint="e.g. Mathematics, Science">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Subject name" />
        </FormField>
        <FormField label="Class Level">
          <select value={form.class_level} onChange={(e) => set("class_level", e.target.value)}>
            {CLASS_OPTIONS.map((cl) => <option key={cl} value={cl}>{cl}</option>)}
          </select>
        </FormField>
        <FormField label="Sort Order">
          <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
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
          <button className="btn btn-secondary" onClick={() => navigate("/content/handwritten-notes")}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
