interface RarityBadgeProps {
  rarity: string
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return { 
          bgColor: 'bg-gray-500', 
          textColor: 'text-gray-100',
          borderColor: 'border-gray-600'
        }
      case 'Rare':
        return { 
          bgColor: 'bg-blue-500', 
          textColor: 'text-blue-100',
          borderColor: 'border-blue-600'
        }
      case 'Epic':
        return { 
          bgColor: 'bg-purple-500', 
          textColor: 'text-purple-100',
          borderColor: 'border-purple-600'
        }
      case 'Legendary':
        return { 
          bgColor: 'bg-yellow-500', 
          textColor: 'text-yellow-900',
          borderColor: 'border-yellow-600'
        }
      default:
        return { 
          bgColor: 'bg-gray-500', 
          textColor: 'text-gray-100',
          borderColor: 'border-gray-600'
        }
    }
  }

  const config = getRarityConfig(rarity)
  
  return (
    <span 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {rarity}
    </span>
  )
}