import { useState, useEffect } from 'react';
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
import Profile from './screens/Profile';

type Screen = 'map' | 'collection' | 'deck' | 'battle' | 'profile' | 'leaderboard' | 'ranked' | 'login';
type AdminScreen = 'events' | 'content' | 'anticheat' | 'profiles';

const ADMIN_NAV: { id: AdminScreen; label: string }[] = [
  { id: 'events', label: 'Spatial Events' },
  { id: 'content', label: 'Question & Card Authoring' },
  { id: 'anticheat', label: 'Anti-Cheat Telemetry' },
  { id: 'profiles', label: 'Player Profiles' },
];



function AppContent() {
  const { loggedIn, loading, currentUser } = useAuth();
  const [screen, setScreen] = useState<Screen>('map');
  const [adminMode, setAdminMode] = useState(false);
  const [adminScreen, setAdminScreen] = useState<AdminScreen>('events');
  const [triviaLandmark, setTriviaLandmark] = useState<any>(null);
  const [cardsEarned, setCardsEarned] = useState(0);

  useEffect(() => {
    if (loggedIn && currentUser?.role === 'ADMIN') {
      setAdminMode(true);
    }
  }, [loggedIn, currentUser?.role]);

  if (adminMode && currentUser?.role !== 'ADMIN') {
    setAdminMode(false);
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text)',
        fontFamily: 'Playfair Display, serif',
        fontSize: 18,
        fontWeight: 700,
      }}>
        Initializing Wits Quest...
      </div>
    );
  }

  if (!loggedIn) {
    return <Login />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', position: 'relative' }}>
      {/* Top bar */}
      <TopBar adminMode={adminMode} />

      {adminMode ? (
        /* Admin layout */
        <>
          <div style={{ paddingTop: 56, paddingBottom: 70, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {adminScreen === 'events' && <AdminEvents />}
            {adminScreen === 'content' && <AdminContent />}
            {adminScreen === 'anticheat' && <AdminAntiCheat />}
            {adminScreen === 'profiles' && <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text)', fontWeight: 700 }}>Player Profiles Placeholder</div>}
          </div>
          <BottomNav
            active={adminScreen}
            onNavigate={(s) => setAdminScreen(s as AdminScreen)}
            adminMode={true}
          />
        </>
      ) : (
        /* Player layout */
        <>

          {/* Screen Content Wrapper */}
          <div style={{ paddingTop: 56, paddingBottom: 70, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {screen === 'map' && (
              <MapExplorer onOpenTrivia={(landmark: any) => setTriviaLandmark(landmark)} />
            )}
            {screen === 'collection' && <CardCollection onNavigate={(s) => setScreen(s as Screen)} />}
            {screen === 'battle' && <BattleArena />}
            {screen === 'profile' && <Profile onNavigate={(s) => setScreen(s as Screen)} />}
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
