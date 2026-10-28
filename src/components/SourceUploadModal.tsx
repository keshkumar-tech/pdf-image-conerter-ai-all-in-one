import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, Check, X, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface SourceUploadModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (segmentCount: number) => void;
  onSelectDemo: (demoKey: string) => void;
}

export const SourceUploadModal: React.FC<SourceUploadModalProps> = ({
  videoId,
  isOpen,
  onClose,
  onSuccess,
  onSelectDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'demo'>('paste');
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePasteSubmit = async () => {
    if (!rawText.trim()) {
      setErrorMessage('Please paste or enter some transcript text.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.uploadTranscript(videoId, rawText, 'text');
      onSuccess(res.segmentCount);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process transcript text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const text = await file.text();
      const format = file.name.endsWith('.srt') ? 'srt' : file.name.endsWith('.vtt') ? 'vtt' : 'text';
      const res = await api.uploadTranscript(videoId, text, format);
      onSuccess(res.segmentCount);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read uploaded file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Transcript Acquisition Alternative</h3>
            <p className="text-xs text-slate-400">
              This YouTube video has no public automated captions. Provide a transcript to generate complete notes.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="mt-6 flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('paste')}
            className={`border-b-2 px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'paste'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Transcript / Text
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`border-b-2 px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload File (.srt, .vtt, .txt)
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`border-b-2 px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'demo'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Or Try Curated Demo Lecture
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-4">
          {activeTab === 'paste' && (
            <div>
              <p className="mb-2 text-xs text-slate-400">
                Paste the lecture script, speech-to-text transcript, or timestamped notes (e.g. `[03:45] Intro...`):
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="00:00 Welcome to the lecture...&#10;03:25 The first theorem states that...&#10;12:40 For our calculation, we set up..."
                className="h-44 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasteSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Load Transcript & Continue'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <p className="mb-3 text-xs text-slate-400">
                Upload your subtitle or transcript file (.srt, .vtt, .txt, or .json):
              </p>
              <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 hover:border-blue-500 hover:bg-slate-900/50">
                <Upload className="h-8 w-8 text-blue-400" />
                <span className="mt-2 text-xs font-medium text-slate-300">Click to browse or drag file here</span>
                <span className="mt-1 text-[11px] text-slate-500">Supports SRT, VTT, and plain text transcripts</span>
                <input
                  type="file"
                  accept=".srt,.vtt,.txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Test NoteFlow AI immediately with real comprehensive lecture sources:
              </p>
              <div
                onClick={() => {
                  onSelectDemo('python_masterclass');
                  onClose();
                }}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-blue-500 hover:bg-slate-800/60"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">Python Programming Masterclass</h4>
                  <p className="text-[11px] text-slate-400">4 hours 17 mins • freeCodeCamp • 12 Chapter Blocks</p>
                </div>
                <span className="rounded-md bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-400">
                  Select
                </span>
              </div>

              <div
                onClick={() => {
                  onSelectDemo('mit_physics');
                  onClose();
                }}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-blue-500 hover:bg-slate-800/60"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">MIT Classical Mechanics & Calculus</h4>
                  <p className="text-[11px] text-slate-400">1 hour • MIT OpenCourseWare • Kinematics & Derivations</p>
                </div>
                <span className="rounded-md bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-400">
                  Select
                </span>
              </div>

              <div
                onClick={() => {
                  onSelectDemo('machine_learning');
                  onClose();
                }}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-blue-500 hover:bg-slate-800/60"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">Neural Networks & Deep Learning Math</h4>
                  <p className="text-[11px] text-slate-400">1 hour 10 mins • 3Blue1Brown • Backpropagation & Matrices</p>
                </div>
                <span className="rounded-md bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-400">
                  Select
                </span>
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="mt-3 text-xs text-rose-400">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};
