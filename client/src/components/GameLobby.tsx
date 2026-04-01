'use client';

import { useState } from 'react';
import { GameBoard } from './GameBoard';
import { useMatches } from '@/lib/useMatches';

export function GameLobby() {
  const [activeTab, setActiveTab] = useState<'lobby' | 'create' | 'play'>('lobby');
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');
  const { matches, players, loading, error, createMatch, getPlayerById, getWaitingMatches, getActiveMatches } = useMatches();

  const handleCreateMatch = async (opponentId: number) => {
    try {
      // Use player 1 as default creator if no players exist yet
      const player1Id = players.length > 0 ? Number(players[0].id) : 1;
      await createMatch(BigInt(player1Id), BigInt(opponentId));
    } catch (e) {
      console.error('Error creating match:', e);
    }
  };

  const handleJoinMatch = (matchId: number) => {
    setSelectedMatchId(matchId);
    setActiveTab('play');
  };

  const renderLobby = () => (
    <div className="space-y-6">
      {/* Quick Play */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Play</h2>
        <button
          onClick={() => {
            // Create match vs AI bot (player 2 if exists, otherwise just create a match)
            const botPlayer = players.find(p => p.name.toLowerCase().includes('bot') || p.name === 'AI Bot');
            handleCreateMatch(botPlayer ? Number(botPlayer.id) : 2);
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg"
        >
          Play vs AI Bot
        </button>
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
                    <p className="text-gray-400 text-sm">Match #{match.id.toString()}</p>
                  </div>
                  <button
                    onClick={() => handleJoinMatch(Number(match.id))}
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

      {/* Available Players */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Challenge Players</h2>
        {players.length === 0 ? (
          <p className="text-gray-400">No other players available.</p>
        ) : (
          <div className="space-y-3">
            {players.slice(0, 5).map(player => (
              <div key={String(player.id)} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">{player.name}</p>
                  <p className="text-gray-400 text-sm">Rating: {player.rating}</p>
                </div>
                <button
                  onClick={() => handleCreateMatch(Number(player.id))}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  Challenge
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCreateGame = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Create New Game</h2>
        
        <div className="mb-6">
          <label className="block text-white font-semibold mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">Quick Match</h3>
            <p className="text-gray-300 mb-4">Get matched with an AI opponent for a quick game</p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg">
              🤖 Play vs AI
            </button>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">Private Match</h3>
            <p className="text-gray-300 mb-4">Create a match for you and a friend to join</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
              👥 Create Private Room
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold text-white mb-3">Game Settings</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Deck Size</span>
              <select className="bg-gray-700 text-white px-3 py-1 rounded">
                <option>30 cards (Standard)</option>
                <option>50 cards (Large)</option>
                <option>100 cards (Tournament)</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Time Limit</span>
              <select className="bg-gray-700 text-white px-3 py-1 rounded">
                <option>No limit</option>
                <option>5 minutes</option>
                <option>10 minutes</option>
                <option>20 minutes</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎮 AI Monsters Arena
          </h1>
          <p className="text-xl text-gray-300">
            Battle with unique AI-generated cards
          </p>
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
              🏠 Lobby
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'create' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              ➕ Create Game
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'lobby' && renderLobby()}
        {activeTab === 'create' && renderCreateGame()}
        {activeTab === 'play' && selectedMatchId && (
          <div>
            <GameBoard gameId={selectedMatchId} />
          </div>
        )}
      </div>
    </main>
  );
}