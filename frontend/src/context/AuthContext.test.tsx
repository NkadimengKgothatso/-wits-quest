import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Simple component to consume AuthContext for testing
const TestComponent = () => {
  const { loggedIn, login, logout, register, loading } = useAuth();

  return (
    <div>
      <div data-testid="status">{loading ? 'Loading' : loggedIn ? 'Logged In' : 'Logged Out'}</div>
      <button onClick={() => login('kagiso@students.wits.ac.za')} data-testid="login-btn">
        Login
      </button>
      <button onClick={() => logout()} data-testid="logout-btn">
        Logout
      </button>
      <button onClick={() => register('new@students.wits.ac.za', 'New', '12345')} data-testid="register-btn">
        Register
      </button>
    </div>
  );
};

describe('AuthContext', () => {
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
