import { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { useStepper } from '@/lib/stepper';
import { play } from '@/lib/sound';
import {
  makeInitialSearchState,
  type SearchAlgorithm,
  type SearchInput,
  type SearchState,
} from '@/algorithms/searching/types';
import { SearchCanvas } from './SearchCanvas';
import { BeastBadge } from '@/components/BeastBadge';

interface Props {
  algo: SearchAlgorithm;
  input: SearchInput;
  speed: number;
  runId: number;
  paused: boolean;
  onFinish?(elapsedMs: number, comparisons: number, found: boolean): void;
}

export function SearchFighter({ algo, input, speed, runId, paused, onFinish }: Props) {
  const initialState = useMemo<SearchState>(
    () => makeInitialSearchState(input.array.length),
    [input.array.length],
  );
  const factory = useMemo(() => () => algo.steps(input), [algo, input]);

  const handle = useStepper<SearchState>({
    factory,
    initialState,
    speed,
    onDone: (final, elapsed) => {
      onFinish?.(elapsed, final.comparisons, final.found);
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
        scale: handle.state.found ? [1, 1.015, 1] : [1, 0.995, 1],
        transition: { duration: 0.45 },
      });
    }
    if (handle.state.found) play('victory');
  }, [handle.isDone, handle.state.found, pulseControls, reduceMotion]);

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
          <Stat label="Compares" value={handle.state.comparisons.toLocaleString()} />
          <Stat label="Steps" value={handle.stepCount.toLocaleString()} />
          <Stat
            label={handle.isDone ? 'Time' : 'Elapsed'}
            value={`${handle.elapsedMs.toFixed(0)}ms`}
            highlight={handle.isDone}
          />
        </div>
      </div>
      <SearchCanvas array={input.array} target={input.target} state={handle.state} accent={accent} />
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.25em] text-parchment/50">
        <span>
          {handle.isDone ? (
            handle.state.found ? (
              <span className="text-gold">Quarry Caught</span>
            ) : (
              <span className="text-crimson">Lost the Scent</span>
            )
          ) : handle.isRunning ? (
            <span>Hunting…</span>
          ) : runId === 0 ? (
            <span>Standing by</span>
          ) : (
            <span>Paused</span>
          )}
        </span>
        <span className="font-mono text-parchment/40">{algo.beast.complexity.average} avg</span>
      </div>
    </motion.div>
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
