'use client';

import { useState, useEffect } from 'react';
import { useSounds } from './SoundEffects';

interface Player {
  id: string;
  name: string;
  rating: number;
  level: number;
  wins: number;
  losses: number;
  rank: string;
  avatar?: string;
}

interface LeaderboardProps {
  limit?: number;
  showAvatar?: boolean;
  showStats?: boolean;
}

const Leaderboard = ({ limit = 10, showAvatar = true, showStats = true }: LeaderboardProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'wins' | 'level'>('rating');
  const { sounds } = useSounds();

  const getRankTitle = (rating: number): string => {
    if (rating >= 1900) return 'Grandmaster';
    if (rating >= 1600) return 'Master';
    if (rating >= 1400) return 'Diamond';
    if (rating >= 1200) return 'Platinum';
    if (rating >= 1000) return 'Gold';
    if (rating >= 800) return 'Silver';
    if (rating >= 600) return 'Bronze';
    return 'Novice';
  };

  const getRankColor = (rating: number): string => {
    if (rating >= 1900) return 'text-purple-600 bg-purple-100';
    if (rating >= 1600) return 'text-red-600 bg-red-100';
    if (rating >= 1400) return 'text-blue-600 bg-blue-100';
    if (rating >= 1200) return 'text-indigo-600 bg-indigo-100';
    if (rating >= 1000) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 800) return 'text-gray-600 bg-gray-100';
    if (rating >= 600) return 'text-orange-600 bg-orange-100';
    return 'text-amber-600 bg-amber-100';
  };

  const generateMockPlayers = (count: number): Player[] => {
    const names = [
      'DragonSlayer99', 'MysticMage', 'ShadowNinja', 'FireWarrior', 'IceQueen',
      'ThunderBolt', 'DarkKnight', 'LightBringer', 'StormCaller', 'FrostGiant',
      'PhoenixRise', 'VoidWalker', 'StarGazer', 'MoonChild', 'SunWarrior',
      'WindRider', 'EarthShaker', 'WaterBender', 'FireMaster', 'IceAngel'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `player-${i + 1}`,
      name: names[i % names.length],
      rating: Math.floor(Math.random() * 2000) + 100,
      level: Math.floor(Math.random() * 50) + 1,
      wins: Math.floor(Math.random() * 200) + 10,
      losses: Math.floor(Math.random() * 150) + 5,
      rank: getRankTitle(Math.floor(Math.random() * 2000) + 100),
    }));
  };

  useEffect(() => {
    // Simulate API call to get leaderboard data
    const fetchLeaderboard = async () => {
      setLoading(true);
      sounds.playNotification();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPlayers = generateMockPlayers(50);
      const sortedPlayers = mockPlayers
        .sort((a, b) => {
          if (sortBy === 'rating') return b.rating - a.rating;
          if (sortBy === 'wins') return b.wins - a.wins;
          if (sortBy === 'level') return b.level - a.level;
          return 0;
        })
        .slice(0, limit);

      setPlayers(sortedPlayers);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [limit, sortBy, sounds]);

  const handleSort = (type: 'rating' | 'wins' | 'level') => {
    setSortBy(type);
    sounds.playButton();
  };

  const WinRateBadge = ({ wins, losses }: { wins: number; losses: number }) => {
    const total = wins + losses;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    
    let colorClass = 'text-green-600 bg-green-100';
    if (winRate < 40) colorClass = 'text-red-600 bg-red-100';
    else if (winRate < 60) colorClass = 'text-yellow-600 bg-yellow-100';

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {winRate}% WR
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Leaderboard</h2>
        <div className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleSort('rating')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              sortBy === 'rating'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rating
          </button>
          <button
            onClick={() => handleSort('wins')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              sortBy === 'wins'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Wins
          </button>
          <button
            onClick={() => handleSort('level')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              sortBy === 'level'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Level
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center space-x-4 p-4 rounded-lg transition-all hover:shadow-md ${
              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200' : 
              index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200' : 
              index === 2 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200' : 
              'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {/* Rank Number */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              {index === 0 ? (
                <span className="text-2xl">🥇</span>
              ) : index === 1 ? (
                <span className="text-2xl">🥈</span>
              ) : index === 2 ? (
                <span className="text-2xl">🥉</span>
              ) : (
                <span className="text-lg font-bold text-gray-600">{index + 1}</span>
              )}
            </div>

            {/* Avatar */}
            {showAvatar && (
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold text-gray-900 truncate">{player.name}</h3>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getRankColor(player.rating)}`}>
                  {player.rank}
                </span>
              </div>
              
              {showStats && (
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-600">Rating: {player.rating}</span>
                  <span className="text-sm text-gray-600">Level: {player.level}</span>
                  <WinRateBadge wins={player.wins} losses={player.losses} />
                </div>
              )}
            </div>

            {/* Stats */}
            {showStats && (
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-medium text-gray-900">
                  {player.wins}W / {player.losses}L
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No players found on the leaderboard.</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;