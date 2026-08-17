import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import WitsLogo from '../components/WitsLogo';
import KuduMascot from '../components/KuduMascot';
import { useAuth } from '../context/AuthContext';
interface LoginProps {
  onLogin?: () => void;
}

/* Floating dust particles */
const DUST = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 3.5 + 0.8,
  duration: (Math.random() * 7 + 5).toFixed(1),
  delay: (Math.random() * 8).toFixed(1),
  opacity: (Math.random() * 0.4 + 0.2).toFixed(2),
}));

/* Geographically inspired Wits landmarks (top-down, relative positions) */
const LANDMARKS = [
  { id: 'uncorner', icon: 'store', label: 'University Corner', x: 12, y: 52, delay: 0 },
  { id: 'cullen', icon: 'book', label: 'W. Cullen Library', x: 30, y: 28, delay: 0.55 },
  { id: 'wartenweiler', icon: 'books', label: 'Wartenweiler Library', x: 40, y: 20, delay: 1.1 },
  { id: 'planetarium', icon: 'planet', label: 'Planetarium', x: 66, y: 22, delay: 1.65 },
  { id: 'greathall', icon: 'columns', label: 'Great Hall', x: 48, y: 48, delay: 2.2 },
  { id: 'smhouse', icon: 'tower', label: 'Solomon Mahlangu House', x: 56, y: 56, delay: 2.75 },
  { id: 'sturrock', icon: 'tree', label: 'Sturrock Park', x: 78, y: 44, delay: 3.3 },
  { id: 'clm', icon: 'cap', label: 'Law & Management', x: 62, y: 78, delay: 3.85 },
  { id: 'origins', icon: 'vase', label: 'Origins Centre', x: 24, y: 76, delay: 4.4 },
];

/* Quest trail connecting the landmarks */
const PATH_D = 'M 14 54 L 28 30 L 40 22 L 66 24 L 74 44 L 64 78 L 50 50 L 56 58 L 26 76 Z';

/* Web Audio soundscape */
class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  muted = true;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
  }

  async resume() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master) {
      const now = this.ctx?.currentTime ?? 0;
      this.master.gain.setTargetAtTime(muted ? 0 : 0.45, now, 0.15);
    }
  }

  private now() {
    return this.ctx?.currentTime ?? 0;
  }

  private osc(type: OscillatorType, freq: number, duration: number, gain: number, when: number, fade = 0.03) {
    if (!this.ctx || !this.master || this.muted) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + fade);
    g.gain.exponentialRampToValueAtTime(0.001, when + duration);
    o.connect(g).connect(this.master);
    o.start(when);
    o.stop(when + duration + 0.05);
  }

  ambient() {
    if (!this.ctx || !this.master) return;
    const now = this.now();
    // Low savanna drone
    this.osc('sine', 82, 8, 0.08, now, 1.5);
    this.osc('sine', 123, 8, 0.05, now + 0.2, 1.5);
    // Wind / dust noise
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.025;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    noise.connect(filter).connect(noiseGain).connect(this.master);
    noise.start(now);
  }

  scrollCreak() {
    const now = this.now();
    this.osc('sawtooth', 180, 1.6, 0.04, now, 0.3);
    this.osc('triangle', 220, 1.4, 0.05, now + 0.2, 0.3);
  }

  mapReveal() {
    const now = this.now();
    this.osc('sine', 440, 1.4, 0.04, now, 0.6);
    this.osc('sine', 554, 1.4, 0.03, now + 0.25, 0.5);
  }

  landmark() {
    const notes = [523, 659, 784, 880];
    const note = notes[Math.floor(Math.random() * notes.length)];
    this.osc('sine', note, 0.35, 0.05, this.now(), 0.02);
  }

  pathStep() {
    this.osc('triangle', 320 + Math.random() * 80, 0.12, 0.025, this.now(), 0.01);
  }

  kuduPop() {
    const now = this.now();
    this.osc('sine', 523, 0.25, 0.07, now, 0.03);
    this.osc('sine', 659, 0.35, 0.06, now + 0.08, 0.03);
    this.osc('sine', 784, 0.55, 0.05, now + 0.16, 0.04);
  }

  textReveal() {
    const now = this.now();
    this.osc('sine', 392, 1.2, 0.04, now, 0.4);
    this.osc('sine', 494, 1.2, 0.035, now + 0.3, 0.4);
    this.osc('sine', 587, 1.4, 0.03, now + 0.6, 0.4);
  }
}

