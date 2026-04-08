'use client';

import { useState, useMemo } from 'react';
import { useSounds } from './SoundEffects';
import { useLeaderboard } from '@/lib/useLeaderboard';
import { Trophy, Star, BarChart2, ChevronUp, ChevronDown } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  rating: number;
  level: number;
  wins: number;
  losses: number;
  rank: string;
}

interface LeaderboardProps {
  limit?: number;
  showAvatar?: boolean;
  showStats?: boolean;
}

const RANK_CONFIG: Record<string, { title: string; text: string; bg: string; border: string; glow: string }> = {
  Grandmaster: { title: 'Grandmaster', text: '#c084fc', bg: 'rgba(192,132,252,0.15)', border: 'rgba(192,132,252,0.4)', glow: 'rgba(192,132,252,0.25)' },
  Master:      { title: 'Master',      text: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.4)', glow: 'rgba(248,113,113,0.25)' },
  Diamond:     { title: 'Diamond',    text: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.4)', glow: 'rgba(96,165,250,0.25)' },
  Platinum:    { title: 'Platinum',   text: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.4)', glow: 'rgba(167,139,250,0.25)' },
  Gold:        { title: 'Gold',       text: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', glow: 'rgba(251,191,36,0.25)' },
  Silver:      { title: 'Silver',     text: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)', glow: 'rgba(148,163,184,0.25)' },
  Bronze:      { title: 'Bronze',    text: '#d97706', bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.4)', glow: 'rgba(217,119,6,0.25)' },
  Novice:      { title: 'Novice',     text: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)', glow: 'rgba(107,114,128,0.25)' },
};

const RANK_ICONS: Record<string, string> = {
  Grandmaster: 'GM',
  Master:     'M',
  Diamond:    'D',
  Platinum:   'P',
  Gold:       'G',
  Silver:     'S',
  Bronze:     'B',
  Novice:     'N',
};

const Leaderboard = ({ limit = 10, showAvatar = true, showStats = true }: LeaderboardProps) => {
  const [sortBy, setSortBy] = useState<'rating' | 'wins' | 'level'>('rating');
  const { leaderboard, loading, error } = useLeaderboard(50);
  const { sounds } = useSounds();

  const getRankTitle = (rating: number): string => {
    if (rating >= 1900) return 'Grandmaster';
    if (rating >= 1600) return 'Master';
    if (rating >= 1400) return 'Diamond';
    if (rating >= 1200) return 'Platinum';
    if (rating >= 1000) return 'Gold';
    if (rating >= 800)  return 'Silver';
    if (rating >= 600)  return 'Bronze';
    return 'Novice';
  };

  const sortedPlayers = useMemo((): Player[] => {
    const mapped = leaderboard.map(p => ({
      id: p.playerId.toString(),
      name: p.name,
      rating: p.rating,
      level: p.level,
      wins: p.wins,
      losses: p.losses,
      rank: getRankTitle(p.rating),
    }));

    return [...mapped].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'wins') return b.wins - a.wins;
      if (sortBy === 'level') return b.level - a.level;
      return 0;
    }).slice(0, limit);
  }, [leaderboard, sortBy, limit]);

  const handleSort = (type: 'rating' | 'wins' | 'level') => {
    setSortBy(type);
    sounds.playButton();
  };

  const WinRateBadge = ({ wins, losses }: { wins: number; losses: number }) => {
    const total = wins + losses;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    let colorClass = { text: '#4ade80', bg: 'rgba(74,222,128,0.15)' };
    if (winRate < 40) colorClass = { text: '#f87171', bg: 'rgba(248,113,113,0.15)' };
    else if (winRate < 60) colorClass = { text: '#fbbf24', bg: 'rgba(251,191,36,0.15)' };

    return (
      <span
        className="px-2 py-1 text-xs font-bold rounded uppercase tracking-wider"
        style={{ color: colorClass.text, background: colorClass.bg }}
      >
        {winRate}% WR
      </span>
    );
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy size={20} strokeWidth={1.5} className="text-yellow-400" />
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
            Leaderboard
          </h2>
        </div>
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Trophy size={18} strokeWidth={1.5} className="text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
              Leaderboard
            </h2>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/40 mr-2 hidden md:inline">Sort by:</span>
            {[
              { key: 'rating', label: 'Rating', icon: Trophy },
              { key: 'wins', label: 'Wins', icon: Star },
              { key: 'level', label: 'Level', icon: BarChart2 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleSort(key as 'rating' | 'wins' | 'level')}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  transition-all duration-200
                  ${sortBy === key
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <Icon size={12} strokeWidth={2} />
                <span className="hidden md:inline">{label}</span>
                {sortBy === key && (
                  <ChevronUp size={10} strokeWidth={2} className="text-white/60" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Rank Legend */}
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(RANK_CONFIG).map(([rank, config]) => (
            <div
              key={rank}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs"
              style={{ background: config.bg, border: `1px solid ${config.border}` }}
            >
              <span className="font-bold" style={{ color: config.text }}>{config.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Player List */}
      <div className="divide-y divide-white/5">
        {sortedPlayers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <Trophy size={28} strokeWidth={1.2} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No players yet</p>
            <p className="text-white/20 text-xs mt-1">Be the first to play and claim the top spot!</p>
          </div>
        ) : (
          sortedPlayers.map((player, index) => {
            const rankCfg = RANK_CONFIG[player.rank] || RANK_CONFIG.Novice;
            const isTop3 = index < 3;
            const isPodium = index < 3;

            return (
              <div
                key={player.id}
                className={`
                  group flex items-center gap-4 px-6 py-4
                  transition-all duration-200 cursor-default
                  hover:bg-white/[0.03]
                  ${isPodium ? 'relative' : ''}
                `}
              >
                {/* Podium accent for top 3 */}
                {isPodium && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                    style={{ background: rankCfg.text }}
                  />
                )}

                {/* Rank */}
                <div
                  className="w-8 h-10 flex items-center justify-center flex-shrink-0"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {isTop3 ? (
                    <span
                      className="text-lg font-bold"
                      style={{ color: rankCfg.text }}
                    >
                      {index + 1}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-white/30">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                {showAvatar && (
                  <div className="flex-shrink-0 relative">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        background: `linear-gradient(135deg, ${rankCfg.text}66, ${rankCfg.text}33)`,
                        fontFamily: 'Cinzel, serif',
                        boxShadow: `0 0 12px ${rankCfg.glow}`,
                      }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Rank badge on avatar */}
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: rankCfg.text }}
                    >
                      {RANK_ICONS[player.rank] || 'N'}
                    </div>
                  </div>
                )}

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white truncate" style={{ fontFamily: 'Cinzel, serif' }}>
                      {player.name}
                    </h3>
                    <span
                      className="px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider flex-shrink-0"
                      style={{ color: rankCfg.text, background: rankCfg.bg, border: `1px solid ${rankCfg.border}` }}
                    >
                      {rankCfg.title}
                    </span>
                  </div>

                  {showStats && (
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs" style={{ color: rankCfg.text }}>
                        Rating: {player.rating}
                      </span>
                      <span className="text-xs text-white/40">
                        Level: {player.level}
                      </span>
                      <WinRateBadge wins={player.wins} losses={player.losses} />
                    </div>
                  )}
                </div>

                {/* Stats */}
                {showStats && (
                  <div className="flex-shrink-0 text-right hidden md:block">
                    <div className="text-sm font-bold text-white">
                      {player.wins}W / {player.losses}L
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">
                      {player.wins + player.losses} games
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
