// Types for AI Monsters
export interface Card {
  id: number;
  name: string;
  description: string;
  image_url: string;
  attack: number;
  defense: number;
  range: number;
  rarity: string;
  card_type: string;
  created_at: number;
}

export interface CardGenerationRequest {
  seed_noun: string;
  rarity: string;
  card_type: string;
}

export interface CardGenerationResponse {
  name: string;
  description: string;
  attack: number;
  defense: number;
  range: number;
}

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type CardType = 'Unit' | 'Building' | 'Spell';

export interface Pack {
  cards: Card[];
  generated_at: number;
}