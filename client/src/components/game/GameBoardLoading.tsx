export function GameBoardLoading() {
  const COLS = 3;
  const ROWS = 6;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Game Header skeleton */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-48 h-7 bg-white/5 rounded-lg animate-pulse" />
            <div className="w-36 h-4 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-10 bg-white/5 rounded-lg animate-pulse" />
            <div className="w-28 h-10 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Board skeleton */}
      <div className="relative">
        <div className="absolute inset-0 bg-stone-texture rounded-2xl p-4 border border-white/5">
          {/* Zone labels */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-2">
            <div className="w-20 h-5 bg-white/5 rounded-full animate-pulse" />
            <div className="w-20 h-5 bg-white/5 rounded-full animate-pulse" />
          </div>

          {/* 6x3 grid of tiles */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: ROWS }, (_, x) => (
              <div key={`row-${x}`} className="contents">
                {Array.from({ length: COLS }, (_, y) => {
                  const isPlayerZone = x < 3;
                  return (
                    <div
                      key={`tile-${x}-${y}`}
                      className="rounded-lg animate-pulse"
                      style={{
                        minHeight: '100px',
                        background: isPlayerZone
                          ? 'rgba(16, 185, 129, 0.04)'
                          : 'rgba(239, 68, 68, 0.04)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {/* Empty tile indicator */}
                      <div className="w-full h-full flex items-center justify-center p-1">
                        <div
                          className="w-8 h-8 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.03)' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hand area skeleton */}
      <div className="mt-6 glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="w-28 h-6 bg-white/5 rounded animate-pulse" />
          <div className="w-64 h-4 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 w-28 h-44 bg-white/5 rounded-xl border border-white/10" />
          ))}
        </div>
      </div>

      {/* Phase instructions skeleton */}
      <div className="mt-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-white/10 animate-pulse" />
          <div className="w-32 h-4 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="w-80 h-3 bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  );
}
