# Task 2 - Battle Engine, AI & Real-Time Multiplayer Implementation Plan

## Assigned Role: Member 2

**Lead Responsibility**: Battle Engine, Intelligent AI Bot Logic & Real-Time / Asynchronous Multiplayer

---

## 1. Task Execution Levels Roadmap

We define the implementation of Task 2 across **4 progressive levels**:

### 🛡️ Level 1: Core Battle Engine & Single-Player Arena (`utils/battleEngine.ts` & `BattleArena.tsx`)

- **Starting Point**: Abstract pure combat logic out of UI into `battleEngine.ts`.
- **Combat Rules**: Best of 5 rounds card battle system with 4 stat attributes (ATK, DEF, SPD, BRN).
- **Stat Comparison**: Higher stat wins round; ties resolved cleanly without point award.
- **Round Timer**: 30-second round countdown timer with auto-play fallback.
- **Visual Mechanics**: Glassmorphism battle stage, card selection, stat highlights, reveal animation, sound/fx indicators, round rings.
- **Match Payout**: +150 XP, Essence currency, and card progress.

### 🧠 Level 2: Strategic AI Engine (`utils/battleAI.ts`)

- **Intelligent Bot Opponent**: Dynamic CPU strategy engine with 3 difficulty modes:
  - **Level 1 Bot (Easy)**: Random stat & card selection algorithm.
  - **Level 2 Bot (Medium)**: Greedy heuristic evaluating highest CPU card attribute.
  - **Level 3 Bot (Hard / Grandmaster)**: Minimax predictive AI evaluating player deck card distribution and counter-picking optimal stats based on round history.
- **UI Selector**: Interactive difficulty picker in `BattleArena.tsx`.

### ⏱️ Level 3: Asynchronous PvP Challenges & Defensive Telemetry (`AsyncPvP.tsx` & `asyncPvPService.ts`)

- **Turn-Based Async Engine**: Play turn, pass turn to opponent with 24-hour expiration window.
- **Challenge Queue**: Interactive tabs for "Your Turn", "Waiting for Opponent", "Pending Invites", and "Battle History".
- **Defensive Telemetry**: When an offline defender loses, detailed telemetry analysis breaks down which card stats failed to help them optimize their deck.
- **Consolation Payout**: +120 XP consolation for defeated player.

### ⚡ Level 4: Live WebSocket Real-Time Arena (`LivePvPArena.tsx` & Backend Socket Server)

- **Synchronous Real-Time PvP**: Socket.io real-time connection connecting two live players (`battleSocketHandler.ts`).
- **Latency & Spectators**: Live ping indicator (ms) and spectator count display.
- **Turn Synchronization**: 15-second simultaneous secret stat pick lock-in, dual card reveals, synchronized round outcomes.
- **Disconnect Resilience**: State restoration if a player temporarily drops connection.
- **Ranked Rewards**: Elo rating updates (+15 to +25 Elo) & +420 XP.

---

## 2. Technical File Structure & Dependencies

```
wits_quest/
├── personal/
│   └── TASK_2_BATTLE_ENGINE_PLAN.md    <-- (Local ignored guide)
├── frontend/src/
│   ├── screens/
│   │   ├── BattleArena.tsx               <-- Main CPU Combat Screen
│   │   ├── LivePvPArena.tsx              <-- Live WebSocket Arena Screen
│   │   └── AsyncPvP.tsx                  <-- Async Challenge Hub
│   ├── utils/
│   │   ├── battleEngine.ts               <-- Core combat rules & reward calculator
│   │   ├── battleAI.ts                   <-- AI decision algorithms
│   │   └── websocketClient.ts            <-- Socket.io client wrapper
├── backend/src/
│   ├── server.ts                         <-- Express + Socket.io Server
│   └── services/
│       ├── battleSocketHandler.ts        <-- Live Match Room & Turn Engine
│       └── asyncPvPService.ts            <-- Async Match State API
```

---

## 3. Implementation Checklist & Progress

- [ ] **Level 1: Core Engine & Single-Player Foundation**
  - [ ] Implement `frontend/src/utils/battleEngine.ts`
  - [ ] Connect `BattleArena.tsx` to `battleEngine.ts` with round animations & timers
- [ ] **Level 2: Strategic AI Engine**
  - [ ] Implement `frontend/src/utils/battleAI.ts` (Easy, Medium, Hard/Grandmaster algorithms)
  - [ ] Add difficulty selection UI to `BattleArena.tsx`
- [ ] **Level 3: Asynchronous PvP Engine & Telemetry**
  - [ ] Implement `backend/src/services/asyncPvPService.ts`
  - [ ] Build interactive challenge tabs & defensive telemetry modal in `AsyncPvP.tsx`
- [ ] **Level 4: Live WebSocket Real-Time Arena**
  - [ ] Build Express + Socket.io handler `backend/src/services/battleSocketHandler.ts`
  - [ ] Implement `frontend/src/utils/websocketClient.ts`
  - [ ] Connect `LivePvPArena.tsx` with latency ping, spectator count & turn sync
