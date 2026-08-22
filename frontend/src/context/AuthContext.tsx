import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as MockUser, formatUserMeta, setStudentOnlineStatus, Avatar } from '../services/apiClient';

/**
 * AuthContext — manages authentication state for the entire app.
 * 
 * Phase 3 changes:
 *   - login() and register() now call the real backend API
 *   - JWT token is stored in localStorage alongside the user ID
 *   - On startup, the token is validated via GET /api/auth/me
 *   - Falls back to the old mock client if the backend is unreachable
 */

interface AuthContextType {
  currentUser: MockUser | null;
  avatars: Avatar[];
  loggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<MockUser>;
  register: (email: string, name: string, studentNumber: string, password: string) => Promise<MockUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocally: (user: MockUser) => void;
  /** Email pending verification — set after register, cleared after verify */
  pendingEmail: string | null;
  pendingName: string | null;
  pendingPreviewUrl: string | null;
  verifyEmail: (code: string) => Promise<void>;
  clearPendingVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const STORAGE_KEY = 'wits_quest_active_user_id';
const TOKEN_KEY = 'wits_quest_jwt_token';

/** Helper: get stored JWT token */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Helper: build Authorization header from stored token */
export function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Convert a backend user row into the MockUser shape the rest of the app expects */
function backendUserToMockUser(u: Record<string, any>): MockUser {
  return {
    id: u.id,
    email: u.email,
    studentNumber: u.studentNumber || '',
    username: u.username,
    name: u.name || u.username.replace(/_/g, ' '),
    initials: u.initials,
    isOnline: true,
    role: u.role || 'STUDENT',
    level: u.level ?? 1,
    currentXP: u.currentXP ?? 0,
    totalXP: u.totalXP ?? 0,
    essenceBalance: u.essenceBalance ?? 100,
    dailyStreakCount: u.dailyStreakCount ?? 1,
    lastCheckInDate: u.lastCheckInDate || new Date().toISOString(),
    streakMultiplier: u.streakMultiplier ?? 1.0,
    eloRating: u.eloRating ?? 1000,
    divisionTier: u.divisionTier || 'GOLD',
    pvpWins: u.pvpWins ?? 0,
    pvpLosses: u.pvpLosses ?? 0,
    pvpDraws: u.pvpDraws ?? 0,
    maxStatBudget: u.maxStatBudget ?? 300,
    legendaryCap: u.legendaryCap ?? 1,
    avatar: u.avatar || 'owl',
    emailVerified: !!u.emailVerified,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

  // Load persisted session on startup
  useEffect(() => {
    async function initAuth() {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          // Validate token by fetching /api/auth/me
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const user = backendUserToMockUser(data.user);
            const formatted = formatUserMeta(user);
            setStudentOnlineStatus(formatted.id, true);
            setCurrentUser({ ...formatted, isOnline: true });
            setLoggedIn(true);
            setLoading(false);
            return;
          }
          // Token invalid — clear it
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Backend offline — fall through
      }
      setLoading(false);
    }
    initAuth();

    // Fetch avatars
    import('../services/apiClient').then(({ getAvatars }) => {
      getAvatars().then(setAvatars).catch(console.error);
    });
  }, []);

  const refreshUser = async () => {
    if (!currentUser) return;
    try {
      const token = getAuthToken();
      if (token) {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const user = backendUserToMockUser(data.user);
          setCurrentUser(formatUserMeta(user));
          return;
        }
      }
    } catch {
      // fallback below
    }
  };

  const updateUserLocally = (updated: MockUser) => {
    const formatted = formatUserMeta(updated);
    setCurrentUser(formatted);
  };

  /**
   * Login with email + password against the real API.
   * Falls back to mock client if backend is unreachable.
   */
  const login = async (email: string, password: string): Promise<MockUser> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        // If login requires email verification, enter pending mode instead of throwing
        if (err.verificationRequired) {
          setPendingEmail(email);
          setPendingName(null);
          setPendingPreviewUrl(err.previewUrl || null);
          return { id: '', email, username: email.split('@')[0] } as MockUser;
        }
        throw new Error(err.error || 'Login failed');
      }

      const data = await res.json();
      const user = backendUserToMockUser(data.user);

      // Store token and user ID
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(STORAGE_KEY, user.id);

      // If the backend says a verification email was sent, enter pending-verification mode
      if ((data.verificationSent || data.verificationRequired) && !user.emailVerified) {
        setPendingEmail(user.email);
        setPendingName(user.name || user.username);
        setPendingPreviewUrl(data.previewUrl || null);
        // Don't mark as fully logged in yet — the verification screen will handle it
        setCurrentUser(null);
        setLoggedIn(false);
        return user;
      }

      setStudentOnlineStatus(user.id, true);
      const formatted = formatUserMeta({ ...user, isOnline: true });
      setCurrentUser(formatted);
      setLoggedIn(true);
      return formatted;
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      throw new Error('Backend offline. Please start the backend server.');
    }
  };

  /**
   * Register a new student account via the real API.
   */
  const register = async (email: string, name: string, studentNumber: string, password: string): Promise<MockUser> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, studentNumber }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }

      const data = await res.json();

      // If the backend sent a verification email, enter pending-verification mode
      if (data.verificationSent) {
        setPendingEmail(email);
        setPendingName(name);
        setPendingPreviewUrl(data.previewUrl || null);
        // Return a placeholder user object
        return { id: '', email, username: name || email.split('@')[0] } as MockUser;
      }

      const user = backendUserToMockUser(data.user);

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(STORAGE_KEY, user.id);

      setStudentOnlineStatus(user.id, true);
      const formatted = formatUserMeta({ ...user, isOnline: true });
      setCurrentUser(formatted);
      setLoggedIn(true);
      return formatted;
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      throw new Error('Backend offline. Please start the backend server.');
    }
  };

  /**
   * Verify the 6-digit email code.
   * On success, marks the user as verified and completes login.
   */
  const verifyEmail = async (code: string): Promise<void> => {
    if (!pendingEmail) throw new Error('No pending verification email');

    const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail, code }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Verification failed');
    }

    const data = await res.json();
    if (data.token && data.user) {
      // Store the fresh token
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }

      const user = backendUserToMockUser(data.user);
      localStorage.setItem(STORAGE_KEY, user.id);
      setStudentOnlineStatus(user.id, true);
      const formatted = formatUserMeta({ ...user, isOnline: true });
      setCurrentUser(formatted);
      setLoggedIn(true);

      // Clear pending state
      setPendingEmail(null);
      setPendingName(null);
      setPendingPreviewUrl(null);
    }
  };

  const clearPendingVerification = () => {
    setPendingEmail(null);
    setPendingName(null);
    setPendingPreviewUrl(null);
    // Also clear the stored token since the user isn't fully verified
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  const logout = () => {
    if (currentUser) {
      setStudentOnlineStatus(currentUser.id, false);
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        avatars,
        loggedIn,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateUserLocally,
        pendingEmail,
        pendingName,
        pendingPreviewUrl,
        verifyEmail,
        clearPendingVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
