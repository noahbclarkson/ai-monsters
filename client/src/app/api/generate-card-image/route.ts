import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { readdirSync } from 'fs';
import { join } from 'path';

/**
 * Card Image Generation API
 *
 * Uses a curated library of AI-generated fantasy art images stored in public/card-art/.
 * Each card gets a deterministic image assignment based on its cardId, ensuring
 * the same card always shows the same art.
 *
 * The art library is pre-generated using the OpenClaw image_generate tool (minimax-portal).
 */

// Load art library once at module level
const ART_DIR = join(process.cwd(), 'public', 'card-art');
let artFiles: string[] = [];

try {
  artFiles = readdirSync(ART_DIR)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'))
    .sort();
} catch {
  console.warn('card-art directory not found, cards will use themed placeholders');
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

    if (artFiles.length === 0) {
      return NextResponse.json({
        success: false,
        image_url: '',
        message: 'Art library not available; using themed placeholder'
      });
    }

    // Deterministic art selection based on cardId
    // Uses the cardId as a seed so the same card always gets the same art
    const seed = typeof cardId === 'number' ? cardId : Date.now();
    const index = seed % artFiles.length;
    const selectedArt = artFiles[index];

    // The image URL is relative to public/ — Next.js serves these at /card-art/filename
    const imageUrl = `/card-art/${selectedArt}`;

    return NextResponse.json({
      success: true,
      image_url: imageUrl,
      art_file: selectedArt,
    });
  } catch (error) {
    console.error('Error in card image assignment:', error);
    return NextResponse.json(
      { error: 'Failed to assign card image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
