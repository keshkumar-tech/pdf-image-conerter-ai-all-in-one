import { NoteDocument } from "../types";

/* ------------------------------------------------------------------
   Study progress store
   A tiny localStorage-backed store shared by the workspace, the study
   tools and the study hub. Kept outside React so it survives route
   changes and remounts without prop drilling.
   ------------------------------------------------------------------ */

export interface SectionProgress {
  read: boolean;
  bookmarked: boolean;
  lastOpenedAt?: string;
}

export interface QuizAttempt {
  questionId: string;
  sectionTitle: string;
  correct: boolean;
  at: string;
}

export interface StudyStats {
  /** sectionId -> progress */
  sections: Record<string, SectionProgress>;
  /** Rolling log of quiz answers, used to compute weak spots. */
  attempts: QuizAttempt[];
  /** ISO date (yyyy-mm-dd) -> minutes studied */
  minutesByDay: Record<string, number>;
  /** Question ids the student got wrong and has not yet cleared. */
  weakQuestionIds: string[];
  /** Glossary terms scheduled for spaced review, keyed by term. */
  reviewQueue: Record<
    string,
    { box: number; dueAt: string; lastSeenAt?: string }
  >;
  lastActiveAt?: string;
}

const EMPTY: StudyStats = {
  sections: {},
  attempts: [],
  minutesByDay: {},
  weakQuestionIds: [],
  reviewQueue: {},
};

const keyFor = (videoId: string) => `noteflow:study:${videoId}`;

export const todayKey = (d: Date = new Date()) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export function loadStats(videoId: string): StudyStats {
  if (typeof localStorage === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(keyFor(videoId));
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<StudyStats> | null;
    if (!parsed) return { ...EMPTY };
    return {
      sections: parsed.sections ?? {},
      attempts: parsed.attempts ?? [],
      minutesByDay: parsed.minutesByDay ?? {},
      weakQuestionIds: parsed.weakQuestionIds ?? [],
      reviewQueue: parsed.reviewQueue ?? {},
      lastActiveAt: parsed.lastActiveAt,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveStats(videoId: string, stats: StudyStats) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      keyFor(videoId),
      JSON.stringify({ ...stats, lastActiveAt: new Date().toISOString() }),
    );
  } catch {
    /* quota or private mode — study state is a convenience, not critical */
  }
}

/* ---------------- Section helpers ---------------- */

export function setSectionFlag(
  videoId: string,
  stats: StudyStats,
  sectionId: string,
  patch: Partial<SectionProgress>,
): StudyStats {
  const prev = stats.sections[sectionId] ?? { read: false, bookmarked: false };
  const next: StudyStats = {
    ...stats,
    sections: {
      ...stats.sections,
      [sectionId]: {
        ...prev,
        ...patch,
        lastOpenedAt: new Date().toISOString(),
      },
    },
  };
  saveStats(videoId, next);
  return next;
}

export function countRead(stats: StudyStats, sections: { id: string }[]) {
  const read = sections.filter(
    (s) => stats.sections[s.id]?.read === true,
  ).length;
  return {
    read,
    total: sections.length,
    pct: sections.length ? Math.round((read / sections.length) * 100) : 0,
  };
}

/** Total minutes recorded across every day. */
export function totalMinutes(stats: StudyStats): number {
  return Object.keys(stats.minutesByDay).reduce(
    (sum, k) => sum + (stats.minutesByDay[k] ?? 0),
    0,
  );
}

/** Section ids the student has bookmarked. */
export function bookmarkedSectionIds(stats: StudyStats): string[] {
  return Object.keys(stats.sections).filter(
    (id) => stats.sections[id]?.bookmarked === true,
  );
}

/* ---------------- Quiz / weak spots ---------------- */

export function recordQuizRun(
  videoId: string,
  stats: StudyStats,
  results: { questionId: string; sectionTitle: string; correct: boolean }[],
): StudyStats {
  const weak = new Set(stats.weakQuestionIds);
  for (const r of results) {
    if (!r.correct) weak.add(r.questionId);
    // Answering it right does NOT auto-clear it — the student clears it
    // explicitly from the weak-spot drill, so one lucky guess is not enough.
  }
  const next: StudyStats = {
    ...stats,
    attempts: [
      ...results.map((r) => ({ ...r, at: new Date().toISOString() })),
      ...stats.attempts,
    ].slice(0, 200),
    weakQuestionIds: [...weak],
  };
  saveStats(videoId, next);
  return next;
}

export function clearWeakQuestion(
  videoId: string,
  stats: StudyStats,
  questionId: string,
): StudyStats {
  const next: StudyStats = {
    ...stats,
    weakQuestionIds: stats.weakQuestionIds.filter((id) => id !== questionId),
  };
  saveStats(videoId, next);
  return next;
}

/* ---------------- Spaced repetition (Leitner boxes) ---------------- */

const BOX_DAYS = [0, 1, 3, 7, 16, 35];

export function gradeReview(
  videoId: string,
  stats: StudyStats,
  term: string,
  remembered: boolean,
): StudyStats {
  const prev = stats.reviewQueue[term] ?? {
    box: 0,
    dueAt: new Date().toISOString(),
  };
  const box = remembered ? Math.min(prev.box + 1, BOX_DAYS.length - 1) : 0;
  const due = new Date();
  due.setDate(due.getDate() + (BOX_DAYS[box] || 0));
  const next: StudyStats = {
    ...stats,
    reviewQueue: {
      ...stats.reviewQueue,
      [term]: {
        box,
        dueAt: due.toISOString(),
        lastSeenAt: new Date().toISOString(),
      },
    },
  };
  saveStats(videoId, next);
  return next;
}

