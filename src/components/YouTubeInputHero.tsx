import React, { useState } from 'react';
import { Sparkles, Clipboard, CheckCircle2, AlertCircle, Play, BookOpen, Clock, FileText, Globe, Sliders, Palette, ChevronRight, Layers, ArrowRight, Lock } from 'lucide-react';
import { NoteDepth, NoteLanguage, PDFTheme, VideoMetadata, SourceStatus } from '../types';
import { DEMO_LECTURES } from '../utils/demoData';
import { useAuth } from '../context/AuthContext';

interface YouTubeInputHeroProps {
  url: string;
  setUrl: (url: string) => void;
  depth: NoteDepth;
  setDepth: (depth: NoteDepth) => void;
  language: NoteLanguage;
  setLanguage: (lang: NoteLanguage) => void;
  pdfTheme: PDFTheme;
  setPdfTheme: (theme: PDFTheme) => void;
  onAnalyze: () => void;
  onProcess: () => void;
  isAnalyzing: boolean;
  analyzedVideo: VideoMetadata | null;
  sourceStatus: SourceStatus | null;
  onOpenSourceModal: () => void;
  onSelectDemo: (demoKey: string) => void;
}

export const YouTubeInputHero: React.FC<YouTubeInputHeroProps> = ({
  url,
  setUrl,
  depth,
  setDepth,
  language,
  setLanguage,
  pdfTheme,
  setPdfTheme,
  onAnalyze,
  onProcess,
  isAnalyzing,
  analyzedVideo,
  sourceStatus,
  onOpenSourceModal,
  onSelectDemo,
}) => {
  const { user, openAuthModal } = useAuth();
  const [pasteFeedback, setPasteFeedback] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setPasteFeedback(true);
        setTimeout(() => setPasteFeedback(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleGenerateClick = () => {
    if (!user) {
      openAuthModal('notes_generation', () => {
        onProcess();
      });
      return;
    }
    onProcess();
  };

  return (
    <div className="cf-vibe-bg relative overflow-hidden py-10 sm:py-16">
      {/* Animated multi-colour aurora blobs */}
      <div className="cf-blob cf-blob-slow left-[-6%] top-[-14%] h-[380px] w-[380px] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-400" />
      <div className="cf-blob cf-blob-reverse right-[-6%] top-[-8%] h-[340px] w-[340px] bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600" />
      <div className="cf-blob bottom-[-20%] left-[30%] h-[300px] w-[300px] bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500" />
      <div className="cf-grid-overlay" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="cf-pop-in inline-flex items-center gap-2 rounded-full border-white/60 bg-white/70 px-3.5 py-1 text-xs font-extrabold text-fuchsia-700 shadow-lg shadow-fuchsia-500/20 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-fuchsia-300">
          <Sparkles className="cf-hue h-3.5 w-3.5" />
          <span>Next-Generation Video-to-Study Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="cf-pop-in mt-6 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[var(--cf-text-primary)]">
          Turn Any Long Video Into <br className="hidden sm:inline" />
          <span className="relative inline-block">
            <span className="cf-rainbow-text">Complete Study Notes.</span>
            <span className="cf-rainbow-underline absolute -bottom-2 left-0 h-1.5 w-full rounded-full" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[var(--cf-text-secondary)] leading-relaxed">
          Paste a YouTube link and transform lectures, tutorials, courses, and educational videos into structured, timestamped study notes and beautiful multi-page PDFs.
        </p>

        {/* Main URL Input Form */}
        <div className="mx-auto mt-8 max-w-3xl">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2 rounded-2xl border border-[var(--cf-border)] glass-strong p-2 shadow-xl shadow-[var(--cf-accent)]/5 transition-all focus-within:border-[var(--cf-accent)] focus-within:ring-4 focus-within:ring-[var(--cf-accent)]/10">
            <div className="relative flex flex-1 items-center">
              <input
                id="youtube-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onAnalyze();
                }}
                placeholder="Paste YouTube lecture URL (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full bg-transparent px-4 py-3 text-sm text-[var(--cf-text-primary)] placeholder-[var(--cf-text-muted)] focus:outline-none dark:text-slate-100 dark:placeholder-slate-500"
              />
              <button
                id="btn-paste-clipboard"
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="mr-2 flex items-center gap-1 rounded-lg border border-[var(--cf-border)] bg-[var(--cf-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-2)] transition-colors cursor-pointer"
              >
                <Clipboard className="h-3.5 w-3.5" />
                <span>{pasteFeedback ? 'Pasted!' : 'Paste'}</span>
              </button>
            </div>

            <button
              id="btn-get-notes"
              type="button"
              disabled={!url.trim() || isAnalyzing}
              onClick={onAnalyze}
              className="cf-btn-rainbow cf-shimmer flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAnalyzing ? (
                <span>Analyzing Source...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Source</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-2 text-xs text-[var(--cf-text-muted)]">
            <span>Scalable Map-Reduce chunking architecture for long lectures.</span>
            {!user && (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                • <Lock className="h-3 w-3" /> Login required to generate notes
              </span>
            )}
          </div>
        </div>

        {/* Configuration Options Drawer */}
        <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-[var(--cf-border)] glass p-4 text-left shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Note Depth */}
            <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--cf-text-primary)]">
                <Sliders className="h-3.5 w-3.5 text-[var(--cf-accent)]" />
                <span>Note Depth</span>
                <span className="rounded bg-[var(--cf-accent)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--cf-accent-dark)] border border-[var(--cf-accent)]/20">
                  Recommended
                </span>
              </label>
              <select
                id="select-depth"
                value={depth}
                onChange={(e) => setDepth(e.target.value as NoteDepth)}
                className="mt-1.5 w-full rounded-xl border border-[var(--cf-border)] bg-[var(--cf-surface)] px-3 py-2 text-xs font-medium text-[var(--cf-text-primary)] focus:border-[var(--cf-accent)] focus:bg-[var(--cf-bg-elevated)] focus:outline-none transition-colors"
              >
                <option value="complete">Complete (Exhaustive Study Notes)</option>
                <option value="deep_dive">Deep Dive (Detailed Analysis)</option>
                <option value="detailed">Detailed (Balanced Chapters)</option>
                <option value="high_level">High Level (Concise Overview)</option>
              </select>
              <p className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                Complete captures every formula, term, concept & argument.
              </p>
            </div>

            {/* Language */}
            <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--cf-text-primary)]">
                <Globe className="h-3.5 w-3.5 text-indigo-500" />
                <span>Output Language</span>
              </label>
              <select
                id="select-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as NoteLanguage)}
                className="mt-1.5 w-full rounded-xl border border-[var(--cf-border)] bg-[var(--cf-surface)] px-3 py-2 text-xs font-medium text-[var(--cf-text-primary)] focus:border-[var(--cf-accent)] focus:bg-[var(--cf-bg-elevated)] focus:outline-none transition-colors"
              >
                <option value="en">English (Academic)</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="zh">Chinese (中文)</option>
                <option value="ja">Japanese (日本語)</option>
              </select>
              <p className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                Synthesizes academic vocabulary in chosen language.
              </p>
            </div>

            {/* PDF Slide Theme */}
            <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--cf-text-primary)]">
                <Palette className="h-3.5 w-3.5 text-sky-600" />
                <span>PDF Slide Palette</span>
              </label>
              <select
                id="select-pdf-theme"
                value={pdfTheme}
                onChange={(e) => setPdfTheme(e.target.value as PDFTheme)}
                className="mt-1.5 w-full rounded-xl border border-[var(--cf-border)] bg-[var(--cf-surface)] px-3 py-2 text-xs font-medium text-[var(--cf-text-primary)] focus:border-[var(--cf-accent)] focus:bg-[var(--cf-bg-elevated)] focus:outline-none transition-colors"
              >
                <option value="modern">Modern Indigo (Clean Slide Decks)</option>
                <option value="academic">Academic Emerald (Textbook Style)</option>
                <option value="slate">Monochrome Slate (Minimalist)</option>
                <option value="crimson">Warm Crimson (High Contrast)</option>
                <option value="sunset">Sunset Amber (Vibrant Notes)</option>
              </select>
              <p className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                Theme controls header styles, color accents, and card borders.
              </p>
            </div>
          </div>
        </div>

        {/* Video Verified Details Card & Processing Trigger */}
        {analyzedVideo && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-[var(--cf-border)] glass p-5 text-left shadow-xl shadow-[var(--cf-accent)]/5 transition-all">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden bg-[var(--cf-surface-2)] border border-[var(--cf-border)] shrink-0">
                <img
                  src={analyzedVideo.thumbnail}
                  alt={analyzedVideo.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-mono text-white">
                  {analyzedVideo.durationFormatted}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <span className="rounded-md bg-[var(--cf-accent)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--cf-accent-dark)] border border-[var(--cf-accent)]/20">
                  {analyzedVideo.category || 'Lecture'}
                </span>
                  <h3 className="mt-1 text-sm sm:text-base font-bold text-[var(--cf-text-primary)] line-clamp-2 leading-snug">
                  {analyzedVideo.title}
                </h3>
                  <p className="text-xs text-[var(--cf-text-muted)] mt-0.5 font-medium">
                  {analyzedVideo.channel}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Video Verified</span>
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Direct Link Ready</span>
                  </span>

                  <button
                    type="button"
                    onClick={onOpenSourceModal}
                    className="inline-flex items-center gap-1 rounded-md bg-[var(--cf-surface)] px-2 py-1 text-[11px] font-medium text-[var(--cf-text-secondary)] border border-[var(--cf-border)] hover:bg-[var(--cf-surface-2)] transition-colors cursor-pointer"
                  >
                    <span>Optional: Custom .srt</span>
                  </button>
                </div>

                  <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[var(--cf-border)]">
                    <span className="text-[11px] text-[var(--cf-text-muted)] font-mono">
                    Depth: {depth.toUpperCase()} • Theme: {pdfTheme}
                  </span>
                  
                  <button
                    id="btn-generate-start"
                    onClick={handleGenerateClick}
                    className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                      !user
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-orange-500/20 hover:from-amber-500 hover:to-orange-500 ring-1 ring-amber-400/30'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500'
                    }`}
                  >
                    {!user ? (
                      <>
                        <Lock className="h-3.5 w-3.5 text-amber-200" />
                        <span>Sign In to Generate Notes</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Complete Notes</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instant Demo Lectures */}
        <div className="mx-auto mt-12 max-w-4xl text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--cf-text-secondary)]">
              Or Instant Test with Curated Long Lectures:
            </h4>
            <span className="text-[11px] text-[var(--cf-text-muted)] font-medium">1-click complete processing</span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(DEMO_LECTURES).map(([key, demo]) => (
              <div
                key={key}
                id={`demo-card-${key}`}
                onClick={() => onSelectDemo(key)}
                className="cf-lift cf-gradient-ring cf-shimmer group flex cursor-pointer flex-col justify-between rounded-2xl border-[var(--cf-border)] bg-white/80 p-4 backdrop-blur transition-all dark:bg-white/[0.04]"
              >
                <div>
                  <div className="flex items-center justify-between">
                <span className="rounded-md bg-[var(--cf-accent)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--cf-accent-dark)] border border-[var(--cf-accent)]/20">
                      {demo.metadata.category}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--cf-text-muted)]">{demo.metadata.durationFormatted}</span>
                  </div>
                  <h5 className="mt-2.5 text-xs font-bold text-[var(--cf-text-primary)] line-clamp-2 group-hover:text-[var(--cf-accent-dark)] transition-colors">
                    {demo.metadata.title}
                  </h5>
                  <p className="mt-1 text-[11px] text-[var(--cf-text-muted)] line-clamp-1">{demo.metadata.channel}</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[var(--cf-border)] pt-2.5 text-[11px] font-extrabold text-fuchsia-600 dark:text-fuchsia-300">
                  <span>Load lecture</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
