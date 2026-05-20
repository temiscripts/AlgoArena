import { useMemo, useState } from 'react';
import { SEARCH_ALGORITHM_LIST, getSearch } from '@/algorithms';
import { SearchFighter } from './SearchFighter';
import { generateArray, type Workload } from '@/lib/workloadGen';
import { play } from '@/lib/sound';

type TargetMode = 'first' | 'middle' | 'last' | 'random' | 'missing';

const TARGETS: { id: TargetMode; label: string }[] = [
  { id: 'first', label: 'First Element' },
  { id: 'middle', label: 'Middle Element' },
  { id: 'last', label: 'Last Element' },
  { id: 'random', label: 'Random Element' },
  { id: 'missing', label: 'Not Present' },
];

const WORKLOADS: { id: Workload; label: string }[] = [
  { id: 'sorted', label: 'Sorted · Uniform' },
  { id: 'nearly-sorted', label: 'Sorted · Mostly' },
  { id: 'few-unique', label: 'Few Unique · Clumped' },
];

function pickTarget(array: number[], mode: TargetMode, seed: number): number {
  const n = array.length;
  if (n === 0) return 0;
  switch (mode) {
    case 'first':
      return array[0];
    case 'middle':
      return array[n >> 1];
    case 'last':
      return array[n - 1];
    case 'random': {
      const idx = (seed * 9301 + 49297) % n;
      return array[idx];
    }
    case 'missing': {
      // A value strictly above the maximum will not be found.
      return Math.max(...array) + 7;
    }
  }
}

interface FinishRecord {
  ms: number;
  comparisons: number;
  found: boolean;
}

export function SearchingArena() {
  const [leftId, setLeftId] = useState('linear');
  const [rightId, setRightId] = useState('binary');
  const [size, setSize] = useState(120);
  const [speed, setSpeed] = useState(6);
  const [workload, setWorkload] = useState<Workload>('sorted');
  const [targetMode, setTargetMode] = useState<TargetMode>('last');
  const [seed, setSeed] = useState(1);
  const [runId, setRunId] = useState(0);
  const [paused, setPaused] = useState(false);
  const [leftFinish, setLeftFinish] = useState<FinishRecord | null>(null);
  const [rightFinish, setRightFinish] = useState<FinishRecord | null>(null);

  const leftAlgo = useMemo(() => getSearch(leftId), [leftId]);
  const rightAlgo = useMemo(() => getSearch(rightId), [rightId]);

  // For search algorithms we always present a sorted array (so binary/interp
  // can operate). The workload picker chooses HOW the values are distributed
  // — uniform, mostly-sorted (small noise), or clumped.
  const array = useMemo(() => {
    const raw = generateArray(size, workload, seed);
    return raw.slice().sort((a, b) => a - b);
  }, [size, workload, seed]);

  const target = useMemo(() => pickTarget(array, targetMode, seed), [array, targetMode, seed]);

  const input = useMemo(() => ({ array, target }), [array, target]);

  const startRace = () => {
    setLeftFinish(null);
    setRightFinish(null);
    setPaused(false);
    setRunId((r) => r + 1);
    play('clash');
  };

  const newInput = () => {
    setSeed((s) => s + 1);
    setLeftFinish(null);
    setRightFinish(null);
    setRunId(0);
    setPaused(false);
  };

  let verdict: string | null = null;
  if (leftFinish && rightFinish) {
    if (!leftFinish.found && !rightFinish.found) {
      verdict = 'Neither beast caught the quarry.';
    } else if (leftFinish.found && !rightFinish.found) {
      verdict = `${leftAlgo.beast.name} alone caught the quarry.`;
    } else if (!leftFinish.found && rightFinish.found) {
      verdict = `${rightAlgo.beast.name} alone caught the quarry.`;
    } else if (leftFinish.comparisons < rightFinish.comparisons) {
      verdict = `${leftAlgo.beast.name} needed ${rightFinish.comparisons - leftFinish.comparisons} fewer comparisons.`;
    } else if (rightFinish.comparisons < leftFinish.comparisons) {
      verdict = `${rightAlgo.beast.name} needed ${leftFinish.comparisons - rightFinish.comparisons} fewer comparisons.`;
    } else {
      verdict = 'Both beasts caught the quarry in the same number of leaps.';
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-widest uppercase text-parchment">
            Searching Arena
          </h2>
          <p className="text-sm text-parchment/60">
            One sorted line. One target. The beast that asks the fewest questions wins.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <Slider label={`Size · ${size}`} min={20} max={250} value={size} onChange={(v) => { setSize(v); setRunId(0); setLeftFinish(null); setRightFinish(null); }} />
          <Slider label={`Speed · ${speed}x`} min={1} max={30} value={speed} onChange={setSpeed} />
          <Picker
            label="Distribution"
            value={workload}
            onChange={(v) => {
              setWorkload(v as Workload);
              setRunId(0);
              setLeftFinish(null);
              setRightFinish(null);
            }}
            options={WORKLOADS}
          />
          <Picker
            label="Target"
            value={targetMode}
            onChange={(v) => {
              setTargetMode(v as TargetMode);
              setRunId(0);
              setLeftFinish(null);
              setRightFinish(null);
            }}
            options={TARGETS}
          />
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={startRace}>
              {runId === 0 ? 'Engage' : 'Restart'}
            </button>
            {runId > 0 && (
              <button
                className="btn"
                onClick={() => setPaused((p) => !p)}
                disabled={Boolean(leftFinish && rightFinish)}
              >
                {paused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button className="btn" onClick={newInput}>
              New Input
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <BeastPicker label="Left" value={leftId} onChange={setLeftId} />
        <BeastPicker label="Right" value={rightId} onChange={setRightId} />
        {verdict && (
          <div className="ml-auto font-display text-sm tracking-widest uppercase text-gold">
            {verdict}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SearchFighter
          algo={leftAlgo}
          input={input}
          speed={speed}
          runId={runId}
          paused={paused}
          onFinish={(ms, comparisons, found) => setLeftFinish({ ms, comparisons, found })}
        />
        <SearchFighter
          algo={rightAlgo}
          input={input}
          speed={speed}
          runId={runId}
          paused={paused}
          onFinish={(ms, comparisons, found) => setRightFinish({ ms, comparisons, found })}
        />
      </div>
    </section>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange(v: number): void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="stat-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-40 accent-crimson"
      />
    </label>
  );
}

function Picker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange(v: string): void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="stat-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-bone/70 bg-ash px-2 py-1 font-mono text-sm"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BeastPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange(v: string): void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="stat-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-bone/70 bg-ash px-2 py-1 font-mono text-sm"
      >
        {SEARCH_ALGORITHM_LIST.map((a) => (
          <option key={a.id} value={a.id}>
            {a.beast.name}
          </option>
        ))}
      </select>
    </label>
  );
}
