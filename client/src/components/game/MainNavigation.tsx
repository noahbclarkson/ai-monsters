'use client';

import { useState } from 'react';
import {
  Sparkles,
  Swords,
  BookOpen,
  Gift,
  CalendarDays,
  Trophy,
} from 'lucide-react';
import { GameGenerator } from '@/components/game/GameGenerator';
import { GameLobby } from '@/components/game/GameLobby';
import { CollectionGallery } from '@/components/game/CollectionGallery';
import { Leaderboard } from '@/components/game/Leaderboard';
import { PackOpening } from '@/components/PackOpening';
import DailyCardGenerator from '@/components/DailyCardGenerator';

interface NavigationTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: NavigationTab[] = [
  { id: 'generator',   label: 'Card Gen',    icon: <Sparkles     size={16} strokeWidth={1.8} /> },
  { id: 'lobby',       label: 'Battle',      icon: <Swords       size={16} strokeWidth={1.8} /> },
  { id: 'collection',  label: 'Collection',  icon: <BookOpen     size={16} strokeWidth={1.8} /> },
  { id: 'packs',       label: 'Packs',       icon: <Gift         size={16} strokeWidth={1.8} /> },
  { id: 'daily',       label: 'Daily',      icon: <CalendarDays size={16} strokeWidth={1.8} /> },
  { id: 'leaderboard', label: 'Ranks',       icon: <Trophy       size={16} strokeWidth={1.8} /> },
];

export function MainNavigation() {
  const [activeTab, setActiveTab] = useState('lobby');

  return (
    <div className="min-h-screen bg-atmospheric flex flex-col">
      {/* Ambient glow effects */}
      <div className="glow-orb glow-orb-purple w-96 h-96 -top-48 -right-48 opacity-20 fixed pointer-events-none" />
      <div className="glow-orb glow-orb-blue w-64 h-64 top-1/2 -left-32 opacity-15 fixed pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}
              >
                <span className="text-white font-bold text-lg">AM</span>
              </div>
              <div>
                <h1 
                  className="text-xl font-bold text-white leading-none"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  AI Monsters
                </h1>
                <p className="text-xs text-white/40">Card Battle Arena</p>
              </div>
            </div>
            
            {/* Connection status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-white/60">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex-1">
        <div className="container mx-auto px-4 py-6">
          {activeTab === 'generator' && (
            <div className="max-w-5xl mx-auto">
              <GameGenerator />
            </div>
          )}
          
          {activeTab === 'lobby' && <GameLobby />}
          {activeTab === 'collection' && <CollectionGallery />}
          {activeTab === 'packs' && <PackOpening />}
          {activeTab === 'daily' && (
            <div className="max-w-md mx-auto">
              <div className="glass-card rounded-2xl p-6">
                <DailyCardGenerator />
              </div>
            </div>
          )}
          {activeTab === 'leaderboard' && <Leaderboard />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-white/30">
            AI Monsters Arena — Every card is AI-generated and unique
          </p>
        </div>
      </footer>
    </div>
  );
}
