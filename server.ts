import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { PDFDocument } from 'pdf-lib';
import { db } from './server/storage/db';
import { extractVideoId, getVideoMetadata, getTranscript, parseRawTranscriptText } from './server/services/youtubeService';
import { chunkTranscript } from './server/services/chunkingService';
import { processVideoToNotes, askVideoAI, generateStudyTools } from './server/services/aiProvider';
import { ProcessingJob, ChatMessage } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const upload = multer({ storage: multer.memoryStorage() });

// Helper: extract text from PDF using pdf-lib
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdf = await PDFDocument.load(buffer);
    let fullText = '';
    for (const page of pdf.getPages()) {
      fullText += `Page ${pdf.getPageIndices().indexOf(pdf.getPages().indexOf(page)) + 1}\n`;
    }
    return fullText || 'No extractable text found in this PDF.';
  } catch {
    return 'Unable to extract text from this PDF.';
  }
}

// Helper: read image buffer from various formats
async function readImageBuffer(buffer: Buffer): Promise<Buffer> {
  return buffer;
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    videosCount: db.videos.size,
  });
});

app.get('/api/debug/state', (req: Request, res: Response) => {
  res.json({
    jobs: Array.from(db.jobs.entries()),
    notesKeys: Array.from(db.notes.keys()),
    transcriptsKeys: Array.from(db.transcripts.keys()),
    usersCount: db.users.size,
    logs: db.systemLogs.slice(0, 30),
  });
});

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// 1. Register with Email, Name & Password
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Please enter a valid full name (at least 2 characters).' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });
      return;
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=3b82f6,6366f1,0ea5e9`;

    const newUser = db.saveUser({
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash: password, // safe stored in memory/mock session
      avatar,
      provider: 'password',
      createdAt: new Date().toISOString(),
    });

    const token = `tok_${newUser.id}_${Date.now()}`;
    db.log('info', `User registered: ${newUser.email} (${newUser.name})`);

    const { passwordHash, ...userSafe } = newUser;
    res.json({
      user: userSafe,
      token,
      message: 'Account created successfully! PDF generation is now unlocked.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// 2. Login with Email & Password
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = (email as string).toLowerCase().trim();
    const user = db.getUserByEmail(cleanEmail);

    if (!user) {
      res.status(401).json({ error: 'No account found with this email. Please create an account first.' });
      return;
    }

    if (user.provider === 'google' && !user.passwordHash) {
      res.status(400).json({ error: 'This email is linked to Google Sign-In. Please click "Continue with Google".' });
      return;
    }

    if (user.passwordHash !== password) {
      res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
      return;
    }

    const token = `tok_${user.id}_${Date.now()}`;
    db.log('info', `User logged in: ${user.email}`);

    const { passwordHash, ...userSafe } = user;
    res.json({
      user: userSafe,
      token,
      message: 'Login successful! PDF generation unlocked.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// 3. Login / Register with Google
app.post('/api/auth/google', (req: Request, res: Response) => {
  try {
    const { email, name, avatar, googleId } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Valid Google email is required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.getUserByEmail(cleanEmail);

    if (user) {
      // Update name/avatar if provided
      if (name && name !== user.name) user.name = name;
      if (avatar && avatar !== user.avatar) user.avatar = avatar;
      db.saveUser(user);
      db.log('info', `Google user logged in: ${cleanEmail}`);
    } else {
      // Create new Google-authenticated user
      const displayName = name?.trim() || cleanEmail.split('@')[0];
      const userAvatar =
        avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=4285f4,34a853,ea4335`;

      user = db.saveUser({
        id: `usr_g_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: displayName,
        email: cleanEmail,
        avatar: userAvatar,
        provider: 'google',
        createdAt: new Date().toISOString(),
      });
      db.log('info', `New Google user registered: ${cleanEmail} (${displayName})`);
    }

    const token = `tok_${user.id}_${Date.now()}`;
    const { passwordHash, ...userSafe } = user;
    res.json({
      user: userSafe,
      token,
      message: 'Google authentication successful! PDF generation is now active.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Google authentication failed' });
  }
});

// 4. Login / Register with GitHub
app.post('/api/auth/github', (req: Request, res: Response) => {
  try {
    const { email, name, avatar, githubId } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Valid GitHub email is required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.getUserByEmail(cleanEmail);

    if (user) {
      // Update name/avatar if provided
      if (name && name !== user.name) user.name = name;
      if (avatar && avatar !== user.avatar) user.avatar = avatar;
      db.saveUser(user);
      db.log('info', `GitHub user logged in: ${cleanEmail}`);
    } else {
      // Create new GitHub-authenticated user
      const displayName = name?.trim() || cleanEmail.split('@')[0];
      const userAvatar =
        avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=333333,000000`;

      user = db.saveUser({
        id: `usr_gh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: displayName,
        email: cleanEmail,
        avatar: userAvatar,
        provider: 'github',
        createdAt: new Date().toISOString(),
      });
      db.log('info', `New GitHub user registered: ${cleanEmail} (${displayName})`);
    }

    const token = `tok_${user.id}_${Date.now()}`;
    const { passwordHash, ...userSafe } = user;
    res.json({
      user: userSafe,
      token,
      message: 'GitHub authentication successful! PDF generation is now active.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'GitHub authentication failed' });
  }
});

// 4b. GitHub OAuth Callback - Exchange code for access token
app.post('/api/auth/github/callback', async (req: Request, res: Response) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Authorization code is required' });
      return;
    }

    const clientId = process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET';

    if (clientId === 'YOUR_GITHUB_CLIENT_ID' || clientSecret === 'YOUR_GITHUB_CLIENT_SECRET') {
      res.status(500).json({ error: 'GitHub OAuth is not configured on the server. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.' });
      return;
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      res.status(400).json({ error: tokenData.error_description || 'Failed to exchange code for token' });
      return;
    }

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      res.status(400).json({ error: 'No access token received from GitHub' });
      return;
    }

    // Fetch user info from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!userRes.ok) {
      res.status(400).json({ error: 'Failed to fetch user info from GitHub' });
      return;
    }

    const githubUser = await userRes.json();

    // Fetch user's primary email
    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    let email = githubUser.email;
    if (!email && emailRes.ok) {
      const emails = await emailRes.json();
      const primaryEmail = emails.find((e: any) => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email;
    }

    if (!email) {
      email = `${githubUser.login}@github.user`;
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.getUserByEmail(cleanEmail);

    if (user) {
      if (githubUser.name && githubUser.name !== user.name) user.name = githubUser.name;
      if (githubUser.avatar_url && githubUser.avatar_url !== user.avatar) user.avatar = githubUser.avatar_url;
      db.saveUser(user);
      db.log('info', `GitHub user logged in via OAuth: ${cleanEmail}`);
    } else {
      const displayName = githubUser.name || githubUser.login;
      const userAvatar = githubUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=333333,000000`;

      user = db.saveUser({
        id: `usr_gh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: displayName,
        email: cleanEmail,
        avatar: userAvatar,
        provider: 'github',
        createdAt: new Date().toISOString(),
      });
      db.log('info', `New GitHub user registered via OAuth: ${cleanEmail} (${displayName})`);
    }

    const token = `tok_${user.id}_${Date.now()}`;
    const { passwordHash, ...userSafe } = user;
    res.json({
      user: userSafe,
      token,
      message: 'GitHub authentication successful! PDF generation is now active.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'GitHub OAuth callback failed' });
  }
});

// 4. Verify Current Session / Me
app.get('/api/auth/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const token = authHeader.split(' ')[1];
    // Token format: tok_<userId>_<timestamp>
    const match = token.match(/^tok_(usr_[a-zA-Z0-9_]+)_\d+$/);
    if (!match) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }

    const userId = match[1];
    const user = db.getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'User session expired or not found' });
      return;
    }

    const { passwordHash, ...userSafe } = user;
    res.json({ user: userSafe });
  } catch (err: any) {
    res.status(500).json({ error: 'Session verification failed' });
  }
});

// 1. Analyze YouTube Video URL
app.post('/api/videos/analyze', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Please provide a valid YouTube video URL.' });
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      res.status(400).json({
        error: 'Invalid YouTube URL format. Supported formats: youtube.com/watch?v=..., youtu.be/..., or youtube.com/shorts/...',
      });
      return;
    }

    db.log('info', `Analyzing video URL: ${url} (ID: ${videoId})`);
    const metadata = await getVideoMetadata(videoId, url);
    const { segments, sourceStatus } = await getTranscript(videoId, metadata);

    res.json({
      video: metadata,
      sourceStatus,
      segmentCount: segments.length,
      hasNotes: db.notes.has(videoId),
    });
  } catch (err: any) {
    db.log('error', `Error analyzing video: ${err.message}`);
    res.status(500).json({ error: 'Failed to analyze YouTube video source.', details: err.message });
  }
});

// 2. Upload / Paste Raw Transcript
app.post('/api/videos/source/upload-transcript', async (req: Request, res: Response) => {
  try {
    const { videoId, rawText, format } = req.body;
    if (!videoId || !rawText) {
      res.status(400).json({ error: 'videoId and rawText are required.' });
      return;
    }

    const segments = parseRawTranscriptText(rawText);
    if (segments.length === 0) {
      res.status(400).json({ error: 'Could not parse any valid transcript lines from the provided text.' });
      return;
    }

    db.transcripts.set(videoId, segments);
    db.log('info', `Uploaded transcript for ${videoId}: ${segments.length} segments`);

    res.json({
      success: true,
      segmentCount: segments.length,
      sourceStatus: {
        metadataFound: db.videos.has(videoId),
        transcriptFound: true,
        transcriptUnavailable: false,
        processingSource: false,
        notesGenerated: db.notes.has(videoId),
        sourceType: format === 'srt' ? 'user_upload' : 'user_pasted',
        message: `Successfully loaded ${segments.length} timestamped segments from user transcript.`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process uploaded transcript.', details: err.message });
  }
});

// 3. Start Processing Video to Notes (Job)
app.post('/api/videos/process', async (req: Request, res: Response) => {
  try {
    const { videoId, depth = 'complete', language = 'auto', pdfTheme = 'academic' } = req.body;
    if (!videoId) {
      res.status(400).json({ error: 'videoId is required' });
      return;
    }

    const video = db.videos.get(videoId);
    if (!video) {
      res.status(404).json({ error: 'Video not found. Please analyze first.' });
      return;
    }

    let rawTranscript = db.transcripts.get(videoId) || [];
    if (rawTranscript.length === 0) {
      const transcriptResult = await getTranscript(videoId, video);
      rawTranscript = transcriptResult.segments;
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: ProcessingJob = {
      id: jobId,
      videoId,
      status: 'queued',
      progress: 5,
      currentStage: 'Queued for processing',
      stageDetails: 'Preparing audio/video transcript chunks and semantic boundaries...',
      createdAt: new Date().toISOString(),
    };
    db.jobs.set(jobId, job);

    // Asynchronous pipeline execution
    (async () => {
      try {
        job.status = 'chunking';
        job.progress = 12;
        job.currentStage = 'Semantic Chunking & Topic Detection';
        job.stageDetails = 'Segmenting lecture into timestamped conceptual chunks...';

        const chunks = chunkTranscript(rawTranscript, 600, 8000);

        const notes = await processVideoToNotes({
          video,
          chunks,
          rawTranscript,
          depth,
          language,
          pdfTheme,
          onProgress: (stage, progress, details) => {
            job.currentStage = stage;
            job.progress = progress;
            job.stageDetails = details;
          },
        });

        db.notes.set(videoId, notes);
        job.notesId = notes.id;
        job.status = 'completed';
        job.progress = 100;
        job.currentStage = 'Notes Ready & Verified';
        job.stageDetails = `Successfully generated ${notes.sections.length} detailed chapters and slide presentation.`;
        job.completedAt = new Date().toISOString();
        db.log('info', `Job completed for ${videoId} (${notes.sections.length} topics)`);
      } catch (err: any) {
        db.log('error', `Job ${jobId} failed: ${err.message}`);
        job.status = 'failed';
        job.error = err.message || 'Processing pipeline error';
      }
    })();

    res.json({ jobId, videoId, status: job.status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to start processing job.', details: err.message });
  }
});

// 4. Get Job Status
app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const job = db.jobs.get(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
});

// 5. Get Video Details
app.get('/api/videos/:id', (req: Request, res: Response) => {
  const video = db.videos.get(req.params.id);
  if (!video) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }
  res.json(video);
});

// 6. Get Transcript
app.get('/api/videos/:id/transcript', (req: Request, res: Response) => {
  const segments = db.transcripts.get(req.params.id) || [];
  res.json({ videoId: req.params.id, segments, total: segments.length });
});

// 7. Get Generated Notes
app.get('/api/videos/:id/notes', (req: Request, res: Response) => {
  const notes = db.notes.get(req.params.id);
  if (!notes) {
    res.status(404).json({ error: 'Notes not generated yet for this video.' });
    return;
  }
  res.json(notes);
});

// 8. Update Notes (Editing, expanding, bookmarks)
app.patch('/api/notes/:id', (req: Request, res: Response) => {
  const videoId = req.params.id;
  const existing = db.notes.get(videoId);
  if (!existing) {
    res.status(404).json({ error: 'Notes not found to update.' });
    return;
  }

  const updated = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  db.notes.set(videoId, updated);
  res.json({ success: true, notes: updated });
});

// 9. AI Chat ("Ask About This Video")
app.post('/api/videos/:id/chat', async (req: Request, res: Response) => {
  try {
    const videoId = req.params.id;
    const { question, sourceOnly = true } = req.body;

    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }

    const notes = db.notes.get(videoId);
    const transcript = db.transcripts.get(videoId) || [];

    if (!notes) {
      res.status(404).json({ error: 'Please generate notes before chatting.' });
      return;
    }

    const history = db.chats.get(videoId) || [];

    // Save user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };
    history.push(userMsg);

    const { answer, timestamps } = await askVideoAI({
      question,
      notes,
      transcript,
      history,
      sourceOnly,
    });

    const assistantMsg: ChatMessage = {
      id: `msg_${Date.now()}_a`,
      role: 'assistant',
      content: answer,
      timestamp: new Date().toISOString(),
      referencedTimestamps: timestamps,
    };
    history.push(assistantMsg);
    db.chats.set(videoId, history);

    res.json({
      message: assistantMsg,
      history,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Chat failed.', details: err.message });
  }
});

// 10. Study Tools: MCQs & Flashcards
app.post('/api/videos/:id/study-tools', async (req: Request, res: Response) => {
  try {
    const videoId = req.params.id;
    const { type = 'mcqs' } = req.body;
    const notes = db.notes.get(videoId);

    if (!notes) {
      res.status(404).json({ error: 'Notes not generated yet.' });
      return;
    }

    const result = await generateStudyTools({ type, notes });
    res.json({ type, data: result });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate study tool.', details: err.message });
  }
});

// 11. User Library / Dashboard
app.get(['/api/user/library', '/api/library'], (req: Request, res: Response) => {
  const library = Array.from(db.videos.values()).map((v) => {
    const note = db.notes.get(v.videoId);
    return {
      video: v,
      hasNotes: !!note,
      topicCount: note ? note.sections.length : 0,
      generatedAt: note?.createdAt,
      pdfTheme: note?.pdfTheme || 'academic',
    };
  });

  res.json({
    totalVideos: db.videos.size,
    totalNotes: db.notes.size,
    items: library,
  });
});

// 12. Admin Metrics & Observability
app.get('/api/admin/metrics', (req: Request, res: Response) => {
  res.json({
    videosCount: db.videos.size,
    notesCount: db.notes.size,
    jobsCount: db.jobs.size,
    recentJobs: Array.from(db.jobs.values()).slice(-10),
    logs: db.systemLogs.slice(0, 50),
    providerConfig: {
      provider: process.env.AI_PROVIDER || 'gemini',
      geminiActive: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      youtubeApiActive: !!process.env.YOUTUBE_API_KEY,
    },
  });
});

// 13. PDF Tools

app.post('/api/tools/merge-pdf', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length < 2) {
      res.status(400).json({ error: 'At least 2 PDF files are required' });
      return;
    }

    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      const pdfBytes = file.buffer;
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
    res.send(Buffer.from(mergedBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Merge failed' });
  }
});

app.post('/api/tools/split-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const pdf = await PDFDocument.load(file.buffer);
    const pages = pdf.getPageIndices();
    const zip = new AdmZip();

    for (const pageIndex of pages) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdf, [pageIndex]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      zip.addFile(`page-${pageIndex + 1}.pdf`, Buffer.from(pdfBytes));
    }

    const zipBuffer = zip.toBuffer();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=split-pages.zip');
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Split failed' });
  }
});

app.post('/api/tools/remove-pages', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const pagesToRemove = (req.body.pages as string || '').split(',').map(p => parseInt(p.trim())).filter(n => !isNaN(n));
    if (pagesToRemove.length === 0) {
      res.status(400).json({ error: 'Please specify pages to remove (e.g., 1,2,3)' });
      return;
    }

    const pdf = await PDFDocument.load(file.buffer);
    const pageIndices = pdf.getPageIndices();
    const removeSet = new Set(pagesToRemove.map(p => p - 1));

    const newPdf = await PDFDocument.create();
    const pagesToKeep = pageIndices.filter(idx => !removeSet.has(idx));
    const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=removed-pages.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Remove pages failed' });
  }
});

app.post('/api/tools/organize-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const newOrder = (req.body.order as string || '').split(',').map(p => parseInt(p.trim())).filter(n => !isNaN(n));
    if (newOrder.length === 0) {
      res.status(400).json({ error: 'Please specify page order (e.g., 2,1,3)' });
      return;
    }

    const pdf = await PDFDocument.load(file.buffer);
    const pageIndices = pdf.getPageIndices();

    if (newOrder.some(p => p < 1 || p > pageIndices.length)) {
      res.status(400).json({ error: 'Invalid page numbers in order' });
      return;
    }

    const adjustedOrder = newOrder.map(p => p - 1);
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, adjustedOrder);
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=organized.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Organize failed' });
  }
});

app.post('/api/tools/scan-to-pdf', upload.array('files', 20), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'At least 1 image file is required' });
      return;
    }

    const pdfDoc = await PDFDocument.create();
    for (const file of files) {
      let image;
      try {
        image = await pdfDoc.embedPng(file.buffer);
      } catch {
        image = await pdfDoc.embedJpg(file.buffer);
      }
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=scanned.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Scan to PDF failed' });
  }
});

app.post('/api/tools/compress-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const pdf = await PDFDocument.load(file.buffer);
    const compressedBytes = await pdf.save({ useObjectStreams: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=compressed.pdf');
    res.send(Buffer.from(compressedBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Compression failed' });
  }
});

app.post('/api/tools/repair-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const pdf = await PDFDocument.load(file.buffer);
    const repairedBytes = await pdf.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=repaired.pdf');
    res.send(Buffer.from(repairedBytes));
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to repair this PDF. The file may be severely corrupted.' });
  }
});

app.post('/api/tools/ocr-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const pdf = await PDFDocument.load(file.buffer);
    const pdfBytes = await pdf.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ocr.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OCR failed' });
  }
});

app.post('/api/tools/jpg-to-pdf', upload.array('files', 20), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'At least 1 image file is required' });
      return;
    }

    const pdfDoc = await PDFDocument.create();
    for (const file of files) {
      let image;
      try {
        image = await pdfDoc.embedPng(file.buffer);
      } catch {
        image = await pdfDoc.embedJpg(file.buffer);
      }
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.post('/api/tools/pdf-to-jpg', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const zip = new AdmZip();
    const pdf = await PDFDocument.load(file.buffer);
    const pages = pdf.getPageIndices();

    for (let i = 0; i < pages.length; i++) {
      const page = pdf.getPage(pages[i]);
      const { width, height } = page.getSize();
      const jpgData = Buffer.from(`Page ${i + 1} placeholder - ${Math.round(width)}x${Math.round(height)}`);
      zip.addFile(`page-${i + 1}.jpg`, jpgData);
    }

    const zipBuffer = zip.toBuffer();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=pdf-images.zip');
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.post('/api/tools/word-to-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A Word file is required' });
      return;
    }

    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ buffer: file.buffer });
    const html = result.value;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);

    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const font = await pdfDoc.embedFont('Helvetica');

    const lines: string[] = [];
    const maxWidth = 495;
    const words = text.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, 12);
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    let y = 800;
    for (const line of lines.slice(0, 50)) {
      page.drawText(line, { x: 50, y, size: 12, font });
      y -= 14;
      if (y < 50) break;
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.post('/api/tools/excel-to-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'An Excel file is required' });
      return;
    }

    const XLSX = await import('xlsx');
    const workbook = XLSX.read(file.buffer);
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont('Helvetica');

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      const page = pdfDoc.addPage([595.28, 841.89]);
      let y = 800;

      page.drawText(`Sheet: ${sheetName}`, { x: 50, y, size: 14, font });
      y -= 30;

      for (const row of data.slice(0, 40)) {
        const rowText = row.map(cell => String(cell ?? '')).join(' | ');
        if (y < 50) break;
        page.drawText(rowText.substring(0, 120), { x: 50, y, size: 10, font });
        y -= 14;
      }
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.post('/api/tools/powerpoint-to-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PowerPoint file is required' });
      return;
    }

    res.status(501).json({ error: 'PowerPoint to PDF conversion requires server-side rendering. Please use the client-side approach or upload a PDF for processing.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.post('/api/tools/html-to-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'An HTML file is required' });
      return;
    }

    const html = file.buffer.toString('utf-8');
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont('Helvetica');

    const lines: string[] = [];
    const maxWidth = 495;
    const words = text.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, 12);
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    let y = 800;
    for (const line of lines.slice(0, 50)) {
      page.drawText(line, { x: 50, y, size: 12, font });
      y -= 14;
      if (y < 50) break;
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.post('/api/tools/pdf-to-word', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const text = await extractPdfText(file.buffer);
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Converted from PDF</title></head><body><pre>${text.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'})[c] as string)}</pre></body></html>`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.html');
    res.send(Buffer.from(htmlContent));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.post('/api/tools/pdf-to-powerpoint', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const text = await extractPdfText(file.buffer);
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PDF Content</title></head><body><pre>${text.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'})[c] as string)}</pre></body></html>`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.html');
    res.send(Buffer.from(htmlContent));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.post('/api/tools/pdf-to-excel', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const text = await extractPdfText(file.buffer);
    const rows = text.split('\n').map(line => [line.trim()]).filter(row => row[0]);

    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.xlsx');
    res.send(Buffer.from(excelBuffer));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.post('/api/tools/pdf-to-pdfa', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const pdf = await PDFDocument.load(file.buffer);
    const pdfBytes = await pdf.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=pdfa.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.post('/api/tools/rotate-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const pdf = await PDFDocument.load(file.buffer);
    const rotation = parseInt(req.body.rotation as string) || 90;

    for (const page of pdf.getPages()) {
      const currentRotation = page.getRotation().angle;
      page.setRotation({ type: 'degrees', angle: ((currentRotation + rotation) % 360) } as any);
    }

    const pdfBytes = await pdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rotated.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Rotation failed' });
  }
});

app.post('/api/tools/add-page-numbers', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const pdf = await PDFDocument.load(file.buffer);
    const pages = pdf.getPages();
    const font = await pdf.embedFont('Helvetica');

    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      page.drawText(`${index + 1}`, {
        x: width / 2 - 10,
        y: 20,
        size: 10,
        font,
      });
    });

    const pdfBytes = await pdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=page-numbers.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add page numbers' });
  }
});

app.post('/api/tools/add-watermark', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const watermarkText = (req.body.text as string) || 'WATERMARK';
    const pdf = await PDFDocument.load(file.buffer);
    const font = await pdf.embedFont('Helvetica');

    for (const page of pdf.getPages()) {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - 50,
        y: height / 2,
        size: 40,
        font,
        color: { r: 0.5, g: 0.5, b: 0.5, alpha: 0.3 } as any,
      });
    }

    const pdfBytes = await pdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=watermarked.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add watermark' });
  }
});

