import { useMemo } from 'react';
import clsx from 'clsx';
import type { SortState } from '@/algorithms/types';

interface Props {
  state: SortState;
  height?: number;
  accent: 'crimson' | 'gold' | 'teal';
}

const ACCENT_BAR: Record<Props['accent'], string> = {
  crimson: 'fill-crimson',
  gold: 'fill-gold',
  teal: 'fill-teal',
};

const ACCENT_GLOW: Record<Props['accent'], string> = {
  crimson: 'drop-shadow(0 0 6px rgba(196,50,43,0.6))',
  gold: 'drop-shadow(0 0 6px rgba(212,175,55,0.6))',
  teal: 'drop-shadow(0 0 6px rgba(95,179,161,0.6))',
};

export function SortCanvas({ state, height = 220, accent }: Props) {
  const { array, highlights } = state;
  const max = useMemo(() => Math.max(1, ...array), [array]);
  const barWidth = 100 / Math.max(1, array.length);

  const compareSet = new Set(highlights.compare ?? []);
  const swapSet = new Set(highlights.swap ?? []);
  const pivotSet = new Set(highlights.pivot ?? []);
  const sortedSet = new Set(highlights['mark-sorted'] ?? []);
  const partitionBounds = highlights['partition-bounds'];

  return (
    <div className="relative w-full" style={{ height, filter: ACCENT_GLOW[accent] }}>
      <svg
        viewBox={`0 0 100 100`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="algorithm visualization"
      >
        {partitionBounds && partitionBounds.length === 2 && (
          <rect
            x={partitionBounds[0] * barWidth}
            y={0}
            width={(partitionBounds[1] - partitionBounds[0] + 1) * barWidth}
            height={100}
            className="fill-parchment/5"
          />
        )}
        {array.map((v, i) => {
          const h = (v / max) * 100;
          const isCompare = compareSet.has(i);
          const isSwap = swapSet.has(i);
          const isPivot = pivotSet.has(i);
          const isSorted = sortedSet.has(i);
          return (
            <rect
              key={i}
              x={i * barWidth + barWidth * 0.08}
              y={100 - h}
              width={barWidth * 0.84}
              height={h}
              className={clsx(
                'transition-[fill,opacity] duration-75',
                isPivot && 'fill-gold',
                !isPivot && isSwap && 'fill-crimson',
                !isPivot && !isSwap && isCompare && 'fill-parchment',
                !isPivot && !isSwap && !isCompare && isSorted && 'fill-teal',
                !isPivot && !isSwap && !isCompare && !isSorted && ACCENT_BAR[accent],
                !isPivot && !isSwap && !isCompare && !isSorted && 'opacity-70',
              )}
            />
          );
        })}
      </svg>
    </div>
  );
}