export function dueReviews(stats: StudyStats, terms: string[]) {
  const now = Date.now();
  return terms.filter((t) => {
    const entry = stats.reviewQueue[t];
    if (!entry) return true; // never seen — show it
    return new Date(entry.dueAt).getTime() <= now;
  });
}

/* ---------------- Study time (pomodoro) ---------------- */

export function addStudyMinutes(
  videoId: string,
  stats: StudyStats,
  minutes: number,
): StudyStats {
  const k = todayKey();
  const next: StudyStats = {
    ...stats,
    minutesByDay: {
      ...stats.minutesByDay,
      [k]: (stats.minutesByDay[k] ?? 0) + minutes,
    },
  };
  saveStats(videoId, next);
  return next;
}

export function streakDays(stats: StudyStats): number {
  let streak = 0;
  const d = new Date();
  // A streak stays alive if today OR yesterday has activity.
  if (!stats.minutesByDay[todayKey(d)]) d.setDate(d.getDate() - 1);
  while (stats.minutesByDay[todayKey(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/* ---------------- Export helpers ---------------- */

export function notesToMarkdown(
  notes: NoteDocument,
  videoUrl?: string,
): string {
  const lines: string[] = [];
  lines.push(`# ${notes.title}`, "");
  if (videoUrl) lines.push(`> Source: ${videoUrl}`, "");
  lines.push("## Overview", "", notes.executiveOverview, "");

  lines.push("## Chapters", "");
  for (const s of notes.sections) {
    lines.push(
      `### ${s.topicNumber}. ${s.title}  \`[${s.timestampFormatted}]\``,
      "",
    );
    lines.push(s.detailedExplanation, "");
    if (s.keyConcepts?.length) {
      lines.push("**Key concepts**", "");
      s.keyConcepts.forEach((c) => lines.push(`- ${c}`));
      lines.push("");
    }
    if (s.importantDefinitions?.length) {
      lines.push("**Definitions**", "");
      s.importantDefinitions.forEach((d) =>
        lines.push(`- **${d.term}** — ${d.definition}`),
      );
      lines.push("");
    }
    for (const f of s.formulas ?? []) {
      lines.push(
        `**${f.title}**`,
        "",
        "$$" + f.latex + "$$",
        "",
        f.explanation,
        "",
      );
    }
    for (const ex of s.examples ?? []) {
      lines.push(
        `**Example — ${ex.title}**`,
        "",
        ex.problem,
        "",
        ex.solution,
        "",
      );
    }
    if (s.commonMistakes?.length) {
      lines.push("**Common mistakes**", "");
      s.commonMistakes.forEach((m) =>
        lines.push(`- ❌ ${m.mistake} → ✅ ${m.correction}`),
      );
      lines.push("");
    }
  }

  if (notes.glossary?.length) {
    lines.push("## Glossary", "");
    notes.glossary.forEach((g) =>
      lines.push(`- **${g.term}** — ${g.definition}`),
    );
    lines.push("");
  }
  if (notes.quickRevisionPoints?.length) {
    lines.push("## Rapid revision", "");
    notes.quickRevisionPoints.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
    lines.push("");
  }
  if (notes.importantQuestions?.length) {
    lines.push("## Practice questions", "");
    notes.importantQuestions.forEach((q) =>
      lines.push(`**Q:** ${q.question}`, "", `**A:** ${q.answer}`, ""),
    );
  }
  if (notes.finalTakeaways?.length) {
    lines.push("## Takeaways", "");
    notes.finalTakeaways.forEach((t) => lines.push(`- ${t}`));
  }
  return lines.join("\n");
}

export function notesToAnkiCsv(notes: NoteDocument): string {
  const esc = (s: string) =>
    `"${(s ?? "").replace(/"/g, '""').replace(/\n/g, "<br>")}"`;
  const rows: string[] = [];
  for (const s of notes.sections) {
    for (const d of s.importantDefinitions ?? []) {
      rows.push(
        [esc(`Define: ${d.term}`), esc(d.definition), esc(s.title)].join(","),
      );
    }
    for (const c of s.keyConcepts ?? []) {
      rows.push(
        [esc(`${s.title}: key concept`), esc(c), esc(s.title)].join(","),
      );
    }
  }
  for (const g of notes.glossary ?? []) {
    rows.push(
      [
        esc(`Define: ${g.term}`),
        esc(g.definition),
        esc(g.category || "Glossary"),
      ].join(","),
    );
  }
  return rows.join("\n");
}

export function notesToPlainText(notes: NoteDocument): string {
  return notes.sections
    .map(
      (s) =>
        `${s.topicNumber}. ${s.title} [${s.timestampFormatted}]\n${s.detailedExplanation}\n` +
        (s.keyConcepts?.length
          ? `Key points: ${s.keyConcepts.join("; ")}\n`
          : ""),
    )
    .join("\n");
}

export function downloadFile(
  filename: string,
  content: string,
  mime = "text/plain",
) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export const fmtDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