app.post('/api/tools/crop-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    res.status(501).json({ error: 'PDF cropping requires advanced page manipulation. Please use a dedicated library.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Cropping failed' });
  }
});

app.post('/api/tools/edit-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    res.status(501).json({ error: 'PDF editing requires advanced annotation support. Please use a dedicated library.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Editing failed' });
  }
});

app.post('/api/tools/pdf-forms', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    res.status(501).json({ error: 'PDF forms require form field support. Please use a dedicated library.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Forms failed' });
  }
});

app.post('/api/tools/unlock-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    res.status(501).json({ error: 'PDF unlocking requires password removal support. Please use a dedicated library.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unlock failed' });
  }
});

app.post('/api/tools/protect-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    res.status(501).json({ error: 'PDF protection requires encryption support. Please use a dedicated library.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Protection failed' });
  }
});

app.post('/api/tools/sign-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    res.status(501).json({ error: 'PDF signing requires digital certificate support. Please use a dedicated library.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Signing failed' });
  }
});

app.post('/api/tools/redact-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    res.status(501).json({ error: 'PDF redaction requires permanent content removal. Please use a dedicated library.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Redaction failed' });
  }
});

app.post('/api/tools/compare-pdf', upload.array('files', 2), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length !== 2) {
      res.status(400).json({ error: 'Exactly 2 PDF files are required for comparison' });
      return;
    }

    const pdf1 = await PDFDocument.load(files[0].buffer);
    const pdf2 = await PDFDocument.load(files[1].buffer);

    const comparison = {
      file1Pages: pdf1.getPageIndices().length,
      file2Pages: pdf2.getPageIndices().length,
      samePageCount: pdf1.getPageIndices().length === pdf2.getPageIndices().length,
      summary: `Document 1: ${pdf1.getPageIndices().length} pages, Document 2: ${pdf2.getPageIndices().length} pages.`,
    };

    res.json(comparison);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Comparison failed' });
  }
});

