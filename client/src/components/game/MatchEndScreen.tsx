'use client';

import { useMemo } from 'react';
import { Trophy, Crown, RotateCcw, ArrowLeft, Sparkles } from 'lucide-react';
import { useGame } from '@/lib/useGame';
import { useSpacetimeDB } from '@/lib/spacetimedb';
import { useMatches } from '@/lib/useMatches';

interface MatchEndScreenProps {
  gameId: number;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export function MatchEndScreen({ gameId, onPlayAgain, onBackToLobby }: MatchEndScreenProps) {
  const { match } = useGame(BigInt(gameId));
  const { playerId } = useSpacetimeDB();
  const { getPlayerById } = useMatches();

  const status = match?.status ?? 'Unknown';
  const winnerId = match?.winnerId;

  const playerWon = playerId !== null && winnerId !== null && playerId === winnerId;
  const playerLost = playerId !== null && winnerId !== null && playerId !== winnerId;
  const isDraw = status === 'Completed' && !playerWon && !playerLost && winnerId === BigInt(0);

  const winnerName = useMemo(() => {
    if (!winnerId) return 'Unknown';
    const player = getPlayerById(winnerId);
    return player?.name ?? `Player ${winnerId.toString().slice(-6)}`;
  }, [winnerId, getPlayerById]);

  if (status !== 'Completed') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: playerWon
            ? 'radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.2) 0%, transparent 60%)'
            : isDraw
            ? 'radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.2) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 50% 40%, rgba(239,68,68,0.2) 0%, transparent 60%)',
        }}
      />

      {/* Main panel */}
      <div className="relative z-10 glass-card rounded-2xl p-10 max-w-md w-full mx-4 text-center space-y-8 animate-in fade-in zoom-in duration-500">

        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              background: playerWon
                ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))'
                : isDraw
                ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.1))'
                : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))',
              boxShadow: playerWon
                ? '0 0 60px rgba(245,158,11,0.4), 0 0 120px rgba(245,158,11,0.15)'
                : isDraw
                ? '0 0 60px rgba(168,85,247,0.4), 0 0 120px rgba(168,85,247,0.15)'
                : '0 0 60px rgba(239,68,68,0.4), 0 0 120px rgba(239,68,68,0.15)',
            }}
          >
            {playerWon ? (
              <Crown size={48} className="text-amber-400" strokeWidth={1.5} />
            ) : isDraw ? (
              <Sparkles size={48} className="text-purple-400" strokeWidth={1.5} />
            ) : (
              <Sparkles size={48} className="text-red-400" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* Result text */}
        <div className="space-y-2">
          <h1
            className="text-4xl font-bold text-white"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}
          >
            {playerWon ? 'Victory!' : isDraw ? 'Draw' : 'Defeat'}
          </h1>
          <p className="text-white/50 text-sm">
            {playerWon
              ? `You defeated ${winnerName}`
              : isDraw
              ? 'The match ended in a draw'
              : winnerName === 'Unknown' ? 'You were defeated' : `${winnerName} won the match`}
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
          <Trophy size={14} className="text-white/30" strokeWidth={1.5} />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="btn btn-success py-4 text-lg w-full relative overflow-hidden group"
          >
            <div
              className="absolute -inset-1 rounded-xl opacity-30 group-hover:opacity-50 blur-sm transition-opacity duration-500 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, #10b981, #22c55e)' }}
            />
            <div className="relative flex items-center justify-center gap-2">
              <RotateCcw size={18} strokeWidth={2} />
              Play Again
            </div>
          </button>

          <button
            onClick={onBackToLobby}
            className="btn btn-ghost py-3 w-full"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}