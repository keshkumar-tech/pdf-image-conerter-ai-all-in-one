import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Merge, ArrowLeft } from 'lucide-react';
import { ToolPageLayout } from '../ToolPageLayout';

export function MergePDFPage() {
  const navigate = useNavigate();

  const handleMerge = async (files: File[]): Promise<Blob | null> => {
    if (files.length < 2) {
      throw new Error('Please select at least 2 PDF files to merge');
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const res = await fetch('/api/tools/merge-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Merge failed');
    }

    return res.blob();
  };

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 text-sm text-[var(--cf-text-secondary)] hover:text-[var(--cf-text-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tools
      </button>

      <ToolPageLayout
        title="Merge PDF"
        description="Combine multiple PDF files into a single document"
        acceptedTypes={['application/pdf']}
        maxFiles={10}
        icon={<Merge className="h-6 w-6" />}
        accentColor="from-blue-500 to-blue-600"
        onProcess={handleMerge}
        processButtonText="Merge PDFs"
      />
    </div>
  );
}
