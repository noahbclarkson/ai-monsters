/**
 * CSS-based deterministic card art fallback generator.
 *
 * When a card has no AI-generated image (MiniMax failed, not yet generated,
 * or is an older card), this generates a beautiful, deterministic gradient art
 * piece from the card's own attributes.
 *
 * Every card gets unique art derived from its name/type/rarity — no hash
 * collisions, no mismatched stock photos, no empty slots.
 */

export interface CardArtParams {
  name: string;
  type: string;
  rarity: string;
}

/** Per-rarity color palette (border, glow, gradient) */
const RARITY_PALETTE: Record<string, { c1: string; c2: string; accent: string }> = {
  Common:    { c1: '#1e293b', c2: '#334155', accent: '#64748b' },
  Rare:      { c1: '#1e3a5f', c2: '#2563eb', accent: '#60a5fa' },
  Epic:      { c1: '#4a1080', c2: '#7c3aed', accent: '#c084fc' },
  Legendary: { c1: '#451a03', c2: '#d97706', accent: '#fbbf24' },
};

/** Per-type background shape — used as inline CSS fill, not SVG gradient ID */
const TYPE_CSS_GRADIENT: Record<string, string> = {
  Unit:     'radial-gradient(ellipse at 35% 30%, rgba(239,68,68,0.3) 0%, transparent 60%)',
  Building: 'radial-gradient(ellipse at 65% 35%, rgba(99,102,241,0.3) 0%, transparent 60%)',
  Spell:    'radial-gradient(ellipse at 50% 25%, rgba(34,211,238,0.3) 0%, transparent 60%)',
  Structure:'radial-gradient(ellipse at 50% 70%, rgba(168,85,247,0.25) 0%, transparent 60%)',
};

/** Name-derived color accents for variety */
const NAME_ACCENTS: [string, string, string][] = [
  ['#ef4444', '#dc2626', '#fca5a5'], // red
  ['#3b82f6', '#1d4ed8', '#93c5fd'], // blue
  ['#22c55e', '#15803d', '#86efac'], // green
  ['#f59e0b', '#b45309', '#fcd34d'], // amber
  ['#a855f7', '#7e22ce', '#d8b4fe'], // purple
  ['#ec4899', '#be185d', '#f9a8d4'], // pink
  ['#06b6d4', '#0e7490', '#67e8f9'], // cyan
  ['#f97316', '#c2410c', '#fdba74'], // orange
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/** Returns initials from a card name (up to 2 chars) */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Generates a deterministic CSS gradient "art" image as a data URI.
 * Each card gets unique, matching art derived from its own attributes.
 */
export function getCardArtFallback(params: CardArtParams): string {
  const { name, type, rarity } = params;
  const rarityPalette = RARITY_PALETTE[rarity] ?? RARITY_PALETTE.Common;
  const typeCssGradient = TYPE_CSS_GRADIENT[type] ?? TYPE_CSS_GRADIENT.Unit;
  const nameIndex = hashString(name) % NAME_ACCENTS.length;
  const nameAccent = NAME_ACCENTS[nameIndex];

  // Build initials
  const initials = getInitials(name);

  // SVG dimensions for 2:3 card art (200x300)
  const W = 200;
  const H = 300;

  // Build SVG with layered gradients
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <!-- Base rarity gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${rarityPalette.c1}"/>
      <stop offset="100%" stop-color="${rarityPalette.c2}"/>
    </linearGradient>

    <!-- Name-derived color accent overlay (top-left highlight) -->
    <radialGradient id="nameAccent" cx="20%" cy="15%" r="40%">
      <stop offset="0%" stop-color="${nameAccent[0]}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${nameAccent[0]}" stop-opacity="0"/>
    </radialGradient>

    <!-- Secondary accent from name (bottom-right) -->
    <radialGradient id="nameAccent2" cx="80%" cy="85%" r="35%">
      <stop offset="0%" stop-color="${nameAccent[2]}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${nameAccent[2]}" stop-opacity="0"/>
    </radialGradient>

    <!-- Rarity shimmer stripe -->
    <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0)" stop-opacity="0"/>
      <stop offset="40%" stop-color="rgba(255,255,255,0.06)" stop-opacity="1"/>
      <stop offset="60%" stop-color="rgba(255,255,255,0.06)" stop-opacity="1"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)" stop-opacity="0"/>
    </linearGradient>

    <!-- Center radial glow (must be inside defs to be referenced by url) -->
    <radialGradient id="centerGlow" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="${rarityPalette.accent}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${rarityPalette.accent}" stop-opacity="0"/>
    </radialGradient>

    <!-- Subtle grid pattern -->
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
    </pattern>
  </defs>

  <!-- Base fill -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Grid overlay -->
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity="0.6"/>

  <!-- Name accent (top-left color burst from name hash) -->
  <rect width="${W}" height="${H}" fill="url(#nameAccent)"/>

  <!-- Secondary accent (bottom-right) -->
  <rect width="${W}" height="${H}" fill="url(#nameAccent2)"/>

  <!-- Type shape (CSS gradient, applied directly as fill for broad browser compat) -->
  <rect width="${W}" height="${H}" fill="${typeCssGradient}"/>

  <!-- Center radial glow from rarity accent -->
  <rect width="${W}" height="${H}" fill="url(#centerGlow)"/>

  <!-- Shimmer stripe -->
  <rect width="${W}" height="${H}" fill="url(#shimmer)"/>

  <!-- Card initials (centered, large) -->
  <text
    x="${W / 2}"
    y="${H / 2 - 12}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="serif"
    font-size="52"
    font-weight="900"
    fill="rgba(255,255,255,0.12)"
    letter-spacing="2"
  >${initials}</text>

  <!-- Card name at bottom -->
  <text
    x="${W / 2}"
    y="${H - 28}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="sans-serif"
    font-size="9"
    font-weight="600"
    fill="rgba(255,255,255,0.25)"
    letter-spacing="1.5"
    textLength="${W * 0.8}"
    lengthAdjust="spacingAndGlyphs"
  >${escapeXml(name.toUpperCase())}</text>

  <!-- Rarity bar (left edge accent line) -->
  <rect x="0" y="0" width="3" height="${H}" fill="${rarityPalette.accent}" opacity="0.6" rx="1.5"/>

  <!-- Top fade -->
  <rect x="0" y="0" width="${W}" height="40" fill="url(#topFade)" opacity="0.5"/>
  <defs>
    <linearGradient id="topFade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
