import { useState, useEffect } from 'react';
import { Shield, Swords, User, Clock, AlertTriangle, CheckCircle2, ChevronRight, RefreshCw, Zap } from 'lucide-react';
import { getMockUsers, saveMockBattleResult } from '../services/mockDbClient';

type Tab = 'yourturn' | 'waiting' | 'pending' | 'history';

interface AsyncMatch {
  id: string;
  opponentName: string;
  opponentLevel: number;
  currentTurn: string;
  score: string;
  expiresIn: string;
  status: 'YOUR_TURN' | 'WAITING' | 'PENDING' | 'COMPLETED';
  outcome?: 'Win' | 'Loss';
  xpReward?: number;
  defensiveTelemetry?: {
    failedStat: string;
    losingCardName: string;
    winningEnemyCardName: string;
    statDeficit: number;
    adviceMessage: string;
  };
}

const DEFAULT_MATCHES: AsyncMatch[] = [
  {
    id: 'm1',
    opponentName: 'Thabo_Engineer',
    opponentLevel: 4,
    currentTurn: '3/5',
    score: '1-1',
    expiresIn: '8h 14m',
    status: 'YOUR_TURN',
  },
  {
    id: 'm2',
    opponentName: 'Lesedi_Grandmaster',
    opponentLevel: 12,
    currentTurn: '1/5',
    score: '0-0',
    expiresIn: '22h 50m',
    status: 'YOUR_TURN',
  },
  {
    id: 'm3',
    opponentName: 'Sipho_Tactician',
    opponentLevel: 8,
    currentTurn: '4/5',
    score: '2-1',
    expiresIn: '5h 30m',
    status: 'WAITING',
  },
  {
    id: 'm4',
    opponentName: 'Nandi_Khumalo',
    opponentLevel: 9,
    currentTurn: '5/5',
    score: '3-2',
    expiresIn: 'Completed',
    status: 'COMPLETED',
    outcome: 'Win',
    xpReward: 420,
  },
  {
    id: 'm5',
    opponentName: 'Zanele_Hadebe',
    opponentLevel: 11,
    currentTurn: '5/5',
    score: '1-3',
    expiresIn: 'Completed',
    status: 'COMPLETED',
    outcome: 'Loss',
    xpReward: 120,
    defensiveTelemetry: {
      failedStat: 'defense',
      losingCardName: 'Wits Springbok Mascot',
      winningEnemyCardName: 'Great Hall Pillars',
      statDeficit: 40,
      adviceMessage: 'Your Defense failed by 40 points against Great Hall Pillars. Consider upgrading card defense level in the Forge or equipping a higher DEF card.',
    },
  },
];

