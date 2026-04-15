'use client';

import { useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { useLeaderboard } from '@/lib/useLeaderboard';
import { LeaderboardLoading } from './LeaderboardLoading';
import { useSpacetimeDB } from '@/lib/spacetimedb';

interface Player {
  id: string;
  name: string;
  rating: number;
  level: number;
  wins: number;
  losses: number;
  rank: string;
  rankTier: 'novice' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';
}

const RANK_CONFIG: Record<string, { name: string; color: string; bg: string; minRating: number }> = {
  novice: { name: 'Novice', color: '#d1d5db', bg: 'rgba(156,163,175,0.12)', minRating: 0 },
  bronze: { name: 'Bronze', color: '#cd7f32', bg: 'rgba(205,127,50,0.15)', minRating: 600 },
  silver: { name: 'Silver', color: '#c0c0c0', bg: 'rgba(192,192,192,0.15)', minRating: 800 },
  gold: { name: 'Gold', color: '#ffd700', bg: 'rgba(255,215,0,0.15)', minRating: 1000 },
  platinum: { name: 'Platinum', color: '#e5e4e2', bg: 'rgba(229,228,226,0.15)', minRating: 1200 },
  diamond: { name: 'Diamond', color: '#b9f2ff', bg: 'rgba(185,242,255,0.15)', minRating: 1400 },
  master: { name: 'Master', color: '#dc2626', bg: 'rgba(220,38,38,0.15)', minRating: 1600 },
  grandmaster: { name: 'Grandmaster', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', minRating: 1900 },
};

const RANK_ORDER = ['novice', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];

function getRankTier(rating: number): Player['rankTier'] {
  for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
    if (rating >= RANK_CONFIG[RANK_ORDER[i]].minRating) {
      return RANK_ORDER[i] as Player['rankTier'];
    }
  }
  return 'novice';
}

function getWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  return total > 0 ? Math.round((wins / total) * 100) : 0;
}

// Inline SVG medal icons for top 3 ranks — no emoji
function MedalIcon({ rank }: { rank: number }) {
  const medalData = [
    { fill: '#ffd700', stroke: '#b8860b', glow: 'rgba(255,215,0,0.5)', label: '1' },
    { fill: '#d4d4d4', stroke: '#9a9a9a', glow: 'rgba(212,212,212,0.4)', label: '2' },
    { fill: '#cd7f32', stroke: '#8b4513', glow: 'rgba(205,127,50,0.45)', label: '3' },
  ];
  const m = medalData[rank - 1];
  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ width: 48, height: 56, filter: `drop-shadow(0 0 8px ${m.glow})` }}
    >
      <svg width="38" height="52" viewBox="0 0 38 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ribbon */}
        <path d="M11 0h16v18H11z" fill={m.fill} />
        <path d="M11 0h8v18h-8z" fill={m.stroke} opacity="0.4" />
        {/* Ribbon tails */}
        <path d="M11 0L9 8h8L16 0z" fill={m.fill} opacity="0.9" />
        <path d="M27 0l2 8h-8l1-8z" fill={m.fill} opacity="0.9" />
        {/* Medal circle */}
        <circle cx="19" cy="30" r="16" fill={m.fill} />
        <circle cx="19" cy="30" r="11" fill={m.stroke} opacity="0.2" />
        {/* Inner ring */}
        <circle cx="19" cy="30" r="13" fill="none" stroke={m.stroke} strokeWidth="1" opacity="0.3" />
        {/* Rank number */}
        <text 
          x="19" y="35" 
          textAnchor="middle" 
          fontSize="13" 
          fontWeight="bold" 
          fill="white" 
          fontFamily="JetBrains Mono, monospace"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          {m.label}
        </text>
      </svg>
    </div>
  );
}

interface LeaderboardEntryProps {
  player: Player;
  rank: number;
  isCurrentPlayer?: boolean;
}

