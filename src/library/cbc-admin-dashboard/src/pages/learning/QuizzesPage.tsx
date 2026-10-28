import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { FormField } from "@/components/FormField";
import { quizzesApi } from "@/services/resources";
import { apiClient } from "@/services/apiClient";
import type { Quiz } from "@/services/types";

const CLASS_OPTIONS = ["Class 9", "Class 10", "Class 11", "Class 12"];
const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
  "All Subjects",
];
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [classLevel, setClassLevel] = useState("Class 10");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [passingScorePercent, setPassingScorePercent] = useState(40);
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFree, setIsFree] = useState(true);

  // Questions state
  const [questions, setQuestions] = useState<
    Array<{
      prompt: string;
      explanation: string;
      marks: number;
      options: Array<{ text: string; is_correct: boolean }>;
    }>
  >([]);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const res = await quizzesApi.list({ ordering: "sort_order,-created_at", page_size: 100 } as any);
      setQuizzes(res.results || []);
    } catch (e) {
      console.error("Failed to load quizzes", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const openCreateModal = () => {
    setEditingQuiz(null);
    setTitle("");
    setClassLevel("Class 10");
    setSubject("Mathematics");
    setTopic("");
    setDifficulty("Easy");
    setTimeLimitMinutes(10);
    setPassingScorePercent(40);
    setDescription("");
    setInstructions("");
    setIsPublished(true);
    setIsFree(true);
    setQuestions([
      {
        prompt: "",
        explanation: "",
        marks: 1,
        options: [
          { text: "", is_correct: true },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      },
    ]);
    setModalOpen(true);
  };

  const openEditModal = async (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setTitle(quiz.title);
    setClassLevel(quiz.class_level || "Class 10");
    setSubject(quiz.subject || "Mathematics");
    setTopic(quiz.topic || "");
    setDifficulty(quiz.difficulty || "Easy");
    setTimeLimitMinutes(quiz.time_limit_seconds ? Math.round(quiz.time_limit_seconds / 60) : 10);
    setPassingScorePercent(quiz.passing_score_percent || 40);
    setDescription(quiz.description || "");
    setInstructions(quiz.instructions || "");
    setIsPublished(quiz.is_published !== false);
    setIsFree(quiz.is_free !== false);

    try {
      const res = await apiClient.get<any>(`/quizzes/${quiz.id}/admin_detail/`);
      const fullQuiz = res.data;
      if (fullQuiz.questions && fullQuiz.questions.length > 0) {
        setQuestions(
          fullQuiz.questions.map((q: any) => ({
            prompt: q.prompt,
            explanation: q.explanation || "",
            marks: q.marks || 1,
            options: (q.options || []).map((opt: any) => ({
              text: opt.text,
              is_correct: Boolean(opt.is_correct),
            })),
          }))
        );
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
    }

    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a quiz title.");
      return;
    }
    setSaving(true);

    const payload = {
      title: title.trim(),
      class_level: classLevel,
      subject,
      topic: topic.trim(),
      difficulty,
      time_limit_seconds: timeLimitMinutes * 60,
      passing_score_percent: passingScorePercent,
      marks_per_question: 1,
      total_marks: questions.length * 1,
      description: description.trim(),
      instructions: instructions.trim(),
      is_published: isPublished,
      is_free: isFree,
      allow_back_navigation: false,
      questions: questions.map((q, idx) => ({
        prompt: q.prompt.trim(),
        explanation: q.explanation.trim(),
        marks: q.marks || 1,
        order: idx + 1,
        question_type: "mcq",
        options: q.options.map((opt, oIdx) => ({
          text: opt.text.trim(),
          is_correct: opt.is_correct,
          order: oIdx + 1,
        })),
      })),
    };

    try {
      if (editingQuiz) {
        await quizzesApi.update(editingQuiz.id, payload as any);
      } else {
        await quizzesApi.create(payload as any);
      }
      setModalOpen(false);
      await loadQuizzes();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (quiz: Quiz) => {
    if (!confirm(`Are you sure you want to delete "${quiz.title}"?`)) return;
    try {
      await quizzesApi.remove(quiz.id);
      await loadQuizzes();
    } catch {
      alert("Could not delete quiz.");
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Quizzes"
        description="Comprehensive Quiz & MCQ Builder: syllabus topics, timer limits, difficulty, question options and explanations."
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            + New Quiz
          </button>
        }
      />

      <DataTable<Quiz>
        rows={quizzes}
        rowKey={(q) => q.id}
        isLoading={loading}
        emptyTitle="No quizzes found"
        emptyDescription="Create your first MCQ quiz with questions and timer limits."
        columns={[
          {
            key: "title",
            header: "Quiz & Syllabus Topic",
            render: (q) => (
              <div>
                <strong style={{ display: "block" }}>{q.title}</strong>
                {q.topic && (
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    📚 {q.topic}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "class_level",
            header: "Class & Subject",
            render: (q) => (
              <span>
                <Badge tone="neutral">{q.class_level || "Class 10"}</Badge>{" "}
                <Badge tone="primary">{q.subject || "General"}</Badge>
              </span>
            ),
          },
          {
            key: "difficulty",
            header: "Difficulty",
            render: (q) => {
              const diff = q.difficulty || "Easy";
              const tone = diff === "Easy" ? "success" : diff === "Medium" ? "warning" : "danger";
              return <Badge tone={tone}>{diff}</Badge>;
            },
          },
          {
            key: "questions",
            header: "Questions",
            render: (q) => `${q.questions_count ?? q.questions?.length ?? 10} Qs`,
          },
          {
            key: "time_limit_seconds",
            header: "Timer",
            render: (q) => (q.time_limit_seconds ? `${Math.round(q.time_limit_seconds / 60)} min` : "Untimed"),
          },
          {
            key: "passing_score_percent",
            header: "Pass %",
            render: (q) => `${q.passing_score_percent}%`,
          },
          {
            key: "is_published",
            header: "Status",
            render: (q) =>
              q.is_published !== false ? <Badge tone="success">Published</Badge> : <Badge tone="neutral">Draft</Badge>,
          },
          {
            key: "actions",
            header: "Actions",
            render: (q) => (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: 12 }}
                  onClick={() => openEditModal(q)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: 12, color: "var(--color-danger)" }}
                  onClick={() => handleDelete(q)}
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Quiz Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingQuiz ? "Edit Quiz" : "Create New Quiz"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingQuiz ? "Update Quiz" : "Create Quiz"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Quiz Title *">
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Class 10 Mathematics Board MCQ Quiz"
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Class Level">
              <select className="input" value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Subject">
              <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Topic / Syllabus">
            <input
              className="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Real Numbers, Polynomials & Linear Equations"
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <FormField label="Difficulty">
              <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Time Limit (Mins)">
              <input
                className="input"
                type="number"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
              />
            </FormField>

            <FormField label="Passing Score (%)">
              <input
                className="input"
                type="number"
                value={passingScorePercent}
                onChange={(e) => setPassingScorePercent(Number(e.target.value))}
              />
            </FormField>
          </div>

          <FormField label="Short Description">
            <textarea
              className="input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the quiz content..."
            />
          </FormField>

          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Published (Active for students)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              Free Quiz
            </label>
          </div>

          {/* Question List Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Questions ({questions.length})</h3>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12 }}
              onClick={() =>
                setQuestions((prev) => [
                  ...prev,
                  {
                    prompt: "",
                    explanation: "",
                    marks: 1,
                    options: [
                      { text: "", is_correct: true },
                      { text: "", is_correct: false },
                      { text: "", is_correct: false },
                      { text: "", is_correct: false },
                    ],
                  },
                ])
              }
            >
              + Add Question
            </button>
          </div>

          {/* Questions Editor */}
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: 12,
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <strong>Question {qIdx + 1}</strong>
                <button
                  type="button"
                  style={{ color: "var(--color-danger)", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
                >
                  Remove ✕
                </button>
              </div>

              <input
                className="input"
                style={{ marginBottom: 6 }}
                placeholder={`Question ${qIdx + 1} prompt...`}
                value={q.prompt}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuestions((prev) => {
                    const c = [...prev];
                    c[qIdx].prompt = val;
                    return c;
                  });
                }}
              />

              <input
                className="input"
                style={{ marginBottom: 10, fontSize: 12 }}
                placeholder="Explanation (revealed to students on review)..."
                value={q.explanation}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuestions((prev) => {
                    const c = [...prev];
                    c[qIdx].explanation = val;
                    return c;
                  });
                }}
              />

              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                4 Options (Select radio for correct answer):
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      name={`correct-q-${qIdx}`}
                      checked={opt.is_correct}
                      onChange={() => {
                        setQuestions((prev) => {
                          const c = [...prev];
                          c[qIdx].options = c[qIdx].options.map((o, idx) => ({
                            ...o,
                            is_correct: idx === oIdx,
                          }));
                          return c;
                        });
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{["A", "B", "C", "D"][oIdx]}.</span>
                    <input
                      className="input"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      placeholder={`Option ${["A", "B", "C", "D"][oIdx]} text`}
                      value={opt.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestions((prev) => {
                          const c = [...prev];
                          c[qIdx].options[oIdx].text = val;
                          return c;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

