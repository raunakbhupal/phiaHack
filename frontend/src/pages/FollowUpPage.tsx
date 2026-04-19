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
      // All answered — submit
      const context = followup_questions
        .map((q, i) => (answers[i].trim() ? `${q} → ${answers[i].trim()}` : ""))
        .filter(Boolean)
        .join(". ");
      continueSearch(context);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && answers[currentQ].trim()) {
      handleNext();
    }
  };

  const isLast = currentQ === followup_questions.length - 1;
  const canProceed = answers[currentQ].trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-lg">
        {/* Chat-like header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-phia-500 to-phia-700 flex items-center justify-center text-white text-sm font-bold shadow-md">
            ✦
          </div>
          <div>
            <p className="font-display font-semibold text-gray-900">Phia Gifting</p>
            <p className="text-xs text-green-500 font-medium">● Thinking about your request...</p>
          </div>
        </div>

        {/* User's original message — full text */}
        <div className="flex justify-end mb-6">
          <div className="bg-phia-500 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[85%] text-sm leading-relaxed">
            {description}
          </div>
        </div>

        {/* AI response bubble */}
        <div className="flex gap-3 mb-6">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-phia-500 to-phia-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
            ✦
          </div>
          <div className="bg-gray-50 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
            <p className="text-sm text-gray-700 leading-relaxed mb-1">
              {currentQ === 0
                ? "Love it! Just a couple quick questions so I can find something perfect 💜"
                : "Great, one more thing..."}
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-2">
              {followup_questions[currentQ]}
            </p>
          </div>
        </div>

        {/* Previous Q&A */}
        {currentQ > 0 && (
          <div className="mb-4 flex flex-col gap-3">
            {followup_questions.slice(0, currentQ).map((_q, i) => (
              <div key={i} className="flex justify-end">
                <div className="bg-phia-50 text-phia-800 rounded-2xl rounded-br-md px-4 py-2 max-w-[85%] text-sm">
                  {answers[i]}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Answer input */}
        <div className="flex gap-3 items-end">
          <input
            type="text"
            value={answers[currentQ]}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQ] = e.target.value;
              setAnswers(newAnswers);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            autoFocus
            className="flex-1 rounded-full border border-gray-200 bg-gray-50/50 px-5 py-3 text-sm text-gray-900 placeholder-gray-300
              focus:outline-none focus:ring-2 focus:ring-phia-300 focus:border-transparent focus:bg-white transition-all"
          />
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="h-11 w-11 rounded-full bg-phia-600 text-white flex items-center justify-center hover:bg-phia-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isLast ? "→" : "↵"}
          </button>
        </div>

        {/* Skip option */}
        <div className="text-center mt-4">
          <button
            onClick={() => continueSearch("")}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip questions and find gifts →
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {followup_questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i < currentQ ? "w-6 bg-phia-500" :
                i === currentQ ? "w-6 bg-phia-400" :
                "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
