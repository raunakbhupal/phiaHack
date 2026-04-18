import { useEffect, useState } from "react";

function scoreColor(score: number): string {
  if (score >= 90) return "#9333ea"; // phia-600
  if (score >= 75) return "#a855f7"; // phia-500
  if (score >= 60) return "#f59e0b"; // amber
  return "#f43f5e";
}

export function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(false);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = animated ? circumference - (score / 100) * circumference : circumference;
  const color = scoreColor(score);

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
      <div className="rounded-full bg-white shadow-md p-0.5">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius - 2} fill="white" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f3f4f6" strokeWidth={4} fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={4} fill="none"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
          <text
            x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
            fill={color} fontSize={size * 0.28} fontWeight="800"
            style={{ transform: "rotate(90deg)", transformOrigin: "center", fontFamily: "Inter, sans-serif" }}
          >
            {score}
          </text>
        </svg>
      </div>
      <span className="text-[8px] font-bold uppercase tracking-wider text-white drop-shadow">Match</span>
    </div>
  );
}
