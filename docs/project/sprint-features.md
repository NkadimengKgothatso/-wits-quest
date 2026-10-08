# Features by Sprint

Which game features were built in each sprint. For what each feature does, see [Core Features](core-features.md). For the full plans and task lists, see the Sprints section.

---

## Sprint 1: the core loop

The basic game: walk to a place, answer a question, get a card, battle with it.

| Feature | Owner |
| :--- | :--- |
| Login and sign-up with a Wits student email | Kgothatso |
| Campus map with a 25 m check-in radius | Junior |
| Location trivia that awards landmark cards | Junior |
| Card collection with locked cards and a progress bar | Nontokozo |
| Deck builder: 5 cards, a stat budget and 1 Legendary | Nontokozo |
| 5-round card battle against the computer | Mahlatse |
| Admin forms for placing events and creating cards | Rea |
| Speed checks on player movement | Oratile |
| Leaderboard with XP and Elo divisions | Nontokozo |

## Sprint 2: playing together

Moving from a single-player game to a multiplayer one.

| Feature | Owner |
| :--- | :--- |
| Login moved to Supabase Auth | Kgothatso |
| Live PvP battles in real time | Mahlatse |
| Async PvP battles at your own pace | Mahlatse |
| Battle hub and new CPU battle rules | Mahlatse |
| Online players shown on the map | Junior |
| Live leaderboard with real players | Nontokozo |
| Card creation and event curation in the admin console | Rea |

## Sprint 3: fair play and depth

Making the game hard to cheat, and adding more to do.

| Feature | Owner |
| :--- | :--- |
| Server checks of location and time for every answer | Mahlatse |
| Offline answers, checked against where and when they were given | Mahlatse |
| Battles decided by the server | Mahlatse |
| Spectating live battles | Mahlatse |
| Walking-time and duplicate-answer checks, and trust scores | Oratile |
| QR code check-in when GPS is weak | Oratile |
| Achievements created by admins, with an unlock pop-up | Kgothatso |
| Analytics: question pass rates and card drop rates | Kgothatso |
| Daily streaks with XP multipliers | Kgothatso |
| Content review: draft, review, published, retired | Rea |
| Campaigns with start and end dates | Rea |
| Flagging questions that players fail too often | Rea |
| Card trading | Junior |
| Walking directions to the next event or trail stop | Junior |
| Automatic event placement | Junior |
| Card Forge for scrapping and upgrading cards | Nontokozo |
| Quest trails | Nontokozo |
| Ranked matchmaking and seasons | Nontokozo |
| Territory control with influence | Nontokozo |
| Real campus content: cards, events and trivia | Nontokozo |

Sprint 3 also included work that isn't a game feature: making the app work well on phones, API clean-up and versioning, speed fixes, security fixes, and more automated tests. These are covered under [API](../development/api-endpoints.md), [Performance](../development/performance.md) and [Test Results](../development/testing.md).
