---
name: Ledger Bolt
colors:
  ink: "#0a0a0a"
  background: "#f7f5ef"
  paper: "#f7f5ef"
  paper-raised: "#ffffff"
  surface: "#ffffff"
  surface-alt: "#efece1"
  line: "#0a0a0a"
  muted: "#6f6d63"
  accent: "#cbff3d"
  accent-hover: "#b8f01f"
  on-accent: "#0a0a0a"
  chip-blue: "#3d6bff"
  on-chip-blue: "#ffffff"
  success: "#0f8a3c"
  warning: "#ffb100"
  danger: "#ff3b30"
  danger-soft: "#ffe1dc"
typography:
  fontFamily: "Archivo (Google Fonts; weights 400·700·800) → ui-sans-serif, system-ui, sans-serif"
  headline-xl:
    fontFamily: Archivo
    fontSize: 64px
    fontWeight: "800"
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Archivo
    fontSize: 40px
    fontWeight: "800"
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Archivo
    fontSize: 26px
    fontWeight: "700"
    lineHeight: 32px
  headline-sm:
    fontFamily: Archivo
    fontSize: 20px
    fontWeight: "700"
    lineHeight: 24px
  body-lg:
    fontFamily: IBM Plex Mono
    fontSize: 16px
    fontWeight: "500"
    lineHeight: 24px
  body-md:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
  label-md:
    fontFamily: Archivo
    fontSize: 13px
    fontWeight: "800"
    lineHeight: 16px
    letterSpacing: 0.04em
  caption:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0px
  DEFAULT: 3px
  md: 3px
  lg: 3px
  xl: 3px
  full: 999px
spacing:
  unit: 8px
  control-h: 44px
  border-w: 3px
  card-padding: 20px
  gutter: 24px
motion:
  dur-fast: 0.08s
  dur-standard: 0.12s
  ease-snap: "cubic-bezier(0.2, 0, 0, 1)"
shadows:
  shadow-sm: "3px 3px 0 #0a0a0a"
  shadow-md: "6px 6px 0 #0a0a0a"
  shadow-lg: "10px 10px 0 #0a0a0a"
  shadow-press: "1px 1px 0 #0a0a0a"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    border: "3px solid {colors.line}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: "{spacing.control-h}"
    padding: 0 22px
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    border: "3px solid {colors.line}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: "{spacing.control-h}"
    padding: 0 22px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    border: "3px solid transparent"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 0 18px
  input-field:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    border: "3px solid {colors.line}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: "{spacing.control-h}"
    padding: 0 14px
  badge:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    border: "2px solid {colors.line}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  badge-negative:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
  stat-card:
    backgroundColor: "{colors.paper-raised}"
    border: "3px solid {colors.line}"
    rounded: "{rounded.md}"
    padding: "{spacing.card-padding}"
  nav-item:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 10px 12px
  nav-item-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
---

## Brand & Style

Ledger Bolt is a neo-brutalist system for a budgeting and bill-splitting tool —
built to feel fast, blunt, and trustworthy, the opposite of soft fintech
gradients. Every surface is flat, opaque, and outlined in solid ink-black; the
only softness in the whole system is the single lime accent reserved for
money moving in your favor. Nothing blurs, nothing floats — corners are
nearly square and shadows are hard-edged offsets, not diffuse glows, so every
control reads as a physical object you can press.

The tone is confident and a little loud on purpose: bold Archivo headlines
paired with IBM Plex Mono for anything numeric, because figures in a ledger
should look counted, not decorated.

## Colors

- **Ink** (`#0a0a0a`): text, borders, and hard-shadow color — used everywhere,
  never softened to gray.
- **Paper / Paper Raised**: a warm off-white base (`paper`) with pure-white
  cards (`paper-raised`) stacked on top, separated by ink borders rather than
  shadows or tint shifts.
- **Accent** (`#cbff3d`): the one loud color — primary actions, positive
  balances, and the active nav state's inverse. It never appears twice at
  once; if the accent is a fill, everything else on that surface goes flat
  ink-on-white.
- **Chip Blue** (`#3d6bff`): the sole secondary hue, reserved for category
  tags so the ledger's tag system stays scannable without competing with the
  accent.
- **Semantic**: `success` and `danger` are desaturated enough to sit next to
  the lime accent without fighting it; `danger-soft` backs negative-balance
  badges so red stays a background wash, not another shout.

## Typography

**Archivo** at heavy weights (700–800) carries every heading and label — this
system leans on weight and size contrast rather than color for hierarchy.
**IBM Plex Mono** is reserved for anything that is, or reads as, a number:
balances, line-item amounts, dates. Pairing a grotesk display face with a
mono figure face is the whole typographic idea: headlines shout, numbers
count.

## Layout & Spacing

Controls are chunky — a flat `44px` height across buttons and inputs, sized
for a thumb, not a cursor. An `8px` base unit governs spacing, but borders do
the real separating: a `3px` ink border around every card and control means
gaps between elements can stay tight (`24px` gutters) without surfaces
bleeding into each other.

## Elevation & Depth

There is no blur and no soft shadow anywhere in this system — elevation is
communicated with **hard, offset shadows**: a flat black silhouette
(`3px 3px 0`, `6px 6px 0`, `10px 10px 0`) with zero blur radius, so a raised
element looks stacked, not lit. Pressed/active states shrink the offset to
`1px 1px 0`, reading as the object physically pushing into the page.

## Shapes

Corners stay close to square — `0px` on the smallest chips, `3px` everywhere
else — so nothing here reads as soft or friendly by accident. The one
exception is `999px` on dots and pill badges, kept fully round specifically so
they contrast with the squared-off cards and buttons around them.

## Components

### Buttons

**Primary** is the lime fill with an ink border and a hard shadow that
compresses on press. **Secondary** swaps the fill for white but keeps the
same border weight, so the two read as siblings rather than a hierarchy of
softness. **Ghost** drops the border to transparent for inline row actions,
the one place this system allows something to look "lighter."

### Inputs, badges, and stat cards

Inputs share the button's `3px` ink border and flat white fill — there is no
focus glow, only a border-color swap to accent. Badges are small bordered
chips in bold Archivo, with a soft-red variant for negative amounts. Stat
cards are the dashboard's core unit: a bordered white block with a hard
shadow, a mono figure at `headline` size, and a label above it in tracked
uppercase Archivo.

### Navigation

Sidebar items are flat and transparent until active, at which point the whole
row inverts to a solid ink fill with paper-colored text — a blunt,
unambiguous "you are here" that matches the system's no-gradient, no-glow
philosophy.
