import React from 'react';
import { CheckCircle2, Loader2, Sparkles, AlertCircle, FileCheck, Layers, Cpu, ShieldCheck } from 'lucide-react';
import { ProcessingJob } from '../types';

interface PipelineProgressProps {
  job: ProcessingJob | null;
  videoTitle?: string;
  onCancel?: () => void;
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({ job, videoTitle }) => {
  if (!job) return null;

  const stages = [
    { id: 'analyzing', label: '01 Analyzing YouTube source', icon: Layers, minProgress: 10 },
    { id: 'preparing', label: '02 Preparing source & metadata', icon: FileCheck, minProgress: 20 },
    { id: 'chunking', label: '03 Semantic chunking of transcript', icon: Cpu, minProgress: 35 },
    { id: 'detecting', label: '04 Topic detection (Map Stage)', icon: Sparkles, minProgress: 55 },
    { id: 'synthesizing', label: '05 Building complete notes (Reduce Stage)', icon: BookOpenIcon, minProgress: 75 },
    { id: 'verifying', label: '06 Verifying coverage & formulas', icon: ShieldCheck, minProgress: 90 },
    { id: 'generating_pdf', label: '07 Designing slide-style PDF', icon: FileCheck, minProgress: 98 },
    { id: 'completed', label: '08 Study notes ready', icon: CheckCircle2, minProgress: 100 },
  ];

  return (
    <div id="pipeline-progress-container" className="mx-auto my-8 max-w-3xl rounded-2xl border border-[var(--cf-border)] glass p-6 sm:p-8 shadow-xl shadow-[var(--cf-accent)]/5 transition-colors">
      {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--cf-accent)] animate-ping" />
            <h3 className="text-lg font-bold text-[var(--cf-text-primary)] tracking-tight">AI Note Generation Pipeline</h3>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[var(--cf-text-secondary)]">
            Processing full lecture content: <span className="font-semibold text-[var(--cf-text-primary)]">{videoTitle || 'Educational Video'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold text-[var(--cf-accent-dark)]">{job.progress}%</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cf-accent)]/10 text-[var(--cf-accent-dark)]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="relative mb-6 h-2.5 w-full overflow-hidden rounded-full bg-[var(--cf-surface-2)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--cf-accent-dark)] via-indigo-500 to-sky-400 transition-all duration-500 ease-out"
          style={{ width: `${Math.max(5, job.progress)}%` }}
        />
      </div>

      {/* Stage Status Callout */}
      <div className="mb-8 rounded-2xl border border-[var(--cf-accent)]/20 bg-[var(--cf-accent)]/5 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--cf-accent-dark)] uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Active Pipeline Step</span>
        </div>
        <p className="mt-1 text-sm font-semibold text-[var(--cf-text-primary)]">{job.currentStage}</p>
        {job.stageDetails && (
          <p className="mt-0.5 text-xs text-[var(--cf-text-muted)] font-mono">{job.stageDetails}</p>
        )}
      </div>

      {/* Pipeline Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stages.map((stage) => {
          const isDone = job.progress >= stage.minProgress;
          const isCurrent = !isDone && job.progress >= stage.minProgress - 15;

          return (
            <div
              key={stage.id}
              className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-all ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                  : isCurrent
                  ? 'border-[var(--cf-accent)]/40 bg-[var(--cf-accent)]/5 text-[var(--cf-text-primary)] shadow-xs'
                  : 'border-[var(--cf-border)] bg-[var(--cf-surface)]/60 text-[var(--cf-text-muted)]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 text-[var(--cf-accent-dark)] animate-spin shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-[var(--cf-border-strong)] shrink-0" />
                )}
                <span className="font-semibold">{stage.label}</span>
              </div>
              <span className="font-mono text-[10px] opacity-75">
                {isDone ? 'Done' : isCurrent ? 'Active' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
