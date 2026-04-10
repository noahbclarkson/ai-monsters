export function LeaderboardLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-48 h-8 rounded-lg bg-white/5 animate-pulse" />
      </div>

      {/* Rank tiers legend skeleton */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-7 rounded-lg bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Sort controls skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-16 h-6 rounded bg-white/5 animate-pulse" />
        <div className="w-16 h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-12 h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-12 h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="flex-1" />
        <div className="w-24 h-6 rounded bg-white/5 animate-pulse" />
      </div>

      {/* Leaderboard entries skeleton */}
      <div className="space-y-3">
        {/* Top 3 entries (larger) */}
        {[1, 2, 3].map(i => (
          <div key={`top-${i}`} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5" />
              <div className="w-12 h-12 rounded-xl bg-white/5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-32 h-5 rounded bg-white/5" />
                  <div className="w-8 h-5 rounded bg-white/5" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-5 rounded bg-white/5" />
                  <div className="w-20 h-4 rounded bg-white/5" />
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-5 rounded bg-white/5 mb-1" />
                <div className="w-12 h-4 rounded bg-white/5" />
              </div>
            </div>
          </div>
        ))}

        {/* Regular entries */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`row-${i}`} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5" />
              <div className="w-10 h-10 rounded-xl bg-white/5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-28 h-4 rounded bg-white/5" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-4 rounded bg-white/5" />
                  <div className="w-16 h-4 rounded bg-white/5" />
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-4 rounded bg-white/5 mb-1" />
                <div className="w-10 h-4 rounded bg-white/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
