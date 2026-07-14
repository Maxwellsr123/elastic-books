# Elastic AI — Colour & Design System

Source of truth for the marketing site AND the web app (app.elasticadmin.com).
The app addendum at the bottom maps the app's existing CSS variables onto these
tokens so the migration is mechanical.

## Brand Colours

| Token | Hex | Usage |
|---|---|---|
| Orange-500 | `#FF6A1A` | Primary action colour — all buttons, CTAs, sign-up flows, any element the user clicks to take action |
| Orange-600 | `#D2530F` | Button hover/active state for orange buttons |
| Orange-400 | `#FF8540` | Check icons, tick marks, benefit lists |
| Orange-50 | `#FFF4ED` | Light orange tint — label backgrounds, channel badges, calculator highlights |
| Purple-500 | `#534AB7` | Ava identity colour — Ava avatar, AI badges, flagship feature cards, anything representing Ava herself |
| Purple-600 | `#3F3795` | Purple hover states, deep purple accents |
| Purple-50 | `#EEEDFE` | Light purple tint — Ava section backgrounds, active states, info panels |
| Sand-50 | `#FAF8F4` | Page background, section backgrounds — warm white base |
| Heading | `#141418` | All headings and high-emphasis text |
| Body | `#67676E` | All body copy, secondary text, labels |
| Border | `#D9D9CC` | All card borders, dividers, hairline rules |
| White | `#FFFFFF` | Card backgrounds, modal backgrounds |

## Colour Role Rules

- **Orange = user action.** Any element the user interacts with to move forward — buttons, CTAs, sign-up, submit, get started. Never use orange for Ava identity.
- **Purple = Ava identity.** Anything representing Ava or her AI nature — her avatar, badges saying "AI", flagship feature icons, active/selected states in Ava-driven UI. Never use purple for user-action buttons.
- **Sand = page ground.** `#FAF8F4` is the warm white background for all pages and most sections. White `#FFFFFF` is used for cards that sit on top of sand.

## Typography

- Font: **Plus Jakarta Sans** (Google Fonts). Weights: 400 (normal), 600 (semibold), 700 (bold)
- Headings: fluid sizing via `clamp()`, tight tracking (`tracking-tight`), weight 700
- Body: 16px base, `leading-relaxed`, colour `#67676E`
- Labels/eyebrows: 10–12px, `font-semibold`, uppercase, `tracking-widest`, colour `#9CA3AF` (gray-400)

## Component Patterns

### Buttons

```
Primary (user action):
  bg: #FF6A1A  |  text: white  |  hover bg: #D2530F
  border-radius: 6px  |  font: semibold
Secondary / outline:
  bg: white  |  border: #D9D9CC  |  text: #141418
  hover border: #141418
Destructive / cancel:
  bg: white  |  border: #D9D9CC  |  text: #67676E
```

### Cards

```
Standard card:
  bg: white (#FFFFFF)  |  border: 1px solid #D9D9CC  |  border-radius: 8px
Sand card (on white sections):
  bg: #FAF8F4  |  border: 1px solid #D9D9CC
Ava identity card (purple):
  bg: #534AB7  |  text: white  |  border: #3F3795
  Use for: Ava-only plan, AI feature highlights
Info tint card:
  bg: #EEEDFE  |  border: #534AB7/20  |  text: #534AB7
```

### Badges / Pills

```
Live:        bg: green-50  border: green-200   text: green-700  dot: green-500
Roadmap:     bg: amber-50  border: amber-200   text: amber-700  dot: amber-400
Under wraps: bg: #EEEDFE   border: #534AB7/20  text: #534AB7
Ava AI:      bg: #EEEDFE   text: #534AB7
```

### Form Inputs

```
border: #D9D9CC  |  focus border: #FF6A1A
text: #141418    |  placeholder: #A0A0A8
background: white
```

### Integration Tags

```
Xero / QuickBooks:      bg: #EEEDFE  text: #3F3795   (purple — bookkeeping)
Fergus / Simpro:        bg: green-50 text: green-700 (job management)
SMS / WhatsApp / Phone: bg: #FFF4ED  text: #D2530F   (orange — comms)
Gmail / Slack:          bg: #FAF8F4  text: #67676E  border: #D9D9CC (neutral)
```

## Spacing & Layout

- Max content width: 1280px (`max-w-7xl`) for hero, 1024px (`max-w-5xl`) for content sections
- Section padding: `py-24 px-6` (96px vertical, 24px horizontal)
- Card gap: `gap-5` (20px)
- Border radius: 6–8px (`rounded-md`) for cards and buttons
- Dividers: `border-t border-[#D9D9CC]` between sections

## Ava Avatar

- Background: `#534AB7` (purple)
- Icon/initial: white
- Shape: rounded square or circle
- Size: 36–40px inline, 48px+ prominent
- Typing indicator dots: `#534AB7/70`

