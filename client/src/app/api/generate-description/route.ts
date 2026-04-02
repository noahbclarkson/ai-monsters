import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { prompt, noun, rarity, cardType } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert game designer for a fantasy card game. Generate creative, immersive card descriptions that bring creatures, spells, and buildings to life. Each description should be 2-3 sentences, evocative, and reflect the card's rarity and type.

Rules:
- ${rarity} ${cardType}: ${rarity === 'Legendary' ? 'Epic, legendary, world-changing power' : rarity === 'Epic' ? 'Powerful, impressive, significant impact' : rarity === 'Rare' ? 'Strong, notable, above average' : 'Solid, reliable, standard'}
- Focus on ${cardType === 'Unit' ? 'combat abilities, fighting style, and warrior spirit' : cardType === 'Building' ? 'strategic value, defensive capabilities, and architectural features' : 'magical effects, spell power, and arcane properties'}
- Make each description unique and memorable
- Use vivid, fantasy-appropriate language
- Keep it 2-3 sentences (30-60 words)`;

    const fullPrompt = `${systemPrompt}

Card Name: ${noun}
Card Type: ${cardType}
Rarity: ${rarity}

Generate a card description based on the context above. Only return the description text, nothing else.`;

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
          { role: 'user', content: `Card Name: ${noun}\nCard Type: ${cardType}\nRarity: ${rarity}\n\nGenerate a 2-3 sentence card description. Only return the description.` }
        ],
        max_tokens: 150,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'AI generation failed', details: `OpenAI API error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim()
      || fallbackDescription(noun, rarity, cardType);

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
  const intensity = rarity === 'Legendary' ? 'legendary, world-altering' :
    rarity === 'Epic' ? 'powerful, awe-inspiring' :
    rarity === 'Rare' ? 'notable, formidable' : 'sturdy, reliable';

  if (cardType === 'Unit') {
    return `A ${intensity} ${noun} warrior whose reputation precedes them into every battle. Their presence on the field shifts the tide of combat in ways that become legend.`;
  } else if (cardType === 'Building') {
    return `An imposing ${noun} citadel whose ${intensity} defenses have repelled countless invasions. Within its walls, armies find refuge and strength.`;
  } else {
    return `A legendary ${noun} incantation that weaves ${intensity} magic to reshape the battlefield. Its effects echo long after the spell is cast.`;
  }
}
