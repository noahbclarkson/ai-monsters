// Enhanced Card Generator with AI Integration
// This handles real image generation and AI text descriptions

import { Card, CardGenerationRequest, CardGenerationResponse, Pack, Rarity, CardType } from '@/types/card';

export class AICardGenerator {
  private static readonly NOUNS = [
    'Dragon', 'Wizard', 'Knight', 'Castle', 'Phoenix', 'Unicorn', 
    'Goblin', 'Troll', 'Golem', 'Fairy', 'Demon', 'Angel', 
    'Robot', 'Alien', 'Cyborg', 'Warrior', 'Mage', 'Archer',
    'Shadow', 'Light', 'Darkness', 'Flame', 'Frost', 'Lightning',
    'Earth', 'Wind', 'Water', 'Fire', 'Spirit', 'Monster',
    'Beast', 'Creature', 'Entity', 'Being', 'Machine', 'Construct'
  ];

  // Generate card art via the /api/generate-card-image endpoint (MiniMax)
  static async generateCardImage(noun: string, cardType: CardType, rarity: Rarity = 'Common', cardId?: number): Promise<string> {
    try {
      const response = await fetch('/api/generate-card-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noun,
          cardType,
          rarity,
          cardId: cardId ?? Date.now(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.image_url) return data.image_url;
      }

      // API failed — return empty string (card component renders themed CSS placeholder)
      return '';
    } catch (error) {
      console.error('Error generating image:', error);
      return '';
    }
  }

  // Generate AI-enhanced card description using current model
  static async generateAIDescription(noun: string, rarity: Rarity, cardType: CardType, lastCards: string[] = []): Promise<string> {
    // Create context from last cards for continuity
    const recentCardsContext = lastCards.slice(-5).join(', ');
    
    // Create different prompts based on rarity and type
    let prompt = `Generate a unique card description for a ${rarity.toLowerCase()} ${cardType.toLowerCase()} called "${noun}". `;
    
    if (recentCardsContext) {
      prompt += `Recent cards in the game include: ${recentCardsContext}. `;
    }
    
    prompt += `The description should be ${rarity === 'Legendary' ? 'epic and legendary' : 'detailed and immersive'}, `;
    prompt += `2-3 sentences long, and reflect the ${cardType.toLowerCase()}'s role in battle. `;
    prompt += `Focus on ${cardType === 'Unit' ? 'combat abilities and fighting style' : 
                        cardType === 'Building' ? 'strategic value and defensive capabilities' : 
                        'magical effects and spell impact'}.`;
    
    try {
      // Use the current AI model to generate the description
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          noun,
          rarity,
          cardType
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.description || this.fallbackDescription(noun, rarity, cardType);
      }
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
    }
    
    return this.fallbackDescription(noun, rarity, cardType);
  }

  static fallbackDescription(noun: string, rarity: Rarity, cardType: CardType): string {
    const intensity = rarity === 'Legendary' ? 'legendary' : 
                     rarity === 'Epic' ? 'powerful' : 
                     rarity === 'Rare' ? 'strong' : 'sturdy';
    
    if (cardType === 'Unit') {
      return `A ${intensity} ${noun} warrior ready for battle, skilled in combat and tactical warfare.`;
    } else if (cardType === 'Building') {
      return `An ${intensity} ${noun} structure providing defensive cover and strategic advantages.`;
    } else {
      return `A ${intensity} ${noun} spell with magical abilities that can turn the tide of battle.`;
    }
  }

  static generateRandomNoun(): string {
    const randomIndex = Math.floor(Math.random() * this.NOUNS.length);
    return this.NOUNS[randomIndex];
  }

  static getRandomCardType(): CardType {
    const randVal = Math.random();
    if (randVal < 0.7) return 'Unit';
    if (randVal < 0.9) return 'Building';
    return 'Spell';
  }

  static determineRarity(): Rarity {
    const randVal = Math.random();
    if (randVal < 0.6) return 'Common';
    if (randVal < 0.85) return 'Rare';
    if (randVal < 0.95) return 'Epic';
    return 'Legendary';
  }

  static getRarityStats(rarity: Rarity): { attackRange: [number, number], defenseRange: [number, number], rangeRange: [number, number] } {
    switch (rarity) {
      case 'Common':
        return { attackRange: [5, 15], defenseRange: [5, 15], rangeRange: [1, 2] };
      case 'Rare':
        return { attackRange: [10, 25], defenseRange: [10, 25], rangeRange: [2, 3] };
      case 'Epic':
        return { attackRange: [20, 40], defenseRange: [20, 40], rangeRange: [3, 4] };
      case 'Legendary':
        return { attackRange: [35, 60], defenseRange: [35, 60], rangeRange: [4, 5] };
    }
  }

  // Enhanced card generation with AI descriptions and real images
  static async generateCard(id: number, lastCards: string[] = []): Promise<Card> {
    const noun = this.generateRandomNoun();
    const rarity = this.determineRarity();
    const cardType = this.getRandomCardType();
    
    const { attackRange, defenseRange, rangeRange } = this.getRarityStats(rarity);
    
    const attack = Math.floor(Math.random() * (attackRange[1] - attackRange[0] + 1)) + attackRange[0];
    const defense = Math.floor(Math.random() * (defenseRange[1] - defenseRange[0] + 1)) + defenseRange[0];
    const range = Math.floor(Math.random() * (rangeRange[1] - rangeRange[0] + 1)) + rangeRange[0];

    // Generate AI-enhanced description
    const description = await this.generateAIDescription(noun, rarity, cardType, lastCards);
    
    // Generate real image via MiniMax API
    const image_url = await this.generateCardImage(noun, cardType, rarity, id);

    return {
      id,
      name: noun,
      description,
      image_url,
      attack,
      defense,
      range,
      rarity,
      card_type: cardType,
      created_at: Math.floor(Date.now() / 1000)
    };
  }

  // Enhanced pack generation with AI descriptions
  static async generatePack(lastCards: string[] = []): Promise<Pack> {
    const cards = [];
    const generatedNouns = [];
    
    for (let i = 1; i <= 7; i++) {
      const card = await this.generateCard(i, [...generatedNouns, ...lastCards]);
      cards.push(card);
      generatedNouns.push(card.name);
    }
    
    return {
      cards,
      generated_at: Math.floor(Date.now() / 1000)
    };
  }


}