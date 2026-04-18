import type { RecipientProfile } from "../types";
import { OCCASIONS } from "../types";

const RELATIONSHIP_EMOJI: Record<string, string> = {
  friend: "🤝",
  partner: "💑",
  parent: "👨‍👩‍👧",
  sibling: "👫",
  colleague: "💼",
  child: "🧒",
  other: "🎁",
};

export function RecipientCard({ profile }: { profile: RecipientProfile }) {
  const emoji = RELATIONSHIP_EMOJI[profile.relationship] ?? "🎁";
  const occasionLabel =
    OCCASIONS.find((o) => o.value === profile.occasion)?.label ?? profile.occasion;

  return (
    <div className="card p-5 border-l-4 border-l-gift-400 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gift-100 text-xl">
          {emoji}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gift-600 mb-0.5">
            Gift Recipient
          </p>
          <h3 className="font-semibold text-gray-900">
            {profile.name_hint ?? "Your recipient"}
            {profile.age_range ? `, ${profile.age_range}` : ""}
          </h3>
        </div>
      </div>

      {/* Summary sentence */}
      {profile.summary_sentence && (
        <p className="font-display italic text-gray-700 text-sm leading-relaxed mb-4 border-b border-gray-100 pb-4">
          "{profile.summary_sentence}"
        </p>
      )}

      {/* Interests */}
      {profile.interests.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Interests
          </p>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((tag) => (
              <span key={tag} className="pill bg-gift-100 text-gift-800">
                {tag.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Personality */}
      {profile.personality_traits.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Personality
          </p>
          <div className="flex flex-wrap gap-1.5">
            {profile.personality_traits.map((trait) => (
              <span key={trait} className="pill bg-purple-100 text-purple-700">
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer metadata */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span>{occasionLabel}</span>
        <span>•</span>
        <span>
          ${profile.budget_min}–${profile.budget_max}
        </span>
        <span>•</span>
        <span className="capitalize">{profile.relationship}</span>
      </div>
    </div>
  );
}