export default function AsyncPvP() {
  const [tab, setTab] = useState<Tab>('yourturn');
  const [matches, setMatches] = useState<AsyncMatch[]>(DEFAULT_MATCHES);
  const [selectedTelemetry, setSelectedTelemetry] = useState<AsyncMatch['defensiveTelemetry'] | null>(null);
  const [challengeCreatedMessage, setChallengeCreatedMessage] = useState('');

  const yourTurnMatches = matches.filter((m) => m.status === 'YOUR_TURN');
  const waitingMatches = matches.filter((m) => m.status === 'WAITING');
  const pendingMatches = matches.filter((m) => m.status === 'PENDING');
  const historyMatches = matches.filter((m) => m.status === 'COMPLETED');

  function handleCreateChallenge(opponentName: string) {
    const newMatch: AsyncMatch = {
      id: `m_${Date.now()}`,
      opponentName,
      opponentLevel: 7,
      currentTurn: '1/5',
      score: '0-0',
      expiresIn: '23h 59m',
      status: 'WAITING',
    };
    setMatches([newMatch, ...matches]);
    setChallengeCreatedMessage(`Challenge sent to ${opponentName}! (24-hour response window initiated)`);
    setTimeout(() => setChallengeCreatedMessage(''), 4000);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 40% 10%, #253d6a 0%, #1d3156 50%, #0f1a2e 100%)',
      paddingTop: 16,
      paddingBottom: 80,
    }}>
      {/* Title Bar */}
      <div style={{ padding: '14px 16px 0', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={20} color="#fed6ce" /> Async PvP Challenges
        </h2>
        <p style={{ fontSize: 12, color: '#a4b5d1', margin: '0 0 16px' }}>
          Turn-based asynchronous combat with 24-hour turn windows and defensive telemetry feedback.
        </p>
      </div>

      {/* Challenge Toast Notification */}
      {challengeCreatedMessage && (
        <div style={{ padding: '0 16px 12px', maxWidth: 600, margin: '0 auto' }}>
          <div style={{
            background: 'rgba(34, 197, 94, 0.2)',
            border: '1px solid rgba(34, 197, 94, 0.5)',
            borderRadius: 10,
            padding: '8px 12px',
            color: '#4ade80',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <CheckCircle2 size={14} color="#4ade80" />
            <span>{challengeCreatedMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ padding: '0 16px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 6, background: 'rgba(17,30,54,0.6)', padding: 4, borderRadius: 12 }}>
          {[
            { id: 'yourturn', label: 'Your Turn', count: yourTurnMatches.length },
            { id: 'waiting', label: 'Waiting', count: waitingMatches.length },
            { id: 'pending', label: 'Challenges', count: pendingMatches.length },
            { id: 'history', label: 'History', count: historyMatches.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                background: tab === t.id ? 'rgba(254,214,206,0.2)' : 'transparent',
                color: tab === t.id ? '#fed6ce' : '#a4b5d1',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span style={{
                  background: '#fed6ce', color: '#1d3156', borderRadius: '50%',
                  width: 16, height: 16, fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Creator Quick Bar */}
      <div style={{ padding: '0 16px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div className="glass-dark" style={{ padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: '#a4b5d1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="#facc15" /> CHALLENGE A STUDENT:
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => handleCreateChallenge('Thabo_Engineer')}
              style={{
                background: 'rgba(96,165,250,0.2)', border: '1px solid #60a5fa', color: '#60a5fa',
                borderRadius: 8, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}
            >
              + Thabo
            </button>
            <button
              onClick={() => handleCreateChallenge('Lesedi_Grandmaster')}
              style={{
                background: 'rgba(167,139,250,0.2)', border: '1px solid #a78bfa', color: '#a78bfa',
                borderRadius: 8, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}
            >
              + Lesedi
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tab === 'yourturn' && (
          yourTurnMatches.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#a4b5d1', padding: 32, fontSize: 13 }}>No active turns waiting for you.</div>
          ) : (
            yourTurnMatches.map((m) => (
              <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#496894', border: '2px solid #fed6ce', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fed6ce', fontWeight: 800, fontSize: 12 }}>
                    {m.opponentName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{m.opponentName}</div>
                    <div style={{ fontSize: 10, color: '#a4b5d1' }}>Turn {m.currentTurn} · Score {m.score} · {m.expiresIn} left</div>
                  </div>
                </div>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white',
                    border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 800, padding: '8px 14px', cursor: 'pointer',
                  }}
                >
                  PLAY TURN
                </button>
              </div>
            ))
          )
        )}

        {tab === 'waiting' && (
          waitingMatches.map((m) => (
            <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#496894', border: '2px solid #b0cbe6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b0cbe6', fontWeight: 800, fontSize: 12 }}>
                  {m.opponentName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{m.opponentName}</div>
                  <div style={{ fontSize: 10, color: '#a4b5d1' }}>Turn {m.currentTurn} · Score {m.score} · Waiting for move</div>
                </div>
              </div>
              <span style={{ fontSize: 10, color: '#b0cbe6', background: 'rgba(176,203,230,0.15)', padding: '4px 10px', borderRadius: 10, fontWeight: 700 }}>
                {m.expiresIn}
              </span>
            </div>
          ))
        )}

        {tab === 'pending' && (
          pendingMatches.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#a4b5d1', padding: 32, fontSize: 13 }}>No pending challenges.</div>
          ) : (
            pendingMatches.map((m) => (
              <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{m.opponentName}</div>
                  <div style={{ fontSize: 10, color: '#a4b5d1' }}>Challenged you · Lv.{m.opponentLevel}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Accept</button>
                  <button style={{ background: 'rgba(164,181,209,0.2)', color: '#a4b5d1', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Decline</button>
                </div>
              </div>
            ))
          )
        )}

        {tab === 'history' && (
          historyMatches.map((m) => (
            <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{m.opponentName}</div>
                <div style={{ fontSize: 10, color: '#a4b5d1' }}>Score {m.score} · Earned +{m.xpReward} XP</div>
                {m.defensiveTelemetry && (
                  <button
                    onClick={() => setSelectedTelemetry(m.defensiveTelemetry)}
                    style={{
                      marginTop: 6, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)',
                      borderRadius: 6, color: '#f87171', fontSize: 10, fontWeight: 700, padding: '3px 8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <AlertTriangle size={12} color="#f87171" /> View Defensive Telemetry Report
                  </button>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: m.outcome === 'Win' ? '#4ade80' : '#f87171' }}>
                  {m.outcome}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Defensive Telemetry Report Modal */}
      {selectedTelemetry && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 26, 46, 0.85)',
          backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div className="glass-dark slide-up" style={{
            maxWidth: 480, width: '100%', borderRadius: 16, padding: 24,
            border: '2px solid rgba(248, 113, 113, 0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 900, fontSize: 16, marginBottom: 12 }}>
              <AlertTriangle size={20} color="#f87171" /> DEFENSIVE TELEMETRY REPORT
            </div>
            <div style={{ fontSize: 12, color: '#a4b5d1', marginBottom: 16 }}>
              Analysis logged while you were offline. Review card stat vulnerabilities to optimize your deck strategy.
            </div>

            <div style={{ background: 'rgba(17,30,54,0.8)', borderRadius: 10, padding: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>STAT FAILURE DEFICIT</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white', marginTop: 2 }}>
                {selectedTelemetry.losingCardName} ({selectedTelemetry.failedStat.toUpperCase()}) lost by -{selectedTelemetry.statDeficit} pts against {selectedTelemetry.winningEnemyCardName}.
              </div>
            </div>

            <div style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 10, padding: 12, marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: '#60a5fa', fontWeight: 700 }}>STRATEGIC RECOMMENDATION</div>
              <div style={{ fontSize: 12, color: '#93c5fd', marginTop: 4 }}>
                {selectedTelemetry.adviceMessage}
              </div>
            </div>

            <button
              onClick={() => setSelectedTelemetry(null)}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white', border: 'none', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer',
              }}
            >
              CLOSE TELEMETRY REPORT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
