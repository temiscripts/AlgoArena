import { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { useStepper } from '@/lib/stepper';
import { makeInitialState, type PathAlgorithm, type PathInput, type PathState } from '@/algorithms/pathfinding/types';
import { GridCanvas } from './GridCanvas';
import { BeastBadge } from '@/components/BeastBadge';

interface Props {
  algo: PathAlgorithm;
  input: PathInput;
  speed: number;
  runId: number;
  paused: boolean;
  cellPx?: number;
  onFinish?(elapsedMs: number, stepCount: number, expansions: number, pathLength: number, pathFound: boolean): void;
}

export function PathFighter({ algo, input, speed, runId, paused, cellPx = 14, onFinish }: Props) {
  const initialState = useMemo<PathState>(() => makeInitialState(input.grid), [input.grid]);
  const factory = useMemo(() => () => algo.steps(input), [algo, input]);

  const handle = useStepper<PathState>({
    factory,
    initialState,
    speed,
    onDone: (final, elapsed, stepCount) => {
      onFinish?.(elapsed, stepCount, final.expansions, final.path.length, final.pathFound);
    },
  });

  useEffect(() => {
    handle.reset();
    if (runId > 0 && !paused) handle.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  useEffect(() => {
    if (runId === 0) return;
    if (paused) handle.pause();
    else if (!handle.isDone) handle.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const accent = algo.beast.accent;
  const borderAccent =
    accent === 'crimson'
      ? 'border-crimson/40'
      : accent === 'gold'
        ? 'border-gold/40'
        : 'border-teal/40';

  return (
    <div className={clsx('panel flex flex-col gap-3 p-4', borderAccent, handle.isDone && 'shadow-glow')}>
      <div className="flex items-center justify-between gap-3">
        <BeastBadge beast={algo.beast} />
        <div className="flex items-center gap-4 text-right">
          <Stat label="Explored" value={handle.state.expansions.toLocaleString()} />
          <Stat label="Path" value={handle.state.path.length ? handle.state.path.length.toLocaleString() : '—'} />
          <Stat
            label={handle.isDone ? 'Time' : 'Elapsed'}
            value={`${handle.elapsedMs.toFixed(0)}ms`}
            highlight={handle.isDone}
          />
        </div>
      </div>
      <GridCanvas grid={input.grid} state={handle.state} accent={accent} cellPx={cellPx} />
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.25em] text-parchment/50">
        <span>
          {handle.isDone ? (
            handle.state.pathFound ? (
              <span className="text-gold">Path Found</span>
            ) : (
              <span className="text-crimson">No Path</span>
            )
          ) : handle.isRunning ? (
            <span>Searching…</span>
          ) : runId === 0 ? (
            <span>Standing by</span>
          ) : (
            <span>Paused</span>
          )}
        </span>
        <span className="font-mono text-parchment/40">{algo.beast.complexity.average} avg</span>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-right leading-tight">
      <div className="stat-label">{label}</div>
      <div className={clsx('stat-value tabular-nums', highlight && 'text-gold')}>{value}</div>
    </div>
  );
}
