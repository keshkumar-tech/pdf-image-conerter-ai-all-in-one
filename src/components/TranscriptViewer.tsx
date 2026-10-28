import React, { useState, useMemo } from 'react';
import { Search, Play, Clock, Sparkles } from 'lucide-react';
import { TranscriptSegment } from '../types';

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  onSeek: (seconds: number) => void;
  currentPlaybackSeconds?: number;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  segments,
  onSeek,
  currentPlaybackSeconds = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments;
    const q = searchQuery.toLowerCase();
    return segments.filter((s) => s.text.toLowerCase().includes(q));
  }, [segments, searchQuery]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--cf-border)] glass shadow-sm overflow-hidden transition-colors">
      {/* Search Header */}
      <div className="border-b border-[var(--cf-border)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--cf-accent-dark)]" />
            <h3 className="text-xs font-bold text-[var(--cf-text-primary)] uppercase tracking-wider">
              Timestamped Transcript ({segments.length} segments)
            </h3>
          </div>
          <span className="font-mono text-[10px] text-[var(--cf-text-muted)] font-semibold">Click time to seek video</span>
        </div>

        <div className="relative mt-2.5">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--cf-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript: 'derivative', 'Newton', 'formula'..."
            className="w-full rounded-xl border border-[var(--cf-border)] bg-[var(--cf-surface)] py-2 pl-9 pr-4 text-xs text-[var(--cf-text-primary)] placeholder-[var(--cf-text-muted)] focus:border-[var(--cf-accent)] focus:bg-[var(--cf-bg-elevated)] focus:outline-none transition-colors"
          />
        </div>

        {searchQuery && (
          <p className="mt-1.5 text-[11px] text-[var(--cf-accent-dark)] font-semibold">
            Found {filteredSegments.length} matching occurrences
          </p>
        )}
      </div>

      {/* Segments List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredSegments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No transcript segments matched &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredSegments.map((seg, idx) => {
            const isNearCurrentTime =
              currentPlaybackSeconds >= seg.startTime &&
              currentPlaybackSeconds <= seg.endTime + 2;

            const formatSec = (sec: number) => {
              const m = Math.floor(sec / 60);
              const s = Math.floor(sec % 60);
              return `${m}:${s.toString().padStart(2, '0')}`;
            };

            return (
              <div
                key={idx}
                onClick={() => onSeek(seg.startTime)}
              className={`group flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-xs transition-all ${
                isNearCurrentTime
                  ? 'border-[var(--cf-accent)] bg-[var(--cf-accent)]/10 text-[var(--cf-text-primary)] shadow-xs'
                  : 'border-[var(--cf-border)] bg-[var(--cf-surface)]/50 hover:bg-[var(--cf-surface-2)] hover:border-[var(--cf-border-strong)] text-[var(--cf-text-secondary)]'
              }`}
              >
                <button
                  type="button"
                  title="Play from here"
                  className="flex shrink-0 items-center gap-1 rounded-md bg-[var(--cf-accent)]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--cf-accent-dark)] border border-[var(--cf-accent)]/20 group-hover:bg-[var(--cf-accent)] group-hover:text-white transition-colors"
                >
                  <Play className="h-2.5 w-2.5 fill-current" />
                  <span>{formatSec(seg.startTime)}</span>
                </button>
                <p className="leading-relaxed select-text font-medium">{seg.text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
