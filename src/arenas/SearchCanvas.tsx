import { useMemo } from 'react';
import clsx from 'clsx';
import type { SearchState } from '@/algorithms/searching/types';

interface Props {
  array: number[];
  target: number;
  state: SearchState;
  accent: 'crimson' | 'gold' | 'teal';
  height?: number;
}

const BAR: Record<Props['accent'], string> = {
  crimson: 'fill-crimson',
  gold: 'fill-gold',
  teal: 'fill-teal',
};

export function SearchCanvas({ array, target, state, accent, height = 180 }: Props) {
  const max = useMemo(() => Math.max(1, ...array), [array]);
  const barWidth = 100 / Math.max(1, array.length);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.25em] text-parchment/50">
        <span>Sorted array · n = {array.length}</span>
        <span>
          Seeking <span className="text-gold">{target}</span>
          {state.found && state.foundIndex != null && (
            <>
              {' · '}
              <span className="text-gold">found @ {state.foundIndex}</span>
            </>
          )}
          {state.done && !state.found && (
            <>
              {' · '}
              <span className="text-crimson">not found</span>
            </>
          )}
        </span>
      </div>
      <div style={{ height }} className="relative w-full">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="search visualization"
        >
          {state.lo != null && state.hi != null && state.lo <= state.hi && !state.done && (
            <rect
              x={state.lo * barWidth}
              y={0}
              width={(state.hi - state.lo + 1) * barWidth}
              height={100}
              className="fill-parchment/5"
            />
          )}
          {array.map((v, i) => {
            const h = Math.max(2, (v / max) * 100);
            const isCurrent = state.current === i;
            const isFound = state.found && state.foundIndex === i;
            const isVisited = state.visited[i] === 1;
            return (
              <rect
                key={i}
                x={i * barWidth + barWidth * 0.05}
                y={100 - h}
                width={barWidth * 0.9}
                height={h}
                className={clsx(
                  'transition-[fill,opacity] duration-75',
                  isFound && 'fill-gold',
                  !isFound && isCurrent && 'fill-parchment',
                  !isFound && !isCurrent && isVisited && 'fill-crimson opacity-70',
                  !isFound && !isCurrent && !isVisited && BAR[accent],
                  !isFound && !isCurrent && !isVisited && 'opacity-60',
                )}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