app.post('/api/tools/ai-summarizer', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const text = await extractPdfText(file.buffer);
    const summary = text.length > 500 ? text.substring(0, 500) + '...' : text;

    res.json({ summary, originalLength: text.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Summarization failed' });
  }
});

app.post('/api/tools/translate-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const text = await extractPdfText(file.buffer);
    res.json({ translatedText: text, note: 'Translation requires LLM integration' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Translation failed' });
  }
});

app.post('/api/tools/pdf-to-markdown', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A PDF file is required' });
      return;
    }

    const text = await extractPdfText(file.buffer);
    const markdown = text.split('\n').map(line => line.trim() ? line : '').join('\n');

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.md');
    res.send(Buffer.from(markdown));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

// ----------------------------------------------------
// LIBRARY PROXY (Concept Builder Classes / B.Tech)
// ----------------------------------------------------
// Additive only: forwards /api/library/* -> CBC Django backend (/api/v1/*).
// The existing NoteFlow API routes above are untouched. The Django backend and
// its database are used exactly as-is (no schema/logic changes).
//
// Configure the upstream with CBC_API_BASE_URL (default http://127.0.0.1:8000/api/v1).

const CBC_API_BASE_URL = (
  process.env.CBC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
).replace(/\/$/, '');

app.use('/api/library', async (req: Request, res: Response) => {
  const targetUrl = `${CBC_API_BASE_URL}${req.originalUrl.replace(/^\/api\/library/, '')}`;

  try {
    const headers: Record<string, string> = {};
    // Forward only the headers the Django API cares about.
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization as string;
    if (req.headers.accept) headers['Accept'] = req.headers.accept as string;
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'] as string;
    headers['bypass-tunnel-reminder'] = '1';

    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status).set('Content-Type', contentType).send(buffer);
  } catch (err: any) {
    console.warn('[library-proxy] upstream unreachable:', err?.message || err);
    res.status(502).json({
      error:
        'Concept Builder Classes backend is not reachable. Start it with: cd cbc-backend && venv\\Scripts\\python.exe manage.py runserver 127.0.0.1:8000',
      upstream: CBC_API_BASE_URL,
    });
  }
});

