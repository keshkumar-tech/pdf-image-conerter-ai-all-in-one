import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Search,
  X,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Flame,
  Target,
  Check,
  Download,
  Copy,
  Keyboard,
  ChevronRight,
  BookOpen,
  Clock,
  Command,
  Coffee,
  Award,
  FileText,
  Table2,
} from "lucide-react";
import { NoteDocument } from "../types";
import {
  StudyStats,
  notesToMarkdown,
  notesToAnkiCsv,
  notesToPlainText,
  downloadFile,
  slugify,
  fmtDuration,
  todayKey,
  streakDays,
  totalMinutes,
} from "../utils/studyState";

/* =================================================================
   Command palette (Ctrl/Cmd + K)
   ================================================================= */

interface CommandPaletteProps {
  notes: NoteDocument;
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSeek: (seconds: number) => void;
  onOpenStudyTools: () => void;
}

interface Hit {
  kind: "chapter" | "term" | "formula" | "question" | "action";
  label: string;
  sub: string;
  seconds?: number;
  action?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  notes,
  videoUrl,
  isOpen,
  onClose,
  onSeek,
  onOpenStudyTools,
}) => {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build the searchable index once per notes document.
  const index = useMemo<Hit[]>(() => {
    const hits: Hit[] = [];
    for (const s of notes.sections) {
      hits.push({
        kind: "chapter",
        label: `${s.topicNumber}. ${s.title}`,
        sub: `Chapter • [${s.timestampFormatted}]`,
        seconds: s.timestampSeconds,
      });
      for (const d of s.importantDefinitions ?? []) {
        hits.push({
          kind: "term",
          label: d.term,
          sub: s.title,
          seconds: s.timestampSeconds,
        });
      }
      for (const f of s.formulas ?? []) {
        hits.push({
          kind: "formula",
          label: f.title,
          sub: `Formula • ${s.title}`,
          seconds: f.timestampSeconds ?? s.timestampSeconds,
        });
      }
    }
    for (const g of notes.glossary ?? []) {
      hits.push({ kind: "term", label: g.term, sub: g.category || "Glossary" });
    }
    for (const question of notes.importantQuestions ?? []) {
      hits.push({
        kind: "question",
        label: question.question,
        sub: "Review question",
      });
    }
    hits.push(
      {
        kind: "action",
        label: "Open Study Tools",
        sub: "MCQs, flashcards, cheat sheet",
        action: onOpenStudyTools,
      },
      {
        kind: "action",
        label: "Copy notes as Markdown",
        sub: "Clipboard",
        action: () =>
          navigator.clipboard.writeText(notesToMarkdown(notes, videoUrl)),
      },
      {
        kind: "action",
        label: "Download Markdown",
        sub: ".md file",
        action: () =>
          downloadFile(
            `${slugify(notes.title)}.md`,
            notesToMarkdown(notes, videoUrl),
            "text/markdown",
          ),
      },
      {
        kind: "action",
        label: "Download Anki deck (CSV)",
        sub: "Import into Anki",
        action: () =>
          downloadFile(
            `${slugify(notes.title)}-anki.csv`,
            notesToAnkiCsv(notes),
            "text/csv",
          ),
      },
    );
    return hits;
  }, [notes, videoUrl, onOpenStudyTools]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return index.slice(0, 9);
    return index
      .filter(
        (h) =>
          h.label.toLowerCase().includes(needle) ||
          h.sub.toLowerCase().includes(needle),
      )
      .slice(0, 12);
  }, [q, index]);

  useEffect(() => {
    if (isOpen) {
      setQ("");
      setCursor(0);
      // Focus after paint so the element exists.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => setCursor(0), [q]);

  const run = useCallback(
    (hit: Hit) => {
      if (hit.seconds !== undefined) onSeek(hit.seconds);
      hit.action?.();
      onClose();
    },
    [onSeek, onClose],
  );

  if (!isOpen) return null;

  const ICONS: Record<Hit["kind"], React.ReactNode> = {
    chapter: <BookOpen className="h-3.5 w-3.5" />,
    term: <FileText className="h-3.5 w-3.5" />,
    formula: <Table2 className="h-3.5 w-3.5" />,
    question: <Target className="h-3.5 w-3.5" />,
    action: <Command className="h-3.5 w-3.5" />,
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="cf-pop-in w-full max-w-2xl overflow-hidden rounded-2xl border-[var(--cf-border)] bg-white/97 shadow-2xl shadow-fuchsia-500/20 backdrop-blur-2xl dark:bg-[#0d1224]/97"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cf-rainbow-bar h-1 w-full" />

        <div className="flex items-center gap-3 border-b border-[var(--cf-border)] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-fuchsia-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(c + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              } else if (e.key === "Enter" && results[cursor]) {
                e.preventDefault();
                run(results[cursor]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Search chapters, terms, formulas or run a command…"
            className="w-full bg-transparent text-sm font-medium text-[var(--cf-text-primary)] outline-none placeholder:text-[var(--cf-text-muted)]"
          />
          <kbd className="hidden shrink-0 rounded-md border-[var(--cf-border)] bg-[var(--cf-surface)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--cf-text-muted)] sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-[var(--cf-text-muted)]">
              No matches for “{q}”
            </p>
          ) : (
            results.map((hit, i) => (
              <button
                key={`${hit.kind}-${hit.label}-${i}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => run(hit)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  i === cursor
                    ? "bg-fuchsia-500/10"
                    : "hover:bg-[var(--cf-surface)]"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    i === cursor
                      ? "bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white"
                      : "bg-[var(--cf-surface-2)] text-[var(--cf-text-secondary)]"
                  }`}
                >
                  {ICONS[hit.kind]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-[var(--cf-text-primary)]">
                    {hit.label}
                  </span>
                  <span className="block truncate text-[10px] text-[var(--cf-text-muted)]">
                    {hit.sub}
                  </span>
                </span>
                {hit.seconds !== undefined && (
                  <span className="shrink-0 font-mono text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-300">
                    {Math.floor(hit.seconds / 60)}:
                    {String(Math.floor(hit.seconds % 60)).padStart(2, "0")}
                  </span>
                )}
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 text-[var(--cf-text-muted)] ${i === cursor ? "opacity-100" : "opacity-0"}`}
                />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--cf-border)] bg-[var(--cf-surface)] px-4 py-2 text-[10px] font-semibold text-[var(--cf-text-muted)]">
          <span className="flex items-center gap-3">
            <span>
              <kbd className="font-mono">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono">↵</kbd> open
            </span>
          </span>
          <span>{index.length} indexed items</span>
        </div>
      </div>
    </div>
  );
};

/* =================================================================
   Pomodoro study timer
   ================================================================= */

interface PomodoroProps {
  videoId: string;
  onSessionComplete: (minutes: number) => void;
}

const MODES = [
  {
    key: "focus",
    label: "Focus",
    minutes: 25,
    icon: <Target className="h-3 w-3" />,
  },
  {
    key: "short",
    label: "Break",
    minutes: 5,
    icon: <Coffee className="h-3 w-3" />,
  },
  {
    key: "long",
    label: "Long",
    minutes: 15,
    icon: <Coffee className="h-3 w-3" />,
  },
] as const;

export const PomodoroTimer: React.FC<PomodoroProps> = ({
  videoId,
  onSessionComplete,
}) => {
  const [modeIdx, setModeIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60);
  const [running, setRunning] = useState(false);

  const mode = MODES[modeIdx];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          if (mode.key === "focus") onSessionComplete(mode.minutes);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode.key, mode.minutes, onSessionComplete]);

  const switchMode = (i: number) => {
    setModeIdx(i);
    setRunning(false);
    setSecondsLeft(MODES[i].minutes * 60);
  };

  const total = mode.minutes * 60;
  const pct = total ? ((total - secondsLeft) / total) * 100 : 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="rounded-2xl border-[var(--cf-border)] bg-white/70 p-3 backdrop-blur dark:bg-white/[0.04]">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--cf-text-secondary)]">
          <Timer className="h-3 w-3 text-fuchsia-500" />
          Pomodoro
        </span>
        <div className="flex gap-0.5">
          {MODES.map((m, i) => (
            <button
              key={m.key}
              onClick={() => switchMode(i)}
              title={m.label}
              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold transition-colors ${
                i === modeIdx
                  ? "bg-fuchsia-500 text-white"
                  : "text-[var(--cf-text-muted)] hover:bg-[var(--cf-surface-2)]"
              }`}
            >
              {m.minutes}m
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0">
          <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="var(--cf-border)"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="url(#pomoGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
            />
            <defs>
              <linearGradient id="pomoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff2d95" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-black text-[var(--cf-text-primary)]">
            {mm}:{ss}
          </span>
        </div>

        <div className="flex flex-1 gap-1.5">
          <button
            onClick={() => setRunning((r) => !r)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-[11px] font-extrabold transition-all ${
              running
                ? "bg-[var(--cf-surface-2)] text-[var(--cf-text-primary)]"
                : "cf-btn-rainbow"
            }`}
          >
            {running ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3 fill-current" />
            )}
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={() => switchMode(modeIdx)}
            title="Reset timer"
            className="rounded-lg border-[var(--cf-border)] p-2 text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =================================================================
   Study stats strip
   ================================================================= */

export const StudyStatsStrip: React.FC<{
  stats: StudyStats;
  readPct: number;
}> = ({ stats, readPct }) => {
  const minutesToday = stats.minutesByDay[todayKey()] ?? 0;
  const totalMinutesAll = totalMinutes(stats);
  const streak = streakDays(stats);

  const tiles = [
    {
      icon: <BookOpen className="h-3.5 w-3.5" />,
      value: `${readPct}%`,
      label: "Chapters read",
      grad: "from-fuchsia-500 to-pink-600",
    },
    {
      icon: <Timer className="h-3.5 w-3.5" />,
      value: `${minutesToday}m`,
      label: "Today",
      grad: "from-cyan-400 to-blue-600",
    },
    {
      icon: <Flame className="h-3.5 w-3.5" />,
      value: `${streak}d`,
      label: "Streak",
      grad: "from-amber-400 to-orange-600",
    },
    {
      icon: <Award className="h-3.5 w-3.5" />,
      value: fmtDuration(totalMinutesAll),
      label: "All time",
      grad: "from-violet-500 to-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="flex items-center gap-2 rounded-xl border-[var(--cf-border)] bg-white/70 px-2.5 py-2 backdrop-blur transition-transform hover:-translate-y-0.5 dark:bg-white/[0.04]"
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${t.grad} text-white`}
          >
            {t.icon}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black leading-none text-[var(--cf-text-primary)]">
              {t.value}
            </span>
            <span className="block truncate text-[9px] font-bold uppercase tracking-wide text-[var(--cf-text-muted)]">
              {t.label}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

/* =================================================================
   Export pack
   ================================================================= */

const EXPORTS = [
  {
    key: "md",
    label: "Markdown",
    note: "Obsidian, Notion, GitHub",
    ext: "md",
    mime: "text/markdown",
  },
  {
    key: "anki",
    label: "Anki CSV",
    note: "Flashcard import",
    ext: "csv",
    mime: "text/csv",
  },
  {
    key: "txt",
    label: "Plain text",
    note: "Anywhere",
    ext: "txt",
    mime: "text/plain",
  },
] as const;

export const ExportPack: React.FC<{
  notes: NoteDocument;
  videoUrl: string;
  onClose: () => void;
}> = ({ notes, videoUrl, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const build = (key: (typeof EXPORTS)[number]["key"]) =>
    key === "md"
      ? notesToMarkdown(notes, videoUrl)
      : key === "anki"
        ? notesToAnkiCsv(notes)
        : notesToPlainText(notes);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="cf-pop-in w-full max-w-lg overflow-hidden rounded-2xl border-[var(--cf-border)] bg-white/97 shadow-2xl dark:bg-[#0d1224]/97"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cf-rainbow-bar h-1 w-full" />
        <div className="flex items-center justify-between border-b border-[var(--cf-border)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-fuchsia-500" />
            <h3 className="text-sm font-black text-[var(--cf-text-primary)]">
              Take your notes anywhere
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--cf-text-muted)] transition-colors hover:text-rose-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 p-4">
          {EXPORTS.map((e) => (
            <div
              key={e.key}
              className="flex items-center gap-3 rounded-xl border-[var(--cf-border)] bg-[var(--cf-surface)] p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-[10px] font-black text-white">
                {e.ext.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-[var(--cf-text-primary)]">
                  {e.label}
                </span>
                <span className="block text-[10px] text-[var(--cf-text-muted)]">
                  {e.note}
                </span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(build(e.key));
                  setCopied(e.key);
                  setTimeout(() => setCopied(null), 1600);
                }}
                className="rounded-lg border-[var(--cf-border)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600"
              >
                {copied === e.key ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() =>
                  downloadFile(
                    `${slugify(notes.title)}.${e.ext}`,
                    build(e.key),
                    e.mime,
                  )
                }
                className="rounded-lg border-[var(--cf-border)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <p className="border-t border-[var(--cf-border)] bg-[var(--cf-surface)] px-5 py-2.5 text-[10px] text-[var(--cf-text-muted)]">
          Anki CSV imports directly as a Basic deck — term on the front,
          definition on the back.
        </p>
      </div>
    </div>
  );
};

/* =================================================================
   Keyboard shortcuts help
   ================================================================= */

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], label: "Open command palette" },
  { keys: ["F"], label: "Toggle focus mode" },
  { keys: ["T"], label: "Toggle transcript / chat" },
  { keys: ["S"], label: "Open study tools" },
  { keys: ["E"], label: "Export notes" },
  { keys: ["J"], label: "Next chapter" },
  { keys: ["K"], label: "Previous chapter" },
  { keys: ["Esc"], label: "Close overlays" },
];

export const ShortcutsHelp: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="cf-pop-in w-full max-w-sm overflow-hidden rounded-2xl border-[var(--cf-border)] bg-white/97 shadow-2xl dark:bg-[#0d1224]/97"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cf-rainbow-bar h-1 w-full" />
        <div className="flex items-center justify-between border-b border-[var(--cf-border)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-fuchsia-500" />
            <h3 className="text-sm font-black text-[var(--cf-text-primary)]">
              Keyboard shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--cf-text-muted)] transition-colors hover:text-rose-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1 p-3">
          {SHORTCUTS.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-[var(--cf-surface)]"
            >
              <span className="text-xs font-semibold text-[var(--cf-text-secondary)]">
                {s.label}
              </span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded-md border-[var(--cf-border)] bg-[var(--cf-surface-2)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--cf-text-primary)]"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className="border-t border-[var(--cf-border)] bg-[var(--cf-surface)] px-5 py-2.5 text-[10px] text-[var(--cf-text-muted)]">
          Shortcuts are ignored while typing in a text field.
        </p>
      </div>
    </div>
  );
};