## Page Background

All pages: `background-color: #FAF8F4`. Alternate sections: `#FFFFFF` to create
rhythm. Dark sections: avoid — brand uses a light/warm palette throughout.

---

# Web-app addendum (app.elasticadmin.com)

The app (index/app/scheduling/connections/reminders + `/dev/` twins) currently
runs an indigo palette on Inter. Migrating it to this system is mostly a CSS
variable swap plus a button-colour split.

## CSS variable mapping (old → new)

| App variable | Old value | New value | Notes |
|---|---|---|---|
| `--bg` | `#F7F7F4` | `#FAF8F4` | Sand-50 page ground |
| `--card` | `#fff` | `#FFFFFF` | unchanged |
| `--line` | `#E9E9E2` | `#D9D9CC` | slightly stronger hairlines |
| `--ink` | `#141418` | `#141418` | unchanged |
| `--ink2` | `#67676E` | `#67676E` | unchanged |
| `--ink3` | `#9C9CA2` | `#9CA3AF` | labels/eyebrows |
| `--ind` | `#5B54E6` | `#534AB7` | **Ava identity only** (Purple-500) |
| `--indbg` | `#EEEDFB` | `#EEEDFE` | Purple-50 |
| `--indtx` | `#3D36C4` | `#3F3795` | Purple-600 |
| `--act` (new) | — | `#FF6A1A` | Orange-500 — primary action |
| `--act2` (new) | — | `#D2530F` | Orange-600 — action hover |
| `--actbg` (new) | — | `#FFF4ED` | Orange-50 tint |

## The critical split: `.btn-p` is no longer purple

Today every primary button uses `--ind` (indigo). Under the new system:

- **`.btn-p` (user-action buttons)** — "Ava sort it", "Draft quote in Fergus",
  "I've sent the quote", "Accepted", Connect/Reconnect, form submits, send
  buttons → **Orange** `#FF6A1A`, hover `#D2530F`, white text.
- **Ava identity surfaces stay purple** `#534AB7`: the Ava avatar and logo
  block, the floating chat bubble + user message bubbles in `ava-chat.js`, "AI"
  badges, Ava's timeline dots, active nav states in Ava-driven UI.
- Rule of thumb: *if clicking it makes something happen, it's orange; if it
  represents Ava, it's purple.*

## Functional/status colours (keep — the site doc doesn't cover these)

| Role | Current tokens | Keep as |
|---|---|---|
| Success / booked / connected | `--grn #0E7A50` on `--grnbg #E7F6EE` | green-700 on green-50 |
| Waiting / warning / quote-drafted | `--amb` amber-700 on amber-50 | unchanged |
| Danger / can't-do / disconnect | red-700 (`#B42318`) on red-50 | unchanged |
| Info / quote-sent | blue-700 on blue-50 | unchanged |

## App-specific components

- **Scheduling lanes**: New = purple-tinted icons (Ava's sorting); Quotes =
  amber `file-dollar`; Waiting on crew = amber clock; Booked = green check.
  Lane pills follow the Badges spec above.
- **Timeline dots**: Ava steps = Purple-500 bg; owner ("Max") steps = Heading
  `#141418`; tradie steps = green. White icon glyphs.
- **Calendar chips**: Fergus-confirmed = solid, Purple-50 bg, Purple-600 text,
  3px Purple-500 left bar; proposed/pending = dashed border, Orange-50 bg,
  Orange-600 text. Legend labels in Body colour.
- **Ava chat widget (`ava-chat.js`)**: bubble + user messages Purple-500
  (identity, not action); send button may be orange (action); Ava replies on
  white cards with `#D9D9CC` border; panel header dark is ACCEPTABLE here as
  the one legacy dark surface, or restyle to Purple-600 to comply.
- **Hero panels**: the app currently uses a dark hero. The brand now avoids
  dark sections — preferred replacement: Sand or Purple-50 panel, Heading text,
  with a Purple-500 accent bar/spark for Ava flavour.
- **Stat tiles**: white cards, `#D9D9CC` border, 3px Purple-500 left accent
  (Ava is doing the work being counted), numbers in Heading colour.
- **Toasts**: Heading `#141418` bg, white text (unchanged — neutral, not dark
  "section").

## Font migration

Swap Inter → **Plus Jakarta Sans** (same Google Fonts pattern, weights
400/600/700) across all app pages, including `/dev/` twins and `ava-chat.js`'s
inline `font-family`.

## Ground rules for the migration

1. Prod and `/dev/` copies must stay identical — change both in the same commit.
2. `ava-chat.js` carries its own inline styles — update it too (both copies).
3. Don't recolour semantic states (green/amber/red/blue) purple or orange.
4. GitHub Pages deploys on push to main — verify live after pushing.
