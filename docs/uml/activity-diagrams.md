# Activity Diagrams

_Not yet added — see [UML overview](index.md) for how to add diagrams to this site._

## Suggested flows to diagram

Activity diagrams suit branching decision logic more than strict actor-to-actor messaging — good candidates from the requirements:

1. **Landmark check-in decision flow** — in radius? online or offline? GPS confidence high enough, or needs corroboration? → unlock trivia / hold locally / flag as suspicious.
2. **Trust scoring / anti-cheat decision flow** — evaluate movement plausibility, duplicate submissions, account pairing patterns → proportionate response (warn / restrict / flag for human review / ban).
3. **Streak calculation** — did the player check in within 24h? → increment streak vs. reset to 0 → apply multiplier (3-day / 7-day thresholds).
4. **Procedural event placement** — pick candidate location → check walkability, spacing from existing events, live-event cap, campus coverage balance → place or reject.
5. **Card upgrade (Forge) flow** — has 2 duplicates + 100 Essence? → confirm → apply +5 to all stats → deduct resources.

Once drawn, export to `uml/images/` and embed per diagram, e.g.:

```markdown
![Check-in decision flow](images/activity-checkin-flow.png)
```
