import { useState } from 'react';
import clsx from 'clsx';
import { SortingArena } from './arenas/SortingArena';
import { PathfindingArena } from './arenas/PathfindingArena';
import { HallOfBeasts } from './pages/HallOfBeasts';
import { AdversarialMode } from './modes/AdversarialMode';
import { Home } from './pages/Home';

export type Page = 'home' | 'sorting' | 'pathfinding' | 'adversarial' | 'hall';

const NAV: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'sorting', label: 'Sorting' },
  { id: 'pathfinding', label: 'Pathfinding' },
  { id: 'adversarial', label: 'Adversarial' },
  { id: 'hall', label: 'Hall of Beasts' },
];

export default function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <div className="min-h-screen w-full">
      <header className="border-b border-bone/40 bg-ink/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 md:flex-row">
          <button
            className="flex items-baseline gap-3"
            onClick={() => setPage('home')}
          >
            <h1 className="font-display text-2xl tracking-[0.25em] uppercase text-parchment">
              AlgoArena
            </h1>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-parchment/40">
              Battle of the Beasts
            </span>
          </button>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={clsx(
                  'rounded-md px-3 py-1 font-display text-xs uppercase tracking-[0.25em] transition',
                  page === item.id
                    ? 'bg-crimson/20 text-crimson'
                    : 'text-parchment/60 hover:text-parchment',
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {page === 'home' && <Home navigate={setPage} />}
        {page === 'sorting' && <SortingArena />}
        {page === 'pathfinding' && <PathfindingArena />}
        {page === 'adversarial' && <AdversarialMode />}
        {page === 'hall' && <HallOfBeasts />}
      </main>

      <footer className="mx-auto max-w-7xl px-6 py-6 text-center text-[0.65rem] uppercase tracking-[0.3em] text-parchment/30">
        AlgoFest · Battle of the Beasts · Two algorithms enter. One algorithm leaves.
      </footer>
    </div>
  );
}
