import { VideoMetadata, SourceStatus, NoteDocument, ProcessingJob, ChatMessage, NoteDepth, NoteLanguage, PDFTheme, AuthUser, AuthResponse } from '../types';

export const api = {
  // Authentication
  async register(params: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    return data;
  },

  async login(params: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data;
  },

  async loginWithGoogle(params: { email: string; name?: string; avatar?: string }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sign in with Google');
    return data;
  },

  async loginWithGitHub(params: { email: string; name?: string; avatar?: string }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sign in with GitHub');
    return data;
  },

  async getCurrentUser(token: string): Promise<{ user: AuthUser }> {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async analyzeVideo(url: string): Promise<{
    video: VideoMetadata;
    sourceStatus: SourceStatus;
    segmentCount: number;
    hasNotes: boolean;
  }> {
    const res = await fetch('/api/videos/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to analyze video' }));
      throw new Error(err.error || 'Failed to analyze video');
    }
    return res.json();
  },

  async uploadTranscript(videoId: string, rawText: string, format?: string): Promise<{
    success: boolean;
    segmentCount: number;
    sourceStatus: SourceStatus;
  }> {
    const res = await fetch('/api/videos/source/upload-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, rawText, format }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to upload transcript' }));
      throw new Error(err.error || 'Failed to upload transcript');
    }
    return res.json();
  },

  async startProcessing(params: {
    videoId: string;
    depth: NoteDepth;
    language: NoteLanguage;
    pdfTheme: PDFTheme;
  }): Promise<{ jobId: string; videoId: string }> {
    const res = await fetch('/api/videos/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to start generation' }));
      throw new Error(err.error || 'Failed to start generation');
    }
    return res.json();
  },

  async getJobStatus(jobId: string): Promise<ProcessingJob> {
    const res = await fetch(`/api/jobs/${jobId}`);
    if (!res.ok) throw new Error('Job not found');
    return res.json();
  },

  async getNotes(videoId: string): Promise<NoteDocument> {
    const res = await fetch(`/api/videos/${videoId}/notes`);
    if (!res.ok) throw new Error('Notes not found');
    return res.json();
  },

  async getTranscript(videoId: string): Promise<{ segments: any[]; total: number }> {
    const res = await fetch(`/api/videos/${videoId}/transcript`);
    if (!res.ok) throw new Error('Transcript not found');
    return res.json();
  },

  async updateNotes(videoId: string, updates: Partial<NoteDocument>): Promise<NoteDocument> {
    const res = await fetch(`/api/notes/${videoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update notes');
    const data = await res.json();
    return data.notes;
  },

  async sendChatMessage(videoId: string, question: string, sourceOnly: boolean = true): Promise<{
    message: ChatMessage;
    history: ChatMessage[];
  }> {
    const res = await fetch(`/api/videos/${videoId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, sourceOnly }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Chat failed' }));
      throw new Error(err.error || 'Chat failed');
    }
    return res.json();
  },

  async getStudyTools(videoId: string, type: 'mcqs' | 'flashcards'): Promise<any> {
    const res = await fetch(`/api/videos/${videoId}/study-tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) throw new Error('Failed to generate study tool');
    const json = await res.json();
    return json.data;
  },

  async getLibrary(): Promise<any> {
    const res = await fetch('/api/user/library');
    if (!res.ok) throw new Error('Failed to fetch library');
    return res.json();
  },

  async getAdminMetrics(): Promise<any> {
    const res = await fetch('/api/admin/metrics');
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },
};
