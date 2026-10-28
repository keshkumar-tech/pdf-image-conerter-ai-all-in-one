import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { YouTubeInputHero } from './components/YouTubeInputHero';
import { PipelineProgress } from './components/PipelineProgress';
import { Workspace } from './components/Workspace';
import { AdminDashboard } from './components/AdminDashboard';
import { SourceUploadModal } from './components/SourceUploadModal';
import { AuthModal } from './components/AuthModal';
import { ToolsHome } from './components/ToolsHome';
import { LibraryHome } from './components/LibraryHome';
import { GenericToolPageWrapper } from './components/tools/GenericToolPageWrapper';
import { Footer } from './components/Footer';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { NoteDepth, NoteLanguage, PDFTheme, VideoMetadata, SourceStatus, ProcessingJob, NoteDocument, TranscriptSegment } from './types';
import { DEMO_LECTURES } from './utils/demoData';

export function App() {
  const navigate = useNavigate();
  const { user, openAuthModal, isAuthModalOpen, closeAuthModal, authModalReason } = useAuth();
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState<NoteDepth>('complete');
  const [language, setLanguage] = useState<NoteLanguage>('auto');
  const [pdfTheme, setPdfTheme] = useState<PDFTheme>('modern');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedVideo, setAnalyzedVideo] = useState<VideoMetadata | null>(null);
  const [sourceStatus, setSourceStatus] = useState<SourceStatus | null>(null);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  const [activeNotes, setActiveNotes] = useState<NoteDocument | null>(null);
  const [activeTranscript, setActiveTranscript] = useState<TranscriptSegment[]>([]);

  const jobPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (jobPollRef.current) clearInterval(jobPollRef.current);
    };
  }, []);

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || url;
    if (!targetUrl.trim()) return;

    setIsAnalyzing(true);
    setAnalyzedVideo(null);
    setSourceStatus(null);

    try {
      const res = await api.analyzeVideo(targetUrl);
      setAnalyzedVideo(res.video);
      setSourceStatus(res.sourceStatus);
    } catch (err: any) {
      alert(err.message || 'Failed to analyze YouTube video URL.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectDemo = (demoKey: string) => {
    const demo = DEMO_LECTURES[demoKey];
    if (demo) {
      setUrl(demo.metadata.url);
      setAnalyzedVideo(demo.metadata);
      setSourceStatus({
        metadataFound: true,
        transcriptFound: true,
        transcriptUnavailable: false,
        processingSource: false,
        notesGenerated: false,
        sourceType: 'demo_lecture',
        message: 'Educational demo lecture verified.',
      });
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const handleStartProcessing = async () => {
    if (!analyzedVideo) return;

    if (!userRef.current) {
      openAuthModal('notes_generation', () => {
        handleStartProcessing();
      });
      return;
    }

    try {
      const res = await api.startProcessing({
        videoId: analyzedVideo.videoId,
        depth,
        language,
        pdfTheme,
      });

      setCurrentJob({
        id: res.jobId,
        videoId: analyzedVideo.videoId,
        status: 'queued',
        progress: 10,
        currentStage: 'Initializing AI Pipeline',
        stageDetails: 'Segmenting transcript and mapping semantic boundaries...',
        createdAt: new Date().toISOString(),
      });

      if (jobPollRef.current) clearInterval(jobPollRef.current);

      jobPollRef.current = setInterval(async () => {
        try {
          const job = await api.getJobStatus(res.jobId);
          setCurrentJob(job);

          if (job.status === 'completed') {
            if (jobPollRef.current) clearInterval(jobPollRef.current);

            const [notesDoc, transcriptData] = await Promise.all([
              api.getNotes(analyzedVideo.videoId),
              api.getTranscript(analyzedVideo.videoId),
            ]);

            setActiveNotes(notesDoc);
            setActiveTranscript(transcriptData.segments || []);
            setCurrentJob(null);
            navigate('/workspace');
          } else if (job.status === 'failed') {
            if (jobPollRef.current) clearInterval(jobPollRef.current);
            alert(`Generation failed: ${job.error || 'Unknown error'}`);
            setCurrentJob(null);
          }
        } catch (pollErr) {
          console.warn('Job poll error:', pollErr);
        }
      }, 1000);
    } catch (err: any) {
      if (err.transcriptUnavailable) {
        setIsSourceModalOpen(true);
      } else {
        alert(err.message || 'Failed to start processing');
      }
    }
  };

  return (
    <div className="min-h-screen cf-aurora-bg text-[var(--cf-text-primary)] dark:text-slate-100 font-sans antialiased selection:bg-[var(--cf-accent)]/20 selection:text-[var(--cf-text-primary)] dark:selection:bg-[var(--cf-accent)]/30 dark:selection:text-blue-200 transition-colors duration-300">
      <Navbar
        hasActiveNotes={!!activeNotes}
        activeVideoTitle={activeNotes?.title}
      />

      <main>
        <Routes>
          <Route path="/" element={<ToolsHome />} />
          <Route path="/tools/:toolId" element={<GenericToolPageWrapper />} />
          <Route path="/youtube-notes" element={
            <div className="pb-16">
              <YouTubeInputHero
                url={url}
                setUrl={setUrl}
                depth={depth}
                setDepth={setDepth}
                language={language}
                setLanguage={setLanguage}
                pdfTheme={pdfTheme}
                setPdfTheme={setPdfTheme}
                onAnalyze={() => handleAnalyze()}
                onProcess={handleStartProcessing}
                isAnalyzing={isAnalyzing}
                analyzedVideo={analyzedVideo}
                sourceStatus={sourceStatus}
                onOpenSourceModal={() => setIsSourceModalOpen(true)}
                onSelectDemo={handleSelectDemo}
              />

              {currentJob && (
                <PipelineProgress
                  job={currentJob}
                  videoTitle={analyzedVideo?.title}
                />
              )}
            </div>
          } />

          <Route path="/workspace" element={
            activeNotes && analyzedVideo ? (
              <Workspace
                notes={activeNotes}
                video={analyzedVideo}
                transcript={activeTranscript}
                onUpdateNotes={(updated) => {
                  setActiveNotes(updated);
                  api.updateNotes(analyzedVideo.videoId, updated);
                }}
                onBackToHome={() => navigate('/')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Library landing — 2 portal cards.
              /library/school/* and /library/admin/* are served as standalone
              bundles by server.ts (the reference apps), not React routes. */}
          <Route path="/library" element={<LibraryHome />} />

          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {analyzedVideo && (
        <SourceUploadModal
          videoId={analyzedVideo.videoId}
          isOpen={isSourceModalOpen}
          onClose={() => setIsSourceModalOpen(false)}
          onSuccess={(segmentCount) => {
            setSourceStatus({
              metadataFound: true,
              transcriptFound: true,
              transcriptUnavailable: false,
              processingSource: false,
              notesGenerated: false,
              sourceType: 'user_upload',
              message: `Loaded ${segmentCount} transcript segments. Ready to generate notes.`,
            });
          }}
          onSelectDemo={handleSelectDemo}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        reason={authModalReason}
      />

      <Footer />
    </div>
  );
}
export default App;
