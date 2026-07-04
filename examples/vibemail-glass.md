---
name: VibeMail Glass
colors:
  accent: "#30d158"
  accent-hover: "#4fe06f"
  accent-active: "#25a847"
  accent-soft: "rgba(48,209,88,0.16)"
  accent-glow: "rgba(48,209,88,0.45)"
  on-accent: "#06210f"
  dot-unread: "#30d158"
  star-active: "#30d158"
  star-idle: "rgba(255,255,255,0.22)"
  navy-deep: "#080808"
  navy: "#111111"
  navy-raised: "#1c1c1e"
  canvas: "radial-gradient(120% 120% at 80% -10%, #1e1e1e 0%, #111111 42%, #080808 100%)"
  glass-0: "rgba(255,255,255,0.05)"
  glass-1: "rgba(255,255,255,0.08)"
  glass-2: "rgba(255,255,255,0.11)"
  glass-hover: "rgba(255,255,255,0.14)"
  glass-drawer: "rgba(20,20,20,0.82)"
  glass-scrim: "rgba(8,8,8,0.55)"
  border-hairline: "rgba(255,255,255,0.10)"
  border-default: "rgba(255,255,255,0.14)"
  border-strong: "rgba(255,255,255,0.22)"
  border-top-sheen: "rgba(255,255,255,0.12)"
  text-primary: "#fdfcfc"
  text-secondary: "#c8c9d4"
  text-body-ink: "#a6a8b6"
  text-muted: "#9a9898"
  text-faint: "#6e6e73"
  text-disabled: "#565760"
  success: "#30d158"
  warning: "#ff9f0a"
  warning-hover: "#d77f00"
  danger: "#ff453a"
  danger-hover: "#d70015"
  danger-soft: "rgba(255,69,58,0.12)"
typography:
  fontFamily: "JetBrains Mono (next/font/google; weights 400·500·700) → ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
  display:
    fontFamily: "JetBrains Mono"
    fontSize: 38px
    fontWeight: "700"
  title:
    fontFamily: "JetBrains Mono"
    fontSize: 22px
    fontWeight: "700"
    lineHeight: 1.3
  heading:
    fontFamily: "JetBrains Mono"
    fontSize: 16px
    fontWeight: "700"
  body:
    fontFamily: "JetBrains Mono"
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 1.6
  row:
    fontFamily: "JetBrains Mono"
    fontSize: 13px
    fontWeight: "500"
  caption:
    fontFamily: "JetBrains Mono"
    fontSize: 12px
    fontWeight: "400"
  micro:
    fontFamily: "JetBrains Mono"
    fontSize: 11px
    fontWeight: "400"
    letterSpacing: 0.08em
rounded:
  sm: 7px
  md: 12px
  full: 999px
spacing:
  control-h: 36px
  control-h-lg: 44px
  button-sm: 28px
  button-md: 36px
  button-lg: 44px
  row-gap: 7px
  card-padding: 14px
motion:
  dur-fast: 0.12s
  dur-standard: 0.2s
  dur-slow: 0.32s
  ease-standard: "cubic-bezier(0.2, 0.85, 0.3, 1)"
  ease-out: "cubic-bezier(0.4, 0.9, 0.6, 1)"
shadows:
  shadow-0: "0 2px 8px rgba(0,0,0,0.28)"
  shadow-1: "0 4px 16px rgba(0,0,0,0.34)"
  shadow-2: "0 8px 24px rgba(0,0,0,0.42)"
  shadow-3: "0 16px 48px rgba(0,0,0,0.52)"
  shadow-drawer: "0 -16px 48px rgba(0,0,0,0.50)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.row}"
    rounded: "{rounded.sm}"
    height: "{spacing.button-md}"
    padding: 0 18px
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.glass-1}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border-default}"
    typography: "{typography.row}"
    rounded: "{rounded.sm}"
    height: "{spacing.button-md}"
    padding: 0 18px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.text-muted}"
    typography: "{typography.row}"
    rounded: "{rounded.sm}"
    height: "{spacing.button-md}"
    padding: 0 16px
  input-field:
    backgroundColor: "{colors.glass-1}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border-default}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    height: "{spacing.control-h}"
    padding: 0 14px
  badge:
    backgroundColor: "{colors.glass-1}"
    textColor: "{colors.text-secondary}"
    border: "1px solid {colors.border-hairline}"
    typography: "{typography.micro}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  badge-draft:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-accent}"
  recipient-chip:
    backgroundColor: "{colors.glass-2}"
    textColor: "{colors.text-secondary}"
    border: "1px solid {colors.border-default}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 3px 10px
  glass-card:
    backgroundColor: "{colors.glass-0}"
    border: "1px solid {colors.border-hairline}"
    rounded: "{rounded.md}"
    padding: "{spacing.card-padding}"
  nav-item:
    backgroundColor: transparent
    textColor: "{colors.text-muted}"
    typography: "{typography.row}"
    rounded: "{rounded.sm}"
    padding: 8px 10px
  nav-item-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.text-primary}"
---

## Overview

