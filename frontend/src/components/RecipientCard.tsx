import type { RecipientProfile } from "../types";
import { OCCASIONS } from "../types";

const RELATIONSHIP_EMOJI: Record<string, string> = {
  friend: "🤝", partner: "💑", parent: "👨‍👩‍👧", sibling: "👫",
  colleague: "💼", child: "🧒", other: "🎁",
};

export function RecipientCard({ profile }: { profile: RecipientProfile }) {
  const emoji = RELATIONSHIP_EMOJI[profile.relationship] ?? "🎁";
  const occasionLabel = OCCASIONS.find((o) => o.value === profile.occasion)?.label ?? profile.occasion;

  return (
    <div className="card p-5 border-l-4 border-l-phia-400 animate-fade-slide-up">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-phia-50 text-lg">
          {emoji}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-phia-500 mb-0.5">Recipient</p>
          <h3 className="font-semibold text-gray-900 text-sm">
            {profile.name_hint ?? "Your recipient"}
            {profile.age_range ? `, ${profile.age_range}` : ""}
          </h3>
        </div>
      </div>

      {profile.summary_sentence && (
        <p className="font-display italic text-gray-600 text-sm leading-relaxed mb-4 pb-4 border-b border-gray-50">
          "{profile.summary_sentence}"
        </p>
      )}

      {profile.interests.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest mb-2">Interests</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((tag) => (
              <span key={tag} className="pill bg-phia-50 text-phia-700 text-[11px]">
                {tag.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.personality_traits.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest mb-2">Personality</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.personality_traits.map((trait) => (
              <span key={trait} className="pill bg-gray-50 text-gray-500 text-[11px]">{trait}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-gray-400 pt-3 border-t border-gray-50">
        <span>{occasionLabel}</span>
        <span>·</span>
        <span>${profile.budget_min}–${profile.budget_max}</span>
        <span>·</span>
        <span className="capitalize">{profile.relationship}</span>
      </div>
    </div>
  );
}
