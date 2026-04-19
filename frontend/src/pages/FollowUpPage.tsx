import { useState } from "react";
import { useContinueAfterFollowup, useGiftState } from "../store/giftStore";

export function FollowUpPage() {
  const { followup_questions, description } = useGiftState();
  const continueSearch = useContinueAfterFollowup();
  const [answers, setAnswers] = useState<string[]>(followup_questions.map(() => ""));

  const handleAnswer = (idx: number, val: string) => {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? val : a)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const context = followup_questions
      .map((q, i) => (answers[i].trim() ? `${q} → ${answers[i].trim()}` : ""))
      .filter(Boolean)
      .join(". ");
    continueSearch(context);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-phia-50 text-2xl mb-4">🤔</div>
          <h2 className="font-display text-2xl text-gray-900 mb-2">A couple quick questions</h2>
          <p className="text-sm text-gray-400">Help us find even better gifts — or skip to dive right in.</p>
        </div>

        <div className="card px-5 py-3 mb-6 bg-gray-50">
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest mb-1">Your description</p>
          <p className="text-sm text-gray-500 italic leading-relaxed">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
          {followup_questions.map((q, i) => (
            <div key={i}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{q}</label>
              <input
                type="text" value={answers[i]} onChange={(e) => handleAnswer(i, e.target.value)}
                placeholder="Type your answer..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-300
                  focus:outline-none focus:ring-2 focus:ring-phia-300 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 py-3">Find Gifts →</button>
            <button type="button" onClick={() => continueSearch("")} className="btn-ghost px-6 py-3">Skip</button>
          </div>
        </form>
      </div>
    </div>
  );
}
