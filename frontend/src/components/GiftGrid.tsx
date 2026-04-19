import type { GiftResult, RecipientProfile } from "../types";
import { GiftCard } from "./GiftCard";

export function GiftGrid({
  results,
  profile,
  layout = "grid",
}: {
  results: GiftResult[];
  profile: RecipientProfile;
  layout?: "grid" | "list";
}) {
  if (results.length === 0) {
    return (
      <div className="card p-10 text-center">
        <span className="text-5xl block mb-4">🎁</span>
        <p className="text-gray-700 font-semibold text-lg">No gifts match this filter.</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting the budget or category above.</p>
      </div>
    );
  }

  return (
    <div className={
      layout === "list"
        ? "flex flex-col gap-5"
        : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
    }>
      {results.map((result, i) => (
        <GiftCard
          key={result.product.id}
          result={result}
          profile={profile}
          rank={i + 1}
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}
