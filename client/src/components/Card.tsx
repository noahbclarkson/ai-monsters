import { RarityBadge } from './RarityBadge'

interface CardProps {
  name: string
  description: string
  attack: number
  defense: number
  range: number
  rarity: string
  type: string
}

export function Card({ name, description, attack, defense, range, rarity, type }: CardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500'
      case 'Rare': return 'bg-blue-500'
      case 'Epic': return 'bg-purple-500'
      case 'Legendary': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Unit': return '⚔️'
      case 'Spell': return '✨'
      case 'Building': return '🏰'
      default: return '🃏'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
      {/* Card Header */}
      <div className={`p-4 ${getRarityColor(rarity)} text-white`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <div className="text-2xl">{getTypeIcon(type)}</div>
        </div>
        <div className="flex items-center gap-2">
          <RarityBadge rarity={rarity} />
          <span className="text-sm bg-white/20 px-2 py-1 rounded">{type}</span>
        </div>
      </div>

      {/* Card Art */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <div className="text-6xl opacity-50">🎴</div>
      </div>

      {/* Card Stats */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-red-100 rounded p-2">
            <div className="text-sm text-red-600 font-semibold">Attack</div>
            <div className="text-xl font-bold text-red-700">{attack}</div>
          </div>
          <div className="bg-blue-100 rounded p-2">
            <div className="text-sm text-blue-600 font-semibold">Defense</div>
            <div className="text-xl font-bold text-blue-700">{defense}</div>
          </div>
          <div className="bg-green-100 rounded p-2">
            <div className="text-sm text-green-600 font-semibold">Range</div>
            <div className="text-xl font-bold text-green-700">{range}</div>
          </div>
        </div>

        {/* Card Description */}
        <p className="text-sm text-gray-600 text-center">
          {description}
        </p>
      </div>
    </div>
  )
}