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
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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
        throw new Error(err.error || 'Login failed');
      }

      const data = await res.json();
      const user = backendUserToMockUser(data.user);

      // Store token and user ID
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
