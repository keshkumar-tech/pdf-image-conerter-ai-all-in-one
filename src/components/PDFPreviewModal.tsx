import React, { useState } from 'react';
import { X, Download, Printer, ChevronLeft, ChevronRight, Maximize2, Minimize2, Palette, FileText, Sparkles, Check, Lock } from 'lucide-react';
import { NoteDocument, VideoMetadata, PDFTheme } from '../types';
import { generatePDFDocument, downloadNotesAsMarkdown, THEME_PALETTES, PDFExportOptions } from '../services/pdfGenerator';
import { MathFormula } from '../utils/mathRenderer';
import { useAuth } from '../context/AuthContext';

interface PDFPreviewModalProps {
  notes: NoteDocument;
  video: VideoMetadata;
  isOpen: boolean;
  onClose: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  notes,
  video,
  isOpen,
  onClose,
}) => {
  const { user, openAuthModal } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<PDFTheme>(notes.pdfTheme || 'modern');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isOpen) return null;

  // Pages structure:
  // Page 1: Cover
  // Page 2: Table of Contents
  // Page 3 to 2+N: Chapter topics
  // Last page: Quick Revision
  const totalPages = 2 + notes.sections.length + (notes.quickRevisionPoints.length > 0 ? 1 : 0);
  const currentSection = currentPage > 2 && currentPage <= 2 + notes.sections.length
    ? notes.sections[currentPage - 3]
    : null;

  const currentPalette = THEME_PALETTES[selectedTheme] || THEME_PALETTES.modern;

  const performPDFGenerationAndDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const options: PDFExportOptions = {
        orientation: 'landscape',
        theme: selectedTheme,
        includeCover: true,
        includeTOC: true,
        includeFormulas: true,
        includeExamples: true,
        includeQuestions: true,
        includeQuickRevision: true,
      };
      const doc = await generatePDFDocument(notes, video, options);
      const safeFilename = `${notes.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_StudyNotes.pdf`;
      doc.save(safeFilename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!user) {
      openAuthModal('pdf_generation', () => {
        performPDFGenerationAndDownload();
      });
      return;
    }
    await performPDFGenerationAndDownload();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md">
      <div className="relative flex h-[95vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/90 px-5 py-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Slide PDF Previewer
              </h3>
              <p className="text-[10px] text-slate-400">Landscape 16:9 Presentation Format</p>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <Palette className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as PDFTheme)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="modern">Modern Obsidian</option>
              <option value="academic">Academic Slate</option>
              <option value="minimal">Minimal Crisp</option>
              <option value="notebook">Notebook Sepia</option>
              <option value="professional">Professional Emerald</option>
              <option value="exam">Exam Focus</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadNotesAsMarkdown(notes, video)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              Export Markdown
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-lg transition-all disabled:opacity-50 ${
                !user
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-orange-500/20 ring-1 ring-amber-400/30'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Downloaded!</span>
                </>
              ) : isDownloading ? (
                <span>Generating PDF...</span>
              ) : !user ? (
                <>
                  <Lock className="h-3.5 w-3.5 text-amber-200" />
                  <span>Sign In to Download PDF</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Slide Stage Canvas */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-8 flex items-center justify-center">
          {/* 16:9 Aspect Ratio Slide Container */}
          <div
            className="w-full max-w-4xl aspect-[16/9] rounded-xl shadow-2xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-10 border"
            style={{
              backgroundColor: currentPalette.bg,
              borderColor: currentPalette.cardBorder,
              color: currentPalette.textPrimary,
            }}
          >
            {/* Slide Header */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: currentPalette.cardBorder }}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wider" style={{ color: currentPalette.primary }}>
                  NoteFlow AI
                </span>
                <span className="text-[11px] opacity-70">
                  — {notes.title}
                </span>
              </div>
              <span className="font-mono text-xs font-bold opacity-80" style={{ color: currentPalette.primary }}>
                Page {currentPage} of {totalPages}
              </span>
            </div>

            {/* Slide Body Content */}
            <div className="flex-1 py-4 overflow-hidden flex flex-col justify-center">
              {/* PAGE 1: COVER */}
              {currentPage === 1 && (
                <div
                  className="rounded-2xl p-6 sm:p-8 border flex flex-col justify-between h-full"
                  style={{ backgroundColor: currentPalette.cardBg, borderColor: currentPalette.cardBorder }}
                >
                  <div>
                    <span
                      className="inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase mb-3"
                      style={{ backgroundColor: currentPalette.tagBg, color: currentPalette.primary }}
                    >
                      Complete Study Notes
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold leading-tight" style={{ color: currentPalette.textPrimary }}>
                      {notes.title}
                    </h1>
                    <p className="mt-2 text-xs opacity-75">
                      Source Channel: {video.channel} • Total Duration: {video.durationFormatted} • Chapters: {notes.sections.length}
                    </p>
                  </div>

                  <div className="rounded-xl p-4 mt-4" style={{ backgroundColor: currentPalette.bg }}>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: currentPalette.primary }}>
                      Executive Overview
                    </h5>
                    <p className="text-xs line-clamp-3 leading-relaxed opacity-85">
                      {notes.executiveOverview}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] opacity-60 font-mono">
                    <span>Generated by NoteFlow AI Platform</span>
                    <span>Verified Source Grounding</span>
                  </div>
                </div>
              )}

              {/* PAGE 2: TABLE OF CONTENTS */}
              {currentPage === 2 && (
                <div
                  className="rounded-2xl p-6 sm:p-8 border h-full flex flex-col"
                  style={{ backgroundColor: currentPalette.cardBg, borderColor: currentPalette.cardBorder }}
                >
                  <h3 className="text-base font-bold mb-4" style={{ color: currentPalette.textPrimary }}>
                    Lecture Syllabus & Table of Contents
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5 overflow-hidden flex-1">
                    {notes.sections.slice(0, 10).map((sec) => (
                      <div
                        key={sec.id}
                        className="rounded-lg p-2.5 flex items-center justify-between text-xs border"
                        style={{ backgroundColor: currentPalette.bg, borderColor: currentPalette.cardBorder }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono font-bold" style={{ color: currentPalette.primary }}>
                            {sec.topicNumber.toString().padStart(2, '0')}.
                          </span>
                          <span className="truncate">{sec.title}</span>
                        </div>
                        <span className="font-mono text-[10px] font-semibold opacity-75" style={{ color: currentPalette.secondary }}>
                          [{sec.timestampFormatted}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TOPIC CHAPTER SLIDES */}
              {currentSection && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  {/* Left: Overview and Explanation */}
                  <div
                    className="rounded-2xl p-5 border flex flex-col justify-between overflow-hidden"
                    style={{ backgroundColor: currentPalette.cardBg, borderColor: currentPalette.cardBorder }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold" style={{ color: currentPalette.primary }}>
                          Chapter {currentSection.topicNumber}
                        </span>
                        <span className="font-mono text-xs font-semibold" style={{ color: currentPalette.secondary }}>
                          Source: [{currentSection.timestampFormatted}]
                        </span>
                      </div>
                      <h3 className="text-base font-bold mt-1" style={{ color: currentPalette.textPrimary }}>
                        {currentSection.title}
                      </h3>
                      <p className="mt-2 text-xs italic opacity-75 line-clamp-2">
                        {currentSection.introduction}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed opacity-90 line-clamp-4">
                        {currentSection.detailedExplanation}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t" style={{ borderColor: currentPalette.cardBorder }}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: currentPalette.primary }}>
                        Key Concept Invariants
                      </span>
                      <ul className="text-xs space-y-1 opacity-80">
                        {currentSection.keyConcepts.slice(0, 2).map((c, i) => (
                          <li key={i} className="truncate">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right: Formulas or Worked Examples */}
                  <div
                    className="rounded-2xl p-5 border flex flex-col justify-between overflow-hidden"
                    style={{ backgroundColor: currentPalette.cardBg, borderColor: currentPalette.cardBorder }}
                  >
                    {currentSection.formulas && currentSection.formulas.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: currentPalette.primary }}>
                          Formula Breakdown
                        </span>
                        <div className="rounded-xl p-3 border" style={{ backgroundColor: currentPalette.bg, borderColor: currentPalette.cardBorder }}>
                          <span className="text-xs font-bold block mb-1">{currentSection.formulas[0].title}</span>
                          <div className="py-1">
                            <MathFormula latex={currentSection.formulas[0].latex} block />
                          </div>
                          <p className="text-[11px] opacity-75 mt-1">{currentSection.formulas[0].explanation}</p>
                        </div>
                      </div>
                    ) : currentSection.codeBlocks && currentSection.codeBlocks.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: currentPalette.primary }}>
                          Code Construct [{currentSection.codeBlocks[0].language}]
                        </span>
                        <pre className="rounded-xl p-3 font-mono text-[10px] overflow-hidden leading-tight border" style={{ backgroundColor: currentPalette.bg, borderColor: currentPalette.cardBorder }}>
                          {currentSection.codeBlocks[0].code.split('\n').slice(0, 6).join('\n')}
                        </pre>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: currentPalette.secondary }}>
                          Conceptual Focus
                        </span>
                        <div className="rounded-xl p-3 border" style={{ backgroundColor: currentPalette.bg, borderColor: currentPalette.cardBorder }}>
                          <p className="text-xs leading-relaxed">{currentSection.detailedExplanation}</p>
                        </div>
                      </div>
                    )}

                    {currentSection.commonMistakes && currentSection.commonMistakes.length > 0 && (
                      <div className="rounded-xl p-2.5 mt-2 border border-rose-500/30 bg-rose-950/20 text-xs">
                        <strong className="text-rose-400">Pitfall: </strong>
                        <span className="opacity-90">{currentSection.commonMistakes[0].mistake}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LAST PAGE: QUICK REVISION */}
              {currentPage === totalPages && (
                <div
                  className="rounded-2xl p-6 sm:p-8 border h-full flex flex-col justify-between"
                  style={{ backgroundColor: currentPalette.cardBg, borderColor: currentPalette.cardBorder }}
                >
                  <h3 className="text-base font-bold" style={{ color: currentPalette.primary }}>
                    Quick Revision (High-Yield Takeaways)
                  </h3>

                  <div className="grid grid-cols-2 gap-3 my-auto">
                    {notes.quickRevisionPoints.slice(0, 6).map((pt, pIdx) => (
                      <div
                        key={pIdx}
                        className="rounded-lg p-3 text-xs border flex items-start gap-2"
                        style={{ backgroundColor: currentPalette.bg, borderColor: currentPalette.cardBorder }}
                      >
                        <span className="font-mono font-bold" style={{ color: currentPalette.primary }}>
                          {(pIdx + 1).toString().padStart(2, '0')}.
                        </span>
                        <span className="line-clamp-2 leading-relaxed opacity-90">{pt}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-[10px] opacity-60 font-mono">
                    Study ready • Verified against timestamps • Generated with NoteFlow AI
                  </div>
                </div>
              )}
            </div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between border-t pt-2 text-[10px] opacity-60" style={{ borderColor: currentPalette.cardBorder }}>
              <span>Source: {video.channel}</span>
              <span>Slide {currentPage} / {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Bottom Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/90 px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Slide</span>
            </button>

            <span className="font-mono text-xs text-slate-300 px-3">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <span>Next Slide</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Use Left/Right arrows to flip pages
          </span>
        </div>
      </div>
    </div>
  );
};
