'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types/card';
import { AICardGenerator } from '@/lib/ai-card-generator';
import { Card as CardComponent } from '@/components/Card';

import { PackOpening } from '@/components/PackOpening';

interface EnhancedCardGeneratorProps {
  lastCards?: string[];
}

export function EnhancedCardGenerator({ lastCards = [] }: EnhancedCardGeneratorProps) {
  const [generatedCards, setGeneratedCards] = useState<Card[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [packCount, setPackCount] = useState(0);
  const [showPack, setShowPack] = useState(false);
  const [currentPack, setCurrentPack] = useState<Card[]>([]);

  const generateSingleCard = async () => {
    setIsGenerating(true);
    try {
      const newCard = await AICardGenerator.generateCard(
        generatedCards.length + 1,
        [...lastCards, ...generatedCards.map(c => c.name)]
      );
      setGeneratedCards(prev => [...prev, newCard]);
    } catch (error) {
      console.error('Error generating card:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePack = async () => {
    setIsGenerating(true);
    try {
      const pack = await AICardGenerator.generatePack(
        [...lastCards, ...generatedCards.map(c => c.name)]
      );
      setCurrentPack(pack.cards);
      setPackCount(prev => prev + 1);
      setShowPack(true);
      
      // Add pack cards to collection after animation
      setTimeout(() => {
        setGeneratedCards(prev => [...prev, ...pack.cards]);
      }, 3000);
    } catch (error) {
      console.error('Error generating pack:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🎴 AI Monsters Card Generator</h1>
        <p className="text-lg text-gray-600 mb-6">
          Generate unique AI-powered cards with real artwork and intelligent descriptions
        </p>
        
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={generateSingleCard} 
            disabled={isGenerating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Single Card'}
          </button>
          
          <button
            onClick={generatePack} 
            disabled={isGenerating}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating Pack...' : 'Generate Pack (7 Cards)'}
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          Generated: {generatedCards.length} cards | Packs opened: {packCount}
        </div>
      </div>

      {/* Pack Opening Animation */}
      {showPack && (
        <div className="mb-8">
          <PackOpening 
            pack={{ cards: currentPack, generated_at: Date.now() / 1000 }} 
            onPackComplete={() => setShowPack(false)} 
          />
        </div>
      )}

      {/* Card Collection Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Card Collection</h2>
        {generatedCards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No cards generated yet. Click a button above to start!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {generatedCards.map((card) => (
              <div key={`${card.id}-${card.created_at}`} className="transform hover:scale-105 transition-transform">
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
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      {generatedCards.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Collection Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{generatedCards.length}</div>
              <div className="text-sm text-gray-600">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {generatedCards.filter(c => c.rarity === 'Legendary').length}
              </div>
              <div className="text-sm text-gray-600">Legendary</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {generatedCards.filter(c => c.rarity === 'Epic').length}
              </div>
              <div className="text-sm text-gray-600">Epic</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {generatedCards.filter(c => c.card_type === 'Unit').length}
              </div>
              <div className="text-sm text-gray-600">Units</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}