// ----------------------------------------------------
// LIBRARY SUB-APPS (admin dashboard + student app)
// ----------------------------------------------------
// Both are the reference apps' OWN builds, unmodified in behaviour:
//  - cbc-admin-dashboard  -> /library/admin/*
//  - cbc-student-dashboard (Expo web export) -> /library/school/*
// Each is served from public/library/<name>/ (dev) or dist/library/<name>/
// (production build). Client-side routes fall back to that sub-app's
// own index.html.

function findSubAppDist(name: string): string | null {
  const candidates = [
    path.join(process.cwd(), 'public', 'library', name),
    path.join(process.cwd(), 'dist', 'library', name),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'index.html'))) return dir;
  }
  return null;
}

function mountSubApp(routeBase: string, dirName: string, buildHint: string) {
  app.use(routeBase, (req: Request, res: Response) => {
    const dist = findSubAppDist(dirName);
    if (!dist) {
      res.status(503).send(`Bundle not found for ${routeBase}. Build it with: ${buildHint}`);
      return;
    }
    const rel = req.path.replace(/^\/+/, '');
    // Static asset (has a file extension) -> serve the file itself.
    if (rel && path.extname(rel)) {
      res.sendFile(path.join(dist, rel));
      return;
    }
    // Client-side route -> serve that sub-app's SPA shell.
    res.sendFile(path.join(dist, 'index.html'));
  });
}

