export interface RecipientInput {
  description: string;
  budget_min: number;
  budget_max: number;
  occasion: string;
  gender: string;
}

export interface RecipientProfile {
  name_hint: string | null;
  age_range: string | null;
  gender_hint: string | null;
  relationship: string;
  interests: string[];
  personality_traits: string[];
  occasion: string;
  budget_min: number;
  budget_max: number;
  summary_sentence: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  tags: string[];
  price: number;
  rating: number;
  review_count: number;
  occasions: string[];
  image_url: string;
  description: string;
  affiliate_url: string;
  source: string;
}

export interface GiftResult {
  product: Product;
  relevance_score: number;
  wilson_score: number;
  match_score: number;
  explanation: string;
  tag_overlap: string[];
  why_this_store: string | null;
}

export interface FindGiftsResponse {
  profile: RecipientProfile;
  results: GiftResult[];
  total_candidates: number;
}

export interface FollowUpResponse {
  needs_followup: boolean;
  questions: string[];
}

export interface RefineRequest {
  description: string;
  budget_min: number;
  budget_max: number;
  occasion: string;
  additional_context: string;
  gender: string;
}

export type AppPhase = "idle" | "followup" | "parsing" | "searching" | "ranking" | "done" | "error";

export interface GiftMessageRequest {
  product_name: string;
  explanation: string;
  profile: RecipientProfile;
}

export interface GiftMessageResponse {
  message: string;
}

export interface PriceOption {
  store: string;
  price: number;
  rating: number;
  review_count: number;
  url: string;
  thumbnail: string;
}

export interface CompareResponse {
  product_name: string;
  options: PriceOption[];
}

export const OCCASIONS = [
  { value: "birthday", label: "🎂 Birthday" },
  { value: "anniversary", label: "💝 Anniversary" },
  { value: "holiday", label: "🎄 Holiday / Christmas" },
  { value: "graduation", label: "🎓 Graduation" },
  { value: "general", label: "🌟 Just Because" },
];
