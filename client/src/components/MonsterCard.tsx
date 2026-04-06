'use client';

import { useState } from 'react';

type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
type CardType = 'Unit' | 'Building' | 'Spell';

interface MonsterCardProps {
  id?: number;
  name: string;
  description: string;
  attack: number;
  defense: number;
  range: number;
  rarity: string;
  type: string;
  imageUrl?: string;
  isFlipped?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  showBack?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RARITY_CONFIG = {
  Common: {
    borderClass: 'border-rarity-common',
    glowClass: 'glow-common',
    shimmer: false,
    label: 'Common',
  },
  Rare: {
    borderClass: 'border-rarity-rare',
    glowClass: 'glow-rare',
    shimmer: false,
    label: 'Rare',
  },
  Epic: {
    borderClass: 'border-rarity-epic',
    glowClass: 'glow-epic',
    shimmer: true,
    label: 'Epic',
  },
  Legendary: {
    borderClass: 'border-rarity-legendary',
    glowClass: 'glow-legendary',
    shimmer: true,
    label: 'Legendary',
  },
};

const TYPE_CONFIG = {
  Unit: {
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 13l2 2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-type-unit',
  },
  Building: {
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-type-building',
  },
  Spell: {
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-type-spell',
  },
};

function getRarityConfig(rarity: string) {
  return RARITY_CONFIG[rarity as Rarity] || RARITY_CONFIG.Common;
}

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type as CardType] || TYPE_CONFIG.Unit;
}

