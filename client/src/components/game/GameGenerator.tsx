'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Gift, Layers } from 'lucide-react';
import { GameCard } from './GameCard';
import { AICardGenerator } from '@/lib/ai-card-generator';
import { Card } from '@/types/card';

export function GameGenerator() {
  const [generatedCards, setGeneratedCards] = useState<Card[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [packCount, setPackCount] = useState(0);

  const generateSingleCard = useCallback(async () => {
    setIsGenerating(true);
    try {
      const newCard = await AICardGenerator.generateCard(
        generatedCards.length + 1,
        generatedCards.map(c => c.name)
      );
      setGeneratedCards(prev => [...prev, newCard]);
    } catch (error) {
      console.error('Error generating card:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [generatedCards]);

  const generatePack = useCallback(async () => {
    setIsGenerating(true);
    try {
      const pack = await AICardGenerator.generatePack(
        generatedCards.map(c => c.name)
      );
      setGeneratedCards(prev => [...prev, ...pack.cards]);
      setPackCount(prev => prev + 1);
    } catch (error) {
      console.error('Error generating pack:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [generatedCards]);

  const rarityStats = {
    Common: generatedCards.filter(c => c.rarity === 'Common').length,
    Rare: generatedCards.filter(c => c.rarity === 'Rare').length,
    Epic: generatedCards.filter(c => c.rarity === 'Epic').length,
    Legendary: generatedCards.filter(c => c.rarity === 'Legendary').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          Card Generator
        </h2>
        <p className="text-white/50">
          Create unique AI-powered cards with real artwork and intelligent descriptions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total', value: generatedCards.length, color: '#8b5cf6' },
          { label: 'Packs', value: packCount, color: '#8b5cf6' },
          { label: 'Legendary', value: rarityStats.Legendary, color: '#f59e0b' },
          { label: 'Epic', value: rarityStats.Epic, color: '#a855f7' },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs text-white/50">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Generate buttons */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={generateSingleCard}
          disabled={isGenerating}
          className="btn btn-primary py-3 px-6"
        >
          {isGenerating ? (
            <>
              <div className="spinner spinner-sm" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} strokeWidth={1.8} />
              Generate Single
            </>
          )}
        </button>
        
        <button
          onClick={generatePack}
          disabled={isGenerating}
          className="btn btn-success py-3 px-6"
        >
          {isGenerating ? (
            <>
              <div className="spinner spinner-sm" />
              Generating Pack...
            </>
          ) : (
            <>
              <Gift size={16} strokeWidth={1.8} />
              Generate Pack (7)
            </>
          )}
        </button>
      </div>

      {/* Collection */}
      {generatedCards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Layers size={48} className="text-purple-400/40" strokeWidth={1} /></div>
          <p className="empty-state-title">No cards yet</p>
          <p className="empty-state-desc">
            Click a button above to generate your first AI card
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {generatedCards.map((card, index) => (
            <div key={`${card.id}-${index}`} className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
              <GameCard
                name={card.name}
                description={card.description}
                attack={card.attack}
                defense={card.defense}
                range={card.range}
                rarity={card.rarity}
                type={card.card_type}
                imageUrl={card.image_url}
                size="md"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
