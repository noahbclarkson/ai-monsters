// This file will contain the SpacetimeDB client setup
// For now, this is a placeholder until we complete the SpacetimeDB login

export interface Card {
  id: number
  name: string
  description: string
  imageUrl: string
  attack: number
  defense: number
  range: number
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  type: 'Unit' | 'Spell' | 'Building'
}

export interface Player {
  id: number
  name: string
  email: string
}

export interface GameState {
  players: Player[]
  cards: Card[]
  currentMatch?: any
}

// Placeholder client - will be replaced with actual SpacetimeDB client
export class SpacetimeClient {
  private isConnected = false

  async connect() {
    // TODO: Implement actual SpacetimeDB connection
    console.log('Connecting to SpacetimeDB...')
    this.isConnected = true
  }

  async disconnect() {
    this.isConnected = false
  }

  async getCards(): Promise<Card[]> {
    // TODO: Fetch actual cards from SpacetimeDB
    return [
      {
        id: 1,
        name: 'Fire Dragon',
        description: 'A majestic dragon that breathes scorching flames',
        imageUrl: '',
        attack: 85,
        defense: 60,
        range: 2,
        rarity: 'Legendary',
        type: 'Unit'
      },
      {
        id: 2,
        name: 'Ice Wizard',
        description: 'Master of frost magic with freezing spells',
        imageUrl: '',
        attack: 45,
        defense: 40,
        range: 3,
        rarity: 'Rare',
        type: 'Unit'
      }
    ]
  }

  async createPlayer(name: string, email: string): Promise<Player> {
    // TODO: Implement actual player creation
    return {
      id: Date.now(),
      name,
      email
    }
  }
}

export const spacetimeClient = new SpacetimeClient()