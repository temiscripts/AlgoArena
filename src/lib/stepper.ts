import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface StepperOptions<TState> {
  factory: () => Generator<TState>;
  initialState: TState;
  speed: number;
  onDone?: (final: TState, elapsedMs: number, stepCount: number) => void;
}

export interface StepperHandle<TState> {
  state: TState;
  isRunning: boolean;
  isDone: boolean;
  stepCount: number;
  elapsedMs: number;
  start(): void;
  pause(): void;
  reset(): void;
  tick(n?: number): void;
}

/**
 * Drives a generator-yielding algorithm forward at the requested speed.
 * `speed` is steps per animation frame; renderer-driven so any speed slider
 * works without rebuilding the generator.
 */
export function useStepper<TState>(opts: StepperOptions<TState>): StepperHandle<TState> {
  const { factory, initialState, speed, onDone } = opts;

  const [state, setState] = useState<TState>(initialState);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const genRef = useRef<Generator<TState> | null>(null);
  const stepCountRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const speedRef = useRef(speed);
  const onDoneRef = useRef(onDone);
  const factoryRef = useRef(factory);
  const initialStateRef = useRef(initialState);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);
  useEffect(() => {
    factoryRef.current = factory;
  }, [factory]);
  useEffect(() => {
    initialStateRef.current = initialState;
  }, [initialState]);

  const advanceBatch = useCallback((batch: number): { finished: boolean; advanced: number; last?: TState } => {
    if (!genRef.current) {
      genRef.current = factoryRef.current();
      startedAtRef.current = performance.now();
    }
    let last: TState | undefined;
    let advanced = 0;
    for (let i = 0; i < batch; i++) {
      const r = genRef.current.next();
      if (r.done) {
        return { finished: true, advanced, last };
      }
      last = r.value;
      advanced++;
    }
    return { finished: false, advanced, last };
  }, []);

  const finalize = useCallback((last: TState | undefined) => {
    const elapsed = performance.now() - (startedAtRef.current ?? performance.now());
    setElapsedMs(elapsed);
    setIsDone(true);
    setIsRunning(false);
    if (last !== undefined) setState(last);
    if (last !== undefined) onDoneRef.current?.(last, elapsed, stepCountRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const loop = () => {
      const batch = Math.max(1, Math.floor(speedRef.current));
      const { finished, advanced, last } = advanceBatch(batch);
      if (advanced > 0) {
        stepCountRef.current += advanced;
        setStepCount(stepCountRef.current);
        if (!finished && last !== undefined) setState(last);
        if (startedAtRef.current != null) {
          setElapsedMs(performance.now() - startedAtRef.current);
        }
      }
      if (finished) {
        finalize(last);
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isRunning, advanceBatch, finalize]);

  return useMemo<StepperHandle<TState>>(
    () => ({
      state,
      isRunning,
      isDone,
      stepCount,
      elapsedMs,
      start() {
        if (isDone) return;
        setIsRunning(true);
      },
      pause() {
        setIsRunning(false);
      },
      reset() {
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        genRef.current = null;
        startedAtRef.current = null;
        stepCountRef.current = 0;
        setState(initialStateRef.current);
        setIsRunning(false);
        setIsDone(false);
        setStepCount(0);
        setElapsedMs(0);
      },
      tick(n = 1) {
        if (isDone) return;
        const { finished, advanced, last } = advanceBatch(n);
        if (advanced > 0) {
          stepCountRef.current += advanced;
          setStepCount(stepCountRef.current);
          if (last !== undefined) setState(last);
          if (startedAtRef.current != null) {
            setElapsedMs(performance.now() - startedAtRef.current);
          }
        }
        if (finished) finalize(last);
      },
    }),
    [state, isRunning, isDone, stepCount, elapsedMs, advanceBatch, finalize],
  );
}
