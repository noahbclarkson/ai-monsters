import { Card, CardGenerationRequest, Pack, Rarity, CardType } from '@/types/card';

export class CardGenerator {
  private static readonly NOUNS = [
    'Dragon', 'Wizard', 'Knight', 'Castle', 'Phoenix', 'Unicorn', 
    'Goblin', 'Troll', 'Golem', 'Fairy', 'Demon', 'Angel', 
    'Robot', 'Alien', 'Cyborg', 'Warrior', 'Mage', 'Archer',
    'Shadow', 'Light', 'Darkness', 'Flame', 'Frost', 'Lightning',
    'Earth', 'Wind', 'Water', 'Fire', 'Spirit', 'Monster',
    'Beast', 'Creature', 'Entity', 'Being', 'Machine', 'Construct'
  ];

  // Mapping of card names to generated image paths
  private static readonly REAL_IMAGES: Record<string, string> = {
    'Dragon': '/home/ubuntu/.openclaw/media/browser/d1f8695d-2f90-409e-a45d-6fb345533485.jpg',
    'Wizard': '/home/ubuntu/.openclaw/media/browser/f3b8f011-a115-464d-9d7b-034f7de549d6.jpg',
    'Unicorn': '/home/ubuntu/.openclaw/media/browser/f4aa5d62-914d-406d-86e9-005a07924731.jpg',
    'Knight': '/home/ubuntu/.openclaw/media/browser/fcb45071-b525-493b-b840-a942e46ba60a.png',
  };

  // Function to get real image path for a card name, fallback to placeholder
  static getImagePath(cardName: string): string {
    return this.REAL_IMAGES[cardName] || `https://via.placeholder.com/832x1248/333333/FFFFFF?text=${cardName}`;
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

  static generateCard(id: number): Card {
    const noun = this.generateRandomNoun();
    const rarity = this.determineRarity();
    const cardType = this.getRandomCardType();
    
    const { attackRange, defenseRange, rangeRange } = this.getRarityStats(rarity);
    
    const attack = Math.floor(Math.random() * (attackRange[1] - attackRange[0] + 1)) + attackRange[0];
    const defense = Math.floor(Math.random() * (defenseRange[1] - defenseRange[0] + 1)) + defenseRange[0];
    const range = Math.floor(Math.random() * (rangeRange[1] - rangeRange[0] + 1)) + rangeRange[0];

    const description = `A${rarity === 'Legendary' ? 'n epic' : ' powerful'} ${noun} with ${attack} power and ${defense} defense`;

    return {
      id,
      name: noun,
      description,
      image_url: this.getImagePath(noun),
      attack,
      defense,
      range,
      rarity,
      card_type: cardType,
      created_at: Math.floor(Date.now() / 1000)
    };
  }

  static generateCardWithAI(request: CardGenerationRequest): CardGenerationResponse {
    const { seed_noun: noun, rarity } = request;
    
    const { attackRange, defenseRange, rangeRange } = this.getRarityStats(rarity as Rarity);
    
    const attack = Math.floor(Math.random() * (attackRange[1] - attackRange[0] + 1)) + attackRange[0];
    const defense = Math.floor(Math.random() * (defenseRange[1] - defenseRange[0] + 1)) + defenseRange[0];
    const range = Math.floor(Math.random() * (rangeRange[1] - rangeRange[0] + 1)) + rangeRange[0];

    const description = `A${rarity === 'Legendary' ? 'n epic' : ' powerful'} ${noun} with ${attack} power and ${defense} defense`;

    return {
      name: noun,
      description,
      attack,
      defense,
      range,
    };
  }

  static generatePack(): Pack {
    const cards = [];
    for (let i = 1; i <= 7; i++) {
      cards.push(this.generateCard(i));
    }
    
    return {
      cards,
      generated_at: Math.floor(Date.now() / 1000)
    };
  }

  static getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'Common': return 'bg-gray-500';
      case 'Rare': return 'bg-blue-500';
      case 'Epic': return 'bg-purple-500';
      case 'Legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  static getTypeIcon(type: string): string {
    switch (type) {
      case 'Unit': return '⚔️';
      case 'Building': return '🏰';
      case 'Spell': return '✨';
      default: return '🃏';
    }
  }

  static getRarityEmoji(rarity: string): string {
    switch (rarity) {
      case 'Common': return '⬜';
      case 'Rare': return '🔵';
      case 'Epic': return '🟣';
      case 'Legendary': return '🟡';
      default: return '⬜';
    }
  }
}