# Core Features

What Wits Quest does, grouped by part of the game. To see when each feature was built, go to [Features by Sprint](sprint-features.md).

---

## The game in one line

Walk to real places on the Wits campus, answer trivia there to win cards, build a deck, and battle the computer or other students.

## Map and location

| Feature | What it does |
| :--- | :--- |
| **Campus map** | A live map of Wits showing events, other online players and campus zones. |
| **Location check-in** | A player has to be within the event's radius (usually 25 m) while the event is running before its trivia unlocks. The server checks this, not the phone. |
| **QR check-in** | When GPS is too weak, the player scans a QR code at the landmark instead. |
| **Walking directions** | Shows the walking route to the nearest event, or to the next stop on a trail. |
| **Offline answers** | If the phone loses signal, the answer is saved and sent later with the position and time it was given. |

## Trivia and cards

| Feature | What it does |
| :--- | :--- |
| **Location trivia** | Each event asks a question about that place. It's marked on the server, and each player gets one try. |
| **Card rewards** | A right answer gives a card for that landmark, plus XP and Essence. |
| **Card collection** | Shows every card, with missing ones greyed out so players know what's left to find. |
| **Deck building** | A deck is 5 cards, within a stat budget, with at most 1 Legendary. |
| **Card Forge** | Scrap spare copies for Essence, or spend copies and Essence to upgrade a card's stats. |
| **Trading** | Swap cards with another player. Both accounts must be at least a week old, and a day's trades are limited. |

## Battles

| Feature | What it does |
| :--- | :--- |
| **CPU battle** | Play against Kudu, the computer, on easy, medium or hard. |
| **Live PvP** | Battle another student in real time, with a 30-second timer for each turn. |
| **Async PvP** | Battle at your own pace. Each player has 24 hours for each move. |
| **Ranked matches** | Get matched with a player of similar Elo. Your Elo sets your division, from Bronze to Diamond. |
| **Spectating** | Watch a live match. |
| **Battle history** | See your past matches and results. |

**How a battle works:** each player brings 5 cards, and a match lasts up to 5 rounds. Each round, one player picks a card and a stat (Attack, Defense, Speed or Brains). The other player answers with a card, and the higher value for that stat wins the round. Attack is reduced by part of the defender's Defense. Each stat can be used twice per match, and a card can't be played twice. The first to 3 round wins takes the match. The server decides every round. See the [State Diagrams](../uml/02_battle_state_machine.md) for the full rules.

## Progress and competition

| Feature | What it does |
| :--- | :--- |
| **XP and levels** | Players level up from answering trivia and winning battles. |
| **Daily streaks** | Playing on days in a row boosts XP: ×1.10 at 3 days and ×1.25 at 7 days. |
| **Achievements** | Unlock badges for goals like cards collected or battles won. Admins can create new ones. |
| **Leaderboard** | Rankings by XP or Elo. |
| **Ranked seasons** | When a season ends, the final leaderboard is saved and Elo above 1000 is cut back, so players keep a quarter of their gain. |
| **Quest trails** | A chain of events to visit in order, with a bonus at the end. |
| **Territory control** | Campus is split into zones. Completing events and winning battles in a zone builds influence, and the player with the most influence owns it. |

## Fair play

| Feature | What it does |
| :--- | :--- |
| **Movement checks** | Every location ping is checked for impossible speed or teleporting. |
| **Trust score** | Worked out from a player's flags. A low score blocks ranked play and some rewards, but never bans anyone automatically. |
| **Admin review** | Admins see flagged players and can warn or suspend them, or mark a flag as a false alarm. |

## Admin console

| Feature | What it does |
| :--- | :--- |
| **Content authoring** | Create events, trivia questions and cards. |
| **Review before publishing** | New content goes from draft to review to published, and can be retired later. |
| **Campaigns** | Schedule events for a set period, like a term or an open day. |
| **Automatic event placement** | The server places and rotates events around campus by itself. |
| **Analytics** | Shows which questions players struggle with (so they can be fixed) and whether cards drop as often as their rarity says. |