/* =================================================================
   Chapter rail — persistent progress navigator
   ================================================================= */

export interface RailSection {
  id: string;
  topicNumber: number;
  title: string;
  timestampFormatted: string;
  read: boolean;
}

export const ChapterRail: React.FC<{
  sections: RailSection[];
  activeId: string;
  readPct: number;
  onJump: (id: string) => void;
}> = ({ sections, activeId, readPct, onJump }) => (
  <div className="rounded-2xl border-[var(--cf-border)] bg-white/70 p-3 backdrop-blur dark:bg-white/[0.04]">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--cf-text-secondary)]">
        Chapters
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-[var(--cf-surface-2)]">
          <span
            className="cf-rainbow-bar block h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, readPct))}%` }}
          />
        </span>
        <span className="font-mono text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-300">
          {readPct}%
        </span>
      </span>
    </div>

    <div className="relative max-h-[240px] space-y-0.5 overflow-y-auto pl-3">
      {/* vertical guide line */}
      <span className="absolute left-1 top-1 bottom-1 w-px bg-[var(--cf-border)]" />
      {sections.map((s) => {
        const isActive = s.id === activeId;
        return (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className={`group relative flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
              isActive ? "bg-fuchsia-500/10" : "hover:bg-[var(--cf-surface)]"
            }`}
          >
            {/* node */}
            <span
              className={`absolute -left-2 h-2 w-2 rounded-full border-2 transition-all ${
                s.read
                  ? "border-emerald-500 bg-emerald-500"
                  : isActive
                    ? "border-fuchsia-500 bg-white"
                    : "border-[var(--cf-border-strong)] bg-white"
              }`}
            />
            <span className="font-mono text-[10px] font-bold text-[var(--cf-text-muted)]">
              {String(s.topicNumber).padStart(2, "0")}
            </span>
            <span
              className={`min-w-0 flex-1 truncate text-[11px] font-bold ${
                isActive
                  ? "text-fuchsia-600 dark:text-fuchsia-300"
                  : "text-[var(--cf-text-secondary)]"
              }`}
            >
              {s.title}
            </span>
            {s.read && <Check className="h-3 w-3 shrink-0 text-emerald-500" />}
          </button>
        );
      })}
    </div>
  </div>
);
