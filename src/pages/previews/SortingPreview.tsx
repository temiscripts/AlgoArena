import { useEffect, useState } from 'react';
import { bubbleSort } from '@/algorithms/sorting/bubble';
import { quickSort } from '@/algorithms/sorting/quick';
import { generateArray } from '@/lib/workloadGen';
import type { SortState } from '@/algorithms/types';

interface RunState {
  states: SortState[];
}

function collect(algo: typeof bubbleSort, input: number[], cap: number): SortState[] {
  const out: SortState[] = [];
  const it = algo.steps(input);
  let next = it.next();
  while (!next.done && out.length < cap) {
    out.push(next.value);
    next = it.next();
  }
  // Ensure we always finish with the final sorted state.
  if (next.value) out.push(next.value);
  return out;
}

export function SortingPreview() {
  const [tick, setTick] = useState(0);
  const [runs, setRuns] = useState<RunState[]>([]);

  useEffect(() => {
    const input = generateArray(18, 'random', 7);
    const quickStates = collect(quickSort, input, 240);
    const bubbleStates = collect(bubbleSort, input, 240);
    setRuns([{ states: quickStates }, { states: bubbleStates }]);
  }, []);

  useEffect(() => {
    if (runs.length === 0) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 80);
    return () => window.clearInterval(id);
  }, [runs]);

  if (runs.length === 0) return <div className="h-full w-full" />;

  // Each run loops on its own length so they restart in sync visually.
  const left = runs[0].states[tick % runs[0].states.length];
  const right = runs[1].states[tick % runs[1].states.length];

  return (
    <div className="flex h-full w-full gap-2">
      <MiniBars state={left} accent="crimson" />
      <MiniBars state={right} accent="teal" />
    </div>
  );
}

function MiniBars({ state, accent }: { state: SortState; accent: 'crimson' | 'teal' }) {
  const max = Math.max(1, ...state.array);
  const barWidth = 100 / Math.max(1, state.array.length);
  const swapSet = new Set(state.highlights.swap ?? []);
  const compareSet = new Set(state.highlights.compare ?? []);
  const pivotSet = new Set(state.highlights.pivot ?? []);

  const baseFill = accent === 'crimson' ? '#c4322b' : '#5fb3a1';
  const compareFill = '#e8e3d3';
  const swapFill = '#d4af37';

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden
    >
      {state.array.map((v, i) => {
        const h = (v / max) * 100;
        const fill = pivotSet.has(i) || swapSet.has(i) ? swapFill : compareSet.has(i) ? compareFill : baseFill;
        return (
          <rect
            key={i}
            x={i * barWidth + barWidth * 0.1}
            y={100 - h}
            width={barWidth * 0.8}
            height={h}
            fill={fill}
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}
