import { TranscriptSegment } from '../../src/types';

export interface TranscriptChunk {
  chunkIndex: number;
  totalChunks: number;
  startTime: number;
  endTime: number;
  startTimeFormatted: string;
  endTimeFormatted: string;
  text: string;
  segmentCount: number;
  keyTopicsEstimate?: string[];
}

export function chunkTranscript(
  segments: TranscriptSegment[],
  targetDurationSeconds: number = 600, // 10 minutes per chunk default
  maxCharactersPerChunk: number = 8000
): TranscriptChunk[] {
  if (!segments || segments.length === 0) return [];

  const chunks: TranscriptChunk[] = [];
  let currentChunkSegments: TranscriptSegment[] = [];
  let currentTextLength = 0;
  let chunkStart = segments[0].startTime;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const isDurationExceeded = seg.endTime - chunkStart >= targetDurationSeconds;
    const isCharLimitExceeded = currentTextLength + seg.text.length >= maxCharactersPerChunk;

    // Check sentence boundary (ends with . ! ?)
    const isSentenceBoundary = /[.!?]$/.test(seg.text.trim());

    currentChunkSegments.push(seg);
    currentTextLength += seg.text.length;

    const shouldBreak = (isDurationExceeded || isCharLimitExceeded) && (isSentenceBoundary || currentChunkSegments.length >= 8);

    if (shouldBreak || i === segments.length - 1) {
      const startSeg = currentChunkSegments[0];
      const endSeg = currentChunkSegments[currentChunkSegments.length - 1];
      const chunkText = currentChunkSegments.map((s) => s.text).join(' ');

      chunks.push({
        chunkIndex: chunks.length + 1,
        totalChunks: 0, // set below
        startTime: startSeg.startTime,
        endTime: endSeg.endTime,
        startTimeFormatted: startSeg.startTimeFormatted,
        endTimeFormatted: endSeg.startTimeFormatted || '00:00',
        text: chunkText,
        segmentCount: currentChunkSegments.length,
      });

      currentChunkSegments = [];
      currentTextLength = 0;
      if (i + 1 < segments.length) {
        chunkStart = segments[i + 1].startTime;
      }
    }
  }

  // Update totalChunks
  for (const c of chunks) {
    c.totalChunks = chunks.length;
  }

  return chunks;
}
