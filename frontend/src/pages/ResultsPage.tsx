import { useMemo, useState } from "react";
import { useGiftDispatch, useGiftState, useRefineSearch } from "../store/giftStore";
import { useWishlist } from "../store/wishlist";
import { RecipientCard } from "../components/RecipientCard";
import { GiftGrid } from "../components/GiftGrid";
import { BudgetSlider } from "../components/BudgetSlider";
import { OCCASIONS } from "../types";

export function ResultsPage({ onShowWishlist }: { onShowWishlist: () => void }) {
  const { profile, results, total_candidates, budget_min, budget_max, occasion } = useGiftState();
  const dispatch = useGiftDispatch();
  const refineSearch = useRefineSearch();
  const { count } = useWishlist();

  // Budget filter max = user's original max budget
  const [filterBudget, setFilterBudget] = useState<number>(budget_max);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Refine panel state
  const [showRefine, setShowRefine] = useState(false);
  const [refineBudgetMin, setRefineBudgetMin] = useState(String(budget_min));
  const [refineBudgetMax, setRefineBudgetMax] = useState(String(budget_max));
  const [refineDetails, setRefineDetails] = useState("");

  const categories = useMemo(() => {
    const cats = new Set(results.map((r) => r.product.category));
    return ["all", ...Array.from(cats).sort()];
  }, [results]);

  const filtered = results.filter((r) => {
    if (r.product.price > filterBudget) return false;
    if (activeCategory !== "all" && r.product.category !== activeCategory) return false;
    return true;
  });

  const handleRefine = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRefine(false);
    refineSearch(Number(refineBudgetMin) || 0, Number(refineBudgetMax) || 0, refineDetails);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <button onClick={() => dispatch({ type: "RESET" })} className="btn-ghost">
          ← New Search
        </button>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-phia-500 to-phia-700 flex items-center justify-center text-white text-[10px] font-bold">✦</div>
          <span className="font-display font-semibold text-gray-900">Phia Gifting</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">
            {total_candidates} products scanned
          </span>
          <button
            onClick={onShowWishlist}
            className="text-sm font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-phia-50 hover:border-phia-200 hover:text-phia-600 transition-colors flex items-center gap-1.5"
          >
            ♥ Wishlist{count > 0 && <span className="bg-phia-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{count}</span>}
          </button>
          <button
            onClick={() => setShowRefine(!showRefine)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${
              showRefine
                ? "bg-phia-500 text-white"
                : "bg-white text-phia-600 border border-phia-200 hover:bg-phia-50"
            }`}
          >
            🔄 Not quite right? Adjust
          </button>
        </div>
      </header>

      {/* Refine panel */}
      {showRefine && (
        <div className="border-b border-gray-100 bg-white px-4 py-5 animate-fade-slide-up">
          <form onSubmit={handleRefine} className="max-w-3xl mx-auto flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-700">
              Tell us what to change — we'll search again with your updates
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Min Budget</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number" min={0} value={refineBudgetMin}
                    onChange={(e) => setRefineBudgetMin(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-phia-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Max Budget</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number" min={0} value={refineBudgetMax}
                    onChange={(e) => setRefineBudgetMax(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-phia-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Occasion</label>
                <select
                  value={occasion} disabled
                  className="w-full mt-1 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                >
                  {OCCASIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Forgot something? Add more details
              </label>
              <input
                type="text"
                value={refineDetails}
                onChange={(e) => setRefineDetails(e.target.value)}
                placeholder="e.g. They also love cooking, or prefer practical gifts over novelty..."
                className="w-full mt-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-phia-400"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary text-sm py-2.5 px-6">
                🔍 Search Again
              </button>
              <button type="button" onClick={() => setShowRefine(false)} className="btn-ghost text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-8">
          {/* Left sidebar */}
          <div className="mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-20 flex flex-col gap-4">
              {profile && <RecipientCard profile={profile} />}
              <div className="card px-4 py-4">
                <BudgetSlider
                  initial={filterBudget}
                  max={budget_max}
                  onChange={setFilterBudget}
                />
              </div>
              {/* Category filter */}
              <div className="card px-4 py-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Filter by category
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${
                        activeCategory === cat
                          ? "bg-phia-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat === "all" ? "All" : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Gift grid */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-gray-900">
                Top Gift Picks
              </h2>
              <span className="text-sm text-gray-500">
                {filtered.length} of {results.length} shown
              </span>
            </div>
            {profile && <GiftGrid results={filtered} profile={profile} />}
          </div>
        </div>
      </main>
    </div>
  );
}
