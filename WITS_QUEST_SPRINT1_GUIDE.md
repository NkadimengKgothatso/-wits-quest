# Wits Quest - Sprint 1 Implementation Guide

## 1. Technology Stack Explained Simply

| Technology Layer | Library Name | Plain Language Explanation |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** | Web library that splits the web page into reusable component pieces like maps, forms, and cards. |
| **Language** | **TypeScript** | JavaScript with type rules. It warns you if you pass wrong variables (for example, passing a string when a number is expected). |
| **Build Tool** | **Vite** | Development server that instantly reloads your web browser whenever you save a code file. |
| **Map Renderer** | **Leaflet & React-Leaflet** | Open-source map library that renders Wits campus maps without requiring paid Google Maps credentials. |
| **Icons & Design** | **Lucide-React & Custom CSS** | Provides UI icons and modern HSL dark mode styling defined in [index.css](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/index.css). |
| **Backend Framework** | **Express.js (Node.js)** | Web framework used to build server REST API routes that store and retrieve user data. |
| **Real-time WebSockets**| **Socket.io** | Communication protocol that sends data back and forth instantly between browser and server without reloading the page. |
| **Database System** | **Mock DB Service (`mockDb.ts`)** | In-memory REST service that manages data tables according to relational database schemas. |

---

## 2. Team Member Task Allocations by Name and Implementation Guide

---

### Task Allocation 1: Junior (Geolocation, GIS and Map Lead)
* **Assigned Student**: Junior (Member 1)
* **Target File**: [MapExplorer.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/MapExplorer.tsx)
* **Goal**: Render the Wits campus map with landmark pins, show current student position, and verify if the student is close enough (within 25 meters) to open landmark trivia.

#### Step-by-Step Implementation Instructions:
1. **Render Map Container**:
   Import `MapContainer`, `TileLayer`, and `Marker` from `react-leaflet`. Set initial map coordinates centered on Wits Main Campus: Latitude `-26.1929`, Longitude `28.0305`, Zoom level `17`.
2. **Calculate Distance Using the Haversine Formula**:
   When a user clicks a landmark pin or moves their GPS position, calculate straight-line distance in meters between user position `(lat1, lon1)` and landmark position `(lat2, lon2)` using this formula:
   ```text
   d = 2 * r * arcsin(sqrt(sin^2((lat2 - lat1)/2) + cos(lat1) * cos(lat2) * sin^2((lon2 - lon1)/2)))
   ```
   Where `r = 6371000` meters (Earth radius).
3. **Location State Rules**:
   - If distance `d` is less than or equal to 25 meters: set status to `IN_RADIUS` and display an active **"Start Trivia Challenge"** button.
   - If distance `d` is greater than 25 meters: set status to `OUT_OF_RANGE` and display remaining distance (for example, *"Distance: 85 meters away. Walk closer to unlock"*).

---

### Task Allocation 2: Mahlatse (Combat Engine and Battle AI Lead)
* **Assigned Student**: Mahlatse (Member 2)
* **Target Files**: [BattleArena.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/BattleArena.tsx) and [battleEngine.ts](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/utils/battleEngine.ts)
* **Goal**: Implement turn-based 5-round card attribute combat against an AI opponent.

#### Step-by-Step Implementation Instructions:
1. **Card Stat Attributes**:
   Every card has 4 numerical stat values:
   - **Attack (ATK)**: Physical offense power.
   - **Defense (DEF)**: Defensive shielding.
   - **Speed (SPD)**: Agility and velocity.
   - **Brains (BRN)**: Academic knowledge score.
2. **Match Loop Execution**:
   - Match consists of 5 rounds (Best of 5).
   - In each round, display 1 active player card and 1 AI card.
   - The player selects 1 of the 4 stats to challenge (for example, choosing **Brains**).
   - Compare stat numbers: Player card stat value versus CPU card stat value.
   - Higher value wins the round! If values are equal, the round is a tie.
3. **Match Completion and Rewards**:
   - The first player to win 3 rounds wins the match.
   - Winning awards **+150 XP** and **+50 Essence**.
   - Send HTTP request `POST /api/mock/battle/result` to update profile state on the backend.

---

