/**
 * Deterministic card art assignment from the local art library.
 *
 * Each unique card name maps to a consistent image from /card-art/.
 * This ensures the same card always shows the same art, even when
 * the card was auto-generated without an AI image.
 */

const ART_FILES = [
  'dark-knight.png',
  'ice-phoenix.png',
  'stone-golem.png',
  'shadow-spectre.png',
  'golden-dragon.png',
  'fireball-spell.png',
  'dark-fortress.png',
  'storm-wizard.png',
  'plague-spell.png',
  'crystal-sanctuary.png',
  'bone-dragon.png',
];

// Simple deterministic hash from string to number
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns a /card-art/ path for the given card name.
 * Deterministic: same name always returns the same art.
 */
export function getCardArtFallback(cardName: string): string {
  if (!cardName) return `/card-art/${ART_FILES[0]}`;
  const index = hashString(cardName) % ART_FILES.length;
  return `/card-art/${ART_FILES[index]}`;
}