export function MonsterCard({
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
  isDisabled = false,
  showBack = false,
  onClick,
  size = 'md',
  className = '',
}: MonsterCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const rarityConfig = getRarityConfig(rarity);
  const typeConfig = getTypeConfig(type);

  const sizeClasses = {
    sm: 'w-32',
    md: 'w-52',
    lg: 'w-72',
  };

  const cardSizes = {
    sm: { height: 'h-48', artHeight: 'h-24', padding: 'p-2', textSize: 'text-xs' },
    md: { height: 'h-80', artHeight: 'h-36', padding: 'p-3', textSize: 'text-sm' },
    lg: { height: 'h-[28rem]', artHeight: 'h-56', padding: 'p-4', textSize: 'text-base' },
  };

  const selectedClasses = isSelected
    ? `ring-4 ring-offset-2 ring-offset-bg-deep ${rarityConfig.borderClass === 'border-rarity-legendary' ? 'ring-rarity-legendary' : rarityConfig.borderClass === 'border-rarity-epic' ? 'ring-rarity-epic' : rarityConfig.borderClass === 'border-rarity-rare' ? 'ring-rarity-rare' : 'ring-white'}`
    : '';

  if (showBack || isFlipped) {
    return (
      <div
        className={`
          ${sizeClasses[size]}
          ${cardSizes[size].height}
          relative
          rounded-card
          bg-gradient-to-br from-bg-elevated to-bg-surface
          border-2 ${rarityConfig.borderClass}
          ${rarityConfig.glowClass}
          cursor-pointer
          overflow-hidden
          transition-all duration-200
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
          ${selectedClasses}
          ${className}
        `}
        onClick={isDisabled ? undefined : onClick}
      >
        {/* Card back pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="cardBack" patternUnits="userSpaceOnUse" width="20" height="20">
                  <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#cardBack)" />
            </svg>
          </div>
          
          {/* Center emblem */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full border-2 ${rarityConfig.borderClass} flex items-center justify-center`}>
              <div className={`w-10 h-10 rounded-full ${rarityConfig.borderClass === 'border-rarity-legendary' ? 'bg-rarity-legendary/20' : rarityConfig.borderClass === 'border-rarity-epic' ? 'bg-rarity-epic/20' : 'bg-white/10'} flex items-center justify-center`}>
                <svg className="w-6 h-6 text-text-muted" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19 8l-7 3.5L5 8l7-3.5zM4 9.5l7 3.5v7l-7-3.5v-7zm16 0v7l-7 3.5v-7l7-3.5z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Corner decorations */}
          <div className={`absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 ${rarityConfig.borderClass}`} />
          <div className={`absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 ${rarityConfig.borderClass}`} />
          <div className={`absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 ${rarityConfig.borderClass}`} />
          <div className={`absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 ${rarityConfig.borderClass}`} />
        </div>

        {/* Glow effect */}
        {rarityConfig.shimmer && (
          <div className="absolute inset-0 shimmer pointer-events-none" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${cardSizes[size].height}
        relative
        rounded-card
        bg-bg-surface
        border-2 ${rarityConfig.borderClass}
        ${rarityConfig.glowClass}
        overflow-hidden
        cursor-pointer
        transition-all duration-200
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'card-hover'}
        ${selectedClasses}
        ${className}
      `}
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: '1000px' }}
    >
      {/* Card content with 3D flip */}
      <div className={`w-full h-full flex flex-col ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Header */}
        <div className={`${cardSizes[size].padding} pb-2`}>
          <div className="flex items-start justify-between gap-2">
            <h3 className={`${cardSizes[size].textSize} font-heading font-bold text-text-primary leading-tight flex-1`}>
              {name}
            </h3>
            <div className={`${typeConfig.color} flex-shrink-0`}>
              {typeConfig.icon}
            </div>
          </div>
          
          {/* Badges row */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`
              ${cardSizes[size].textSize === 'text-xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
              rounded-badge
              font-medium
              ${rarityConfig.borderClass === 'border-rarity-legendary' ? 'bg-rarity-legendary/20 text-rarity-legendary' : 
                rarityConfig.borderClass === 'border-rarity-epic' ? 'bg-rarity-epic/20 text-rarity-epic' :
                rarityConfig.borderClass === 'border-rarity-rare' ? 'bg-rarity-rare/20 text-rarity-rare' :
                'bg-rarity-common/20 text-rarity-common'}
            `}>
              {rarityConfig.label}
            </span>
            <span className={`
              ${cardSizes[size].textSize === 'text-xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
              rounded-badge
              bg-bg-elevated
              text-text-secondary
              font-medium
            `}>
              {type}
            </span>
          </div>
        </div>

        {/* Card Art */}
        <div className={`
          ${cardSizes[size].artHeight}
          relative
          bg-gradient-to-br from-type-building/30 to-rarity-epic/30
          overflow-hidden
          flex-shrink-0
        `}>
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={`${name} card art`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-text-muted">
                {typeConfig.icon}
              </div>
            </div>
          )}

          {/* Legendary sparkle */}
          {rarityConfig.shimmer && isHovered && (
            <div className="absolute top-2 right-2 animate-sparkle">
              <svg className={`w-5 h-5 ${rarityConfig.borderClass === 'border-rarity-legendary' ? 'text-rarity-legendary' : 'text-rarity-epic'}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className={`${cardSizes[size].padding} pt-2 flex-1 flex flex-col justify-between`}>
          <div className={`grid grid-cols-3 gap-1 ${cardSizes[size].textSize === 'text-xs' ? 'gap-0.5' : ''}`}>
            <div className="bg-stat-attack/10 rounded p-1 text-center">
              <div className="text-stat-attack font-mono font-bold">{attack}</div>
              <div className="text-text-muted text-[10px] uppercase tracking-wider">ATK</div>
            </div>
            <div className="bg-stat-defense/10 rounded p-1 text-center">
              <div className="text-stat-defense font-mono font-bold">{defense}</div>
              <div className="text-text-muted text-[10px] uppercase tracking-wider">DEF</div>
            </div>
            <div className="bg-stat-range/10 rounded p-1 text-center">
              <div className="text-stat-range font-mono font-bold">{range}</div>
              <div className="text-text-muted text-[10px] uppercase tracking-wider">RNG</div>
            </div>
          </div>

          {/* Description */}
          <p className={`
            ${cardSizes[size].textSize === 'text-xs' ? 'text-[10px]' : 'text-xs'}
            text-text-secondary
            leading-relaxed
            mt-2
            line-clamp-2
          `}>
            {description}
          </p>
        </div>

        {/* Shimmer overlay for epic/legendary */}
        {rarityConfig.shimmer && (
          <div className="absolute inset-0 shimmer pointer-events-none" />
        )}
      </div>
    </div>
  );
}

export { RARITY_CONFIG, TYPE_CONFIG };
export type { Rarity, CardType };
