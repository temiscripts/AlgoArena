import { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { useStepper } from '@/lib/stepper';
import { play } from '@/lib/sound';
import { makeInitialState, type PathAlgorithm, type PathInput, type PathState } from '@/algorithms/pathfinding/types';
import { GridCanvas } from './GridCanvas';
import { PathTracerOverlay } from './PathTracerOverlay';
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

  const pulseControls = useAnimationControls();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!handle.isDone) return;
    if (!reduceMotion) {
      pulseControls.start({
        scale: handle.state.pathFound ? [1, 1.015, 1] : [1, 0.995, 1],
        transition: { duration: 0.45 },
      });
    }
    if (handle.state.pathFound) play('victory');
  }, [handle.isDone, handle.state.pathFound, pulseControls, reduceMotion]);

  const accent = algo.beast.accent;
  const borderAccent =
    accent === 'crimson'
      ? 'border-crimson/40'
      : accent === 'gold'
        ? 'border-gold/40'
        : 'border-teal/40';

  return (
    <motion.div
      animate={pulseControls}
      className={clsx('panel flex flex-col gap-3 p-4', borderAccent, handle.isDone && 'shadow-glow')}
    >
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
      <div className="relative">
        <GridCanvas grid={input.grid} state={handle.state} accent={accent} cellPx={cellPx} />
        {handle.state.pathFound && handle.isDone && (
          <PathTracerOverlay grid={input.grid} path={handle.state.path} />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.25em] text-parchment/50">
          <span>{statusLine(runId, handle.isRunning, handle.isDone, handle.state.pathFound, handle.state.expansions, handle.state.path.length)}</span>
          <span className="font-mono text-parchment/40">{algo.beast.complexity.average} avg</span>
        </div>
        <div className={clsx('text-[0.7rem] italic leading-snug',
          accent === 'crimson' ? 'text-crimson/80' : accent === 'gold' ? 'text-gold/80' : 'text-teal/80')}>
          {PATH_TACTIC[algo.id] ?? ''}
        </div>
        <div className="text-[0.7rem] leading-snug text-parchment/55">
          {algo.beast.algoDescription}
        </div>
      </div>
    </motion.div>
  );
}

const PATH_TACTIC: Record<string, string> = {
  bfs: 'Expanding outward in equal waves — guarantees the shortest path.',
  dfs: 'Plunging down a single corridor before backtracking.',
  dijkstra: 'Checking all paths by accumulated distance — no shortcuts.',
  astar: 'Using a heuristic — prioritising cells closer to the goal.',
};

function statusLine(
  runId: number,
  isRunning: boolean,
  isDone: boolean,
  pathFound: boolean,
  expansions: number,
  pathLen: number,
) {
  if (runId === 0) return <span>Standing by</span>;
  if (isDone) {
    return pathFound ? (
      <span className="text-gold">Path found · {pathLen} cells, explored {expansions} total</span>
    ) : (
      <span className="text-crimson">No path · explored {expansions} cells</span>
    );
  }
  if (isRunning) {
    return <span>Exploring · {expansions} cells checked</span>;
  }
  return <span>Paused · {expansions} cells</span>;
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-right leading-tight">
      <div className="stat-label">{label}</div>
      <div className={clsx('stat-value tabular-nums', highlight && 'text-gold')}>{value}</div>
    </div>
  );
}
