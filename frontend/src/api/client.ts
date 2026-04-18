import type {
  FindGiftsResponse,
  GiftMessageRequest,
  GiftMessageResponse,
  RecipientInput,
  RecipientProfile,
} from "../types";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
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

export function parseRecipient(input: RecipientInput): Promise<RecipientProfile> {
  return post<RecipientProfile>("/api/parse-recipient", input);
}

export function findGifts(input: RecipientInput): Promise<FindGiftsResponse> {
  return post<FindGiftsResponse>("/api/find-gifts", input);
}

export function generateGiftMessage(req: GiftMessageRequest): Promise<GiftMessageResponse> {
  return post<GiftMessageResponse>("/api/gift-message", req);
}
