'use client';

import { useState, useEffect } from 'react';
import { MapPin, Swords, LayoutGrid, Zap, Gamepad2 } from 'lucide-react';
import { useIsMobile } from './MobileResponsiveWrapper';

interface MobileGameControlsProps {
  onMenuToggle?: () => void;
  onBack?: () => void;
  currentScreen: 'game' | 'collection' | 'generator' | 'lobby';
  gamePhase?: 'placement' | 'action' | 'combat';
  turn?: 'player1' | 'player2';
}

const MobileGameControls = ({ 
  onMenuToggle, 
  onBack, 
  currentScreen, 
  gamePhase, 
  turn = 'player1' 
}: MobileGameControlsProps) => {
  const isMobile = useIsMobile();
  const [showControls, setShowControls] = useState(false);

  if (!isMobile) {
    return null;
  }

  const getPhaseColor = () => {
    switch (gamePhase) {
      case 'placement': return 'bg-blue-500';
      case 'action': return 'bg-green-500';
      case 'combat': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseText = () => {
    switch (gamePhase) {
      case 'placement': return 'Placement';
      case 'action': return 'Action';
      case 'combat': return 'Combat';
      default: return 'Game';
    }
  };

  const getTurnText = () => {
    return turn === 'player1' ? 'Your Turn' : "Opponent's Turn";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-white/20">
      {/* Bottom Bar */}
      <div className="flex items-center justify-between p-3">
        <button
          onClick={onBack}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <span className="text-xl">←</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Phase</div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getPhaseColor()}`}>
              {getPhaseText()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Turn</div>
            <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-purple-600">
              {getTurnText()}
            </div>
          </div>
        </div>

        <button
          onClick={onMenuToggle}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <span className="text-xl">☰</span>
        </button>
      </div>

      {/* Quick Actions */}
      {showControls && (
        <div className="border-t border-white/20 p-3">
          <div className="grid grid-cols-3 gap-2">
            {currentScreen === 'game' && (
              <>
                <button className="p-3 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  Draw Card
                </button>
                <button className="p-3 bg-green-600 text-white rounded-lg text-sm font-medium">
                  End Turn
                </button>
                <button className="p-3 bg-purple-600 text-white rounded-lg text-sm font-medium">
                  Pass
                </button>
              </>
            )}
            
            {currentScreen === 'collection' && (
              <>
                <button className="p-3 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  Filter
                </button>
                <button className="p-3 bg-green-600 text-white rounded-lg text-sm font-medium">
                  Sort
                </button>
                <button className="p-3 bg-purple-600 text-white rounded-lg text-sm font-medium">
                  Deck Builder
                </button>
              </>
            )}

            {currentScreen === 'generator' && (
              <>
                <button className="p-3 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  Generate
                </button>
                <button className="p-3 bg-green-600 text-white rounded-lg text-sm font-medium">
                  Pack
                </button>
                <button className="p-3 bg-purple-600 text-white rounded-lg text-sm font-medium">
                  Daily
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileGameControls;