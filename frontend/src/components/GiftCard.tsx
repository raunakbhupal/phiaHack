import { useState } from "react";
import type { GiftResult, RecipientProfile } from "../types";
import { ScoreRing } from "./ScoreRing";
import { GiftMessageModal } from "./GiftMessageModal";

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
  "Fandom & Collectibles":  "from-yellow-500 to-orange-600",
  "Photography":            "from-gray-700 to-gray-900",
  "Gifts & More":           "from-gift-400 to-gift-600",
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
  "Fandom & Collectibles":  "🪄",
  "Photography":            "📷",
  "Gifts & More":           "🎁",
};

function formatReviewCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n > 0 ? n.toString() : "—";
}

export function GiftCard({
  result,
  profile,
  rank,
  style,
}: {
  result: GiftResult;
  profile: RecipientProfile;
  rank: number;
  style?: React.CSSProperties;
}) {
  const [showModal, setShowModal] = useState(false);
  const { product, match_score, explanation, tag_overlap, wilson_score } = result;

  const gradient = CATEGORY_GRADIENT[product.category] ?? "from-gift-400 to-gift-600";
  const emoji = CATEGORY_EMOJI[product.category] ?? "🎁";
  const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(product.name)}`;
  const buyUrl = product.affiliate_url && product.affiliate_url !== "#" ? product.affiliate_url : amazonUrl;

  return (
    <>
      <div
        className="card overflow-hidden flex flex-col gift-card-enter hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
        style={style}
      >
        {/* Image header — real image if available, gradient fallback */}
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
              {/* Fallback gradient hidden by default */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} hidden items-center justify-center`}>
                <span className="text-5xl opacity-80">{emoji}</span>
              </div>
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-5xl opacity-80">{emoji}</span>
            </div>
          )}

          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Rank badge */}
          {rank === 1 && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-900 shadow">
                ⭐ Best Match
              </span>
            </div>
          )}

          {/* Score ring — always visible on white background */}
          <div className="absolute top-2 right-3 z-10">
            <ScoreRing score={match_score} size={62} />
          </div>

          {/* Category + confidence at bottom */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between">
            <span className="text-xs font-medium text-white/90 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-0.5">
              {product.category}
            </span>
            {wilson_score > 0.8 && (
              <span className="text-[10px] font-semibold text-white bg-green-500/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                🏅 Trusted
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col p-4 gap-3">
          {/* Name + Price */}
          <div>
            <h3 className="font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2 text-[15px]">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-gift-600">${product.price}</span>
              {product.rating > 0 && (
                <span className="text-xs text-gray-400">
                  ⭐ {product.rating.toFixed(1)} · {formatReviewCount(product.review_count)} reviews
                </span>
              )}
            </div>
          </div>

          {/* Explanation */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {explanation}
          </p>

          {/* Tag overlap pills */}
          {tag_overlap.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tag_overlap.slice(0, 3).map((tag) => (
                <span key={tag} className="pill bg-gift-50 text-gift-700 border border-gift-200 text-[10px]">
                  ✓ {tag.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto flex gap-2 pt-1">
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2.5 flex-1 text-center no-underline"
            >
              🛒 Buy Now
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 rounded-xl border-2 border-gift-200 bg-gift-50 px-3 py-2.5 text-xs font-semibold text-gift-700 hover:bg-gift-100 transition-colors"
              title="Generate gift message"
            >
              ✍️ Note
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <GiftMessageModal
          result={result}
          profile={profile}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
