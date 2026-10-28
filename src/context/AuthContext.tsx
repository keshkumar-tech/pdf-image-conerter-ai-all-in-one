import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalReason?: string;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (email?: string, name?: string, avatar?: string) => Promise<void>;
  loginWithGitHub: (email?: string, name?: string, avatar?: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (reason?: string, onAuthenticatedCallback?: () => void) => void;
  closeAuthModal: () => void;
  executeWithAuth: (reason: string, callback: () => void) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = 'noteflow_auth_user';
const STORAGE_TOKEN_KEY = 'noteflow_auth_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string | undefined>();
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Restore stored session on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_USER_KEY);
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);

        // Verify session silently with backend
        api.getCurrentUser(storedToken)
          .then((res) => {
            if (res.user) {
              setUser(res.user);
              localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.user));
            }
          })
          .catch(() => {
            // Keep local user if network is offline or token check fails softly
          });
      }
    } catch {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = (authUser: AuthUser, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));
    localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
    setIsAuthModalOpen(false);

    // If there was a pending callback (e.g. PDF generation), execute it immediately
    if (pendingCallback) {
      setTimeout(() => {
        try {
          pendingCallback();
        } catch (e) {
          console.error('Error executing callback after auth:', e);
        }
        setPendingCallback(null);
      }, 300);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    handleAuthSuccess(res.user, res.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register({ name, email, password });
    handleAuthSuccess(res.user, res.token);
  };

  const loginWithGoogle = async (googleEmail?: string, googleName?: string, googleAvatar?: string) => {
    const emailToUse = googleEmail || 'student@gmail.com';
    const nameToUse = googleName || 'Google User';
    const res = await api.loginWithGoogle({
      email: emailToUse,
      name: nameToUse,
      avatar: googleAvatar,
    });
    handleAuthSuccess(res.user, res.token);
  };

  const loginWithGitHub = async (githubEmail?: string, githubName?: string, githubAvatar?: string) => {
    const emailToUse = githubEmail || 'github_user@example.com';
    const nameToUse = githubName || 'GitHub User';
    const res = await api.loginWithGitHub({
      email: emailToUse,
      name: nameToUse,
      avatar: githubAvatar,
    });
    handleAuthSuccess(res.user, res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    setPendingCallback(null);
  };

  const openAuthModal = (reason?: string, onAuthenticatedCallback?: () => void) => {
    setAuthModalReason(reason);
    if (onAuthenticatedCallback) {
      setPendingCallback(() => onAuthenticatedCallback);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  };

  const executeWithAuth = (reason: string, callback: () => void): boolean => {
    if (user) {
      callback();
      return true;
    }
    openAuthModal(reason, callback);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalReason,
        login,
        register,
        loginWithGoogle,
        loginWithGitHub,
        logout,
        openAuthModal,
        closeAuthModal,
        executeWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
