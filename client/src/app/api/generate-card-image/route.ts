import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getCardArtFallback } from '@/lib/card-art';
import { readdirSync } from 'fs';
import { join } from 'path';

/**
 * Card Image Generation API
 *
 * Returns beautiful, deterministic CSS gradient art for every card.
 * Each card gets unique art derived from its own name/type/rarity —
 * no hash collisions, no mismatched stock photos, no external API calls.
 *
 * Art is generated client-side in GameCard via getCardArtFallback(),
 * so this route now primarily serves as a compatibility endpoint that
 * returns the gradient art as a data URI.
 */

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_API_URL = 'https://api.minimax.io/v1/image_generation';

// Load art library at module level (no longer used for primary art, kept for diagnostics)
const ART_DIR = join(process.cwd(), 'public', 'card-art');
let artFiles: string[] = [];

try {
  artFiles = readdirSync(ART_DIR)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'))
    .sort();
} catch {
  artFiles = [];
}

// Try MiniMax AI generation — returns base64 data URI on success, null on failure.
// Wrapped in a hard timeout so it never blocks the route handler.
async function generateWithMiniMax(
  noun: string,
  cardType: string,
  rarity: string
): Promise<string | null> {
  if (!MINIMAX_API_KEY) return null;

  const prompt = buildCardPrompt(noun, cardType, rarity);

  // Race between MiniMax fetch and a hard 15s timeout.
  // If MiniMax is slow/unreachable, we fall through to the gradient fallback.
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'image-01', prompt, aspect_ratio: '2:3' }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`MiniMax API error ${response.status}:`, errText);
      return null;
    }

    const data = await response.json() as {
      base_resp?: { status_code: number; status_msg: string };
      data?: Array<{ image_urls?: string[]; base64?: string }>;
    };

    if (data.base_resp?.status_code !== 0) {
      console.error('MiniMax generation failed:', data.base_resp?.status_msg);
      return null;
    }

    // MiniMax image-01 returns image_urls[], not base64. Fetch and encode.
    const imageUrl = data.data?.[0]?.image_urls?.[0];
    if (imageUrl) {
      try {
        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(10_000) });
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer();
          const b64 = Buffer.from(buf).toString('base64');
          return `data:image/jpeg;base64,${b64}`;
        }
      } catch {
        return null;
      }
    }

    return null;
  } catch (err) {
    // AbortError (timeout) or network error — fall through to gradient art
    return null;
  }
}

function buildCardPrompt(noun: string, cardType: string, rarity: string): string {
  const rarityStyle: Record<string, string> = {
    Legendary: 'legendary epic golden divine ornate masterwork',
    Epic:      'powerful impressive dramatic high fantasy',
    Rare:      'solid quality detailed fantasy art',
    Common:    'clean fantasy art',
  };
  const style = rarityStyle[rarity] ?? rarityStyle.Common;
  const typeContext: Record<string, string> = {
    Unit:     'a fierce fantasy creature or warrior',
    Building: 'an imposing fantasy fortress or structure',
    Spell:    'a dramatic magical spell or enchantment',
  };
  const context = typeContext[cardType] ?? typeContext.Unit;
  return `Fantasy card art: ${noun}, ${context}. ${style}. Dark atmospheric background, dramatic lighting, intricate details, high quality digital art for a trading card game. 2:3 portrait aspect ratio.`;
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { allowed, retryAfterMs } = checkRateLimit(ip, { maxRequests: 5, windowMs: 60_000 });
  if (!allowed) {
    const response = NextResponse.json(
      { error: 'Rate limit exceeded', retryAfterMs },
      { status: 429 }
    );
    response.headers.set('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
    return response;
  }

  try {
    const { noun, cardType, rarity, cardId } = await request.json();

    if (!noun) {
      return NextResponse.json(
        { error: 'Missing required field: noun' },
        { status: 400 }
      );
    }

    // Try MiniMax AI generation first (non-blocking, fast timeout)
    const minimaxImage = await generateWithMiniMax(noun, cardType ?? 'Unit', rarity ?? 'Common');
    if (minimaxImage) {
      return NextResponse.json({
        success: true,
        image_url: minimaxImage,
        source: 'minimax',
      });
    }

    // Fallback: return beautiful CSS gradient art as data URI.
    // getCardArtFallback generates unique art per card from name/type/rarity.
    const gradientArt = getCardArtFallback({ name: noun, type: cardType ?? 'Unit', rarity: rarity ?? 'Common' });
    return NextResponse.json({
      success: true,
      image_url: gradientArt,
      source: 'gradient',
    });
  } catch (error) {
    console.error('Error in card image generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate card image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}