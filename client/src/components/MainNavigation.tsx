'use client';

import { useState } from 'react';
import { EnhancedCardGenerator } from './EnhancedCardGenerator';
import { GameLobby } from './GameLobby';

interface NavigationTab {
  id: string;
  label: string;
  icon: string;
}

export function MainNavigation() {
  const [activeTab, setActiveTab] = useState('generator');

  const tabs: NavigationTab[] = [
    {
      id: 'generator',
      label: 'Card Generator',
      icon: '🎨'
    },
    {
      id: 'lobby', 
      label: 'Game Arena',
      icon: '🏰'
    },
    {
      id: 'collection',
      label: 'My Collection',
      icon: '📚'
    },
    {
      id: 'deck-builder',
      label: 'Deck Builder',
      icon: '🔧'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🎮</div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Monsters</h1>
                <p className="text-gray-300 text-sm">Every card is AI-generated and unique</p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'generator' && <EnhancedCardGenerator />}
        {activeTab === 'lobby' && <GameLobby />}
        {activeTab === 'collection' && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-white mb-2">My Collection</h2>
            <p className="text-gray-300">Your AI-generated card collection will appear here</p>
          </div>
        )}
        {activeTab === 'deck-builder' && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🔧</div>
            <h2 className="text-2xl font-bold text-white mb-2">Deck Builder</h2>
            <p className="text-gray-300">Build your custom decks from your collection</p>
          </div>
        )}
      </main>
    </div>
  );
}