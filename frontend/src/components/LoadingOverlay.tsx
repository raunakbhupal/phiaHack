import type { AppPhase } from "../types";

const STEPS = [
  { phase: "parsing",   icon: "🧠", label: "Understanding recipient",   sub: "Claude is reading their personality" },
  { phase: "searching", icon: "🌍", label: "Searching the internet",    sub: "Finding real products worldwide" },
  { phase: "ranking",   icon: "✨", label: "Ranking by fit",            sub: "Scoring each gift personally" },
];

export function LoadingOverlay({
  phase,
}: {
  phase: Extract<AppPhase, "parsing" | "searching" | "ranking">;
}) {
  const currentIdx = STEPS.findIndex((s) => s.phase === phase);
  const current = STEPS[currentIdx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex flex-col items-center justify-center px-4">
      {/* Animated icon */}
      <div className="relative mb-10 flex items-center justify-center">
        <div className="absolute h-28 w-28 rounded-full bg-gift-200/60 animate-pulse-ring" />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
          <span className="text-4xl">{current.icon}</span>
        </div>
      </div>

      {/* Current step text */}
      <h2 className="font-display text-3xl font-bold text-gray-900 mb-2 text-center">
        {current.label}
      </h2>
      <p className="text-gray-500 text-center mb-10 max-w-xs">{current.sub}</p>

      {/* Step tracker */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={step.phase} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    done
                      ? "bg-green-500 text-white shadow"
                      : active
                      ? "bg-gift-500 text-white shadow-lg scale-110"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {done ? "✓" : idx + 1}
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-gift-600" : done ? "text-green-600" : "text-gray-400"}`}>
                  {step.label.split(" ")[0]}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 mb-4 rounded transition-all duration-700 ${done ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-72 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gift-400 transition-all duration-[1500ms] ease-out"
          style={{ width: `${((currentIdx + 1) / STEPS.length) * 90}%` }}
        />
      </div>

      {/* Dots */}
      <div className="loading-dots flex gap-2 mt-6">
        <span className="h-2 w-2 rounded-full bg-gift-400 block" />
        <span className="h-2 w-2 rounded-full bg-gift-400 block" />
        <span className="h-2 w-2 rounded-full bg-gift-400 block" />
      </div>
    </div>
  );
}
