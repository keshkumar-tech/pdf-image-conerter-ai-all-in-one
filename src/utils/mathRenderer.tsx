import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  latex: string;
  block?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ latex, block = false, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!latex) return '';
    try {
      // Clean leading and trailing delimiters if present
      let clean = latex.trim();
      if (clean.startsWith('$$') && clean.endsWith('$$')) {
        clean = clean.slice(2, -2);
      } else if (clean.startsWith('$') && clean.endsWith('$')) {
        clean = clean.slice(1, -1);
      } else if (clean.startsWith('\\[') && clean.endsWith('\\]')) {
        clean = clean.slice(2, -2);
      }
      return katex.renderToString(clean, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      console.warn('KaTeX render error:', err);
      return `<span class="font-mono text-emerald-700 dark:text-emerald-300">${latex}</span>`;
    }
  }, [latex, block]);

  if (!renderedHtml) return null;

  return (
    <span
      className={`inline-math-container ${block ? 'block my-2 overflow-x-auto py-1' : 'inline-block'} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
