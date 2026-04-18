import { useState } from "react";
import { useGiftDispatch, useGiftState } from "../store/giftStore";
import { RecipientCard } from "../components/RecipientCard";
import { GiftGrid } from "../components/GiftGrid";
import { BudgetSlider } from "../components/BudgetSlider";

export function ResultsPage() {
  const { profile, results, total_candidates } = useGiftState();
  const dispatch = useGiftDispatch();
  const [budgetMax, setBudgetMax] = useState<number>(
    profile ? Math.ceil(profile.budget_max * 1.1) : 200
  );

  const filtered = results.filter((r) => r.product.price <= budgetMax);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-white/60 bg-orange-50/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="btn-ghost"
        >
          ← New Search
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <span className="font-display font-semibold text-gray-900">phia</span>
        </div>
        <span className="text-sm text-gray-500 hidden sm:block">
          {total_candidates} products searched
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-8">
          {/* Left: Profile + Budget filter */}
          <div className="mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-20">
              {profile && <RecipientCard profile={profile} />}
              <div className="mt-4 card px-4 py-4">
                <BudgetSlider
                  initial={budgetMax}
                  max={Math.max(budgetMax, 500)}
                  onChange={setBudgetMax}
                />
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
