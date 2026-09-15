# User Feedback

How Team Big-O collects and acts on feedback from real players — the survey instrument, what it asks, and how responses feed the Sprint 2 retrospective and the Sprint 3 backlog. The deliverable is evidence of a real feedback loop: a structured instrument, real respondents, and documented outcomes.

---

## The feedback form

**➡️ [Wits Quest — User Feedback (Google Form)](https://docs.google.com/forms/d/e/1FAIpQLScZaBww5ClrueNKgGNbBI0dB1FSKyLwNcZw0eFAeAn80-zldw/viewform)**

The form is distributed to students who played the game during the Sprint 2 testing window (coursemates, dorm-mates, and students met on campus at actual landmark locations). It combines scaled ratings (1–5), multiple choice, and free-text questions so we can quantify usability trends while still catching bugs only a real player would hit.

## What the form asks

The 21 questions are grouped to mirror the player's journey through the game:

**Background (who is answering)**

1. Have you played Wits Quest before? *(multiple choice)*
2. Have you played other location-based games (e.g. Pokémon GO)? *(multiple choice)*
3. How would you rate your experience with mobile/web apps? *(1–5)*
4. How comfortable are you using apps? *(1–5)*
5. What device did you play on? *(multiple choice)*

**Onboarding**

6. How easy was signing up? *(1–5)*
7. Did anything block or frustrate you during sign-up? *(multiple choice)*
8. If you had setup problems, what were they? *(short answer)*

**Core gameplay**

9. How easy is it to use the map? *(1–5)*
10. Were you able to unlock trivia at a landmark? *(multiple choice)*
11. How fun is the battle system? *(1–5)*
12. How fair does the battle system feel? *(1–5)*
13. Have you collected new cards? *(multiple choice)*
14. How motivating are the rewards (cards, XP, Essence)? *(1–5)*

**Presentation & performance**

15. How do you rate the visual design? *(1–5)*
16. How is the game's speed? *(multiple choice)*
17. How readable are the screens and buttons? *(multiple choice)*

**Outcomes**

18. If you could improve one thing, what would it be? *(short answer)*
19. How likely are you to recommend Wits Quest to a friend? *(1–5)*
20. Did you find any bugs? *(short answer)*
21. Any other comments? *(short answer)*

## How responses are used

| Feedback stream | Feeds into |
| :--- | :--- |
| Bugs reported (Q20) and setup problems (Q8) | The [Bug Tracker](../development/bug-tracking.md) and fix register, with reproduction steps |
| Battle fun/fairness ratings (Q11–Q12) | CPU AI difficulty tuning and the [CPU Battle Rulebook](../development/cpu-battle-rules.md) |
| Sign-up friction (Q6–Q8) | Auth flow refinements following the Supabase Auth migration |
| Map and landmark questions (Q9–Q10) | Geofence radius and landmark placement decisions |
| Recommend score (Q19) | The overall Sprint 2 retrospective and Sprint 3 scope selection |

!!! tip "For the presentation"
    Open the live form responses (or a summary screenshot) alongside this page when presenting the User Feedback rubric item — the form link above is the instrument, and the response summary is the evidence.
