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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-phia-500 to-phia-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            ✦
          </div>
          <span className="font-display text-xl text-gray-900">phia gifts</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
          Powered by Claude AI
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-2xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <p className="text-phia-600 font-semibold text-sm tracking-wide uppercase mb-4">
              AI Gift Discovery
            </p>
            <h1 className="font-display text-5xl sm:text-6xl text-gray-900 leading-[1.08] mb-6">
              Find gifts they'll
              <br />
              <span className="text-phia-600 italic">actually love.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
              Describe the person — not the product. Our AI searches the internet
              and finds gifts matched to their personality, interests, and your budget.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
              <strong>Something went wrong:</strong> {error}
            </div>
          )}

          {/* Form */}
          <RecipientForm />

          {/* Examples */}
          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-300 text-center mb-4">
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
                  className="text-left text-sm text-gray-400 rounded-xl bg-gray-50 hover:bg-phia-50 px-5 py-3 transition-all border border-transparent hover:border-phia-100 hover:text-gray-600 line-clamp-1"
                >
                  <span className="text-phia-400 mr-2">→</span>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: "Multi-store", sub: "Amazon, Etsy, Target & more" },
              { value: "AI-ranked", sub: "Reviews + sentiment + fit" },
              { value: "12 picks", sub: "Diverse across all interests" },
            ].map(({ value, sub }) => (
              <div key={value} className="text-center">
                <div className="font-semibold text-gray-900 text-sm">{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-300">
        Built for Phia Hackathon · AI-Powered Gift Discovery
      </footer>
    </div>
  );
}
