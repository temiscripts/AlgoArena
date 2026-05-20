import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const BAR_COUNT = 18;

// Two phases: a slow attack where bars sequentially flip red,
// then a brief flash and reset. ~3.6s loop.
const PHASES = ['attack', 'flash', 'reset'] as const;

export function AdversarialPreview() {
  const [phase, setPhase] = useState<(typeof PHASES)[number]>('attack');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let attackTimer: number | null = null;
    if (phase === 'attack') {
      attackTimer = window.setInterval(() => {
        setProgress((p) => {
          if (p + 1 >= BAR_COUNT) {
            setPhase('flash');
            return BAR_COUNT;
          }
          return p + 1;
        });
      }, 150);
    } else if (phase === 'flash') {
      const t = window.setTimeout(() => setPhase('reset'), 400);
      return () => window.clearTimeout(t);
    } else {
      const t = window.setTimeout(() => {
        setProgress(0);
        setPhase('attack');
      }, 500);
      return () => window.clearTimeout(t);
    }
    return () => {
      if (attackTimer != null) window.clearInterval(attackTimer);
    };
  }, [phase]);

  const barW = 100 / BAR_COUNT;
  const heights = Array.from({ length: BAR_COUNT }, (_, i) => 18 + ((i * 13) % 70));

  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
        {heights.map((h, i) => {
          const isStruck = i < progress;
          return (
            <rect
              key={i}
              x={i * barW + barW * 0.1}
              y={100 - h}
              width={barW * 0.8}
              height={h}
              fill={isStruck ? '#c4322b' : '#e8e3d3'}
              opacity={isStruck ? 0.9 : 0.7}
            />
          );
        })}
      </svg>
      {phase === 'flash' && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.4 }}
          style={{
            background:
              'radial-gradient(circle at center, rgba(196,50,43,0.85) 0%, rgba(196,50,43,0) 70%)',
          }}
        />
      )}
    </div>
  );
}
