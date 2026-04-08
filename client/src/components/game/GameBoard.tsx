'use client';

import { useState, useMemo } from 'react';
import { GameCard } from './GameCard';
import { GameBoardLoading } from './GameBoardLoading';
import { useGame } from '@/lib/useGame';
import { useSpacetimeDB } from '@/lib/spacetimedb';
import { Swords, Shield, HelpCircle } from 'lucide-react';

interface GameBoardProps {
  gameId: number;
}

interface TileData {
  card_id?: bigint;
  is_face_up?: boolean;
  is_attack_mode?: boolean;
  owner?: bigint;
}

export function GameBoard({ gameId }: GameBoardProps) {
  const {
    match,
    boardState,
    handCards,
    loading,
    error,
    placeCard,
    attackCard,
    flipCard,
    switchCardMode,
    moveCard,
    endTurn,
  } = useGame(BigInt(gameId));

  const { playerId } = useSpacetimeDB();
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);

  const status = match?.status ?? 'Active';
  const currentTurn = match ? Number(match.currentTurn) : 1;
  const isMyTurn = Number(playerId) === currentTurn;

  // Board layout: 6 rows x 3 columns
  // Player 1 zone: rows 0-2 (bottom of board visually)
  // Player 2 zone: rows 3-5 (top of board visually)
  const ROWS = 6;
  const COLS = 3;

  const getTile = (x: number, y: number): TileData | null => {
    if (!boardState?.tiles) return null;
    // tiles is indexed as tiles[x][y]
    if (x < 0 || x >= boardState.tiles.length) return null;
    const row = boardState.tiles[x];
    if (!row || y < 0 || y >= row.length) return null;
    const tile = row[y];
    if (!tile || Object.keys(tile).length === 0) return null;
    return {
      card_id: tile.card_id ? BigInt(tile.card_id) : undefined,
      is_face_up: tile.is_face_up,
      is_attack_mode: tile.is_attack_mode,
      owner: tile.owner_player_id ? BigInt(tile.owner_player_id) : undefined,
    };
  };

  const isValidPlacement = (x: number, y: number): boolean => {
    // Player 1 places in rows 0-2
    // Player 2 places in rows 3-5
    if (currentTurn === 1) return x < 3;
    return x >= 3;
  };

  const isValidTarget = (x: number, y: number): boolean => {
    if (!selectedTile) return false;
    const targetTile = getTile(x, y);
    const sourceTile = getTile(selectedTile.x, selectedTile.y);
    
    if (!sourceTile?.card_id) return false;
    
    // Can't target own cards
    if (targetTile?.owner === playerId) return false;
    
    // Target empty tile for move, occupied for attack
    const hasTarget = targetTile?.card_id !== undefined && targetTile?.card_id !== null;
    return true; // valid if we got here
  };

  const handleTileClick = (x: number, y: number) => {
    if (!match || status !== 'Active' || !isMyTurn) return;

    const tile = getTile(x, y);

    if (selectedTile) {
      if (selectedTile.x === x && selectedTile.y === y) {
        // Click same tile - deselect or flip
        if (tile?.card_id && !tile.is_face_up && tile.owner === playerId) {
          flipCard(x, y).catch(console.error);
        }
        setSelectedTile(null);
      } else {
        // Attempt action
        handleAction(selectedTile.x, selectedTile.y, x, y);
        setSelectedTile(null);
      }
    } else {
      // Select tile with a card
      if (tile?.card_id && tile.owner === playerId) {
        setSelectedTile({ x, y });
      }
    }
  };

  const handleAction = async (fromX: number, fromY: number, toX: number, toY: number) => {
    const sourceTile = getTile(fromX, fromY);
    const targetTile = getTile(toX, toY);

    if (!sourceTile?.card_id) return;

    setAnimatingCard(`${fromX}-${fromY}`);

    if (targetTile?.card_id) {
      // Attack
      await attackCard(fromX, fromY, toX, toY).catch(console.error);
    } else if (isValidPlacement(toX, toY)) {
      // Move
      await moveCard(fromX, fromY, toX, toY).catch(console.error);
    }

    setAnimatingCard(null);
  };

  const handleEndTurn = () => {
    endTurn().catch(console.error);
  };

  const getTileClasses = (x: number, y: number): string => {
    const tile = getTile(x, y);
    const isSelected = selectedTile?.x === x && selectedTile?.y === y;
    const isValidTgt = isValidTarget(x, y);
    const isPlayerZone = x < 3;
    const isEnemyZone = x >= 3;

    let classes = 'relative rounded-lg transition-all duration-150';
    
    if (isSelected) {
      classes += ' ring-2 ring-purple-400 ring-opacity-80';
    }
    
    if (isValidTgt && selectedTile) {
      classes += tile?.card_id 
        ? ' ring-2 ring-red-500 ring-opacity-80' 
        : ' ring-2 ring-green-500 ring-opacity-60';
    }

    return classes;
  };

  const getTileBg = (x: number): string => {
    if (x < 3) {
      // Player zone - subtle green tint
      return 'rgba(16, 185, 129, 0.04)';
    }
    // Enemy zone - subtle red tint
    return 'rgba(239, 68, 68, 0.04)';
  };

  const renderTileContent = (x: number, y: number) => {
    const tile = getTile(x, y);
    
    if (!tile?.card_id) {
      // Empty tile
      return (
        <div className="w-full h-full flex items-center justify-center opacity-20">
          <span className="text-2xl text-white/30">+</span>
        </div>
      );
    }

    // Card on tile - simplified inline card for board
    return (
      <GameCard
        name="Card"
        description=""
        attack={0}
        defense={0}
        range={0}
        rarity="Common"
        type="Unit"
        isFlipped={!tile.is_face_up}
        isSelected={selectedTile?.x === x && selectedTile?.y === y}
        isAttacking={tile.is_attack_mode}
        size="sm"
        showBack={true}
      />
    );
  };

  if (loading) {
    return <GameBoardLoading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-6 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Game Header */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
              AI Monsters Battle
            </h2>
            <p className="text-sm text-white/60">
              Turn {boardState?.turn_number ?? 1} | {boardState?.phase ?? 'Placement'} Phase
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Turn indicator */}
            <div className={`px-4 py-2 rounded-lg ${isMyTurn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              <span className="font-semibold">{isMyTurn ? 'Your Turn' : 'Opponent Turn'}</span>
            </div>
            
            {/* End Turn button */}
            <button
              onClick={handleEndTurn}
              disabled={!isMyTurn || status !== 'Active'}
              className="btn btn-primary disabled:opacity-40"
            >
              End Turn
            </button>
          </div>
        </div>

        {/* Status message */}
        {selectedTile && (
          <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-sm text-purple-300">
              Card selected at ({selectedTile.x}, {selectedTile.y}). Click another tile to move or attack.
            </p>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="relative">
        {/* Ambient glow effects */}
        <div className="glow-orb glow-orb-purple w-64 h-64 -top-20 -left-20 opacity-30" />
        <div className="glow-orb glow-orb-blue w-48 h-48 -bottom-10 -right-10 opacity-20" />
        
        {/* Board container */}
        <div className="relative bg-stone-texture rounded-2xl p-4 border border-white/5">
          {/* Board grid */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: ROWS }, (_, x) => (
              <div key={`row-${x}`} className="contents">
                {Array.from({ length: COLS }, (_, y) => {
                  const tile = getTile(x, y);
                  return (
                    <div
                      key={`tile-${x}-${y}`}
                      className={getTileClasses(x, y)}
                      style={{ 
                        background: getTileBg(x),
                        minHeight: '100px',
                      }}
                      onClick={() => handleTileClick(x, y)}
                    >
                      {/* Zone labels */}
                      {y === 1 && x === 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-green-400/60 uppercase tracking-wider">
                          Your Zone
                        </div>
                      )}
                      {y === 1 && x === 3 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-red-400/60 uppercase tracking-wider">
                          Enemy Zone
                        </div>
                      )}
                      
                      {/* Tile content */}
                      <div className="w-full h-full p-1">
                        {renderTileContent(x, y)}
                      </div>
                      
                      {/* Coordinates (debug) */}
                      <div className="absolute bottom-1 right-1 text-[10px] text-white/20">
                        {x},{y}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* Zone divider */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      {/* Hand area */}
      <div className="mt-6 glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
            Your Hand
          </h3>
          <span className="text-sm text-white/40">Click a card to select, then click a tile to place</span>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {handCards && handCards.filter((c: any) => Number(c.playerId) === Number(playerId)).length > 0 ? (
            handCards.filter((c: any) => Number(c.playerId) === Number(playerId)).map((card: any, index: number) => (
              <div
                key={`hand-${card.id}-${index}`}
                className="flex-shrink-0 w-24 h-36 bg-gradient-to-br from-purple-600/50 to-blue-600/50 rounded-lg p-2 cursor-pointer hover:from-purple-500/80 hover:to-blue-500/80 hover:-translate-y-2 transition-all border border-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-purple-500/20 flex flex-col items-center justify-center"
                onClick={() => {
                  // Auto-place on first empty tile
                  for (let x = 0; x < 3; x++) {
                    for (let y = 0; y < 3; y++) {
                      if (!getTile(x, y)?.card_id) {
                        placeCard(BigInt(card.id), BigInt(playerId!), x, y).catch(console.error);
                        return;
                      }
                    }
                  }
                }}
              >
                    <div className="flex items-center justify-center mb-2"><HelpCircle size={28} className="text-white/40" strokeWidth={1.5} /></div>
                <div className="text-xs font-bold text-white/90">Card</div>
              </div>
            ))
          ) : (
            <div className="flex-shrink-0 w-24 h-36 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
              <span className="text-white/30 text-xs">No cards</span>
            </div>
          )}
        </div>
      </div>

      {/* Phase instructions */}
      <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/5">
        <h4 className="text-sm font-semibold text-white/80 mb-2">How to Play</h4>
        <div className="text-xs text-white/50 space-y-1">
          {boardState?.phase === 'Placement' && (
            <p>Place cards from your hand onto your zone. Click a card in hand, then click an empty tile in your zone (rows 0-2).</p>
          )}
          {boardState?.phase === 'Action' && (
            <p>Move cards or attack enemies. Click your card to select it, then click an empty tile to move or an enemy card to attack.</p>
          )}
          {boardState?.phase === 'Combat' && (
            <p>Combat phase. Cards attack automatically based on their attack/defense stats.</p>
          )}
        </div>
      </div>
    </div>
  );
}
