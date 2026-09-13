# Class Diagram

_Not yet added — see [UML overview](index.md) for how to add diagrams to this site._

## Suggested starting point

The [Database Schema](../database/database-schema.md) already defines the core entities and relationships (`Users`, `Cards`, `UserCards`, `UserDecks`, `BattleMatches`, `AsyncChallenges`). A class diagram should build on that ERD but add:

- Behaviour (methods), not just attributes — e.g. `User.checkIn()`, `BattleMatch.resolveRound()`, `AsyncChallenge.forfeitIfExpired()`.
- Backend service/domain classes that don't map 1:1 to a table — e.g. a `GeoVerificationService`, `TrustScoreEngine`, `MatchmakingService`, `TradeEscrow`.
- Relationships and multiplicities between domain classes, mirroring the ERD's foreign keys.

Once drawn, export to `uml/images/class-diagram.png` and embed with:

```markdown
![Class diagram](images/class-diagram.png)
```
