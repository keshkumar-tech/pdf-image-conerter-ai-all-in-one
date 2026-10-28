import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";
import { LoadingState, EmptyState } from "@/components/StatusStates";
import { apiClient } from "@/services/apiClient";
import { coursesApi, modulesApi, lessonsApi, videosApi, resourcesApi, quizzesApi } from "@/services/resources";
import type { Course, Lesson, Module } from "@/services/types";

type LessonType = "video" | "pdf" | "source_code" | "template" | "quiz" | "assignment" | "project";

const LESSON_TYPE_ICONS: Record<LessonType, string> = {
  video: "🎥", pdf: "📄", source_code: "💻", template: "📁",
  quiz: "📝", assignment: "✏️", project: "🚀",
};

export default function CurriculumBuilderPage() {
  const [params] = useSearchParams();
  const courseId = params.get("course");
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editing state
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Content panel state
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [contentTab, setContentTab] = useState<"video" | "resources" | "quiz">("video");
  const [videoForm, setVideoForm] = useState({
    source: "youtube" as "youtube" | "upload",
    provider: "youtube", youtube_url: "", provider_asset_id: "", thumbnail_url: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingVideoFile, setExistingVideoFile] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [resourceForm, setResourceForm] = useState({ title: "", resource_type: "pdf", file_url: "", external_url: "", is_premium_only: true });
  const [quizForm, setQuizForm] = useState({ title: "", time_limit_seconds: 1200, passing_score_percent: 60 });
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (!courseId) { setIsLoading(false); return; }
    loadCurriculum();
  }, [courseId]);

  const loadCurriculum = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const [courseData, moduleData] = await Promise.all([
        coursesApi.retrieve(courseId),
        modulesApi.list({ course: courseId }),
      ]);
      setCourse(courseData);
      setModules(moduleData.results ?? []);
      if (moduleData.results?.length) {
        setExpandedModules(new Set([moduleData.results[0].id]));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addModule = async () => {
    if (!courseId) return;
    const created = await modulesApi.create({ course: courseId, title: "New Module", order: modules.length + 1 } as any);
    setModules((m) => [...m, created]);
    setExpandedModules((s) => new Set([...s, created.id]));
  };

  const saveModuleTitle = async (moduleId: string) => {
    await modulesApi.update(moduleId, { title: editingModuleTitle } as any);
    setModules((m) => m.map((mod) => mod.id === moduleId ? { ...mod, title: editingModuleTitle } : mod));
    setEditingModuleId(null);
  };

  const deleteModule = async (moduleId: string) => {
    if (!window.confirm("Delete this module and all its lessons?")) return;
    await (modulesApi as any).remove(moduleId);
    setModules((m) => m.filter((mod) => mod.id !== moduleId));
  };

  const addLesson = async (moduleId: string, type: LessonType = "video") => {
    const mod = modules.find((m) => m.id === moduleId);
    const order = (mod?.lessons?.length ?? 0) + 1;
    const created = await lessonsApi.create({
      module: moduleId, title: `New ${type} Lesson`, lesson_type: type, order,
    } as any);
    setModules((m) => m.map((mod) => mod.id === moduleId
      ? { ...mod, lessons: [...(mod.lessons ?? []), created] }
      : mod
    ));
    openLesson(created);
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!window.confirm("Delete this lesson?")) return;
    await (lessonsApi as any).remove(lessonId);
    setModules((m) => m.map((mod) => mod.id === moduleId
      ? { ...mod, lessons: (mod.lessons ?? []).filter((l) => l.id !== lessonId) }
      : mod
    ));
    if (activeLesson?.id === lessonId) setActiveLesson(null);
  };

  const openLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setContentTab(lesson.lesson_type as any === "quiz" ? "quiz" : lesson.lesson_type === "video" ? "video" : "resources");
    setSaveMsg("");
    // Reset + prefill video form from existing video record (YouTube URL or uploaded file)
    setVideoForm({ source: "youtube", provider: "youtube", youtube_url: "", provider_asset_id: "", thumbnail_url: "" });
    setVideoFile(null);
    setExistingVideoFile("");
    if (lesson.lesson_type === "video") {
      (videosApi as any).list({ lesson: lesson.id }).then((res: any) => {
        const v = res?.results?.[0];
        if (!v) return;
        const isYt = v.provider === "youtube" || !!v.youtube_url;
        setVideoForm({
          source: isYt ? "youtube" : "upload",
          provider: v.provider || (isYt ? "youtube" : "self"),
          youtube_url: v.youtube_url || "",
          provider_asset_id: v.provider_asset_id || "",
          thumbnail_url: v.thumbnail_url || "",
        });
        if (!isYt && v.playback_url) setExistingVideoFile(String(v.playback_url).split("/").pop() || v.playback_url);
      }).catch(() => undefined);
    }
  };

  const updateLesson = async (patch: Partial<Lesson>) => {
    if (!activeLesson) return;
    const updated = await lessonsApi.update(activeLesson.id, patch as any);
    setActiveLesson({ ...activeLesson, ...patch });
    setModules((m) => m.map((mod) => ({
      ...mod,
      lessons: (mod.lessons ?? []).map((l) => l.id === activeLesson.id ? { ...l, ...patch } : l),
    })));
  };

  const saveVideoContent = async () => {
    if (!activeLesson) return;
    setIsSavingContent(true);
    try {
      // Check if video exists for this lesson
      const existing = await (videosApi as any).list({ lesson: activeLesson.id });
      const videoId = existing.results?.[0]?.id;

      // Upload own video file (when chosen)
      if (videoFile) {
        const fd = new FormData();
        fd.append("lesson", activeLesson.id);
        fd.append("provider", "self");
        fd.append("is_protected", "true");
        fd.append("video_file", videoFile);
        if (videoId) await apiClient.patch(`/videos/${videoId}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        else await apiClient.post("/videos/", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setSaveMsg("✅ Video uploaded & saved!");
        setVideoFile(null);
        setExistingVideoFile(videoFile.name);
      } else {
        // YouTube URL / CDN asset id (JSON)
        const payload = {
          lesson: activeLesson.id,
          provider: videoForm.source === "youtube" ? "youtube" : videoForm.provider,
          youtube_url: videoForm.source === "youtube" ? videoForm.youtube_url : "",
          provider_asset_id: videoForm.provider_asset_id,
          thumbnail_url: videoForm.thumbnail_url,
        };
        if (videoId) {
          await (videosApi as any).update(videoId, payload);
        } else {
          await (videosApi as any).create(payload);
        }
        setSaveMsg("✅ Video saved!");
        setVideoFile(null);
      }
    } catch {
      setSaveMsg("❌ Save failed.");
    } finally {
      setIsSavingContent(false);
    }
  };

  const saveResourceContent = async () => {
    if (!activeLesson) return;
    setIsSavingContent(true);
    try {
      await resourcesApi.create({ ...resourceForm, lesson: activeLesson.id } as any);
      setSaveMsg("✅ Resource added!");
      setResourceForm({ title: "", resource_type: "pdf", file_url: "", external_url: "", is_premium_only: true });
    } catch {
      setSaveMsg("❌ Save failed.");
    } finally {
      setIsSavingContent(false);
    }
  };

  const saveQuizContent = async () => {
    if (!activeLesson) return;
    setIsSavingContent(true);
    try {
      const existing = await (quizzesApi as any).list({ lesson: activeLesson.id });
      const payload = { ...quizForm, lesson: activeLesson.id };
      if (existing.results?.length) {
        await quizzesApi.update(existing.results[0].id, payload as any);
      } else {
        await quizzesApi.create(payload as any);
      }
      setSaveMsg("✅ Quiz saved!");
    } catch {
      setSaveMsg("❌ Save failed.");
    } finally {
      setIsSavingContent(false);
    }
  };

  if (!courseId) return (
    <div>
      <PageHeader title="Curriculum Builder" description="Select a course to edit its curriculum." />
      <EmptyState title="No course selected" description="Open a course, then click 'Open Curriculum Builder'."
        action={<button className="btn btn-primary" onClick={() => navigate("/courses")}>Go to Courses</button>} />
    </div>
  );

  if (isLoading) return <LoadingState label="Loading curriculum..." />;

  return (
    <div style={{ display: "flex", gap: "var(--space-5)", alignItems: "flex-start" }}>
      {/* LEFT PANEL — Module/Lesson tree */}
      <div style={{ flex: "0 0 420px" }}>
        <PageHeader
          title={`Curriculum: ${course?.title ?? ""}`}
          description="Add modules and lessons. Click a lesson to edit its content."
          actions={<button className="btn btn-primary" onClick={addModule}>+ Add Module</button>}
        />

        {modules.length === 0 ? (
          <EmptyState title="No modules yet" description="Add your first module to start building the curriculum." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {modules.map((mod, modIdx) => (
              <div key={mod.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Module header */}
                <div style={{
                  display: "flex", alignItems: "center", padding: "12px 16px",
                  background: "var(--color-surface-alt, #f8f9ff)", gap: 10,
                  borderBottom: "1px solid var(--color-border)",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, background: "var(--color-primary)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13, flexShrink: 0,
                  }}>{modIdx + 1}</div>

                  {editingModuleId === mod.id ? (
                    <>
                      <input
                        value={editingModuleTitle}
                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                        style={{ flex: 1, fontSize: 14 }}
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveModuleTitle(mod.id)}
                      />
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => saveModuleTitle(mod.id)}>Save</button>
                      <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setEditingModuleId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <strong style={{ flex: 1, fontSize: 14 }}>{mod.title}</strong>
                      <button className="btn btn-secondary" style={{ fontSize: 11, padding: "3px 8px" }}
                        onClick={() => { setEditingModuleId(mod.id); setEditingModuleTitle(mod.title); }}>✏️</button>
                      <button className="btn btn-secondary" style={{ fontSize: 11, padding: "3px 8px", color: "var(--color-danger)" }}
                        onClick={() => deleteModule(mod.id)}>🗑️</button>
                    </>
                  )}
                </div>

                {/* Lessons */}
                <div style={{ padding: "8px 0" }}>
                  {(mod.lessons ?? []).map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => openLesson(lesson)}
                      style={{
                        padding: "9px 16px", cursor: "pointer", display: "flex",
                        justifyContent: "space-between", alignItems: "center",
                        background: activeLesson?.id === lesson.id ? "var(--color-primary-light, #e8f0ff)" : "transparent",
                        borderLeft: activeLesson?.id === lesson.id ? "3px solid var(--color-primary)" : "3px solid transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{LESSON_TYPE_ICONS[lesson.lesson_type as LessonType] ?? "📌"}</span>
                        <span>{lesson.order}. {lesson.title}</span>
                        {lesson.is_free_preview && <span style={{ fontSize: 10, background: "#12B76A20", color: "#12B76A", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>FREE</span>}
                      </span>
                      <button
                        style={{ fontSize: 10, background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)", padding: "2px 6px" }}
                        onClick={(e) => { e.stopPropagation(); deleteLesson(mod.id, lesson.id); }}
                      >🗑️</button>
                    </div>
                  ))}

                  {/* Add lesson dropdown */}
                  <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(["video", "pdf", "quiz", "assignment"] as LessonType[]).map((type) => (
                      <button
                        key={type}
                        className="btn btn-secondary"
                        style={{ fontSize: 11, padding: "4px 8px" }}
                        onClick={() => addLesson(mod.id, type)}
                      >
                        + {LESSON_TYPE_ICONS[type]} {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT PANEL — Lesson content editor */}
      {activeLesson && (
        <div style={{ flex: 1, position: "sticky", top: 20 }}>
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <h3 style={{ marginTop: 0, fontSize: 16 }}>
              {LESSON_TYPE_ICONS[activeLesson.lesson_type as LessonType]} Edit: {activeLesson.title}
            </h3>

            {/* Lesson meta */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
              <FormField label="Lesson Title">
                <input
                  value={activeLesson.title}
                  onChange={(e) => updateLesson({ title: e.target.value })}
                />
              </FormField>
              <FormField label="Type">
                <select
                  value={activeLesson.lesson_type}
                  onChange={(e) => updateLesson({ lesson_type: e.target.value })}
                >
                  {Object.entries(LESSON_TYPE_ICONS).map(([type, icon]) => (
                    <option key={type} value={type}>{icon} {type}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Duration (minutes)">
                <input
                  type="number"
                  value={activeLesson.duration_minutes}
                  onChange={(e) => updateLesson({ duration_minutes: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Free Preview">
                <select
                  value={activeLesson.is_free_preview ? "yes" : "no"}
                  onChange={(e) => updateLesson({ is_free_preview: e.target.value === "yes" })}
                >
                  <option value="no">No — requires enrollment</option>
                  <option value="yes">Yes — free preview</option>
                </select>
              </FormField>
            </div>

            {/* Content tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-4)", gap: 4 }}>
              {[
                { key: "video", label: "🎥 Video" },
                { key: "resources", label: "📎 PDFs / Resources" },
                { key: "quiz", label: "📝 Quiz" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setContentTab(key as any)}
                  style={{
                    padding: "8px 14px", border: "none", background: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600,
                    borderBottom: contentTab === key ? "2px solid var(--color-primary)" : "2px solid transparent",
                    color: contentTab === key ? "var(--color-primary)" : "var(--color-muted)",
                  }}
                >{label}</button>
              ))}
            </div>

            {/* Video tab */}
            {contentTab === "video" && (
              <div>
                {/* Choose source: YouTube URL OR Upload own video */}
                <FormField label="Video Source">
                  <div style={{ display: "flex", gap: 8 }}>
                    {([
                      { key: "youtube", label: "▶️ YouTube Link" },
                      { key: "upload", label: "📤 Upload My Video (mp4)" },
                    ] as const).map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setVideoForm((f) => ({ ...f, source: key, youtube_url: "", provider_asset_id: "" }))}
                        style={{
                          flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                          fontSize: 13, fontWeight: 700, border: "1px solid var(--color-border)",
                          background: videoForm.source === key ? "var(--color-primary)" : "var(--color-surface-alt, #f8f9ff)",
                          color: videoForm.source === key ? "#fff" : "var(--color-muted)",
                        }}
                      >{label}</button>
                    ))}
                  </div>
                </FormField>

                {videoForm.source === "youtube" ? (
                  <FormField label="YouTube Video URL">
                    <input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoForm.youtube_url}
                      onChange={(e) => setVideoForm({ ...videoForm, youtube_url: e.target.value })}
                    />
                  </FormField>
                ) : (
                  <FormField label="Upload Video File">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label
                        className="btn btn-secondary"
                        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}
                      >
                        {uploadingVideo ? "Uploading..." : videoFile ? `🎬 ${videoFile.name}` : existingVideoFile ? `🔄 Replace: ${existingVideoFile}` : "📂 Choose Video File (.mp4)"}
                        <input
                          type="file"
                          accept="video/*,.mp4"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) { setVideoFile(f); setExistingVideoFile(""); }
                          }}
                        />
                      </label>
                      {videoFile && <span style={{ fontSize: 11, color: "var(--color-muted)" }}>Uploaded instantly on Save. MP4/H.264 files play best on phones.</span>}
                    </div>
                  </FormField>
                )}

                <FormField label="Provider (advanced)" hint="Only needed for CDN-based videos (Mux/Bunny/Cloudflare).">
                  <select
                    value={videoForm.source === "youtube" ? "youtube" : videoForm.provider}
                    onChange={(e) => setVideoForm({ ...videoForm, provider: e.target.value, source: e.target.value === "youtube" ? "youtube" : videoForm.source })}
                    disabled={videoForm.source === "youtube"}
                  >
                    <option value="youtube">YouTube</option>
                    <option value="self">Self upload (mp4)</option>
                    <option value="mux">Mux</option>
                    <option value="bunny">Bunny.net</option>
                    <option value="cloudflare_stream">Cloudflare Stream</option>
                  </select>
                </FormField>
                <FormField label="Provider Asset ID">
                  <input
                    placeholder="Asset ID from your CDN provider (optional for self upload)"
                    value={videoForm.provider_asset_id}
                    onChange={(e) => setVideoForm({ ...videoForm, provider_asset_id: e.target.value })}
                  />
                </FormField>
                <FormField label="Thumbnail URL (optional)">
                  <input
                    placeholder="https://..."
                    value={videoForm.thumbnail_url}
                    onChange={(e) => setVideoForm({ ...videoForm, thumbnail_url: e.target.value })}
                  />
                </FormField>
                <button className="btn btn-primary" onClick={saveVideoContent} disabled={isSavingContent}>
                  {isSavingContent ? "Saving..." : videoFile ? "⬆️ Upload Video" : "Save Video"}
                </button>
              </div>
            )}

            {/* Resources tab */}
            {contentTab === "resources" && (
              <div>
                <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 0 }}>
                  Add PDFs, notes, source code and other attachments to this lesson.
                </p>
                <FormField label="Title">
                  <input
                    placeholder="e.g. Chapter 1 Notes PDF"
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  />
                </FormField>
                <FormField label="Type">
                  <select value={resourceForm.resource_type} onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })}>
                    <option value="pdf">📄 PDF</option>
                    <option value="source_code">💻 Source Code</option>
                    <option value="zip">🗜️ ZIP Archive</option>
                    <option value="template">📁 Template</option>
                    <option value="cheat_sheet">📋 Cheat Sheet</option>
                    <option value="link">🔗 External Link</option>
                  </select>
                </FormField>
                <FormField label="File URL (hosted PDF/file)">
                  <input
                    placeholder="https://storage.example.com/file.pdf"
                    value={resourceForm.file_url}
                    onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                  />
                </FormField>
                <FormField label="External URL (for links)">
                  <input
                    placeholder="https://github.com/..."
                    value={resourceForm.external_url}
                    onChange={(e) => setResourceForm({ ...resourceForm, external_url: e.target.value })}
                  />
                </FormField>
                <FormField label="Access">
                  <select value={resourceForm.is_premium_only ? "premium" : "free"}
                    onChange={(e) => setResourceForm({ ...resourceForm, is_premium_only: e.target.value === "premium" })}>
                    <option value="premium">🔒 Premium only</option>
                    <option value="free">🆓 Free for everyone</option>
                  </select>
                </FormField>
                <button className="btn btn-primary" onClick={saveResourceContent} disabled={isSavingContent}>
                  {isSavingContent ? "Adding..." : "+ Add Resource"}
                </button>
              </div>
            )}

            {/* Quiz tab */}
            {contentTab === "quiz" && (
              <div>
                <FormField label="Quiz Title">
                  <input
                    placeholder="e.g. Chapter 1 Practice Test"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  />
                </FormField>
                <FormField label="Time Limit (seconds, 0 = untimed)">
                  <input
                    type="number"
                    value={quizForm.time_limit_seconds}
                    onChange={(e) => setQuizForm({ ...quizForm, time_limit_seconds: Number(e.target.value) })}
                  />
                </FormField>
                <FormField label="Passing Score (%)">
                  <input
                    type="number"
                    value={quizForm.passing_score_percent}
                    onChange={(e) => setQuizForm({ ...quizForm, passing_score_percent: Number(e.target.value) })}
                  />
                </FormField>
                <button className="btn btn-primary" onClick={saveQuizContent} disabled={isSavingContent}>
                  {isSavingContent ? "Saving..." : "Save Quiz"}
                </button>
                <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 12 }}>
                  After saving the quiz, go to <strong>Learning → Quizzes</strong> to add questions and answer options.
                </p>
              </div>
            )}

            {saveMsg && (
              <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 8,
                background: saveMsg.includes("✅") ? "#12B76A15" : "#EF444415",
                color: saveMsg.includes("✅") ? "#12B76A" : "#EF4444",
                fontWeight: 600, fontSize: 13,
              }}>{saveMsg}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
