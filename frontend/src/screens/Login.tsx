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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailValid = email.endsWith('@students.wits.ac.za') || email.endsWith('@wits.ac.za');

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
    }, 1200);
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

        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50">
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fed6ce' }} />

        </div>
      </div>

      {/* Glassmorphic Auth Card */}
      <div
        className="glass slide-up w-full"
        style={{ maxWidth: 420, padding: 32, position: 'relative', zIndex: 10, borderRadius: 20, backdropFilter: 'blur(16px)' }}
      >
        {/* Mode Selector Tabs */}
        <div
          className="flex mb-6"
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
                padding: '10px 12px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  className="input-glass"
                  placeholder="Kagiso Mthembu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>
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
            <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>
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
                  width: 20, height: 20, borderRadius: '50%',
                  background: emailValid ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                  border: `1.5px solid ${emailValid ? '#4ade80' : '#f87171'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: emailValid ? '#4ade80' : '#f87171', fontWeight: 700
                }}>
                  {emailValid ? '✓' : '✕'}
                </div>
              )}
            </div>
            {email.length > 3 && !emailValid && (
              <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>
                Must be an official @students.wits.ac.za address
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>
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
                  color: '#b0cbe6', fontSize: 11, fontWeight: 700,
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
              padding: '10px 14px',
              color: '#f87171',
              fontSize: 12,
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-peach mt-2"
            style={{ width: '100%', fontSize: 15, padding: '14px', borderRadius: 10 }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(29,49,86,0.4)',
                  borderTopColor: '#1d3156', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }} />
                Authenticating Student Access...
              </span>
            ) : mode === 'login' ? 'Enter Campus Quest →' : 'Create Wits Student Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#a4b5d1' }}>
          {mode === 'login' ? "New to Wits Quest? " : "Already adventuring? "}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#fed6ce', fontWeight: 700, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Register here' : 'Sign in'}
          </button>
        </p>
      </div>

      {/* Footer Credentials */}
      <p style={{ marginTop: 24, fontSize: 11, color: 'rgba(164, 181, 209, 0.5)', position: 'relative', zIndex: 10, textAlign: 'center' }}>
        Wits Quest v1.0 · Scientia et Labore · University of the Witwatersrand · 2026
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
