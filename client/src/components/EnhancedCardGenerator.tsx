'use client';

import { useState } from 'react';
import { PackOpening } from '@/components/PackOpening';
import { Sparkles } from 'lucide-react';

export function EnhancedCardGenerator() {
  const [showPack, setShowPack] = useState(false);

  return (
    <div className="w-full">
      {!showPack ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
              Card Generator
            </h2>
            <p className="text-white/50 text-lg max-w-lg mx-auto leading-relaxed">
              Create unique AI-powered cards with real artwork and intelligent descriptions. What kind of monster will you discover today?
            </p>
          </div>
          
          <button
            onClick={() => setShowPack(true)}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-500 hover:to-blue-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative flex items-center gap-3 text-lg">
              <Sparkles size={20} strokeWidth={1.5} />
              Open a Pack
            </span>
          </button>
        </div>
      ) : (
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
              Opening Pack...
            </h3>
            <button
              onClick={() => setShowPack(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              Back to Generator
            </button>
          </div>
          <PackOpening 
            onPackComplete={() => {}} 
          />
        </div>
      )}
    </div>
  );
}
