import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

// MiniMax Image Generation API endpoint
const MINIMAX_API_URL = 'https://api.minimax.io/v1/image_generation';

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per minute per IP (image gen is heavier)
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

    const apiKey = process.env.MINIMAX_API_KEY;

    if (!apiKey) {
      // Return a structured placeholder URL when no API key is configured
      const safeName = noun.toLowerCase().replace(/\s+/g, '-');
      const safeType = cardType.toLowerCase();
      return NextResponse.json({
        success: false,
        image_url: `https://picsum.photos/seed/${safeName}-${cardId}/832/1248`,
        message: 'MINIMAX_API_KEY not configured; using placeholder'
      });
    }

    // Build the image prompt
    let prompt = `${noun} ${cardType.toLowerCase()}, fantasy card art, `;

    switch (cardType) {
      case 'Unit':
        prompt += `a mighty ${rarity.toLowerCase()} warrior or creature, character design, detailed armor and weaponry, dynamic battle pose, dramatic lighting, fantasy setting, `;
        break;
      case 'Building':
        prompt += `an ancient ${rarity.toLowerCase()} fortress or magical structure, detailed fantasy architecture, mystical atmosphere, glowing runes and magical defenses, `;
        break;
      case 'Spell':
        prompt += `a powerful ${rarity.toLowerCase()} magical spell or enchantment, swirling arcane energy, mystical symbols, ethereal glow, fantasy magic effects, `;
        break;
    }

    prompt += `2D game card art, portrait orientation, high detail, vibrant fantasy colors, digital art, detailed illustration`;

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'image-01',
        prompt,
        aspect_ratio: '2:3',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API error:', response.status, errorText);
      const safeName = noun.toLowerCase().replace(/\s+/g, '-');
      return NextResponse.json({
        success: false,
        image_url: `https://picsum.photos/seed/${safeName}-${cardId}/832/1248`,
        message: `MiniMax API error ${response.status}; using placeholder`
      });
    }

    const data = await response.json();

    // MiniMax returns { data: [{ url: "..." }] } or similar structure
    let imageUrl = '';
    if (data.data && Array.isArray(data.data) && data.data[0]) {
      imageUrl = data.data[0].url || data.data[0].image_url || '';
    } else if (data.url) {
      imageUrl = data.url;
    }

    if (!imageUrl) {
      console.error('MiniMax response missing URL:', JSON.stringify(data));
      const safeName = noun.toLowerCase().replace(/\s+/g, '-');
      return NextResponse.json({
        success: false,
        image_url: `https://picsum.photos/seed/${safeName}-${cardId}/832/1248`,
        message: 'MiniMax response missing image URL; using placeholder'
      });
    }

    return NextResponse.json({
      success: true,
      image_url: imageUrl,
      prompt
    });
  } catch (error) {
    console.error('Error generating card image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
