'use client';

import { useState, useEffect, useMemo } from 'react';
import { Swords, Building2, Zap, X, Layers } from 'lucide-react';
import { EnhancedCard } from './EnhancedCard';
import { useCards } from '@/lib/useCards';
import { AICardGenerator } from '@/lib/ai-card-generator';
import type { Rarity, CardType } from '@/types/card';

interface GalleryCard {
  id: number;
  name: string;
  description: string;
  attack: number;
  defense: number;
  range: number;
  rarity: string;
  type: string;
  image_url: string;
  created_at: number;
}

interface CollectionGalleryProps {
  initialCards?: GalleryCard[];
}

interface FilterOptions {
  rarity: string;
  type: string;
  sortBy: 'name' | 'rarity' | 'attack' | 'defense' | 'range' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

export function CollectionGallery({ initialCards = [] }: CollectionGalleryProps) {
  const { cards: dbCards, loading, error, generateCard } = useCards();
  const [filteredCards, setFilteredCards] = useState<GalleryCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<GalleryCard | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    rarity: 'All',
    type: 'All',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Map DB cards to gallery cards
  const cards: GalleryCard[] = useMemo(() => {
    if (dbCards.length > 0) {
      return dbCards.map(c => ({
        id: Number(c.id),
        name: c.name,
        description: c.description,
        attack: c.attack,
        defense: c.defense,
        range: c.range,
        rarity: c.rarity,
        type: c.cardType,
        image_url: c.imageUrl,
        created_at: Number(c.createdAt),
      }));
    }
    return initialCards;
  }, [dbCards, initialCards]);

  // Filter and sort cards
  useEffect(() => {
    let filtered = [...cards];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply rarity filter
    if (filters.rarity !== 'All') {
      filtered = filtered.filter(card => card.rarity === filters.rarity);
    }

    // Apply type filter
    if (filters.type !== 'All') {
      filtered = filtered.filter(card => card.type === filters.type);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy];
      let bValue: any = b[filters.sortBy];

      if (filters.sortBy === 'created_at') {
        aValue = new Date(aValue * 1000);
        bValue = new Date(bValue * 1000);
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredCards(filtered);
  }, [cards, searchTerm, filters]);

  const handleGenerateNewCard = async () => {
    setIsGenerating(true);
    try {
      // Generate card parameters using AICardGenerator logic
      const noun = AICardGenerator.generateRandomNoun();
      const rarity = AICardGenerator.determineRarity();
      const cardType = AICardGenerator.getRandomCardType();

      // Call AI endpoints to generate description and image
      const [descRes, imgRes] = await Promise.all([
        fetch('/api/generate-description', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: '', noun, rarity, cardType }),
        }),
        fetch('/api/generate-card-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noun, cardType, rarity, cardId: Date.now() }),
        }),
      ]);

      let aiDescription = '';
      let aiImageUrl = '';

      if (descRes.ok) {
        const descData = await descRes.json();
        aiDescription = descData.description || '';
      }

      if (imgRes.ok) {
        const imgData = await imgRes.json();
        aiImageUrl = imgData.image_url || '';
      }