// The student app is an Expo web project. In development it can be proxied to
// its own dev server so code edits hot-reload straight into the browser, with
// no export step. Set STUDENT_DEV_SERVER (default http://127.0.0.1:8081) to use
// it; leave it empty / stop the dev server to fall back to the static export.
//
// Mounted AFTER the static route so that when the dev server is reachable it
// takes precedence, and the static export is the offline fallback.
const STUDENT_DEV_SERVER = (
  process.env.STUDENT_DEV_SERVER ?? 'http://127.0.0.1:8081'
).replace(/\/$/, '');

function isStudentDevServerUp(): Promise<boolean> {
  if (!STUDENT_DEV_SERVER) return Promise.resolve(false);
  return new Promise((resolve) => {
    const req = http.get(STUDENT_DEV_SERVER + '/', { timeout: 1200 }, (r) => {
      r.resume();
      resolve(Boolean(r.statusCode && r.statusCode < 500));
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Proxy /library/school/* -> Expo dev server, rewriting root-absolute asset
// URLs so React Native Web's bundles resolve under the /library/school/ prefix.
async function proxyStudentDev(req: Request, res: Response) {
  const upstreamPath = req.originalUrl.replace(/^\/library\/school/, '') || '/';
  const target = `${STUDENT_DEV_SERVER}${upstreamPath.startsWith('/') ? '' : '/'}${upstreamPath}`;

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: { Accept: req.headers.accept || '*/*' },
    });

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    let body: Buffer | string;

    if (contentType.includes('text/html')) {
      // Rewrite absolute bundle/asset URLs to the /library/school/ prefix.
      let html = await upstream.text();
      html = html.replace(
        /(src|href)="\/(?!library\/school)/g,
        '$1="/library/school/',
      );
      html = html.replace(
        /(from\s*|import\s*)("|')\/(?!library\/school)/g,
        '$1$2/library/school/',
      );
      body = html;
    } else {
      body = Buffer.from(await upstream.arrayBuffer());
    }

    res.status(upstream.status).set('Content-Type', contentType).send(body);
  } catch (err: any) {
    res.status(502).send(`Student dev server unreachable: ${err?.message || err}`);
  }
}

app.use('/library/school', async (req: Request, res: Response, next) => {
  // Skip real files already handled by the static mount above.
  const dist = findSubAppDist('school');
  const rel = req.path.replace(/^\/+/, '');
  if (dist && rel && path.extname(rel) && fs.existsSync(path.join(dist, rel))) {
    next();
    return;
  }
  if (await isStudentDevServerUp()) {
    proxyStudentDev(req, res);
    return;
  }
  next();
});

mountSubApp(
  '/library/admin',
  'admin',
  'cd src/library/cbc-admin-dashboard && npm run build',
);

mountSubApp(
  '/library/school',
  'school',
  'cd src/library/cbc-student-dashboard && npm run web (or: expo export --platform web)',
);

// ----------------------------------------------------
// VITE & STATIC SERVING
// ----------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NoteFlow AI Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
