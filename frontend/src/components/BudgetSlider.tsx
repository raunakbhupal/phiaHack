import { useState } from "react";

export function BudgetSlider({
  initial,
  max,
  onChange,
}: {
  initial: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [value, setValue] = useState(initial);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const n = Number(e.target.value);
    setValue(n);
    onChange(n);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Filter by price
        </span>
        <span className="text-sm font-bold text-gift-600">≤ ${value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={5}
        value={value}
        onChange={handleChange}
        className="w-full"
      />
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>$0</span>
        <span>${max}</span>
      </div>
    </div>
  );
}
