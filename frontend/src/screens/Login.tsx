import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ArrowRight, ArrowLeft } from 'lucide-react';
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

function AuthForm({ mode, onSwitch, onLogin, onBack }: { mode: 'login' | 'register'; onSwitch: (m: 'login' | 'register') => void; onLogin: () => void; onBack: () => void }) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const STUDENT_EMAIL_REGEX = /^\d{7}@students\.wits\.ac\.za$/;
  const ADMIN_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@wits\.ac\.za$/;
  const emailValid = STUDENT_EMAIL_REGEX.test(email) || ADMIN_EMAIL_REGEX.test(email);

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
      setError('Email must be a valid @students.wits.ac.za or @wits.ac.za address');
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
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, name, email.split('@')[0] || '2000000', password);
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
      <div style={{
        padding: '32px 28px',
        borderRadius: 24,
        background: '#ffffff',
        border: '1.5px solid rgba(220, 166, 104, 0.3)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <KuduMascot compact message="" />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { onSwitch(m); setError(''); setConfirmPassword(''); }}
              style={{
                flex: 1, padding: '12px 16px', fontSize: 14, borderRadius: 12, fontWeight: 700,
                background: mode === m ? '#dca668' : 'transparent',
                color: mode === m ? '#1f1608' : '#8b693a',
                border: mode === m ? '2px solid #dca668' : '2px solid rgba(139, 105, 58, 0.2)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, color: '#1f1608', marginBottom: 24, textAlign: 'center' }}>
          {mode === 'login' ? 'Welcome Back, Explorer' : 'Begin Your Quest'}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: 13, color: '#1f1608', fontWeight: 700, display: 'block', marginBottom: 8 }}>Full Name</label>
                <input
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1.5px solid rgba(139, 105, 58, 0.25)',
                    background: '#fcfaf6',
                    color: '#1f1608', outline: 'none',
                  }}
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: 13, color: '#1f1608', fontWeight: 700, display: 'block', marginBottom: 8 }}>Wits Email</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1.5px solid rgba(139, 105, 58, 0.25)',
                  background: '#fcfaf6',
                  color: '#1f1608', outline: 'none', paddingRight: 40,
                }}
                type="email"
                placeholder="email@students.wits.ac.za or @wits.ac.za"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
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
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6, fontWeight: 600 }}>Must be an official @wits.ac.za or @students.wits.ac.za address</p>
            )}
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#1f1608', fontWeight: 700, display: 'block', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1.5px solid rgba(139, 105, 58, 0.25)',
                  background: '#fcfaf6',
                  color: '#1f1608', outline: 'none', paddingRight: 60,
                }}
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
                  color: '#8b693a', fontSize: 12, fontWeight: 800,
                  textTransform: 'uppercase'
                }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ fontSize: 13, color: '#1f1608', fontWeight: 700, display: 'block', marginBottom: 8 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: `1.5px solid ${confirmPassword && password !== confirmPassword ? '#EF4444' : 'rgba(139, 105, 58, 0.25)'}`,
                    background: '#fcfaf6',
                    color: '#1f1608', outline: 'none', paddingRight: 40,
                  }}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                />
                {confirmPassword && (
                  <div style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 14, color: password === confirmPassword ? 'var(--color-success)' : '#EF4444',
                  }}>
                    {password === confirmPassword ? '✓' : '✕'}
                  </div>
                )}
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6, fontWeight: 600 }}>Passwords do not match</p>
              )}
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 12, padding: '12px 16px', color: '#EF4444', fontSize: 13, fontWeight: 700,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%', fontSize: 16, padding: '16px', borderRadius: 12,
              background: 'linear-gradient(135deg, #dca668, #c9a66b)',
              color: '#1f1608', fontWeight: 800, border: 'none', marginTop: 12, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(220, 166, 104, 0.3)',
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{
                  width: 18, height: 18, border: '3px solid rgba(31, 22, 8, 0.3)',
                  borderTopColor: '#1f1608', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
                Authenticating...
              </span>
            ) : mode === 'login' ? 'Enter Campus Quest →' : 'Create Student Account →'}
          </button>
        </form>

        {/* Back Button */}
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onBack}
            aria-label="Back to Welcome"
            style={{
              background: 'rgba(139, 105, 58, 0.08)',
              border: 'none',
              cursor: 'pointer',
              color: '#8b693a', width: 44, height: 44, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 105, 58, 0.16)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 105, 58, 0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
        </div>
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

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Full Screen: Cinematic Ambient Background */}
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

        {view === 'form' ? (
          <AuthForm mode={authMode} onSwitch={setAuthMode} onLogin={() => onLogin?.()} onBack={() => setView('welcome')} />
        ) : (
          /* Main Stage */
          <div className="cinematic-stage" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Centered Rotating Quest Ring with Kudu Mascot */}
          <div
            className={seqStarted ? 'map-reveal' : 'map-hidden'}
            style={{
              position: 'relative',
              width: 210,
              height: 210,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '16px 0',
            }}
          >
            {/* Background Glow */}
            <div
              style={{
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(220, 166, 104, 0.3) 0%, transparent 70%)',
                filter: 'blur(12px)',
                pointerEvents: 'none',
              }}
            />

            {/* Rotating SVG Compass Ring */}
            <svg
              viewBox="0 0 200 200"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                animation: 'rotateRing 20s linear infinite',
                pointerEvents: 'none',
              }}
            >
              {/* Outer Dashed Golden Quest Ring */}
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="rgba(220, 166, 104, 0.45)"
                strokeWidth="1.5"
                strokeDasharray="6 8"
              />
              {/* Secondary Compass Ring */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(248, 242, 232, 0.2)"
                strokeWidth="1"
              />
              {/* Orbiting Golden Star Nodes */}
              <circle cx="100" cy="8" r="4.5" fill="#dca668" style={{ filter: 'drop-shadow(0 0 6px #dca668)' }} />
              <circle cx="192" cy="100" r="3.5" fill="#f8f2e8" />
              <circle cx="100" cy="192" r="4.5" fill="#dca668" style={{ filter: 'drop-shadow(0 0 6px #dca668)' }} />
              <circle cx="8" cy="100" r="3.5" fill="#f8f2e8" />
            </svg>

            {/* Counter-Rotating Inner Ring */}
            <svg
              viewBox="0 0 200 200"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                animation: 'counterRotate 14s linear infinite',
                pointerEvents: 'none',
              }}
            >
              <circle
                cx="100"
                cy="100"
                r="66"
                fill="none"
                stroke="rgba(220, 166, 104, 0.35)"
                strokeWidth="2"
                strokeDasharray="12 28"
              />
            </svg>

            {/* Centered Kudu Mascot */}
            <div
              className={seqStarted ? 'kudu-pop' : 'kudu-hidden'}
              style={{
                position: 'relative',
                zIndex: 10,
                width: 96,
                height: 96,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KuduMascot compact message="" />
            </div>
          </div>

          {/* Clean WitsQuest Title */}
          <div style={{ textAlign: 'center', marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1
              className={seqStarted ? 'tagline-animate' : 'text-hidden'}
              style={{
                fontSize: 'clamp(36px, 7vw, 56px)', 
                fontWeight: 900,
                margin: 0,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                textShadow: '0 4px 24px rgba(0,0,0,0.5)',
              }}
            >
              <span className="gradient-text">WitsQuest</span>
            </h1>
          </div>

          {/* Floating Login Button */}
          <div className={seqStarted ? 'text-reveal-delay-2 floating-btn-wrapper' : 'text-hidden'} style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => { setAuthMode('login'); setView('form'); }}
              className="start-quest-btn"
              aria-label="Start Quest"
            >
              <ArrowRight size={28} strokeWidth={3} />
            </button>
          </div>
        </div>
        )}
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

        .map-hidden { opacity: 0; transform: scale(0.96); }
        .map-reveal {
          animation: mapReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.2s;
        }
        @keyframes mapReveal {
          from { opacity: 0; transform: scale(0.96); filter: blur(6px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }

        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counterRotate {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        .kudu-hidden { opacity: 0; transform: scale(0); }
        .kudu-pop {
          animation: kuduPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 0.4s;
        }
        @keyframes kuduPop {
          0% { opacity: 0; transform: scale(0); }
          55% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
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

        .floating-btn-wrapper {
          animation: textReveal 0.8s ease forwards, floating 4s ease-in-out infinite;
          animation-delay: 3.4s, 4.2s;
          pointer-events: auto;
        }
        @keyframes floating {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .start-quest-btn {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #f5e6cc 0%, #dca668 100%);
          color: #1f1608;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(220, 166, 104, 0.3);
          transition: all 0.25s ease;
        }
        .start-quest-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(220, 166, 104, 0.5);
        }
        .quest-tab {
          flex: 1; padding: 12px 16px; font-size: 14px; border-radius: 8px; font-weight: 700;
          transition: all 0.2s;
          border: 1px solid #ddd; cursor: pointer;
        }
        .quest-tab.active {
          background: #dca668;
          color: white;
          border-color: #dca668;
        }
        .quest-tab.inactive {
          background: #fff;
          color: #666;
        }
        .quest-tab.inactive:hover {
          background: #f9f9f9;
        }

        .quest-input {
          width: 100%; padding: 12px 16px; border-radius: 8px;
          border: 1px solid #ccc;
          background: #fff;
          color: #333; outline: none;
          font-weight: 500; transition: all 0.2s;
        }
        .quest-input:focus {
          border-color: #dca668;
          box-shadow: 0 0 0 2px rgba(220, 166, 104, 0.2);
        }

        .quest-submit {
          width: 100%; font-size: 16px; padding: 16px; border-radius: 8px;
          background: #dca668;
          color: white; font-weight: 800; border: none; margin-top: 12px; cursor: pointer;
          transition: all 0.25s ease;
        }
        .quest-submit:hover:not(:disabled) {
          background: #c9965d;
        }

        .animated-heading {
          color: #1f1608;
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