      // Create card in SpacetimeDB with AI content
      await generateCard(noun, rarity, cardType, aiDescription, aiImageUrl);
      // Card will appear via subscription update
    } catch (error) {
      console.error('Error generating card:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const rarityStats = useMemo(() => {
    return {
      Common: cards.filter(c => c.rarity === 'Common').length,
      Rare: cards.filter(c => c.rarity === 'Rare').length,
      Epic: cards.filter(c => c.rarity === 'Epic').length,
      Legendary: cards.filter(c => c.rarity === 'Legendary').length,
      Total: cards.length
    };
  }, [cards]);

  const typeStats = useMemo(() => {
    return {
      Unit: cards.filter(c => c.type === 'Unit').length,
      Building: cards.filter(c => c.type === 'Building').length,
      Spell: cards.filter(c => c.type === 'Spell').length,
      Total: cards.length
    };
  }, [cards]);

  const rarityColors = {
    Common: 'bg-gray-500',
    Rare: 'bg-blue-500',
    Epic: 'bg-purple-500',
    Legendary: 'bg-yellow-500'
  };

  const typeIcons: Record<string, React.ReactNode> = {
    Unit: <Swords size={16} strokeWidth={2} />,
    Building: <Building2 size={16} strokeWidth={2} />,
    Spell: <Zap size={16} strokeWidth={2} />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">AI Monsters Collection</h1>
          <p className="text-white/70">
            Discover and manage your unique AI-generated cards
          </p>
        </div>

        {/* Collection stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-black/30 rounded-lg p-4 text-center backdrop-blur-sm">
            <div className="text-3xl font-bold text-white">{rarityStats.Total}</div>
            <div className="text-sm text-gray-400">Total Cards</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-gray-300">{rarityStats.Common}</div>
            <div className="text-sm text-gray-400">Common</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-blue-300">{rarityStats.Rare}</div>
            <div className="text-sm text-gray-400">Rare</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-purple-300">{rarityStats.Epic}</div>
            <div className="text-sm text-gray-400">Epic</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-yellow-300">{rarityStats.Legendary}</div>
            <div className="text-sm text-gray-400">Legendary</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-black/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Search Cards</label>
              <input
                type="text"
                placeholder="Name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Rarity filter */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Rarity</label>
              <select
                value={filters.rarity}
                onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="All">All Rarities</option>
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
              </select>
            </div>

            {/* Type filter */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Card Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Unit">Units</option>
                <option value="Building">Buildings</option>
                <option value="Spell">Spells</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="created_at">Newest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="rarity">Rarity</option>
                <option value="attack">Attack (High-Low)</option>
                <option value="defense">Defense (High-Low)</option>
                <option value="range">Range (High-Low)</option>
              </select>
            </div>
          </div>

          {/* Generate button */}
          <div className="flex justify-between items-center">
            <div className="text-white/70 text-sm">
              Showing {filteredCards.length} of {cards.length} cards
            </div>
            <button
              onClick={handleGenerateNewCard}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate New Card'}
            </button>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="max-w-7xl mx-auto">
        {(isGenerating || loading) ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-white/30 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="1" width="18" height="22" rx="2" ry="2"/>
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M7 20.5c0-1.5 2.2-3 5-3s5 1.5 5 3"/>
                </svg>
              </div>
              <div className="text-white/60 text-lg font-medium">{loading ? 'Loading cards from database...' : 'Generating your unique AI card...'}</div>
            </div>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <div className="text-white/60 text-lg font-medium mb-3">No cards found matching your criteria</div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ rarity: 'All', type: 'All', sortBy: 'created_at', sortOrder: 'desc' });
                }}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                onClick={() => setSelectedCard(card)}
              >
                <div className="relative">
                  <EnhancedCard
                    name={card.name}
                    description={card.description}
                    attack={card.attack}
                    defense={card.defense}
                    range={card.range}
                    rarity={card.rarity}
                    type={card.type}
                    imageUrl={card.image_url}
                    isSelected={selectedCard?.id === card.id}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">View Details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedCard.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${rarityColors[selectedCard.rarity as keyof typeof rarityColors]}`}>
                      {selectedCard.rarity}
                    </span>
                    <span className="text-2xl">{typeIcons[selectedCard.type as keyof typeof typeIcons]}</span>
                    <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                      {selectedCard.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Art */}
                <div className="relative">
                  <div className="w-full h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg overflow-hidden flex items-center justify-center">
                    {selectedCard.image_url ? (
                      <img
                        src={selectedCard.image_url}
                        alt={`${selectedCard.name} card art`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.fallback-art');
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="fallback-art flex items-center justify-center text-white/40">
                        <Layers size={64} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Details */}
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">Card Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-red-400 font-medium">Attack</span>
                        <span className="text-2xl font-bold text-white">{selectedCard.attack}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-400 font-medium">Defense</span>
                        <span className="text-2xl font-bold text-white">{selectedCard.defense}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 font-medium">Range</span>
                        <span className="text-2xl font-bold text-white">{selectedCard.range}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedCard.description}</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Details</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Card ID:</span>
                        <span>#{selectedCard.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(selectedCard.created_at * 1000).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span>{selectedCard.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}