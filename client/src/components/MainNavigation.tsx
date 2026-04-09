'use client';

import { useState } from 'react';
import {
  Sparkles,
  Swords,
  BookOpen,
  Gift,
  CalendarDays,
  Trophy,
  Settings,
  Gamepad2,
} from 'lucide-react';
import { EnhancedCardGenerator } from './EnhancedCardGenerator';
import { GameLobby } from './GameLobby';
import { CollectionGallery } from './CollectionGallery';
import { PackOpening } from './PackOpening';
import Leaderboard from './Leaderboard';
import DailyCardGenerator from './DailyCardGenerator';
import SoundEffects from './SoundEffects';
import MobileResponsiveWrapper from './MobileResponsiveWrapper';
import MobileGameControls from './MobileGameControls';
import MusicPlayer from './MusicPlayer';
import type { ReactNode } from 'react';

interface NavigationTab {
  id: string;
  label: string;
  icon: ReactNode;
}

export function MainNavigation() {
  const [activeTab, setActiveTab] = useState('generator');
  const [showControls, setShowControls] = useState(false);
  const [gameState, setGameState] = useState<{
    currentScreen: 'game' | 'collection' | 'generator' | 'lobby';
    gamePhase?: 'placement' | 'action' | 'combat';
    turn?: 'player1' | 'player2';
  }>({
    currentScreen: 'generator'
  });

  const tabs: NavigationTab[] = [
    { id: 'generator',   label: 'Card Generator',  icon: <Sparkles     size={16} strokeWidth={1.8} /> },
    { id: 'lobby',       label: 'Game Arena',       icon: <Swords       size={16} strokeWidth={1.8} /> },
    { id: 'collection',  label: 'My Collection',    icon: <BookOpen     size={16} strokeWidth={1.8} /> },
    { id: 'packs',       label: 'Pack Opening',      icon: <Gift         size={16} strokeWidth={1.8} /> },
    { id: 'daily',      label: 'Daily Card',        icon: <CalendarDays size={16} strokeWidth={1.8} /> },
    { id: 'leaderboard',label: 'Leaderboard',        icon: <Trophy       size={16} strokeWidth={1.8} /> },
    { id: 'deck-builder',label: 'Deck Builder',     icon: <Settings     size={16} strokeWidth={1.8} /> },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setGameState(prev => ({
      ...prev,
      currentScreen: tabId as 'game' | 'collection' | 'generator' | 'lobby'
    }));
    setShowControls(false);
  };

  const handleMenuToggle = () => {
    setShowControls(!showControls);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Music Player */}
      <MusicPlayer />

      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="text-white">
                <Gamepad2 size={28} strokeWidth={1.5} className="hidden md:block" />
                <Gamepad2 size={22} strokeWidth={1.5} className="md:hidden" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-white">AI Monsters</h1>
                <p className="text-xs md:text-sm text-gray-300">Every card is AI-generated and unique</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm text-white">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <MobileResponsiveWrapper>
          <div className="container mx-auto px-4">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-shrink-0 flex items-center space-x-1 md:space-x-2 px-3 md:px-6 py-2 md:py-3 font-semibold transition-all relative ${
                    activeTab === tab.id
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-current">{tab.icon}</span>
                  <span className="text-xs md:text-sm">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </MobileResponsiveWrapper>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
        {/* Sound Effects Provider */}
        <SoundEffects />

        <MobileResponsiveWrapper>
          <div className="grid gap-4">
            {activeTab === 'generator'    && <div className="w-full"><EnhancedCardGenerator /></div>}
            {activeTab === 'lobby'         && <div className="w-full"><GameLobby /></div>}
            {activeTab === 'collection'    && <div className="w-full"><CollectionGallery /></div>}
            {activeTab === 'packs'         && <div className="w-full"><PackOpening /></div>}
            {activeTab === 'daily'         && <div className="w-full"><DailyCardGenerator /></div>}
            {activeTab === 'leaderboard'   && <div className="w-full"><Leaderboard /></div>}
            {activeTab === 'deck-builder'  && (
              <div className="bg-gray-800/60 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
                <div className="flex justify-center mb-4 text-gray-400">
                  <Settings size={48} strokeWidth={1.2} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Deck Builder</h2>
                <p className="text-sm text-gray-300">Build custom decks from your card collection</p>
                <p className="text-xs text-gray-500 mt-3">Coming in a future update</p>
              </div>
            )}
          </div>
        </MobileResponsiveWrapper>

        {/* Mobile Game Controls */}
        <MobileGameControls
          onMenuToggle={handleMenuToggle}
          currentScreen={gameState.currentScreen}
          gamePhase={gameState.gamePhase}
          turn={gameState.turn}
        />
      </main>
    </div>
  );
}
