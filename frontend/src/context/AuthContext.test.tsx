import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Simple component to consume AuthContext for testing
const TestComponent = () => {
  const { loggedIn, login, logout, register, loading } = useAuth();

  return (
    <div>
      <div data-testid="status">{loading ? 'Loading' : loggedIn ? 'Logged In' : 'Logged Out'}</div>
      <button onClick={() => login('kagiso@wits.ac.za', 'password123')} data-testid="login-btn">
        Login
      </button>
      <button onClick={() => logout()} data-testid="logout-btn">
        Logout
      </button>
      <button onClick={() => register('new@students.wits.ac.za', 'New', '1234567', 'password123')} data-testid="register-btn">
        Register
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.endsWith('/api/auth/me')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Unauthorized' })
        });
      }
      if (url.endsWith('/api/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'mock-jwt-token',
            user: {
              id: 'usr_kagiso',
              email: 'kagiso@wits.ac.za',
              username: 'Admin_Kagiso',
              role: 'ADMIN',
              level: 12,
              currentXP: 2450,
              totalXP: 2450,
              essenceBalance: 350,
              dailyStreakCount: 7,
              streakMultiplier: 1.2,
              eloRating: 1250,
              divisionTier: 'GOLD',
              pvpWins: 34,
              pvpLosses: 12,
              pvpDraws: 2,
              maxStatBudget: 350,
              legendaryCap: 1,
              avatar: 'owl'
            }
          })
        });
      }
      if (url.endsWith('/api/auth/register')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'mock-jwt-token',
            user: {
              id: 'usr_new',
              email: 'new@students.wits.ac.za',
              username: 'New',
              role: 'STUDENT',
              level: 1,
              currentXP: 0,
              totalXP: 0,
              essenceBalance: 100,
              dailyStreakCount: 1,
              streakMultiplier: 1.0,
              eloRating: 1000,
              divisionTier: 'GOLD',
              pvpWins: 0,
              pvpLosses: 0,
              pvpDraws: 0,
              maxStatBudget: 300,
              legendaryCap: 1,
              avatar: 'owl'
            }
          })
        });
      }
      return Promise.reject(new Error(`Unhandled mock fetch: ${url}`));
    }));
  });

  it('throws error if useAuth is used outside provider', () => {
    // Suppress console.error for this specific test since React throws when an error boundary is hit
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });

  it('provides auth state and handles login/logout', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state (after mount effect finishes)
    // Since initAuth is async but we have no local storage, it will finish quickly
    await screen.findByText('Logged Out');

    // Click Login
    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    // Verify logged in
    await screen.findByText('Logged In');

    // Click Logout
    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    // Verify logged out
    await screen.findByText('Logged Out');
  });

  it('handles register', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await screen.findByText('Logged Out');

    // Click Register
    await act(async () => {
      screen.getByTestId('register-btn').click();
    });

    // Verify logged in
    await screen.findByText('Logged In');
  });
});
