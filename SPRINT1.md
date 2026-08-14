 # Sprint 1

> **Document Purpose**: This guide defines the exact page allocations, functional requirements, and UI/UX responsibilities for each team member in Sprint 1. Each team member is 100% responsible for the design, styling, user interface (UI), user experience (UX), and interactive logic of their assigned pages.

---

## 1. Technology Stack Overview

| Technology Layer | Library Name | Plain Language Explanation |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** | Web library that splits pages into reusable components like maps, forms, and cards. |
| **Language** | **TypeScript** | JavaScript with strict type rules that catch errors before code execution. |
| **Build Tool** | **Vite** | Development server providing fast compilation and instant browser reloads. |
| **Map Renderer** | **Leaflet & React-Leaflet** | Open-source map renderer used to display Wits campus maps without paid Google API keys. |
| **Icons & Design** | **Lucide-React & Custom CSS** | Provides icons and responsive dark mode styling defined in [index.css](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/index.css). |
| **Backend Framework** | **Express.js (Node.js)** | Server framework used to construct REST API endpoints for user profiles and game data. |
| **Real-Time Engine** | **Socket.io** | Communication protocol for low-latency browser-to-server WebSocket events. |
| **Database System** | **Mock DB Service (`mockDb.ts`)** | In-memory service adhering to relational database schemas ([users](file:///c:/Users/mahla/critical_projects/wits_quest/WITS_QUEST_DATABASE_PLAN.md#L99-L126), `cards`, `user_cards`, `user_decks`, `battle_matches`). |

---

## 2. Team Member Page Tagging, Tasks, and UI/UX Responsibilities

---

### Junior (Member 1)
* **Assigned Pages & Modules**:
  - [MapExplorer.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/MapExplorer.tsx)
  - [TriviaModal.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/TriviaModal.tsx)
* **UI and UX Ownership**:
  - **100% Owned by Junior**. Junior is fully responsible for designing the user interface and user experience of the interactive Wits map.
  - Must design and style the full-screen map canvas, custom campus landmark markers, user GPS position indicator, distance meter panel, and location unlock status badges.
  - Must design the popup trivia modal dialog layout, question selection buttons, timer countdown display, and victory celebration feedback when a card is earned.
* **Functional Logic & Integration**:
  - Implement Leaflet `<MapContainer center={[-26.1929, 28.0305]} zoom={17}>` centered on Wits Main Campus.
  - Compute straight-line distance in meters using the **Haversine Formula**:
    $$d = 2 \cdot r \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_1) \cdot \cos(lat_2) \cdot \sin^2\left(\frac{\Delta lon}{2}\right)}\right)$$
  - Enforce the 25-meter radius rule: If distance $d \le 25\text{m}$, unlock the trivia challenge button; otherwise display remaining distance.

---

### Mahlatse (Member 2)
* **Assigned Pages & Modules**:
  - [BattleArena.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/BattleArena.tsx)
  - [battleEngine.ts](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/utils/battleEngine.ts)
  - [battleAI.ts](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/utils/battleAI.ts)
* **UI and UX Ownership**:
  - **100% Owned by Mahlatse**. Mahlatse is fully responsible for designing the user interface and user experience of the card battle stage.
  - Must design the arena stage layout, active player card versus CPU card visual comparison area, 5-round score progression tracker, stat attribute selection buttons (Attack, Defense, Speed, Brains), round result animations, and post-match victory/defeat modal screens.
* **Functional Logic & Integration**:
  - Construct the 5-round (Best of 5) combat loop.
  - In each round, evaluate player chosen stat versus CPU stat: higher value wins the round. First player to win 3 rounds wins the match.
  - Award **+150 XP** and **+50 Essence** on victory.
  - Send HTTP request `POST /api/mock/battle/result` to record match outcome and update backend profile state.

---

