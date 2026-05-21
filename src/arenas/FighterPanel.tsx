import { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import type { SortAlgorithm, SortState } from '@/algorithms/types';
import { useStepper } from '@/lib/stepper';
import { play } from '@/lib/sound';
import { SortCanvas } from './SortCanvas';
import { BeastBadge } from '@/components/BeastBadge';

interface Props {
  algo: SortAlgorithm;
  input: number[];
  speed: number;
  /** Bumping this value resets the fighter and immediately starts a new run. */
  runId: number;
  /** When true, the run is paused but state is preserved. */
  paused: boolean;
  onFinish?(elapsedMs: number, stepCount: number, comparisons: number, writes: number): void;
}

export function FighterPanel({ algo, input, speed, runId, paused, onFinish }: Props) {
  const initialState = useMemo<SortState>(
    () => ({
      array: input.slice(),
      comparisons: 0,
      writes: 0,
      done: false,
      highlights: {},
    }),
    [input],
  );

  const factory = useMemo(() => () => algo.steps(input), [algo, input]);

  const handle = useStepper<SortState>({
    factory,
    initialState,
    speed,
    onDone: (_final, elapsedMs, stepCount) => {
      onFinish?.(elapsedMs, stepCount, _final.comparisons, _final.writes);
    },
  });

  // runId change = new race round: reset + start.
  useEffect(() => {
    handle.reset();
    if (runId > 0 && !paused) handle.start();
    // intentionally only on runId; reset/start come from the stable handle methods.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  // paused toggle mid-run.
  useEffect(() => {
    if (runId === 0) return;
    if (paused) handle.pause();
    else if (!handle.isDone) handle.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const shakeControls = useAnimationControls();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if ((handle.state.highlights.swap?.length ?? 0) > 0) {
      if (!reduceMotion) {
        shakeControls.start({
          x: [0, -2, 2, -1, 1, 0],
          transition: { duration: 0.18 },
        });
      }
      play('clang');
    }
  }, [handle.state, shakeControls, reduceMotion]);

  useEffect(() => {
    if (!handle.isDone) return;
    if (!reduceMotion) {
      shakeControls.start({
        scale: [1, 1.015, 1],
        transition: { duration: 0.45 },
      });
    }
    play('victory');
  }, [handle.isDone, shakeControls, reduceMotion]);

  const accent = algo.beast.accent;
  const borderAccent =
    accent === 'crimson'
      ? 'border-crimson/40'
      : accent === 'gold'
        ? 'border-gold/40'
        : 'border-teal/40';

  return (
    <motion.div
      animate={shakeControls}
      className={clsx('panel flex flex-col gap-3 p-4', borderAccent, handle.isDone && 'shadow-glow')}
    >
      <div className="flex items-center justify-between gap-3">
        <BeastBadge beast={algo.beast} />
        <div className="flex items-center gap-4 text-right">
          <Stat label="Compares" value={handle.state.comparisons.toLocaleString()} />
          <Stat label="Writes" value={handle.state.writes.toLocaleString()} />
          <Stat label="Steps" value={handle.stepCount.toLocaleString()} />
          <Stat
            label={handle.isDone ? 'Time' : 'Elapsed'}
            value={`${handle.elapsedMs.toFixed(0)}ms`}
            highlight={handle.isDone}
          />
        </div>
      </div>
      <SortCanvas state={handle.state} accent={accent} />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.25em] text-parchment/50">
          <span>
            {handle.isDone ? (
              <span className="text-gold">Victorious</span>
            ) : handle.isRunning ? (
              <span>Engaging…</span>
            ) : runId === 0 ? (
              <span>Standing by</span>
            ) : (
              <span>Paused</span>
            )}
          </span>
          <span className="font-mono text-parchment/40">{algo.beast.complexity.average} avg</span>
        </div>
        <div className="text-[0.7rem] leading-snug text-parchment/55">
          {algo.beast.algoDescription}
        </div>
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
