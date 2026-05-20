import type { Page } from '@/App';

interface Props {
  navigate(page: Page): void;
}

const ARENAS: { id: Page; title: string; tagline: string; accent: 'crimson' | 'gold' | 'teal' }[] = [
  {
    id: 'sorting',
    title: 'Sorting Arena',
    tagline: 'Watch five beasts wrestle order out of chaos. Pick any two and race.',
    accent: 'crimson',
  },
  {
    id: 'pathfinding',
    title: 'Pathfinding Arena',
    tagline: 'BFS floods. DFS dives. Dijkstra weighs. The Oracle simply knows.',
    accent: 'teal',
  },
  {
    id: 'adversarial',
    title: 'Adversarial Mode',
    tagline: 'Every beast has a nightmare. Summon the worst input. Watch it fall.',
    accent: 'gold',
  },
  {
    id: 'hall',
    title: 'Hall of Beasts',
    tagline: 'Lore, stats, and tactics for every creature in the bestiary.',
    accent: 'gold',
  },
];

const ACCENT_BORDER = {
  crimson: 'border-crimson/60 hover:shadow-crimson',
  gold: 'border-gold/60 hover:shadow-glow',
  teal: 'border-teal/60',
} as const;

const ACCENT_TEXT = {
  crimson: 'text-crimson',
  gold: 'text-gold',
  teal: 'text-teal',
} as const;

export function Home({ navigate }: Props) {
  return (
    <section className="flex flex-col gap-16 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="font-display text-5xl tracking-[0.35em] uppercase text-parchment md:text-7xl">
          AlgoArena
        </h1>
        <p className="font-display text-base tracking-[0.4em] uppercase text-gold md:text-lg">
          Battle of the Beasts
        </p>
        <p className="max-w-xl text-sm text-parchment/70 md:text-base">
          Two algorithms enter the ring. One algorithm leaves. Classic data-structures lore,
          reimagined as a coliseum of code where every beast's strengths — and worst-case
          weaknesses — are laid bare.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {ARENAS.map((arena) => (
          <button
            key={arena.id}
            onClick={() => navigate(arena.id)}
            className={`panel flex flex-col items-start gap-2 p-6 text-left transition hover:-translate-y-1 ${ACCENT_BORDER[arena.accent]}`}
          >
            <h2 className={`font-display text-2xl tracking-widest uppercase ${ACCENT_TEXT[arena.accent]}`}>
              {arena.title}
            </h2>
            <p className="text-sm text-parchment/70">{arena.tagline}</p>
            <span className="mt-2 text-[0.65rem] uppercase tracking-[0.3em] text-parchment/50">
              Enter →
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
