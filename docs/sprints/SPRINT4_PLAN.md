# Sprint 4 Plan

**Sprint:** 29 Sep → 11 Oct 2026 · **Feature freeze: Sun 4 Oct** · **Final submission: Sun 11 Oct**

Every feature in the project brief was built by the end of Sprint 3. Sprint 4 is about finishing, polishing and testing the app for submission, plus a few new ideas from the team. This plan comes from the team's Sprint 4 task list (1 Oct) and the [Overall App Testing meeting](../meetings/index.md#2026-10-08-overall-app-testing) (8 Oct).

For the features built this sprint, see [Features by Sprint](../project/sprint-features.md#sprint-4-polish-and-submit).

---

## Who does what

| Owner | Task |
| :--- | :--- |
| **Nontokozo** | Add pictures to the cards |
| **Oratile** | Add sound to the game |
| **Kgothatso** | Clean up the documentation |
| **Junior & Mahlatse** | Build the new ideas the team agrees on |
| **Rea** | Review the UI design and suggest or make changes |
| **Mahlatse** | Set up the live app and clean its data |
| **Everyone** | Test the whole app on real phones on campus |

## Nontokozo: card pictures

- Upload a picture for every card that doesn't have one. On 1 Oct, 7 cards still showed placeholder art.
- Store the pictures in Supabase Storage and set each card's picture in the admin console (Content → Cards).
- Check the pictures show in the collection, the deck editor, trades and battles.

## Oratile: sound

- Short sound effects for the main moments: collecting a card, right and wrong answers, winning or losing a round, a live challenge arriving, and unlocking an achievement.
- An on/off switch for sound in the Me tab that remembers the choice.
- Keep the sounds short and quiet, because players are walking around campus.

## Kgothatso: documentation

- Make the README and these docs match the app as it is now: the new look and 4 themes, the six tabs (Map, Cards, Quests, Battle, Ranks, Me), the draft → review → published flow, contested zones, and the two-turn live battles.
- Bring the [UML diagrams](../uml/01_system_architecture.md) up to date, including territory influence in the ERD and the pick and answer turns in the battle state diagram.
- Remove or replace outdated planning docs.
- Fill in the meeting notes, including the Sprint 3 and Sprint 4 meetings.
- Check every endpoint is described on the Swagger page.

## Junior & Mahlatse: new ideas

- Collect the team's ideas, agree which to build, and build them.
- First, one technical fix before the demo: live battles should take the player from their login token, not from the player id the app sends.
- **Idea 1, friends:** a list of recent opponents with your record against each, friend requests (from that list, the end-of-match screen or the map), a friends list showing who's online with quick challenge, trade and rematch buttons, rivals you battle often, and the option to remove or block a player.

## Rea: UI review

- Go through every screen on a phone, and the admin console on a laptop, in all 4 themes.
- Note anything that looks wrong or is hard to use, and fix it or bring suggestions to the team.

## Mahlatse: live app set-up and clean-up

- Push `main` so the latest work goes live.
- Run the 3 new database migrations: admin achievements, territory influence, and the deck budget of 2000.
- Create the two test student accounts with the seed script.
- Update or retire old events whose end date has passed.
- Clear leftover test anti-cheat flags and test match results.
- Agree the real card drop rates with the team (60 / 25 / 12 / 3 are placeholders).

## Added at the 8 Oct meeting

| Task | Owner | Due |
| :--- | :--- | :--- |
| Clean the live database, keeping only the default cards, events and other real content | Team | Before submission |
| Show each player's avatar on the map instead of a number | Team | Before submission |
| Test on phones on campus: create events and walk around | Anyone on campus | 9 Oct |
| Look into battle sounds, a game theme and a tournament mode | Team | TBD |

---

## Testing checklist (everyone)

Test on real phones on campus, and the admin console on a laptop. Anything broken goes on the board as a bug (see [Bug Tracking](../development/bug-tracking.md)).

- [ ] **Accounts:** sign up (you should get 5 starter cards and a deck), verify your email, log in, reset your password, delete your account.
- [ ] **Map:** your position, events, QR check-in where GPS is weak, the map with no signal.
- [ ] **Trivia:** a right answer rewards once; a wrong answer shows the right one and can't be retried.
- [ ] **Cards:** collection, Forge, building a deck, trading (from the Cards page).
- [ ] **Battles:** computer, live (challenge from any screen, pick and answer, opponent's card hidden), async, ranked, spectating.
- [ ] **Quests and zones:** follow a trail, take a zone.
- [ ] **Profile:** levels, streak bonus, achievements, themes, avatar.
- [ ] **Admin:** create, review, publish and retire an event, and the same for questions and cards. Also achievements, campaigns, anti-cheat and analytics.

## Hand-in

- [ ] Sprint 4 retrospective.
- [ ] Record the final demo.
- [ ] Submit by Sun 11 Oct.
