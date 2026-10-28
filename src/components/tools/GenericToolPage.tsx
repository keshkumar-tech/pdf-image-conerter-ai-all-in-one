import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ToolPageLayout } from '../ToolPageLayout';

interface ToolConfig {
  title: string;
  description: string;
  acceptedTypes: string[];
  maxFiles: number;
  icon: React.ReactNode;
  accentColor: string;
  processButtonText: string;
  apiEndpoint: string;
  resultFilename: string;
  options?: {
    key: string;
    label: string;
    type: 'number' | 'text' | 'select';
    defaultValue?: string | number;
    options?: { label: string; value: string }[];
    min?: number;
    max?: number;
  }[];
}

const toolConfigs: Record<string, ToolConfig> = {
  'merge-pdf': {
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document',
    acceptedTypes: ['application/pdf'],
    maxFiles: 10,
    icon: <span className="text-lg">🔗</span>,
    accentColor: 'from-blue-500 to-blue-600',
    processButtonText: 'Merge PDFs',
    apiEndpoint: '/api/tools/merge-pdf',
    resultFilename: 'merged.pdf',
  },
  'split-pdf': {
    title: 'Split PDF',
    description: 'Separate pages into independent PDF files',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">✂️</span>,
    accentColor: 'from-indigo-500 to-indigo-600',
    processButtonText: 'Split PDF',
    apiEndpoint: '/api/tools/split-pdf',
    resultFilename: 'split-pages.zip',
    options: [
      { key: 'range', label: 'Page range (e.g., 1-3,5)', type: 'text', defaultValue: 'all' },
    ],
  },
  'remove-pages': {
    title: 'Remove Pages',
    description: 'Delete unwanted pages from your PDF',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">🗑️</span>,
    accentColor: 'from-purple-500 to-purple-600',
    processButtonText: 'Remove Pages',
    apiEndpoint: '/api/tools/remove-pages',
    resultFilename: 'removed-pages.pdf',
    options: [
      { key: 'pages', label: 'Pages to remove (e.g., 1,2,3)', type: 'text', defaultValue: '' },
    ],
  },
  'organize-pdf': {
    title: 'Organize PDF',
    description: 'Sort, add, or reorder PDF pages',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">📑</span>,
    accentColor: 'from-violet-500 to-violet-600',
    processButtonText: 'Organize',
    apiEndpoint: '/api/tools/organize-pdf',
    resultFilename: 'organized.pdf',
    options: [
      { key: 'order', label: 'New page order (e.g., 2,1,3)', type: 'text', defaultValue: '' },
    ],
  },
  'scan-to-pdf': {
    title: 'Scan to PDF',
    description: 'Capture document scans from mobile',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 20,
    icon: <span className="text-lg">📷</span>,
    accentColor: 'from-cyan-500 to-cyan-600',
    processButtonText: 'Scan to PDF',
    apiEndpoint: '/api/tools/scan-to-pdf',
    resultFilename: 'scanned.pdf',
  },
  'compress-pdf': {
    title: 'Compress PDF',
    description: 'Reduce file size while preserving quality',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">📦</span>,
    accentColor: 'from-emerald-500 to-emerald-600',
    processButtonText: 'Compress PDF',
    apiEndpoint: '/api/tools/compress-pdf',
    resultFilename: 'compressed.pdf',
  },
  'repair-pdf': {
    title: 'Repair PDF',
    description: 'Fix damaged or corrupt PDF files',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">🔧</span>,
    accentColor: 'from-teal-500 to-teal-600',
    processButtonText: 'Repair PDF',
    apiEndpoint: '/api/tools/repair-pdf',
    resultFilename: 'repaired.pdf',
  },
  'ocr-pdf': {
    title: 'OCR PDF',
    description: 'Convert scanned PDF to searchable text',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">🔍</span>,
    accentColor: 'from-green-500 to-green-600',
    processButtonText: 'OCR PDF',
    apiEndpoint: '/api/tools/ocr-pdf',
    resultFilename: 'ocr.pdf',
  },
  'jpg-to-pdf': {
    title: 'JPG to PDF',
    description: 'Convert images to PDF documents',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 20,
    icon: <span className="text-lg">🖼️</span>,
    accentColor: 'from-pink-500 to-pink-600',
    processButtonText: 'Convert to PDF',
    apiEndpoint: '/api/tools/jpg-to-pdf',
    resultFilename: 'converted.pdf',
  },
  'word-to-pdf': {
    title: 'Word to PDF',
    description: 'Convert DOC/DOCX files to PDF',
    acceptedTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFiles: 1,
    icon: <span className="text-lg">📝</span>,
    accentColor: 'from-blue-600 to-blue-700',
    processButtonText: 'Convert to PDF',
    apiEndpoint: '/api/tools/word-to-pdf',
    resultFilename: 'converted.pdf',
  },
  'powerpoint-to-pdf': {
    title: 'PowerPoint to PDF',
    description: 'Convert PPT/PPTX slideshows to PDF',
    acceptedTypes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    maxFiles: 1,
    icon: <span className="text-lg">📊</span>,
    accentColor: 'from-orange-500 to-orange-600',
    processButtonText: 'Convert to PDF',
    apiEndpoint: '/api/tools/powerpoint-to-pdf',
    resultFilename: 'converted.pdf',
  },
  'excel-to-pdf': {
    title: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF',
    acceptedTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    maxFiles: 1,
    icon: <span className="text-lg">📈</span>,
    accentColor: 'from-green-600 to-green-700',
    processButtonText: 'Convert to PDF',
    apiEndpoint: '/api/tools/excel-to-pdf',
    resultFilename: 'converted.pdf',
  },
  'html-to-pdf': {
    title: 'HTML to PDF',
    description: 'Convert webpages to PDF documents',
    acceptedTypes: ['text/html', 'application/xhtml+xml'],
    maxFiles: 1,
    icon: <span className="text-lg">🌐</span>,
    accentColor: 'from-gray-600 to-gray-700',
    processButtonText: 'Convert to PDF',
    apiEndpoint: '/api/tools/html-to-pdf',
    resultFilename: 'converted.pdf',
  },
  'pdf-to-jpg': {
    title: 'PDF to JPG',
    description: 'Convert PDF pages to JPG images',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">📄</span>,
    accentColor: 'from-rose-500 to-rose-600',
    processButtonText: 'Convert to JPG',
    apiEndpoint: '/api/tools/pdf-to-jpg',
    resultFilename: 'pdf-images.zip',
  },
  'pdf-to-word': {
    title: 'PDF to Word',
    description: 'Convert PDF to editable DOC/DOCX',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">📃</span>,
    accentColor: 'from-blue-500 to-indigo-600',
    processButtonText: 'Convert to Word',
    apiEndpoint: '/api/tools/pdf-to-word',
    resultFilename: 'converted.html',
  },
  'pdf-to-powerpoint': {
    title: 'PDF to PowerPoint',
    description: 'Convert PDF to editable PPT/PPTX',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">📽️</span>,
    accentColor: 'from-red-500 to-red-600',
    processButtonText: 'Convert to PowerPoint',
    apiEndpoint: '/api/tools/pdf-to-powerpoint',
    resultFilename: 'converted.html',
  },
  'pdf-to-excel': {
    title: 'PDF to Excel',
    description: 'Extract data from PDF to Excel',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">📊</span>,
    accentColor: 'from-lime-500 to-lime-600',
    processButtonText: 'Convert to Excel',
    apiEndpoint: '/api/tools/pdf-to-excel',
    resultFilename: 'converted.xlsx',
  },
  'pdf-to-pdfa': {
    title: 'PDF to PDF/A',
    description: 'Convert to ISO-standard PDF/A',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">📁</span>,
    accentColor: 'from-slate-500 to-slate-600',
    processButtonText: 'Convert to PDF/A',
    apiEndpoint: '/api/tools/pdf-to-pdfa',
    resultFilename: 'pdfa.pdf',
  },
  'rotate-pdf': {
    title: 'Rotate PDF',
    description: 'Rotate PDF pages to correct orientation',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">🔄</span>,
    accentColor: 'from-amber-500 to-amber-600',
    processButtonText: 'Rotate PDF',
    apiEndpoint: '/api/tools/rotate-pdf',
    resultFilename: 'rotated.pdf',
    options: [
      { key: 'rotation', label: 'Rotation (degrees)', type: 'number', defaultValue: 90, min: 0, max: 360 },
    ],
  },
  'add-page-numbers': {
    title: 'Add Page Numbers',
    description: 'Add page numbers to your PDF',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">🔢</span>,
    accentColor: 'from-yellow-500 to-yellow-600',
    processButtonText: 'Add Page Numbers',
    apiEndpoint: '/api/tools/add-page-numbers',
    resultFilename: 'page-numbers.pdf',
  },
  'add-watermark': {
    title: 'Add Watermark',
    description: 'Stamp text or image over your PDF',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">💧</span>,
    accentColor: 'from-orange-600 to-orange-700',
    processButtonText: 'Add Watermark',
    apiEndpoint: '/api/tools/add-watermark',
    resultFilename: 'watermarked.pdf',
    options: [
      { key: 'text', label: 'Watermark text', type: 'text', defaultValue: 'WATERMARK' },
    ],
  },
  'crop-pdf': {
    title: 'Crop PDF',
    description: 'Crop margins of PDF documents',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">✂️</span>,
    accentColor: 'from-teal-600 to-teal-700',
    processButtonText: 'Crop PDF',
    apiEndpoint: '/api/tools/crop-pdf',
    resultFilename: 'cropped.pdf',
  },
  'edit-pdf': {
    title: 'Edit PDF',
    description: 'Add text, images, shapes, annotations',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">✏️</span>,
    accentColor: 'from-indigo-600 to-indigo-700',
    processButtonText: 'Edit PDF',
    apiEndpoint: '/api/tools/edit-pdf',
    resultFilename: 'edited.pdf',
  },
  'pdf-forms': {
    title: 'PDF Forms',
    description: 'Create and fill interactive PDF forms',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">📋</span>,
    accentColor: 'from-purple-600 to-purple-700',
    processButtonText: 'Process Forms',
    apiEndpoint: '/api/tools/pdf-forms',
    resultFilename: 'forms.pdf',
  },
  'unlock-pdf': {
    title: 'Unlock PDF',
    description: 'Remove password protection from PDF',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">🔓</span>,
    accentColor: 'from-emerald-600 to-emerald-700',
    processButtonText: 'Unlock PDF',
    apiEndpoint: '/api/tools/unlock-pdf',
    resultFilename: 'unlocked.pdf',
  },
  'protect-pdf': {
    title: 'Protect PDF',
    description: 'Encrypt PDF with password',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">🔒</span>,
    accentColor: 'from-red-600 to-red-700',
    processButtonText: 'Protect PDF',
    apiEndpoint: '/api/tools/protect-pdf',
    resultFilename: 'protected.pdf',
  },
  'sign-pdf': {
    title: 'Sign PDF',
    description: 'Add electronic signatures to PDF',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">✍️</span>,
    accentColor: 'from-blue-700 to-blue-800',
    processButtonText: 'Sign PDF',
    apiEndpoint: '/api/tools/sign-pdf',
    resultFilename: 'signed.pdf',
  },
  'redact-pdf': {
    title: 'Redact PDF',
    description: 'Permanently remove sensitive information',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">🛡️</span>,
    accentColor: 'from-gray-700 to-gray-800',
    processButtonText: 'Redact PDF',
    apiEndpoint: '/api/tools/redact-pdf',
    resultFilename: 'redacted.pdf',
  },
  'compare-pdf': {
    title: 'Compare PDF',
    description: 'Side-by-side document comparison',
    acceptedTypes: ['application/pdf'],
    maxFiles: 2,
    icon: <span className="text-lg">🔍</span>,
    accentColor: 'from-slate-600 to-slate-700',
    processButtonText: 'Compare PDFs',
    apiEndpoint: '/api/tools/compare-pdf',
    resultFilename: 'comparison.pdf',
  },
  'ai-summarizer': {
    title: 'AI Summarizer',
    description: 'Generate concise summaries from PDF',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">✨</span>,
    accentColor: 'from-violet-600 to-purple-700',
    processButtonText: 'Summarize',
    apiEndpoint: '/api/tools/ai-summarizer',
    resultFilename: 'summary.txt',
  },
  'translate-pdf': {
    title: 'Translate PDF',
    description: 'Translate PDF files with AI',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">🌍</span>,
    accentColor: 'from-indigo-600 to-purple-600',
    processButtonText: 'Translate',
    apiEndpoint: '/api/tools/translate-pdf',
    resultFilename: 'translated.pdf',
    options: [
      { key: 'language', label: 'Target language', type: 'select', defaultValue: 'en', options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
        { label: 'Hindi', value: 'hi' },
      ]},
    ],
  },
  'pdf-to-markdown': {
    title: 'PDF to Markdown',
    description: 'Convert PDF to Markdown format',
    acceptedTypes: ['application/pdf'],
    maxFiles: 1,
    icon: <span className="text-lg">📝</span>,
    accentColor: 'from-cyan-600 to-blue-600',
    processButtonText: 'Convert to Markdown',
    apiEndpoint: '/api/tools/pdf-to-markdown',
    resultFilename: 'converted.md',
  },
};

export function GenericToolPage({ toolId }: { toolId: string }) {
  const navigate = useNavigate();
  const config = toolConfigs[toolId];

  if (!config) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--cf-text-primary)]">Tool not found</h1>
      </div>
    );
  }

  const handleProcess = async (files: File[], options?: Record<string, any>): Promise<Blob | null> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }

    const res = await fetch(config.apiEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Processing failed' }));
      if (res.status === 501) {
        throw new Error(err.error || 'This tool is not yet fully implemented');
      }
      throw new Error(err.error || 'Processing failed');
    }

    if (res.status === 501) {
      const err = await res.json();
      throw new Error(err.error || 'This tool is not yet fully implemented');
    }

    return res.blob();
  };

  return (
    <div>
      <ToolPageLayout
        title={config.title}
        description={config.description}
        acceptedTypes={config.acceptedTypes}
        maxFiles={config.maxFiles}
        icon={config.icon}
        accentColor={config.accentColor}
        onProcess={handleProcess}
        processButtonText={config.processButtonText}
        resultFilename={config.resultFilename}
        options={config.options}
        backPath="/"
      />
    </div>
  );
}

export default GenericToolPage;
