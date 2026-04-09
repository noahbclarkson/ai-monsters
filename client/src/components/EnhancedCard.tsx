'use client';

import { useState, useEffect } from 'react';
import { RarityBadge } from './RarityBadge'
import { CardGenerator } from '@/lib/card-generator'
import { Swords, Shield, Target, Sparkles, TowerControl, Wand2, Circle, Layers } from 'lucide-react'

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
  const getTypeIconComponent = (t: string) => {
    switch (t) {
      case 'Unit': return <Swords size={32} />;
      case 'Building': return <TowerControl size={32} />;
      case 'Spell': return <Wand2 size={32} />;
      default: return <Circle size={32} />;
    }
  }
  
  const getRarityIconComponent = (r: string) => {
    const props = { size: 40 };
    switch (r) {
      case 'Common': return <Circle {...props} className="text-white/40" />;
      case 'Rare': return <Circle {...props} className="text-blue-400/40" />;
      case 'Epic': return <Circle {...props} className="text-purple-400/40" />;
      case 'Legendary': return <Circle {...props} className="text-yellow-400/40" />;
      default: return <Circle {...props} className="text-white/40" />;
    }
  }

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

  const flipInnerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s cubic-bezier(0.4, 0.15, 0.2, 1)',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  const faceBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: 'inherit',
    overflow: 'hidden',
  };

  return (
    <div 
      className={cardClasses}
      onClick={onClick || handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ perspective: '1000px' }}
    >
      {/* Card Container with 3D flip effect */}
      <div style={flipInnerStyle}>
        {/* Card Back (always rendered, hidden via rotateY when not flipped) */}
        <div
          style={{
            ...faceBase,
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            ...(isFlipped ? {} : { visibility: 'hidden', pointerEvents: 'none' }),
          }}
        >
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
                <div className="text-white/30">{getRarityIconComponent(rarity)}</div>
                <div className="text-white/30">{getTypeIconComponent(type)}</div>
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

        {/* Card Front (always rendered) */}
        <div style={{ ...faceBase, transform: 'rotateY(0deg)', background: 'white', ...(isFlipped ? { visibility: 'hidden', pointerEvents: 'none' } : {}) }}>
          {/* Card Header with animated gradient */}
          <div className={`relative p-4 ${rarityColor} text-white overflow-hidden`}>
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white drop-shadow-md">{name}</h3>
                <div className="text-white drop-shadow-md">{getTypeIconComponent(type)}</div>
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
                <div className="fallback-art hidden flex items-center justify-center text-white/40">
                  <Layers size={64} strokeWidth={1} />
                </div>
              )}
            </div>

            {/* Rarity sparkle effect */}
            {rarity !== 'Common' && (
              <div className="absolute top-2 right-2 animate-spin">
                <Sparkles size={18} className="text-yellow-400 opacity-70" strokeWidth={1.5} />
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
                <div className="text-xs opacity-70 mt-1 flex justify-center"><Swords size={12} strokeWidth={2} /></div>
              </div>

              {/* Defense */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-md transform hover:scale-105 transition-transform">
                <div className="text-xs font-semibold uppercase tracking-wide opacity-90">Defense</div>
                <div className="text-2xl font-bold">{defense}</div>
                <div className="text-xs opacity-70 mt-1 flex justify-center"><Shield size={12} strokeWidth={2} /></div>
              </div>

              {/* Range */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white shadow-md transform hover:scale-105 transition-transform">
                <div className="text-xs font-semibold uppercase tracking-wide opacity-90">Range</div>
                <div className="text-2xl font-bold">{range}</div>
                <div className="text-xs opacity-70 mt-1 flex justify-center"><Target size={12} strokeWidth={2} /></div>
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