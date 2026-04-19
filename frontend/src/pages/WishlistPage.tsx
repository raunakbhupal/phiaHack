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
        <div className="w-20" />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Wishlist header card */}
        <div className="card p-6 mb-8 border-l-4 border-l-phia-400">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">💜</span>
                <h1 className="font-display text-2xl text-gray-900">My Wishlist</h1>
              </div>
              <p className="text-sm text-gray-400 ml-10">
                {count === 0
                  ? "You haven't saved any gifts yet."
                  : `${count} saved gift${count !== 1 ? "s" : ""} — come back anytime to buy.`}
              </p>
            </div>
            {count > 0 && (
              <button
                onClick={clear}
                className="rounded-full border-2 border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
              >
                🗑 Clear All
              </button>
            )}
          </div>
        </div>

        {count === 0 ? (
          <div className="card p-16 text-center">
            <span className="text-6xl block mb-5">🎁</span>
            <h2 className="font-display text-xl text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 text-sm mb-6">Tap the ♥ on any gift to save it here for later.</p>
            <button onClick={onBack} className="btn-primary text-sm px-6 py-2.5">
              ← Find Gifts
            </button>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  );
}
