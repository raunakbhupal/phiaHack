import { useEffect, useState } from "react";
import type { GiftResult, PriceOption } from "../types";
import { comparePrices } from "../api/client";
import { useWishlist } from "../store/wishlist";

function formatReviewCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n > 0 ? n.toString() : "—";
}

function buildAmazonUrl(name: string, price: number): string {
  const low = Math.floor(price * 0.8);
  const high = Math.ceil(price * 1.2);
  return `https://www.amazon.com/s?k=${encodeURIComponent(name)}&rh=p_36%3A${low * 100}-${high * 100}`;
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-phia-600 bg-phia-50 border-phia-200";
  if (score >= 75) return "text-phia-500 bg-phia-50 border-phia-200";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-500 bg-red-50 border-red-200";
}

function buildGoogleShoppingUrl(name: string): string {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(name)}`;
}

function CompareInline({ productName, price }: { productName: string; price: number }) {
  const [options, setOptions] = useState<PriceOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    comparePrices(productName, price)
      .then((r) => setOptions(r.options))
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, [productName, price]);

  if (loading) return <p className="text-xs text-gray-400 py-2">Searching stores...</p>;
  if (options.length === 0) {
    return (
      <a href={buildGoogleShoppingUrl(productName)} target="_blank" rel="noopener noreferrer"
        className="text-xs text-phia-600 font-semibold hover:underline">
        Search Google Shopping →
      </a>
    );
  }
  return (
    <div className="flex flex-wrap gap-2 py-1">
      {options.slice(0, 4).map((opt, i) => (
        <a key={i} href={opt.url || "#"} target="_blank" rel="noopener noreferrer"
          className="text-xs rounded-full border border-gray-200 px-3 py-1 hover:bg-phia-50 hover:border-phia-200 transition-colors no-underline text-gray-600">
          <span className="font-bold text-gray-900">${opt.price.toFixed(2)}</span> · {opt.store}
          {i === 0 && <span className="text-green-600 ml-1 font-semibold">Best</span>}
        </a>
      ))}
    </div>
  );
}

export function GiftListItem({ result, rank }: { result: GiftResult; rank: number }) {
  const { product, match_score, explanation, wilson_score } = result;
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const [showWhy, setShowWhy] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const amazonUrl = buildAmazonUrl(product.name, product.price);

  return (
    <div className="card overflow-hidden gift-card-enter hover:shadow-lg transition-all duration-200">
      <div className="flex">
        {/* Image — fixed width */}
        <div className="relative w-32 sm:w-40 flex-shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover min-h-[120px]" />
          ) : (
            <div className="w-full h-full min-h-[120px] bg-gradient-to-br from-phia-400 to-phia-600 flex items-center justify-center">
              <span className="text-3xl opacity-80">🎁</span>
            </div>
          )}
          {rank <= 3 && (
            <div className="absolute top-2 left-2">
              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 shadow ${
                rank === 1 ? "bg-amber-400 text-amber-900" : rank === 2 ? "bg-gray-200 text-gray-700" : "bg-orange-200 text-orange-800"
              }`}>
                #{rank}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-base font-bold text-phia-600">${product.price}</span>
                <span className="text-[11px] text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">{product.category}</span>
                {product.rating > 0 && (
                  <span className="text-[11px] text-gray-400">⭐ {product.rating.toFixed(1)} · {formatReviewCount(product.review_count)}</span>
                )}
                {wilson_score > 0.8 && <span className="text-[10px] text-green-600">🏅 Trusted</span>}
                {product.source && <span className="text-[10px] text-gray-400">via {product.source}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-sm font-bold rounded-full border px-2.5 py-1 ${scoreColor(match_score)}`}>
                {match_score}
              </span>
              <button
                onClick={() => toggle(result)}
                className={`h-7 w-7 rounded-full flex items-center justify-center text-sm transition-all ${
                  wishlisted ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400 hover:text-red-400"
                }`}
              >
                {wishlisted ? "♥" : "♡"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-1">
            <a href={amazonUrl} target="_blank" rel="noopener noreferrer"
              className="rounded-full bg-phia-600 text-white text-xs font-semibold px-4 py-1.5 hover:bg-phia-700 transition-colors no-underline">
              Amazon →
            </a>
            <button onClick={() => setShowCompare(!showCompare)}
              className="rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 px-3 py-1.5 hover:bg-gray-50 transition-colors">
              🔍 Compare Prices
            </button>
            <button onClick={() => setShowWhy(!showWhy)}
              className="rounded-full border border-phia-200 bg-phia-50 text-xs font-semibold text-phia-700 px-3 py-1.5 hover:bg-phia-100 transition-colors">
              💡 Why?
            </button>
          </div>

          {showWhy && (
            <p className="text-xs text-gray-500 leading-relaxed bg-phia-50 rounded-lg px-3 py-2">{explanation}</p>
          )}

          {showCompare && (
            <CompareInline productName={product.name} price={product.price} />
          )}
        </div>
      </div>
    </div>
  );
}
