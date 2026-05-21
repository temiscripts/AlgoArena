import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import type { Page } from '@/App';
import { play } from '@/lib/sound';
import { SortingPreview } from './previews/SortingPreview';
import { PathfindingPreview } from './previews/PathfindingPreview';
import { SearchingPreview } from './previews/SearchingPreview';
import { AdversarialPreview } from './previews/AdversarialPreview';
import { QuizPreview } from './previews/QuizPreview';
import { DiscoveryPreview } from './previews/DiscoveryPreview';
import { TournamentPreview } from './previews/TournamentPreview';
import { HallPreview } from './previews/HallPreview';
import { DemoCinematic } from './DemoCinematic';
import { StatsTicker } from './StatsTicker';

interface Props {
  navigate(page: Page): void;
}

type Accent = 'crimson' | 'gold' | 'teal';

interface ArenaTile {
  id: Page;
  title: string;
  tagline: string;
  /** Plain-English one-liner explaining what the page actually does. */
  subtitle: string;
  accent: Accent;
  Preview: React.ComponentType;
}

const ARENAS: ArenaTile[] = [
  {
    id: 'sorting',
    title: 'Sorting Arena',
    tagline: 'Watch five beasts wrestle order out of chaos. Pick any two and race.',
    subtitle: 'Race 5 classic sorting algorithms on the same array.',
    accent: 'crimson',
    Preview: SortingPreview,
  },
  {
    id: 'pathfinding',
    title: 'Pathfinding Arena',
    tagline: 'BFS floods. DFS dives. Dijkstra weighs. The Oracle simply knows.',
    subtitle: 'Race 4 classic pathfinding algorithms through custom mazes.',
    accent: 'teal',
    Preview: PathfindingPreview,
  },
  {
    id: 'searching',
    title: 'Searching Arena',
    tagline: 'One sorted line. One target. The beast that asks fewest wins.',
    subtitle: 'Race 3 search algorithms — linear, binary, and interpolation.',
    accent: 'teal',
    Preview: SearchingPreview,
  },
  {
    id: 'adversarial',
    title: 'Adversarial Mode',
    tagline: 'Every beast has a nightmare. Summon the worst input. Watch it fall.',
    subtitle: 'Pick a sort and run it on its worst-case input next to its best case.',
    accent: 'gold',
    Preview: AdversarialPreview,
  },
  {
    id: 'tournament',
    title: 'Tournament',
    tagline: 'Four beasts. Two semifinals. One throne. Pick the bracket and crown a champion.',
    subtitle: 'Single-elimination bracket — winner is whoever finishes with fewer comparisons.',
    accent: 'crimson',
    Preview: TournamentPreview,
  },
  {
    id: 'quiz',
    title: 'Big-O Trial',
    tagline: 'A nameless beast appears. Read its movement. Wager on its cost.',
    subtitle: 'Identify an algorithm’s Big-O complexity from how it runs.',
    accent: 'crimson',
    Preview: QuizPreview,
  },
  {
    id: 'discovery',
    title: 'Complexity Discovery',
    tagline: 'Force a beast through six battlefields. Watch the curve emerge. Name its law.',
    subtitle: 'Measure a sort at 6 input sizes and fit a curve to reveal its complexity class.',
    accent: 'teal',
    Preview: DiscoveryPreview,
  },
  {
    id: 'hall',
    title: 'Hall of Beasts',
    tagline: 'Lore, stats, and tactics for every creature in the bestiary.',
    subtitle: 'Browse every algorithm with its complexity, strengths, and weaknesses.',
    accent: 'gold',
    Preview: HallPreview,
  },
];

const ACCENT_BORDER: Record<Accent, string> = {
  crimson: 'border-crimson/50',
  gold: 'border-gold/50',
  teal: 'border-teal/50',
};

const ACCENT_HOVER: Record<Accent, string> = {
  crimson: 'hover:border-crimson hover:shadow-crimson',
  gold: 'hover:border-gold hover:shadow-glow',
  teal: 'hover:border-teal hover:shadow-glow',
};

const ACCENT_TEXT: Record<Accent, string> = {
  crimson: 'text-crimson',
  gold: 'text-gold',
  teal: 'text-teal',
};

export function Home({ navigate }: Props) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="flex flex-col gap-10 py-6">
      <div className="flex flex-col items-center gap-5 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-5xl tracking-[0.35em] uppercase text-parchment md:text-7xl"
        >
          AlgoArena
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="font-display text-base tracking-[0.4em] uppercase text-gold md:text-lg"
        >
          Battle of the Beasts
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="max-w-2xl space-y-3 text-sm text-parchment/75 md:text-base"
        >
          <p>
            Classic algorithms reimagined as battling beasts. Watch them fight head-to-head on
            real workloads — and discover the inputs that shatter them.
          </p>
          <p className="text-parchment/55">
            No two beasts move the same way. Test your eye, learn their tells, and find the
            terrain on which each one falls.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <button
            onClick={() => {
              play('clash');
              setDemoOpen(true);
            }}
            onMouseEnter={() => play('hover')}
            className="btn btn-primary group relative px-6 py-3 text-base"
          >
            <span aria-hidden className="text-crimson">
              ▶
            </span>
            <span>Watch Demo</span>
            <span className="ml-2 font-mono text-[0.65rem] tracking-[0.25em] text-parchment/40 group-hover:text-parchment/70">
              · 20s
            </span>
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ARENAS.map((arena, i) => (
          <motion.button
            key={arena.id}
            onClick={() => {
              play('clash');
              navigate(arena.id);
            }}
            onMouseEnter={() => play('hover')}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
            whileHover={{ y: -4 }}
            className={clsx(
              'panel group flex flex-col gap-3 overflow-hidden p-0 text-left transition',
              ACCENT_BORDER[arena.accent],
              ACCENT_HOVER[arena.accent],
            )}
          >
            <div className="relative h-32 w-full overflow-hidden border-b border-bone/30 bg-ink/60">
              <arena.Preview />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            </div>
            <div className="flex flex-col gap-2 px-5 pb-5">
              <h2
                className={clsx(
                  'font-display text-xl tracking-widest uppercase',
                  ACCENT_TEXT[arena.accent],
                )}
              >
                {arena.title}
              </h2>
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-parchment/55">
                {arena.subtitle}
              </p>
              <p className="text-sm italic text-parchment/75">{arena.tagline}</p>
              <span className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-parchment/40 transition group-hover:text-parchment/80">
                Enter →
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <StatsTicker />

      <AnimatePresence>
        {demoOpen && <DemoCinematic onClose={() => setDemoOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}
