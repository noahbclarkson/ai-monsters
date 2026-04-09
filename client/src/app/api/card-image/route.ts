import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = join(process.cwd(), '.card-image-cache');

// Ensure cache directory exists
function getCachePath(cardId: string): string {
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch {
    // Ignore errors creating directory
  }
  return join(CACHE_DIR, `${cardId}.jpg`);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const cardId = searchParams.get('cardId');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // If we have a cardId and the image is cached locally, serve from cache
  if (cardId) {
    const cachePath = getCachePath(cardId);
    if (existsSync(cachePath)) {
      try {
        const cached = readFileSync(cachePath);
        return new NextResponse(cached, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Image-Source': 'cache',
          },
        });
      } catch {
        // Cache read failed, fall through to fetch
      }
    }
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'Accept': 'image/jpeg,image/png,image/webp,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://api.minimax.io/',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error('Failed to fetch card image:', response.status, imageUrl);
      return NextResponse.json(
        { error: 'Failed to fetch image', status: response.status },
        { status: 502 }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(imageBuffer);

    // Cache the image locally if we have a cardId
    if (cardId) {
      try {
        const cachePath = getCachePath(cardId);
        writeFileSync(cachePath, buffer);
      } catch {
        // Cache write failed, continue without caching
      }
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Image-Source': 'origin',
      },
    });
  } catch (error) {
    console.error('Error proxying card image:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 502 }
    );
  }
}
