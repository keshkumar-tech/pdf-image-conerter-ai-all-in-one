import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { NoteDocument, VideoMetadata, NoteSection, TranscriptSegment } from '../types';
import { NotesViewer } from './NotesViewer';
import { TranscriptViewer } from './TranscriptViewer';
import { AIChatDrawer } from './AIChatDrawer';
import { StudyToolsModal } from './StudyToolsModal';
import { PDFPreviewModal } from './PDFPreviewModal';
import { NotesEditor } from './NotesEditor';
import {
  CommandPalette, PomodoroTimer, StudyStatsStrip, ExportPack,
  ShortcutsHelp, ChapterRail, RailSection,
} from './StudyHub';
import {
  StudyStats, loadStats, setSectionFlag, countRead, addStudyMinutes, bookmarkedSectionIds,
} from '../utils/studyState';
import {
  Clock, MessageSquare, GraduationCap, Download, ArrowLeft,
  Lock, Maximize2, Minimize2, Command, Keyboard,
  BookOpen, ListChecks, Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface WorkspaceProps {
  notes: NoteDocument;
  video: VideoMetadata;
  transcript: TranscriptSegment[];
  onBackToHome: () => void;
  onUpdateNotes: (updatedNotes: NoteDocument) => void;
}

type RightTab = 'notes' | 'overview';

export const Workspace: React.FC<WorkspaceProps> = ({
  notes,
  video,
  transcript,
  onBackToHome,
  onUpdateNotes,
}) => {
  const { user, executeWithAuth } = useAuth();

  const [activeSideTab, setActiveSideTab] = useState<'transcript' | 'chat'>('transcript');
  const [rightTab, setRightTab] = useState<RightTab>('notes');
  const [isStudyToolsOpen, setIsStudyToolsOpen] = useState(false);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [editingSection, setEditingSection] = useState<NoteSection | null>(null);
  const [currentPlaybackSeconds, setCurrentPlaybackSeconds] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<string>(notes.sections[0]?.id ?? '');

  const [stats, setStats] = useState<StudyStats>(() => loadStats(notes.videoId));

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const videoUrl = video.url || `https://www.youtube.com/watch?v=${video.videoId}`;

  const read = useMemo(() => countRead(stats, notes.sections), [stats, notes.sections]);

  /* ---------------- Seeking ---------------- */
  const handleSeek = useCallback((seconds: number) => {
    setCurrentPlaybackSeconds(seconds);
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }),
      '*'
    );
  }, []);

  /* ---------------- Section progress ---------------- */
  const toggleRead = useCallback(
    (sectionId: string) => {
      setStats((prev) =>
        setSectionFlag(notes.videoId, prev, sectionId, {
          read: !prev.sections[sectionId]?.read,
        })
      );
    },
    [notes.videoId]
  );

  const handleBookmarkToggle = useCallback(
    (sectionId: string) => {
      setStats((prev) =>
        setSectionFlag(notes.videoId, prev, sectionId, {
          bookmarked: !prev.sections[sectionId]?.bookmarked,
        })
      );
    },
    [notes.videoId]
  );

  const bookmarkedIds = useMemo(() => bookmarkedSectionIds(stats), [stats]);

  const railSections: RailSection[] = useMemo(
    () =>
      notes.sections.map((s) => ({
        id: s.id,
        topicNumber: s.topicNumber,
        title: s.title,
        timestampFormatted: s.timestampFormatted,
        read: !!stats.sections[s.id]?.read,
      })),
    [notes.sections, stats.sections]
  );

  /* ---------------- Scroll spy ---------------- */
  useEffect(() => {
    const nodes = notes.sections
      .map((s) => document.getElementById(`section-${s.id}`))
      .filter((n): n is HTMLElement => !!n);
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSectionId(visible.target.id.replace('section-', ''));
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.5, 1] }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [notes.sections, rightTab]);

  const jumpToSection = useCallback((id: string) => {
    setActiveSectionId(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* ---------------- Study time ---------------- */
  const handleSessionComplete = useCallback(
    (minutes: number) => {
      setStats((prev) => addStudyMinutes(notes.videoId, prev, minutes));
    },
    [notes.videoId]
  );

  /* ---------------- Keyboard shortcuts ---------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing) return;

      const meta = e.ctrlKey || e.metaKey;

      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
        return;
      }
      if (e.key === 'Escape') {
        setIsPaletteOpen(false);
        setIsShortcutsOpen(false);
        setIsExportOpen(false);
        return;
      }
      if (meta) return;

      const idx = notes.sections.findIndex((s) => s.id === activeSectionId);

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          setIsFocusMode((v) => !v);
          break;
        case 't':
          e.preventDefault();
          setActiveSideTab((v) => (v === 'transcript' ? 'chat' : 'transcript'));
          break;
        case 's':
          e.preventDefault();
          setIsStudyToolsOpen(true);
          break;
        case 'e':
          e.preventDefault();
          setIsExportOpen(true);
          break;
        case 'j':
          e.preventDefault();
          if (idx >= 0 && idx < notes.sections.length - 1) jumpToSection(notes.sections[idx + 1].id);
          break;
        case 'k':
          e.preventDefault();
          if (idx > 0) jumpToSection(notes.sections[idx - 1].id);
          break;
        case '?':
          e.preventDefault();
          setIsShortcutsOpen(true);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [notes.sections, activeSectionId, jumpToSection]);

  const handleSaveEditedSection = (updatedSection: NoteSection) => {
    onUpdateNotes({
      ...notes,
      sections: notes.sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
      updatedAt: new Date().toISOString(),
    });
  };

  /* ================================================================
     FOCUS MODE — reading only, everything else steps aside
     ================================================================ */
  if (isFocusMode) {
    return (
      <div className="cf-vibe-bg min-h-screen">
        <div className="sticky top-16 z-30 border-b border-[var(--cf-border)] bg-white/85 backdrop-blur-xl dark:bg-[#0b1020]/85">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="cf-chip shrink-0" style={{ '--chip-from': '#0d9488', '--chip-to': '#0284c7' } as React.CSSProperties}>
                Focus
              </span>
              <h2 className="truncate text-sm font-black text-[var(--cf-text-primary)]">{notes.title}</h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden items-center gap-1.5 text-[11px] font-bold text-[var(--cf-text-secondary)] sm:flex">
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--cf-surface-2)]">
                  <span className="cf-rainbow-bar block h-full" style={{ width: `${read.pct}%` }} />
                </span>
                {read.read}/{read.total}
              </span>
              <button
                onClick={() => setIsStudyToolsOpen(true)}
                title="Study tools"
                className="rounded-xl border-[var(--cf-border)] p-2 text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600"
              >
                <GraduationCap className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsFocusMode(false)}
                className="flex items-center gap-1.5 rounded-xl border-[var(--cf-border)] px-3 py-1.5 text-[11px] font-extrabold text-[var(--cf-text-primary)] transition-colors hover:border-fuchsia-300"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                Exit
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <NotesViewer
            notes={notes}
            onSeek={handleSeek}
            onEditSection={setEditingSection}
            onBookmarkToggle={handleBookmarkToggle}
            bookmarkedSectionIds={bookmarkedIds}
            readSectionIds={railSections.filter((s) => s.read).map((s) => s.id)}
            onToggleRead={toggleRead}
            compact
          />
        </div>

        <StudyToolsModal notes={notes} isOpen={isStudyToolsOpen} onClose={() => setIsStudyToolsOpen(false)} />
        <NotesEditor
          section={editingSection}
          isOpen={!!editingSection}
          onClose={() => setEditingSection(null)}
          onSave={handleSaveEditedSection}
        />
      </div>
    );
  }

  /* ================================================================
     STANDARD WORKSPACE
     ================================================================ */
  return (
    <div className="cf-vibe-bg min-h-[calc(100vh-4rem)] pb-10">
      {/* ---------------- Top toolbar ---------------- */}
      <div
        data-testid="workspace-toolbar"
        className="sticky top-16 z-30 border-b border-[var(--cf-border)] bg-white/85 backdrop-blur-xl dark:bg-[#0b1020]/85"
      >
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                onClick={onBackToHome}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border-[var(--cf-border)] bg-white/70 px-2.5 py-1.5 text-[11px] font-bold text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600 dark:bg-white/5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Generator</span>
              </button>

              <span className="hidden h-5 w-px shrink-0 bg-[var(--cf-border)] sm:block" />

              <div className="min-w-0">
                <h1 className="truncate text-[13px] font-black leading-tight text-[var(--cf-text-primary)]">
                  {notes.title}
                </h1>
                <p className="truncate font-mono text-[10px] text-[var(--cf-text-muted)]">
                  {video.channel} · {video.durationFormatted} · {notes.sections.length} chapters
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => setIsPaletteOpen(true)}
                title="Search everything (Ctrl+K)"
                className="flex items-center gap-2 rounded-xl border-[var(--cf-border)] bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--cf-text-muted)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600 dark:bg-white/5"
              >
                <Command className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Search</span>
                <kbd className="hidden rounded border-[var(--cf-border)] bg-[var(--cf-surface-2)] px-1 font-mono text-[9px] font-bold lg:inline">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={() => setIsFocusMode(true)}
                title="Focus mode (F)"
                className="rounded-xl border-[var(--cf-border)] bg-white/70 p-2 text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600 dark:bg-white/5"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setIsExportOpen(true)}
                title="Export notes (E)"
                className="rounded-xl border-[var(--cf-border)] bg-white/70 p-2 text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600 dark:bg-white/5"
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setIsShortcutsOpen(true)}
                title="Keyboard shortcuts (?)"
                className="hidden rounded-xl border-[var(--cf-border)] bg-white/70 p-2 text-[var(--cf-text-secondary)] transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600 dark:bg-white/5 sm:block"
              >
                <Keyboard className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setIsStudyToolsOpen(true)}
                className="cf-btn-rainbow cf-shimmer flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-extrabold"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Study Tools</span>
              </button>

              <button
                onClick={() => executeWithAuth('pdf_generation', () => setIsPDFPreviewOpen(true))}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-extrabold transition-all ${
                  user
                    ? 'border-2 border-cyan-400/40 bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/20 dark:text-cyan-300'
                    : 'border-2 border-amber-400/50 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300'
                }`}
              >
                {user ? <Download className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                <span className="hidden lg:inline">{user ? 'PDF Slides' : 'Unlock PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Body ---------------- */}
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <StudyStatsStrip stats={stats} totalSections={notes.sections.length} readPct={read.pct} />

        <div className="mt-5 grid-cols-1 gap-5 lg:grid-cols-12">
          {/* ============ LEFT COLUMN ============ */}
          <aside className="space-y-3 lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-[8.5rem] lg:space-y-3">
              <div className="overflow-hidden rounded-2xl border-[var(--cf-border)] bg-black shadow-xl">
                <div className="aspect-video w-full">
                  <iframe
                    ref={iframeRef}
                    src={`https://www.youtube.com/embed/${video.videoId}?enablejsapi=1&origin=${window.location.origin}`}
                    title={video.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              <PomodoroTimer videoId={notes.videoId} onSessionComplete={handleSessionComplete} />

              <ChapterRail
                sections={railSections}
                activeId={activeSectionId}
                readPct={read.pct}
                onJump={jumpToSection}
              />

              <div className="overflow-hidden rounded-2xl border-[var(--cf-border)] bg-white/70 backdrop-blur dark:bg-white/[0.04]">
                <div className="flex gap-1 border-b border-[var(--cf-border)] p-1.5">
                  {([
                    { key: 'transcript', label: 'Transcript', icon: <Clock className="h-3.5 w-3.5" /> },
                    { key: 'chat', label: 'Ask AI', icon: <MessageSquare className="h-3.5 w-3.5" /> },
                  ] as const).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveSideTab(t.key)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all ${
                        activeSideTab === t.key
                          ? 'cf-rainbow-bar text-white shadow-sm'
                          : 'text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface)]'
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="h-[340px]">
                  {activeSideTab === 'transcript' ? (
                    <TranscriptViewer
                      segments={transcript}
                      onSeek={handleSeek}
                      currentPlaybackSeconds={currentPlaybackSeconds}
                    />
                  ) : (
                    <AIChatDrawer notes={notes} onSeek={handleSeek} />
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* ============ RIGHT COLUMN ============ */}
          <section className="lg:col-span-8 xl:col-span-9">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex gap-1 rounded-xl border-[var(--cf-border)] bg-white/70 p-1 backdrop-blur dark:bg-white/[0.04]">
                {([
                  { key: 'notes', label: 'Study Notes', icon: <BookOpen className="h-3.5 w-3.5" /> },
                  { key: 'overview', label: 'Revision & Practice', icon: <ListChecks className="h-3.5 w-3.5" /> },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setRightTab(t.key)}
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                      rightTab === t.key
                        ? 'cf-rainbow-bar text-white shadow-sm'
                        : 'text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface)]'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              <span className="hidden items-center gap-1.5 text-[11px] font-bold text-[var(--cf-text-muted)] sm:flex">
                <Activity className="h-3.5 w-3.5 text-fuchsia-500" />
                {read.read}/{read.total} chapters read
              </span>
            </div>

            <NotesViewer
              notes={notes}
              onSeek={handleSeek}
              onEditSection={setEditingSection}
              onBookmarkToggle={handleBookmarkToggle}
              bookmarkedSectionIds={bookmarkedIds}
              readSectionIds={railSections.filter((s) => s.read).map((s) => s.id)}
              onToggleRead={toggleRead}
              activeSectionId={activeSectionId}
              view={rightTab}
            />
          </section>
        </div>
      </div>

      {/* ---------------- Overlays ---------------- */}
      <CommandPalette
        notes={notes}
        videoUrl={videoUrl}
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSeek={handleSeek}
        onOpenStudyTools={() => setIsStudyToolsOpen(true)}
      />

      {isExportOpen && (
        <ExportPack notes={notes} videoUrl={videoUrl} onClose={() => setIsExportOpen(false)} />
      )}

      <ShortcutsHelp isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      <NotesEditor
        section={editingSection}
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        onSave={handleSaveEditedSection}
      />

      <StudyToolsModal notes={notes} isOpen={isStudyToolsOpen} onClose={() => setIsStudyToolsOpen(false)} />

      <PDFPreviewModal
        notes={notes}
        video={video}
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
      />
    </div>
  );
};
