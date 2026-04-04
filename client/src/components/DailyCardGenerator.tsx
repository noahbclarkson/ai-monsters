'use client';

import { useSpacetimeDB } from '@/lib/spacetimedb';
import { useDailyCards } from '@/lib/useDailyCards';

const RARITY_COLOR: Record<string, string> = {
  Legendary: 'text-purple-600 bg-purple-100 border-purple-300',
  Epic: 'text-blue-600 bg-blue-100 border-blue-300',
  Rare: 'text-green-600 bg-green-100 border-green-300',
  Common: 'text-gray-600 bg-gray-100 border-gray-300',
};

const RARITY_ICON: Record<string, string> = {
  Legendary: 'star',
  Epic: 'diamond',
  Rare: 'circle',
  Common: 'square',
};

const TYPE_COLOR: Record<string, string> = {
  Unit: 'bg-red-100 text-red-800',
  Building: 'bg-blue-100 text-blue-800',
  Spell: 'bg-yellow-100 text-yellow-800',
};

interface CardDisplayProps {
  name: string;
  description: string;
  rarity: string;
  cardType: string;
  attack: number;
  defense: number;
  range: number;
  imageUrl?: string;
}

function CardDisplay({ name, description, rarity, cardType, attack, defense, range, imageUrl }: CardDisplayProps) {
  const rarityClass = RARITY_COLOR[rarity] ?? RARITY_COLOR.Common;
  const typeClass = TYPE_COLOR[cardType] ?? TYPE_COLOR.Unit;
  const iconPath = RARITY_ICON[rarity] ?? RARITY_ICON.Common;

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Card image */}
      <div className="w-32 h-48 rounded-lg overflow-hidden border-2 border-gray-300 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg relative">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-gray-500 text-4xl">?</span>
        )}
      </div>

      {/* Rarity + Type badges */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${rarityClass}`}>
          {iconPath === 'star' && 'S'} {rarity}
        </span>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${typeClass}`}>
          {cardType}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-lg font-bold text-gray-900 text-center">{name}</h3>

      {/* Description */}
      <p className="text-xs text-gray-600 text-center px-2 leading-relaxed">
        {description || 'Enhancing with AI...'}
      </p>

      {/* Stats */}
      <div className="flex justify-center gap-4 text-sm font-medium">
        <span className="text-red-600">ATK {attack}</span>
        <span className="text-blue-600">DEF {defense}</span>
        <span className="text-green-600">RNG {range}</span>
      </div>
    </div>
  );
}

export default function DailyCardGenerator() {
  const { connected, error: dbError } = useSpacetimeDB();
  const {
    dailyCards,
    hasClaimed,
    isGenerating,
    isEnhancing,
    loading,
    error: hookError,
    claimDailyCard,
  } = useDailyCards();

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const error = hookError ?? dbError;

  if (!connected && !loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Card</h2>
          <p className="text-red-500">Not connected to SpacetimeDB. Please refresh when connected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Card</h2>
        <p className="text-gray-600">Claim your unique AI-generated card every day.</p>
        <p className="text-sm text-gray-500 mt-2">{dateStr}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {hasClaimed && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 font-medium text-sm">You have already claimed today&apos;s card.</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : dailyCards.length > 0 ? (
        <div className="space-y-4">
          {dailyCards.map((card) => (
            <CardDisplay
              key={String(card.id)}
              name={card.name}
              description={card.description}
              rarity={card.rarity}
              cardType={card.cardType}
              attack={card.attack}
              defense={card.defense}
              range={card.range}
              imageUrl={card.imageUrl}
            />
          ))}
          {isEnhancing && (
            <div className="text-center py-2">
              <div className="inline-block w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-sm text-purple-600">AI is creating artwork and descriptions...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="w-32 h-48 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-400 text-4xl">?</span>
          </div>
          <button
            onClick={claimDailyCard}
            disabled={isGenerating || hasClaimed}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : hasClaimed ? 'Already Claimed' : 'Generate Daily Card'}
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">How it works:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>- Every day you can claim one AI-generated card (5 variants)</li>
          <li>- Cards are minted directly into SpacetimeDB</li>
          <li>- AI generates unique artwork and descriptions</li>
          <li>- Your collection grows with every daily claim</li>
        </ul>
      </div>
    </div>
  );
}
