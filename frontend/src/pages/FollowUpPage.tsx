import { useState } from "react";
import { useContinueAfterFollowup, useGiftState } from "../store/giftStore";

export function FollowUpPage() {
  const { followup_questions, description } = useGiftState();
  const continueSearch = useContinueAfterFollowup();
  const [answers, setAnswers] = useState<string[]>(followup_questions.map(() => ""));
  const [currentQ, setCurrentQ] = useState(0);

  const handleNext = () => {
    if (currentQ < followup_questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const context = followup_questions
        .map((q, i) => (answers[i].trim() ? `${q} → ${answers[i].trim()}` : ""))
        .filter(Boolean)
        .join(". ");
      continueSearch(context);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && answers[currentQ].trim()) handleNext();
  };

  const isLast = currentQ === followup_questions.length - 1;
  const canProceed = answers[currentQ].trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="w-20" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-phia-500 to-phia-700 flex items-center justify-center text-white text-[10px] font-bold">✦</div>
          <span className="font-display font-semibold text-gray-900">Phia Gifting</span>
        </div>
        <button onClick={() => continueSearch("")} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Skip →
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Chat card */}
          <div className="card border border-gray-100 overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-phia-600 to-phia-400 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">✦</div>
                <div>
                  <p className="text-white font-semibold text-sm">Phia Gifting Assistant</p>
                  <p className="text-white/70 text-xs">Helping you find the perfect gift</p>
                </div>
              </div>
            </div>

            {/* Chat body */}
            <div className="px-5 py-5 flex flex-col gap-4 bg-gray-50/30">
              {/* User's original message */}
              <div className="flex justify-end">
                <div className="bg-phia-500 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%] text-sm leading-relaxed">
                  {description}
                </div>
              </div>

              {/* Past Q&A pairs */}
              {followup_questions.slice(0, currentQ).map((q, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="flex gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-phia-100 flex items-center justify-center text-phia-600 text-[10px] font-bold flex-shrink-0 mt-0.5">✦</div>
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%] text-sm text-gray-700 shadow-sm border border-gray-100">
                      {q}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-phia-50 text-phia-800 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%] text-sm border border-phia-100">
                      {answers[i]}
                    </div>
                  </div>
                </div>
              ))}

              {/* Current AI question */}
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-full bg-phia-100 flex items-center justify-center text-phia-600 text-[10px] font-bold flex-shrink-0 mt-0.5">✦</div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] shadow-sm border border-gray-100">
                  {currentQ === 0 && (
                    <p className="text-sm text-gray-400 mb-1.5">Just a couple quick questions 💜</p>
                  )}
                  <p className="text-sm font-semibold text-gray-900">{followup_questions[currentQ]}</p>
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white">
              <div className="flex gap-3 items-end">
                <input
                  type="text"
                  value={answers[currentQ]}
                  onChange={(e) => {
                    const a = [...answers];
                    a[currentQ] = e.target.value;
                    setAnswers(a);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  autoFocus
                  className="flex-1 rounded-full border border-gray-200 bg-gray-50/50 px-5 py-2.5 text-sm text-gray-900 placeholder-gray-300
                    focus:outline-none focus:ring-2 focus:ring-phia-300 focus:border-transparent focus:bg-white transition-all"
                />
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="h-10 w-10 rounded-full bg-phia-600 text-white flex items-center justify-center hover:bg-phia-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-sm"
                >
                  {isLast ? "→" : "↵"}
                </button>
              </div>

              {/* Progress */}
              <div className="flex justify-center gap-2 mt-3">
                {followup_questions.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${
                    i < currentQ ? "w-6 bg-phia-500" : i === currentQ ? "w-6 bg-phia-300" : "w-1.5 bg-gray-200"
                  }`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
