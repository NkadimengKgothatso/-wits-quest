# UI Design

How Wits Quest looks and why: the design files, the visual system, and the screens.

[:material-palette: Open the designs in Figma](https://www.figma.com/design/utTkicuy5n5zPacJdEzJaR/Untitled?node-id=0-1&t=ZkvWz8YmVcWZYJui-1){ .md-button .md-button--primary }

---

## Design goals

1. **One-handed on a phone.** Players walk around campus, so the main controls sit at the bottom of the screen, within thumb reach.
2. **Feels like Wits.** Navy and gold from the university's colours, campus landmarks on the cards, and Kudu, a kudu antelope mascot, as the guide.
3. **Readable outside.** Strong contrast in every theme, plus a Daylight theme for direct sun ([Accessibility](../ux/accessibility.md)).
4. **Simple to learn.** Six tabs, a short walkthrough, and icons that always come with a word label ([Structure](../ux/structure.md)).

## How the design was made

| Step | What we did |
| :--- | :--- |
| **Wireframes and mockups** | The screens were designed as mockups before they were built, including an onboarding mockup and a "Foundations" sheet of colours, type and spacing. The team's designs are in [Figma](https://www.figma.com/design/utTkicuy5n5zPacJdEzJaR/Untitled?node-id=0-1&t=ZkvWz8YmVcWZYJui-1) |
| **Build in tokens** | The Foundations sheet became CSS tokens in `frontend/src/theme/themes.css`, so code and design use the same names |
| **Test with players** | Visual design scored 3.4 / 5 in the Sprint 2 feedback. After the redesign it scored 4.8 / 5 in Sprint 3 ([User Feedback](../project/user-feedback.md#sprint-2-sprint-3-at-a-glance)) |
| **Review every theme** | In Sprint 4, Rea checked every screen on a phone, and the admin console on a laptop, in all four themes ([Sprint 4 Plan](../sprints/SPRINT4_PLAN.md)) |

## The visual system

### Colour

Every screen uses colour tokens, never fixed colours, so the whole app follows the chosen theme.

| Token | Used for | Wits Night | Daylight | Wits Blue | Pink |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--bg` | Page background | `#071a33` | `#f1e8d8` | `#0a2b6e` | `#2a0e1f` |
| `--surface` | Cards and panels | `#0b2545` | `#fbf6ec` | `#0f3a8f` | `#3b1330` |
| `--text` | Main text | `#f5efe3` | `#0b2545` | `#faf6ec` | `#fff1f7` |
| `--accent` | Buttons and highlights | `#e6c77a` | `#0b2545` | `#e6c77a` | `#ff8fc4` |
| `--success` | Correct, won | `#6fd3c9` | `#0b6b64` | `#86e3d9` | `#7fdccb` |
| `--danger` | Wrong, warnings | `#f29a8a` | `#a6382a` | `#ffb4a6` | `#ffb38a` |

**Card rarity** is the same in every theme, and uses colour, frame shape and an icon together: Common `#9a948a`, Rare `#5fa8d8`, Epic `#9b6fe0`, Legendary `#d9b25a`.

### Type

| Font | Used for |
| :--- | :--- |
| **Outfit** | Everyday text, buttons and labels |
| **Shippori Mincho B1** | Screen titles and card names |
| **Caveat** | Kudu's handwritten notes |

### Spacing, corners and motion

- **Spacing** on a 4 px grid: 4, 8, 12, 16, 20, 24, 32 and 48 px.
- **Corners:** 6 px small, 14 px buttons, 18 px panels and 26 px bottom sheets.
- **Motion:** 120 ms for a tap, 240 ms for a sheet sliding up, 600 ms for revealing a won card. All of it turns off with the phone's reduce-motion setting.
- **Icons:** one set (Lucide), always with a text label.

## Screens

| Screen | Purpose |
| :--- | :--- |
| **Login and sign-up** | Wits email only, with a six-digit code to verify the email |
| **Walkthrough** | Three steps with Kudu: explore, answer to collect, build a deck and battle |
| **Map** | The campus with events, your position, unlock circles and walking directions |
| **Trivia** | A bottom sheet with the question; a won card is revealed with confetti |
| **Cards** | The collection, the five-card deck, the Card Forge and trades |
| **Quests** | Quest trails: routes of events to walk in order |
| **Battle** | The hub for CPU, live, async and ranked battles, territory and spectating |
| **Ranks** | The leaderboard and divisions |
| **Me** | Profile, avatar, achievements, Appearance (themes) and account |
| **Admin console** | A sidebar layout for laptops: events, content, campaigns, curation, anti-cheat, heatmaps and progression |

What's in each screen is on [Core Features](../project/core-features.md).
