import { useMemo, useState } from 'react';
import { SORT_ALGORITHM_LIST, getSort } from '@/algorithms';
import { FighterPanel } from '@/arenas/FighterPanel';
import { BeastCard } from '@/components/BeastCard';

export function AdversarialMode() {
  const [algoId, setAlgoId] = useState('quick');
  const [size, setSize] = useState(120);
  const [speed, setSpeed] = useState(10);
  const [runId, setRunId] = useState(0);
  const [paused, setPaused] = useState(false);
  const [finishMs, setFinishMs] = useState<number | null>(null);

  const algo = useMemo(() => getSort(algoId), [algoId]);
  const worstInput = useMemo(() => algo.worstCaseInput(size), [algo, size]);
  const bestInput = useMemo(() => algo.bestCaseInput(size), [algo, size]);

  const engage = () => {
    setFinishMs(null);
    setPaused(false);
    setRunId((r) => r + 1);
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-display text-3xl tracking-widest uppercase text-crimson">
          Adversarial Mode
        </h2>
        <p className="max-w-2xl text-sm text-parchment/70">
          Every beast has a nightmare. Pick a champion, and the arena will craft the input it
          dreads most. Watch the giant fall.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="stat-label">Beast</span>
          <select
            value={algoId}
            onChange={(e) => {
              setAlgoId(e.target.value);
              setRunId(0);
              setFinishMs(null);
            }}
            className="rounded-md border border-bone/70 bg-ash px-2 py-1 font-mono text-sm"
          >
            {SORT_ALGORITHM_LIST.map((a) => (
              <option key={a.id} value={a.id}>
                {a.beast.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="stat-label">Input Size · {size}</span>
          <input
            type="range"
            min={20}
            max={250}
            value={size}
            onChange={(e) => {
              setSize(parseInt(e.target.value, 10));
              setRunId(0);
              setFinishMs(null);
            }}
            className="w-48 accent-crimson"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="stat-label">Speed · {speed}x</span>
          <input
            type="range"
            min={1}
            max={40}
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
            className="w-48 accent-crimson"
          />
        </label>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={engage}>
            {runId === 0 ? 'Summon the Worst Case' : 'Strike Again'}
          </button>
          {runId > 0 && finishMs == null && (
            <button className="btn" onClick={() => setPaused((p) => !p)}>
              {paused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-md border border-crimson/50 bg-crimson/10 p-3 text-xs uppercase tracking-[0.2em] text-crimson">
            Worst-case input · {algo.beast.stats.worstCase}
          </div>
          <FighterPanel
            algo={algo}
            input={worstInput}
            speed={speed}
            runId={runId}
            paused={paused}
            onFinish={(ms) => setFinishMs(ms)}
          />
          <div className="rounded-md border border-teal/40 bg-teal/5 p-3 text-xs uppercase tracking-[0.2em] text-teal">
            For comparison · best-case input
          </div>
          <FighterPanel
            algo={algo}
            input={bestInput}
            speed={speed}
            runId={runId}
            paused={paused}
          />
        </div>
        <aside className="flex flex-col gap-4">
          <BeastCard beast={algo.beast} />
          {finishMs != null && (
            <div className="panel border-crimson/60 p-4 text-sm">
              <div className="font-display tracking-widest uppercase text-crimson">
                Verdict
              </div>
              <p className="mt-2 text-parchment/80">
                Brought low by its own kind. Compare the worst-case time against the best-case
                run for the same algorithm — the difference is the price of an unlucky pivot,
                a sorted scan, or a reversed array.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
