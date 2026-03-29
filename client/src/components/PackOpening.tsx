'use client';

import { useState, useEffect, useRef } from 'react';
import { EnhancedCard } from './EnhancedCard';
import { CardGenerator } from '@/lib/card-generator';

interface Pack {
  cards: any[];
  generated_at: number;
}

interface PackOpeningProps {
  pack?: Pack;
  onPackComplete?: () => void;
}

interface CardRevealState {
  index: number;
  isRevealed: boolean;
  isAnimating: boolean;
}

export function PackOpening({ pack, onPackComplete }: PackOpeningProps) {
  const [cards, setCards] = useState<any[]>([]);
  const [revealStates, setRevealStates] = useState<CardRevealState[]>(
    Array(7).fill(null).map((_, i) => ({ index: i, isRevealed: false, isAnimating: false }))
  );
  const [currentRevealing, setCurrentRevealing] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [packQuality, setPackQuality] = useState<string>('Standard');
  const [sparkles, setSparkles] = useState<{id: number, x: number, y: number}[]>([]);
  const [confetti, setConfetti] = useState<{id: number, x: number, y: number, color: string}[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate or use provided pack
  useEffect(() => {
    if (pack) {
      setCards(pack.cards);
      determinePackQuality(pack.cards);
    } else {
      generateNewPack();
    }
  }, [pack]);

  // Generate sparkles for visual effects
  const generateSparkles = () => {
    const newSparkles = [];
    for (let i = 0; i < 20; i++) {
      newSparkles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      });
    }
    setSparkles(newSparkles);
  };

  // Generate confetti for special packs
  const generateConfetti = (quality: string) => {
    if (quality === 'Mythic' || quality === 'Legendary') {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
      const newConfetti = [];
      for (let i = 0; i < 30; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      setConfetti(newConfetti);
    }
  };

  const determinePackQuality = (packCards: any[]) => {
    const legendaryCount = packCards.filter(card => card.rarity === 'Legendary').length;
    const epicCount = packCards.filter(card => card.rarity === 'Epic').length;
    
    if (legendaryCount >= 2 || epicCount >= 4) {
      setPackQuality('Mythic');
      generateConfetti('Mythic');
    } else if (legendaryCount >= 1 || epicCount >= 2) {
      setPackQuality('Epic');
    } else if (epicCount >= 1) {
      setPackQuality('Rare');
    } else {
      setPackQuality('Standard');
    }
    
    generateSparkles();
  };

  const generateNewPack = async () => {
    const newPack = await CardGenerator.generatePack();
    setCards(newPack.cards);
    determinePackQuality(newPack.cards);
  };

  const revealNextCard = () => {
    if (currentRevealing >= 7) {
      setIsComplete(true);
      if (onPackComplete) onPackComplete();
      return;
    }

    setRevealStates(prev => 
      prev.map((state, i) => 
        i === currentRevealing 
          ? { ...state, isAnimating: true }
          : state
      )
    );

    // Simulate card reveal animation
    setTimeout(() => {
      setRevealStates(prev => 
        prev.map((state, i) => 
          i === currentRevealing 
            ? { ...state, isRevealed: true, isAnimating: false }
            : state
        )
      );
      setCurrentRevealing(prev => prev + 1);

      // Play sound effect (simulated)
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }, 1000);
  };

  const startRevealAll = () => {
    setRevealStates(prev => prev.map((_, i) => ({ index: i, isRevealed: false, isAnimating: false })));
    setCurrentRevealing(0);
    setIsComplete(false);
    setConfetti([]);
    setSparkles([]);
    generateSparkles();
  };

  const getPackQualityColor = () => {
    switch (packQuality) {
      case 'Mythic': return 'from-yellow-400 via-orange-500 to-red-600';
      case 'Epic': return 'from-purple-400 via-pink-500 to-purple-600';
      case 'Rare': return 'from-blue-400 via-cyan-500 to-blue-600';
      default: return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated stars */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Confetti */}
        {confetti.map(conf => (
          <div
            key={conf.id}
            className="absolute w-2 h-2 rounded animate-bounce"
            style={{
              left: `${conf.x}%`,
              top: `${conf.y}%`,
              backgroundColor: conf.color,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}

        {/* Sparkles */}
        {sparkles.map(spark => (
          <div
            key={spark.id}
            className="absolute text-yellow-300 animate-ping"
            style={{
              left: `${spark.x}%`,
              top: `${spark.y}%`,
              fontSize: '1rem',
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Pack header */}
        <div className="text-center mb-8">
          <div className={`inline-block bg-gradient-to-r ${getPackQualityColor()} rounded-full px-6 py-3 mb-4 animate-pulse`}>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {packQuality} Pack
            </h1>
          </div>
          <p className="text-white/70 text-lg">
            Reveal your AI-generated cards!
          </p>
        </div>

        {/* Pack display */}
        <div className="grid grid-cols-7 gap-4 mb-8">
          {cards.map((card, index) => {
            const revealState = revealStates[index];
            const isRevealed = revealState?.isRevealed || false;
            const isAnimating = revealState?.isAnimating || false;

            return (
              <div
                key={card.id}
                className={`relative h-96 transition-all duration-500 ${
                  isAnimating ? 'scale-110 rotate-3' : 'scale-100 rotate-0'
                }`}
              >
                {/* Card pack (face down) */}
                {!isRevealed && (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform transform rotate-y-0">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">🎴</div>
                      <div className="text-sm opacity-80">Card {index + 1}</div>
                    </div>
                  </div>
                )}

                {/* Card revealed */}
                {isRevealed && (
                  <div className="w-full h-full">
                    <EnhancedCard
                      name={card.name}
                      description={card.description}
                      attack={card.attack}
                      defense={card.defense}
                      range={card.range}
                      rarity={card.rarity}
                      type={card.type}
                      imageUrl={card.image_url}
                      isSelected={false}
                    />
                  </div>
                )}

                {/* Rarity glow effect */}
                {isRevealed && card.rarity !== 'Common' && (
                  <div className="absolute -inset-2 rounded-lg opacity-60 animate-pulse">
                    <div className={`absolute inset-0 rounded-lg ${
                      card.rarity === 'Legendary' ? 'bg-yellow-400' :
                      card.rarity === 'Epic' ? 'bg-purple-400' :
                      card.rarity === 'Rare' ? 'bg-blue-400' : 'bg-gray-400'
                    }`}></div>
                  </div>
                )}

                {/* Reveal animation overlay */}
                {isAnimating && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg opacity-50 animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="text-center space-y-4">
          {!isComplete ? (
            <>
              <button
                onClick={revealNextCard}
                disabled={currentRevealing >= 7}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentRevealing >= 7 ? 'All Cards Revealed!' : `Reveal Card ${currentRevealing + 1}`}
              </button>

              <button
                onClick={startRevealAll}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all"
              >
                Reveal All Cards
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-2xl font-bold text-white mb-4">
                🎉 Pack Complete! 🎉
              </div>
              <button
                onClick={generateNewPack}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
              >
                Open Another Pack
              </button>
            </div>
          )}
        </div>

        {/* Pack statistics */}
        {isComplete && (
          <div className="mt-8 bg-black/30 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-white font-bold text-lg mb-4 text-center">Pack Results</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-gray-800/50 rounded p-3">
                <div className="text-2xl font-bold text-white">7</div>
                <div className="text-sm text-gray-400">Total Cards</div>
              </div>
              <div className="bg-gray-800/50 rounded p-3">
                <div className="text-2xl font-bold text-white">
                  {cards.filter(c => c.rarity === 'Legendary').length}
                </div>
                <div className="text-sm text-gray-400">Legendary</div>
              </div>
              <div className="bg-gray-800/50 rounded p-3">
                <div className="text-2xl font-bold text-white">
                  {cards.filter(c => c.rarity === 'Epic').length}
                </div>
                <div className="text-sm text-gray-400">Epic</div>
              </div>
              <div className="bg-gray-800/50 rounded p-3">
                <div className="text-2xl font-bold text-white">
                  {cards.filter(c => c.rarity === 'Rare').length}
                </div>
                <div className="text-sm text-gray-400">Rare</div>
              </div>
            </div>
          </div>
        )}

        {/* Audio effects */}
        <audio ref={audioRef} preload="auto">
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPLaizsIGWi77OihUQA0PVqzn77xYEwxYqOPwtVYeBSu+zPLaizsIGGm66+ilUgw+PRzm8LrsXBg=" type="audio/wav" />
        </audio>
      </div>
    </div>
  );
}