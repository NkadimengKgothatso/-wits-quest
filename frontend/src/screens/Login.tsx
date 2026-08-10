import { useState } from 'react';
import WitsLogo from '../components/WitsLogo';

interface LoginProps {
  onLogin: () => void;
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 2 + 1,
  duration: (Math.random() * 3 + 2).toFixed(1),
  delay: (Math.random() * 4).toFixed(1),
}));

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('kagiso@students.wits.ac.za');
  const [password, setPassword] = useState('password123');
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailValid = email.endsWith('@students.wits.ac.za') || email.endsWith('@wits.ac.za');

  function handleSelectQuickAccount(accEmail: string) {
    setEmail(accEmail);
    setPassword('password123');
    setError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) {
      setError('Email must be a valid @students.wits.ac.za address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #253d6a 0%, #1d3156 50%, #0f1a2e 100%)',
      }}
    >
      {/* Background Star Particles */}
      {STARS.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            '--duration': `${s.duration}s`,
            '--delay': `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Atmospheric Ambient Glow Orbs */}
      <div style={{
        position: 'absolute', top: '5%', left: '15%',
        width: 320, height: 320,
        background: 'radial-gradient(circle, rgba(176, 203, 230, 0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: 280, height: 280,
        background: 'radial-gradient(circle, rgba(254, 214, 206, 0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Hero Official Wits University Branding Header */}
      <div className="slide-up text-center mb-6" style={{ position: 'relative', zIndex: 10 }}>
        <WitsLogo width={160} height={180} showText={true} />
      </div>

      {/* Glassmorphic Auth Card */}
      <div
        className="glass slide-up w-full"
        style={{ maxWidth: 420, padding: 28, position: 'relative', zIndex: 10, borderRadius: 20, backdropFilter: 'blur(16px)' }}
      >
        {/* Quick Test Accounts Bar */}
        <div style={{ marginBottom: 16, background: 'rgba(15, 26, 46, 0.7)', borderRadius: 12, padding: 10, border: '1px solid rgba(164,181,209,0.2)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#a4b5d1', marginBottom: 6, letterSpacing: '0.05em' }}>
            QUICK TEST ACCOUNTS (2 PLAYERS FOR TESTING):
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => handleSelectQuickAccount('kagiso@students.wits.ac.za')}
              style={{
                flex: 1, padding: '6px 8px', borderRadius: 8,
                background: email.includes('kagiso') ? 'rgba(254,214,206,0.25)' : 'rgba(73,104,148,0.3)',
                border: `1px solid ${email.includes('kagiso') ? '#fed6ce' : 'rgba(164,181,209,0.2)'}`,
                color: email.includes('kagiso') ? '#fed6ce' : '#a4b5d1',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center',
              }}
            >
              Account 1 (Kagiso)
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuickAccount('thabo@students.wits.ac.za')}
              style={{
                flex: 1, padding: '6px 8px', borderRadius: 8,
                background: email.includes('thabo') ? 'rgba(96,165,250,0.25)' : 'rgba(73,104,148,0.3)',
                border: `1px solid ${email.includes('thabo') ? '#60a5fa' : 'rgba(164,181,209,0.2)'}`,
                color: email.includes('thabo') ? '#60a5fa' : '#a4b5d1',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center',
              }}
            >
              Account 2 (Thabo)
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div
          className="flex mb-4"
          style={{
            background: 'rgba(29, 49, 86, 0.7)',
            borderRadius: 12,
            padding: 4,
          }}
        >
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 12,
                transition: 'all 0.2s',
                background: mode === m ? 'rgba(254, 214, 206, 0.2)' : 'transparent',
                color: mode === m ? '#fed6ce' : '#a4b5d1',
                boxShadow: mode === m ? '0 0 14px rgba(254, 214, 206, 0.25)' : 'none',
              }}
            >
              {m === 'login' ? 'Student Sign In' : 'New Student Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: 11, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  className="input-glass"
                  placeholder="Student Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Student Number
                </label>
                <input
                  className="input-glass"
                  placeholder="2456789"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Student Email Field */}
          <div>
            <label style={{ fontSize: 11, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Wits Student Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-glass"
                type="email"
                placeholder="studentNumber@students.wits.ac.za"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                style={{ paddingRight: 40 }}
              />
              {email.length > 3 && (
                <div style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 18, height: 18, borderRadius: '50%',
                  background: emailValid ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                  border: `1.5px solid ${emailValid ? '#4ade80' : '#f87171'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: emailValid ? '#4ade80' : '#f87171', fontWeight: 700
                }}>
                  {emailValid ? '✓' : '✕'}
                </div>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{ fontSize: 11, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-glass"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 60 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#b0cbe6', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Validation Alert Box */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 10,
              padding: '8px 12px',
              color: '#f87171',
              fontSize: 11,
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-peach mt-2"
            style={{ width: '100%', fontSize: 14, padding: '12px', borderRadius: 10 }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{
                  width: 14, height: 14, border: '2px solid rgba(29,49,86,0.4)',
                  borderTopColor: '#1d3156', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }} />
                Authenticating Access...
              </span>
            ) : mode === 'login' ? 'Enter Campus Quest →' : 'Create Wits Student Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#a4b5d1' }}>
          {mode === 'login' ? "New to Wits Quest? " : "Already adventuring? "}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#fed6ce', fontWeight: 700, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Register here' : 'Sign in'}
          </button>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
