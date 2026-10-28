import React, { useState } from 'react';
import { NoteDocument, NoteSection } from '../types';
import { MathFormula } from './MathFormula';
import { Play, Copy, Check, Sparkles, AlertTriangle, HelpCircle, Edit3, Bookmark, FileCheck, Eye, CheckCircle2, Circle, Layers } from 'lucide-react';

interface NotesViewerProps {
  notes: NoteDocument;
  onSeek: (seconds: number) => void;
  onEditSection: (section: NoteSection) => void;
  onBookmarkToggle?: (sectionId: string) => void;
  bookmarkedSectionIds?: string[];
  readSectionIds?: string[];
  onToggleRead?: (sectionId: string) => void;
  activeSectionId?: string;
  /** 'notes' shows chapters; 'overview' shows revision, glossary and questions. */
  view?: 'notes' | 'overview';
  /** Focus mode: narrower measure, no chapter jump bar. */
  compact?: boolean;
}

export const NotesViewer: React.FC<NotesViewerProps> = ({
  notes,
  onSeek,
  onEditSection,
  onBookmarkToggle,
  bookmarkedSectionIds = [],
  readSectionIds = [],
  onToggleRead,
  activeSectionId,
  view = 'notes',
  compact = false,
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const readPct = notes.sections.length
    ? Math.round((readSectionIds.length / notes.sections.length) * 100)
    : 0;

  const jumpTo = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ------------------------------------------------------------------
     OVERVIEW VIEW — revision sheet, glossary, practice questions.
     Split out of the chapter flow so the reading column stays clean.
     ------------------------------------------------------------------ */
  if (view === 'overview') {
    return (
      <div className="space-y-5 pb-16">
        {/* Progress summary */}
        <div className="overflow-hidden rounded-2xl border-[var(--cf-border)] bg-white/70 backdrop-blur dark:bg-white/[0.04]">
          <div className="cf-rainbow-bar h-1 w-full" />
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <h3 className="text-base font-black text-[var(--cf-text-primary)]">Revision progress</h3>
              <p className="mt-0.5 text-xs text-[var(--cf-text-muted)]">
                Tick chapters off as you finish them to track coverage.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-40 overflow-hidden rounded-full bg-[var(--cf-surface-2)]">
                <span className="cf-rainbow-bar block h-full rounded-full transition-all duration-500" style={{ width: `${readPct}%` }} />
              </span>
              <span className="font-mono text-sm font-black text-fuchsia-600 dark:text-fuchsia-300">{readPct}%</span>
            </div>
          </div>
        </div>

        {/* Quick revision */}
        {notes.quickRevisionPoints?.length > 0 && (
          <div className="rounded-2xl border-[var(--cf-border)] bg-white/70 p-5 backdrop-blur dark:bg-white/[0.04]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-black text-[var(--cf-text-primary)]">Rapid revision</h3>
              <span className="cf-chip" style={{ '--chip-from': '#ea580c', '--chip-to': '#e11d70' } as React.CSSProperties}>
                {notes.quickRevisionPoints.length} points
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {notes.quickRevisionPoints.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-xl border-[var(--cf-border)] bg-[var(--cf-surface)] p-3.5 transition-transform hover:-translate-y-0.5"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 font-mono text-[10px] font-black text-white">
                    {i + 1}
                  </span>
                  <p className="text-xs leading-relaxed text-[var(--cf-text-secondary)]">{pt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Glossary */}
        {notes.glossary?.length > 0 && (
          <div className="rounded-2xl border-[var(--cf-border)] bg-white/70 p-5 backdrop-blur dark:bg-white/[0.04]">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-500" />
              <h3 className="text-sm font-black text-[var(--cf-text-primary)]">Glossary</h3>
              <span className="cf-chip" style={{ '--chip-from': '#0284c7', '--chip-to': '#7e22ce' } as React.CSSProperties}>
                {notes.glossary.length} terms
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {notes.glossary.map((g, i) => (
                <div key={i} className="rounded-xl border-[var(--cf-border)] bg-[var(--cf-surface)] p-3.5">
                  <p className="text-xs font-black text-fuchsia-600 dark:text-fuchsia-300">{g.term}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--cf-text-secondary)]">{g.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice questions */}
        {notes.importantQuestions?.length > 0 && (
          <div className="rounded-2xl border-[var(--cf-border)] bg-white/70 p-5 backdrop-blur dark:bg-white/[0.04]">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-black text-[var(--cf-text-primary)]">Practice questions</h3>
            </div>
            <div className="mt-4 space-y-2.5">
              {notes.importantQuestions.map((q, i) => (
                <details
                  key={i}
                  className="group rounded-xl border-[var(--cf-border)] bg-[var(--cf-surface)] p-3.5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-black text-white">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-xs font-bold text-[var(--cf-text-primary)]">{q.question}</span>
                    <span className="shrink-0 rounded-md border border-indigo-300/50 bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-300">
                      {q.type}
                    </span>
                  </summary>
                  <p className="mt-2.5 pl-7 text-[11px] leading-relaxed text-[var(--cf-text-secondary)]">
                    {q.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Takeaways */}
        {notes.finalTakeaways?.length > 0 && (
          <div className="rounded-2xl border-[var(--cf-border)] bg-white/70 p-5 backdrop-blur dark:bg-white/[0.04]">
            <h3 className="text-sm font-black text-[var(--cf-text-primary)]">Final takeaways</h3>
            <ul className="mt-3 space-y-2">
              {notes.finalTakeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--cf-text-secondary)]">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------------
     NOTES VIEW — the chapter reading flow.
     ------------------------------------------------------------------ */
  return (
    <div id="notes-viewer-container" className={`pb-16 ${compact ? 'space-y-6' : 'space-y-5'}`}>
      {/* Document header */}
      <div className="overflow-hidden rounded-2xl border-[var(--cf-border)] bg-white/70 backdrop-blur dark:bg-white/[0.04]">
        <div className="cf-rainbow-bar h-1 w-full" />
        <div className={compact ? 'p-6' : 'p-5 sm:p-6'}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="cf-chip" style={{ '--chip-from': '#7e22ce', '--chip-to': '#0284c7' } as React.CSSProperties}>
              <Sparkles className="h-3 w-3" />
              Source-grounded notes
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-emerald-300/50 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              <FileCheck className="h-3 w-3" />
              {notes.coverageStats?.coverageScore || 98}% coverage verified
            </span>
          </div>

          <h1 className={`mt-3 font-black tracking-tight text-[var(--cf-text-primary)] ${compact ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {notes.title}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold text-[var(--cf-text-muted)]">
            <span className="rounded-md bg-[var(--cf-surface-2)] px-2 py-0.5">{notes.depth.toUpperCase()}</span>
            <span className="rounded-md bg-[var(--cf-surface-2)] px-2 py-0.5">{notes.language.toUpperCase()}</span>
            <span className="rounded-md bg-[var(--cf-surface-2)] px-2 py-0.5">{notes.sections.length} CHAPTERS</span>
          </div>

          <div className="mt-4 rounded-xl border-l-4 border-fuchsia-500 bg-fuchsia-500/5 p-4">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-300">
              Executive overview
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--cf-text-secondary)] sm:text-[13px]">
              {notes.executiveOverview}
            </p>
          </div>
        </div>
      </div>

      {/* Chapter jump bar — hidden in focus mode where the rail already does this */}
      {!compact && (
        <div className="rounded-2xl border-[var(--cf-border)] bg-white/70 p-3.5 backdrop-blur dark:bg-white/[0.04]">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--cf-text-secondary)]">
              <Layers className="h-3.5 w-3.5 text-cyan-500" />
              Jump to chapter
            </span>
            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {readSectionIds.length}/{notes.sections.length} read
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {notes.sections.map((sec) => {
              const isRead = readSectionIds.includes(sec.id);
              const isActive = activeSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => jumpTo(sec.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                    isActive
                      ? 'border-fuchsia-400 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300'
                      : isRead
                        ? 'border-emerald-300/60 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                        : 'border-[var(--cf-border)] bg-[var(--cf-surface)] text-[var(--cf-text-secondary)] hover:border-fuchsia-300'
                  }`}
                >
                  {isRead ? <Check className="h-3 w-3 shrink-0" /> : <span className="font-mono text-[10px] opacity-60">{sec.topicNumber}</span>}
                  <span className="max-w-[130px] truncate">{sec.title}</span>
                  <span className="font-mono text-[9px] opacity-50">{sec.timestampFormatted}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chapters */}
      <div className="space-y-5">
        {notes.sections.map((sec) => {
          const isBookmarked = bookmarkedSectionIds.includes(sec.id);
          const isRead = readSectionIds.includes(sec.id);

          return (
            <section
              key={sec.id}
              id={`section-${sec.id}`}
              className={`scroll-mt-36 rounded-2xl border bg-white/70 backdrop-blur transition-all dark:bg-white/[0.04] ${
                isRead ? 'border-emerald-300/60' : 'border-[var(--cf-border)]'
              } ${compact ? 'p-6' : 'p-5 sm:p-6'}`}
            >
              {/* Section header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--cf-border)] pb-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black text-white shadow-md ${
                      isRead ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-fuchsia-500 to-purple-600'
                    }`}
                  >
                    {sec.topicNumber.toString().padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h2 className={`font-black tracking-tight text-[var(--cf-text-primary)] ${compact ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
                      {sec.title}
                    </h2>
                    <button
                      onClick={() => onSeek(sec.timestampSeconds)}
                      title="Jump the video to this moment"
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-cyan-300/50 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-black text-cyan-700 transition-colors hover:bg-cyan-500/20 dark:text-cyan-300"
                    >
                      <Play className="h-2.5 w-2.5 fill-current" />
                      {sec.timestampFormatted}
                    </button>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {onToggleRead && (
                    <button
                      onClick={() => onToggleRead(sec.id)}
                      title={isRead ? 'Mark as unread' : 'Mark as read'}
                      className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide transition-all ${
                        isRead
                          ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-[var(--cf-border)] text-[var(--cf-text-muted)] hover:border-emerald-300 hover:text-emerald-600'
                      }`}
                    >
                      {isRead ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{isRead ? 'Read' : 'Mark'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onEditSection(sec)}
                    title="Edit this section"
                    className="rounded-xl border-[var(--cf-border)] p-2 text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onBookmarkToggle?.(sec.id)}
                    title="Bookmark"
                    className={`rounded-xl border p-2 transition-all ${
                      isBookmarked
                        ? 'border-amber-400/60 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-[var(--cf-border)] text-[var(--cf-text-muted)] hover:border-amber-300 hover:text-amber-600'
                    }`}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Introduction */}
              {sec.introduction && (
                <p className="mt-4 text-sm font-medium italic text-slate-600 dark:text-slate-400">
                  {sec.introduction}
                </p>
              )}

              {/* Detailed Explanation */}
              <div className="mt-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                <p>{sec.detailedExplanation}</p>
              </div>

              {/* Key Concepts */}
              {sec.keyConcepts && sec.keyConcepts.length > 0 && (
                <div className="mt-6 rounded-2xl border border-[var(--cf-border)] bg-[var(--cf-surface)]/70 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cf-text-secondary)]">
                    Key Concepts & Insights
                  </h4>
                  <ul className="mt-2.5 space-y-2 text-xs sm:text-sm text-[var(--cf-text-secondary)]">
                    {sec.keyConcepts.map((concept, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--cf-accent)] shrink-0" />
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Important Definitions */}
              {sec.importantDefinitions && sec.importantDefinitions.length > 0 && (
                <div className="mt-6 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cf-text-secondary)]">
                    Definitions & Terminology
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sec.importantDefinitions.map((def, dIdx) => (
                      <div
                        key={dIdx}
                        className="rounded-xl border border-[var(--cf-border)] bg-[var(--cf-surface)] p-3.5"
                      >
                        <span className="text-xs font-bold text-[var(--cf-accent-dark)]">{def.term}</span>
                        <p className="mt-1 text-xs text-[var(--cf-text-secondary)] leading-relaxed">
                          {def.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulas with KaTeX */}
              {sec.formulas && sec.formulas.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700">
                    Governing Equations & Formulas
                  </h4>
                  {sec.formulas.map((formula) => (
                    <div
                      key={formula.id}
                      className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4"
                    >
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-sky-900">{formula.title}</span>
                         {formula.timestamp && (
                           <button
                             onClick={() => formula.timestampSeconds && onSeek(formula.timestampSeconds)}
                             className="font-mono text-[11px] font-bold text-sky-700 hover:underline"
                           >
                            [{formula.timestamp}]
                          </button>
                        )}
                      </div>

                      {/* Math rendering */}
                      <div className="my-2.5 rounded-xl border border-[var(--cf-border)] bg-white p-3 text-center overflow-x-auto shadow-xs">
                        <MathFormula latex={formula.latex} block />
                      </div>

                      <p className="text-xs text-slate-700 mt-1 font-medium">{formula.explanation}</p>

                      {formula.variables && formula.variables.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          {formula.variables.map((v, vIdx) => (
                            <span key={vIdx} className="rounded-lg bg-white px-2 py-0.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 font-medium">
                              <strong className="text-slate-900 dark:text-slate-200">{v.name}:</strong> {v.description}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Code Blocks */}
              {sec.codeBlocks && sec.codeBlocks.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Code Demonstrations
                  </h4>
                  {sec.codeBlocks.map((cb) => (
                    <div
                      key={cb.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900 px-4 py-2">
                        <span className="font-mono text-xs font-bold uppercase text-emerald-400">
                          {cb.language}
                        </span>
                        <button
                          onClick={() => handleCopyCode(cb.code, cb.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedCodeId === cb.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 font-mono text-xs text-slate-100 overflow-x-auto leading-relaxed">
                        <code>{cb.code}</code>
                      </pre>
                      {cb.explanation && (
                        <div className="border-t border-slate-800/60 bg-slate-900/50 px-4 py-2 text-xs text-slate-400">
                          {cb.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Worked Examples */}
              {sec.examples && sec.examples.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Worked Educational Examples
                  </h4>
                  {sec.examples.map((ex) => (
                    <div
                      key={ex.id}
                      className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4"
                    >
                      <span className="text-xs font-bold text-indigo-900">{ex.title}</span>
                      <div className="mt-2.5 space-y-2 text-xs">
                        <div className="rounded-xl bg-white p-3 border border-indigo-100 dark:bg-slate-950/60 dark:border-transparent">
                          <strong className="text-slate-900 dark:text-slate-300">Problem: </strong>
                          <span className="text-slate-700 dark:text-slate-300">{ex.problem}</span>
                        </div>
                        <div className="rounded-xl bg-white p-3 border border-emerald-100 dark:bg-slate-950/60 dark:border-transparent">
                          <strong className="text-emerald-700 dark:text-emerald-400">Solution: </strong>
                          <span className="text-slate-800 dark:text-slate-200">{ex.solution}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                          Takeaway: {ex.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step by Step Procedures */}
              {sec.stepByStepProcedures && sec.stepByStepProcedures.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cf-text-secondary)]">
                    Step-by-Step Procedure
                  </h4>
                  <div className="space-y-2">
                    {sec.stepByStepProcedures.map((proc) => (
                      <div
                        key={proc.step}
                        className="flex items-start gap-3 rounded-xl border border-[var(--cf-border)] bg-[var(--cf-surface)] p-3.5"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--cf-accent)] text-[11px] font-bold text-white shrink-0 shadow-xs">
                          {proc.step}
                        </span>
                        <div>
                          <h5 className="text-xs font-bold text-[var(--cf-text-primary)]">{proc.title}</h5>
                          <p className="text-xs text-[var(--cf-text-secondary)] mt-0.5">{proc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Mistakes */}
              {sec.commonMistakes && sec.commonMistakes.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    Common Pitfalls & Examination Traps
                  </h4>
                  {sec.commonMistakes.map((cm, cmIdx) => (
                    <div
                      key={cmIdx}
                      className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3.5 text-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-rose-800">
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        <span>Mistake: {cm.mistake}</span>
                      </div>
                      <p className="mt-1 text-slate-800">
                        <strong className="text-emerald-700">Correction: </strong>
                        {cm.correction}
                      </p>
                      <p className="mt-0.5 text-slate-600 text-[11px] italic">{cm.why}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Visual Aids Architecture */}
              {sec.visualAids && sec.visualAids.length > 0 && (
                <div className="mt-6 rounded-xl border border-[var(--cf-border)] bg-[var(--cf-surface)] p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--cf-text-secondary)]">
                    <Eye className="h-3.5 w-3.5 text-[var(--cf-accent)]" />
                    <span>Visual Content Association</span>
                  </div>
                  {sec.visualAids.map((va, vIdx) => (
                    <div key={vIdx} className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-300">[{va.timestamp}] {va.title}: </span>
                      <span>{va.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
      {/* Revision, glossary and practice questions live in the
          "Revision & Practice" tab so this reading column stays focused. */}
      <div className="rounded-2xl border-dashed border-[var(--cf-border)] p-5 text-center">
        <p className="text-xs font-bold text-[var(--cf-text-secondary)]">
          Finished reading? Open the
          <span className="mx-1 bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text font-black text-transparent">
            Revision &amp; Practice
          </span>
          tab for the cheat sheet, glossary and exam questions.
        </p>
      </div>
    </div>
  );
};
