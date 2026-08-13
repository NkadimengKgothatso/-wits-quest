import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './screens/Login';
import MapExplorer from './screens/MapExplorer';
import TriviaModal from './screens/TriviaModal';
import CardCollection from './screens/CardCollection';
import DeckBuilder from './screens/DeckBuilder';
import BattleArena from './screens/BattleArena';
import Leaderboard from './screens/Leaderboard';
import RankedMatchmaking from './screens/RankedMatchmaking';
import AdminEvents from './screens/admin/AdminEvents';
import AdminContent from './screens/admin/AdminContent';
import AdminAntiCheat from './screens/admin/AdminAntiCheat';
import BottomNav from './components/BottomNav';
import TopBar from './components/TopBar';

type Screen = 'map' | 'collection' | 'deck' | 'battle' | 'leaderboard' | 'ranked' | string;
type AdminScreen = 'events' | 'content' | 'anticheat';

const ADMIN_NAV: { id: AdminScreen; label: string }[] = [
  { id: 'events', label: 'Spatial Events' },
  { id: 'content', label: 'Question & Card Authoring' },
  { id: 'anticheat', label: 'Anti-Cheat Telemetry' },
];

const SPRINT1_NAV = [
  { id: 'map', label: 'Campus Map' },
  { id: 'battle', label: 'CPU Battle AI' },
  { id: 'ranked', label: 'Ranked Elo' },
  { id: 'collection', label: 'Profile Cards' },
  { id: 'deck', label: 'Deck Builder' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'login', label: 'Login Screen' },
];

// function AppContent() {   uncomment
//   const { loggedIn, loading } = useAuth();

function AppContent() {
  return <MapExplorer />;
  const [screen, setScreen] = useState<Screen>('map');
  const [adminMode, setAdminMode] = useState(false);
  const [adminScreen, setAdminScreen] = useState<AdminScreen>('events');
  const [triviaLandmark, setTriviaLandmark] = useState<any>(null);
  const [cardsEarned, setCardsEarned] = useState(0);

  

  // if (loading) {  uncomment
  //   return (
  //     <div style={{
  //       minHeight: '100vh',
  //       background: '#1d3156',
  //       display: 'flex',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       color: '#fed6ce',
  //       fontFamily: 'Outfit, sans-serif',
  //       fontSize: 16,
  //       fontWeight: 700,
  //     }}>
  //       Initializing Wits Quest...
  //     </div>
  //   );
  // }

  // if (!loggedIn) {
  //   return <Login />;
  // }   uncomment

  return (
    <div style={{ minHeight: '100vh', background: '#1d3156', position: 'relative' }}>
      {/* Top bar */}
      <TopBar onAdminNav={() => setAdminMode(!adminMode)} />

      {adminMode ? (
        /* Admin layout */
        <div style={{ paddingTop: 56, height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Admin nav */}
          <div style={{
            display: 'flex', gap: 0,
            background: 'rgba(17, 30, 54, 0.95)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(164,181,209,0.18)',
            overflowX: 'auto',
          }}>
            {ADMIN_NAV.map((nav) => (
              <button
                key={nav.id}
                onClick={() => setAdminScreen(nav.id)}
                style={{
                  flexShrink: 0,
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  color: adminScreen === nav.id ? '#fed6ce' : '#a4b5d1',
                  borderBottom: `2px solid ${adminScreen === nav.id ? '#fed6ce' : 'transparent'}`,
                  transition: 'all 0.2s',
                }}
              >
                {nav.label}
              </button>
            ))}
            <button
              onClick={() => setAdminMode(false)}
              style={{
                marginLeft: 'auto',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                color: '#a4b5d1',
                fontFamily: 'Outfit, sans-serif',
                flexShrink: 0,
              }}
            >
              ← Player View
            </button>
          </div>

          {/* Admin screen content */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {adminScreen === 'events' && <AdminEvents />}
            {adminScreen === 'content' && <AdminContent />}
            {adminScreen === 'anticheat' && <AdminAntiCheat />}
          </div>
        </div>
      ) : (
        /* Player layout */
        <>
          {/* Mode Pill Switcher Bar */}
          <div style={{
            position: 'fixed', top: 56, left: 0, right: 0, zIndex: 35,
            background: 'rgba(17, 30, 54, 0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(164, 181, 209, 0.15)',
            display: 'flex', gap: 6, padding: '6px 12px', overflowX: 'auto',
          }}>
            {SPRINT1_NAV.map((nav) => (
              <button
                key={nav.id}
                onClick={() => setScreen(nav.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: `1px solid ${screen === nav.id ? '#fed6ce' : 'rgba(164,181,209,0.2)'}`,
                  background: screen === nav.id ? 'rgba(254, 214, 206, 0.18)' : 'rgba(73, 104, 148, 0.2)',
                  color: screen === nav.id ? '#fed6ce' : '#a4b5d1',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {nav.label}
              </button>
            ))}
          </div>

          {/* Screen Content Wrapper */}
          <div style={{ paddingTop: 92, paddingBottom: 70, minHeight: '100vh' }}>
            {screen === 'map' && (
              <MapExplorer onOpenTrivia={(landmark) => setTriviaLandmark(landmark)} />
            )}
            {screen === 'collection' && <CardCollection />}
            {screen === 'deck' && <DeckBuilder />}
            {screen === 'battle' && <BattleArena />}
            {screen === 'leaderboard' && <Leaderboard />}
            {screen === 'ranked' && <RankedMatchmaking />}
            {screen === 'login' && <Login />}
          </div>

          {/* Bottom nav */}
          <BottomNav
            active={screen}
            onNavigate={(s) => setScreen(s as Screen)}
          />

          {/* Trivia modal */}
          {triviaLandmark && (
            <TriviaModal
              landmark={triviaLandmark}
              onClose={() => setTriviaLandmark(null)}
              onCardEarned={() => setCardsEarned((c) => c + 1)}
            />
          )}

          {/* Card earned toast */}
          {cardsEarned > 0 && (
            <div
              style={{
                position: 'fixed',
                top: 100,
                right: 16,
                background: 'rgba(254, 214, 206, 0.2)',
                border: '1px solid rgba(254, 214, 206, 0.5)',
                borderRadius: 10,
                padding: '8px 14px',
                color: '#fed6ce',
                fontSize: 12,
                fontWeight: 700,
                zIndex: 200,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 0 16px rgba(254,214,206,0.3)',
              }}
            >
              {cardsEarned} card{cardsEarned > 1 ? 's' : ''} earned!
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
