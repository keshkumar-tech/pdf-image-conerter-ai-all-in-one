export type NoteDepth = 'quick' | 'standard' | 'complete' | 'ultra';

export type NoteLanguage = 'auto' | 'en' | 'hi' | 'hinglish';

export type PDFTheme = 'academic' | 'modern' | 'minimal' | 'dark' | 'notebook' | 'professional' | 'exam';

export type JobStatus = 'queued' | 'analyzing' | 'preparing' | 'transcribing' | 'chunking' | 'summarizing' | 'synthesizing' | 'verifying' | 'generating_pdf' | 'completed' | 'failed';

export interface SourceStatus {
  metadataFound: boolean;
  transcriptFound: boolean;
  transcriptUnavailable: boolean;
  processingSource: boolean;
  notesGenerated: boolean;
  message?: string;
  sourceType: 'youtube_captions' | 'user_upload' | 'user_pasted' | 'demo_lecture' | 'ai_synthesized';
}

export interface VideoMetadata {
  id: string;
  url: string;
  videoId: string;
  title: string;
  channel: string;
  duration: number; // in seconds
  durationFormatted: string;
  thumbnail: string;
  description?: string;
  publishDate?: string;
  category?: string;
}

export interface TranscriptSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number;
  startTimeFormatted: string; // e.g. "03:45"
  text: string;
  topic?: string;
  chunkId?: string;
}

export interface FormulaBlock {
  id: string;
  title: string;
  latex: string;
  explanation: string;
  variables?: { name: string; description: string }[];
  timestamp?: string;
  timestampSeconds?: number;
}

export interface ExampleBlock {
  id: string;
  title: string;
  problem: string;
  given?: string;
  formula?: string;
  calculation?: string;
  solution: string;
  explanation: string;
  timestamp?: string;
  timestampSeconds?: number;
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  explanation: string;
  isReconstructed?: boolean;
  timestamp?: string;
}

export interface NoteSection {
  id: string;
  topicNumber: number;
  title: string;
  timestampFormatted: string;
  timestampSeconds: number;
  introduction: string;
  detailedExplanation: string;
  keyConcepts: string[];
  importantDefinitions: { term: string; definition: string }[];
  formulas?: FormulaBlock[];
  examples?: ExampleBlock[];
  codeBlocks?: CodeBlock[];
  stepByStepProcedures?: { step: number; title: string; description: string }[];
  commonMistakes?: { mistake: string; correction: string; why: string }[];
  importantNotes?: string[];
  visualAids?: {
    type: 'diagram' | 'chart' | 'flowchart' | 'whiteboard' | 'code' | 'equation';
    title: string;
    description: string;
    timestamp: string;
    isDetectedFromSource?: boolean;
  }[];
}

export interface NoteDocument {
  id: string;
  videoId: string;
  title: string;
  executiveOverview: string;
  depth: NoteDepth;
  language: NoteLanguage;
  pdfTheme: PDFTheme;
  totalTopics: number;
  sections: NoteSection[];
  quickRevisionPoints: string[];
  glossary: { term: string; definition: string; category?: string }[];
  importantQuestions: { question: string; answer: string; type: 'conceptual' | 'numerical' | 'exam' }[];
  finalTakeaways: string[];
  coverageStats: {
    totalChunks: number;
    processedChunks: number;
    coverageScore: number;
    coverageStatus: 'complete' | 'high' | 'partial';
    verificationNotes: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingJob {
  id: string;
  videoId: string;
  status: JobStatus;
  progress: number; // 0 - 100
  currentStage: string;
  stageDetails: string;
  notesId?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedTimestamps?: { label: string; seconds: number }[];
  sourceTrace?: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedTopic: string;
  timestamp?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface UserHighlight {
  id: string;
  sectionId: string;
  text: string;
  color: string;
  createdAt: string;
}

export interface UserNote {
  id: string;
  sectionId: string;
  content: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'password' | 'google' | 'github';
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  message?: string;
}
