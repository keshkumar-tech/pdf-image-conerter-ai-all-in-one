import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";
import { LoadingState } from "@/components/StatusStates";
import { coursesApi, categoriesApi, pricingPlansApi } from "@/services/resources";
import { apiClient } from "@/services/apiClient";
import type { Category, Course, PricingPlan } from "@/services/types";

const emptyCourse: Partial<Course> = {
  title: "", batch_name: "", short_description: "", description: "",
  thumbnail_url: "", banner_url: "", instructor_name: "Kesh Kumar",
  level: "beginner", language: "Hindi", is_free: false, is_published: false,
  is_featured: false, requirements: [], learning_outcomes: [], highlights: [],
  tags: [], youtube_playlist_url: "", seo_title: "", seo_description: "",
  start_date: null, end_date: null, duration_minutes: 0,
} as any;

export default function CourseEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<Course>>(emptyCourse);
  const [categories, setCategories] = useState<Category[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [activeSection, setActiveSection] = useState<"basic" | "content" | "batch" | "seo">("basic");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleFileUpload = async (file: File, target: "thumbnail_url" | "banner_url") => {
    const isThumb = target === "thumbnail_url";
    if (isThumb) setUploadingThumb(true);
    else setUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post<{ url: string; path: string }>("/courses/upload_image/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) {
        if (isThumb) {
          update({ thumbnail_url: res.data.url, thumbnail_file: null as any });
        } else {
          update({ banner_url: res.data.url, banner_file: null as any });
        }
      }
    } catch {
      alert("Failed to upload image. Please try again.");
    } finally {
      if (isThumb) setUploadingThumb(false);
      else setUploadingBanner(false);
    }
  };

  // For array fields (requirements, learning_outcomes, highlights, tags)
  const [reqInput, setReqInput] = useState("");
  const [outInput, setOutInput] = useState("");
  const [hlInput, setHlInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    Promise.all([categoriesApi.list(), pricingPlansApi.list()]).then(([c, p]) => {
      setCategories(c.results);
      setPlans(p.results);
    }).catch(() => {});
    if (!isNew && id) {
      coursesApi.retrieve(id)
        .then((data) => {
          const normalized = {
            ...data,
            category: (data as any).category?.id ?? (data as any).category ?? "",
            pricing_plan: (data as any).pricing_plan?.id ?? (data as any).pricing_plan ?? "",
          };
          setForm(normalized);
          setIsLoading(false);
        })
        .catch(() => {
          setSaveError("Cannot load course.");
          setIsLoading(false);
        });
    }
  }, [id, isNew]);

  const update = (patch: Partial<Course>) => setForm((f) => ({ ...f, ...patch }));

  const addToArray = (field: keyof Course, value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    const arr = (form[field] as string[]) ?? [];
    update({ [field]: [...arr, value.trim()] } as any);
    setter("");
  };

  const removeFromArray = (field: keyof Course, idx: number) => {
    const arr = [...((form[field] as string[]) ?? [])];
    arr.splice(idx, 1);
    update({ [field]: arr } as any);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");
    try {
      const savePayload: any = { ...form };
      if (typeof savePayload.category === "object" && savePayload.category !== null) {
        savePayload.category = (savePayload.category as any).id;
      }
      if (typeof savePayload.pricing_plan === "object" && savePayload.pricing_plan !== null) {
        savePayload.pricing_plan = (savePayload.pricing_plan as any).id;
      }
      if (isNew) {
        const created = await coursesApi.create(savePayload);
        navigate(`/courses/${created.id}/edit`);
      } else if (id) {
        await coursesApi.update(id, savePayload);
      }
    } catch (e: any) {
      setSaveError(e?.response?.data ? JSON.stringify(e.response.data) : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState label="Loading course..." />;

  const sections = [
    { key: "basic", label: "📋 Basic Info" },
    { key: "content", label: "📝 Description & Highlights" },
    { key: "batch", label: "📅 Batch & Pricing" },
    { key: "seo", label: "🔍 SEO & YouTube" },
  ] as const;

  return (
    <div>
      <PageHeader
        title={isNew ? "New Course" : `Edit: ${form.title}`}
        description="Complete all sections to publish the course. Curriculum (modules/lessons/videos) is managed separately."
        actions={
          !isNew && id && (
            <button className="btn btn-secondary" onClick={() => navigate(`/courses/curriculum?course=${id}`)}>
              📚 Open Curriculum Builder
            </button>
          )
        }
      />

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "var(--space-5)", borderBottom: "1px solid var(--color-border)", paddingBottom: 0 }}>
        {sections.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            style={{
              padding: "10px 16px", border: "none", background: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 13,
              borderBottom: activeSection === key ? "2px solid var(--color-primary)" : "2px solid transparent",
              color: activeSection === key ? "var(--color-primary)" : "var(--color-muted)",
            }}
          >{label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 700 }}>

        {/* BASIC INFO */}
        {activeSection === "basic" && (
          <>
            <FormField label="Course Title *" hint="Full name of the course (e.g. CHIRAG Class 9 Maths Complete Batch)">
              <input value={form.title ?? ""} onChange={(e) => update({ title: e.target.value })} placeholder="Course title..." />
            </FormField>
            <FormField label="Batch Name" hint="Short name shown as a badge (e.g. CHIRAG Batch 2025)">
              <input value={(form as any).batch_name ?? ""} onChange={(e) => update({ batch_name: e.target.value } as any)} placeholder="e.g. CHIRAG Batch 2025" />
            </FormField>
            <FormField label="Short Description (max 280 chars)" hint="Shown on course cards">
              <textarea rows={2} maxLength={280} value={form.short_description ?? ""} onChange={(e) => update({ short_description: e.target.value })} placeholder="Brief description..." />
            </FormField>
            <FormField label="Category">
              <select value={(form.category as any)?.id ?? form.category ?? ""}
                onChange={(e) => update({ category: e.target.value as any })}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              <FormField label="Level">
                <select value={form.level ?? "beginner"} onChange={(e) => update({ level: e.target.value })}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </FormField>
              <FormField label="Language">
                <input value={form.language ?? "Hindi"} onChange={(e) => update({ language: e.target.value })} />
              </FormField>
              <FormField label="Instructor Name">
                <input value={form.instructor_name ?? ""} onChange={(e) => update({ instructor_name: e.target.value })} />
              </FormField>
              <FormField label="Duration (minutes)">
                <input type="number" value={(form as any).duration_minutes ?? 0} onChange={(e) => update({ duration_minutes: Number(e.target.value) } as any)} />
              </FormField>
            </div>
            <FormField label="Course Thumbnail Image" hint="Upload square image for course cards & slider (400×400px recommended)">
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                <label className="btn btn-secondary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {uploadingThumb ? "Uploading..." : "📁 Upload Thumbnail Image"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, "thumbnail_url");
                    }}
                  />
                </label>
                {form.thumbnail_url && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ color: "var(--color-danger)" }}
                    onClick={() => update({ thumbnail_url: "" })}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input value={form.thumbnail_url ?? ""} onChange={(e) => update({ thumbnail_url: e.target.value })} placeholder="Or enter image URL: https://..." />
              {form.thumbnail_url && (
                <div style={{ marginTop: 8 }}>
                  <img src={form.thumbnail_url} alt="thumb" style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover", border: "1px solid var(--color-border)" }} />
                </div>
              )}
            </FormField>

            <FormField label="Course Banner Image" hint="Upload wide banner for top slider & course details (1200×400px recommended)">
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                <label className="btn btn-secondary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {uploadingBanner ? "Uploading..." : "📁 Upload Banner Image"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, "banner_url");
                    }}
                  />
                </label>
                {form.banner_url && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ color: "var(--color-danger)" }}
                    onClick={() => update({ banner_url: "" })}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input value={form.banner_url ?? ""} onChange={(e) => update({ banner_url: e.target.value })} placeholder="Or enter banner URL: https://..." />
              {form.banner_url && (
                <div style={{ marginTop: 8 }}>
                  <img src={form.banner_url} alt="banner" style={{ width: "100%", maxHeight: 150, borderRadius: 8, objectFit: "cover", border: "1px solid var(--color-border)" }} />
                </div>
              )}
            </FormField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
              <FormField label="Access">
                <select value={form.is_free ? "free" : "premium"} onChange={(e) => update({ is_free: e.target.value === "free" })}>
                  <option value="free">🆓 Free</option>
                  <option value="premium">💎 Premium</option>
                </select>
              </FormField>
              <FormField label="Status">
                <select value={form.is_published ? "published" : "draft"} onChange={(e) => update({ is_published: e.target.value === "published" })}>
                  <option value="draft">📝 Draft</option>
                  <option value="published">✅ Published</option>
                </select>
              </FormField>
              <FormField label="Featured">
                <select value={form.is_featured ? "yes" : "no"} onChange={(e) => update({ is_featured: e.target.value === "yes" })}>
                  <option value="no">No</option>
                  <option value="yes">⭐ Yes</option>
                </select>
              </FormField>
            </div>
          </>
        )}

        {/* DESCRIPTION & HIGHLIGHTS */}
        {activeSection === "content" && (
          <>
            <FormField label="Full Description" hint="Detailed course description shown to students">
              <textarea rows={6} value={form.description ?? ""} onChange={(e) => update({ description: e.target.value })} placeholder="Full course description..." />
            </FormField>

            {/* Highlights */}
            <FormField label="Course Highlights" hint="Key selling points shown on course detail page (e.g. 🔴 Live Batch, 📝 Notes included)">
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  value={hlInput}
                  onChange={(e) => setHlInput(e.target.value)}
                  placeholder="e.g. 🔴 Live Batch every Sunday"
                  onKeyDown={(e) => e.key === "Enter" && addToArray("highlights" as any, hlInput, setHlInput)}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary" onClick={() => addToArray("highlights" as any, hlInput, setHlInput)}>Add</button>
              </div>
              {((form as any).highlights ?? []).map((h: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, padding: "6px 10px", background: "var(--color-surface-alt, #f8f9ff)", borderRadius: 6 }}>
                  <span style={{ flex: 1, fontSize: 13 }}>{h}</span>
                  <button style={{ border: "none", background: "none", cursor: "pointer", color: "var(--color-danger)", fontSize: 16 }} onClick={() => removeFromArray("highlights" as any, i)}>×</button>
                </div>
              ))}
            </FormField>

            {/* Learning Outcomes */}
            <FormField label="Learning Outcomes" hint="What students will learn (used as fallback if no highlights set)">
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={outInput} onChange={(e) => setOutInput(e.target.value)} placeholder="e.g. Understand all NCERT concepts" onKeyDown={(e) => e.key === "Enter" && addToArray("learning_outcomes", outInput, setOutInput)} style={{ flex: 1 }} />
                <button className="btn btn-secondary" onClick={() => addToArray("learning_outcomes", outInput, setOutInput)}>Add</button>
              </div>
              {(form.learning_outcomes ?? []).map((o, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, padding: "6px 10px", background: "var(--color-surface-alt, #f8f9ff)", borderRadius: 6 }}>
                  <span style={{ flex: 1, fontSize: 13 }}>✅ {o}</span>
                  <button style={{ border: "none", background: "none", cursor: "pointer", color: "var(--color-danger)", fontSize: 16 }} onClick={() => removeFromArray("learning_outcomes", i)}>×</button>
                </div>
              ))}
            </FormField>

            {/* Requirements */}
            <FormField label="Requirements / Prerequisites">
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={reqInput} onChange={(e) => setReqInput(e.target.value)} placeholder="e.g. Class 9 pass" onKeyDown={(e) => e.key === "Enter" && addToArray("requirements", reqInput, setReqInput)} style={{ flex: 1 }} />
                <button className="btn btn-secondary" onClick={() => addToArray("requirements", reqInput, setReqInput)}>Add</button>
              </div>
              {(form.requirements ?? []).map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, padding: "6px 10px", background: "var(--color-surface-alt, #f8f9ff)", borderRadius: 6 }}>
                  <span style={{ flex: 1, fontSize: 13 }}>📌 {r}</span>
                  <button style={{ border: "none", background: "none", cursor: "pointer", color: "var(--color-danger)", fontSize: 16 }} onClick={() => removeFromArray("requirements", i)}>×</button>
                </div>
              ))}
            </FormField>

            {/* Tags */}
            <FormField label="Tags" hint="Used for filtering (e.g. class-9, class-10, maths, science)">
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. class-10" onKeyDown={(e) => e.key === "Enter" && addToArray("tags", tagInput, setTagInput)} style={{ flex: 1 }} />
                <button className="btn btn-secondary" onClick={() => addToArray("tags", tagInput, setTagInput)}>Add</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(form.tags ?? []).map((t, i) => (
                  <span key={i} style={{ padding: "3px 10px", background: "var(--color-primary-light, #e8f0ff)", borderRadius: 20, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    {t}
                    <button style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, lineHeight: 1 }} onClick={() => removeFromArray("tags", i)}>×</button>
                  </span>
                ))}
              </div>
            </FormField>
          </>
        )}

        {/* BATCH & PRICING */}
        {activeSection === "batch" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              <FormField label="Batch Start Date" hint="Shown to students on course detail page">
                <input type="date" value={(form as any).start_date ?? ""} onChange={(e) => update({ start_date: e.target.value || null } as any)} />
              </FormField>
              <FormField label="Batch End Date">
                <input type="date" value={(form as any).end_date ?? ""} onChange={(e) => update({ end_date: e.target.value || null } as any)} />
              </FormField>
            </div>
            {!form.is_free && (
              <FormField label="Pricing Plan" hint="Controls price, discount and duration shown to students">
                <select
                  value={(form.pricing_plan as any)?.id ?? form.pricing_plan ?? ""}
                  onChange={(e) => update({ pricing_plan: e.target.value as any })}
                >
                  <option value="">Select plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price} {p.discount_price ? `(₹${p.discount_price} discounted)` : ""}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            <div style={{ padding: 14, background: "var(--color-surface-alt, #f8f9ff)", borderRadius: 8, fontSize: 13, color: "var(--color-muted)" }}>
              <strong>Tip:</strong> Create/edit pricing plans in <strong>Commerce → Pricing Plans</strong>.
            </div>
          </>
        )}

        {/* SEO & YOUTUBE */}
        {activeSection === "seo" && (
          <>
            <FormField label="YouTube Playlist URL" hint="Companion YouTube playlist for marketing (optional)">
              <input value={form.youtube_playlist_url ?? ""} onChange={(e) => update({ youtube_playlist_url: e.target.value })} placeholder="https://youtube.com/playlist?list=..." />
            </FormField>
            <FormField label="SEO Title">
              <input value={(form as any).seo_title ?? ""} onChange={(e) => update({ seo_title: e.target.value } as any)} placeholder="SEO optimized title..." />
            </FormField>
            <FormField label="SEO Description">
              <textarea rows={3} value={(form as any).seo_description ?? ""} onChange={(e) => update({ seo_description: e.target.value } as any)} placeholder="SEO meta description..." />
            </FormField>
          </>
        )}

        {saveError && (
          <div style={{ color: "var(--color-danger)", fontSize: 13, marginTop: 12, padding: "10px 14px", background: "#FEF3F2", borderRadius: 8 }}>
            {saveError}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: "var(--space-5)" }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ minWidth: 120 }}>
            {isSaving ? "Saving..." : isNew ? "Create Course" : "Save Changes"}
          </button>
          {!isNew && id && (
            <button className="btn btn-secondary" onClick={() => navigate(`/courses/curriculum?course=${id}`)}>
              📚 Curriculum Builder →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
