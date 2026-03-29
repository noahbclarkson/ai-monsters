'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';

interface BoardTile {
  card_id?: number;
  is_face_up: boolean;
  is_attack_mode: boolean;
  owner_player_id?: number;
}

interface GameState {
  tiles: BoardTile[][];
  current_turn: number;
  turn_number: number;
  phase: 'Placement' | 'Action' | 'Combat';
  status: 'Waiting' | 'Active' | 'Completed' | 'Abandoned';
  winner_id?: number;
}

interface GameBoardProps {
  gameId: number;
}

export function GameBoard({ gameId }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [handCards, setHandCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameState();
  }, [gameId]);

  const fetchGameState = async () => {
    try {
      // Placeholder - would fetch from SpacetimeDB
      const mockState: GameState = {
        tiles: Array(6).fill(null).map(() => 
          Array(3).fill(null).map(() => ({
            is_face_up: false,
            is_attack_mode: false
          }))
        ),
        current_turn: 1,
        turn_number: 1,
        phase: 'Placement',
        status: 'Active'
      };
      setGameState(mockState);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game state:', error);
      setLoading(false);
    }
  };

  const handleTileClick = (x: number, y: number) => {
    if (!gameState || gameState.status !== 'Active') return;

    if (selectedTile) {
      // Try to move or attack
      if (selectedTile.x === x && selectedTile.y === y) {
        // Deselect
        setSelectedTile(null);
      } else {
        // Try to move/attack
        handleAction(selectedTile.x, selectedTile.y, x, y);
        setSelectedTile(null);
      }
    } else {
      // Select tile
      setSelectedTile({ x, y });
    }
  };

  const handleAction = (fromX: number, fromY: number, toX: number, toY: number) => {
    // Placeholder for game actions
    console.log(`Action from (${fromX},${fromY}) to (${toX},${toY})`);
  };

  const placeCard = (cardId: number, x: number, y: number) => {
    // Placeholder for placing a card
    console.log(`Place card ${cardId} at (${x},${y})`);
  };

  const endTurn = () => {
    // Placeholder for ending turn
    console.log('End turn');
  };

  const getTileClass = (x: number, y: number) => {
    const tile = gameState?.tiles[x][y];
    const isSelected = selectedTile?.x === x && selectedTile?.y === y;
    
    let classes = 'w-24 h-32 border-2 border-gray-700 rounded-lg flex items-center justify-center cursor-pointer ';
    
    if (isSelected) {
      classes += 'ring-4 ring-yellow-400 ring-opacity-50 ';
    }
    
    if (tile?.is_face_up) {
      classes += 'bg-white ';
    } else {
      classes += 'bg-gradient-to-br from-gray-800 to-gray-900 ';
    }
    
    return classes;
  };

  const renderCard = (tile: BoardTile | null, x: number, y: number) => {
    if (!tile || !tile.is_face_up) {
      return (
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">{x},{y}</div>
          <div className="text-2xl">🂠</div>
        </div>
      );
    }

    return (
      <div className={`text-center ${tile.is_attack_mode ? 'bg-red-100' : 'bg-blue-100'} p-2 rounded`}>
        <div className="text-xs font-bold">
          {tile.is_attack_mode ? '⚔️' : '🛡️'}
        </div>
        <div className="text-xs mt-1">Card</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading game board...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Game Header */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">AI Monsters Battle</h2>
            <p className="text-gray-300">
              Turn {gameState?.turn_number} | Phase: {gameState?.phase} | Player {gameState?.current_turn}'s Turn
            </p>
          </div>
          <button 
            onClick={endTurn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            End Turn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player 1 Board (Top) */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-4">Player 1 (You)</h3>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map(x => (
              <div key={`p1-row-${x}`} className="flex gap-2">
                {[0, 1, 2].map(y => (
                  <div
                    key={`p1-tile-${x}-${y}`}
                    className={getTileClass(x, y)}
                    onClick={() => handleTileClick(x, y)}
                  >
                    {renderCard(gameState?.tiles[x]?.[y] || null, x, y)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-4">Game Info</h3>
          <div className="text-white space-y-2">
            <div>Phase: <span className="font-bold">{gameState?.phase}</span></div>
            <div>Turn: <span className="font-bold">{gameState?.turn_number}</span></div>
            <div>Status: <span className="font-bold">{gameState?.status}</span></div>
          </div>
          
          {selectedTile && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-white font-bold mb-2">Selected Tile</h4>
              <p className="text-gray-300">
                Position: ({selectedTile.x}, {selectedTile.y})
              </p>
              <p className="text-gray-300 text-sm mt-2">
                Click another tile to move or attack
              </p>
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-white font-bold mb-2">Your Hand</h4>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map(cardId => (
                <div
                  key={`card-${cardId}`}
                  className="w-16 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-2 cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all"
                  onClick={() => {
                    // Place card on empty tile
                    for (let x = 0; x < 6; x++) {
                      for (let y = 0; y < 3; y++) {
                        if (!gameState?.tiles[x][y].card_id) {
                          placeCard(cardId, x, y);
                          return;
                        }
                      }
                    }
                  }}
                >
                  <div className="text-white text-xs text-center">
                    <div className="text-lg">🃏</div>
                    <div className="text-xs mt-1">Card</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player 2 Board (Bottom) */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-4">Player 2 (Opponent)</h3>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map(x => (
              <div key={`p2-row-${x}`} className="flex gap-2">
                {[0, 1, 2].map(y => (
                  <div
                    key={`p2-tile-${x}-${y}`}
                    className={getTileClass(x, y)}
                    onClick={() => handleTileClick(x, y)}
                  >
                    {renderCard(gameState?.tiles[x]?.[y] || null, x, y)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase Instructions */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-2">Current Phase: {gameState?.phase}</h3>
        <div className="text-gray-300">
          {gameState?.phase === 'Placement' && (
            <p>Place cards from your hand onto the board. Face-down cards create strategic advantages.</p>
          )}
          {gameState?.phase === 'Action' && (
            <p>Move attack-mode cards or switch between attack/defense modes. Only attack-mode cards can move.</p>
          )}
          {gameState?.phase === 'Combat' && (
            <p>Attack enemy cards. Attack vs attack or attack vs defense. Higher attack wins!</p>
          )}
        </div>
      </div>
    </div>
  );
}