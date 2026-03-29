'use client';

import { useState, useEffect, useRef } from 'react';
import { EnhancedCard } from './EnhancedCard';

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

interface DraggedCard {
  id: number;
  fromPosition: { x: number; y: number } | null;
  type: 'hand' | 'board';
}

export function GameBoard({ gameId }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [handCards, setHandCards] = useState<any[]>([]);
  const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
  
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGameState();
    generateHandCards();
  }, [gameId]);

  const fetchGameState = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  };

  const generateHandCards = () => {
    const mockCards = [
      { id: 1, name: 'Dragon', description: 'A powerful fire dragon with legendary attack power', attack: 35, defense: 30, range: 4, rarity: 'Legendary', type: 'Unit', imageUrl: null },
      { id: 2, name: 'Castle', description: 'A mighty fortress providing defense', attack: 15, defense: 45, range: 1, rarity: 'Rare', type: 'Building', imageUrl: null },
      { id: 3, name: 'Lightning Bolt', description: 'A powerful spell that strikes enemies', attack: 25, defense: 0, range: 5, rarity: 'Epic', type: 'Spell', imageUrl: null },
      { id: 4, name: 'Warrior', description: 'A brave fighter ready for battle', attack: 20, defense: 20, range: 2, rarity: 'Rare', type: 'Unit', imageUrl: null },
      { id: 5, name: 'Healing Potion', description: 'Restores health and boosts defense', attack: 0, defense: 30, range: 3, rarity: 'Common', type: 'Spell', imageUrl: null }
    ];
    setHandCards(mockCards);
  };

  const handleCardDragStart = (cardId: number, type: 'hand' | 'board', fromPosition?: { x: number; y: number }) => {
    setDraggedCard({ id: cardId, fromPosition: fromPosition || null, type });
    setIsAnimating(true);
    
    // Visual feedback
    showMessage('Card selected', 'info');
  };

  const handleCardDragEnd = () => {
    setDraggedCard(null);
    setHoveredTile(null);
    setIsAnimating(false);
  };

  const handleTileClick = (x: number, y: number) => {
    if (!gameState || gameState.status !== 'Active') return;

    const tile = gameState.tiles[x][y];
    
    if (selectedTile) {
      // Try to move or attack
      if (selectedTile.x === x && selectedTile.y === y) {
        // Deselect
        setSelectedTile(null);
        showMessage('Deselected tile', 'info');
      } else {
        // Try to move/attack
        handleAction(selectedTile.x, selectedTile.y, x, y);
        setSelectedTile(null);
      }
    } else {
      // Select tile
      if (tile?.card_id && tile.owner_player_id === 1) {
        setSelectedTile({ x, y });
        showMessage('Card selected for action', 'info');
      }
    }
  };

  const handleTileHover = (x: number, y: number) => {
    setHoveredTile({ x, y });
    
    if (draggedCard && draggedCard.type === 'hand') {
      // Show placement preview
      const tile = gameState?.tiles[x][y];
      if (!tile?.card_id) {
        showMessage('Place card here', 'info');
      }
    }
  };

  const handleTileDrop = (x: number, y: number) => {
    if (!draggedCard || !gameState) return;

    setIsAnimating(true);

    if (draggedCard.type === 'hand') {
      // Place card from hand
      placeCard(draggedCard.id, x, y);
    } else if (draggedCard.type === 'board' && draggedCard.fromPosition) {
      // Move card on board
      moveCard(draggedCard.fromPosition.x, draggedCard.fromPosition.y, x, y);
    }

    setTimeout(() => {
      setIsAnimating(false);
      setDraggedCard(null);
      setHoveredTile(null);
    }, 300);
  };

  const handleCardClick = (x: number, y: number) => {
    if (!gameState || gameState.status !== 'Active') return;

    const tile = gameState.tiles[x][y];
    
    if (selectedTile) {
      // Try to move or attack
      if (selectedTile.x === x && selectedTile.y === y) {
        // Deselect
        setSelectedTile(null);
        showMessage('Deselected tile', 'info');
      } else {
        // Try to move/attack
        handleAction(selectedTile.x, selectedTile.y, x, y);
        setSelectedTile(null);
      }
    } else {
      // Select tile
      if (tile?.card_id && tile.owner_player_id === 1) {
        setSelectedTile({ x, y });
        showMessage('Card selected for action', 'info');
      }
    }
  };

  const handleAction = (fromX: number, fromY: number, toX: number, toY: number) => {
    const fromTile = gameState?.tiles[fromX][fromY];
    const toTile = gameState?.tiles[toX][toY];
    
    if (!fromTile || !gameState) return;

    if (gameState.phase === 'Combat') {
      // Combat action
      if (toTile?.card_id) {
        attackCard(fromX, fromY, toX, toY);
      }
    } else if (gameState.phase === 'Action') {
      // Movement or mode switch
      if (fromTile.is_attack_mode && !toTile?.card_id) {
        moveCard(fromX, fromY, toX, toY);
      } else if (toTile && fromTile.card_id === toTile.card_id) {
        switchCardMode(fromX, fromY);
      }
    }
  };

  const placeCard = (cardId: number, x: number, y: number) => {
    if (!gameState) return;

    const newTiles = [...gameState.tiles];
    newTiles[x][y] = {
      card_id: cardId,
      is_face_up: true, // Start face-up for visibility
      is_attack_mode: true, // Default to attack mode
      owner_player_id: 1
    };

    setGameState({
      ...gameState,
      tiles: newTiles
    });

    // Remove card from hand
    setHandCards(prev => prev.filter(card => card.id !== cardId));
    
    showMessage('Card placed on board', 'success');
  };

  const moveCard = (fromX: number, fromY: number, toX: number, toY: number) => {
    if (!gameState) return;

    const newTiles = [...gameState.tiles];
    const cardData = newTiles[fromX][fromY];
    
    // Move card to new position
    newTiles[toX][toY] = {
      ...cardData!,
      card_id: cardData!.card_id
    };
    
    // Clear old position
    newTiles[fromX][fromY] = {
      is_face_up: false,
      is_attack_mode: false
    };

    setGameState({
      ...gameState,
      tiles: newTiles
    });

    showMessage('Card moved', 'success');
  };

  const attackCard = (fromX: number, fromY: number, toX: number, toY: number) => {
    const fromTile = gameState?.tiles[fromX][fromY];
    const toTile = gameState?.tiles[toX][toY];
    
    if (!fromTile || !toTile || !gameState) return;

    // Simple combat resolution
    const attackPower = fromTile.is_attack_mode ? 25 : 15; // Assuming 25 attack power
    const defensePower = toTile.is_attack_mode ? 20 : 35; // Assuming defense power
    
    if (attackPower > defensePower) {
      // Attacker wins
      const newTiles = [...gameState.tiles];
      newTiles[toX][toY] = {
        ...newTiles[toX][toY],
        is_face_up: false
      };
      
      setGameState({
        ...gameState,
        tiles: newTiles
      });
      
      showMessage('Attack successful!', 'success');
    } else {
      showMessage('Attack blocked!', 'info');
    }
  };

  const switchCardMode = (x: number, y: number) => {
    if (!gameState) return;

    const newTiles = [...gameState.tiles];
    newTiles[x][y] = {
      ...newTiles[x][y],
      is_attack_mode: !newTiles[x][y].is_attack_mode
    };

    setGameState({
      ...gameState,
      tiles: newTiles
    });

    const newMode = newTiles[x][y].is_attack_mode ? 'Attack' : 'Defense';
    showMessage(`Card switched to ${newMode} mode`, 'success');
  };

  const endTurn = () => {
    if (!gameState) return;

    const nextTurn = gameState.current_turn === 1 ? 2 : 1;
    const nextPhase = gameState.phase === 'Combat' ? 'Placement' : 
                     gameState.phase === 'Action' ? 'Combat' : 'Action';

    setGameState({
      ...gameState,
      current_turn: nextTurn,
      turn_number: gameState.turn_number + 1,
      phase: nextPhase as any
    });

    setMessage(`Turn ended. Player ${nextTurn}'s turn - ${nextPhase} phase`);
    setMessageType('info');
  };

  const showMessage = (text: string, type: 'info' | 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const getTileClass = (x: number, y: number) => {
    const tile = gameState?.tiles[x][y];
    const isSelected = selectedTile?.x === x && selectedTile?.y === y;
    const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
    const canDrop = draggedCard && !tile?.card_id;
    
    let classes = 'w-24 h-32 border-2 border-gray-700 rounded-lg flex items-center justify-center cursor-pointer ';
    
    if (isSelected) {
      classes += 'ring-4 ring-yellow-400 ring-opacity-50 bg-yellow-100 ';
    } else if (isHovered && canDrop) {
      classes += 'ring-4 ring-green-400 ring-opacity-50 bg-green-100 ';
    } else if (isHovered) {
      classes += 'ring-4 ring-blue-400 ring-opacity-50 ';
    }
    
    if (tile?.is_face_up) {
      classes += 'bg-white ';
    } else {
      classes += 'bg-gradient-to-br from-gray-800 to-gray-900 ';
    }
    
    if (draggedCard) {
      classes += 'transform scale-95 ';
    }
    
    return classes;
  };

  const renderCardOnBoard = (tile: BoardTile | null, x: number, y: number) => {
    if (!tile || !tile.is_face_up) {
      return (
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">{x},{y}</div>
          <div className="text-2xl">🂠</div>
        </div>
      );
    }

    const handCard = handCards.find(card => card.id === tile.card_id) || {
      name: 'Unknown',
      description: 'Card not found',
      attack: 0, defense: 0, range: 0,
      rarity: 'Common', type: 'Unit'
    };

    return (
      <div 
        className={`w-20 h-28 ${tile.is_attack_mode ? 'bg-red-100' : 'bg-blue-100'} p-1 rounded flex flex-col items-center justify-center`}
        onClick={() => handleCardClick(x, y)}
      >
        <div className="text-xs font-bold">
          {tile.is_attack_mode ? '⚔️' : '🛡️'}
        </div>
        <div className="text-xs mt-1 text-center px-1">{handCard.name}</div>
      </div>
    );
  };

  const getMessageClass = () => {
    const base = 'fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ';
    switch (messageType) {
      case 'success': return base + 'bg-green-500 text-white';
      case 'error': return base + 'bg-red-500 text-white';
      default: return base + 'bg-blue-500 text-white';
    }
  };

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading game board...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4" ref={boardRef}>
      {/* Message Toast */}
      {message && (
        <div className={getMessageClass()}>
          {message}
        </div>
      )}

      {/* Game Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">AI Monsters Battle Arena</h2>
            <p className="text-gray-300">
              Turn {gameState.turn_number} | Phase: {gameState.phase} | Player {gameState.current_turn}'s Turn
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-400">Cards in Hand</div>
              <div className="text-2xl font-bold">{handCards.length}</div>
            </div>
            <button 
              onClick={endTurn}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              End Turn
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Player 1 Board (Top) */}
        <div className="xl:col-span-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Player 1 (You) - {gameState.phase} Phase</h3>
            <div className="text-sm text-gray-400">
              {selectedTile && `Selected: (${selectedTile.x}, ${selectedTile.y})`}
            </div>
          </div>
          
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map(x => (
              <div key={`p1-row-${x}`} className="flex gap-2">
                {[0, 1, 2].map(y => (
                  <div
                    key={`p1-tile-${x}-${y}`}
                    className={getTileClass(x, y)}
                    onClick={() => handleTileClick(x, y)}
                    onMouseEnter={() => handleTileHover(x, y)}
                    onMouseLeave={() => hoveredTile && hoveredTile.x === x && hoveredTile.y === y && setHoveredTile(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedCard) handleTileHover(x, y);
                    }}
                    onDrop={() => handleTileDrop(x, y)}
                    draggable
                  >
                    {renderCardOnBoard(gameState.tiles[x]?.[y] || null, x, y)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Game Info & Hand */}
        <div className="space-y-4">
          {/* Game Phase Info */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">Game Info</h3>
            <div className="text-white space-y-3">
              <div className="flex justify-between">
                <span>Phase:</span>
                <span className="font-bold">{gameState.phase}</span>
              </div>
              <div className="flex justify-between">
                <span>Turn:</span>
                <span className="font-bold">{gameState.turn_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold">{gameState.status}</span>
              </div>
            </div>

            {selectedTile && (
              <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                <h4 className="text-white font-bold mb-2">Selected Tile</h4>
                <p className="text-gray-300">
                  Position: ({selectedTile.x}, {selectedTile.y})
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  Click another tile to move or attack
                </p>
              </div>
            )}

            {/* Phase Instructions */}
            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-600/30">
              <h4 className="text-blue-300 font-bold mb-1">How to Play</h4>
              <p className="text-blue-200 text-xs">
                {gameState.phase === 'Placement' && "Drag cards from your hand to place them on the board."}
                {gameState.phase === 'Action' && "Move attack-mode cards or switch between attack/defense modes."}
                {gameState.phase === 'Combat' && "Attack enemy cards. Higher attack wins!"}
              </p>
            </div>
          </div>

          {/* Your Hand */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">Your Hand</h3>
            <div className="space-y-2">
              {handCards.map((card) => (
                <div
                  key={`hand-card-${card.id}`}
                  draggable
                  onDragStart={() => handleCardDragStart(card.id, 'hand')}
                  onDragEnd={handleCardDragEnd}
                  className="cursor-grab active:cursor-grabbing transform hover:scale-105 transition-transform"
                >
                  <div className="text-xs text-white/70 mb-1">{card.name}</div>
                  <div className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded p-2 flex items-center justify-between text-white">
                    <div className="text-xs">{card.rarity}</div>
                    <div className="text-lg">{card.type === 'Unit' ? '⚔️' : card.type === 'Building' ? '🏰' : '✨'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      {isAnimating && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}