import { useState, useEffect } from 'react';
import { Shield, Swords, User, Clock, AlertTriangle, CheckCircle2, RefreshCw, Zap, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  MockUser,
  MockAsyncChallenge,
  getMockAsyncChallenges,
  createMockAsyncChallenge,
  updateMockAsyncChallenge,
  saveMockBattleResult,
} from '../services/mockDbClient';
import StudentOpponentDrawer from '../components/StudentOpponentDrawer';

type Tab = 'yourturn' | 'waiting' | 'pending' | 'history';

export default function AsyncPvP() {
  const { currentUser: authUser, updateUserLocally } = useAuth();
  const currentUser = authUser
    ? { id: authUser.id, username: authUser.username }
    : { id: 'usr_thabo', username: 'Thabo_Engineer' };

  const [tab, setTab] = useState<Tab>('yourturn');
  const [matches, setMatches] = useState<MockAsyncChallenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedTelemetry, setSelectedTelemetry] = useState<MockAsyncChallenge['defensiveTelemetry'] | null>(null);
  const [challengeCreatedMessage, setChallengeCreatedMessage] = useState('');
  const [activeTurnMatch, setActiveTurnMatch] = useState<MockAsyncChallenge | null>(null);

  // Load database async challenges for active user
  const loadAsyncMatches = async () => {
    setLoading(true);
    const data = await getMockAsyncChallenges(currentUser.id);
    setMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAsyncMatches();
  }, [currentUser.id]);

  const yourTurnMatches = matches.filter((m) => m.status === 'YOUR_TURN');
  const waitingMatches = matches.filter((m) => m.status === 'WAITING');
  const pendingMatches = matches.filter((m) => m.status === 'PENDING');
  const historyMatches = matches.filter((m) => m.status === 'COMPLETED');

  // Handle challenge creation from StudentOpponentDrawer
  async function handleSelectStudentToChallenge(student: MockUser) {
    setIsDrawerOpen(false);
    await createMockAsyncChallenge(currentUser.id, student.id);
    setChallengeCreatedMessage(`Challenge sent to ${student.name || student.username}! (24-hour response window active)`);
    setTimeout(() => setChallengeCreatedMessage(''), 5000);
    await loadAsyncMatches();
    setTab('waiting');
  }

  // Play turn logic
  function handlePlayTurn(match: MockAsyncChallenge, statPicked: string) {
    const isWinner = Math.random() > 0.4;
    const outcome = isWinner ? 'Win' : 'Loss';
    const xpReward = isWinner ? 150 : -30;

    updateMockAsyncChallenge(match.id, {
      currentRound: match.currentRound + 1,
      score: isWinner ? '2-1' : '1-2',
      status: 'COMPLETED',
      outcome: outcome as 'Win' | 'Loss',
      xpReward,
    });

    setActiveTurnMatch(null);
    loadAsyncMatches();
    setTab('history');

    // Save database battle result
    saveMockBattleResult({
      userId: currentUser.id,
      matchType: 'ASYNC_PVP',
      opponentId: match.challengerId === currentUser.id ? match.defenderId : match.challengerId,
      outcome: isWinner ? 'win' : 'lose',
      xpAwarded: xpReward,
      essenceAwarded: isWinner ? 30 : 0,
      eloDelta: isWinner ? 25 : -25,
    }).then((updatedUser) => {
      if (updatedUser) updateUserLocally(updatedUser);
    });
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
          <Shield size={20} color="#fed6ce" /> Async PvP Arena
        </h2>
        <p style={{ fontSize: 12, color: '#a4b5d1', margin: '0 0 16px' }}>
          Turn-based asynchronous combat with 24-hour response windows and defensive telemetry feedback.
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
      <div style={{ padding: '0 16px 14px', maxWidth: 600, margin: '0 auto' }}>
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

      {/* Challenge Opponent Button */}
      <div style={{ padding: '0 16px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div className="glass-dark" style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(254, 214, 206, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#facc15" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'white' }}>CHALLENGE CAMPUS STUDENT</div>
              <div style={{ fontSize: 10, color: '#a4b5d1' }}>Pick any registered student from database</div>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(254,214,206,0.25), rgba(73,104,148,0.4))',
              border: '1px solid #fed6ce',
              color: '#fed6ce',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 0 12px rgba(254,214,206,0.25)',
              transition: 'all 0.2s',
            }}
          >
            <Search size={14} />
            <span>Choose Opponent</span>
          </button>
        </div>
      </div>

      {/* Student Directory Side Drawer */}
      <StudentOpponentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentUserId={currentUser.id}
        onSelectStudent={handleSelectStudentToChallenge}
      />

      {/* Main Content Area */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#a4b5d1', padding: 32, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RefreshCw size={16} className="spin" /> Loading database challenges...
          </div>
        ) : (
          <>
            {tab === 'yourturn' && (
              yourTurnMatches.length === 0 ? (
                <div className="glass-dark" style={{ padding: 28, borderRadius: 14, textAlign: 'center', color: '#a4b5d1', fontSize: 13 }}>
                  No active turns waiting for you. Click <b>"Choose Opponent"</b> to initiate a challenge!
                </div>
              ) : (
                yourTurnMatches.map((m) => {
                  const oppName = m.challengerId === currentUser.id ? m.defenderName : m.challengerName;
                  return (
                    <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #496894, #1d3156)', border: '2px solid #fed6ce', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fed6ce', fontWeight: 800, fontSize: 12 }}>
                          {oppName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{oppName}</div>
                          <div style={{ fontSize: 10, color: '#a4b5d1' }}>Round {m.currentRound}/{m.maxRounds} · Score {m.score} · {m.expiresIn} left</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTurnMatch(m)}
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white',
                          border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 800, padding: '8px 14px', cursor: 'pointer',
                        }}
                      >
                        PLAY TURN
                      </button>
                    </div>
                  );
                })
              )
            )}

            {tab === 'waiting' && (
              waitingMatches.length === 0 ? (
                <div className="glass-dark" style={{ padding: 28, borderRadius: 14, textAlign: 'center', color: '#a4b5d1', fontSize: 13 }}>
                  No challenges currently waiting for opponent response.
                </div>
              ) : (
                waitingMatches.map((m) => {
                  const oppName = m.challengerId === currentUser.id ? m.defenderName : m.challengerName;
                  return (
                    <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1d3156', border: '2px solid #60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 800, fontSize: 12 }}>
                          {oppName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{oppName}</div>
                          <div style={{ fontSize: 10, color: '#a4b5d1' }}>Round {m.currentRound}/{m.maxRounds} · Score {m.score} · Waiting for opponent turn</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: '#60a5fa', background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', padding: '4px 10px', borderRadius: 10, fontWeight: 700 }}>
                        {m.expiresIn}
                      </span>
                    </div>
                  );
                })
              )
            )}

            {tab === 'pending' && (
              pendingMatches.length === 0 ? (
                <div className="glass-dark" style={{ padding: 28, borderRadius: 14, textAlign: 'center', color: '#a4b5d1', fontSize: 13 }}>
                  No pending inbound challenge requests.
                </div>
              ) : (
                pendingMatches.map((m) => (
                  <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{m.challengerName}</div>
                      <div style={{ fontSize: 10, color: '#a4b5d1' }}>Challenged you to Async PvP · Lv.{m.defenderLevel}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handlePlayTurn(m, 'attack')}
                        style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setMatches(matches.filter((x) => x.id !== m.id))}
                        style={{ background: 'rgba(164,181,209,0.2)', color: '#a4b5d1', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {tab === 'history' && (
              historyMatches.length === 0 ? (
                <div className="glass-dark" style={{ padding: 28, borderRadius: 14, textAlign: 'center', color: '#a4b5d1', fontSize: 13 }}>
                  No completed async match history logged yet.
                </div>
              ) : (
                historyMatches.map((m) => {
                  const oppName = m.challengerId === currentUser.id ? m.defenderName : m.challengerName;
                  return (
                    <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{oppName}</div>
                        <div style={{ fontSize: 10, color: '#a4b5d1' }}>Score {m.score} · {m.xpReward && m.xpReward > 0 ? `Earned +${m.xpReward} XP` : `Lost ${m.xpReward} XP`}</div>
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
                          {m.outcome === 'Win' ? 'VICTORY' : 'DEFEAT'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </>
        )}
      </div>

      {/* Play Turn Modal */}
      {activeTurnMatch && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 26, 46, 0.85)',
          backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div className="glass-dark slide-up" style={{ maxWidth: 450, width: '100%', borderRadius: 16, padding: 24, border: '1.5px solid #fed6ce' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: 'white', margin: '0 0 4px' }}>
              Play Turn vs {activeTurnMatch.challengerId === currentUser.id ? activeTurnMatch.defenderName : activeTurnMatch.challengerName}
            </h3>
            <p style={{ fontSize: 11, color: '#a4b5d1', margin: '0 0 16px' }}>
              Choose a card stat attribute to play for Round {activeTurnMatch.currentRound}:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { stat: 'attack', label: 'ATTACK', val: 90, color: '#f87171' },
                { stat: 'defense', label: 'DEFENSE', val: 95, color: '#60a5fa' },
                { stat: 'speed', label: 'SPEED', val: 85, color: '#facc15' },
                { stat: 'brains', label: 'BRAINS', val: 90, color: '#a78bfa' },
              ].map((s) => (
                <button
                  key={s.stat}
                  onClick={() => handlePlayTurn(activeTurnMatch, s.stat)}
                  style={{
                    background: 'rgba(73, 104, 148, 0.35)', border: `1.5px solid ${s.color}40`,
                    borderRadius: 12, padding: 12, color: 'white', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, color: s.color }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 900 }}>{s.val}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveTurnMatch(null)}
              style={{
                width: '100%', background: 'rgba(164,181,209,0.2)', color: '#a4b5d1',
                border: 'none', borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1.2s linear infinite; }`}</style>
    </div>
  );
}
