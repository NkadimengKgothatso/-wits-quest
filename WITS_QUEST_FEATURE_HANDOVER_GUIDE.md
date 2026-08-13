# Wits Quest (COMS3011A) - Technical Feature Handover & Game Mechanics Guide

> **Document Purpose**: This guide provides a complete explanation of how **Wits Quest** works, its core gameplay mechanics, nearby player challenge interactions, mutual player benefits, student leveling progression, campus leaderboard divisions, and technical specifications for every feature. Team members should reference their assigned features in this guide when taking on implementation tasks.

---

## 1. Complete Game Concept & Gameplay Mechanics

### 1.1 What is Wits Quest?
**Wits Quest** is a location-gated progressive web application (PWA) tailored specifically for the University of the Witwatersrand (Wits). Inspired by *Pokémon GO* and turn-based card strategy games (*Top Trumps*), Wits Quest replaces traditional static campus tours with an interactive, location-gated trivia and collectible card battle experience.

---

### 1.2 How Students Earn Cards
Students acquire collectible cards through four distinct gameplay paths:

1. **Location-Gated Landmark Exploration**:
   - Students physically walk (or simulate movement) across Wits Campus.
   - When within **25 meters** of a campus landmark (e.g., *Great Hall*, *Solomon Mahlangu House*, *Science Stadium*, *Cullen Library*, *Origins Centre*), a location-gated trivia challenge unlocks.
   - Answering the trivia question correctly awards the collectible card corresponding to that landmark.

2. **Battle Match Victories**:
   - Winning CPU battles, Async PvP challenges, or Live WebSocket matches awards XP, Essence currency, and card rewards.

3. **Sequential Quest Trails**:
   - Completing a full chain of campus stops in order (e.g., *Science Stadium* -> *Engineering Block* -> *Medical School*) unlocks a high-rarity trail completion card (e.g., *Quantum Scholar Card*).

4. **Peer Card Trading**:
   - Students can trade duplicate cards with fellow students. The system enforces a **Stat Balance Fairness** check (total stat difference <= 25 points) to ensure trades are fair.

---

### 1.3 How Daily Streaks Work
- **Daily Check-In Window**: Logging into Wits Quest and performing at least 1 verified GPS landmark check-in within a 24-hour window increments the student's **Daily Streak** counter (1 day -> 2 days -> 7 days).
- **Streak Multipliers**:
  - **3-Day Streak**: Grants a +10% XP bonus on all trivia and battle wins.
  - **7-Day Streak**: Grants a +25% XP bonus and awards bonus Essence currency.
- **Streak Reset**: Failing to check in within 24 hours resets the streak counter back to 0.

---

### 1.4 Nearby Player Map Avatars & Challenge Mechanics
- **Real-Time Nearby Player Visibility**: Active Wits students near campus landmarks appear as live player avatars on the GIS map canvas.
- **Tapping Nearby Players**: Clicking on a nearby student's avatar opens an interaction menu with options to:
  1. **Challenge to Live PvP Match**: Real-time card battle via WebSockets.
  2. **Send Async Challenge**: Turn-based challenge with a 24-hour response window.
  3. **Propose P2P Card Trade**: Open card exchange mat.

#### Mutual Player Benefits from PvP Challenges:
- **Challenger (Winner) Benefits**:
  - **Higher XP Rewards**: Earns +420 XP (vs +150 XP for CPU matches).
  - **Elo Rating Points**: Gains +15 to +25 Elo points towards seasonal ladder rank.
  - **Bonus Essence Currency**: Receives Essence shards to spend in the Card Forge.
- **Challenged (Defeated) Player Benefits**:
  - **Consolation XP**: Earns +120 XP for participating (no wasted effort).
  - **Defensive Telemetry**: Receives feedback on which card stat attributes failed, helping them refine their deck strategy.

---

