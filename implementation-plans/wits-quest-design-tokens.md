Act as a Principal Product UI/UX Designer. Create high-fidelity wireframes and UI mockups for "Wits Quest" — a location-based progressive web app (PWA) combining campus GIS exploration, anime RPG card collection, and administrative governance for the University of the Witwatersrand (Wits).

### 🎨 Visual Design Tokens & Palette System

- Theme: Dark Mode Anime Realism (Makoto Shinkai twilight sky aesthetic).
- Surface System: Glassmorphism panels (opacity 75%, backdrop blur 12px, border radius 16px).
- Color Palette:
  - Primary Base Background: #1d3156 (Midnight Navy)
  - Glass Containers & Cards: #496894 (Steel Slate)
  - Borders & Secondary Text: #a4b5d1 (Periwinkle Ice)
  - Interactive Highlights & Radius Circles: #b0cbe6 (Sky Blue)
  - Hero Accent & Energy Glow: #fed6ce (Sunset Peach)
- Typography: Outfit or Plus Jakarta Sans. Clean, high-contrast white headers.

---

### SECTION 1: PLAYER-FACING SCREENS (SCREENS 1 TO 10)

#### PAGE 1: Auth & Student Registration Mockup (/login & /register)

- Wireframe Layout: Single-column centered container over a atmospheric Wits campus vector illustration.
- Features & Components:
  1. Header Logo Banner: Wits Quest branding logo and tagline.
  2. Student Email Input: Field with @students.wits.ac.za domain auto-validation indicator.
  3. Password Field: Input with show/hide password toggle icon.
  4. Submit Action Button: Large pill button in Sunset Peach (#fed6ce) with hover glow.
  5. Toggle Auth Link: "Already registered? Sign In" link.
  6. Feedback Toast Banner: Error container for invalid student email domain warnings.

#### PAGE 2: Main Campus Exploration Map Wireframe (/map)

- Wireframe Layout: Full-screen Leaflet map layout with top/bottom floating glassmorphic bars.
- Features & Components:
  1. Top Floating Profile Header: Avatar badge, Level indicator, XP progress bar (2,450 XP), Daily Streak flame icon, and Network Status Pill (Green "Online" / Amber "Offline Queue: 0").
  2. Map Canvas Overlays:
     - User GPS Marker: Pulsing blue dot with a 25-meter translucent radius ring (#b0cbe6).
     - Event Markers: Sunset Peach pins (#fed6ce) for "In-Reach" events, Amber pins for "Too Far", and Gray pins for "Expired".
  3. Bottom Navigation Bar: Fixed 5-item menu (Map Explorer, Card Gallery, Deck Builder, Combat Arena, Leaderboard).
  4. Floating Action Controls: "Center Map on Me" button and "Compass Target Nearest Event" button.

#### PAGE 3: Location-Gated Trivia Challenge Modal (Overlay Component)

- Wireframe Layout: Centered pop-up modal over blurred map background.
- Features & Components:
  1. Header Card: Landmark photo of Wits Great Hall, event category badge ("Wits History"), and location proof badge ("Verified 12m away").
  2. Question Area: Question title and question body text.
  3. Answer Input Section:
     - For Multiple Choice: 4 stacked option buttons with hover/selected highlights.
     - For Text Input: Text entry box with "Submit Answer" button.
  4. Post-Submit Reward Showcase: Victory banner displaying awarded card with stats (Attack, Defense, Speed, Brains) and Sunset Peach glowing border (#fed6ce).

#### PAGE 4: Collectible Card Gallery Wireframe (/collection)

- Wireframe Layout: Top filter control header over a responsive 4-column card grid.
- Features & Components:
  1. Top Control Bar: Search input field, Category Filter Dropdown (All, Science, History, Landmarks), Rarity Filter Dropdown (Common, Rare, Epic, Legendary), and Essence Currency Balance Meter (450 💎).
  2. Card Components: Card frames with category tags, card artwork, card title, rarity border (Gold for Legendary #fed6ce, Violet for Epic, Blue for Rare), and 2x2 stat matrix (⚔ ATK, 🛡 DEF, ⚡ SPD, 🧠 BRN).
  3. Duplicate Counter: "x3 Owned" badge on card footer.
  4. Card Detail Modal: High-res card detail popup with "Scrap Duplicate" (+50 Essence) and "Upgrade Stats (+10%)" buttons.

#### PAGE 5: Active 5-Card Deck Builder Wireframe (/deck)

- Wireframe Layout: Split screen — Top Half: Active Deck Banner; Bottom Half: Scrollable Collection Drawer.
- Features & Components:
  1. Active Deck Slots: 5 card slot containers (showing selected cards or empty "+" slots).
  2. Constraint Meters:
     - Slot Count Progress Bar (5/5 Cards).
     - Legendary Cap Meter (1/1 Max).
     - Total Deck Stat Cost Bar (240/300 Point Cost Limit).
  3. Save Button: "Save Active Deck" button (disabled if deck violates 300 stat point limit).
  4. Collection Drawer: Scrollable grid of owned cards with quick "Add to Deck" hover buttons.

#### PAGE 6: Turn-Based Combat Arena Wireframe (/battle/:id)

- Wireframe Layout: Vertical 3-tier layout: Top Header, Center Stage, Bottom Control Carousel.
- Features & Components:
  1. Top Header: Opponent profile badge, match round score tracker ("Rounds 2 - 1"), Spectator Counter Pill, and a 30-second circular turn countdown clock.
  2. Center Stage: Side-by-side card clash arena displaying Player Card vs Opponent Card with dynamic round result overlay ("Round Won!", "Round Lost!").
  3. Bottom Control Carousel: Horizontal hand selector displaying player's remaining unplayed cards and 4 attribute attack selectors (Attack, Defense, Speed, Brains).

#### PAGE 7: Asynchronous PvP Challenge Lobby Wireframe (/pvp/async)

- Wireframe Layout: Tabbed list view layout with action sidebar.
- Features & Components:
  1. Tab Bar: "Your Turn" | "Waiting on Opponent" | "Pending Challenges" | "Match History".
  2. Match Cards: Opponent avatar, level badge, turn status ("Turn 3/5"), expiration timer ("14h 22m remaining"), and "Play Turn Now" button.
  3. Challenge Sidebar: Player search input field and "Match with Equal Rating Opponent" button.

#### PAGE 8: Leaderboard & Public Player Profile Wireframe (/leaderboard & /profile/:id)

- Wireframe Layout: Top 3 Podium layout over a detailed ranking table.
- Features & Components:
  1. Top 3 Podium: Gold, Silver, and Bronze podium cards displaying top player avatars, titles, and total XP.
  2. Ranking Table: Columns for Rank #, Avatar, Player Name, Division Rank, Level, Total XP, and PvP Wins. Highlighting for current user.
  3. Profile Drawer: Slide-out drawer displaying player stats, achievement badges, favorite showcase cards, and "Send Async Challenge" button.

#### PAGE 9: Guided Campus Quest Trails Wireframe (/trails)

- Wireframe Layout: Left: Quest List; Right: Directional Radar Screen.
- Features & Components:
  1. Quest List: Quest campaign cards (e.g. "Wits Science & Innovation Trail"), progress bars (3/5 Events Completed), and unlocked rewards preview.
  2. Compass Radar Screen: Rotating directional arrow pointing to target landmark coordinates, distance counter ("Target: Great Hall — 45m"), and step-by-step sequential event checklist.

#### PAGE 10: Peer-to-Peer (P2P) Card Trade Modal Wireframe (/trades)

- Wireframe Layout: Dual split-box modal window.
- Features & Components:
  1. Left Offer Box: "Your Offered Card" slot, card thumbnail, and stat values.
  2. Right Offer Box: "Their Offered Card" slot, card thumbnail, and stat values.
  3. Trade Validation Bar: Stat difference indicator badge ("Stat Difference: 8% — Balanced Trade") and daily limit counter ("Trades Remaining Today: 2/3").
  4. Footer Controls: "Lock Offer", "Confirm Trade", and "Cancel" buttons.

---

### SECTION 2: ADMIN & LECTURER CONSOLE SCREENS (SCREENS 11 TO 15)

#### PAGE 11: Admin Spatial Event Placement Map Wireframe (/admin/events)

- Wireframe Layout: Full map view with right-hand event authoring sidebar.
- Features & Components:
  1. Map Canvas: Click-to-place pin functionality across Wits Campus coordinates.
  2. Authoring Sidebar Form: Latitude/Longitude input fields (auto-filled on click), Event Title input, Activation Radius slider (10m - 100m), Activation Start/End Date Pickers, and Card Reward Selector.
  3. Active Events Table: Bottom table listing created events with edit and despawn controls.

#### PAGE 12: Admin Trivia & Card Authoring Console Wireframe (/admin/content)

- Wireframe Layout: Tabbed form layout.
- Features & Components:
  1. Tab Selector: "Trivia Question Authoring" | "Card Set Definition".
  2. Trivia Form: Event selector, Question Type Toggle (Multiple Choice / Text Match), Question text area, and 4 option inputs with radio buttons designating the correct answer.
  3. Card Form: Card title input, Image file uploader, Category dropdown, Rarity dropdown, and 4 attribute sliders (Attack, Defense, Speed, Brains from 0 to 100).

#### PAGE 13: Admin Curation & Governance Kanban Board Wireframe (/admin/curation)

- Wireframe Layout: 4-column Kanban board layout.
- Features & Components:
  1. Kanban Columns: Drafts | Pending Review | Published | Retired.
  2. Content Cards: Question text preview, author name, submit date, diagnostic alert badge (flagging >85% student failure rate), and Action Buttons (Approve, Edit, Reject).
  3. Campaign Scheduler Panel: Date range pickers for bulk activating seasonal events.

#### PAGE 14: Admin Anti-Cheat & Player Audit Dashboard Wireframe (/admin/anti-cheat)

- Wireframe Layout: Master-detail split layout.
- Features & Components:
  1. Flagged List (Left): Student email, Trust Score Bar (0-100), and violation badges (Speed Spoofing, Rapid Burst Submissions, Win-Trading).
  2. Audit Detail Panel (Right): Detailed movement trajectory log table (timestamps, coordinates, calculated velocity in m/s), and match history logs.
  3. Action Bar: "Override Trust Score" button, "Issue Warning", "Require Secondary Verification", and "Suspend Account" actions.

#### PAGE 15: Admin Campus Heatmaps & Telemetry Dashboard Wireframe (/admin/analytics)

- Wireframe Layout: Top Map Heatmap overlay over bottom telemetry chart grid.
- Features & Components:
  1. Foot-Traffic Heatmap: Leaflet map displaying glowing intensity heat overlays of student event attempts across campus with time filters (Today, 7 Days, All Time).
  2. Telemetry Cards: Daily Active Players line chart, Card Economy Circulation bar charts, and Trivia Success Rate analytics pie chart.
