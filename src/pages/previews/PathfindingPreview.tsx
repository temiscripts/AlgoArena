import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { astar } from '@/algorithms/pathfinding/astar';
import { generateGrid } from '@/lib/mazeGen';
import { type PathState } from '@/algorithms/pathfinding/types';

const ROWS = 7;
const COLS = 14;

interface Computed {
  visited: number[];
  path: number[];
}

function computePath(): Computed {
  const grid = generateGrid(ROWS, COLS, 'sparse-walls', 21);
  const visited: number[] = [];
  let final: PathState | undefined;
  for (const s of astar.steps({ grid })) {
    if (s.current != null && !visited.includes(s.current)) visited.push(s.current);
    final = s;
  }
  return { visited, path: final?.path ?? [] };
}

export function PathfindingPreview() {
  const [computed] = useState<Computed>(() => computePath());
  const [step, setStep] = useState(0);
  const totalSteps = computed.visited.length + 12; // pause at end before loop

  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => (s + 1) % totalSteps), 80);
    return () => window.clearInterval(id);
  }, [totalSteps]);

  const visibleVisited = computed.visited.slice(0, Math.min(step, computed.visited.length));
  const showPath = step >= computed.visited.length - 2;

  const cellW = 100 / COLS;
  const cellH = 100 / ROWS;

  const points = computed.path
    .map((i) => {
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      return `${((c + 0.5) * cellW).toFixed(2)},${((r + 0.5) * cellH).toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden
    >
      <rect x={0} y={0} width={100} height={100} fill="#0a0a0f" />
      {visibleVisited.map((i, k) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        return (
          <rect
            key={k}
            x={c * cellW}
            y={r * cellH}
            width={cellW}
            height={cellH}
            fill="#3d3210"
            opacity={0.85}
          />
        );
      })}
      {/* Start + Goal markers from the generated grid (fixed by seed 21). */}
      <Marker idx={3 * COLS + 1} cellW={cellW} cellH={cellH} color="#5fb3a1" />
      <Marker idx={3 * COLS + (COLS - 2)} cellW={cellW} cellH={cellH} color="#c4322b" />
      {showPath && (
        <motion.polyline
          key={`p-${Math.floor(step / totalSteps)}`}
          points={points}
          fill="none"
          stroke="#d4af37"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.4 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}
    </svg>
  );
}

function Marker({ idx, cellW, cellH, color }: { idx: number; cellW: number; cellH: number; color: string }) {
  const r = Math.floor(idx / COLS);
  const c = idx % COLS;
  return <rect x={c * cellW} y={r * cellH} width={cellW} height={cellH} fill={color} />;
}
