'use client';

import { useState, useEffect } from 'react';
import { RarityBadge } from './RarityBadge'
import { CardGenerator } from '@/lib/card-generator'

interface CardProps {
  name: string
  description: string
  attack: number
  defense: number
  range: number
  rarity: string
  type: string
  imageUrl?: string
  isFlipped?: boolean
  isSelected?: boolean
  onClick?: () => void
  onHover?: (isHovering: boolean) => void
}

export function EnhancedCard({ 
  name, 
  description, 
  attack, 
  defense, 
  range, 
  rarity, 
  type, 
  imageUrl, 
  isFlipped = false,
  isSelected = false,
  onClick,
  onHover
}: CardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const rarityColor = CardGenerator.getRarityColor(rarity)
  const typeIcon = CardGenerator.getTypeIcon(type)
  const rarityEmoji = CardGenerator.getRarityEmoji(rarity)

  // Handle hover state with animation delay
  useEffect(() => {
    if (onHover) {
      onHover(isHovering);
    }
  }, [isHovering, onHover]);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      if (onClick) onClick();
    }, 300);
  };

  const cardClasses = `
    relative w-full h-96 cursor-pointer select-none
    ${isAnimating ? 'animate-pulse' : ''}
    ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-50 shadow-2xl' : 'shadow-lg'}
    transition-all duration-300 ease-out
    transform hover:scale-105 hover:rotate-1
    ${isHovering ? 'shadow-2xl' : ''}
  `;

  const flipClasses = `
    w-full h-full rounded-lg overflow-hidden
    transform transition-transform duration-500 preserve-3d
    ${isFlipped ? 'rotate-y-180' : ''}
  `;

  return (
    <div 
      className={cardClasses}
      onClick={onClick || handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ perspective: '1000px' }}
    >
      {/* Card Container with 3D flip effect */}
      <div className={flipClasses}>
        {/* Card Back (when flipped) */}
        {isFlipped && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 p-4 flex flex-col justify-between backface-hidden">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-repeat" 
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                     backgroundSize: '40px 40px'
                   }} />
            </div>
            
            {/* Card back content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white/30 text-4xl">{rarityEmoji}</div>
                <div className="text-white/30 text-2xl">{typeIcon}</div>
              </div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="text-white/20 text-sm font-semibold uppercase tracking-wider">
                AI Monsters
              </div>
              <div className="text-white/40 text-xs mt-1">
                Click to reveal
              </div>
            </div>
          </div>
        )}

        {/* Card Front (normal view) */}
        <div className={`bg-white ${isFlipped ? 'hidden' : 'block'}`}>
          {/* Card Header with animated gradient */}
          <div className={`relative p-4 ${rarityColor} text-white overflow-hidden`}>
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white drop-shadow-md">{name}</h3>
                <div className="text-2xl drop-shadow-md">{typeIcon}</div>
              </div>
              <div className="flex items-center gap-2">
                <RarityBadge rarity={rarity} />
                <span className="text-sm bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                  {type}
                </span>
              </div>
            </div>
          </div>

          {/* Card Art with enhanced styling */}
          <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden relative">
            {/* Art container */}
            <div className="w-full h-full relative">
              {imageUrl ? (
                <>
                  <img 
                    src={imageUrl} 
                    alt={`${name} card art`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-art');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  {/* Art overlay with subtle animation */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent animate-pulse-slow"></div>
                </>
              ) : (
                <div className="fallback-art hidden flex items-center justify-center text-6xl opacity-50">
                  🎴
                </div>
              )}
            </div>

            {/* Rarity sparkle effect */}
            {rarity !== 'Common' && (
              <div className="absolute top-2 right-2 animate-spin">
                <div className="text-2xl opacity-70">✨</div>
              </div>
            )}
          </div>

          {/* Enhanced Card Stats */}
          <div className="p-4 bg-gray-50 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" 
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='%23000'/%3E%3C/svg%3E")`,
                     backgroundSize: '20px 20px'
                   }} />
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-2 text-center mb-3">
              {/* Attack */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white shadow-md transform hover:scale-105 transition-transform">
                <div className="text-xs font-semibold uppercase tracking-wide opacity-90">Attack</div>
                <div className="text-2xl font-bold">{attack}</div>
                <div className="text-xs opacity-70 mt-1">⚔️</div>
              </div>

              {/* Defense */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-md transform hover:scale-105 transition-transform">
                <div className="text-xs font-semibold uppercase tracking-wide opacity-90">Defense</div>
                <div className="text-2xl font-bold">{defense}</div>
                <div className="text-xs opacity-70 mt-1">🛡️</div>
              </div>

              {/* Range */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white shadow-md transform hover:scale-105 transition-transform">
                <div className="text-xs font-semibold uppercase tracking-wide opacity-90">Range</div>
                <div className="text-2xl font-bold">{range}</div>
                <div className="text-xs opacity-70 mt-1">🎯</div>
              </div>
            </div>

            {/* Enhanced Card Description */}
            <p className="text-sm text-gray-600 text-center relative z-10 leading-relaxed">
              {description}
            </p>

            {/* Hover effects on card */}
            {isHovering && (
              <div className="absolute inset-0 bg-white/10 pointer-events-none rounded-lg animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}