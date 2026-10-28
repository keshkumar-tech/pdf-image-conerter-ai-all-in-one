import React, { useState } from 'react';
import { NoteSection } from '../types';
import { X, Check, Sparkles, Plus, Trash2, ArrowUpRight } from 'lucide-react';

interface NotesEditorProps {
  section: NoteSection | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSection: NoteSection) => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  section,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !section) return null;

  const [title, setTitle] = useState(section.title);
  const [introduction, setIntroduction] = useState(section.introduction);
  const [detailedExplanation, setDetailedExplanation] = useState(section.detailedExplanation);
  const [keyConceptsText, setKeyConceptsText] = useState(section.keyConcepts.join('\n'));
  const [userNote, setUserNote] = useState('');

  const handleSave = () => {
    const updated: NoteSection = {
      ...section,
      title,
      introduction,
      detailedExplanation,
      keyConcepts: keyConceptsText.split('\n').map((l) => l.trim()).filter(Boolean),
      importantNotes: userNote ? [...(section.importantNotes || []), userNote] : section.importantNotes,
    };
    onSave(updated);
    onClose();
  };

  const handleQuickAction = (action: 'expand' | 'shorten' | 'add_example') => {
    if (action === 'expand') {
      setDetailedExplanation(
        (prev) => prev + '\n\nIn-Depth Context: The conceptual foundations here dictate that boundary constraints and algorithmic invariants be evaluated systematically to avoid edge-case failures.'
      );
    } else if (action === 'shorten') {
      const firstSentence = detailedExplanation.split('.')[0] + '.';
      setDetailedExplanation(firstSentence);
    } else if (action === 'add_example') {
      setKeyConceptsText((prev) => prev + '\nWorked Example: Practical evaluation of boundary parameters.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-400">
              Chapter {section.topicNumber}
            </span>
            <h3 className="text-base font-bold text-white">Edit & Personalize Section</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
          {/* Quick AI Assistance actions */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-950/30 p-3">
            <span className="flex items-center gap-1 font-semibold text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Adjustments:</span>
            </span>
            <button
              onClick={() => handleQuickAction('expand')}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-200 hover:bg-slate-700"
            >
              Expand Explanation
            </button>
            <button
              onClick={() => handleQuickAction('shorten')}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-200 hover:bg-slate-700"
            >
              Make Concise
            </button>
            <button
              onClick={() => handleQuickAction('add_example')}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-200 hover:bg-slate-700"
            >
              Add Key Concept
            </button>
          </div>

          <div>
            <label className="font-semibold text-slate-300">Topic Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300">Overview / Introduction</label>
            <textarea
              rows={2}
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300">Detailed Explanation</label>
            <textarea
              rows={6}
              value={detailedExplanation}
              onChange={(e) => setDetailedExplanation(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-100 leading-relaxed focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300">Key Concepts (One per line)</label>
            <textarea
              rows={3}
              value={keyConceptsText}
              onChange={(e) => setKeyConceptsText(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300">Add Personal Study Note / Annotation</label>
            <input
              type="text"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="e.g. Remember instructor emphasized this for final exam!"
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 p-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500"
          >
            <Check className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
