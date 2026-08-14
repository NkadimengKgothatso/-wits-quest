# Sequence Diagrams

*Not yet added — see [UML overview](index.md) for how to add diagrams to this site.*

## Suggested flows to diagram

Pick the flows with the most moving parts / most likely to have bugs — sequence diagrams earn their keep on multi-actor, multi-step flows:

1. **Location-gated trivia attempt** — Client → GPS Verification API → Trivia Engine → Card award, including the "claim vs. verified" distinction from the requirements.
2. **Offline check-in reconciliation** — Client (offline) → IndexedDB queue → ServiceWorker → Backend (on reconnect), showing how a stored attempt is validated as if it happened at capture time.
3. **CPU battle round resolution** — DeckBuilder → BattleArena → server-side round comparison → XP/Essence award.
4. **Async PvP turn exchange** — Challenger submits turn → server holds state → push/notify defender → defender responds or times out → forfeit path.
5. **Live PvP match** — WebSocket connection handshake, turn timer, disconnect/reconnect handling, spectator join.
6. **Trade escrow** — Offer → counter-offer → atomic commit/rollback.

Each diagram should be named after the flow it documents. Once drawn, embed as an image per flow, e.g.:

```markdown
## Location-Gated Trivia Attempt
![Trivia attempt sequence](images/sequence-trivia-attempt.png)
```
