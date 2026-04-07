export function GameBoardLoading() {
  return (
    <div className="flex flex-col h-[800px] w-full max-w-6xl mx-auto rounded-3xl overflow-hidden glass-card relative isolate">
      {/* Background elements */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      {/* Opponent Area */}
      <div className="flex-1 flex flex-col justify-end items-center pb-8 z-10">
        <div className="flex gap-4 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-[140px] h-[210px] rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Center Divider / Info */}
      <div className="h-24 bg-white/5 border-y border-white/10 flex items-center justify-between px-12 z-10 backdrop-blur-md">
        <div className="w-48 h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="flex flex-col items-center gap-2">
          <div className="w-32 h-6 rounded-lg bg-white/10 animate-pulse" />
          <div className="w-24 h-4 rounded-lg bg-white/5 animate-pulse" />
        </div>
        <div className="w-48 h-8 rounded-lg bg-white/5 animate-pulse" />
      </div>

      {/* Player Area */}
      <div className="flex-1 flex flex-col justify-start items-center pt-8 z-10">
        <div className="flex gap-4 mt-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-[140px] h-[210px] rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
