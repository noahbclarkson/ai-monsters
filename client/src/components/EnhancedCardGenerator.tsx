'use client';

import { useState } from 'react';
import { PackOpening } from '@/components/PackOpening';

export function EnhancedCardGenerator() {
  const [showPack, setShowPack] = useState(false);

  return (
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowPack(true)}
          className="btn btn-primary"
        >
          Open a Pack
        </button>
      </div>

      {showPack && (
        <div className="mb-8">
          <PackOpening 
            onPackComplete={() => setShowPack(false)} 
          />
        </div>
      )}
    </div>
  );
}
