import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, noun, rarity, cardType } = await request.json();

    // Use the current AI model to generate card descriptions
    const systemPrompt = `You are an expert game designer for a fantasy card game. Generate creative, immersive card descriptions that bring creatures, spells, and buildings to life. Each description should be 2-3 sentences, evocative, and reflect the card's rarity and type.

Rules:
- ${rarity} ${cardType}: ${rarity === 'Legendary' ? 'Epic, legendary, world-changing power' : rarity === 'Epic' ? 'Powerful, impressive, significant impact' : rarity === 'Rare' ? 'Strong, notable, above average' : 'Solid, reliable, standard'}
- Focus on ${cardType === 'Unit' ? 'combat abilities, fighting style, and warrior spirit' : cardType === 'Building' ? 'strategic value, defensive capabilities, and architectural features' : 'magical effects, spell power, and arcane properties'}
- Make each description unique and memorable
- Use vivid, fantasy-appropriate language
- Keep it 2-3 sentences (30-60 words)`;

    // Create the AI generation prompt using the current model's capabilities
    const fullPrompt = `${systemPrompt}

Card Name: ${noun}
Card Type: ${cardType}
Rarity: ${rarity}

Generate a card description based on the context above: ${prompt}`;

    // For now, we'll simulate AI generation with sophisticated templates
    // In production, this would call the actual AI model
    const simulatedResponse = await generateSimulatedDescription(noun, rarity, cardType);

    return NextResponse.json({
      success: true,
      description: simulatedResponse,
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

async function generateSimulatedDescription(noun: string, rarity: string, cardType: string): Promise<string> {
  // Simulate AI generation with enhanced templates that vary based on parameters
  const intensity = rarity === 'Legendary' ? 'legendary, world-altering' : 
                   rarity === 'Epic' ? 'powerful, awe-inspiring' : 
                   rarity === 'Rare' ? 'notable, formidable' : 'sturdy, reliable';

  const typeSpecifics = {
    Unit: [
      `A master ${noun} warrior whose battle prowess is ${rarity.toLowerCase()} among all who know the tales of their conquests.`,
      `This formidable ${noun} fighter embodies the ${rarity.toLowerCase()} spirit of endless combat and tactical genius.`,
      `The ${noun} champion stands as a testament to ${rarity.toLowerCase()} strength, inspiring allies and striking fear into enemies.`
    ],
    Building: [
      `An imposing ${noun} citadel whose ${rarity.toLowerCase()} walls have stood the test of time through countless battles.`,
      `The enchanted ${noun} fortress radiates ${rarity.toLowerCase()} magical energy, protecting all who seek refuge within its walls.`,
      `This mighty ${noun} stronghold represents the pinnacle of ${rarity.toLowerCase()} defensive architecture and strategic importance.`
    ],
    Spell: [
      `A legendary ${noun} incantation that weaves ${rarity.toLowerCase()} magic to reshape the battlefield in unpredictable ways.`,
      `The mystical ${noun} ritual channels ${rarity.toLowerCase()} arcane forces, capable of turning the tide of any conflict.`,
      `An ancient ${noun} spell passed down through generations, holding ${rarity.toLowerCase()} power that can alter the very fabric of reality.`
    ]
  };

  const templates = typeSpecifics[cardType as keyof typeof typeSpecifics];
  return templates[Math.floor(Math.random() * templates.length)];
}