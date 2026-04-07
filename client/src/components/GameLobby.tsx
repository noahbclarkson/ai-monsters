'use client';

import { useState } from 'react';
import { GameBoard } from './GameBoard';
import { useMatches } from '@/lib/useMatches';
import { useBotMatch } from '@/lib/useBotMatch';
import { useSpacetimeDB } from '@/lib/spacetimedb';

export function GameLobby() {
  const [activeTab, setActiveTab] = useState<'lobby' | 'create' | 'play'>('lobby');
  const [selectedMatchId, setSelectedMatchId] = useState<bigint | null>(null);
  const { matches, players, loading, error, getPlayerById, getActiveMatches } = useMatches();
  const { conn, connected, playerId } = useSpacetimeDB();
  const { match: botMatch, startSinglePlayerMatch, joinBotQueue, joinHumanQueue, leaveQueue, isBotTurn, botRunning, isMyTurn, error: botError } = useBotMatch(selectedMatchId);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [starting, setStarting] = useState(false);

  const handlePlayVsBot = async () => {
    if (!conn || !playerId) return;
    setStarting(true);
    try {
      // Collect the player's cards (first 5 from cards table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = conn.db as any;
      const myCards: bigint[] = [];
      const cardsTable = db.cards as { iter(): Iterable<{ id: bigint }> } | undefined;
      if (cardsTable) {
        for (const card of cardsTable.iter()) {
          myCards.push(card.id);
          if (myCards.length >= 5) break;
        }
      }

      // If not enough cards, generate some first
      if (myCards.length < 5) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reducers = conn.reducers as any;
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
        // Re-collect cards after generation
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

  const renderLobby = () => (
    <div className="space-y-6">
      {/* Quick Play vs Bot */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Play vs AI</h2>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <button
          onClick={handlePlayVsBot}
          disabled={!connected || starting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold text-lg"
        >
          {starting ? 'Starting...' : 'Play vs AI Bot'}
        </button>
        {!connected && <p className="text-yellow-400 text-sm mt-2">Connecting to server...</p>}
      </div>

      {/* Matchmaking */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Multiplayer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={joinHumanQueue}
            disabled={!connected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold"
          >
            Find Match
          </button>
          <button
            onClick={leaveQueue}
            disabled={!connected}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold"
          >
            Leave Queue
          </button>
        </div>
      </div>

      {/* Active Matches */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Active Matches</h2>
        {loading ? (
          <p className="text-gray-400">Loading matches...</p>
        ) : getActiveMatches().length === 0 ? (
          <p className="text-gray-400">No active matches. Start a new game!</p>
        ) : (
          <div className="space-y-3">
            {getActiveMatches().map(match => {
              const player1 = getPlayerById(match.player1Id);
              const player2 = getPlayerById(match.player2Id);
              return (
                <div key={String(match.id)} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">
                      {player1?.name ?? `Player ${match.player1Id}`} vs {player2?.name ?? `Player ${match.player2Id}`}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Match #{match.id.toString()}
                      {match.currentTurn === playerId ? ' - Your turn' : ' - Opponent turn'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinMatch(match.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Continue
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Monsters Arena
          </h1>
          <p className="text-xl text-gray-300">
            Battle with unique AI-generated cards
          </p>
          {botError && <p className="text-red-400 text-sm mt-2">{botError}</p>}
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setActiveTab('lobby')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'lobby'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Lobby
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'lobby' && renderLobby()}
        {activeTab === 'play' && selectedMatchId && (
          <div>
            {isBotTurn && (
              <div className="text-center text-yellow-300 mb-4 text-lg">
                {botRunning ? 'Bot is thinking...' : 'Bot turn...'}
              </div>
            )}
            {!isMyTurn && !isBotTurn && botMatch && (
              <div className="text-center text-gray-400 mb-4">
                Waiting for opponent...
              </div>
            )}
            <GameBoard gameId={Number(selectedMatchId)} />
          </div>
        )}
      </div>
    </main>
  );
}
