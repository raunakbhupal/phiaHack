import { useState } from "react";
import type { GiftResult, RecipientProfile } from "../types";
import { ScoreRing } from "./ScoreRing";

const CATEGORY_GRADIENT: Record<string, string> = {
  "Outdoors & Adventure":   "from-emerald-400 to-teal-600",
  "Kitchen & Food":         "from-amber-400 to-orange-500",
  "Tech & Gadgets":         "from-slate-600 to-gray-800",
  "Wellness & Self-care":   "from-pink-400 to-rose-500",
  "Arts & Creativity":      "from-violet-400 to-purple-600",
  "Books & Learning":       "from-cyan-500 to-sky-700",
  "Home & Decor":           "from-lime-400 to-green-600",
  "Sports & Fitness":       "from-red-400 to-orange-600",
  "Games & Entertainment":  "from-fuchsia-400 to-pink-600",
  "Fashion & Accessories":  "from-yellow-400 to-amber-500",
  "Football & Soccer":      "from-green-500 to-emerald-700",
  "Cricket & Sports":       "from-blue-500 to-indigo-700",
  "Fandom & Collectibles":  "from-yellow-500 to-orange-600",
  "Photography":            "from-gray-700 to-gray-900",
  "Gifts & More":           "from-phia-400 to-phia-600",
};

const CATEGORY_EMOJI: Record<string, string> = {
  "Outdoors & Adventure":   "🏔️",
  "Kitchen & Food":         "☕",
  "Tech & Gadgets":         "💻",
  "Wellness & Self-care":   "🧘",
  "Arts & Creativity":      "🎨",
  "Books & Learning":       "📚",
  "Home & Decor":           "🌿",
  "Sports & Fitness":       "🏃",
  "Games & Entertainment":  "🎲",
  "Fashion & Accessories":  "👜",
  "Football & Soccer":      "⚽",
  "Cricket & Sports":       "🏏",
  "Fandom & Collectibles":  "🪄",
  "Photography":            "📷",
  "Gifts & More":           "🎁",
};

function formatReviewCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n > 0 ? n.toString() : "—";
}

/** Build a tight Amazon search URL with price range filter */
function buildAmazonUrl(name: string, price: number): string {
  const low = Math.floor(price * 0.8);
  const high = Math.ceil(price * 1.2);
  // rh=p_36 is Amazon's price range filter in cents
  return `https://www.amazon.com/s?k=${encodeURIComponent(name)}&rh=p_36%3A${low * 100}-${high * 100}`;
}

function buildGoogleShoppingUrl(name: string): string {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(name)}`;
}

function WhyModal({
  result,
  onClose,
}: {
  result: GiftResult;
  onClose: () => void;
}) {
  const { product, match_score, explanation, tag_overlap, why_this_store, wilson_score } = result;
  const amazonUrl = buildAmazonUrl(product.name, product.price);
  const compareUrl = result.product.affiliate_url || buildGoogleShoppingUrl(product.name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-md p-0 overflow-hidden animate-fade-slide-up">
        {/* Header with score */}
        <div className="bg-gradient-to-r from-phia-600 to-phia-400 px-5 py-4 flex items-start justify-between">
          <div className="flex-1 mr-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
              Why this gift?
            </p>
            <h3 className="font-semibold text-white leading-snug line-clamp-2 text-[15px]">
              {product.name}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <ScoreRing score={match_score} size={52} />
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none -mt-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-3">
          {/* AI explanation */}
          <div className="rounded-xl bg-orange-50 border border-orange-100 p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-2">
            {product.rating > 0 && (
              <span className="pill bg-amber-50 text-amber-700 border border-amber-200">
                ⭐ {product.rating.toFixed(1)} · {formatReviewCount(product.review_count)} reviews
              </span>
            )}
            {wilson_score > 0.8 && (
              <span className="pill bg-green-50 text-green-700 border border-green-200">
                🏅 High confidence reviews
              </span>
            )}
            {product.source && (
              <span className="pill bg-blue-50 text-blue-700 border border-blue-200">
                🏪 {product.source}
              </span>
            )}
          </div>

          {why_this_store && (
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
              🏪 {why_this_store}
            </p>
          )}

          {/* Matched interests */}
          {tag_overlap.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Matched interests
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tag_overlap.map((tag) => (
                  <span key={tag} className="pill bg-phia-50 text-phia-700 border border-phia-200 text-[11px]">
                    ✓ {tag.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Buy actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2.5 flex-1 text-center no-underline"
            >
              🛒 Buy on Amazon
            </a>
            <a
              href={compareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors no-underline text-center flex items-center"
            >
              🔍 Compare
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GiftCard({
  result,
  rank,
  style,
}: {
  result: GiftResult;
  profile: RecipientProfile;
  rank: number;
  style?: React.CSSProperties;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const { product, match_score, wilson_score } = result;

  const gradient = CATEGORY_GRADIENT[product.category] ?? "from-phia-400 to-phia-600";
  const emoji = CATEGORY_EMOJI[product.category] ?? "🎁";
  const amazonUrl = buildAmazonUrl(product.name, product.price);
  const compareUrl = product.affiliate_url || buildGoogleShoppingUrl(product.name);

  return (
    <>
      <div
        className="card overflow-hidden flex flex-col gift-card-enter hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
        style={style}
      >
        {/* Image header */}
        <div className="relative h-44 overflow-hidden">
          {product.image_url ? (
            <>
              <img
                src={product.image_url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} hidden items-center justify-center`}>
                <span className="text-5xl opacity-80">{emoji}</span>
              </div>
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-5xl opacity-80">{emoji}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {rank <= 3 && (
            <div className="absolute top-3 left-3 z-10">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow ${
                rank === 1 ? "bg-amber-400 text-amber-900" :
                rank === 2 ? "bg-gray-200 text-gray-700" :
                "bg-orange-200 text-orange-800"
              }`}>
                {rank === 1 ? "⭐ Best Match" : rank === 2 ? "🥈 #2 Pick" : "🥉 #3 Pick"}
              </span>
            </div>
          )}

          <div className="absolute top-2 right-3 z-10">
            <ScoreRing score={match_score} size={62} />
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between">
            <span className="text-xs font-medium text-white/90 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-0.5">
              {product.category}
            </span>
            <div className="flex gap-1.5">
              {wilson_score > 0.8 && (
                <span className="text-[10px] font-semibold text-white bg-green-500/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                  🏅 Trusted
                </span>
              )}
              {product.source && (
                <span className="text-[10px] font-medium text-white bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                  {product.source}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2 text-[15px]">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-phia-600">${product.price}</span>
              {product.rating > 0 && (
                <span className="text-xs text-gray-400">
                  ⭐ {product.rating.toFixed(1)} · {formatReviewCount(product.review_count)} reviews
                </span>
              )}
            </div>
          </div>

          {/* Actions — always at bottom */}
          <div className="mt-auto flex flex-col gap-2">
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2.5 w-full text-center no-underline"
            >
              🛒  Buy on Amazon
            </a>
            <div className="flex gap-2">
              <a
                href={compareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-full border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors no-underline text-center"
              >
                🔍 Compare Prices
              </a>
              <button
                onClick={() => setShowWhy(true)}
                className="flex-1 rounded-full border border-phia-200 bg-phia-50 py-2 text-xs font-semibold text-phia-700 hover:bg-phia-100 transition-colors"
              >
                💡 Why This Gift?
              </button>
            </div>
          </div>
        </div>
      </div>

      {showWhy && <WhyModal result={result} onClose={() => setShowWhy(false)} />}
    </>
  );
}
