import { SortingArena } from './arenas/SortingArena';

export default function App() {
  return (
    <div className="min-h-screen w-full">
      <header className="border-b border-bone/40 bg-ink/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-2xl tracking-[0.25em] uppercase text-parchment">
              AlgoArena
            </h1>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-parchment/40">
              Battle of the Beasts
            </span>
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-parchment/40">
            Two algorithms enter. One algorithm leaves.
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <SortingArena />
      </main>
      <footer className="mx-auto max-w-7xl px-6 py-6 text-center text-[0.65rem] uppercase tracking-[0.3em] text-parchment/30">
        AlgoFest · Battle of the Beasts
      </footer>
    </div>
  );
}
