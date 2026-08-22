import { useState, useRef, useEffect } from 'react';
import { Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EmailVerificationProps {
  email: string;
  studentName: string;
  onVerified: () => void;
  onBack: () => void;
  previewUrl?: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function EmailVerification({ email, studentName, onVerified, onBack, previewUrl }: EmailVerificationProps) {
  const { verifyEmail } = useAuth();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const code = digits.join('');

  function handleDigitChange(index: number, value: string) {
    // Only accept single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setDigits(next);
    setError('');
    // Focus the last filled input or the 6th
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleVerify() {
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await verifyEmail(code);
      setVerified(true);
      // Brief celebration, then navigate to the app
      setTimeout(() => onVerified(), 1200);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendMsg('');
    setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to resend');
      }

      const data = await res.json();
      if (data.alreadyVerified) {
        setVerified(true);
        setTimeout(() => onVerified(), 800);
        return;
      }
      setResendMsg('A new code has been sent!');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setResendMsg('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #4a3a18 0%, #322612 40%, #1f1608 100%)',
      }}
    >
      <div
        className="fade-in-up"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '36px 28px',
          borderRadius: 24,
          background: 'var(--color-card-bg, #FAF7F2)',
          border: '2px solid var(--color-border, #e6d2ac)',
          boxShadow: '0 8px 32px rgba(44, 34, 30, 0.15)',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: verified
              ? 'linear-gradient(135deg, #4A7C59, #6b9e6e)'
              : 'linear-gradient(135deg, #d37a32, #a87d4d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          {verified ? (
            <ShieldCheck size={32} color="white" />
          ) : (
            <Mail size={32} color="white" />
          )}
        </div>

        {/* Header */}
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--color-text, #2C221E)' }}>
          {verified ? 'Email Verified!' : 'Verify Your Email'}
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--color-muted, #8a7560)', lineHeight: 1.6 }}>
          {verified
            ? `Welcome aboard, ${studentName}! Your email has been confirmed.`
            : <>We sent a 6-digit code to<br /><strong style={{ color: 'var(--color-text, #2C221E)' }}>{email}</strong></>
          }
        </p>

        {/* Success state */}
        {verified && (
          <div
            style={{
              background: 'rgba(74, 124, 89, 0.1)',
              border: '2px solid rgba(74, 124, 89, 0.3)',
              borderRadius: 12,
              padding: '16px',
              color: '#4A7C59',
              fontWeight: 700,
              fontSize: 15,
              animation: 'fadeInUp 0.4s ease forwards',
            }}
          >
            Entering WitsQuest...
          </div>
        )}

        {/* Code input */}
        {!verified && (
          <>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }} onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  style={{
                    width: 48,
                    height: 56,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 800,
                    fontFamily: "'Courier New', monospace",
                    borderRadius: 12,
                    border: `2px solid ${error ? '#EF4444' : 'var(--color-border, #e6d2ac)'}`,
                    background: 'var(--color-bg, #FAF7F2)',
                    color: 'var(--color-text, #2C221E)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    caretColor: 'var(--color-accent, #d37a32)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = error ? '#EF4444' : 'var(--color-accent, #d37a32)'; }}
                  onBlur={(e) => { e.target.style.borderColor = error ? '#EF4444' : 'var(--color-border, #e6d2ac)'; }}
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  color: '#EF4444',
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={loading || code.length < 6}
              style={{
                width: '100%',
                fontSize: 16,
                padding: '16px',
                borderRadius: 12,
                background: code.length === 6 ? 'var(--color-accent, #d37a32)' : 'var(--color-border, #e6d2ac)',
                color: code.length === 6 ? 'white' : 'var(--color-muted, #8a7560)',
                fontWeight: 800,
                border: 'none',
                cursor: code.length === 6 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>

            {/* Resend */}
            <div style={{ marginTop: 20 }}>
              <button
                onClick={handleResend}
                disabled={resendLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-accent, #d37a32)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  margin: '0 auto',
                }}
              >
                <RefreshCw size={14} className={resendLoading ? 'spin' : ''} />
                {resendLoading ? 'Sending...' : 'Resend code'}
              </button>
              {resendMsg && (
                <p style={{ fontSize: 12, color: '#4A7C59', marginTop: 8, fontWeight: 600 }}>{resendMsg}</p>
              )}
            </div>

            {/* Dev preview link */}
            {previewUrl && (
              <div
                style={{
                  marginTop: 16,
                  padding: '10px 14px',
                  background: 'rgba(107, 125, 44, 0.08)',
                  border: '1px solid rgba(107, 125, 44, 0.2)',
                  borderRadius: 10,
                  fontSize: 11,
                  color: '#6b7d2c',
                  wordBreak: 'break-all',
                }}
              >
                <strong>Dev preview:</strong>{' '}
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6b7d2c' }}>
                  Open test email
                </a>
              </div>
            )}

            {/* Back button */}
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-muted, #8a7560)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                marginTop: 20,
              }}
            >
              &larr; Back to login
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.7s linear infinite; }
      `}</style>
    </div>
  );
}
