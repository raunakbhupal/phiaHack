import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  label,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-900
            focus:outline-none focus:ring-2 focus:ring-phia-300 focus:border-transparent focus:bg-white transition-all text-left"
        >
          <span>{selected?.label ?? "Select..."}</span>
          <span className={`text-gray-400 text-xs transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden animate-fade-slide-up">
            <div className="max-h-56 overflow-y-auto py-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    opt.value === value
                      ? "bg-phia-50 text-phia-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