### Kgothatso (Member 3)
* **Assigned Pages & Modules**:
  - [Login.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Login.tsx)
  - [server.ts](file:///c:/Users/mahla/critical_projects/wits_quest/backend/src/server.ts)
  - [mockDb.ts](file:///c:/Users/mahla/critical_projects/wits_quest/backend/src/services/mockDb.ts)
  - [AuthContext.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/context/AuthContext.tsx)
* **UI and UX Ownership**:
  - **100% Owned by Kgothatso**. Kgothatso is fully responsible for designing the user interface and user experience of the authentication screen.
  - Must design the login and registration card layout, Wits university logo header, form input fields (email, student number, password), password show/hide toggle, input validation feedback indicators, and error message banners.
* **Functional Logic & Integration**:
  - Validate Wits student email address format (`@students.wits.ac.za`).
  - Hash passwords securely using `bcrypt` and issue JWT authentication tokens.
  - Handle new user registration by automatically seeding 5 starter landmark cards into `user_cards` and creating a default entry in `user_decks`.
  - Maintain session state using LocalStorage and Express REST API endpoints (`/api/mock/users`, `/api/mock/cards`, `/api/mock/users/:id/deck`).

---

### Rea (Member 4)
* **Assigned Pages & Modules**:
  - [AdminEvents.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminEvents.tsx)
  - [AdminContent.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminContent.tsx)
* **UI and UX Ownership**:
  - **100% Owned by Rea**. Rea is fully responsible for designing the user interface and user experience of the lecturer and admin authoring console.
  - Must design the spatial event placement form, landmark coordinate picker UI, question authoring editor, card stat slider controls (ATK, DEF, SPD, BRN), rarity selector, and real-time card preview card.
* **Functional Logic & Integration**:
  - Build landmark placement interface taking landmark title, campus quadrant, latitude/longitude coordinates, and radius limit.
  - Build master card creation interface sending `POST /api/mock/cards` requests to publish new cards to the database catalog.

---

### Nontobeko (Member 5)
* **Assigned Pages & Modules**:
  - [CardCollection.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/CardCollection.tsx)
  - [DeckBuilder.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/DeckBuilder.tsx)
  - [Leaderboard.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Leaderboard.tsx)
* **UI and UX Ownership**:
  - **100% Owned by Nontobeko**. Nontobeko is fully responsible for designing the user interface and user experience of the student profile, collection gallery, deck builder, and leaderboard.
  - Must design the student profile dashboard (level, XP progress bar, Essence currency meter), unlocked card gallery grid, dimmed locked card overlays with unlock requirement banners, collection completion progress bar, 5-card deck builder slots, budget counter meter, and leaderboard rankings table with division badges.
* **Functional Logic & Integration**:
  - Render unlocked versus locked landmark cards with unlock location instructions.
  - Enforce strict 5-card deck validation rules:
    1. **Rule 1**: Must contain **exactly 5 cards**.
    2. **Rule 2**: Total stat sum across all 5 cards **must be $\le 300$** (or player maxStatBudget).
    3. **Rule 3**: Maximum **1 Legendary card** permitted per deck.
  - Render campus leaderboard rankings sorted by `totalXP` or `eloRating`.

---

### Keoratile (Member 6)
* **Assigned Pages & Modules**:
  - [AdminAntiCheat.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminAntiCheat.tsx)
  - [RankedMatchmaking.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/RankedMatchmaking.tsx)
* **UI and UX Ownership**:
  - **100% Owned by Keoratile**. Keoratile is fully responsible for designing the user interface and user experience of the Admin Anti-Cheat telemetry management console and Ranked Matchmaking screen.
  - Must design the Admin Anti-Cheat dashboard featuring flagged GPS speed violation logs, suspicious teleport alert tables, student audit records, and ranked division tier cards (Bronze, Silver, Gold, Platinum, Diamond).
* **Functional Logic & Integration**:
  - Implement GPS teleportation velocity verification: $v = \Delta d / \Delta t$. If velocity $v > 15\text{ m/s}$ (54 km/h), flag movement as suspicious GPS spoofing and record alert in anti-cheat telemetry.
  - Implement post-match Elo score rating algorithm:
    $$\Delta \text{Elo} = K \cdot (S - E)$$
    Where $K = 32$, $S = 1$ (Win) or $0$ (Loss), and $E = \frac{1}{1 + 10^{(Elo_{opp} - Elo_{user})/400}}$.

---

## 3. Complete Step-by-Step Data Flow Integration

The step-by-step lifecycle of a player session in Sprint 1 is structured as follows:

1. **Authentication Step**:
   Student opens frontend application and logs in via [Login.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Login.tsx). Kgothatso's backend code verifies credentials, returns user profile object, and saves JWT token to LocalStorage.
2. **Map Exploration Step**:
   Student opens [MapExplorer.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/MapExplorer.tsx). Junior's map module renders Wits campus map with landmark pins. Geolocation tracks student position.
3. **Distance Verification Step**:
   When student moves near a landmark pin, Haversine formula evaluates straight-line distance. Keoratile's anti-cheat module checks movement velocity. If distance is less than or equal to 25 meters and velocity is normal, the **"Start Trivia Challenge"** button unlocks.
4. **Trivia and Card Unlock Step**:
   Student opens [TriviaModal.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/TriviaModal.tsx) and selects answer. Correct answer adds landmark card to `user_cards` table and triggers celebration toast.
5. **Profile and Card Collection View**:
   Student opens [CardCollection.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/CardCollection.tsx). Nontobeko's collection view shows unlocked cards alongside locked landmark cards with unlock location instructions.
6. **Deck Construction Step**:
   Student opens [DeckBuilder.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/DeckBuilder.tsx) and selects 5 cards. Nontobeko's validation logic verifies total stat cost is 300 points or less and contains maximum 1 Legendary card. Valid deck is saved to backend `user_decks`.
7. **Battle Execution Step**:
   Student enters [BattleArena.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/BattleArena.tsx). Mahlatse's battle engine loads configured 5-card deck. Player plays 5 rounds of attribute selection against AI.
8. **Score Update and Persistence Step**:
   Winning player gets +150 XP and +50 Essence. HTTP POST request updates profile in `mockDb.ts`. Student opens [Leaderboard.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Leaderboard.tsx) to see updated position and division tier.

---

## 4. Sprint 1 Deliverables Verification Checklist

- [x] Dependencies installed and running via `npm run dev:backend` and `npm run dev:frontend`.
- [x] Login and registration API functional with student email checks (Kgothatso - [Login.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Login.tsx)).
- [x] Leaflet map displaying Wits campus with 25-meter GPS radius verification (Junior - [MapExplorer.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/MapExplorer.tsx)).
- [x] Location-gated trivia modal awarding collectible landmark cards ([TriviaModal.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/TriviaModal.tsx)).
- [x] Card collection view with locked card indicators and progress bar (Nontobeko - [CardCollection.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/CardCollection.tsx)).
- [x] Deck builder enforcing 5-card size, 300 stat cap, and 1 Legendary card limit (Nontobeko - [DeckBuilder.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/DeckBuilder.tsx)).
- [x] 5-round card attribute battle arena against AI opponent (Mahlatse - [BattleArena.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/BattleArena.tsx)).
- [x] Admin console forms for landmark placement and card creation (Rea - [AdminEvents.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminEvents.tsx), [AdminContent.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminContent.tsx)).
- [x] Anti-cheat speed verification and Admin telemetry management (Keoratile - [AdminAntiCheat.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminAntiCheat.tsx)).
- [x] Leaderboard rendering student rankings, total XP, and Elo division tiers (Nontobeko - [Leaderboard.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Leaderboard.tsx)).
