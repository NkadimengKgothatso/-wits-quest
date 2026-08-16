# Sprint 1 Full UI Redesign Plan

## 1. Overview
The goal is to implement the new UI designs across the entire WitsQuest application for Sprint 1. The new design language features a warm, academic aesthetic with off-white/cream backgrounds, dark brown text, and orange/green accents. We will restructure the navigation to a four-tab layout (Map, Cards, Battle, Profile) and redesign the core screens. No backend changes are planned yet; this is purely a frontend UI/UX overhaul. 

**Key Directive:** Mobile-first approach. Everything must be well-sized and optimized for mobile screens, while still displaying properly on the web.

## 2. Global Design System & Styling
*   **Color Palette**:
    *   Background: Off-white / Cream (e.g., `#FAF7F2`)
    *   Text/Primary Dark: Deep brown/black (e.g., `#2C221E`)
    *   Primary Accent: Orange/Rust (e.g., `#D37A32`) for active states and primary buttons.
    *   Success Accent: Green (e.g., `#4A7C59`) for verified locations and correct answers.
*   **Typography**: Serif font for main headings (e.g., Playfair Display or similar academic serif), Sans-serif for body text and UI elements.
*   **Components**: 
    *   Card containers will use soft, elevated shadows (neumorphic style).
    *   Pill-shaped buttons for filters and secondary actions.
*   **Responsiveness**: Ensure flexbox/grid layouts naturally adapt to mobile viewports, avoiding overflow and scaling touch targets appropriately.

## 3. Core Navigation Updates
*   **Bottom Navigation**: Update `BottomNav.tsx` to exactly match the 4-tab design:
    1.  **MAP** (Map Pin icon)
    2.  **CARDS** (Stacked Cards icon)
    3.  **BATTLE** (Crossed Swords icon)
    4.  **PROFILE** (User icon)
*   **Routing (`App.tsx`)**: Refactor `SPRINT1_NAV` to default to these four main views. 

## 4. Screen-by-Screen Implementation Plan

### 4.1. Landing Page (`Login.tsx`)
*   **Design**: Split-screen look. Top half shows a stylistic campus node map on a tan background. Bottom half is dark brown with the text "YOUR CAMPUS. YOUR QUEST. YOUR LEGEND."
*   **Actions**: Small "LOG IN" and "SIGN UP" pill buttons in the top right corner.
*   **Mobile Focus**: Ensure the split proportions and font sizes are legible on small screens.

### 4.2. Map View (`MapExplorer.tsx`)
*   **Header**: Update to show "Upper Campus" title, with subtext indicating nearby events.
*   **Map Interface (DEFERRED)**: The actual map rendering and nodes will be left as they are currently. We will only update the surrounding UI (header, tabs, etc.) and tackle the stylized node map in a later phase.

### 4.3. Challenge View (`TriviaModal.tsx` / `EventChallenge`)
*   **Header**: "Event Challenge" and the location name (e.g., "Great Hall").
*   **Status Banner**: Green verification banner ("Location verified - you're within range").
*   **Trivia Interface**:
    *   Question box with XP reward shown (+250 XP).
    *   Large, mobile-friendly selectable option buttons. Correct selection turns green.
    *   "Time Remaining" progress bar at the bottom.

### 4.4. Cards Collection (`CardCollection.tsx`)
*   **Header**: "Collection" with summary text ("14 cards - 3 rare - 1 legendary").
*   **Filters**: Pill-shaped filter row (All, Landmarks, Alumni, History). Must be scrollable horizontally on mobile.
*   **Grid**: Responsive grid of cards (e.g., 2 columns on mobile, expanding on larger screens).
*   **Card Design**: White background, colored outline indicating rarity, icon in the center, specific stats at the bottom corners.

### 4.5. Battle View (`BattleArena.tsx`)
*   **Battle Hub Interface**: The main Battle tab will act as a selection screen where users can choose the type of battle they want to engage in (e.g., AI match or Async Multiplayer).
*   **In-Match UI**:
    *   Header showing round number.
    *   Competitors: "YOU (Naledi M.) VS CPU (Bush Ranger)".
    *   Stat Bars: Horizontal progress bars comparing stats (CHARM, GRANDEUR, INSIGHT).
    *   Action: Large, easily tappable "Pick Charm for this round" button.

### 4.6. Profile View (`Profile.tsx` - NEW)
*   **User Info**: Avatar, Name, Title, and Streak in the center.
*   **Stats Container**: Soft shadowed boxes for total Cards, Wins, and Traits.
*   **Deck Builder Navigation**: Add clear UX (e.g., an "Edit Deck" button or card) within the Profile to navigate to the Deck Builder screen.
*   **Reputation Badges**: A dedicated section displaying unlocked circular badges.

## 5. Admin View Alignment
*   Ensure the Admin mode toggle still works.
*   Update the Admin panels to use the new color scheme (cream/brown) for consistency.
*   Add a "Player Profiles" tab for admins to manage users, mirroring the new Profile view structure.

## 6. Execution Steps
1.  Update global CSS variables in `index.css` to the new palette, ensuring mobile-first media queries.
2.  Refactor `BottomNav` and `App.tsx` routing.
3.  Implement the `Profile` screen and wire up the Deck Builder navigation.
4.  Update the UI surrounding the `MapExplorer` (skipping the map internals).
5.  Update `CardCollection` for mobile grid and styling.
6.  Update `BattleArena` to serve as a battle hub and update the match UI.
7.  Update `Login` and `TriviaModal` screens.
8.  Apply new styling to Admin screens.
