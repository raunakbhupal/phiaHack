import { useGiftState } from "../store/giftStore";
import { RecipientForm } from "../components/RecipientForm";

const EXAMPLES = [
  "My best friend Jake just turned 30. He's obsessed with specialty coffee and recently got into rock climbing — very outdoorsy, minimalist taste.",
  "My sister loves Harry Potter and photography. She's 26, creative, always taking photos on weekend trips.",
  "Looking for a gift for my dad who's a football fanatic and Messi admirer. He also loves cooking on weekends.",
];

export function SearchPage() {
  const { error } = useGiftState();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 40%, #fce7f3 100%)" }}>
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gift-500 flex items-center justify-center text-white text-base font-bold shadow">🎁</div>
          <span className="font-display text-xl font-bold text-gray-900">phia</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-sm text-gray-500 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-green-400 inline-block" />
          Powered by Claude AI
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-7xl mx-auto w-full">
        <div className="w-full max-w-2xl">
          {/* Hero text */}
          <div className="text-center mb-10">
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-gray-900 leading-[1.1] mb-5">
              Stop guessing.
              <br />
              <span className="text-gift-500 italic">Start gifting.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
              Describe the person — not the product. Our AI understands who they are and searches the internet for gifts made for <em>them</em>.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <strong>Something went wrong:</strong> {error}
            </div>
          )}

          {/* Main form card */}
          <RecipientForm />

          {/* Example prompts */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-center mb-3">
              Try an example
            </p>
            <div className="flex flex-col gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const textarea = document.querySelector("textarea");
                    if (textarea) {
                      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
                      nativeSetter?.call(textarea, ex);
                      textarea.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                  }}
                  className="text-left text-sm text-gray-500 rounded-lg bg-white/60 hover:bg-white px-4 py-2.5 transition-colors border border-white/80 hover:border-gray-200 hover:text-gray-800 line-clamp-1"
                >
                  <span className="text-gift-500 font-semibold mr-1">→</span>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: "🌍", value: "Any store", label: "Amazon, Etsy & more" },
              { icon: "🎯", value: "Personalised", label: "Not just star ratings" },
              { icon: "⚡", value: "~15 seconds", label: "Live product search" },
            ].map(({ icon, value, label }) => (
              <div key={value} className="text-center rounded-xl bg-white/60 backdrop-blur-sm px-3 py-4 shadow-sm">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="font-bold text-gray-900 text-sm">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        Phia Hackathon — AI-Powered Personalised Gift Discovery
      </footer>
    </div>
  );
}
