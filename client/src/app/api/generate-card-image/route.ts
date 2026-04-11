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
      // Return empty image_url — the card component renders a themed CSS placeholder
      return NextResponse.json({
        success: false,
        image_url: '',
        message: 'MINIMAX_API_KEY not configured; using themed placeholder'
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
        response_format: 'base64',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API error:', response.status, errorText);
      return NextResponse.json({
        success: false,
        image_url: '',
        message: `MiniMax API error ${response.status}; using themed placeholder`
      });
    }

    const data = await response.json();

    // Handle base64 response from MiniMax
    let base64Image = '';
    if (data.data && Array.isArray(data.data.image_base64) && data.data.image_base64[0]) {
      base64Image = data.data.image_base64[0];
    } else if (data.image_base64 && Array.isArray(data.image_base64) && data.image_base64[0]) {
      base64Image = data.image_base64[0];
    } else if (data.data && Array.isArray(data.data.image_urls) && data.data.image_urls[0]) {
      // Fallback if they ignored response_format
      base64Image = data.data.image_urls[0];
      if (base64Image.startsWith('http')) {
        // It's still a URL, use the proxy
        const proxyUrl = `/api/card-image?url=${encodeURIComponent(base64Image)}&cardId=${cardId}`;
        return NextResponse.json({
          success: true,
          image_url: proxyUrl,
          prompt
        });
      }
    }

    if (!base64Image) {
      console.error('MiniMax response missing base64:', JSON.stringify(data).substring(0, 200));
      return NextResponse.json({
        success: false,
        image_url: '',
        message: 'MiniMax response missing image data; using themed placeholder'
      });
    }

    // Direct data URI since we requested base64
    const dataUri = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      image_url: dataUri,
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
