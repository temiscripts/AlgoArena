import { useEffect, useState } from 'react';

const N = 24;
// Step plan: binary-search-style halvings ending on a "found" cell.
// Indices to highlight at each frame: progressively narrower bounds.
const FRAMES: { lo: number; hi: number; current: number; found?: boolean }[] = [
  { lo: 0, hi: N - 1, current: 11 },
  { lo: 12, hi: N - 1, current: 17 },
  { lo: 12, hi: 16, current: 14 },
  { lo: 15, hi: 16, current: 15, found: true },
];

export function SearchingPreview() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setFrame((f) => (f + 1) % (FRAMES.length + 2)), 650);
    return () => window.clearInterval(id);
  }, []);
  const f = FRAMES[Math.min(frame, FRAMES.length - 1)];
  const settled = frame >= FRAMES.length;
  const visited = new Set<number>();
  for (let i = 0; i <= Math.min(frame, FRAMES.length - 1); i++) visited.add(FRAMES[i].current);

  const cellW = 100 / N;

  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
      {/* bounds shading */}
      {!settled && (
        <rect
          x={f.lo * cellW}
          y={0}
          width={(f.hi - f.lo + 1) * cellW}
          height={28}
          fill="#e8e3d3"
          fillOpacity={0.05}
        />
      )}
      {Array.from({ length: N }, (_, i) => {
        const isCurrent = !settled && i === f.current;
        const isFound = settled && i === FRAMES[FRAMES.length - 1].current;
        const isVisited = visited.has(i) && !isCurrent && !isFound;
        const height = 14 + ((i * 19) % 10);
        const y = 28 - height;
        let fill = '#5fb3a1';
        let opacity = 0.6;
        if (isFound) { fill = '#d4af37'; opacity = 1; }
        else if (isCurrent) { fill = '#e8e3d3'; opacity = 1; }
        else if (isVisited) { fill = '#c4322b'; opacity = 0.7; }
        return (
          <rect
            key={i}
            x={i * cellW + cellW * 0.1}
            y={y}
            width={cellW * 0.8}
            height={height}
            fill={fill}
            opacity={opacity}
          />
        );
      })}
      {settled && (
        <text
          x={50}
          y={6}
          textAnchor="middle"
          fontSize="3.2"
          fill="#d4af37"
          letterSpacing="0.8"
          className="font-mono"
        >
          QUARRY CAUGHT
        </text>
      )}
    </svg>
  );
}
