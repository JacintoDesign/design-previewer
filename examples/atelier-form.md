---
name: Atelier Form
colors:
  background: "#f6f1e9"
  ivory: "#f6f1e9"
  ivory-deep: "#efe7d8"
  paper: "#fffdf8"
  surface: "#fffdf8"
  ink: "#231f1a"
  ink-soft: "#5b544a"
  ink-faint: "#948c7e"
  hairline: "#ddd3c2"
  accent: "#5b6b4f"
  accent-deep: "#3f4b37"
  on-accent: "#f6f1e9"
  accent-soft: "rgba(91,107,79,0.12)"
  gold: "#a9822f"
  danger: "#a1402f"
  danger-soft: "rgba(161,64,47,0.10)"
typography:
  fontFamily: "Fraunces (Google Fonts; optical size, weights 400·500·600) → Georgia, Cambria, serif"
  display-lg:
    fontFamily: Fraunces
    fontSize: 72px
    fontWeight: "600"
    lineHeight: 76px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Fraunces
    fontSize: 40px
    fontWeight: "500"
    lineHeight: 46px
  headline-md:
    fontFamily: Fraunces
    fontSize: 28px
    fontWeight: "500"
    lineHeight: 34px
  headline-sm:
    fontFamily: Fraunces
    fontSize: 22px
    fontWeight: "500"
    lineHeight: 28px
  body-lg:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 30px
  body-md:
    fontFamily: Newsreader
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 26px
  label-sm:
    fontFamily: Fraunces
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.08em
  caption:
    fontFamily: Newsreader
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 18px
    letterSpacing: 0.02em
rounded:
  sm: 2px
  DEFAULT: 4px
  md: 4px
  lg: 6px
  xl: 8px
  full: 999px
spacing:
  unit: 8px
  container-padding: 48px
  section-gap: 64px
  card-gap: 24px
motion:
  dur-fast: 0.15s
  dur-standard: 0.3s
  dur-slow: 0.5s
  ease-standard: "cubic-bezier(0.4, 0, 0.2, 1)"
shadows:
  shadow-sm: "0 1px 2px rgba(35,31,26,0.06)"
  shadow-md: "0 8px 24px rgba(35,31,26,0.08)"
  shadow-lg: "0 24px 64px rgba(35,31,26,0.12)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    height: 46px
    padding: 0 28px
  button-primary-hover:
    backgroundColor: "{colors.accent-deep}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    height: 46px
    padding: 0 26px
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 46px
    padding: 0 16px
  card-standard:
    backgroundColor: "{colors.paper}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: 32px
  badge:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-deep}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 3px 12px
  nav-item:
    backgroundColor: transparent
    textColor: "{colors.ink-soft}"
    typography: "{typography.label-sm}"
    padding: 10px 4px
  nav-item-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.ink}"
---

## Brand & Style

Atelier Form is the design system for a made-to-order furniture and object
atelier — the opposite instinct from a glass dashboard or a brutalist ledger.
Where those systems reach for blur, borders, or bold weight, this one reaches
for quiet: warm ivory paper, a single restrained sage accent, hairline
borders instead of shadows or fills, and generous, unhurried whitespace.
Nothing here is trying to look fast. The brand personality is considered and
material — every surface reads like it was chosen, not generated.

## Colors

- **Ivory / Paper**: the base is a warm, slightly textured off-white rather
  than clinical white; cards sit on a near-white `paper` a shade lighter than
  the page itself, separated by a hairline rather than a shadow.
- **Ink ramp**: `ink` (near-black with a warm undertone) for headings and
  body text, `ink-soft` for secondary copy, `ink-faint` for captions and
  metadata — a three-step ramp instead of a long scale, kept deliberately
  short.
- **Accent** (`#5b6b4f`, a deep sage): the only chromatic color doing
  interactive work — primary actions, active nav, focus states. `accent-soft`
  washes a selected card or badge; `accent-deep` is the pressed/hover state.
- **Gold** (`#a9822f`): a secondary metallic used sparingly for dividers,
  price emphasis, or a small decorative rule — never for interactive
  elements, so it stays a material accent rather than a second brand color.
- **Danger** (`#a1402f`, a muted brick): validation and destructive actions
  stay in the same tonal family as the rest of the palette rather than
  jumping to a saturated red.

## Typography

**Fraunces** — a high-contrast display serif — carries every heading, from
the `72px` display size down to small tracked labels, giving the system one
consistent editorial voice at every scale. **Newsreader**, a text serif built
for long-form reading, carries body copy and captions. Pairing two serifs
instead of a serif-plus-sans combination is the point: nothing in this system
is allowed to read as "UI font" — it should read as typeset.

## Layout & Spacing

Whitespace is the primary layout tool. Containers keep a generous `48px`
outer padding, sections separate by `64px`, and cards within a section keep a
`24px` gap — wide enough that each piece has room to be looked at
individually, the way a single object would be lit on a plinth.

## Elevation & Depth

Depth is almost entirely suppressed. Where the other systems in this set use
blur or hard offset shadows, Atelier Form uses barely-there ambient shadows
(`shadow-sm` through `shadow-lg`, all soft and low-opacity) and, more often,
a simple `1px` hairline border to separate a card from the page. Elevation
here reads as "closer," never "louder."

## Shapes

Corners stay small and consistent — `2px` to `4px` on controls and cards,
`6–8px` at most on larger containers — enough to soften an edge without
reading as playful or rounded. `999px` is reserved for the one pill shape in
the system: small accent badges.

## Components

### Buttons

**Primary** is a solid sage fill with cream text, no border, no shadow — the
one place a solid fill appears. **Ghost**, used far more often, is a hairline
outline over the paper surface with ink text; hover states are a color shift,
never a fill change, keeping the overall page reading as quiet as possible.

### Inputs, cards, and badges

Inputs share the hairline-border, no-shadow language of the rest of the
system, with the accent reserved for a focused-state border color rather than
a glow. Cards are a paper surface with a hairline border and generous
padding. Badges are the one pill shape here — a soft sage wash used for
availability tags and small status labels.

### Navigation

Nav items are unstyled text until active, at which point they take a soft
sage wash rather than a hard fill or an underline — consistent with a system
that treats emphasis as a whisper, not a shout.
