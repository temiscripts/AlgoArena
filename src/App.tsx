import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { SortingArena } from './arenas/SortingArena';
import { PathfindingArena } from './arenas/PathfindingArena';
import { SearchingArena } from './arenas/SearchingArena';
import { HallOfBeasts } from './pages/HallOfBeasts';
import { AdversarialMode } from './modes/AdversarialMode';
import { QuizMode } from './modes/QuizMode';
import { ComplexityDiscovery } from './modes/ComplexityDiscovery';
import { Tournament } from './modes/Tournament';
import { Home } from './pages/Home';
import { useMuted } from './lib/useMuted';
import { preloadAll } from './lib/sound';
import { clearHash, readBattleFromHash } from './lib/battleUrl';

export type Page =
  | 'home'
  | 'sorting'
  | 'pathfinding'
  | 'searching'
  | 'adversarial'
  | 'quiz'
  | 'discovery'
  | 'tournament'
  | 'hall';

const NAV: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'sorting', label: 'Sorting' },
  { id: 'pathfinding', label: 'Pathfinding' },
  { id: 'searching', label: 'Searching' },
  { id: 'adversarial', label: 'Adversarial' },
  { id: 'tournament', label: 'Tournament' },
  { id: 'quiz', label: 'Big-O Trial' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'hall', label: 'Hall of Beasts' },
];

function initialPageFromHash(): Page {
  if (typeof window === 'undefined') return 'home';
  const battle = readBattleFromHash();
  if (battle?.mode === 'sort') return 'sorting';
  if (battle?.mode === 'path') return 'pathfinding';
  return 'home';
}

export default function App() {
  const [page, setPage] = useState<Page>(initialPageFromHash);
  const [muted, setMuted] = useMuted();

  // Nav clicks always start fresh; only inbound share links carry hash state.
  const navigate = useCallback((p: Page) => {
    clearHash();
    setPage(p);
  }, []);

  // Warm the audio buffers on first interaction so the first clang isn't delayed.
  useEffect(() => {
    const warm = () => {
      preloadAll();
      window.removeEventListener('pointerdown', warm);
      window.removeEventListener('keydown', warm);
    };
    window.addEventListener('pointerdown', warm);
    window.addEventListener('keydown', warm);
    return () => {
      window.removeEventListener('pointerdown', warm);
      window.removeEventListener('keydown', warm);
    };
  }, []);

  return (
    <div className="min-h-screen w-full">
      <header className="border-b border-bone/40 bg-ink/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 md:flex-row">
          <button
            className="flex items-baseline gap-3"
            onClick={() => navigate('home')}
          >
            <h1 className="font-display text-2xl tracking-[0.25em] uppercase text-parchment">
              AlgoArena
            </h1>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-parchment/40">
              Battle of the Beasts
            </span>
          </button>
          <div className="flex items-center gap-3">
            <nav className="flex flex-wrap items-center gap-1">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
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
            <button
              onClick={() => setMuted(!muted)}
              aria-label={muted ? 'Unmute' : 'Mute'}
              title={muted ? 'Unmute' : 'Mute'}
              className="rounded-md border border-bone/60 px-2 py-1 text-xs text-parchment/70 transition hover:border-gold/60 hover:text-gold"
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {page === 'home' && <Home navigate={navigate} />}
        {page === 'sorting' && <SortingArena />}
        {page === 'pathfinding' && <PathfindingArena />}
        {page === 'searching' && <SearchingArena />}
        {page === 'adversarial' && <AdversarialMode />}
        {page === 'quiz' && <QuizMode />}
        {page === 'discovery' && <ComplexityDiscovery />}
        {page === 'tournament' && <Tournament />}
        {page === 'hall' && <HallOfBeasts />}
      </main>

      <footer className="mx-auto max-w-7xl px-6 py-6 text-center text-[0.65rem] uppercase tracking-[0.3em] text-parchment/30">
        AlgoFest · Battle of the Beasts · Two algorithms enter. One algorithm leaves.
      </footer>
    </div>
  );
}
