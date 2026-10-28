import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";
import { LoadingState } from "@/components/StatusStates";
import { lessonsApi } from "@/services/resources";
import type { Lesson } from "@/services/types";

export default function LessonEditorPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    lessonsApi.retrieve(id).then(setLesson).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingState label="Loading lesson..." />;
  if (!lesson) return null;

  const update = (patch: Partial<Lesson>) => setLesson((l) => (l ? { ...l, ...patch } : l));

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await lessonsApi.update(id, lesson);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={`Lesson: ${lesson.title}`} description="Edit lesson metadata. Attach video/PDF/quiz content from their respective managers." />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 560 }}>
        <FormField label="Title">
          <input value={lesson.title} onChange={(e) => update({ title: e.target.value })} />
        </FormField>
        <FormField label="Type">
          <select value={lesson.lesson_type} onChange={(e) => update({ lesson_type: e.target.value })}>
            {["video", "pdf", "source_code", "template", "quiz", "assignment", "project"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Free preview">
          <select
            value={lesson.is_free_preview ? "yes" : "no"}
            onChange={(e) => update({ is_free_preview: e.target.value === "yes" })}
          >
            <option value="no">No — requires entitlement</option>
            <option value="yes">Yes — open preview</option>
          </select>
        </FormField>
        <FormField label="Duration (minutes)">
          <input
            type="number"
            value={lesson.duration_minutes}
            onChange={(e) => update({ duration_minutes: Number(e.target.value) })}
          />
        </FormField>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Lesson"}
        </button>
      </div>
    </div>
  );
}
