'use client';

import { useState, useMemo } from 'react';
import { GameCard } from './GameCard';
import { useCards } from '@/lib/useCards';
import { GameBoardLoading } from './GameBoardLoading';
import { useGame } from '@/lib/useGame';
import { useSpacetimeDB } from '@/lib/spacetimedb';


interface GameBoardProps {
  gameId: number;
  isSpectating?: boolean;
}

interface TileData {
  card_id?: bigint;
  is_face_up?: boolean;
  is_attack_mode?: boolean;
  owner?: bigint;
}

export function GameBoard({ gameId, isSpectating = false }: GameBoardProps) {
  const { cards: allCards } = useCards();
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
  const spectating = isSpectating ?? false;
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);

  const status = match?.status ?? 'Active';
  const currentTurn = match ? Number(match.currentTurn) : 1;
  const isMyTurn = spectating ? false : Number(playerId) === currentTurn;

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
      // Empty tile — subtle center indicator
      return (
        <div className="w-full h-full flex items-center justify-center group transition-all duration-300">
          <div className="w-8 h-8 rounded-lg border border-white/[0.05] bg-white/[0.02] flex items-center justify-center transition-all duration-300 group-hover:border-white/[0.15] group-hover:bg-white/[0.05] group-hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.1)_inset]">
            <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-opacity duration-300 opacity-40 group-hover:opacity-100">
              <path d="M5 1v8M1 5h8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      );
    }

    // Card on tile
    const dbCard = allCards.find(c => c.id === tile.card_id);
    return (
      <GameCard
        name={dbCard?.name || "Card"}
        description={dbCard?.description || ""}
        attack={dbCard?.attack || 0}
        defense={dbCard?.defense || 0}
        range={dbCard?.range || 0}
        rarity={dbCard?.rarity || "Common"}
        type={dbCard?.cardType || "Unit"}
        isFlipped={!tile.is_face_up}
        isSelected={selectedTile?.x === x && selectedTile?.y === y}
        isAttacking={tile.is_attack_mode}
        size="sm"
        showBack={true}
        imageUrl={dbCard?.imageUrl}
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
              <span className="font-semibold">{spectating ? 'Spectating' : isMyTurn ? 'Your Turn' : 'Opponent Turn'}</span>
            </div>

            {/* End Turn button — hidden when spectating */}
            {!spectating && (
              <button
                onClick={handleEndTurn}
                disabled={!isMyTurn || status !== 'Active'}
                className="btn btn-primary disabled:opacity-40"
              >
                End Turn
              </button>
            )}
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
                      {/* Tile content */}
                      <div className="w-full h-full p-1">
                        {renderTileContent(x, y)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* Zone divider */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
              <span className="text-xs text-green-400/60 font-medium tracking-wider uppercase">Your Zone</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
              <span className="text-xs text-red-400/60 font-medium tracking-wider uppercase">Enemy Zone</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Vertical zone labels on the sides */}
          <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-around pointer-events-none">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-green-500/40 to-green-500/10" />
              <span className="text-[10px] text-green-400/50 font-semibold uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Your Zone</span>
            </div>
          </div>
          <div className="absolute right-2 top-4 bottom-4 flex flex-col justify-around pointer-events-none">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-red-500/40 to-red-500/10" />
              <span className="text-[10px] text-red-400/50 font-semibold uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>Enemy Zone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hand area — hidden when spectating */}
      {!spectating && (
      <div className="mt-6 glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
            Your Hand
          </h3>
          <span className="text-sm text-white/40">
            {!isMyTurn ? (
              <span className="text-amber-400/70">Waiting for opponent to finish...</span>
            ) : boardState?.phase === 'Placement' ? (
              "Click a card to auto-place it on your zone"
            ) : boardState?.phase === 'Action' ? (
              "Select a card on the board, then click target"
            ) : (
              "Combat in progress..."
            )}
          </span>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {(() => {
            const myHandCards = handCards
              ? handCards.filter((c: any) => Number(c.playerId) === Number(playerId))
              : [];
            if (myHandCards.length === 0) {
              return (
                <div className="flex-shrink-0 w-24 h-36 rounded-lg border border-white/[0.06] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 1v12M1 7h12" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="text-white/25 text-[10px] font-medium">Empty</span>
                  </div>
                </div>
              );
            }
            return myHandCards.map((handEntry: any, index: number) => {
              const dbCard = allCards.find(c => c.id === handEntry.id);
              if (!dbCard) return null;
              return (
                <div
                  key={`hand-${handEntry.id}-${index}`}
                  className={`flex-shrink-0 ${!isMyTurn ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => {
                    if (!isMyTurn || !playerId) return;
                    // Auto-place on first empty tile in player zone
                    for (let x = 0; x < 3; x++) {
                      for (let y = 0; y < 3; y++) {
                        if (!getTile(x, y)?.card_id) {
                          placeCard(BigInt(handEntry.id), BigInt(playerId), x, y).catch(console.error);
                          return;
                        }
                      }
                    }
                  }}
                >
                  <GameCard
                    name={dbCard.name}
                    description={dbCard.description}
                    attack={dbCard.attack}
                    defense={dbCard.defense}
                    range={dbCard.range}
                    rarity={dbCard.rarity}
                    type={dbCard.cardType}
                    imageUrl={dbCard.imageUrl}
                    size="sm"
                  />
                </div>
              );
            });
          })()}
        </div>
      </div>
      )}

      {/* Phase instructions — hidden when spectating */}
      {!spectating && (
      <div className={`mt-4 p-4 rounded-lg border ${
        boardState?.phase === 'Placement' ? 'bg-green-500/5 border-green-500/20' :
        boardState?.phase === 'Action' ? 'bg-blue-500/5 border-blue-500/20' :
        'bg-purple-500/5 border-purple-500/20'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${
            boardState?.phase === 'Placement' ? 'bg-green-400 animate-pulse' :
            boardState?.phase === 'Action' ? 'bg-blue-400 animate-pulse' :
            'bg-purple-400 animate-pulse'
          }`} />
          <h4 className="text-sm font-semibold text-white/80">
            {boardState?.phase === 'Placement' ? 'Placement Phase' :
             boardState?.phase === 'Action' ? 'Action Phase' :
             'Combat Phase'}
          </h4>
        </div>
        <div className="text-xs text-white/50 space-y-1">
          {boardState?.phase === 'Placement' && (
            <p>Place cards from your hand onto your zone. Click a card in hand to auto-place it on the first empty tile in your zone (rows 0-2).</p>
          )}
          {boardState?.phase === 'Action' && (
            <p>Move cards to new positions or attack enemy cards. Click your card to select it, then click an empty tile to move or an enemy card to attack.</p>
          )}
          {boardState?.phase === 'Combat' && (
            <p>Combat phase in progress. Cards are resolving attacks automatically based on their attack and defense stats.</p>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
