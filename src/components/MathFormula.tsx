import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  latex: string;
  block?: boolean;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ latex, block = false }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex || '', {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      return latex || '';
    }
  }, [latex, block]);

  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      className={block ? 'katex-block block my-1 overflow-x-auto py-1' : 'katex-inline inline'}
    />
  );
};
