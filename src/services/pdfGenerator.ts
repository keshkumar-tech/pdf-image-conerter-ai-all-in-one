import jsPDF from 'jspdf';
import { NoteDocument, VideoMetadata, PDFTheme } from '../types';

export interface PDFExportOptions {
  orientation: 'landscape' | 'portrait';
  theme: PDFTheme;
  includeCover: boolean;
  includeTOC: boolean;
  includeFormulas: boolean;
  includeExamples: boolean;
  includeQuestions: boolean;
  includeQuickRevision: boolean;
}

export const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  orientation: 'landscape',
  theme: 'modern',
  includeCover: true,
  includeTOC: true,
  includeFormulas: true,
  includeExamples: true,
  includeQuestions: true,
  includeQuickRevision: true,
};

// Theme color schemes
export const THEME_PALETTES: Record<
  PDFTheme,
  {
    bg: string;
    cardBg: string;
    cardBorder: string;
    primary: string;
    secondary: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    tagBg: string;
  }
> = {
  academic: {
    bg: '#0F172A', // Navy slate
    cardBg: '#1E293B',
    cardBorder: '#334155',
    primary: '#38BDF8', // Sky
    secondary: '#818CF8',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#0284C7',
    tagBg: '#0369A1',
  },
  modern: {
    bg: '#090D16', // Deep Obsidian
    cardBg: '#131B2E',
    cardBorder: '#233152',
    primary: '#60A5FA', // Electric Blue
    secondary: '#A78BFA', // Purple
    textPrimary: '#F1F5F9',
    textSecondary: '#A0AEC0',
    accent: '#2563EB',
    tagBg: '#1E3A8A',
  },
  minimal: {
    bg: '#F8FAFC', // Crisp white
    cardBg: '#FFFFFF',
    cardBorder: '#E2E8F0',
    primary: '#0F172A',
    secondary: '#475569',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    accent: '#2563EB',
    tagBg: '#EFF6FF',
  },
  dark: {
    bg: '#0A0A0A',
    cardBg: '#171717',
    cardBorder: '#262626',
    primary: '#38BDF8',
    secondary: '#A855F7',
    textPrimary: '#EDEDED',
    textSecondary: '#A1A1AA',
    accent: '#06B6D4',
    tagBg: '#1E293B',
  },
  notebook: {
    bg: '#FAF8F5', // Warm paper
    cardBg: '#FFFFFF',
    cardBorder: '#E7DFD5',
    primary: '#78350F', // Warm amber
    secondary: '#92400E',
    textPrimary: '#292524',
    textSecondary: '#78716C',
    accent: '#B45309',
    tagBg: '#FEF3C7',
  },
  professional: {
    bg: '#0C1322',
    cardBg: '#162238',
    cardBorder: '#293C60',
    primary: '#34D399', // Emerald
    secondary: '#60A5FA',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#059669',
    tagBg: '#064E3B',
  },
  exam: {
    bg: '#18181B',
    cardBg: '#27272A',
    cardBorder: '#3F3F46',
    primary: '#F59E0B', // Amber exam warning
    secondary: '#EC4899',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    accent: '#D97706',
    tagBg: '#78350F',
  },
};

