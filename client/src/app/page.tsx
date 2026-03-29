'use client';

import { useState, useEffect } from 'react';
import { Card, Pack } from '@/types/card';
import { CardGenerator } from '@/lib/card-generator';
import { Button } from '@/components/Button';
import { Card as CardComponent } from '@/components/Card';

export default function Home() {
  const [generatedCard, setGeneratedCard] = useState<Card | null>(null);
  const [pack, setPack] = useState<Pack | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPack, setShowPack] = useState(false);

  const handleGenerateCard = async () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      const card = CardGenerator.generateCard(Date.now());
      setGeneratedCard(card);
      setIsGenerating(false);
    }, 500);
  };

  const handleGeneratePack = async () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      const newPack = CardGenerator.generatePack();
      setPack(newPack);
      setShowPack(true);
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Monsters
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            A 2D card game where every card is AI-generated and unique
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              variant="primary" 
              onClick={handleGenerateCard}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Card'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleGeneratePack}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Open Pack'}
            </Button>
          </div>
        </div>

        {/* Single Card Generation */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Generate a Single Card
          </h2>
          <div className="flex justify-center">
            {generatedCard ? (
              <CardComponent 
                key={generatedCard.id}
                name={generatedCard.name}
                description={generatedCard.description}
                attack={generatedCard.attack}
                defense={generatedCard.defense}
                range={generatedCard.range}
                rarity={generatedCard.rarity}
                type={generatedCard.card_type}
              />
            ) : (
              <div className="w-96 h-128 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  Click "Generate Card" to create a unique AI card
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pack Opening */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Card Pack
          </h2>
          {pack && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {pack.cards.map((card, index) => (
                <div 
                  key={`${card.id}-${index}`}
                  className={`transform transition-all duration-500 ${
                    showPack ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardComponent 
                    name={card.name}
                    description={card.description}
                    attack={card.attack}
                    defense={card.defense}
                    range={card.range}
                    rarity={card.rarity}
                    type={card.card_type}
                  />
                </div>
              ))}
            </div>
          )}
          {!pack && (
            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {[...Array(7)].map((_, index) => (
                  <div 
                    key={index}
                    className="w-full h-48 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center"
                  >
                    <p className="text-gray-400 text-center">
                      Card {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sample Cards Display */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Sample Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <CardComponent 
              name="Fire Dragon" 
              description="A majestic dragon that breathes scorching flames"
              attack={85} 
              defense={60} 
              range={2}
              rarity="Legendary"
              type="Unit"
            />
            <CardComponent 
              name="Wizard" 
              description="A mystical wizard casting arcane spells"
              attack={45} 
              defense={40} 
              range={3}
              rarity="Rare"
              type="Unit"
            />
            <CardComponent 
              name="Lightning Bolt" 
              description="A powerful spell that strikes from above"
              attack={70} 
              defense={0} 
              range={4}
              rarity="Epic"
              type="Spell"
            />
            <CardComponent 
              name="Castle Tower" 
              description="A sturdy defensive structure with archers"
              attack={0} 
              defense={120} 
              range={2}
              rarity="Rare"
              type="Building"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400">
          <p>Every card is unique and AI-generated. No two cards are the same!</p>
        </div>
      </div>
    </main>
  );
}