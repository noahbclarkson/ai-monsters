'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types/card';
import { Card as CardComponent } from '@/components/Card';

interface PackOpeningProps {
  cards: Card[];
  onComplete: () => void;
}

export function PackOpening({ cards, onComplete }: PackOpeningProps) {
  const [revealIndex, setRevealIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (revealIndex < cards.length) {
      const timer = setTimeout(() => {
        setRevealIndex(prev => prev + 1);
      }, 800); // 800ms between card reveals
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 2000); // Show complete pack for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [revealIndex, cards.length, onComplete]);

  const getPackMessage = () => {
    if (revealIndex === 0) return 'Opening your pack...';
    if (revealIndex < cards.length) return `Revealing card ${revealIndex + 1} of ${cards.length}...`;
    return 'Pack complete! 🎉';
  };

  const getPackQuality = () => {
    const legendaryCount = cards.filter(c => c.rarity === 'Legendary').length;
    const epicCount = cards.filter(c => c.rarity === 'Epic').length;
    
    if (legendaryCount >= 1) return 'Mythic Pack! 🌟';
    if (epicCount >= 2) return 'Epic Pack! ⭐';
    if (epicCount >= 1) return 'Rare Pack! 💎';
    return 'Standard Pack! 📦';
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Pack Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🎁 Pack Opening</h2>
        <div className={`text-xl font-semibold mb-4 ${
          cards.filter(c => c.rarity === 'Legendary').length > 0 ? 'text-yellow-600' :
          cards.filter(c => c.rarity === 'Epic').length > 1 ? 'text-purple-600' :
          cards.filter(c => c.rarity === 'Epic').length > 0 ? 'text-blue-600' : 'text-gray-600'
        }`}>
          {getPackQuality()}
        </div>
        <p className="text-lg text-gray-600">{getPackMessage()}</p>
      </div>

      {/* Pack Animation Container */}
      <div className="relative">
        {/* Pack wrapper */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className={`relative transform transition-all duration-500 ${
                  index < revealIndex 
                    ? 'opacity-100 scale-100 rotate-0' 
                    : 'opacity-50 scale-75 rotate-12'
                }`}
              >
                {/* Card back */}
                {index >= revealIndex && (
                  <div className="w-full h-96 bg-gradient-to-br from-purple-800 to-blue-800 rounded-lg shadow-lg flex items-center justify-center">
                    <div className="text-6xl text-white/50">🎴</div>
                  </div>
                )}
                
                {/* Card front */}
                {index < revealIndex && (
                  <div className="w-full h-96">
                    <CardComponent
                      name={card.name}
                      description={card.description}
                      attack={card.attack}
                      defense={card.defense}
                      range={card.range}
                      rarity={card.rarity}
                      type={card.card_type}
                      imageUrl={card.image_url}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Results display */}
        {isComplete && (
          <div className="text-center">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Pack Results</h3>
              <div className="flex justify-center gap-6 text-lg">
                <div>
                  <span className="font-semibold text-yellow-600">🟡 {cards.filter(c => c.rarity === 'Legendary').length}</span> Legendary
                </div>
                <div>
                  <span className="font-semibold text-purple-600">🟣 {cards.filter(c => c.rarity === 'Epic').length}</span> Epic
                </div>
                <div>
                  <span className="font-semibold text-blue-600">🔵 {cards.filter(c => c.rarity === 'Rare').length}</span> Rare
                </div>
                <div>
                  <span className="font-semibold text-gray-600">⬜ {cards.filter(c => c.rarity === 'Common').length}</span> Common
                </div>
              </div>
            </div>
            
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">🎉 Pack added to your collection!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}