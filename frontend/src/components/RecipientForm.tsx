import { useState } from "react";
import { useSubmitSearch } from "../store/giftStore";
import { OCCASIONS } from "../types";

export function RecipientForm() {
  const submitSearch = useSubmitSearch();
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState(25);
  const [budgetMax, setBudgetMax] = useState(100);
  const [occasion, setOccasion] = useState("birthday");
  const [validationError, setValidationError] = useState<string | null>(null);

  const charCount = description.length;
  const canSubmit = charCount >= 20;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (budgetMin >= budgetMax) {
      setValidationError("Max budget must be greater than min budget.");
      return;
    }
    submitSearch(description, budgetMin, budgetMax, occasion);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-6 sm:p-8 flex flex-col gap-5"
    >
      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tell us about the person you're shopping for
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="e.g. My best friend Jake is turning 30. He's obsessed with specialty coffee and recently got into rock climbing. Very outdoorsy, minimalist taste, always planning his next camping trip..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-gift-400 focus:border-transparent
            resize-none transition-shadow"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">
            {charCount < 20 ? `${20 - charCount} more characters needed` : "✓ Great detail!"}
          </span>
          <span className="text-xs text-gray-400">{charCount}/2000</span>
        </div>
      </div>

      {/* Budget + Occasion row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Budget */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Budget</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                min={0}
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-gift-400 focus:border-transparent"
                placeholder="Min"
              />
            </div>
            <span className="text-gray-400 text-sm flex-shrink-0">to</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                min={0}
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-gift-400 focus:border-transparent"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {/* Occasion */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Occasion</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900
              focus:outline-none focus:ring-2 focus:ring-gift-400 focus:border-transparent"
          >
            {OCCASIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary w-full text-base py-4"
      >
        Find Perfect Gifts →
      </button>
    </form>
  );
}
