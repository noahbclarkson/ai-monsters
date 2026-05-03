import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { allowed, retryAfterMs } = checkRateLimit(ip, { maxRequests: 10, windowMs: 60_000 });
  if (!allowed) {
    const response = NextResponse.json(
      { error: 'Rate limit exceeded', retryAfterMs },
      { status: 429 }
    );
    response.headers.set('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
    return response;
  }

  try {
    const { prompt: _prompt, noun, rarity, cardType } = await request.json();

    // Validate required fields before using in template literals
    if (!noun || !rarity || !cardType) {
      return NextResponse.json(
        { error: 'Missing required fields: noun, rarity, cardType', success: false },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      // No API key — return fallback description so card generation still works
      return NextResponse.json({
        success: true,
        description: fallbackDescription(noun, rarity, cardType),
        noun,
        rarity,
        cardType,
      });
    }

    const systemPrompt = `You are an expert game designer for a fantasy card game. Generate creative, immersive card descriptions for the card **${noun}** (${rarity} ${cardType}) that bring creatures, spells, and buildings to life. Each description should be 2-3 sentences, evocative, and reflect the card's rarity and type.

Rules:
- Focus on the card named **${noun}**, its ${rarity.toLowerCase()} status, and its ${cardType.toLowerCase()} nature
- ${rarity === 'Legendary' ? 'Epic, legendary, world-changing power' : rarity === 'Epic' ? 'Powerful, impressive, significant impact' : rarity === 'Rare' ? 'Strong, notable, above average' : 'Solid, reliable, standard'}
- Focus on ${cardType === 'Unit' ? 'combat abilities, fighting style, and warrior spirit' : cardType === 'Building' ? 'strategic value, defensive capabilities, and architectural features' : 'magical effects, spell power, and arcane properties'}
- Make each description unique and memorable — do not use generic phrases
- Use vivid, fantasy-appropriate language
- Keep it 2-3 sentences (30-60 words)
- **Never use the word "undefined"**
- Ensure every placeholder is replaced with actual content from the card's name, type, and rarity`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write a 2-3 sentence card description for **${noun}** — a ${rarity} ${cardType}. Make it unique, evocative, and specific to this card. Do not use the word "undefined".` }
        ],
        max_tokens: 150,
        temperature: 0.9,
      }),
    });

    let description = '';
    if (response.ok) {
      const data = await response.json();
      description = data.choices?.[0]?.message?.content?.trim() || '';
    } else {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      // Fall back gracefully instead of failing
    }

    // Use fallback if AI failed or returned empty
    if (!description) {
      description = fallbackDescription(noun, rarity, cardType);
    }

    return NextResponse.json({
      success: true,
      description,
      noun,
      rarity,
      cardType
    });
  } catch (error) {
    console.error('Error generating AI description:', error);
    return NextResponse.json(
      { error: 'Failed to generate description', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function fallbackDescription(noun: string, rarity: string, cardType: string): string {
  const intensities: Record<string, string[]> = {
    Legendary: ['legendary, world-altering', 'mythic, reality-bending', 'peerless, god-touched'],
    Epic:      ['powerful, awe-inspiring', 'formidable, battle-hardened', 'fearsome, unstoppable'],
    Rare:      ['notable, formidable', 'seasoned, cunning', 'resilient, battle-tested'],
    Common:    ['sturdy, reliable', 'steadfast, determined', 'tenacious, unyielding'],
  };
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const intensity = pick(intensities[rarity] ?? intensities.Common);
  const typeLabel = cardType === 'Building' ? 'warrior' : cardType === 'Spell' ? 'spell' : 'warrior';

  const unitDescriptions = [
    `A ${intensity} warrior bearing the name ${noun}, whose reputation precedes them into every battle. Their presence on the field shifts the tide of combat in ways that become legend.`,
    `Forged in the fires of countless battles, this ${intensity} champion named ${noun} fights with unwavering resolve. Allies rally behind them; enemies flee before them.`,
    `Born of ancient lineage and tempered by war, ${noun} carries the hopes of their people into every engagement. Their ${rarity.toLowerCase()} skill is unmatched among their kin.`,
  ];

  const buildingDescriptions = [
    `An imposing ${noun} citadel whose ${intensity} defenses have repelled countless invasions. Within its walls, armies find refuge and strength.`,
    `This ${intensity} ${noun} stronghold stands as a monument to engineering mastery. Its walls have never fallen, its garrisons never broken.`,
    `Rising from the earth like a monument to defiance, the ${noun} fortress commands the battlefield. Those who siege it pay dearly.`,
  ];

  const spellDescriptions = [
    `A ${intensity} incantation known as ${noun} that weaves ancient magic to reshape the battlefield. Its effects echo long after the spell is cast.`,
    `Drawn from forgotten grimoires, ${noun} unleashes devastation upon the unwary. Few survive its wrath unscathed.`,
    `The air crackles with arcane energy when ${noun} is invoked — a ${intensity} enchantment. Reality itself bends to the caster's will.`,
  ];

  if (cardType === 'Building') return pick(buildingDescriptions);
  if (cardType === 'Spell') return pick(spellDescriptions);
  return pick(unitDescriptions);
}
