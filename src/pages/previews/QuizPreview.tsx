import { motion } from 'framer-motion';

const OPTIONS = ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];

export function QuizPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="quiz-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(196,50,43,0.55)" />
            <stop offset="70%" stopColor="rgba(196,50,43,0)" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={100} height={100} fill="url(#quiz-glow)" />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="font-display text-3xl tracking-[0.4em] text-crimson md:text-4xl">
          ?<span className="text-gold">?</span>?
        </span>
      </motion.div>
      <div className="absolute bottom-1 left-0 right-0 grid grid-cols-4 gap-1 px-2 text-[0.55rem] font-mono uppercase tracking-widest text-parchment/40">
        {OPTIONS.map((o, i) => (
          <motion.span
            key={o}
            className="text-center"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 2.4, delay: i * 0.4, repeat: Infinity }}
          >
            {o}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
