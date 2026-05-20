import { motion } from 'framer-motion';
import type { Grid } from '@/algorithms/pathfinding/types';

interface Props {
  grid: Grid;
  path: number[];
}

export function PathTracerOverlay({ grid, path }: Props) {
  if (path.length < 2) return null;

  const points = path
    .map((i) => {
      const r = Math.floor(i / grid.cols);
      const c = i % grid.cols;
      const x = ((c + 0.5) / grid.cols) * 100;
      const y = ((r + 0.5) / grid.rows) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <motion.polyline
        points={points}
        fill="none"
        stroke="#d4af37"
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 1px rgba(212,175,55,0.9))' }}
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
    </svg>
  );
}
