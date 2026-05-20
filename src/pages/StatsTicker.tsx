import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STATS: string[] = [
  'Lightning Adder · 89% win rate across 1,247 random skirmishes',
  'Bubblesnail · undefeated on already-sorted ground',
  'The Pyrelord · never wavered. zero recorded losses on heap-built ladders',
  'The Oracle · 3.4× fewer cells explored than the Cartographer on open fields',
  'Tidecaller · the only beast guaranteed shortest path on unweighted terrain',
  'Cardweaver · 8× faster than its closest rival on nearly-sorted decks',
  'The Twin Wyrms · consistency incarnate. O(n log n) on every input ever recorded',
  'Shadowdelver · longest single-run depth: 4,096 cells before backtrack',
];

const ROTATE_MS = 3200;

export function StatsTicker() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % STATS.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative flex h-12 items-center justify-center overflow-hidden border-y border-bone/30 bg-ash/50 px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-parchment/60 md:text-xs"
        >
          <span className="text-crimson">▸</span>
          <span>{STATS[index]}</span>
          <span className="text-crimson">◂</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
