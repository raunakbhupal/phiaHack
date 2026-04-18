import { useState } from "react";
import { useSubmitSearch } from "../store/giftStore";
import { OCCASIONS } from "../types";

export function RecipientForm() {
  const submitSearch = useSubmitSearch();
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("25");
  const [budgetMax, setBudgetMax] = useState("100");
  const [occasion, setOccasion] = useState("birthday");
  const [validationError, setValidationError] = useState<string | null>(null);

  const charCount = description.length;
  const canSubmit = charCount >= 20;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);
    const min = Number(budgetMin) || 0;
    const max = Number(budgetMax) || 0;
    if (min >= max) {
      setValidationError("Max budget must be greater than min budget.");
      return;
    }
    submitSearch(description, min, max, occasion);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8 flex flex-col gap-5">
      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Describe the person you're shopping for
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="e.g. My best friend Jake is turning 30. He's obsessed with specialty coffee and recently got into rock climbing..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-300
            focus:outline-none focus:ring-2 focus:ring-phia-300 focus:border-transparent focus:bg-white
            resize-none transition-all"
        />
        <div className="flex justify-between mt-1.5">
          <span className={`text-xs ${charCount < 20 ? "text-gray-300" : "text-phia-500"}`}>
            {charCount < 20 ? `${20 - charCount} more characters` : "✓ Great detail"}
          </span>
          <span className="text-xs text-gray-300">{charCount}/2000</span>
        </div>
      </div>

      {/* Budget + Occasion */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Min Budget</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">$</span>
            <input
              type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} min={0}
              className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900
                focus:outline-none focus:ring-2 focus:ring-phia-300 focus:border-transparent focus:bg-white transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Max Budget</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">$</span>
            <input
              type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} min={0}
              className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900
                focus:outline-none focus:ring-2 focus:ring-phia-300 focus:border-transparent focus:bg-white transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Occasion</label>
          <select
            value={occasion} onChange={(e) => setOccasion(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-900
              focus:outline-none focus:ring-2 focus:ring-phia-300 focus:border-transparent focus:bg-white transition-all"
          >
            {OCCASIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {validationError && <p className="text-sm text-red-500">{validationError}</p>}

      <button type="submit" disabled={!canSubmit} className="btn-primary w-full text-base py-4">
        Find Perfect Gifts →
      </button>
    </form>
  );
}
