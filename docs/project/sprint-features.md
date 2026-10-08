# Features by Sprint

Which game features were built in each sprint, from Sprint 1 to Sprint 4. For what each feature does, see [Core Features](core-features.md). For the full plans and task lists, see the Sprints section.

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

## Sprint 4: polish and submit

Every feature in the brief was done by the end of Sprint 3, so Sprint 4 (29 Sep to 11 Oct) is for finishing, polishing and testing. New features stopped on 4 Oct. The full task list is in the [Sprint 4 Plan](../sprints/SPRINT4_PLAN.md).

**Built:**

| Feature | Owner |
| :--- | :--- |
| New look with 4 themes to choose from: Wits Night, Daylight, Wits Blue and Pink | Mahlatse |
| Six tabs: Map, Cards, Quests, Battle, Ranks and Me | Mahlatse, Nontokozo |
| First-time walkthrough with Kudu | Mahlatse |
| Card pictures in battles and the deck editor, and icons instead of emojis | Mahlatse |
| Quest trails screen, with each trail's next stop flagged on the map | Nontokozo, Mahlatse |
| Live challenges arrive on any screen | Mahlatse |
| Live battles in two turns: the answering player sees the stat picked, not the card | Mahlatse |
| Spectators see the whole match play out, not just the score | Mahlatse |
| Contested zones, safe when two players capture at the same time | Mahlatse |
| The map still shows with no signal | Mahlatse |
| Trading moved onto the Cards page | Mahlatse |

**Planned:**

| Feature | Owner |
| :--- | :--- |
| Pictures for every card | Nontokozo |
| Sound effects, with an on/off switch | Oratile |
| Player avatars on the map instead of numbers | Team |
| Friends: recent opponents, friend requests, rivals, and blocking | Junior, Mahlatse |
| Ideas to look at: a game theme and a tournament mode | Team |

Sprint 4 also covers non-feature work: a UI review in every theme (Rea), the documentation clean-up (Kgothatso), cleaning test data out of the live app (Mahlatse), and testing on phones around campus (everyone).
