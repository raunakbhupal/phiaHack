import { useEffect, useRef, useState } from "react";
import { generateGiftMessage } from "../api/client";
import type { GiftResult, RecipientProfile } from "../types";

export function GiftMessageModal({
  result,
  profile,
  onClose,
}: {
  result: GiftResult;
  profile: RecipientProfile;
  onClose: () => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateGiftMessage({
      product_name: result.product.name,
      explanation: result.explanation,
      profile,
    })
      .then((r) => setMessage(r.message))
      .catch(() => setMessage("Unable to generate message right now. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleCopy() {
    if (!message) return;
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="card w-full max-w-md p-6 animate-fade-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-phia-600 mb-1">
              ✍️ Gift Note
            </p>
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {result.product.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-3 flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* Message */}
        <div className="min-h-[120px] rounded-xl bg-orange-50 border border-orange-100 p-4 mb-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="loading-dots flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-phia-400 block" />
                <span className="h-1.5 w-1.5 rounded-full bg-phia-400 block" />
                <span className="h-1.5 w-1.5 rounded-full bg-phia-400 block" />
              </div>
              <span>Writing your gift note...</span>
            </div>
          ) : (
            <p className="font-display italic text-gray-800 leading-relaxed text-sm">
              "{message}"
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            disabled={loading || !message}
            className="btn-primary flex-1 text-sm py-2.5"
          >
            {copied ? "✓ Copied!" : "📋 Copy Message"}
          </button>
          <button onClick={onClose} className="btn-ghost px-4 py-2.5 text-sm">
            Close
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Personalised for {profile.name_hint ?? "your recipient"} by Claude AI
        </p>
      </div>
    </div>
  );
}