export async function generatePDFDocument(
  notes: NoteDocument,
  video: VideoMetadata,
  options: PDFExportOptions = DEFAULT_PDF_OPTIONS
): Promise<jsPDF> {
  const isLandscape = options.orientation === 'landscape';
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'pt',
    format: isLandscape ? [960, 540] : 'a4', // 16:9 presentation ratio
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const theme = THEME_PALETTES[options.theme] || THEME_PALETTES.modern;

  // Helper: Draw Slide Background
  const drawSlideBackground = (title?: string, slideNum?: number, totalSlides?: number) => {
    // Fill background
    doc.setFillColor(theme.bg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Subtle header bar
    doc.setFillColor(theme.cardBg);
    doc.rect(32, 24, pageWidth - 64, 48, 'F');
    doc.setDrawColor(theme.cardBorder);
    doc.roundedRect(32, 24, pageWidth - 64, 48, 6, 6, 'S');

    // Brand and title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(theme.primary);
    doc.text('NoteFlow AI', 48, 52);

    if (title) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(theme.textSecondary);
      const truncatedTitle = doc.splitTextToSize(title, pageWidth - 260)[0];
      doc.text(`—  ${truncatedTitle}`, 130, 52);
    }

    // Page Number
    if (slideNum && totalSlides) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(theme.textSecondary);
      doc.text(`Page ${slideNum} of ${totalSlides}`, pageWidth - 110, 52);
    }

    // Bottom subtle footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(theme.textSecondary);
    doc.text(`Source: ${video.channel} • Timestamped Study Document`, 48, pageHeight - 18);
    doc.text('Grounded in verified source transcript', pageWidth - 230, pageHeight - 18);
  };

  // 1. COVER SLIDE
  drawSlideBackground();

  // Cover Card Container
  doc.setFillColor(theme.cardBg);
  doc.roundedRect(60, 95, pageWidth - 120, pageHeight - 140, 12, 12, 'F');
  doc.setDrawColor(theme.cardBorder);
  doc.roundedRect(60, 95, pageWidth - 120, pageHeight - 140, 12, 12, 'S');

  // Decorative Accent Pill
  doc.setFillColor(theme.tagBg);
  doc.roundedRect(88, 125, 150, 26, 13, 13, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(theme.primary);
  doc.text('COMPLETE STUDY NOTES', 98, 142);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(theme.textPrimary);
  const titleLines = doc.splitTextToSize(notes.title, pageWidth - 200);
  doc.text(titleLines.slice(0, 3), 88, 185);

  // Metadata Grid
  const metaY = 270;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(theme.textSecondary);
  doc.text(`Channel: ${video.channel}`, 88, metaY);
  doc.text(`Duration: ${video.durationFormatted}`, 88, metaY + 24);
  doc.text(`Total Topics: ${notes.sections.length} Core Chapters`, 88, metaY + 48);
  doc.text(`Source: ${video.url}`, 88, metaY + 72);

  // Executive Overview Box
  doc.setFillColor(theme.bg);
  doc.roundedRect(88, 370, pageWidth - 176, 85, 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(theme.primary);
  doc.text('EXECUTIVE OVERVIEW', 104, 392);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(theme.textSecondary);
  const overviewLines = doc.splitTextToSize(notes.executiveOverview, pageWidth - 210);
  doc.text(overviewLines.slice(0, 3), 104, 412);

  let slideIndex = 1;
  const estimatedTotalSlides = 2 + notes.sections.length + (notes.quickRevisionPoints.length > 0 ? 1 : 0) + (notes.glossary.length > 0 ? 1 : 0);

  // 2. TABLE OF CONTENTS SLIDE
  doc.addPage();
  slideIndex++;
  drawSlideBackground('Table of Contents', slideIndex, estimatedTotalSlides);

  doc.setFillColor(theme.cardBg);
  doc.roundedRect(60, 95, pageWidth - 120, pageHeight - 140, 12, 12, 'F');
  doc.setDrawColor(theme.cardBorder);
  doc.roundedRect(60, 95, pageWidth - 120, pageHeight - 140, 12, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(theme.textPrimary);
  doc.text('Lecture Syllabus & Chapter Breakdown', 88, 130);

  // Render 2-column TOC
  const colWidth = (pageWidth - 220) / 2;
  const maxPerCol = 7;

  notes.sections.forEach((sec, idx) => {
    const col = idx < maxPerCol ? 0 : 1;
    const row = idx % maxPerCol;
    if (idx >= maxPerCol * 2) return; // limit to fit nicely

    const x = 88 + col * (colWidth + 24);
    const y = 165 + row * 38;

    // Item card
    doc.setFillColor(theme.bg);
    doc.roundedRect(x, y, colWidth, 30, 4, 4, 'F');

    // Number tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(theme.primary);
    doc.text(`${sec.topicNumber.toString().padStart(2, '0')}`, x + 10, y + 19);

    // Title
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(theme.textPrimary);
    const secTitle = doc.splitTextToSize(sec.title, colWidth - 85)[0];
    doc.text(secTitle, x + 35, y + 19);

    // Timestamp
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(theme.secondary);
    doc.text(`[${sec.timestampFormatted}]`, x + colWidth - 50, y + 19);
  });

  // 3. TOPIC CHAPTER SLIDES
  for (let i = 0; i < notes.sections.length; i++) {
    const sec = notes.sections[i];
    doc.addPage();
    slideIndex++;
    drawSlideBackground(`Chapter ${sec.topicNumber}: ${sec.title}`, slideIndex, estimatedTotalSlides);

    // Left Column: Overview & Concepts
    const leftWidth = (pageWidth - 144) * 0.58;
    doc.setFillColor(theme.cardBg);
    doc.roundedRect(48, 90, leftWidth, pageHeight - 130, 10, 10, 'F');
    doc.setDrawColor(theme.cardBorder);
    doc.roundedRect(48, 90, leftWidth, pageHeight - 130, 10, 10, 'S');

    // Title & Timestamp
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(theme.textPrimary);
    const secHeader = `${sec.topicNumber.toString().padStart(2, '0')}. ${sec.title}`;
    doc.text(doc.splitTextToSize(secHeader, leftWidth - 40)[0], 68, 120);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(theme.primary);
    doc.text(`Source Timestamp: [${sec.timestampFormatted}]`, 68, 138);

    // Introduction
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(theme.textSecondary);
    const introLines = doc.splitTextToSize(sec.introduction, leftWidth - 40);
    doc.text(introLines.slice(0, 3), 68, 160);

    // Detailed explanation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(theme.textPrimary);
    const explLines = doc.splitTextToSize(sec.detailedExplanation, leftWidth - 40);
    doc.text(explLines.slice(0, 7), 68, 205);

    // Key Concepts list
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(theme.primary);
    doc.text('Key Concepts & Mechanics:', 68, 305);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(theme.textSecondary);
    let conceptY = 325;
    sec.keyConcepts.slice(0, 4).forEach((kc) => {
      const cLines = doc.splitTextToSize(`• ${kc}`, leftWidth - 48);
      doc.text(cLines.slice(0, 2), 68, conceptY);
      conceptY += cLines.length * 12 + 2;
    });

    // Right Column: Formulas / Code / Examples
    const rightX = 48 + leftWidth + 16;
    const rightWidth = pageWidth - 48 - rightX;

    doc.setFillColor(theme.cardBg);
    doc.roundedRect(rightX, 90, rightWidth, pageHeight - 130, 10, 10, 'F');
    doc.setDrawColor(theme.cardBorder);
    doc.roundedRect(rightX, 90, rightWidth, pageHeight - 130, 10, 10, 'S');

    let rightY = 115;

    // Formula or Code Card
    if (sec.formulas && sec.formulas.length > 0) {
      const f = sec.formulas[0];
      doc.setFillColor(theme.bg);
      doc.roundedRect(rightX + 16, rightY, rightWidth - 32, 90, 6, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(theme.primary);
      doc.text(`FORMULA: ${f.title}`, rightX + 26, rightY + 20);

      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(theme.textPrimary);
      doc.text(f.latex, rightX + 26, rightY + 45);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(theme.textSecondary);
      const fExpl = doc.splitTextToSize(f.explanation, rightWidth - 52);
      doc.text(fExpl.slice(0, 2), rightX + 26, rightY + 65);

      rightY += 105;
    } else if (sec.codeBlocks && sec.codeBlocks.length > 0) {
      const c = sec.codeBlocks[0];
      doc.setFillColor(theme.bg);
      doc.roundedRect(rightX + 16, rightY, rightWidth - 32, 110, 6, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(theme.primary);
      doc.text(`CODE [${c.language.toUpperCase()}]:`, rightX + 26, rightY + 18);

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(theme.textPrimary);
      const codeLines = c.code.split('\n').slice(0, 6);
      codeLines.forEach((line, lIdx) => {
        doc.text(line, rightX + 26, rightY + 34 + lIdx * 12);
      });

      rightY += 125;
    }

    // Worked Example Card
    if (sec.examples && sec.examples.length > 0) {
      const ex = sec.examples[0];
      doc.setFillColor(theme.bg);
      doc.roundedRect(rightX + 16, rightY, rightWidth - 32, 110, 6, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(theme.secondary);
      doc.text(`EXAMPLE: ${ex.title}`, rightX + 26, rightY + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(theme.textSecondary);
      doc.text(`Problem: ${doc.splitTextToSize(ex.problem, rightWidth - 52)[0]}`, rightX + 26, rightY + 36);
      doc.text(`Solution: ${doc.splitTextToSize(ex.solution, rightWidth - 52)[0]}`, rightX + 26, rightY + 54);

      const exExpl = doc.splitTextToSize(`Takeaway: ${ex.explanation}`, rightWidth - 52);
      doc.text(exExpl.slice(0, 2), rightX + 26, rightY + 72);

      rightY += 125;
    }

    // Common Mistake Callout
    if (sec.commonMistakes && sec.commonMistakes.length > 0 && rightY < pageHeight - 120) {
      const cm = sec.commonMistakes[0];
      doc.setFillColor(theme.bg);
      doc.roundedRect(rightX + 16, rightY, rightWidth - 32, 60, 6, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor('#EF4444'); // Red alert
      doc.text(`AVOID: ${cm.mistake}`, rightX + 26, rightY + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(theme.textSecondary);
      const corrLines = doc.splitTextToSize(`Fix: ${cm.correction}`, rightWidth - 52);
      doc.text(corrLines.slice(0, 2), rightX + 26, rightY + 34);
    }
  }

  // 4. QUICK REVISION SLIDE
  if (options.includeQuickRevision && notes.quickRevisionPoints.length > 0) {
    doc.addPage();
    slideIndex++;
    drawSlideBackground('Quick Revision Sheet (High-Yield Takeaways)', slideIndex, estimatedTotalSlides);

    doc.setFillColor(theme.cardBg);
    doc.roundedRect(60, 95, pageWidth - 120, pageHeight - 140, 12, 12, 'F');
    doc.setDrawColor(theme.cardBorder);
    doc.roundedRect(60, 95, pageWidth - 120, pageHeight - 140, 12, 12, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(theme.primary);
    doc.text('Key Revision Points & Examination Review', 88, 130);

    let revY = 160;
    notes.quickRevisionPoints.slice(0, 8).forEach((pt, pIdx) => {
      doc.setFillColor(theme.bg);
      doc.roundedRect(88, revY, pageWidth - 176, 32, 4, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(theme.primary);
      doc.text(`${(pIdx + 1).toString().padStart(2, '0')}`, 102, revY + 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(theme.textPrimary);
      const ptLines = doc.splitTextToSize(pt, pageWidth - 240);
      doc.text(ptLines[0], 130, revY + 20);

      revY += 40;
    });
  }

  // 5. GLOSSARY SLIDE
  if (notes.glossary && notes.glossary.length > 0) {
    doc.addPage();
    slideIndex++;
    drawSlideBackground('Glossary & Terminology Index', slideIndex, estimatedTotalSlides);

    doc.setFillColor(theme.cardBg);
    doc.roundedRect(60, 95, pageWidth - 120, pageHeight - 140, 12, 12, 'F');
    doc.setDrawColor(theme.cardBorder);
    doc.roundedRect(60, 95, pageWidth - 120, pageHeight - 140, 12, 12, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(theme.textPrimary);
    doc.text('Important Academic Terms & Definitions', 88, 130);

    let gloY = 160;
    notes.glossary.slice(0, 6).forEach((g) => {
      doc.setFillColor(theme.bg);
      doc.roundedRect(88, gloY, pageWidth - 176, 40, 4, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(theme.primary);
      doc.text(g.term, 104, gloY + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.textSecondary);
      const defLines = doc.splitTextToSize(g.definition, pageWidth - 220);
      doc.text(defLines.slice(0, 1), 104, gloY + 32);

      gloY += 48;
    });
  }

  return doc;
}

export function downloadNotesAsMarkdown(notes: NoteDocument, video: VideoMetadata) {
  let md = `# ${notes.title}\n\n`;
  md += `**Channel:** ${video.channel}  \n`;
  md += `**Duration:** ${video.durationFormatted}  \n`;
  md += `**Source:** ${video.url}  \n`;
  md += `**Generated By:** NoteFlow AI  \n\n`;
  md += `## Executive Overview\n\n${notes.executiveOverview}\n\n`;

  md += `## Table of Contents\n\n`;
  notes.sections.forEach((sec) => {
    md += `- [Chapter ${sec.topicNumber}: ${sec.title} [${sec.timestampFormatted}]](#chapter-${sec.topicNumber})\n`;
  });
  md += `\n---\n\n`;

  notes.sections.forEach((sec) => {
    md += `### Chapter ${sec.topicNumber}: ${sec.title} [${sec.timestampFormatted}]\n\n`;
    md += `*${sec.introduction}*\n\n`;
    md += `${sec.detailedExplanation}\n\n`;

    if (sec.keyConcepts.length > 0) {
      md += `**Key Concepts:**\n`;
      sec.keyConcepts.forEach((c) => (md += `- ${c}\n`));
      md += `\n`;
    }

    if (sec.formulas && sec.formulas.length > 0) {
      md += `**Formulas:**\n`;
      sec.formulas.forEach((f) => {
        md += `#### ${f.title}\n$$\n${f.latex}\n$$\n*${f.explanation}*\n\n`;
      });
    }

    if (sec.codeBlocks && sec.codeBlocks.length > 0) {
      md += `**Code Demonstration:**\n`;
      sec.codeBlocks.forEach((c) => {
        md += `\`\`\`${c.language}\n${c.code}\n\`\`\`\n*${c.explanation}*\n\n`;
      });
    }

    if (sec.examples && sec.examples.length > 0) {
      md += `**Worked Examples:**\n`;
      sec.examples.forEach((ex) => {
        md += `**${ex.title}**  \nProblem: ${ex.problem}  \nSolution: ${ex.solution}  \n*${ex.explanation}*\n\n`;
      });
    }
  });

  if (notes.quickRevisionPoints.length > 0) {
    md += `## Quick Revision\n\n`;
    notes.quickRevisionPoints.forEach((p, idx) => {
      md += `${idx + 1}. ${p}\n`;
    });
    md += `\n`;
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${notes.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Notes.md`;
  a.click();
  URL.revokeObjectURL(url);
}
