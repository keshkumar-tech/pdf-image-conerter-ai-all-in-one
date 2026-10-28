import React, { useState, useEffect } from 'react';
import { FileText, Download, Play, BookOpen, Clock, Trash2, Sparkles, GraduationCap, Search, Lock } from 'lucide-react';
import { api } from '../services/api';
import { VideoMetadata, NoteDocument } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onOpenVideoNotes: (videoId: string) => void;
  onOpenPDFPreview: (videoId: string) => void;
  onOpenStudyTools: (videoId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenVideoNotes,
  onOpenPDFPreview,
  onOpenStudyTools,
}) => {
  const { user, executeWithAuth } = useAuth();
  const [libraryData, setLibraryData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLib = async () => {
      try {
        const res = await api.getLibrary();
        setLibraryData(res.items || []);
      } catch (err) {
        console.warn('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLib();
  }, []);

  const filteredItems = libraryData.filter((item) => {
    if (!searchQuery.trim()) return true;
    return (
      item.video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.video.channel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cf-border)] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--cf-text-primary)] tracking-tight">Study Document Library & PDFs</h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--cf-text-secondary)]">
            Access, review, and export all generated lecture notes, multi-page slide decks, and study tools.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-[var(--cf-border)] glass px-3.5 py-2 text-center shadow-xs">
            <span className="text-[10px] text-[var(--cf-text-muted)] uppercase tracking-wider block font-semibold">Processed Videos</span>
            <span className="font-mono text-base font-bold text-[var(--cf-accent-dark)]">{libraryData.length}</span>
          </div>
          <div className="rounded-2xl border border-[var(--cf-border)] glass px-3.5 py-2 text-center shadow-xs">
            <span className="text-[10px] text-[var(--cf-text-muted)] uppercase tracking-wider block font-semibold">Study Chapters</span>
            <span className="font-mono text-base font-bold text-emerald-600">
              {libraryData.reduce((acc, curr) => acc + (curr.topicCount || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved videos and topics..."
            className="w-full rounded-2xl border border-[var(--cf-border)] bg-white py-2.5 pl-10 pr-4 text-xs text-[var(--cf-text-primary)] placeholder-[var(--cf-text-muted)] focus:border-[var(--cf-accent)] focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="py-16 text-center text-xs text-blue-600 dark:text-blue-400">Loading library...</div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-[var(--cf-border)] glass py-16 text-center shadow-xs">
            <BookOpen className="mx-auto h-10 w-10 text-[var(--cf-text-muted)] mb-3" />
            <h3 className="text-sm font-bold text-[var(--cf-text-primary)]">No Notes Found</h3>
            <p className="text-xs text-[var(--cf-text-muted)] mt-1 max-w-sm mx-auto">
              Paste a YouTube lecture link on the generator to create your first complete study document.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.video.videoId}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--cf-border)] glass-card p-5 shadow-sm hover:shadow-md transition-all hover:border-[var(--cf-accent)]/50"
              >
                <div>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[var(--cf-surface-2)] border border-[var(--cf-border)]">
                    <img
                      src={item.video.thumbnail}
                      alt={item.video.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                      {item.video.durationFormatted}
                    </div>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-[var(--cf-text-primary)] line-clamp-2 leading-snug">
                    {item.video.title}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--cf-text-muted)]">
                    {item.video.channel} • {item.topicCount} Study Chapters
                  </p>
                </div>

                <div className="mt-5 space-y-2 border-t border-[var(--cf-border)] pt-4">
                  <div className="flex items-center justify-between text-[11px] text-[var(--cf-text-muted)] font-mono">
                    <span>Theme: {item.pdfTheme || 'Academic'}</span>
                    <span className="text-emerald-600 font-bold">Ready</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onOpenVideoNotes(item.video.videoId)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--cf-accent)] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--cf-accent-dark)] cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Open Notes</span>
                    </button>

                    <button
                      onClick={() => executeWithAuth('pdf_generation', () => onOpenPDFPreview(item.video.videoId))}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        !user
                          ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'border-[var(--cf-border)] bg-[var(--cf-surface)] text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-2)]'
                      }`}
                    >
                      {!user ? <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" /> : <FileText className="h-3.5 w-3.5" />}
                      <span>{!user ? 'Login for PDF' : 'PDF Slides'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
