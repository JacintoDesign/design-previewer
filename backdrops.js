// backdrops.js — optional backgrounds for the preview stage.
//
// Glassmorphism only reads when there's something behind the glass. These
// backdrops are generated from the resolved roles (bg + accent + theme) so they
// automatically match the current theme's brightness and carry the brand
// accent — giving translucent, blurred surfaces something to sit over.
import { firstSolidColor } from './theme.js';

export const BACKDROPS = [
  { id: 'design', name: 'Design' },
  { id: 'aurora', name: 'Aurora' },
  { id: 'spotlight', name: 'Spotlight' },
  { id: 'mesh', name: 'Mesh' },
  { id: 'dots', name: 'Dot grid' },
  { id: 'grid', name: 'Grid' },
  { id: 'plain', name: 'Solid' },
];

/** A solid, paint-able version of the design background (gradients → first stop). */
function solidBase(roles) {
  const s = firstSolidColor(roles.bg);
  return (s && s.str) || (roles.theme === 'dark' ? '#0e0f12' : '#ffffff');
}

/**
 * Return a CSS `background` value for a backdrop id, built from the roles.
 * Pattern layers embed their own size via the `position / size` shorthand.
 */
export function backdropCss(id, roles) {
  const base = solidBase(roles);
  const acc = roles.accent;
  const dark = roles.theme === 'dark';
  const glow = (p) => `color-mix(in srgb, ${acc} ${p}%, transparent)`;
  const ink = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)';

  switch (id) {
    case 'design':
      return roles.bg;

    case 'aurora':
      return (
        `radial-gradient(70% 60% at 12% 8%, ${glow(dark ? 32 : 22)} 0%, transparent 60%),` +
        `radial-gradient(60% 55% at 88% 16%, ${glow(dark ? 18 : 13)} 0%, transparent 55%),` +
        `radial-gradient(90% 80% at 50% 118%, ${glow(dark ? 20 : 11)} 0%, transparent 60%),` +
        base
      );

    case 'spotlight':
      return `radial-gradient(95% 75% at 82% -12%, ${glow(dark ? 28 : 18)} 0%, transparent 55%), ${base}`;

    case 'mesh':
      return (
        `radial-gradient(38% 40% at 18% 22%, ${glow(dark ? 34 : 22)} 0, transparent 52%),` +
        `radial-gradient(42% 44% at 78% 14%, ${glow(dark ? 22 : 15)} 0, transparent 50%),` +
        `radial-gradient(50% 52% at 62% 88%, ${glow(dark ? 26 : 14)} 0, transparent 55%),` +
        `radial-gradient(40% 40% at 40% 55%, ${ink} 0, transparent 55%),` +
        base
      );

    case 'dots':
      return `radial-gradient(${ink} 1.2px, transparent 1.6px) 0 0 / 20px 20px, ${base}`;

    case 'grid':
      return (
        `linear-gradient(${ink} 1px, transparent 1px) 0 0 / 26px 26px,` +
        `linear-gradient(90deg, ${ink} 1px, transparent 1px) 0 0 / 26px 26px,` +
        base
      );

    case 'plain':
      return base;

    default:
      return roles.bg;
  }
}
