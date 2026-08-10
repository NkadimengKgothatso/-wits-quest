import React, { createContext, useContext, useState, useEffect } from 'react';
import { MockUser, getMockUsers, getMockUserById, insertMockUser, formatUserMeta, setStudentOnlineStatus } from '../services/mockDbClient';

interface AuthContextType {
  currentUser: MockUser | null;
  loggedIn: boolean;
  loading: boolean;
  login: (email: string) => Promise<MockUser>;
  register: (email: string, name: string, studentNumber: string) => Promise<MockUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocally: (user: MockUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'wits_quest_active_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load persisted active user session on startup
  useEffect(() => {
    async function initAuth() {
      try {
        const storedId = localStorage.getItem(STORAGE_KEY);
        if (storedId) {
          const user = await getMockUserById(storedId);
          if (user) {
            setStudentOnlineStatus(user.id, true);
            setCurrentUser({ ...user, isOnline: true });
            setLoggedIn(true);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('[AuthContext] Error restoring session:', err);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const refreshUser = async () => {
    if (!currentUser) return;
    try {
      const updated = await getMockUserById(currentUser.id);
      if (updated) {
        setCurrentUser(updated);
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to refresh user stats:', err);
    }
  };

  const updateUserLocally = (updated: MockUser) => {
    const formatted = formatUserMeta(updated);
    setCurrentUser(formatted);
  };

  const login = async (email: string): Promise<MockUser> => {
    const users = await getMockUsers();
    let target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!target) {
      // If student account not found by exact email, check if email matches kagiso or thabo
      if (email.toLowerCase().includes('kagiso')) {
        target = users.find((u) => u.id === 'usr_kagiso');
      } else if (email.toLowerCase().includes('thabo')) {
        target = users.find((u) => u.id === 'usr_thabo');
      }
    }

    if (!target) {
      // Auto-create user with initial database stats if entering a new Wits email
      const username = email.split('@')[0] || `Student_${Date.now()}`;
      target = await insertMockUser({
        email,
        username,
        level: 1,
        currentXP: 0,
        totalXP: 0,
        essenceBalance: 100,
        dailyStreakCount: 1,
        eloRating: 1000,
        pvpWins: 0,
        pvpLosses: 0,
        pvpDraws: 0,
      });
    }

    setStudentOnlineStatus(target.id, true);
    const formatted = formatUserMeta({ ...target, isOnline: true });
    setCurrentUser(formatted);
    setLoggedIn(true);
    localStorage.setItem(STORAGE_KEY, formatted.id);
    return formatted;
  };

  const register = async (email: string, name: string, studentNumber: string): Promise<MockUser> => {
    const username = name ? name.replace(/\s+/g, '_') : (email.split('@')[0] || 'New_Student');
    const newUser = await insertMockUser({
      email,
      name,
      username,
      studentNumber,
      level: 1,
      currentXP: 0,
      totalXP: 0,
      essenceBalance: 100,
      dailyStreakCount: 1,
      eloRating: 1000,
      pvpWins: 0,
      pvpLosses: 0,
      pvpDraws: 0,
    });

    setStudentOnlineStatus(newUser.id, true);
    const formatted = formatUserMeta({ ...newUser, isOnline: true });
    setCurrentUser(formatted);
    setLoggedIn(true);
    localStorage.setItem(STORAGE_KEY, formatted.id);
    return formatted;
  };

  const logout = () => {
    if (currentUser) {
      setStudentOnlineStatus(currentUser.id, false);
    }
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
