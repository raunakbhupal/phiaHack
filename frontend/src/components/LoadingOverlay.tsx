import type { AppPhase } from "../types";

const STEPS = [
  { phase: "parsing",   icon: "🧠", label: "Understanding recipient",   sub: "Analyzing personality & interests" },
  { phase: "searching", icon: "🌍", label: "Searching the internet",    sub: "Scanning stores worldwide" },
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Animated icon */}
      <div className="relative mb-10 flex items-center justify-center">
        <div className="absolute h-28 w-28 rounded-full bg-phia-100 animate-pulse-ring" />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg border border-phia-100">
          <span className="text-4xl">{current.icon}</span>
        </div>
      </div>

      <h2 className="font-display text-3xl text-gray-900 mb-2 text-center">
        {current.label}
      </h2>
      <p className="text-gray-400 text-center mb-12 max-w-xs">{current.sub}</p>

      {/* Step tracker */}
      <div className="flex items-center gap-3 mb-10">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={step.phase} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    done
                      ? "bg-phia-500 text-white"
                      : active
                      ? "bg-phia-600 text-white shadow-lg shadow-phia-200 scale-110"
                      : "bg-gray-100 text-gray-300"
                  }`}
                >
                  {done ? "✓" : idx + 1}
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-phia-600" : done ? "text-phia-500" : "text-gray-300"}`}>
                  {step.label.split(" ")[0]}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 w-10 mb-5 rounded transition-all duration-700 ${done ? "bg-phia-400" : "bg-gray-100"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-phia-400 to-phia-600 transition-all duration-[1500ms] ease-out"
          style={{ width: `${((currentIdx + 1) / STEPS.length) * 90}%` }}
        />
      </div>

      <div className="loading-dots flex gap-2 mt-8">
        <span className="h-1.5 w-1.5 rounded-full bg-phia-400 block" />
        <span className="h-1.5 w-1.5 rounded-full bg-phia-400 block" />
        <span className="h-1.5 w-1.5 rounded-full bg-phia-400 block" />
      </div>
    </div>
  );
}
