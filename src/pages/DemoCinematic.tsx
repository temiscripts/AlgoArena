import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getSort } from '@/algorithms';
import { generateArray } from '@/lib/workloadGen';
import { FighterPanel } from '@/arenas/FighterPanel';
import { play } from '@/lib/sound';

interface Props {
  onClose(): void;
}

type Phase = 'intro' | 'race' | 'outro';

const INTRO_MS = 1400;
const OUTRO_MS = 4500;

interface FinishRecord {
  elapsedMs: number;
  steps: number;
  comparisons: number;
}

export function DemoCinematic({ onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [runId, setRunId] = useState(0);
  const [leftFinish, setLeftFinish] = useState<FinishRecord | null>(null);
  const [rightFinish, setRightFinish] = useState<FinishRecord | null>(null);
  const closedRef = useRef(false);

  const quickAlgo = useMemo(() => getSort('quick'), []);
  const bubbleAlgo = useMemo(() => getSort('bubble'), []);
  const input = useMemo(() => generateArray(70, 'random', 314), []);

  // Phase 1 → 2: intro card lingers, then start the race.
  useEffect(() => {
    if (phase !== 'intro') return;
    play('clash');
    const t = window.setTimeout(() => {
      setPhase('race');
      setRunId(1);
    }, INTRO_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Phase 2 → 3: when both panels have finished, hold a verdict beat, then close.
  useEffect(() => {
    if (phase !== 'race') return;
    if (!leftFinish || !rightFinish) return;
    setPhase('outro');
  }, [phase, leftFinish, rightFinish]);

  useEffect(() => {
    if (phase !== 'outro') return;
    const t = window.setTimeout(() => {
      if (!closedRef.current) {
        closedRef.current = true;
        onClose();
      }
    }, OUTRO_MS);
    return () => window.clearTimeout(t);
  }, [phase, onClose]);

  const dismiss = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
  };

  // Esc to skip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const winnerName =
    leftFinish && rightFinish
      ? leftFinish.elapsedMs <= rightFinish.elapsedMs
        ? quickAlgo.beast.name
        : bubbleAlgo.beast.name
      : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center justify-between border-b border-bone/30 px-6 py-3">
        <div className="font-display text-xs uppercase tracking-[0.4em] text-parchment/60">
          AlgoArena · Showcase
        </div>
        <button
          onClick={dismiss}
          className="rounded-md border border-bone/50 px-3 py-1 font-display text-[0.65rem] uppercase tracking-[0.25em] text-parchment/60 hover:border-gold/60 hover:text-gold"
        >
          Skip · Esc
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="font-display text-xs uppercase tracking-[0.5em] text-crimson">
                Round One
              </div>
              <h2 className="font-display text-5xl tracking-[0.25em] uppercase text-parchment md:text-6xl">
                Lightning Adder
              </h2>
              <div className="font-display text-xl tracking-[0.4em] uppercase text-parchment/40">
                vs
              </div>
              <h2 className="font-display text-5xl tracking-[0.25em] uppercase text-parchment md:text-6xl">
                Bubblesnail
              </h2>
              <p className="mt-4 max-w-lg text-sm text-parchment/60">
                Seventy elements. Random order. The first to bring them to heel wins the round.
              </p>
            </motion.div>
          )}

          {(phase === 'race' || phase === 'outro') && (
            <motion.div
              key="race"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-2"
            >
              <FighterPanel
                algo={quickAlgo}
                input={input}
                speed={6}
                runId={runId}
                paused={false}
                onFinish={(elapsedMs, steps, comparisons) =>
                  setLeftFinish({ elapsedMs, steps, comparisons })
                }
              />
              <FighterPanel
                algo={bubbleAlgo}
                input={input}
                speed={6}
                runId={runId}
                paused={false}
                onFinish={(elapsedMs, steps, comparisons) =>
                  setRightFinish({ elapsedMs, steps, comparisons })
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'outro' && winnerName && (
            <motion.div
              key="outro"
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-ink/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="font-display text-xs uppercase tracking-[0.5em] text-gold">
                  Victor
                </div>
                <div className="font-display text-5xl tracking-[0.3em] uppercase text-gold md:text-6xl">
                  {winnerName}
                </div>
                <div className="mt-6 max-w-md text-sm text-parchment/70">
                  Explore the arenas yourself. Every beast has its strengths — and every beast
                  has the input that breaks it.
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
