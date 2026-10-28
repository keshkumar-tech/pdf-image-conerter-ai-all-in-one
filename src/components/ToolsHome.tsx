import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Zap, Shield, Star, ArrowRight, X, Layers, Rocket } from 'lucide-react';

interface ToolCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  category: string;
  color: string;
  gradient: string;
  glow: string;
  emoji: string;
}

/* Vibrant multi-stop gradients — one per tool family so the grid reads as a rainbow */
const G = {
  rose: 'from-rose-500 via-pink-500 to-fuchsia-500',
  orange: 'from-amber-400 via-orange-500 to-red-500',
  lime: 'from-lime-400 via-green-500 to-emerald-500',
  cyan: 'from-cyan-400 via-sky-500 to-blue-600',
  violet: 'from-violet-500 via-purple-500 to-indigo-600',
  teal: 'from-teal-400 via-cyan-500 to-sky-500',
  yellow: 'from-yellow-300 via-amber-400 to-orange-500',
  blue: 'from-blue-400 via-indigo-500 to-violet-600',
  pink: 'from-pink-400 via-rose-500 to-red-500',
  slate: 'from-slate-500 via-slate-600 to-slate-800',
  green2: 'from-emerald-400 via-green-500 to-teal-500',
  fuchsia: 'from-fuchsia-500 via-purple-500 to-indigo-500',
  amber2: 'from-amber-300 via-yellow-400 to-lime-400',
};