### Task Allocation 3: Kgothatso (Database Architecture, Auth and Profile Lead)
* **Assigned Student**: Kgothatso (Member 3)
* **Target Files**: [Login.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Login.tsx), [server.ts](file:///c:/Users/mahla/critical_projects/wits_quest/backend/src/server.ts), and [mockDb.ts](file:///c:/Users/mahla/critical_projects/wits_quest/backend/src/services/mockDb.ts)
* **Goal**: Manage user registration, Wits email validation, starter card seeding, and REST backend data persistence.

#### Step-by-Step Implementation Instructions:
1. **Wits Email Validation**:
   When registering a user, verify that email address ends with `@students.wits.ac.za`. Store password as secure hash using `bcrypt`.
2. **Starter Bundle Seeding**:
   Upon new user creation, perform automatic database insertions:
   - Insert user record into `users` table with default values: Level 1, 0 XP, 100 Essence balance, 1000 Elo rating.
   - Insert 5 basic landmark cards into `user_cards` table for that user.
   - Insert 1 default deck configuration into `user_decks` table containing these 5 starter card IDs.
3. **Provide Backend REST API Endpoints**:
   - `GET /api/mock/users`: Fetch all user profiles.
   - `GET /api/mock/users/:id`: Fetch specific user profile details.
   - `GET /api/mock/cards`: Fetch catalog of master landmark cards.
   - `GET /api/mock/users/:id/deck`: Fetch 5-card battle deck for specified user.
   - `POST /api/mock/battle/result`: Update user XP, Essence, and Elo score post match.

---

### Task Allocation 4: Rea (Admin Console and Curation Lead)
* **Assigned Student**: Rea (Member 4)
* **Target Files**: [AdminEvents.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminEvents.tsx) and [AdminContent.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminContent.tsx)
* **Goal**: Provide administrative forms for lecturers and administrators to create new campus landmarks, trivia questions, and collectible cards.

#### Step-by-Step Implementation Instructions:
1. **Landmark Event Authoring**:
   Build input form taking landmark name, campus quadrant, latitude coordinate, longitude coordinate, and radius limit (default 25 meters).
2. **Card Creation Interface**:
   Build form to add new master cards to the database:
   - Card Name (for example, *Cullen Library Rare Archives*).
   - Category (*Science*, *History*, *Landmarks*, *Lifestyle*, *Sports*).
   - Rarity (*Common*, *Rare*, *Epic*, *Legendary*).
   - Base stats: Attack, Defense, Speed, Brains.
   - Send `POST /api/mock/cards` request to add the card to the master card database.

---

### Task Allocation 5: Nontokozo (Progression, Deck Builder and Leaderboard Lead)
* **Assigned Student**: Nontokozo (Member 5)
* **Target Files**: [CardCollection.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/CardCollection.tsx), [DeckBuilder.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/DeckBuilder.tsx), and [Leaderboard.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Leaderboard.tsx)
* **Goal**: Allow students to view their profile and unlocked cards, enforce strict 5-card deck building validation rules, and render campus rankings.

#### Step-by-Step Implementation Instructions:
1. **Student Profile and Card Gallery Display**:
   Render the student profile screen and card gallery in [CardCollection.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/CardCollection.tsx). Students can view their level, total XP, Essence balance, and grid of all unlocked campus cards in `user_cards`. Border colors indicate card rarity (Grey for Common, Blue for Rare, Purple for Epic, Gold for Legendary).
2. **Deck Builder Rule Enforcement**:
   When constructing a deck, validate these rules before saving:
   - **Rule 1**: The deck must contain **exactly 5 cards**.
   - **Rule 2**: Total stat sum across all 5 cards must be **less than or equal to 300** (or user maxStatBudget).
   - **Rule 3**: Maximum **1 Legendary card** permitted per deck.
   - If validation passes, save deck configuration. If validation fails, display error message specifying broken rule.
3. **Campus Leaderboard**:
   Fetch sorted user list from backend and display rankings based on total XP or Elo rating, showing student division badges (Bronze, Silver, Gold, Platinum, Diamond).

---

### Task Allocation 6: Keoratile (Anti-Cheat and Ranked Logic Lead)
* **Assigned Student**: Keoratile (Member 6)
* **Target Files**: [AdminAntiCheat.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminAntiCheat.tsx), [RankedMatchmaking.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/RankedMatchmaking.tsx), and backend speed check handlers.
* **Goal**: Detect GPS spoofing (teleportation across campus), manage anti-cheat telemetry on the Admin site, and calculate Elo rating changes after matches.

#### Step-by-Step Implementation Instructions:
1. **GPS Teleport and Velocity Verification**:
   - Compare consecutive check-in timestamps and coordinates: `distance = Delta d`, `time = Delta t`.
   - Compute velocity: `v = Delta d / Delta t`.
   - If velocity `v` exceeds 15 meters per second (54 kilometers per hour), flag movement as suspicious GPS spoofing.
2. **Admin Site Anti-Cheat Spoofing Management**:
   - Anti-cheat telemetry management is located on the **Admin Console** in [AdminAntiCheat.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminAntiCheat.tsx).
   - Build the Admin Anti-Cheat dashboard where administrators view telemetry logs, inspect flagged GPS speed violations, review student accounts caught spoofing, and manage anti-cheat audit records.
3. **Elo Rating Algorithm**:
   - Compute post-match rating adjustment using:
     ```text
     Delta Elo = K * (S - E)
     ```
     Where `K = 32`, `S = 1` for win or `0` for loss, and `E` is expected win probability based on rating difference between players.

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
5. **Deck Construction Step**:
   Student opens [DeckBuilder.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/DeckBuilder.tsx) and selects 5 cards. Nontokozo's validation logic verifies total stat cost is 300 points or less and contains maximum 1 Legendary card. Valid deck is saved to backend `user_decks`.
6. **Battle Execution Step**:
   Student enters [BattleArena.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/BattleArena.tsx). Mahlatse's battle engine loads configured 5-card deck. Player plays 5 rounds of attribute selection against AI.
7. **Score Update and Persistence Step**:
   Winning player gets +150 XP and +50 Essence. HTTP POST request updates profile in `mockDb.ts`. Student opens [Leaderboard.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Leaderboard.tsx) to see updated position and division tier.

---

## 4. Sprint 1 Deliverables Verification Checklist

- [x] Dependencies installed and running via `npm run dev:backend` and `npm run dev:frontend`.
- [x] Login and registration API functional with student email checks (Kgothatso).
- [x] Leaflet map displaying Wits campus with 25-meter GPS radius verification (Junior).
- [x] Location-gated trivia modal awarding collectible landmark cards.
- [x] Deck builder enforcing 5-card size, 300 stat cap, and 1 Legendary card limit (Nontokozo).
- [x] 5-round card attribute battle arena against AI opponent (Mahlatse).
- [x] Admin console forms for landmark and card creation (Rea).
- [x] Anti-cheat speed verification and Elo calculations (Keoratile).
- [x] Leaderboard rendering student rankings, total XP, and Elo division tiers (Nontokozo).
