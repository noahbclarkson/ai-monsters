'use client';

import { useState } from 'react';
import { Bot, Swords, Globe, Search, X, FileText } from 'lucide-react';
import { useMatches } from '@/lib/useMatches';
import { useBotMatch } from '@/lib/useBotMatch';
import { useSpacetimeDB } from '@/lib/spacetimedb';
import { GameBoard } from './GameBoard';

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Easy: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.4)', glow: 'rgba(34,197,94,0.3)' },
  Medium: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: 'rgba(59,130,246,0.4)', glow: 'rgba(59,130,246,0.3)' },
  Hard: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.4)', glow: 'rgba(239,68,68,0.3)' },
};

const DIFFICULTY_DESCRIPTIONS: Record<string, string> = {
  Easy: 'Random moves — great for learning',
  Medium: 'Basic strategy — a fair challenge',
  Hard: 'Optimal play — for experienced players',
};

export function GameLobby() {
  const [activeTab, setActiveTab] = useState<'lobby' | 'play'>('lobby');
  const [selectedMatchId, setSelectedMatchId] = useState<bigint | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [starting, setStarting] = useState(false);
  const [joining, setJoining] = useState(false);

  const { matches, players, loading, error, getPlayerById, getActiveMatches } = useMatches();
  const { conn, connected, playerId } = useSpacetimeDB();
  const { 
    match: botMatch, 
    startSinglePlayerMatch, 
    joinBotQueue, 
    joinHumanQueue, 
    leaveQueue, 
    isBotTurn, 
    botRunning, 
    isMyTurn, 
    error: botError 
  } = useBotMatch(selectedMatchId);

  const activeMatches = getActiveMatches();
  const diffConfig = DIFFICULTY_COLORS[selectedDifficulty];

  const handlePlayVsBot = async () => {
    if (!conn || !playerId) {
      console.error("Not connected or missing playerId");
      return;
    }
    setStarting(true);
    try {
      const db = conn.db as Record<string, { iter(): Iterable<{ id: bigint }> }>;
      const myCards: bigint[] = [];
      const cardsTable = db.cards;
      if (cardsTable) {
        for (const card of cardsTable.iter()) {
          myCards.push(card.id);
          if (myCards.length >= 5) break;
        }
      }

      if (myCards.length < 5) {
        const reducers = conn.reducers as Record<string, (opts: unknown) => Promise<void>>;
        const nouns = ['Dragon', 'Phoenix', 'Golem', 'Spectre', 'Wraith'];
        for (let i = myCards.length; i < 5; i++) {
          await reducers.generateCard({
            seedNoun: nouns[i],
            rarity: i < 2 ? 'Common' : 'Rare',
            cardType: 'Unit',
            aiDescription: '',
            aiImageUrl: '',
          });
        }
        myCards.length = 0;
        if (cardsTable) {
          for (const card of cardsTable.iter()) {
            myCards.push(card.id);
            if (myCards.length >= 5) break;
          }
        }
      }

      if (myCards.length >= 5) {
        await startSinglePlayerMatch(selectedDifficulty, myCards.slice(0, 5));

        // Wait for the match to appear in the database and navigate to it
        const maxAttempts = 20; // 2s max wait
        let matchFound = false;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise(r => setTimeout(r, 100));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const matchesTable = (conn.db as any).game_matches as { iter(): Iterable<{ id: bigint; player1Id: bigint; status: string }> } | undefined;
          if (matchesTable) {
            for (const row of matchesTable.iter()) {
              if (row.player1Id === playerId && row.status === 'Active') {
                setSelectedMatchId(row.id);
                setActiveTab('play');
                matchFound = true;
                break;
              }
            }
          }
          if (matchFound) break;
        }
        if (!matchFound) {
          console.error('Failed to find match after creation');
        }
      }
    } catch (e) {
      console.error('Error starting bot match:', e);
    } finally {
      setStarting(false);
    }
  };

  const handleJoinMatch = (matchId: bigint) => {
    setSelectedMatchId(matchId);
    setActiveTab('play');
  };

  const handleLeaveQueue = () => {
    leaveQueue();
  };

  // Render lobby view
  const renderLobby = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 relative">
        {/* Ambient glows */}
        <div className="glow-orb glow-orb-purple w-96 h-96 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        
        <h1 
          className="text-5xl font-bold mb-4 relative animate-float"
          style={{ 
            fontFamily: 'Cinzel, serif', 
            letterSpacing: '0.05em',
            background: 'linear-gradient(135deg, #e8e8f5 0%, #a855f7 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.4))',
          }}
        >
          AI Monsters Arena
        </h1>
        <p className="text-lg text-white/60 relative">
          Battle with unique AI-generated cards
        </p>
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-500/40" />
          <div className="w-2 h-2 rounded-full bg-purple-500/60" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-500/40" />
        </div>
      </div>

      {/* Connection status */}
      {!connected && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
          <p className="text-yellow-400">Connecting to server...</p>
        </div>
      )}

      {/* Quick Play vs Bot */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
            <Bot size={24} className="text-green-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
              Play vs AI Bot
            </h2>
            <p className="text-sm text-white/50">Challenge yourself against the machine</p>
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/70 mb-3">Select Difficulty</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['Easy', 'Medium', 'Hard'] as const).map(diff => {
              const config = DIFFICULTY_COLORS[diff];
              const isSelected = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`
                    p-4 rounded-xl text-center transition-all duration-200
                    border relative overflow-hidden
                  `}
                  style={{
                    background: isSelected ? config.bg : 'rgba(255,255,255,0.03)',
                    borderColor: isSelected ? config.border : 'rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? `0 0 20px ${config.glow}, 0 4px 12px rgba(0,0,0,0.3)` : 'none',
                  }}
                >
                  {/* Glow layer for selected state */}
                  {isSelected && (
                    <div 
                      className="absolute inset-0 rounded-xl opacity-20"
                      style={{ background: `radial-gradient(ellipse at center, ${config.glow} 0%, transparent 70%)` }}
                    />
                  )}
                  <div 
                    className="text-lg font-bold mb-1 relative"
                    style={{ color: isSelected ? config.text : '#8888a8' }}
                  >
                    {diff}
                  </div>
                  <div className="text-xs text-white/40 leading-relaxed relative">
                    {DIFFICULTY_DESCRIPTIONS[diff]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handlePlayVsBot}
          disabled={!connected || starting}
          className="w-full btn btn-success py-4 text-lg relative overflow-hidden group"
        >
          {starting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="spinner spinner-sm" />
              <span>Starting Match...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Swords size={18} strokeWidth={1.8} />
              <span>Start Battle</span>
            </div>
          )}
        </button>
        {connected && !playerId && (
          <p className="text-xs text-white/40 text-center mt-2">
            Waiting for identity... please wait a moment
          </p>
        )}
      </div>

      {/* Multiplayer Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
            <Globe size={24} className="text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
              Multiplayer
            </h2>
            <p className="text-sm text-white/50">Find a human opponent online</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={joinHumanQueue}
            disabled={!connected || !playerId || joining}
            className="btn btn-primary py-4"
          >
            <Search size={16} strokeWidth={2} />
            Find Match
          </button>
          <button
            onClick={handleLeaveQueue}
            disabled={!connected || !playerId}
            className="btn btn-ghost py-4"
          >
            <X size={16} strokeWidth={2} />
            Leave Queue
          </button>
        </div>
      </div>

      {/* Active Matches */}
      {activeMatches.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={18} className="text-purple-400" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
              Active Matches
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold">
              {activeMatches.length}
            </span>
          </div>

          <div className="space-y-3">
            {activeMatches.map(match => {
              const player1 = getPlayerById(match.player1Id);
              const player2 = getPlayerById(match.player2Id);
              const isMyMatch = match.player1Id === playerId || match.player2Id === playerId;
              
              return (
                <div 
                  key={String(match.id)}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {player1?.name ?? `Player ${match.player1Id}`}
                        </span>
                        <span className="text-white/40">vs</span>
                        <span className="font-semibold text-white">
                          {player2?.name ?? `Player ${match.player2Id}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <span>Match #{match.id.toString().slice(-6)}</span>
                        {match.currentTurn === playerId && (
                          <span className="text-green-400">Your turn</span>
                        )}
                        {isMyMatch && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs">
                            Your Match
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinMatch(match.id)}
                      className="btn btn-primary"
                    >
                      {isMyMatch ? 'Continue' : 'Spectate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Errors */}
      {(error || botError) && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error || botError}</p>
        </div>
      )}
    </div>
  );

  // Render game view
  const renderGame = () => (
    <div>
      {/* Back to lobby */}
      <button
        onClick={() => {
          setActiveTab('lobby');
          setSelectedMatchId(null);
        }}
        className="mb-6 btn btn-ghost"
      >
        ← Back to Lobby
      </button>

      {/* Turn indicator */}
      {activeTab === 'play' && selectedMatchId && (
        <div className="mb-4">
          {isBotTurn && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="spinner spinner-sm" />
              <span className="text-yellow-400 font-medium">
                {botRunning ? 'Bot is thinking...' : 'Bot turn...'}
              </span>
            </div>
          )}
          {!isMyTurn && !isBotTurn && botMatch && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/60">Waiting for opponent...</span>
            </div>
          )}
        </div>
      )}

      {/* Game board */}
      {selectedMatchId && (
        <GameBoard gameId={Number(selectedMatchId)} />
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-atmospheric">
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'lobby' && renderLobby()}
        {activeTab === 'play' && renderGame()}
      </div>
    </main>
  );
}
