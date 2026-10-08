# State Diagrams

The things in Wits Quest that move through set stages, and what moves them on. The server enforces every one of these. The app only shows the current state and sends the player's choice.

---

## Live PvP match

Two players battle in real time over Socket.IO (`backend/src/services/battleSocketHandler.ts`). Each round has two turns. The **picker** chooses a card and a stat. The other player sees the stat (not the card) and **responds** with one of their cards. The picker swaps every round, so both players pick equally.

```mermaid
stateDiagram-v2
    [*] --> Waiting : challenge accepted or ranked pair found
    Waiting --> Cancelled : second player doesn't join within 20 s
    Waiting --> Pick : both players joined, decks loaded
    Pick --> Respond : picker locks in card + stat
    Pick --> Respond : 30 s run out, card + stat auto-picked
    Respond --> Resolve : responder locks in a card
    Respond --> Resolve : 30 s run out, card auto-picked
    Resolve --> Pick : no winner yet, other player picks next
    Resolve --> Finished : a player has 3 round wins, or 5 rounds played
    Pick --> Finished : a player stays disconnected for 60 s
    Respond --> Finished : a player stays disconnected for 60 s
    Finished --> [*] : result saved, Elo, XP and Essence awarded
    Cancelled --> [*]
```

**Rules checked on every turn:** the card must be in the player's deck, a card can't be played twice in one match, and each stat can be used at most twice per match. In **Resolve**, the two cards' values for the chosen stat are compared. For Attack, 30% of the defender's Defense is taken off first. A draw is possible when both players win the same number of rounds.

## CPU battle

The same round rules, but against the computer, through `POST /api/battle/cpu/...`. The match is kept in the server's memory until it ends.

```mermaid
stateDiagram-v2
    [*] --> InProgress : start (difficulty easy, medium or hard)
    InProgress --> InProgress : play a round (player picks card + stat, CPU answers)
    InProgress --> Over : 3 round wins, or 5 rounds played
    Over --> Settled : settle (result saved, rewards given)
    InProgress --> Forgotten : abandoned, cleared after 30 min
    Settled --> [*]
    Forgotten --> [*]
```

## Async challenge

A turn-based match played over hours or days (`async_pvp_challenges.status`). Every action has a 24-hour deadline. If a player misses it, the server auto-fills that one move and the match carries on.

```mermaid
stateDiagram-v2
    [*] --> PENDING_ACCEPTANCE : player sends a challenge
    PENDING_ACCEPTANCE --> DECLINED : defender declines
    PENDING_ACCEPTANCE --> EXPIRED : not accepted within 24 h
    PENDING_ACCEPTANCE --> CHALLENGER_TURN : defender accepts
    CHALLENGER_TURN --> DEFENDER_TURN : challenger moves (or auto-filled after 24 h)
    DEFENDER_TURN --> CHALLENGER_TURN : defender moves (or auto-filled after 24 h)
    CHALLENGER_TURN --> COMPLETED : match decided (3 wins or 5 rounds)
    DEFENDER_TURN --> COMPLETED : match decided (3 wins or 5 rounds)
    DECLINED --> [*]
    EXPIRED --> [*]
    COMPLETED --> [*]
```

## Content lifecycle

Cards, events and trivia questions all follow the same steps (`status` column). New admin content starts as a draft, and players only ever see `published` content.

```mermaid
stateDiagram-v2
    [*] --> draft : admin creates it
    draft --> review : admin submits it for review
    review --> published : an admin approves it
    published --> retired : admin retires it
    draft --> retired : admin retires it
    review --> retired : admin retires it
    retired --> [*]
```

Content can only be published from `review`, so nothing goes live without passing through it. Any admin can approve, including the one who submitted it. Retired cards stay in the collections of players who already own them.

Quest trails use a shorter version: `draft`, `published` and `retired`, with no review step.

## Trade offer

```mermaid
stateDiagram-v2
    [*] --> pending : sender offers cards
    pending --> accepted : receiver accepts, cards swap
    pending --> cancelled : someone tries to accept after 24 h
    accepted --> [*]
    cancelled --> [*]
```

The database also allows `rejected`, but there's no endpoint yet for rejecting or withdrawing an offer. An offer that's never accepted stays `pending` until someone tries to accept it after it expires.
