'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, BookOpen, Sparkles, Settings, X, Layers } from 'lucide-react';
import { GameCard } from './GameCard';
import { CollectionGalleryLoading } from './CollectionGalleryLoading';
import { useCards } from '@/lib/useCards';
import { AICardGenerator } from '@/lib/ai-card-generator';

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

interface FilterOptions {
  rarity: string;
  type: string;
  sortBy: 'name' | 'rarity' | 'attack' | 'defense' | 'range' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

const RARITY_ORDER = ['Common', 'Rare', 'Epic', 'Legendary'];
const TYPE_ORDER = ['Unit', 'Building', 'Spell'];

const STATS_COLORS = {
  Common: '#6b7280',
  Rare: '#3b82f6',
  Epic: '#a855f7',
  Legendary: '#f59e0b',
};

export function CollectionGallery() {
  const { cards: dbCards, loading, error, generateCard } = useCards();
  const [filteredCards, setFilteredCards] = useState<GalleryCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<GalleryCard | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    rarity: 'All',
    type: 'All',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

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
    return [];
  }, [dbCards]);

  // Filter and sort cards
  useEffect(() => {
    let filtered = [...cards];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(term) ||
        card.description.toLowerCase().includes(term) ||
        card.type.toLowerCase().includes(term)
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

      if (filters.sortBy === 'rarity') {
        aValue = RARITY_ORDER.indexOf(a.rarity);
        bValue = RARITY_ORDER.indexOf(b.rarity);
      } else if (filters.sortBy === 'created_at') {
        aValue = a.created_at;
        bValue = b.created_at;
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
      const noun = AICardGenerator.generateRandomNoun();
      const rarity = AICardGenerator.determineRarity();
      const cardType = AICardGenerator.getRandomCardType();

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

      await generateCard(noun, rarity, cardType, aiDescription, aiImageUrl);
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
      Total: cards.length,
    };
  }, [cards]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      rarity: 'All',
      type: 'All',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  }, []);

  const hasActiveFilters = searchTerm || filters.rarity !== 'All' || filters.type !== 'All';

  if (loading && dbCards.length === 0) {
    return <CollectionGalleryLoading />;
  }

  return (
    <main className="min-h-screen bg-atmospheric">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={28} className="text-purple-400" strokeWidth={1.5} />
            <h1 
              className="text-3xl font-bold text-white"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Your Collection
            </h1>
          </div>
          <p className="text-white/50">
            {cards.length} cards generated
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {RARITY_ORDER.map(rarity => (
            <div
              key={rarity}
              className="glass-card rounded-xl p-4 text-center"
            >
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: STATS_COLORS[rarity as keyof typeof STATS_COLORS] }}
              >
                {rarityStats[rarity as keyof typeof rarityStats]}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-wider">
                {rarity}
              </div>
            </div>
          ))}
        </div>

        {/* Search and filters */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" strokeWidth={2} />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Settings size={16} strokeWidth={1.8} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              )}
            </button>

            {/* Generate button */}
            <button
              onClick={handleGenerateNewCard}
              disabled={isGenerating}
              className="btn btn-success"
            >
              {isGenerating ? (
                <>
                  <div className="spinner spinner-sm" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} strokeWidth={1.8} />
                  Generate Card
                </>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
              {/* Rarity filter */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Rarity</label>
                <select
                  value={filters.rarity}
                  onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
                  className="select"
                >
                  <option value="All">All Rarities</option>
                  {RARITY_ORDER.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Type filter */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Card Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="select"
                >
                  <option value="All">All Types</option>
                  {TYPE_ORDER.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="select flex-1"
                  >
                    <option value="created_at">Date</option>
                    <option value="name">Name</option>
                    <option value="rarity">Rarity</option>
                    <option value="attack">Attack</option>
                    <option value="defense">Defense</option>
                    <option value="range">Range</option>
                  </select>
                  <button
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                    }))}
                    className="btn btn-ghost px-3"
                  >
                    {filters.sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-white/50">Showing {filteredCards.length} of {cards.length}</span>
              <button
                onClick={clearFilters}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Cards grid */}
        {(isGenerating || loading) ? (
          <div className="empty-state">
            <div className="spinner spinner-lg mb-4" />
            <p className="text-white/50">
              {loading ? 'Loading cards from database...' : 'Generating your unique AI card...'}
            </p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Layers size={48} className="text-white/30" strokeWidth={1} /></div>
            <p className="empty-state-title">
              {hasActiveFilters ? 'No cards match your filters' : 'No cards yet'}
            </p>
            <p className="empty-state-desc">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search term'
                : 'Generate your first AI card to start building your collection'
              }
            </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn btn-ghost mt-4">
                Clear Filters
              </button>
            ) : (
              <button onClick={handleGenerateNewCard} className="btn btn-primary mt-4">
                Generate First Card
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="cursor-pointer"
              >
                <GameCard
                  name={card.name}
                  description={card.description}
                  attack={card.attack}
                  defense={card.defense}
                  range={card.range}
                  rarity={card.rarity}
                  type={card.type}
                  imageUrl={card.image_url}
                  isSelected={selectedCard?.id === card.id}
                  size="md"
                />
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
          <div 
            className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-purple-400" strokeWidth={1.5} />
                <h3 className="font-semibold text-white">Card Details</h3>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label="Close card details"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Card preview */}
                <div>
                  <GameCard
                    name={selectedCard.name}
                    description={selectedCard.description}
                    attack={selectedCard.attack}
                    defense={selectedCard.defense}
                    range={selectedCard.range}
                    rarity={selectedCard.rarity}
                    type={selectedCard.type}
                    imageUrl={selectedCard.image_url}
                    size="lg"
                  />
                </div>

                {/* Card details */}
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-white/70 mb-3">Combat Stats</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Attack', value: selectedCard.attack, color: '#f87171' },
                        { label: 'Defense', value: selectedCard.defense, color: '#60a5fa' },
                        { label: 'Range', value: selectedCard.range, color: '#4ade80' },
                      ].map(stat => (
                        <div key={stat.label} className="flex items-center justify-between">
                          <span style={{ color: stat.color }}>{stat.label}</span>
                          <span className="text-xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-white/70 mb-2">Description</h4>
                    <p className="text-white/80 leading-relaxed">
                      {selectedCard.description || 'No description available.'}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-white/70 mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50">Card ID</span>
                        <span className="text-white/80 font-mono">#{selectedCard.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Type</span>
                        <span className="text-white/80">{selectedCard.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Rarity</span>
                        <span 
                          className="font-semibold"
                          style={{ color: STATS_COLORS[selectedCard.rarity as keyof typeof STATS_COLORS] }}
                        >
                          {selectedCard.rarity}
                        </span>
                      </div>
                      {selectedCard.created_at > 0 && (
                        <div className="flex justify-between">
                          <span className="text-white/50">Created</span>
                          <span className="text-white/80">
                            {new Date(selectedCard.created_at * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
