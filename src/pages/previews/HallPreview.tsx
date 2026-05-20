import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ALL_ALGORITHMS } from '@/algorithms';

export function HallPreview() {
  const [index, setIndex] = useState(0);
  const beasts = ALL_ALGORITHMS.map((a) => a.beast);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % beasts.length), 2000);
    return () => window.clearInterval(id);
  }, [beasts.length]);

  const beast = beasts[index];
  const accent =
    beast.accent === 'crimson'
      ? 'text-crimson'
      : beast.accent === 'gold'
        ? 'text-gold'
        : 'text-teal';

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-ink/40">
      <AnimatePresence mode="wait">
        <motion.div
          key={beast.algorithmId}
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-1"
        >
          <span className={`font-display text-4xl leading-none ${accent}`} aria-hidden>
            {beast.sigil}
          </span>
          <span className="font-display text-[0.75rem] tracking-[0.3em] uppercase text-parchment/90">
            {beast.name}
          </span>
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-parchment/40">
            {beast.title}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
