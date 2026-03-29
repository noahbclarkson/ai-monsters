'use client';

import { useState, useEffect } from 'react';
import { useSounds } from './SoundEffects';

interface DailyCard {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  type: 'unit' | 'building' | 'spell';
  attack: number;
  defense: number;
  range: number;
  image_url: string;
  date: string;
}

interface DailyCardGeneratorProps {
  onCardGenerated?: (card: DailyCard) => void;
}

const DailyCardGenerator = ({ onCardGenerated }: DailyCardGeneratorProps) => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyCard, setDailyCard] = useState<DailyCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const { sounds } = useSounds();

  // Check if user has already claimed today's card
  useEffect(() => {
    const claimed = localStorage.getItem(`ai-monsters-daily-${currentDate}`);
    setHasClaimed(claimed === 'claimed');
    
    // Load existing daily card if available
    const savedCard = localStorage.getItem(`ai-monsters-daily-card-${currentDate}`);
    if (savedCard) {
      setDailyCard(JSON.parse(savedCard));
    }
  }, [currentDate]);

  const generateDailyCard = async (): Promise<DailyCard> => {
    const rarities: ('common' | 'rare' | 'epic' | 'legendary')[] = ['common', 'rare', 'epic', 'legendary'];
    const types: ('unit' | 'building' | 'spell')[] = ['unit', 'building', 'spell'];
    
    // Weighted rarity: 60% common, 25% rare, 10% epic, 5% legendary
    const weights = [60, 25, 10, 5];
    const randomWeight = Math.random() * 100;
    let rarityIndex = 0;
    let weightSum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      weightSum += weights[i];
      if (randomWeight <= weightSum) {
        rarityIndex = i;
        break;
      }
    }

    const rarity = rarities[rarityIndex];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Generate stats based on rarity and type
    let attack = 10, defense = 10, range = 1;
    
    const baseStats = {
      common: { attack: 10, defense: 10, range: 1 },
      rare: { attack: 15, defense: 12, range: 2 },
      epic: { attack: 20, defense: 15, range: 3 },
      legendary: { attack: 25, defense: 20, range: 4 }
    };

    const stats = baseStats[rarity as keyof typeof baseStats];
    attack += Math.floor(Math.random() * 10) - 5; // ±5 variance
    defense += Math.floor(Math.random() * 10) - 5;
    range = stats.range;

    // Ensure minimum values
    attack = Math.max(5, attack);
    defense = Math.max(5, defense);
    range = Math.max(1, range);

    // Generate card concept based on type
    const concepts = {
      unit: ['Warrior', 'Mage', 'Archer', 'Knight', 'Assassin', 'Paladin', 'Wizard', 'Rogue'],
      building: ['Tower', 'Castle', 'Forge', 'Temple', 'Barracks', 'Library', 'Market', 'Farm'],
      spell: ['Fireball', 'Heal', 'Lightning', 'Shield', 'Teleport', 'Curse', 'Bless', 'Meteor']
    };

    const concept = concepts[type as keyof typeof concepts][Math.floor(Math.random() * concepts[type as keyof typeof concepts].length)];
    
    // Generate name with some fantasy flair
    const prefixes = ['Mystic', 'Ancient', 'Dark', 'Light', 'Shadow', 'Flame', 'Frost', 'Storm'];
    const suffixes = ['Master', 'Warrior', 'Guardian', 'Champion', 'Hero', 'Legend', 'Lord', 'Lady'];
    
    const hasPrefix = Math.random() > 0.5;
    const hasSuffix = Math.random() > 0.3;
    
    let name = concept;
    if (hasPrefix) {
      name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${name}`;
    }
    if (hasSuffix) {
      name = `${name} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    }

    // Generate description
    const descriptions = [
      `A powerful ${type.toLowerCase()} with mysterious origins.`,
      `Ancient legend speaks of this mighty ${type.toLowerCase()} in hushed tones.`,
      `This ${type.toLowerCase()} embodies the essence of ${rarity} power.`,
      `Scholars have long studied the ${type.toLowerCase()} but its secrets remain elusive.`,
      `Few have encountered this ${type.toLowerCase()} and lived to tell the tale.`
    ];

    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    // Generate placeholder image URL (in real implementation, this would use MiniMax)
    const imageUrl = `/api/placeholder/300/450?text=${encodeURIComponent(name)}&rarity=${rarity}`;

    const card: DailyCard = {
      id: `daily-${currentDate}-${Date.now()}`,
      name,
      description,
      rarity,
      type,
      attack,
      defense,
      range,
      image_url: imageUrl,
      date: currentDate
    };

    return card;
  };

  const handleGenerateCard = async () => {
    if (hasClaimed) {
      alert('You have already claimed today\'s card!');
      return;
    }

    setIsLoading(true);
    sounds.playPackOpen();

    try {
      const card = await generateDailyCard();
      setDailyCard(card);
      setHasClaimed(true);
      
      // Save to localStorage
      localStorage.setItem(`ai-monsters-daily-card-${currentDate}`, JSON.stringify(card));
      localStorage.setItem(`ai-monsters-daily-${currentDate}`, 'claimed');
      
      // Add to collection (in real implementation, this would update SpacetimeDB)
      const collection = JSON.parse(localStorage.getItem('ai-monsters-collection') || '[]');
      collection.push(card);
      localStorage.setItem('ai-monsters-collection', JSON.stringify(collection));

      onCardGenerated?.(card);
      sounds.playCardPlace();
    } catch (error) {
      console.error('Failed to generate daily card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-purple-600 bg-purple-100 border-purple-300';
      case 'epic': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'rare': return 'text-green-600 bg-green-100 border-green-300';
      case 'common': return 'text-gray-600 bg-gray-100 border-gray-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '⭐';
      case 'epic': return '💎';
      case 'rare': return '🔷';
      case 'common': return '🔸';
      default: return '🔸';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Card</h2>
        <p className="text-gray-600">Claim your unique AI-generated card every day!</p>
        <p className="text-sm text-gray-500 mt-2">{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      {hasClaimed && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 font-medium">✅ You've already claimed today's card!</p>
        </div>
      )}

      {!dailyCard ? (
        <div className="text-center">
          <div className="mb-4">
            <div className="w-32 h-48 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-lg">🎴</span>
            </div>
          </div>
          <button
            onClick={handleGenerateCard}
            disabled={isLoading || hasClaimed}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : hasClaimed ? 'Already Claimed' : 'Generate Daily Card'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-32 h-48 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-lg">🎴</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 mb-2">
              <span className={`px-3 py-1 text-sm font-bold rounded-full border ${getRarityColor(dailyCard.rarity)}`}>
                {getRarityIcon(dailyCard.rarity)} {dailyCard.rarity.charAt(0).toUpperCase() + dailyCard.rarity.slice(1)}
              </span>
              <span className="px-3 py-1 text-sm font-bold bg-blue-100 text-blue-800 rounded-full">
                {dailyCard.type.charAt(0).toUpperCase() + dailyCard.type.slice(1)}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{dailyCard.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{dailyCard.description}</p>
            
            <div className="flex justify-center space-x-4 text-sm">
              <span className="text-red-600 font-medium">⚔️ {dailyCard.attack}</span>
              <span className="text-blue-600 font-medium">🛡️ {dailyCard.defense}</span>
              <span className="text-green-600 font-medium">🎯 {dailyCard.range}</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">✅ Card added to your collection!</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Every day you can claim one unique AI-generated card</li>
          <li>• Cards are randomly generated with different rarities</li>
          <li>• Your collection grows with every daily claim</li>
          <li>• Cards are saved permanently in your collection</li>
        </ul>
      </div>
    </div>
  );
};

export default DailyCardGenerator;