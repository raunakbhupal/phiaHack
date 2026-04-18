import type {
  FindGiftsResponse,
  FollowUpResponse,
  GiftMessageRequest,
  GiftMessageResponse,
  RecipientInput,
  RecipientProfile,
  RefineRequest,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function checkFollowUp(input: RecipientInput): Promise<FollowUpResponse> {
  return post<FollowUpResponse>("/api/check-followup", input);
}

export function parseRecipient(input: RecipientInput): Promise<RecipientProfile> {
  return post<RecipientProfile>("/api/parse-recipient", input);
}

export function findGifts(input: RefineRequest): Promise<FindGiftsResponse> {
  return post<FindGiftsResponse>("/api/find-gifts", input);
}

export function generateGiftMessage(req: GiftMessageRequest): Promise<GiftMessageResponse> {
  return post<GiftMessageResponse>("/api/gift-message", req);
}