### 1.5 Student Leveling & Progression System
- **XP Acquisition**: XP is earned through landmark trivia, battle victories, streak multipliers, and quest trails.
- **Level Increments**: Filling the XP bar increases the student's Level (Level 1 -> Level 12 -> Level 28).
- **Level Unlock Benefits**:
  - **Deck Stat Budget Upgrades**: Higher levels unlock increased deck stat point caps (e.g., Level 10 unlocks 350 Max Stat Budget).
  - **Campus Titles**: Unlocks explorer titles (*Lv.1 Freshman Explorer*, *Lv.12 Campus Veteran*, *Lv.28 Grandmaster Scholar*).
  - **Ranked Queue Access**: Reaching Level 5 unlocks entry into Ranked Elo Matchmaking.

---

### 1.6 Campus Leaderboard & Division Leagues
- **Campuswide Rankings**: Tracks student players based on Total XP, PvP Wins, Daily Streaks, and Elo Ratings.
- **Division Tiers**:
  - **Bronze**: 0 - 499 Elo / < 10,000 XP
  - **Silver**: 500 - 999 Elo / 10,000 - 20,000 XP
  - **Gold**: 1000 - 1499 Elo / 20,000 - 35,000 XP
  - **Platinum**: 1500 - 1799 Elo / 35,000 - 45,000 XP
  - **Diamond**: 1800+ Elo / > 45,000 XP
- **End-of-Season Rewards**: Top ranked students at the end of a 30-day season receive exclusive Legendary seasonal trophy cards and Essence prize pools.

---

### 1.7 How the Card Combat System Works
- **Deck Construction**: Each player builds a deck of **exactly 5 cards**.
- **Deck Constraints**:
  - **300 Max Stat Budget**: The sum of all stat points across all 5 cards cannot exceed 300 points.
  - **1 Legendary Cap**: Maximum 1 Legendary card allowed per deck.
- **Turn-Based Combat**:
  - A match consists of **5 rounds** (Best of 5).
  - In each round, the active player selects one of 4 stat attributes to challenge:
    - **ATK** (Attack Power)
    - **DEF** (Defense Shielding)
    - **SPD** (Speed Velocity)
    - **BRN** (Brains & Knowledge)
  - The opponent's card attribute is revealed, and the higher stat value wins the round.
  - The player who wins the most rounds wins the match.

---

### 1.8 How Currency, Scrapping & Card Upgrading Work
- **Essence Currency**: Earned from completing trivia, maintaining daily streaks, and winning PvP matches.
- **Card Crafting Forge**: Duplicate cards can be scrapped to earn Essence shards.
- **Stat Upgrades**: Players can combine 2 duplicate cards + 100 Essence shards to upgrade a card's level, permanently boosting all stats (+5 ATK, +5 DEF, +5 SPD, +5 BRN).

---

### 1.9 How Faction Territory Control Works
- Wits Campus is divided into precincts: *East Campus Quadrant*, *West Campus Engineering Zone*, and *Health Sciences Precinct*.
- Winning card battles within a precinct increases your faction's control percentage over that campus zone.

---

## 2. Team Domain Assignments & Task Allocation Matrix

| Team Member | Domain Responsibility | Key Screens & Modules |
| :--- | :--- | :--- |
| **Junior** (Member 1) | Geolocation, GIS & Spatial Engine Lead | `MapExplorer.tsx`, GPS Verification API |
| **Mahlatse** (Member 2) | Battle Engine, AI & Real-Time Multiplayer Lead | `BattleArena.tsx`, `LivePvPArena.tsx`, `AsyncPvP.tsx` |
| **Kgothatso** (Member 3) | Database Architecture, Offline Sync & Auth Lead | `Login.tsx`, ServiceWorker, IndexedDB, Custom JWT Auth |
| **Rea** (Member 4) | Admin Console, Curation & Telemetry Lead | `AdminEvents.tsx`, `AdminContent.tsx`, `AdminCuration.tsx`, `AdminAntiCheat.tsx`, `AdminAnalytics.tsx` |
| **Nontokozo** (Member 5) | Progression Engine, Economy Systems & Trails Lead | `CardCollection.tsx`, `DeckBuilder.tsx`, `Leaderboard.tsx`, `QuestTrails.tsx`, `Trades.tsx`, `CardForge.tsx` |
| **Keoratile** (Member 6) | Advanced Anti-Cheat, Matchmaking & Territory Lead | `TerritoryMap.tsx`, `RankedMatchmaking.tsx`, Velocity Trajectory Engine |

