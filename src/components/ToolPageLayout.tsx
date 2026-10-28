import React, { useState, useCallback } from 'react';
import { Upload, FileType2, Loader2, Download, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';

interface ToolOption {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select';
  defaultValue?: string | number;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
}

interface ToolPageLayoutProps {
  title: string;
  description: string;
  acceptedTypes: string[];
  maxFiles?: number;
  maxSizeMB?: number;
  icon: React.ReactNode;
  accentColor: string;
  onProcess: (files: File[], options?: Record<string, any>) => Promise<Blob | null>;
  processButtonText?: string;
  showPreview?: boolean;
  resultFilename?: string;
  options?: ToolOption[];
  backPath?: string;
}

export function ToolPageLayout({
  title,
  description,
  acceptedTypes,
  maxFiles = 1,
  maxSizeMB = 50,
  icon,
  accentColor,
  onProcess,
  processButtonText = 'Process',
  showPreview = false,
  resultFilename,
  options = [],
  backPath,
}: ToolPageLayoutProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [toolOptions, setToolOptions] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    options.forEach(opt => {
      initial[opt.key] = opt.defaultValue ?? (opt.type === 'number' ? 0 : '');
    });
    return initial;
  });

  const validateFiles = useCallback((fileList: File[]): string | null => {
    if (fileList.length > maxFiles) {
      return `Maximum ${maxFiles} file(s) allowed`;
    }
    for (const file of fileList) {
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        return `File ${file.name} exceeds ${maxSizeMB}MB limit`;
      }
      if (!acceptedTypes.includes(file.type) && !acceptedTypes.some(type => file.type.includes(type.split('/')[1]))) {
        return `File ${file.name} has unsupported format`;
      }
    }
    return null;
  }, [acceptedTypes, maxFiles, maxSizeMB]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validationError = validateFiles(droppedFiles);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFiles(prev => [...prev, ...droppedFiles].slice(0, maxFiles));
    setError(null);
  }, [maxFiles, validateFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const validationError = validateFiles(selected);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFiles(prev => [...prev, ...selected].slice(0, maxFiles));
      setError(null);
    }
  }, [maxFiles, validateFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResultBlob(null);
    setError(null);
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) return;
    const validationError = validateFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultBlob(null);
    setProgress(0);

    try {
      const blob = await onProcess(files, toolOptions);
      if (blob) {
        setResultBlob(blob);
      }
    } catch (err: any) {
      setError(err.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setResultBlob(null);
    handleProcess();
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultFilename || `${title.toLowerCase().replace(/\s+/g, '-')}-result`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateOption = (key: string, value: any) => {
    setToolOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="cf-vibe-bg mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with back button */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {backPath && (
            <a
              href={backPath}
              className="flex items-center gap-1 text-sm text-[var(--cf-text-secondary)] hover:text-[var(--cf-text-primary)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className={`cf-float flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accentColor} text-white shadow-lg`}>
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--cf-text-primary)] sm:text-3xl">
              {title}
            </h1>
            <p className="text-sm text-[var(--cf-text-secondary)]">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Tool-specific options */}
      {options.length > 0 && (
        <div className="mb-6 rounded-2xl border border-[var(--cf-border)] glass-card p-5">
          <h3 className="text-sm font-bold text-[var(--cf-text-primary)] mb-3">Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map(opt => (
              <div key={opt.key}>
                <label className="block text-xs font-semibold text-[var(--cf-text-secondary)] mb-1">
                  {opt.label}
                </label>
                {opt.type === 'select' ? (
                  <select
                    value={toolOptions[opt.key] || ''}
                    onChange={e => updateOption(opt.key, e.target.value)}
                    className="w-full rounded-xl border border-[var(--cf-border)] bg-white px-3 py-2 text-sm text-[var(--cf-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cf-accent)]/40"
                  >
                    {opt.options?.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={opt.type}
                    value={toolOptions[opt.key] || ''}
                    onChange={e => updateOption(opt.key, opt.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                    min={opt.min}
                    max={opt.max}
                    className="w-full rounded-xl border border-[var(--cf-border)] bg-white px-3 py-2 text-sm text-[var(--cf-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cf-accent)]/40"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`cf-gradient-ring relative rounded-2xl border-2 border-dashed bg-white/60 backdrop-blur transition-all dark:bg-white/[0.03] ${
          isDragging
            ? 'border-fuchsia-400 bg-fuchsia-500/5'
            : 'border-[var(--cf-border)] hover:border-fuchsia-400/70'
        }`}
      >
        <input
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
          id={`file-upload-${title.toLowerCase().replace(/\s+/g, '-')}`}
        />
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="cf-float mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-fuchsia-500/30">
            <Upload className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold text-[var(--cf-text-primary)]">
            Drop files here or click to browse
          </p>
          <p className="mt-1 text-xs text-[var(--cf-text-muted)]">
            Supported: {acceptedTypes.join(', ')} • Max {maxSizeMB}MB
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold text-[var(--cf-text-primary)]">
            Selected Files ({files.length})
          </h3>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl border border-[var(--cf-border)] glass-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--cf-surface)]">
                <FileType2 className="h-5 w-5 text-[var(--cf-text-muted)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--cf-text-primary)] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-[var(--cf-text-muted)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-900">Error</p>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--cf-accent)]" />
            <span className="text-sm font-semibold text-[var(--cf-text-primary)]">
              Processing...
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--cf-surface)] overflow-hidden">
            <div
              className="cf-rainbow-bar h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleProcess}
          disabled={files.length === 0 || isProcessing}
          className="cf-btn-rainbow cf-shimmer flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileType2 className="h-4 w-4" />
              {processButtonText}
            </>
          )}
        </button>

        {resultBlob && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl border border-[var(--cf-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--cf-text-primary)] hover:bg-[var(--cf-surface)] transition-all"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        )}

        {error && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-6 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>

      {/* Result Info */}
      {resultBlob && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            Success! Your file is ready.
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            Size: {(resultBlob.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}
    </div>
  );
}
