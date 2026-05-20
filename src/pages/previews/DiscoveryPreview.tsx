import { useEffect, useState } from 'react';

const POINTS: { x: number; y: number }[] = [
  { x: 0.04, y: 0.95 },
  { x: 0.18, y: 0.88 },
  { x: 0.32, y: 0.78 },
  { x: 0.48, y: 0.62 },
  { x: 0.64, y: 0.42 },
  { x: 0.82, y: 0.16 },
];

// Smooth-ish n·log(n) curve (normalized for the viewBox).
function curveY(x: number) {
  // Map x in [0,1] to a normalized n·log(n) shape.
  const n = x * 5 + 0.5;
  const v = n * Math.log2(n + 1);
  // Max around n=5.5: 5.5 * log2(6.5) ≈ 14.9
  return 1 - v / 16;
}

export function DiscoveryPreview() {
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setReveal((r) => (r + 1) % (POINTS.length + 8));
    }, 320);
    return () => window.clearInterval(id);
  }, []);

  const visiblePoints = POINTS.slice(0, Math.min(reveal, POINTS.length));
  const curveRevealed = reveal >= POINTS.length;

  const path = (() => {
    const segments = 40;
    const cmds: string[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = i / segments;
      const y = curveY(x);
      cmds.push(`${i === 0 ? 'M' : 'L'} ${(x * 100).toFixed(2)} ${(y * 100).toFixed(2)}`);
    }
    return cmds.join(' ');
  })();

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={0} y1={g * 100} x2={100} y2={g * 100} stroke="#3a3a44" strokeOpacity={0.5} strokeDasharray="2 3" />
      ))}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={`v-${g}`} x1={g * 100} y1={0} x2={g * 100} y2={100} stroke="#3a3a44" strokeOpacity={0.5} strokeDasharray="2 3" />
      ))}
      {curveRevealed && (
        <path
          d={path}
          fill="none"
          stroke="#d4af37"
          strokeWidth={1.4}
          strokeOpacity={0.85}
          style={{ filter: 'drop-shadow(0 0 1.5px rgba(212,175,55,0.6))' }}
        />
      )}
      {visiblePoints.map((p, i) => (
        <circle key={i} cx={p.x * 100} cy={p.y * 100} r={1.6} fill="#e8e3d3" />
      ))}
      {curveRevealed && (
        <text
          x={50}
          y={20}
          textAnchor="middle"
          className="font-mono"
          fill="#d4af37"
          fontSize="6.5"
          letterSpacing="1"
        >
          O(n log n) detected
        </text>
      )}
    </svg>
  );
}
