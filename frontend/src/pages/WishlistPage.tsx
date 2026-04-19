import { useWishlist } from "../store/wishlist";
import type { RecipientProfile } from "../types";
import { GiftCard } from "../components/GiftCard";

export function WishlistPage({ onBack }: { onBack: () => void }) {
  const { items, clear, count } = useWishlist();

  const dummyProfile: RecipientProfile = {
    name_hint: null, age_range: null, gender_hint: null, relationship: "friend",
    interests: [], personality_traits: [], occasion: "general",
    budget_min: 0, budget_max: 999, summary_sentence: "",
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="btn-ghost">← Back</button>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-phia-500 to-phia-700 flex items-center justify-center text-white text-[10px] font-bold">✦</div>
          <span className="font-display font-semibold text-gray-900">Phia Gifting</span>
        </div>
        {count > 0 && (
          <button onClick={clear} className="text-xs text-red-400 hover:text-red-600 font-medium">
            Clear all
          </button>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {count === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">💜</span>
            <h2 className="font-display text-2xl text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 text-sm">Tap the heart on any gift to save it here for later.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">{count} saved gift{count !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {items.map((result, i) => (
                <GiftCard
                  key={result.product.id}
                  result={result}
                  profile={dummyProfile}
                  rank={i + 1}
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
