import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff, FileText, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, reason }) => {
  const { login, register, loginWithGoogle, loginWithGitHub } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const googleButtonRef = useRef<HTMLDivElement>(null);

  // --- Hooks must all run before any early return (Rules of Hooks) ---

  useEffect(() => {
    const checkGitHubCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const storedState = localStorage.getItem('github_oauth_state');

      if (code && state === storedState) {
        localStorage.removeItem('github_oauth_state');

        try {
          const res = await fetch('/api/auth/github/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirectUri: `${window.location.origin}/auth/github/callback` }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'GitHub authentication failed');
          }

          await loginWithGitHub(data.user.email, data.user.name, data.user.avatar);
          setSuccessMsg('Signed in with GitHub!');

          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err: any) {
          setError(err.message || 'GitHub sign-in failed.');
        } finally {
          setIsGitHubLoading(false);
        }
      }
    };

    checkGitHubCallback();
  }, []);

  useEffect(() => {
    const loadGoogleScript = () => {
      if (!document.querySelector('script[src*="accounts.google.com"]')) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    };

    if (isOpen) {
      loadGoogleScript();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isPDFGated = reason === 'pdf_generation' || reason === 'pdf_export' || reason?.includes('pdf');
  const isNotesGated = reason === 'notes_generation' || reason === 'create_notes' || reason?.includes('note');

  const passwordsMatch = password.length >= 6 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (!confirmPassword) {
        setError('Please enter confirm password.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match! Please check your confirm password.');
        return;
      }

      setLoading(true);
      try {
        await register(name.trim(), email.trim(), password);
        setSuccessMsg('Account created successfully! Welcome to NoteFlow.');
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } else {
      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      setLoading(true);
      try {
        await login(email.trim(), password);
        setSuccessMsg('Logged in successfully!');
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your credentials.');
        setLoading(false);
      }
    }
  };

  const handleRealGoogleSignIn = () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

      if (clientId === 'YOUR_GOOGLE_CLIENT_ID' || !clientId) {
        setError('Google OAuth is not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.');
        setIsGoogleLoading(false);
        return;
      }

      const google = window.google;
      if (!google) {
        setError('Google Sign-In library is not loaded. Please refresh the page.');
        setIsGoogleLoading(false);
        return;
      }

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'profile email',
        callback: async (response: any) => {
          if (response.error) {
            setError(response.error_description || 'Google sign-in failed.');
            setIsGoogleLoading(false);
            return;
          }

          if (response.access_token) {
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  Authorization: `Bearer ${response.access_token}`,
                },
              });

              if (!userInfoRes.ok) {
                throw new Error('Failed to fetch user info from Google');
              }

              const userInfo = await userInfoRes.json();
              await loginWithGoogle(userInfo.email, userInfo.name, userInfo.picture);
              setSuccessMsg('Signed in with Google!');
            } catch (err: any) {
              setError(err.message || 'Google sign-in failed.');
            } finally {
              setIsGoogleLoading(false);
            }
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      setIsGoogleLoading(false);
    }
  };

  const handleRealGitHubSignIn = () => {
    setError(null);
    setIsGitHubLoading(true);

    try {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
      const redirectUri = `${window.location.origin}/auth/github/callback`;

      if (clientId === 'YOUR_GITHUB_CLIENT_ID' || !clientId) {
        setError('GitHub OAuth is not configured. Please add VITE_GITHUB_CLIENT_ID to your environment variables.');
        setIsGitHubLoading(false);
        return;
      }

      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('github_oauth_state', state);

      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;

      window.location.href = githubAuthUrl;
    } catch (err: any) {
      setError(err.message || 'GitHub sign-in failed.');
      setIsGitHubLoading(false);
    }
  };

  const getTitle = () => {
    if (isNotesGated) {
      return mode === 'login' ? 'Sign In to Generate Notes' : 'Create Account to Generate Notes';
    }
    if (isPDFGated) {
      return mode === 'login' ? 'Login to Generate PDF' : 'Create Account for PDF Access';
    }
    return mode === 'login' ? 'Sign in to NoteFlow' : 'Create NoteFlow Account';
  };

  const getSubtitle = () => {
    if (isNotesGated) {
      return 'Login is required to process long videos and generate complete study guides.';
    }
    if (isPDFGated) {
      return 'Sign in to unlock slide presentations and high-resolution PDF exports.';
    }
    return 'Save notes, flashcards, and export custom slide PDFs.';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--cf-border)] glass p-6 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--cf-accent-dark)] via-indigo-500 to-sky-400" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-[var(--cf-text-muted)] hover:bg-[var(--cf-surface)] hover:text-[var(--cf-text-primary)] transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--cf-accent)] to-indigo-500 text-white shadow-md shadow-[var(--cf-accent)]/20">
              {isPDFGated ? (
                <FileText className="h-6 w-6" />
              ) : isNotesGated ? (
                <ShieldCheck className="h-6 w-6" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--cf-text-primary)] tracking-tight">
                {getTitle()}
              </h3>
              <p className="text-xs text-[var(--cf-text-muted)] mt-0.5">
                {getSubtitle()}
              </p>
            </div>
          </div>

          {isNotesGated && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[var(--cf-accent)]/20 bg-[var(--cf-accent)]/5 p-3 text-xs text-[var(--cf-text-primary)]">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-[var(--cf-accent-dark)]" />
              <div>
                <span className="font-semibold">Login Required to Create Notes: </span>
                Please sign in with your email or 1-Click Google account to generate complete AI study notes.
              </div>
            </div>
          )}

          {isPDFGated && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <FileText className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-semibold">PDF Export Gated: </span>
                Please sign in or register to generate and download slide PDFs.
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 rounded-xl bg-[var(--cf-surface)] p-1 border border-[var(--cf-border)]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[var(--cf-text-primary)] shadow-sm'
                  : 'text-[var(--cf-text-secondary)] hover:text-[var(--cf-text-primary)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-white text-[var(--cf-text-primary)] shadow-sm'
                  : 'text-[var(--cf-text-secondary)] hover:text-[var(--cf-text-primary)]'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={handleRealGoogleSignIn}
              disabled={loading || isGoogleLoading || isGitHubLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--cf-border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--cf-text-primary)] shadow-xs hover:bg-[var(--cf-surface)] hover:border-[var(--cf-border-strong)] transition-all disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleRealGitHubSignIn}
              disabled={loading || isGoogleLoading || isGitHubLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--cf-border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--cf-text-primary)] shadow-xs hover:bg-[var(--cf-surface)] hover:border-[var(--cf-border-strong)] transition-all disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>{isGitHubLoading ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--cf-border)]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-[var(--cf-text-muted)] font-semibold tracking-wider">
                or use email & password
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                  className="w-full rounded-xl border border-[var(--cf-border)] bg-white py-2 pl-9 pr-3 text-xs text-[var(--cf-text-primary)] placeholder-[var(--cf-text-muted)] focus:border-[var(--cf-accent)] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  {passwordsMatch && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" />
                      Passwords match
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      Does not match
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className={`absolute left-3 top-2.5 h-4 w-4 ${passwordsMismatch ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to confirm"
                    className={`w-full rounded-xl border py-2 pl-9 pr-10 text-xs focus:outline-none transition-colors ${
                      passwordsMismatch
                        ? 'border-rose-400 bg-rose-50/50 text-slate-900 focus:border-rose-500 dark:border-rose-500/60 dark:bg-rose-950/20 dark:text-white'
                        : passwordsMatch
                        ? 'border-emerald-400 bg-emerald-50/30 text-slate-900 focus:border-emerald-500 dark:border-emerald-500/60 dark:bg-emerald-950/20 dark:text-white'
                        : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--cf-accent)] to-indigo-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-[var(--cf-accent)]/20 hover:from-[var(--cf-accent-dark)] hover:to-indigo-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? isNotesGated
                        ? 'Sign In & Start Generation'
                        : isPDFGated
                        ? 'Sign In & Generate PDF'
                        : 'Sign In'
                      : isNotesGated
                      ? 'Create Account & Generate Notes'
                      : isPDFGated
                      ? 'Create Account & Generate PDF'
                      : 'Create Free Account'}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setConfirmPassword('');
                  }}
                  className="font-semibold text-[var(--cf-accent-dark)] hover:underline"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setConfirmPassword('');
                  }}
                  className="font-semibold text-[var(--cf-accent-dark)] hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};