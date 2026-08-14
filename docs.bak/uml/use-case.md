# Use Case Diagram

*Not yet added — see [UML overview](index.md) for how to add diagrams to this site.*

## Suggested actors

Based on the [Requirements](../project/requirements.md), the use case diagram should cover at least:

- **Student (Player)** — explore map, attempt trivia, collect cards, build decks, battle CPU/players, trade, check leaderboard, join ranked queue.
- **Lecturer/Admin** — author events, write questions/answers, define cards, curate submitted content, review flagged anti-cheat cases, view analytics.
- **System / Anti-Cheat Engine** — verify location claims, mark trivia answers, enforce match rules, compute trust scores (secondary/supporting actor).

## Suggested use cases to diagram

- Check in at landmark → Attempt trivia → Receive card
- Build deck → Battle CPU
- Challenge nearby player (Live PvP / Async PvP)
- Propose trade
- Author event / question / card (admin)
- Review flagged account (admin)

Once drawn, export to `uml/images/use-case-diagram.png` and embed with:

```markdown
![Use case diagram](images/use-case-diagram.png)
```