VibeMail Glass is the design system behind a single-page email client, not a
marketing site — every surface below is read through that lens. The brand is
two decisions held with total discipline: **one monospaced face everywhere**
(JetBrains Mono, no exceptions) and **one green accent** (`#30d158`) reserved
for everything interactive — unread dots, stars, active folders, focus rings,
and primary buttons. Everything else in the chrome is monochrome glass over a
near-black charcoal canvas.

Depth is expressed through blur and shadow, never through added color: each
panel is a translucent white-on-near-black fill, `backdrop-filter: blur()`
scaled to its elevation tier, a thin white-opacity border, and a 1px top-edge
sheen that reads as a light source above the glass. The system is themeable at
runtime across theme, density, glass level, and font scale — defaults are
**dark · green · medium glass · compact density**.

## Colors

The accent is the only chromatic color anywhere in the chrome — reserve it
strictly for interactive and status signaling.

- **Accent** (`#30d158`): primary buttons, the compose action, active folder
  fill, unread dots, filled stars, and focus rings. Hover/active deepen to
  `accent-hover` / `accent-active`; `accent-soft` washes an active row or
  folder; `accent-glow` blooms around the unread dot.
- **Canvas** — a near-black charcoal radial gradient (`#1e1e1e → #111111 →
  #080808`), fixed behind everything. It's the material the glass floats over,
  not a panel itself.
- **Glass 0/1/2** (`5% / 8% / 11%` white): three elevation tiers — base rows,
  card/input surfaces, and raised chips/controls. `glass-hover` (`14%`) lifts a
  row or control on hover; `glass-drawer` is the near-opaque float used for the
  compose drawer and pop-outs.
- **Text** steps from `text-primary` (near-white) down through `text-secondary`,
  `text-body-ink`, `text-muted`, `text-faint`, to `text-disabled`.
- **Semantic**: `warning` (`#ff9f0a`) marks the Draft badge; `danger`
  (`#ff453a`) marks destructive actions and validation, always over
  `danger-soft`, never as a solid fill.

## Typography

**JetBrains Mono**, and only JetBrains Mono — no sans-serif, display face, or
italic anywhere in the chrome. Weight is the hierarchy device on a single
face: **700** for headings and unread emphasis, **500** for buttons and active
states, **400** for body and idle text. The scale runs `display` (38px, the
wordmark) → `title` (22px, thread subjects) → `heading` (16px, folder/dialog
titles) → `body` (14px, message text and inputs) → `row` (13px, list rows and
button labels) → `caption` (12px, timestamps and meta) → `micro` (11px,
uppercase section labels, tracked at `0.08em`).

## Layout & Spacing

Dense and utilitarian by design, not generous — this is a working tool, not a
landing page. Controls sit at a consistent `36px` (`44px` on touch), list rows
run `7px` apart, and cards take `14px` of padding. Spacing is local to each
surface rather than driven by a rigid multiplier scale: expect frequent
2/4/6/7/10px steps that keep monospaced rows tight. The default shell is a
three-pane, resizable desktop layout — sidebar, message list, reading pane —
collapsing to a single panel with a slide-in nav drawer below 700px.

## Elevation & Depth

Elevation is blur intensity and shadow depth, never added color. Four tiers
scale together: **0 — Base** (`glass-0`, `blur(20px)`, `shadow-0`) for list
backgrounds and rows; **1 — Card** (`glass-1`, `blur(28px)`, `shadow-1`) for
cards, inputs, and the sidebar; **2 — Raised** (`glass-2`, `blur(36px)`,
`shadow-2`) for chips and raised controls; **3 — Float** (`glass-drawer`,
`blur(40px)`, `shadow-3`) for the compose drawer, pop-out windows, and
popovers. Every glass panel pairs its blur with the `border-top-sheen` inset
highlight — without it, a 5–14% fill reads as nearly invisible.

## Shapes

Two container radii, deliberately kept to two: **7px** (`rounded.sm`) on every
interactive control — buttons, inputs, nav items, badges — and **12px**
(`rounded.md`) on containers — cards, the compose drawer, pop-outs, and
popovers. **999px** (`rounded.full`) is reserved for dots, pills, recipient
chips, and avatars. Icons are line-style SVG at a 1.75px stroke, no fills, no
photography.

## Components

### Buttons

Three variants, one shape: **primary** (accent fill, `on-accent` text, a top
sheen) for Compose and Send; **secondary** (`glass-1` fill, default border)
for Save draft and Load more; **ghost** (transparent, muted text, brightens on
hover) for bulk actions and inline thread controls. All three share the same
`rounded.sm` corner and `row` typography at weight 500.

### Inputs & chips

Inputs use the `glass-1` surface with a default border and the `body` type
role; on focus the border turns accent with a soft `accent-soft` halo.
Recipient chips are `glass-2` pills (`rounded.full`) carrying a small avatar
and a remove control — the one place a pill fully replaces the 7/12px radius
pair.

### Cards, badges, and nav

Glass cards are the base container primitive: `glass-0` fill, hairline border,
`rounded.md`. Badges are small `rounded.sm` chips in `micro` type — mostly
neutral `glass-1`, except the amber **Draft** badge. Sidebar nav items are
transparent by default; the active item gets an `accent-soft` fill, an accent
icon, and — in the real app — a 2px accent left border that this preview's
generic nav styling approximates with the fill alone.
