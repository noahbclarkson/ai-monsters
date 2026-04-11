export function CollectionGalleryLoading() {
  return (
    <main className="min-h-screen bg-atmospheric">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
              <div className="w-48 h-10 bg-white/5 rounded-lg animate-pulse" />
            </div>
            <div className="w-36 h-10 rounded-lg bg-white/5 animate-pulse" />
          </div>
          <div className="w-32 h-5 bg-white/5 rounded-lg animate-pulse" />
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="glass-card rounded-xl p-4 text-center animate-pulse">
              <div className="w-12 h-8 bg-white/5 rounded mx-auto mb-2" />
              <div className="w-16 h-3 bg-white/5 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Search + filter bar skeleton */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-10 bg-white/5 rounded-lg animate-pulse" />
            <div className="w-24 h-10 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse border border-white/10" />
          ))}
        </div>
      </div>
    </main>
  );
}