---

## 3. Core Map & Location Verification

### Feature 3.1: Campus Map Explorer & Location Verification
* **Target File**: [MapExplorer.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/MapExplorer.tsx)
* **Assigned Lead**: Member 1
* **Purpose**: Serves as the primary gameplay hub. Renders an interactive Wits GIS map showing active landmark events, user GPS fix, distance calculations, and nearby student player avatars.
* **Key Algorithmic Rules**:
  - Compute distance in meters between user GPS (lat1, lon1) and target landmark (lat2, lon2) using the **Haversine Formula**:
    d = 2 * r * arcsin(sqrt(sin^2((lat2 - lat1)/2) + cos(lat1) * cos(lat2) * sin^2((lon2 - lon1)/2)))
  - Landmark status states:
    - **IN RADIUS**: d <= 25m (Unlocks trivia event).
    - **OUT OF RANGE**: d > 25m (Event locked).

---

## 4. Trivia & Card Inventory Systems

### Feature 4.1: Location-Gated Trivia Engine
* **Target File**: [TriviaModal.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/TriviaModal.tsx)
* **Assigned Lead**: Member 3 & Member 5
* **Purpose**: Educates students on Wits history and academic disciplines while testing location-gated knowledge.

### Feature 4.2: Card Collection Gallery
* **Target File**: [CardCollection.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/CardCollection.tsx)
* **Assigned Lead**: Member 5
* **Purpose**: Inventory gallery showing unlocked collectible cards.

---

## 5. Combat & Strategy Systems

### Feature 5.1: Strategic Deck Builder
* **Target File**: [DeckBuilder.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/DeckBuilder.tsx)
* **Assigned Lead**: Member 5
* **Rule Engine Constraints**: Deck size = 5 cards, 300 Max Stat Cost Limit, 1 Legendary Cap.

### Feature 5.2: Turn-Based CPU Battle Arena
* **Target File**: [BattleArena.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/BattleArena.tsx)
* **Assigned Lead**: Member 2

### Feature 5.3: Async PvP Challenges
* **Target File**: [AsyncPvP.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/AsyncPvP.tsx)
* **Assigned Lead**: Member 2

---

## 6. Progression, Economy & Social Features

### Feature 6.1: Campus Leaderboard
* **Target File**: [Leaderboard.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Leaderboard.tsx)
* **Assigned Lead**: Member 5

### Feature 6.2: Sequential Quest Trails
* **Target File**: [QuestTrails.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/QuestTrails.tsx)
* **Assigned Lead**: Member 5

### Feature 6.3: Peer Card Trading
* **Target File**: [Trades.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/Trades.tsx)
* **Assigned Lead**: Member 5

---

## 7. Advanced Tier Next-Gen Features

### Feature 7.1: Live WebSocket Arena
* **Target File**: [LivePvPArena.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/LivePvPArena.tsx)
* **Assigned Lead**: Member 2

### Feature 7.2: Campus Territory & Zone Control
* **Target File**: [TerritoryMap.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/TerritoryMap.tsx)
* **Assigned Lead**: Member 6

### Feature 7.3: Ranked Elo Seasons
* **Target File**: [RankedMatchmaking.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/RankedMatchmaking.tsx)
* **Assigned Lead**: Member 6

### Feature 7.4: Card Crafting & Stat Forge
* **Target File**: [CardForge.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/CardForge.tsx)
* **Assigned Lead**: Member 5

---

## 8. Lecturer & Admin Governance Console

* **Spatial Event Placement ([AdminEvents.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminEvents.tsx))**
* **Question & Card Authoring ([AdminContent.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminContent.tsx))**
* **Curation Governance Board ([AdminCuration.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminCuration.tsx))**
* **Anti-Cheat Audit Log ([AdminAntiCheat.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminAntiCheat.tsx))**
* **Campus Heatmaps & Telemetry ([AdminAnalytics.tsx](file:///c:/Users/mahla/critical_projects/wits_quest/frontend/src/screens/admin/AdminAnalytics.tsx))**

---

