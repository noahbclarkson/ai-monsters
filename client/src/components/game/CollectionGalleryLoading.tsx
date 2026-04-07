export function CollectionGalleryLoading() {
  return (
    <main className="min-h-screen bg-atmospheric">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="w-64 h-10 bg-white/5 rounded-lg animate-pulse mb-2" />
          <div className="w-96 h-6 bg-white/5 rounded-lg animate-pulse" />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="w-24 h-6 bg-white/5 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
                <div className="space-y-2">
                  <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                  <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                  <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="h-12 bg-white/5 rounded-xl border border-white/10 animate-pulse" />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse border border-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
