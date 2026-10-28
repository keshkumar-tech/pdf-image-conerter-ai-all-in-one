import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X, CheckCircle2, XCircle, Layers, Award, RotateCw, ChevronRight, ChevronLeft,
  Sparkles, Copy, Check, Target, Brain, Repeat, TrendingUp, Zap, Flame,
} from 'lucide-react';
import { NoteDocument, MCQQuestion, Flashcard } from '../types';
import { api } from '../services/api';
import {
  StudyStats, loadStats, recordQuizRun, clearWeakQuestion,
  gradeReview, dueReviews,
} from '../utils/studyState';

interface StudyToolsModalProps {
  notes: NoteDocument;
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'mcqs' | 'weak' | 'flashcards' | 'review' | 'cheatsheet';

export const StudyToolsModal: React.FC<StudyToolsModalProps> = ({ notes, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('mcqs');
  const [mcqs, setMcqs] = useState<MCQQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedCheat, setCopiedCheat] = useState(false);

  const [stats, setStats] = useState<StudyStats>(() => loadStats(notes.videoId));

  /* ---------------- Load ---------------- */
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [m, f] = await Promise.all([
          api.getStudyTools(notes.videoId, 'mcqs'),
          api.getStudyTools(notes.videoId, 'flashcards'),
        ]);
        if (cancelled) return;
        setMcqs(Array.isArray(m) ? m : []);
        setFlashcards(Array.isArray(f) ? f : []);
      } catch (err) {
        console.warn('Study tools load failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, notes.videoId]);

  // Leaving the modal shouldn't strand a half-finished quiz state.
  useEffect(() => {
    if (!isOpen) {
      setShowResults(false);
      setSelectedAnswers({});
      setIsFlipped(false);
      setCurrentCardIdx(0);
    }
  }, [isOpen]);

  /* ---------------- Derived ---------------- */
  const glossaryTerms = useMemo(
    () => (notes.glossary ?? []).map((g) => g.term),
    [notes.glossary]
  );

  const weakQuestions = useMemo(
    () => mcqs.filter((q) => stats.weakQuestionIds.includes(q.id)),
    [mcqs, stats.weakQuestionIds]
  );

  const dueTerms = useMemo(
    () => dueReviews(stats, glossaryTerms),
    [stats, glossaryTerms]
  );

  const attemptStats = useMemo(() => {
    const total = stats.attempts.length;
    const right = stats.attempts.filter((a) => a.correct).length;
    return { total, right, accuracy: total ? Math.round((right / total) * 100) : 0 };
  }, [stats.attempts]);

  /* ---------------- Quiz ---------------- */
  const calculateScore = useCallback(
    (pool: MCQQuestion[]) =>
      pool.filter((q) => selectedAnswers[q.id] === q.correctIndex).length,
    [selectedAnswers]
  );

  const submitQuiz = useCallback(
    (pool: MCQQuestion[], isWeakDrill: boolean) => {
      const results = pool.map((q) => ({
        questionId: q.id,
        sectionTitle: q.relatedTopic,
        correct: selectedAnswers[q.id] === q.correctIndex,
      }));
      setStats((prev) => recordQuizRun(notes.videoId, prev, results));
      // A weak-spot drill that is fully correct clears those questions.
      if (isWeakDrill) {
        const allRight = results.every((r) => r.correct);
        if (allRight) {
          setStats((prev) =>
            results.reduce(
              (acc, r) => clearWeakQuestion(notes.videoId, acc, r.questionId),
              prev
            )
          );
        }
      }
      setShowResults(true);
    },
    [selectedAnswers, notes.videoId]
  );

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  /* ---------------- Spaced repetition ---------------- */
  const handleGrade = (term: string, remembered: boolean) => {
    setStats((prev) => gradeReview(notes.videoId, prev, term, remembered));
    if (currentCardIdx < dueTerms.length - 1) {
      setCurrentCardIdx((i) => i + 1);
    }
    setIsFlipped(false);
  };

  const handleCopyCheat = () => {
    navigator.clipboard.writeText(notes.quickRevisionPoints.map((p, i) => `${i + 1}. ${p}`).join('\n'));
    setCopiedCheat(true);
    setTimeout(() => setCopiedCheat(false), 2000);
  };

  if (!isOpen) return null;

  const tabs: { key: TabKey; label: string; badge?: number; icon: React.ReactNode }[] = [
    { key: 'mcqs', label: 'Quiz', icon: <Target className="h-3.5 w-3.5" />, badge: mcqs.length || undefined },
    { key: 'weak', label: 'Weak spots', icon: <Flame className="h-3.5 w-3.5" />, badge: weakQuestions.length || undefined },
    { key: 'flashcards', label: 'Flashcards', icon: <Brain className="h-3.5 w-3.5" />, badge: flashcards.length || undefined },
    { key: 'review', label: 'Review', icon: <Repeat className="h-3.5 w-3.5" />, badge: dueTerms.length || undefined },
    { key: 'cheatsheet', label: 'Cheat sheet', icon: <Zap className="h-3.5 w-3.5" /> },
  ];

  const activePool = activeTab === 'weak' ? weakQuestions : mcqs;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border-[var(--cf-border)] bg-white/97 shadow-2xl backdrop-blur-2xl dark:bg-[#0d1224]/97">
        <div className="cf-rainbow-bar h-1 w-full" />

        {/* ---------- Header ---------- */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--cf-border)] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="cf-animated-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg shadow-fuchsia-500/30">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-[var(--cf-text-primary)]">Study Hub</h3>
              <p className="truncate text-[11px] text-[var(--cf-text-muted)]">{notes.title}</p>
            </div>
          </div>

          {/* Live accuracy readout */}
          <div className="flex shrink-0 items-center gap-2">
            {attemptStats.total > 0 && (
              <span className="hidden items-center gap-1.5 rounded-xl border-[var(--cf-border)] bg-[var(--cf-surface)] px-2.5 py-1.5 sm:flex">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[11px] font-black text-[var(--cf-text-primary)]">
                  {attemptStats.accuracy}%
                </span>
                <span className="text-[10px] text-[var(--cf-text-muted)]">
                  ({attemptStats.right}/{attemptStats.total})
                </span>
              </span>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--cf-text-muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ---------- Tabs ---------- */}
        <div className="flex gap-1 overflow-x-auto border-b border-[var(--cf-border)] px-3 py-2 scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); resetQuiz(); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition-all ${
                activeTab === t.key
                  ? 'cf-rainbow-bar text-white shadow-sm'
                  : 'text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface)]'
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge !== undefined && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[9px] font-black ${
                    activeTab === t.key ? 'bg-white/25 text-white' : 'bg-[var(--cf-surface-2)] text-[var(--cf-text-muted)]'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ---------- Body ---------- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="flex h-52 flex-col items-center justify-center gap-2">
              <RotateCw className="h-6 w-6 animate-spin text-fuchsia-500" />
              <p className="text-xs font-semibold text-[var(--cf-text-muted)]">
                Building tailored study material…
              </p>
            </div>
          ) : (
            <>
              {/* ============ QUIZ (all or weak spots) ============ */}
              {(activeTab === 'mcqs' || activeTab === 'weak') && (
                <div className="space-y-4">
                  {activePool.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                      <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
                        activeTab === 'weak' ? 'bg-emerald-500/15' : 'bg-fuchsia-500/15'
                      }`}>
                        {activeTab === 'weak' ? '🎉' : '📝'}
                      </span>
                      <p className="text-sm font-black text-[var(--cf-text-primary)]">
                        {activeTab === 'weak' ? 'No weak spots — nice work!' : 'No questions yet'}
                      </p>
                      <p className="max-w-xs text-[11px] text-[var(--cf-text-muted)]">
                        {activeTab === 'weak'
                          ? 'Questions you get wrong in the quiz show up here for focused drilling.'
                          : 'Generate notes first, then come back for a quiz.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {activeTab === 'weak' && (
                        <div className="rounded-xl border-l-4 border-orange-500 bg-orange-500/5 p-3">
                          <p className="text-[11px] font-bold text-orange-700 dark:text-orange-300">
                            Answer every question correctly to clear this drill.
                          </p>
                        </div>
                      )}

                      {activePool.map((q, qi) => {
                        const chosen = selectedAnswers[q.id];
                        const answered = chosen !== undefined;
                        const isRight = chosen === q.correctIndex;

                        return (
                          <div
                            key={q.id || qi}
                            className="rounded-2xl border-[var(--cf-border)] bg-[var(--cf-surface)] p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-mono text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-300">
                                Q{qi + 1} / {activePool.length}
                              </span>
                              <span className="shrink-0 rounded-md border-[var(--cf-border)] bg-white/70 px-2 py-0.5 text-[9px] font-bold text-[var(--cf-text-muted)] dark:bg-white/5">
                                {q.relatedTopic}
                              </span>
                            </div>

                            <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--cf-text-primary)]">
                              {q.question}
                            </p>

                            <div className="mt-3 space-y-1.5">
                              {q.options.map((opt, oi) => {
                                const picked = chosen === oi;
                                const correct = oi === q.correctIndex;

                                let cls = 'border-[var(--cf-border)] bg-white/60 text-[var(--cf-text-secondary)] hover:border-fuchsia-300 dark:bg-white/[0.03]';
                                if (showResults) {
                                  if (correct) cls = 'border-emerald-400/70 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200';
                                  else if (picked) cls = 'border-rose-400/70 bg-rose-500/10 text-rose-800 dark:text-rose-200';
                                  else cls = 'border-[var(--cf-border)] bg-white/40 text-[var(--cf-text-muted)] dark:bg-white/[0.02]';
                                } else if (picked) {
                                  cls = 'border-fuchsia-400 bg-fuchsia-500/10 text-fuchsia-800 dark:text-fuchsia-200';
                                }

                                return (
                                  <button
                                    key={oi}
                                    disabled={showResults}
                                    onClick={() => setSelectedAnswers((p) => ({ ...p, [q.id]: oi }))}
                                    className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all disabled:cursor-default ${cls}`}
                                  >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-current/30 font-mono text-[10px] font-black">
                                      {String.fromCharCode(65 + oi)}
                                    </span>
                                    <span className="flex-1 leading-relaxed">{opt}</span>
                                    {showResults && correct && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                                    {showResults && picked && !correct && <XCircle className="h-4 w-4 shrink-0 text-rose-500" />}
                                  </button>
                                );
                              })}
                            </div>

                            {showResults && (
                              <div className="mt-2.5 rounded-xl border-l-4 border-cyan-500 bg-cyan-500/5 p-3">
                                <p className="text-[11px] leading-relaxed text-[var(--cf-text-secondary)]">
                                  <strong className="text-cyan-600 dark:text-cyan-300">Why: </strong>
                                  {q.explanation}
                                </p>
                                {answered && !isRight && (
                                  <p className="mt-1.5 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                                    Added to your weak spots for drilling.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Submit row */}
                      <div className="sticky bottom-0 flex-wrap items-center justify-between gap-3 rounded-2xl border-[var(--cf-border)] bg-white/90 p-3 backdrop-blur-xl dark:bg-[#0d1224]/90">
                        <div className="flex items-center gap-2">
                          {showResults ? (
                            <>
                              <Award className={`h-5 w-5 ${
                                calculateScore(activePool) / activePool.length >= 0.8 ? 'text-emerald-500' : 'text-amber-500'
                              }`} />
                              <span className="text-sm font-black text-[var(--cf-text-primary)]">
                                {calculateScore(activePool)} / {activePool.length}
                              </span>
                              <span className="text-[11px] font-bold text-[var(--cf-text-muted)]">
                                ({Math.round((calculateScore(activePool) / activePool.length) * 100)}%)
                              </span>
                            </>
                          ) : (
                            <span className="text-[11px] font-semibold text-[var(--cf-text-muted)]">
                              {Object.keys(selectedAnswers).length}/{activePool.length} answered
                            </span>
                          )}
                        </div>

                        {showResults ? (
                          <button
                            onClick={resetQuiz}
                            className="cf-btn-outline rounded-xl px-4 py-2 text-[11px] font-extrabold"
                          >
                            <RotateCw className="mr-1.5 inline h-3.5 w-3.5" />
                            Try again
                          </button>
                        ) : (
                          <button
                            onClick={() => submitQuiz(activePool, activeTab === 'weak')}
                            disabled={Object.keys(selectedAnswers).length === 0}
                            className="cf-btn-rainbow cf-shimmer rounded-xl px-5 py-2 text-[11px] font-extrabold disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Check answers
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ============ FLASHCARDS ============ */}
              {activeTab === 'flashcards' && (
                <div className="flex flex-col items-center">
                  {flashcards.length === 0 ? (
                    <p className="py-14 text-xs text-[var(--cf-text-muted)]">No flashcards yet.</p>
                  ) : (
                    <div className="w-full max-w-xl">
                      <div className="mb-3 flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-[var(--cf-text-muted)]">
                          {currentCardIdx + 1} / {flashcards.length}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="rounded-md border-[var(--cf-border)] px-2 py-0.5 font-bold text-[var(--cf-text-secondary)]">
                            {flashcards[currentCardIdx]?.topic}
                          </span>
                          {flashcards[currentCardIdx]?.difficulty && (
                            <span className={`rounded-md px-2 py-0.5 font-black uppercase ${
                              flashcards[currentCardIdx].difficulty === 'easy'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : flashcards[currentCardIdx].difficulty === 'hard'
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            }`}>
                              {flashcards[currentCardIdx].difficulty}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3 h-1 overflow-hidden rounded-full bg-[var(--cf-surface-2)]">
                        <div
                          className="cf-rainbow-bar h-full rounded-full transition-all duration-300"
                          style={{ width: `${((currentCardIdx + 1) / flashcards.length) * 100}%` }}
                        />
                      </div>

                      <button
                        onClick={() => setIsFlipped((f) => !f)}
                        className={`flex h-64 w-full flex-col items-center justify-center rounded-2xl border-2 p-6 text-center transition-all ${
                          isFlipped
                            ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10'
                            : 'border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10'
                        }`}
                      >
                        <span className="mb-3 text-[10px] font-black uppercase tracking-widest text-[var(--cf-text-muted)]">
                          {isFlipped ? 'Answer' : 'Question — tap to flip'}
                        </span>
                        <p className={`leading-relaxed ${isFlipped ? 'text-sm text-[var(--cf-text-secondary)]' : 'text-base font-black text-[var(--cf-text-primary)]'}`}>
                          {isFlipped ? flashcards[currentCardIdx]?.back : flashcards[currentCardIdx]?.front}
                        </p>
                        <span className="mt-4 flex items-center gap-1 text-[10px] font-bold text-fuchsia-500">
                          <RotateCw className="h-3 w-3" />
                          flip
                        </span>
                      </button>

                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={() => { setIsFlipped(false); setCurrentCardIdx((i) => Math.max(0, i - 1)); }}
                          disabled={currentCardIdx === 0}
                          className="flex items-center gap-1 rounded-xl border-[var(--cf-border)] px-4 py-2 text-[11px] font-bold text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 disabled:opacity-40"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Prev
                        </button>
                        <button
                          onClick={() => { setIsFlipped(false); setCurrentCardIdx((i) => Math.min(flashcards.length - 1, i + 1)); }}
                          disabled={currentCardIdx === flashcards.length - 1}
                          className="cf-btn-rainbow flex items-center gap-1 rounded-xl px-4 py-2 text-[11px] font-extrabold disabled:opacity-40"
                        >
                          Next
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============ SPACED REPETITION ============ */}
              {activeTab === 'review' && (
                <div className="mx-auto max-w-xl">
                  {dueTerms.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-14 text-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl">✅</span>
                      <p className="text-sm font-black text-[var(--cf-text-primary)]">All caught up</p>
                      <p className="max-w-xs text-[11px] text-[var(--cf-text-muted)]">
                        No terms are due today. Spaced repetition will bring them back as they fade.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--cf-text-secondary)]">
                          Due today: <strong className="text-fuchsia-600 dark:text-fuchsia-300">{dueTerms.length}</strong>
                        </span>
                        <span className="font-mono text-[10px] text-[var(--cf-text-muted)]">
                          card {Math.min(currentCardIdx + 1, dueTerms.length)} / {dueTerms.length}
                        </span>
                      </div>

                      <button
                        onClick={() => setIsFlipped((f) => !f)}
                        className="flex h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 p-6 text-center"
                      >
                        <span className="mb-3 text-[10px] font-black uppercase tracking-widest text-[var(--cf-text-muted)]">
                          {isFlipped ? 'Definition' : 'Term — tap to reveal'}
                        </span>
                        <p className="text-lg font-black text-[var(--cf-text-primary)]">
                          {dueTerms[currentCardIdx]}
                        </p>
                        {isFlipped && (
                          <p className="mt-3 max-h-24 overflow-y-auto text-xs leading-relaxed text-[var(--cf-text-secondary)]">
                            {notes.glossary.find((g) => g.term === dueTerms[currentCardIdx])?.definition}
                          </p>
                        )}
                      </button>

                      {isFlipped ? (
                        <div className="mt-4 grid-cols-2 gap-2.5">
                          <button
                            onClick={() => handleGrade(dueTerms[currentCardIdx], false)}
                            className="rounded-xl border-2 border-rose-400/50 bg-rose-500/10 py-3 text-[11px] font-extrabold text-rose-700 transition-colors hover:bg-rose-500/20 dark:text-rose-300"
                          >
                            Forgot — show again
                          </button>
                          <button
                            onClick={() => handleGrade(dueTerms[currentCardIdx], true)}
                            className="rounded-xl border-2 border-emerald-400/50 bg-emerald-500/10 py-3 text-[11px] font-extrabold text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300"
                          >
                            Remembered
                          </button>
                        </div>
                      ) : (
                        <p className="mt-4 text-center text-[11px] text-[var(--cf-text-muted)]">
                          Reveal the answer, then grade how well you knew it.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ============ CHEAT SHEET ============ */}
              {activeTab === 'cheatsheet' && (
                <div>
                  <div className="mb-3 flex-wrap items-center justify-between gap-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[var(--cf-text-muted)]">
                      Rapid revision · {notes.quickRevisionPoints.length} points
                    </h4>
                    <button
                      onClick={handleCopyCheat}
                      className="flex items-center gap-1.5 rounded-xl border-[var(--cf-border)] px-3 py-1.5 text-[11px] font-bold text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600"
                    >
                      {copiedCheat ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedCheat ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {notes.quickRevisionPoints.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl border-[var(--cf-border)] bg-[var(--cf-surface)] p-3.5 transition-transform hover:-translate-y-0.5"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 font-mono text-[10px] font-black text-white">
                          {i + 1}
                        </span>
                        <p className="text-xs leading-relaxed text-[var(--cf-text-secondary)]">{p}</p>
                      </div>
                    ))}
                  </div>

                  {notes.finalTakeaways?.length > 0 && (
                    <div className="mt-5">
                      <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[var(--cf-text-muted)]">
                        <Layers className="h-3.5 w-3.5 text-violet-500" />
                        Final takeaways
                      </h4>
                      <div className="space-y-1.5">
                        {notes.finalTakeaways.map((t, i) => (
                          <div key={i} className="flex items-start gap-2.5 rounded-xl border-l-4 border-violet-500 bg-violet-500/5 p-3">
                            <p className="text-[11px] leading-relaxed text-[var(--cf-text-secondary)]">{t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