function LeaderboardEntry({ player, rank, isCurrentPlayer }: LeaderboardEntryProps) {
  const config = RANK_CONFIG[player.rankTier];
  const winRate = getWinRate(player.wins, player.losses);
  
  const isTop3 = rank <= 3;
  const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32'];

  return (
    <div 
      className={`
        glass-card rounded-xl p-4 transition-all duration-200
        ${isCurrentPlayer ? 'ring-2 ring-purple-500/50' : ''}
        ${isTop3 ? 'border' : ''}
        hover:scale-[1.015] hover:shadow-lg
      `}
      style={{
        borderColor: isTop3 ? medalColors[rank - 1] + '40' : undefined,
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        '--tw-shadow-color': isTop3 ? medalColors[rank - 1] + '30' : 'rgba(139,92,246,0.15)',
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`
          ${isTop3 ? 'w-14 h-14' : 'w-10 h-10'} rounded-xl flex items-center justify-center font-bold
          ${isTop3 ? 'text-lg' : 'text-sm'}
        `}
        style={{
          background: isTop3 ? `${medalColors[rank - 1]}20` : 'rgba(255,255,255,0.05)',
          color: isTop3 ? medalColors[rank - 1] : '#8888a8',
        }}
        >
          {rank <= 3 ? (
            <MedalIcon rank={rank} />
          ) : (
            <span className="font-mono text-sm">{rank}</span>
          )}
        </div>

        {/* Avatar */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ background: `linear-gradient(135deg, ${config.color}40, ${config.color}20)` }}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white truncate">{player.name}</span>
            {isCurrentPlayer && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold"
                style={{
                  background: 'rgba(139,92,246,0.2)',
                  color: '#a855f7',
                  boxShadow: '0 0 8px rgba(139,92,246,0.4), 0 0 16px rgba(139,92,246,0.15)',
                }}
              >
                You
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            {/* Rank badge */}
            <span 
              className="px-2 py-0.5 rounded font-semibold text-xs"
              style={{ background: config.bg, color: config.color }}
            >
              {config.name}
            </span>
            {/* Rating */}
            <span className="text-white/50 font-mono">{player.rating} SR</span>
          </div>
        </div>

        {/* Stats */}
        <div className="text-right">
          <div className="text-white font-semibold">
            {player.wins}W / {player.losses}L
          </div>
          <div 
            className="text-sm font-semibold"
            style={{ color: winRate >= 60 ? '#22c55e' : winRate >= 40 ? '#f59e0b' : '#ef4444' }}
          >
            {winRate}% WR
          </div>
        </div>
      </div>
    </div>
  );
}

export function Leaderboard() {
  const { leaderboard, loading, error } = useLeaderboard(50);
  const [sortBy, setSortBy] = useState<'rating' | 'wins' | 'level'>('rating');
  const { playerId } = useSpacetimeDB();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const sortedPlayers = useMemo((): Player[] => {
    const mapped = leaderboard.map(p => {
      const tier = getRankTier(p.rating);
      return {
        id: p.playerId.toString(),
        name: p.name,
        rating: p.rating,
        level: p.level,
        wins: p.wins,
        losses: p.losses,
        rank: RANK_CONFIG[tier].name,
        rankTier: tier,
      };
    });

    return [...mapped].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'wins') return b.wins - a.wins;
      if (sortBy === 'level') return b.level - a.level;
      return 0;
    });
  }, [leaderboard, sortBy]);

  // Paginated view — reset to page 1 when sort order changes
  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPlayers = sortedPlayers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSortChange = (key: typeof sortBy) => {
    setSortBy(key);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-atmospheric">
        <div className="container mx-auto px-4 py-8">
          <LeaderboardLoading />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-atmospheric">
        <div className="container mx-auto px-4 py-8">
          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="text-red-400">Failed to load leaderboard: {error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-atmospheric">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Trophy size={32} className="text-yellow-400" strokeWidth={1.5} />
          <h1 
            className="text-3xl font-bold text-white"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Leaderboard
          </h1>
        </div>

        {/* Rank tiers legend */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {RANK_ORDER.map(tier => {
              const config = RANK_CONFIG[tier];
              return (
                <div
                  key={tier}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: config.bg, color: config.color }}
                >
                  {config.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-white/50">Sort by:</span>
          {([
            { key: 'rating', label: 'Rating' },
            { key: 'wins', label: 'Wins' },
            { key: 'level', label: 'Level' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSortChange(key)}
              className={`btn text-sm ${sortBy === key ? 'btn-primary' : 'btn-ghost'}`}
            >
              {label}
            </button>
          ))}
          
          <div className="flex-1" />
          
          {sortedPlayers.length > 0 && (
            <span className="text-sm text-white/50">
              {sortedPlayers.length} players
            </span>
          )}
        </div>

        {/* Leaderboard list */}
        <div className="space-y-3">
          {paginatedPlayers.map((player, index) => (
            <LeaderboardEntry
              key={player.id}
              player={player}
              rank={(safePage - 1) * PAGE_SIZE + index + 1}
              isCurrentPlayer={player.id === playerId?.toString()}
            />
          ))}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="btn btn-ghost px-4 text-sm disabled:opacity-30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Prev
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    page === safePage
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                      : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="btn btn-ghost px-4 text-sm disabled:opacity-30"
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        )}

        {/* Empty state */}
        {sortedPlayers.length === 0 && (
          <div className="empty-state">
            <div className="relative">
              <div className="empty-state-icon"><Trophy size={48} className="text-yellow-400/40" strokeWidth={1} /></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <span className="text-yellow-400/60 text-2xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>#</span>
                </div>
              </div>
            </div>
            <p className="empty-state-title">No ranked players yet</p>
            <p className="empty-state-desc">
              Complete your first match to earn a rank and appear on the leaderboard.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Leaderboard;
