import { useState } from 'react';
import WitsLogo from '../components/WitsLogo';
import KuduMascot from '../components/KuduMascot';

interface LoginProps {
  onLogin: () => void;
}

/* Warm floating dust particles */
const DUST = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: (Math.random() * 4 + 3).toFixed(1),
  delay: (Math.random() * 5).toFixed(1),
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
        background: 'radial-gradient(ellipse at 50% 0%, #6b5630 0%, #54441b 45%, #3d2f12 100%)',
      }}
    >
      {/* Floating golden dust */}
      {DUST.map((d) => (
        <div
          key={d.id}
          className="dust-particle"
          style={{
            top: `${d.top}%`,
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            '--duration': `${d.duration}s`,
            '--delay': `${d.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Soft ambient glow orbs */}
      <div style={{
        position: 'absolute', top: '2%', left: '10%',
        width: 360, height: 360,
        background: 'radial-gradient(circle, rgba(220, 166, 104, 0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', right: '5%',
        width: 320, height: 320,
        background: 'radial-gradient(circle, rgba(232, 201, 154, 0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Hero section */}
      <div className="slide-up text-center mb-5" style={{ position: 'relative', zIndex: 10, maxWidth: 420 }}>
        <div className="float" style={{ display: 'inline-block' }}>
          <WitsLogo width={140} height={160} showText={true} />
        </div>

        <h1 style={{
          fontSize: 28, fontWeight: 800, color: '#f8f2e8',
          margin: '16px 0 6px', letterSpacing: '-0.02em',
        }}>
          Welcome to Wits Quest
        </h1>
        <p style={{ fontSize: 14, color: '#dca668', margin: '0 0 18px', lineHeight: 1.5 }}>
          Explore campus, collect legendary cards, and battle fellow Wits students.
        </p>

        <div className="flex justify-center mb-2">
          <KuduMascot message="Hi there! I'm your kudu guide. Log in to start exploring." />
        </div>
      </div>

      {/* Prominent mode toggle buttons - above the form */}
      <div
        className="slide-up flex gap-3 mb-4"
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}
      >
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(''); }}
            className="btn-peach"
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: 14,
              borderRadius: 12,
              opacity: mode === m ? 1 : 0.7,
              background: mode === m
                ? 'linear-gradient(135deg, #dca668 0%, #c99255 100%)'
                : 'rgba(107, 125, 44, 0.45)',
              color: mode === m ? '#3d2f12' : '#f8f2e8',
              boxShadow: mode === m ? '0 0 24px rgba(220, 166, 104, 0.45)' : 'none',
            }}
          >
            {m === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        ))}
      </div>

      {/* Glassmorphic auth card */}
      <div
        className="glass slide-up w-full"
        style={{ maxWidth: 420, padding: 28, position: 'relative', zIndex: 10, borderRadius: 20, backdropFilter: 'blur(16px)' }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f8f2e8', marginBottom: 18, textAlign: 'center' }}>
          {mode === 'login' ? 'Sign in to your account' : 'Create your student account'}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: 12, color: '#dca668', fontWeight: 600, display: 'block', marginBottom: 6 }}>
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
                <label style={{ fontSize: 12, color: '#dca668', fontWeight: 600, display: 'block', marginBottom: 6 }}>
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
            <label style={{ fontSize: 12, color: '#dca668', fontWeight: 600, display: 'block', marginBottom: 6 }}>
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
                  background: emailValid ? 'rgba(143, 174, 110, 0.25)' : 'rgba(232, 166, 166, 0.25)',
                  border: `1.5px solid ${emailValid ? '#8fae6e' : '#e8a6a6'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: emailValid ? '#8fae6e' : '#e8a6a6', fontWeight: 700
                }}>
                  {emailValid ? '✓' : '✕'}
                </div>
              )}
            </div>
            {email.length > 3 && !emailValid && (
              <p style={{ fontSize: 11, color: '#e8a6a6', marginTop: 4 }}>
                Must be an official @students.wits.ac.za address
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label style={{ fontSize: 12, color: '#dca668', fontWeight: 600, display: 'block', marginBottom: 6 }}>
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
                  color: '#e8c99a', fontSize: 11, fontWeight: 700,
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
              background: 'rgba(232, 166, 166, 0.15)',
              border: '1px solid rgba(232, 166, 166, 0.4)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#e8a6a6',
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
                  width: 16, height: 16, border: '2px solid rgba(84, 68, 27, 0.4)',
                  borderTopColor: '#dca668', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }} />
                Authenticating Student Access...
              </span>
            ) : mode === 'login' ? 'Enter Campus Quest →' : 'Create Wits Student Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#dca668' }}>
          {mode === 'login' ? "New to Wits Quest? " : "Already adventuring? "}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#e8c99a', fontWeight: 700, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Register here' : 'Sign in'}
          </button>
        </p>
      </div>

      {/* Footer Credentials */}
      <p style={{ marginTop: 24, fontSize: 11, color: 'rgba(220, 166, 104, 0.5)', position: 'relative', zIndex: 10, textAlign: 'center' }}>
        Wits Quest v1.0 · Scientia et Labore · University of the Witwatersrand · 2026
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dust-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.35; }
          25% { transform: translateY(-18px) translateX(6px); opacity: 0.7; }
          50% { transform: translateY(-10px) translateX(-6px); opacity: 0.5; }
          75% { transform: translateY(-24px) translateX(4px); opacity: 0.65; }
        }
        .dust-particle {
          position: absolute;
          background: #e8c99a;
          border-radius: 50%;
          pointer-events: none;
          animation: dust-float var(--duration, 4s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
      `}</style>
    </div>
  );
}