function AuthForm({ mode, onSwitch, onLogin }: { mode: 'login' | 'register'; onSwitch: (m: 'login' | 'register') => void; onLogin: () => void }) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentIdError, setStudentIdError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const STUDENT_EMAIL_REGEX = /^\d{7}@students\.wits\.ac\.za$/;
  const emailValid = mode === 'login'
    ? (email.endsWith('@students.wits.ac.za') || email.endsWith('@wits.ac.za'))
    : STUDENT_EMAIL_REGEX.test(email);

  async function handleQuickAccountLogin(accEmail: string) {
    setEmail(accEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      await login(accEmail, 'password123');
      if (onLogin) onLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate user');
    } finally {
      setLoading(false);
    }
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) {
      setError(mode === 'register'
        ? 'Email must be a valid student number, e.g. 1234567@students.wits.ac.za'
        : 'Email must be a valid @students.wits.ac.za address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please provide your full student name');
      return;
    }

    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, name, studentId || '2000000', password);
      } else {
        await login(email, password);
      }
      if (onLogin) onLogin();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in-up" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 20 }}>
      <div style={{ padding: '32px 28px', borderRadius: 24, background: 'var(--color-card-bg)', border: '2px solid var(--color-border)', boxShadow: '0 8px 32px rgba(44, 34, 30, 0.05)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <WitsLogo width={48} height={48} showText={false} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { onSwitch(m); setError(''); }}
              style={{
                flex: 1, padding: '12px 16px', fontSize: 14, borderRadius: 12, fontWeight: 700,
                background: mode === m ? 'var(--color-accent)' : 'transparent',
                color: mode === m ? 'white' : 'var(--color-muted)',
                border: mode === m ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                transition: 'all 0.2s',
              }}
            >
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', marginBottom: 24, textAlign: 'center' }}>
          {mode === 'login' ? 'Welcome Back, Explorer' : 'Begin Your Quest'}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Full Name</label>
                <input style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }} placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Student Number</label>
                <input
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}
                  placeholder="2456789"
                  inputMode="numeric"
                  maxLength={7}
                  value={studentId}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 7);
                    setStudentId(digitsOnly);
                    setEmail(digitsOnly.length > 0 ? `${digitsOnly}@students.wits.ac.za` : '');
                    setError('');
                    setStudentIdError(
                      digitsOnly.length > 0 && digitsOnly.length < 7
                        ? 'Student number must be exactly 7 digits'
                        : ''
                    );
                  }}
                />
                {studentIdError && (
                  <div style={{ fontSize: 12, color: '#EF4444', marginTop: 6, fontWeight: 600 }}>{studentIdError}</div>
                )}
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Wits Student Email</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', paddingRight: 40, opacity: mode === 'register' ? 0.75 : 1, cursor: mode === 'register' ? 'not-allowed' : 'text' }}
                type="email"
                placeholder="studentNumber@students.wits.ac.za"
                value={email}
                readOnly={mode === 'register'}
                onChange={(e) => { if (mode !== 'register') { setEmail(e.target.value); setError(''); } }}
              />
              {email.length > 3 && (
                <div style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 24, height: 24, borderRadius: '50%',
                  background: emailValid ? 'rgba(74, 124, 89, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1.5px solid ${emailValid ? 'var(--color-success)' : '#EF4444'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: emailValid ? 'var(--color-success)' : '#EF4444', fontWeight: 800
                }}>
                  {emailValid ? '✓' : '✕'}
                </div>
              )}
            </div>
            {email.length > 3 && !emailValid && (
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6, fontWeight: 600 }}>Must be an official @students.wits.ac.za address</p>
            )}
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', paddingRight: 60 }}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-muted)', fontSize: 12, fontWeight: 800,
                  textTransform: 'uppercase'
                }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 12, padding: '12px 16px', color: '#EF4444', fontSize: 13, fontWeight: 700,
            }}>
              {error}
            </div>
          )}

          <button type="submit" style={{ width: '100%', fontSize: 16, padding: '16px', borderRadius: 12, background: 'var(--color-accent)', color: 'white', fontWeight: 800, border: 'none', marginTop: 12, cursor: 'pointer' }} disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{
                  width: 18, height: 18, border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
                Authenticating...
              </span>
            ) : mode === 'login' ? 'Enter Campus Quest →' : 'Create Student Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--color-muted)', fontWeight: 600 }}>
          {mode === 'login' ? "New to Wits Quest? " : "Already adventuring? "}
          <button
            onClick={() => { onSwitch(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: 800, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Register here' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function Login({ onLogin }: LoginProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [seqStarted, setSeqStarted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audio = useRef(new AudioEngine());
  const pathDrawRef = useRef<SVGPathElement | null>(null);
  const [view, setView] = useState<'welcome' | 'form'>('welcome');

  // Start animation immediately
  useEffect(() => {
    setSeqStarted(true);
  }, []);

  const toggleSound = async () => {
    await audio.current.resume();
    const next = !soundOn;
    setSoundOn(next);
    audio.current.setMuted(!next);
    if (next) audio.current.ambient();
  };

  if (view === 'form') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-[var(--color-bg)] relative">
        <button
          onClick={() => setView('welcome')}
          style={{ position: 'absolute', top: 24, left: 24, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontWeight: 800, fontSize: 16 }}
        >
          ← Back to Welcome
        </button>
        <AuthForm mode={authMode} onSwitch={setAuthMode} onLogin={() => onLogin?.()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Full Screen: Welcome / Cinematic */}
      <div 
        className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden min-h-screen"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #4a3a18 0%, #322612 40%, #1f1608 100%)' }}
      >
        {/* Floating golden dust */}
        {DUST.map((d) => (
          <div
            key={d.id}
            className="dust-particle"
            style={{
              top: `${d.top}%`, left: `${d.left}%`,
              width: d.size, height: d.size,
              opacity: d.opacity,
              '--duration': `${d.duration}s`, '--delay': `${d.delay}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: '2%', left: '10%', width: 420, height: 420,
          background: 'radial-gradient(circle, rgba(220, 166, 104, 0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '5%', width: 380, height: 380,
          background: 'radial-gradient(circle, rgba(232, 201, 154, 0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Top-right controls (Audio) */}
        <div className="fade-in" style={{ position: 'absolute', top: 16, right: 16, zIndex: 50 }}>
          <button
            onClick={toggleSound}
            aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
            title={soundOn ? 'Sound on' : 'Sound muted'}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(107, 125, 44, 0.45)',
              border: '1px solid rgba(220, 166, 104, 0.3)',
              color: '#f8f2e8', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        <div className="cinematic-stage" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 720, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* WitsQuest header */}
          <div
            className={seqStarted ? 'text-reveal-early' : 'text-hidden'}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
            }}
          >
            <WitsLogo width={42} height={42} showText={false} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: 'clamp(26px, 6vw, 40px)', fontWeight: 900, color: '#f8f2e8',
                letterSpacing: '-0.02em', lineHeight: 1,
                textShadow: '0 2px 14px rgba(0,0,0,0.35)',
              }}>WitsQuest</span>
              <span style={{
                fontSize: 'clamp(10px, 2vw, 12px)', color: '#dca668',
                letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase',
              }}>Campus Adventure</span>
            </div>
          </div>

          {/* Parchment scroll (fast reveal) */}
          <div
            className={seqStarted ? 'scroll-unroll' : 'scroll-hidden'}
            style={{
              width: '100%', aspectRatio: '16 / 9', maxHeight: '40vh',
              background: 'linear-gradient(135deg, #f5e6cc 0%, #e6d2ac 50%, #dcc095 100%)',
              borderRadius: '18px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 0 80px rgba(139, 105, 58, 0.25)',
              position: 'relative', overflow: 'hidden', border: '6px solid #c9a66b',
            }}
          >
            {/* Parchment grain texture */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.12'/%3E%3C/svg%3E")`,
              opacity: 0.4, pointerEvents: 'none',
            }} />
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: 'linear-gradient(90deg, #b08d55, #e6d2ac)', borderRadius: '12px 0 0 12px' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 14, background: 'linear-gradient(270deg, #b08d55, #e6d2ac)', borderRadius: '0 12px 12px 0' }} />

            {/* Map container (fast reveal) */}
            <div className={seqStarted ? 'map-reveal' : 'map-hidden'} style={{ position: 'absolute', inset: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 100 90" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <symbol id="icon-store" viewBox="0 0 24 24">
                    <rect x="3" y="10" width="18" height="10" rx="1" fill="#a87d4d" />
                    <path d="M2 10 L5 4 L19 4 L22 10 Z" fill="#dca668" />
                    <rect x="9" y="14" width="6" height="6" rx="1" fill="#f5e6cc" />
                  </symbol>
                  <symbol id="icon-book" viewBox="0 0 24 24">
                    <path d="M4 6C4 6 8 4 12 6C16 4 20 6 20 6V18C20 18 16 16 12 18C8 16 4 18 4 18V6Z" fill="#6b5630" />
                    <path d="M12 6V18" stroke="#dca668" strokeWidth="1" />
                    <path d="M4 18C4 18 8 20 12 18C16 20 20 18 20 18" stroke="#a87d4d" strokeWidth="1" fill="none" />
                  </symbol>
                  <symbol id="icon-books" viewBox="0 0 24 24">
                    <rect x="5" y="4" width="5" height="16" rx="1" fill="#6b5630" />
                    <rect x="10" y="6" width="5" height="14" rx="1" fill="#a87d4d" />
                    <rect x="15" y="3" width="5" height="17" rx="1" fill="#dca668" />
                  </symbol>
                  <symbol id="icon-planet" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="6" fill="#6b7d2c" />
                    <ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="#dca668" strokeWidth="1.5" transform="rotate(-20 12 12)" />
                    <circle cx="12" cy="12" r="2" fill="#f8f2e8" />
                  </symbol>
                  <symbol id="icon-columns" viewBox="0 0 24 24">
                    <path d="M4 18H20V20H4V18Z" fill="#a87d4d" />
                    <rect x="5" y="8" width="2.5" height="10" fill="#dca668" />
                    <rect x="9" y="8" width="2.5" height="10" fill="#dca668" />
                    <rect x="13" y="8" width="2.5" height="10" fill="#dca668" />
                    <rect x="17" y="8" width="2.5" height="10" fill="#dca668" />
                    <path d="M3 8H21L20 5H4L3 8Z" fill="#6b5630" />
                  </symbol>
                  <symbol id="icon-tower" viewBox="0 0 24 24">
                    <rect x="6" y="5" width="12" height="15" rx="1" fill="#a87d4d" />
                    <rect x="8" y="8" width="3" height="3" fill="#f5e6cc" />
                    <rect x="13" y="8" width="3" height="3" fill="#f5e6cc" />
                    <rect x="8" y="14" width="3" height="3" fill="#f5e6cc" />
                    <rect x="13" y="14" width="3" height="3" fill="#f5e6cc" />
                    <path d="M5 5H19L17 2H7L5 5Z" fill="#6b5630" />
                  </symbol>
                  <symbol id="icon-tree" viewBox="0 0 24 24">
                    <rect x="11" y="16" width="2" height="5" fill="#a87d4d" />
                    <circle cx="12" cy="12" r="6" fill="#6b7d2c" />
                    <circle cx="9" cy="10" r="3" fill="#8fae6e" />
                    <circle cx="15" cy="10" r="3" fill="#8fae6e" />
                  </symbol>
                  <symbol id="icon-cap" viewBox="0 0 24 24">
                    <path d="M12 4L3 9L12 14L21 9L12 4Z" fill="#6b5630" />
                    <path d="M5 10V15C5 15 8 17 12 17C16 17 19 15 19 15V10" fill="none" stroke="#a87d4d" strokeWidth="1.5" />
                    <rect x="18" y="12" width="3" height="5" rx="1" fill="#dca668" />
                  </symbol>
                  <symbol id="icon-vase" viewBox="0 0 24 24">
                    <path d="M8 4C8 4 10 7 10 10C10 13 8 15 8 18C8 20 10 21 12 21C14 21 16 20 16 18C16 15 14 13 14 10C14 7 16 4 16 4H8Z" fill="#a87d4d" />
                    <path d="M9 8H15" stroke="#dca668" strokeWidth="1" />
                    <path d="M9 14H15" stroke="#dca668" strokeWidth="1" />
                  </symbol>
                </defs>

                {/* Grounds / lawns */}
                <rect x="4" y="8" width="92" height="74" rx="6" fill="rgba(107, 125, 44, 0.12)" />

                {/* Ring road loop */}
                <path
                  d="M 10 41 Q 50 6 90 41 Q 50 76 10 41"
                  fill="none" stroke="rgba(168, 125, 77, 0.22)" strokeWidth="1.5" strokeDasharray="2 2"
                />

                {/* Jan Smuts Avenue boundary */}
                <line x1="4" y1="8" x2="4" y2="82" stroke="rgba(107, 86, 48, 0.25)" strokeWidth="1.5" />

                {/* Zone blocks approximating campus buildings */}
                <rect x="26" y="16" width="16" height="10" rx="1.5" fill="rgba(168, 125, 77, 0.22)" />
                <rect x="36" y="12" width="12" height="10" rx="1.5" fill="rgba(168, 125, 77, 0.22)" />
                <rect x="62" y="14" width="14" height="12" rx="1.5" fill="rgba(168, 125, 77, 0.22)" />
                <rect x="44" y="36" width="16" height="14" rx="1.5" fill="rgba(220, 166, 104, 0.25)" />
                <rect x="52" y="48" width="14" height="12" rx="1.5" fill="rgba(168, 125, 77, 0.22)" />
                <rect x="72" y="34" width="12" height="14" rx="1.5" fill="rgba(107, 125, 44, 0.22)" />
                <rect x="58" y="68" width="16" height="10" rx="1.5" fill="rgba(168, 125, 77, 0.22)" />
                <rect x="20" y="68" width="14" height="10" rx="1.5" fill="rgba(168, 125, 77, 0.22)" />

                {/* Central plaza / great lawn */}
                <ellipse cx="50" cy="46" rx="8" ry="6" fill="rgba(107, 125, 44, 0.16)" />

                {/* Quest path */}
                <path
                  d={PATH_D}
                  fill="none"
                  stroke="#f8f2e8"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(248,242,232,0.4))' }}
                />

                {/* Landmarks */}
                {LANDMARKS.map((lm) => (
                  <g key={lm.id} className={seqStarted ? 'landmark-pop' : 'landmark-hidden'} style={{ animationDelay: `${0.4 + lm.delay * 0.15}s` }}>
                    <circle cx={lm.x} cy={lm.y} r="6" fill="#f5e6cc" stroke="#dca668" strokeWidth="0.8" />
                    <use href={`#icon-${lm.icon}`} x={lm.x - 4} y={lm.y - 4} width="8" height="8" />
                    <text x={lm.x} y={lm.y + 11} textAnchor="middle" fontSize="3" fill="#6b5630" fontWeight="700">{lm.label}</text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Kudu at end of path */}
            <div
              className={seqStarted ? 'kudu-pop' : 'kudu-hidden'}
              style={{ position: 'absolute', left: '78%', top: '72%', width: 64, height: 64, transform: 'translate(-50%, -50%)' }}
            >
              <KuduMascot compact message="" />
            </div>
          </div>

          {/* Animated Tagline */}
          <div style={{ textAlign: 'center', marginTop: 32, maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h1
              className={seqStarted ? 'tagline-animate' : 'text-hidden'}
              style={{
                fontSize: 'clamp(28px, 6.5vw, 44px)', 
                fontWeight: 900,
                margin: 0,
                lineHeight: 1.15,
                letterSpacing: '0.02em',
              }}
            >
              <span className="gradient-text">Your Campus.</span>{' '}
              <span className="gradient-text">Your Quest.</span>{' '}
              <span className="gradient-text">Your Legend.</span>
            </h1>
            <p
              className={seqStarted ? 'tagline-sub-animate' : 'text-hidden'}
              style={{
                fontSize: 'clamp(14px, 3vw, 16px)', 
                color: '#e6d2ac',
                margin: 0,
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              Step into the shoes of a Witsie. Discover hidden lore, conquer challenges, and write your name in the halls of history.
            </p>
          </div>

          {/* Sign Up & Sign In Buttons */}
          <div className={seqStarted ? 'text-reveal-delay-2' : 'text-hidden'} style={{ marginTop: 32, width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              onClick={() => { setAuthMode('register'); setView('form'); }}
              style={{ width: '100%', fontSize: 16, padding: '16px', borderRadius: 16, background: '#dca668', color: '#1f1608', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 0 32px rgba(220,166,104,0.4)', transition: 'all 0.2s' }}
            >
              Create Student Account →
            </button>
            <button
              onClick={() => { setAuthMode('login'); setView('form'); }}
              style={{ background: 'none', border: 'none', color: '#f8f2e8', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: 0.9 }}
            >
              Already adventuring? <span style={{ color: '#dca668', textDecoration: 'underline' }}>Sign in here</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dust-float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-24px) translateX(8px); }
          50% { transform: translateY(-16px) translateX(-8px); }
          75% { transform: translateY(-30px) translateX(6px); }
        }
        .dust-particle {
          position: absolute; background: #e8c99a; border-radius: 50%;
          pointer-events: none;
          animation: dust-float var(--duration, 6s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 1s ease forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in-up { animation: fadeInUp 0.5s ease forwards; }

        .scroll-hidden { transform: scaleX(0) scaleY(0.92); opacity: 0; }
        .scroll-unroll {
          animation: scrollUnroll 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.2s;
        }
        @keyframes scrollUnroll {
          0% { transform: scaleX(0) scaleY(0.88); opacity: 0; }
          50% { transform: scaleX(1) scaleY(0.88); opacity: 1; }
          80% { transform: scaleX(1) scaleY(0.96); }
          100% { transform: scaleX(1) scaleY(1); opacity: 1; }
        }

        .map-hidden { opacity: 0; }
        .map-reveal {
          animation: mapReveal 1s ease forwards;
          animation-delay: 1.2s;
        }
        @keyframes mapReveal {
          from { opacity: 0; transform: scale(0.94); filter: blur(4px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }

        .landmark-hidden { opacity: 0; transform: scale(0); }
        .landmark-pop {
          transform-origin: center;
          animation: landmarkPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes landmarkPop {
          0% { opacity: 0; transform: scale(0); }
          60% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .kudu-hidden { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        .kudu-pop {
          animation: kuduPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 2.2s;
        }
        @keyframes kuduPop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          55% { opacity: 1; transform: translate(-50%, -50%) scale(1.25); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        .text-hidden { opacity: 0; transform: translateY(16px); pointer-events: none; }
        .text-reveal-early {
          animation: textReveal 0.8s ease forwards;
          animation-delay: 0.4s;
        }
        .text-reveal {
          animation: textReveal 0.8s ease forwards;
          animation-delay: 2.4s;
        }
        .text-reveal-delay {
          animation: textReveal 0.8s ease forwards;
          animation-delay: 2.8s;
        }
        .text-reveal-delay-2 {
          animation: textReveal 0.8s ease forwards;
          animation-delay: 3.4s;
          pointer-events: auto;
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gradient-text {
          background: linear-gradient(to right, #f8f2e8 0%, #dca668 50%, #f8f2e8 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 4s linear infinite;
        }
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
        
        .tagline-animate {
          animation: slideUpFade 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: 2.6s;
        }
        .tagline-sub-animate {
          animation: slideUpFade 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: 3s;
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