const tools: ToolCard[] = [
  { title: 'Merge PDF', description: 'Combine PDFs in the order you want with the easiest PDF merger available.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>, path: '/tools/merge-pdf', category: 'Organize PDF', color: 'bg-[#ff6b6b]', gradient: G.rose, glow: 'shadow-rose-500/50', emoji: '🔗' },
  { title: 'Split PDF', description: 'Separate one page or a whole set for easy conversion into independent PDF files.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>, path: '/tools/split-pdf', category: 'Organize PDF', color: 'bg-[#ff6b6b]', gradient: G.orange, glow: 'shadow-orange-500/50', emoji: '✂️' },
  { title: 'Remove Pages', description: 'Delete unwanted pages from your PDF document.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>, path: '/tools/remove-pages', category: 'Organize PDF', color: 'bg-[#ff6b6b]', gradient: G.pink, glow: 'shadow-pink-500/50', emoji: '🗑️' },
  { title: 'Organize PDF', description: 'Sort, add, or reorder PDF pages easily.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>, path: '/tools/organize-pdf', category: 'Organize PDF', color: 'bg-[#ff6b6b]', gradient: G.violet, glow: 'shadow-violet-500/50', emoji: '📑' },
  { title: 'Scan to PDF', description: 'Capture document scans from mobile or camera.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, path: '/tools/scan-to-pdf', category: 'Organize PDF', color: 'bg-[#ff6b6b]', gradient: G.cyan, glow: 'shadow-cyan-500/50', emoji: '📷' },

  { title: 'Compress PDF', description: 'Reduce file size while optimizing for maximal PDF quality.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>, path: '/tools/compress-pdf', category: 'Optimize PDF', color: 'bg-[#51cf66]', gradient: G.lime, glow: 'shadow-lime-500/50', emoji: '📦' },
  { title: 'Repair PDF', description: 'Fix damaged or corrupt PDF files.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, path: '/tools/repair-pdf', category: 'Optimize PDF', color: 'bg-[#51cf66]', gradient: G.teal, glow: 'shadow-teal-500/50', emoji: '🔧' },
  { title: 'OCR PDF', description: 'Convert scanned PDF to searchable text.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, path: '/tools/ocr-pdf', category: 'Optimize PDF', color: 'bg-[#51cf66]', gradient: G.green2, glow: 'shadow-green-500/50', emoji: '🔍' },

  { title: 'PDF to Word', description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents. The converted WORD document is almost 100% accurate.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, path: '/tools/pdf-to-word', category: 'Convert to PDF', color: 'bg-[#339af0]', gradient: G.blue, glow: 'shadow-blue-500/50', emoji: '📃' },
  { title: 'PDF to PowerPoint', description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>, path: '/tools/pdf-to-powerpoint', category: 'Convert to PDF', color: 'bg-[#d9480f]', gradient: G.orange, glow: 'shadow-orange-500/50', emoji: '📽️' },
  { title: 'PDF to Excel', description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, path: '/tools/pdf-to-excel', category: 'Convert to PDF', color: 'bg-[#51cf66]', gradient: G.lime, glow: 'shadow-lime-500/50', emoji: '📊' },
  { title: 'PDF to JPG', description: 'Convert PDF pages to JPG images.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, path: '/tools/pdf-to-jpg', category: 'Convert to PDF', color: 'bg-[#f06595]', gradient: G.pink, glow: 'shadow-pink-500/50', emoji: '🖼️' },
  { title: 'PDF to PDF/A', description: 'Convert to ISO-standard PDF/A for archiving.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>, path: '/tools/pdf-to-pdfa', category: 'Convert to PDF', color: 'bg-[#868e96]', gradient: G.slate, glow: 'shadow-slate-500/50', emoji: '📁' },

  { title: 'Word to PDF', description: 'Make DOC and DOCX files easy to read by converting them to PDF.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, path: '/tools/word-to-pdf', category: 'Convert from PDF', color: 'bg-[#339af0]', gradient: G.blue, glow: 'shadow-blue-500/50', emoji: '📝' },
  { title: 'PowerPoint to PDF', description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>, path: '/tools/powerpoint-to-pdf', category: 'Convert from PDF', color: 'bg-[#d9480f]', gradient: G.orange, glow: 'shadow-orange-500/50', emoji: '📊' },
  { title: 'Excel to PDF', description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, path: '/tools/excel-to-pdf', category: 'Convert from PDF', color: 'bg-[#51cf66]', gradient: G.lime, glow: 'shadow-lime-500/50', emoji: '📈' },
  { title: 'JPG to PDF', description: 'Convert images to PDF documents.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, path: '/tools/jpg-to-pdf', category: 'Convert from PDF', color: 'bg-[#f06595]', gradient: G.fuchsia, glow: 'shadow-fuchsia-500/50', emoji: '🖼️' },
  { title: 'HTML to PDF', description: 'Convert webpages to PDF documents.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>, path: '/tools/html-to-pdf', category: 'Convert from PDF', color: 'bg-[#868e96]', gradient: G.slate, glow: 'shadow-slate-500/50', emoji: '🌐' },

  { title: 'Rotate PDF', description: 'Rotate PDF pages to correct orientation.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>, path: '/tools/rotate-pdf', category: 'Edit PDF', color: 'bg-[#f59f00]', gradient: G.amber2, glow: 'shadow-amber-500/50', emoji: '🔄' },
  { title: 'Add Page Numbers', description: 'Add page numbers to your PDF document.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>, path: '/tools/add-page-numbers', category: 'Edit PDF', color: 'bg-[#f59f00]', gradient: G.yellow, glow: 'shadow-yellow-500/50', emoji: '🔢' },
  { title: 'Add Watermark', description: 'Stamp text or image over your PDF document.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>, path: '/tools/add-watermark', category: 'Edit PDF', color: 'bg-[#f59f00]', gradient: G.orange, glow: 'shadow-orange-500/50', emoji: '💧' },
  { title: 'Crop PDF', description: 'Crop margins of PDF documents.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 0L7 7m2.879 2.879L12 12m-2.879 2.879L7 7m2.879 2.879L12 12m0 0l2.879 2.879M12 12l2.879-2.879m0 0L19 7m-2.879 2.879L12 12" /></svg>, path: '/tools/crop-pdf', category: 'Edit PDF', color: 'bg-[#20c997]', gradient: G.teal, glow: 'shadow-teal-500/50', emoji: '✂️' },
  { title: 'Edit PDF', description: 'Add text, images, shapes or freehand annotations to a PDF document. Edit the size, font, and color of the added content.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>, path: '/tools/edit-pdf', category: 'Edit PDF', color: 'bg-[#7950f2]', gradient: G.violet, glow: 'shadow-violet-500/50', emoji: '✏️' },
  { title: 'PDF Forms', description: 'Create and fill interactive PDF forms.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, path: '/tools/pdf-forms', category: 'Edit PDF', color: 'bg-[#7950f2]', gradient: G.fuchsia, glow: 'shadow-purple-500/50', emoji: '📋' },

  { title: 'Unlock PDF', description: 'Remove password protection from PDF.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>, path: '/tools/unlock-pdf', category: 'PDF Security', color: 'bg-[#20c997]', gradient: G.green2, glow: 'shadow-emerald-500/50', emoji: '🔓' },
  { title: 'Protect PDF', description: 'Encrypt PDF with password protection.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, path: '/tools/protect-pdf', category: 'PDF Security', color: 'bg-[#fa5252]', gradient: G.rose, glow: 'shadow-rose-500/50', emoji: '🔒' },
  { title: 'Sign PDF', description: 'Add electronic signatures to PDF.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>, path: '/tools/sign-pdf', category: 'PDF Security', color: 'bg-[#1c7ed6]', gradient: G.blue, glow: 'shadow-blue-500/50', emoji: '✍️' },
  { title: 'Redact PDF', description: 'Permanently remove sensitive information.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, path: '/tools/redact-pdf', category: 'PDF Security', color: 'bg-[#495057]', gradient: G.slate, glow: 'shadow-slate-500/50', emoji: '🛡️' },
  { title: 'Compare PDF', description: 'Side-by-side document comparison.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, path: '/tools/compare-pdf', category: 'PDF Security', color: 'bg-[#495057]', gradient: G.cyan, glow: 'shadow-cyan-500/50', emoji: '🔍' },

  { title: 'AI Summarizer', description: 'Generate concise summaries from PDF.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, path: '/tools/ai-summarizer', category: 'PDF Intelligence', color: 'bg-[#7950f2]', gradient: G.fuchsia, glow: 'shadow-purple-500/50', emoji: '✨' },
  { title: 'Translate PDF', description: 'Translate PDF files with AI.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.04 9.56l-1.08 5.44H20m-9-6h.01M5 19a2 2 0 104 0 2 2 0 00-4 0z" /></svg>, path: '/tools/translate-pdf', category: 'PDF Intelligence', color: 'bg-[#7950f2]', gradient: G.violet, glow: 'shadow-violet-500/50', emoji: '🌍' },
  { title: 'PDF to Markdown', description: 'Convert PDF to Markdown format.', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>, path: '/tools/pdf-to-markdown', category: 'PDF Intelligence', color: 'bg-[#22b8cf]', gradient: G.cyan, glow: 'shadow-cyan-500/50', emoji: '📝' },
];

const categories = ['All', 'Organize PDF', 'Optimize PDF', 'Convert to PDF', 'Convert from PDF', 'Edit PDF', 'PDF Security', 'PDF Intelligence'];

const marqueeWords = [
  { label: 'Merge PDF', emoji: '🔗', cls: 'from-rose-500 to-pink-600' },
  { label: 'Split PDF', emoji: '✂️', cls: 'from-orange-400 to-red-500' },
  { label: 'Compress PDF', emoji: '📦', cls: 'from-lime-400 to-green-600' },
  { label: 'PDF to Word', emoji: '📃', cls: 'from-sky-400 to-blue-600' },
  { label: 'OCR PDF', emoji: '🔍', cls: 'from-teal-400 to-emerald-600' },
  { label: 'Protect PDF', emoji: '🔒', cls: 'from-fuchsia-500 to-purple-600' },
  { label: 'AI Summarizer', emoji: '✨', cls: 'from-violet-500 to-indigo-600' },
  { label: 'JPG to PDF', emoji: '🖼️', cls: 'from-yellow-400 to-amber-600' },
];

const featureStats = [
  { icon: <Sparkles className="h-5 w-5" />, value: '30+', label: 'Smart PDF tools', from: '#ff2d95', to: '#ff9a3c' },
  { icon: <Zap className="h-5 w-5" />, value: '1-Click', label: 'Video to notes', from: '#22d3ee', to: '#6366f1' },
  { icon: <Shield className="h-5 w-5" />, value: '100%', label: 'Private & secure', from: '#22d3a6', to: '#a8e063' },
  { icon: <Star className="h-5 w-5" />, value: '4.9★', label: 'Loved by learners', from: '#a855f7', to: '#e879f9' },
];

export function ToolsHome() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  const filteredTools = useMemo(() => {
    const byCategory = activeCategory === 'All' ? tools : tools.filter(t => t.category === activeCategory);
    const q = query.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter(
      t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [activeCategory, query]);

  return (
    <div className="min-h-screen cf-vibe-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated multi-colour aurora blobs */}
        <div className="cf-blob cf-blob-slow left-[-10%] top-[-12%] h-[420px] w-[420px] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-400" />
        <div className="cf-blob cf-blob-reverse right-[-8%] top-[-6%] h-[380px] w-[380px] bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600" />
        <div className="cf-blob left-[35%] top-[45%] h-[320px] w-[320px] bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500" />
        <div className="cf-blob cf-blob-slow cf-blob-reverse bottom-[-18%] left-[12%] h-[360px] w-[360px] bg-gradient-to-br from-lime-300 via-emerald-400 to-teal-500" />
        <div className="cf-grid-overlay" />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          <div className="text-center">
            <div className="cf-pop-in inline-flex items-center gap-2 rounded-full border-white/60 bg-white/70 px-4 py-1.5 text-xs font-extrabold text-fuchsia-700 shadow-lg shadow-fuchsia-500/20 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-fuchsia-300">
              <span className="cf-hue">🌈</span>
              <span>Every PDF tool you need — now bursting with colour</span>
            </div>

            <h1 className="cf-pop-in mt-6 text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">
              <span className="cf-rainbow-text">Every tool you need</span>
              <br className="hidden sm:block" />
              <span className="text-[var(--cf-text-primary)]">to work with PDFs </span>
              <span className="relative inline-block">
                <span className="cf-rainbow-text">in one place</span>
                <span className="cf-rainbow-underline absolute -bottom-2 left-0 h-1.5 w-full rounded-full" />
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base text-[var(--cf-text-secondary)] sm:text-lg">
              Merge, split, compress, convert, rotate, unlock and watermark PDFs with a few clicks — and turn any YouTube lecture into complete study notes with AI.
            </p>

            {/* CTA row */}
            <div className="mt-8 flex-wrap items-center justify-center gap-3">
              <Link
                to="/tools/merge-pdf"
                className="cf-btn-rainbow cf-shimmer cf-pulse-ring group inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold"
              >
                <Rocket className="h-4 w-4" />
                Start with Merge PDF
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/youtube-notes"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--cf-border)] bg-white/80 px-6 py-3 text-sm font-extrabold text-[var(--cf-text-primary)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-fuchsia-400 hover:shadow-lg hover:shadow-fuchsia-500/20 dark:bg-white/5"
              >
                <Sparkles className="h-4 w-4 text-fuchsia-500" />
                Try AI Video Notes
              </Link>
            </div>

            {/* Animated stat tiles */}
            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
              {featureStats.map((s, i) => (
                <div
                  key={s.label}
                  className="cf-stat cf-pop-in"
                  style={{ '--stat-from': s.from, '--stat-to': s.to, animationDelay: `${i * 90}ms` } as React.CSSProperties}
                >
                  <div
                    className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-white"
                    style={{ backgroundImage: `linear-gradient(120deg, ${s.from}, ${s.to})` }}
                  >
                    {s.icon}
                  </div>
                  <div className="mt-2 text-xl font-black text-[var(--cf-text-primary)]">{s.value}</div>
                  <div className="text-[11px] font-semibold text-[var(--cf-text-muted)]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rainbow marquee ticker */}
        <div className="cf-rainbow-divider" />
        <div className="cf-marquee-mask border-y border-[var(--cf-border)] bg-white/60 py-3 backdrop-blur dark:bg-white/5">
          <div className="cf-marquee gap-3">
            {[...marqueeWords, ...marqueeWords].map((w, i) => (
              <span
                key={`${w.label}-${i}`}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r ${w.cls} px-4 py-1.5 text-xs font-extrabold text-white shadow-md`}
              >
                <span>{w.emoji}</span>
                {w.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ================= SEARCH + CATEGORY FILTERS ================= */}
      <div className="sticky top-16 z-40 border-b border-[var(--cf-border)] bg-white/80 backdrop-blur-xl dark:bg-[#0b1020]/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="cf-gradient-ring relative flex w-full items-center rounded-2xl lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--cf-text-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 30+ PDF tools..."
                className="w-full rounded-2xl border-[var(--cf-border)] bg-[var(--cf-surface)] py-2.5 pl-9 pr-9 text-sm font-medium text-[var(--cf-text-primary)] outline-none transition-all focus:border-fuchsia-400 focus:bg-[var(--cf-bg-elevated)] focus:ring-4 focus:ring-fuchsia-500/10"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 rounded-lg p-1 text-[var(--cf-text-muted)] transition-colors hover:text-rose-500"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((category) => {
                const active = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-300 ${
                      active
                        ? 'cf-btn-rainbow scale-105'
                        : 'border border-[var(--cf-border)] bg-[var(--cf-surface)] text-[var(--cf-text-secondary)] hover:-translate-y-0.5 hover:border-fuchsia-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-300'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= TOOL GRID ================= */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--cf-text-primary)]">
            <Layers className="h-4 w-4 text-fuchsia-500" />
            {activeCategory === 'All' ? 'All tools' : activeCategory}
            <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-2 py-0.5 text-[10px] font-black text-white">
              {filteredTools.length}
            </span>
          </div>
          <span className="hidden text-xs font-semibold text-[var(--cf-text-muted)] sm:block">
            Hover a card for a colourful glow ✨
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {filteredTools.map((tool, i) => (
            <Link
              key={tool.path}
              to={tool.path}
              style={{ animationDelay: `${Math.min(i, 12) * 55}ms` } as React.CSSProperties}
              className="cf-lift cf-gradient-ring cf-shimmer cf-pop-in group flex-col rounded-2xl border-[var(--cf-border)] bg-white/85 p-5 backdrop-blur-sm dark:bg-white/[0.04]"
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}
                >
                  {tool.icon}
                </div>
                <span className="text-2xl opacity-70 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100">
                  {tool.emoji}
                </span>
              </div>

              <h3 className="mb-1 text-base font-black text-[var(--cf-text-primary)]">
                <span className={`bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent`}>{tool.title}</span>
              </h3>
              <p className="line-clamp-3 text-xs leading-relaxed text-[var(--cf-text-secondary)]">
                {tool.description}
              </p>

              <div className="mt-4 flex -translate-x-1 items-center gap-1 text-[11px] font-extrabold text-fuchsia-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:text-fuchsia-300">
                Open tool <ArrowRight className="h-3 w-3" />
              </div>

              {/* bottom rainbow accent bar */}
              <div className={`mt-3 h-1 w-10 rounded-full bg-gradient-to-r ${tool.gradient} transition-all duration-500 group-hover:w-full`} />
            </Link>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="mt-16 text-center">
            <div className="cf-float mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-2xl text-white shadow-lg">
              🔍
            </div>
            <p className="mt-4 text-base font-black text-[var(--cf-text-primary)]">No tools matched “{query}”</p>
            <button
              onClick={() => { setQuery(''); setActiveCategory('All'); }}
              className="cf-btn-rainbow mt-4 rounded-xl px-5 py-2.5 text-xs font-extrabold"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToolsHome;
