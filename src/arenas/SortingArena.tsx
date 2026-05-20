import { useEffect, useMemo, useRef, useState } from 'react';
import { SORT_ALGORITHM_LIST, getSort } from '@/algorithms';
import { FighterPanel } from './FighterPanel';
import { generateArray, type Workload } from '@/lib/workloadGen';
import { play } from '@/lib/sound';
import { buildShareUrl, copyText, readBattleFromHash } from '@/lib/battleUrl';

const WORKLOADS: { id: Workload; label: string }[] = [
  { id: 'random', label: 'Random' },
  { id: 'sorted', label: 'Sorted' },
  { id: 'reversed', label: 'Reversed' },
  { id: 'nearly-sorted', label: 'Nearly Sorted' },
  { id: 'few-unique', label: 'Few Unique' },
];

interface FinishRecord {
  elapsedMs: number;
  stepCount: number;
  comparisons: number;
  writes: number;
}

// Pre-resolve any battle URL hash so the initial render already reflects the
// shared params — avoids a visual flicker between defaults and the replay.
const initialBattle = typeof window !== 'undefined' ? readBattleFromHash() : null;
const initialSort = initialBattle?.mode === 'sort' ? initialBattle : null;

export function SortingArena() {
  const [leftId, setLeftId] = useState(initialSort?.left ?? 'quick');
  const [rightId, setRightId] = useState(initialSort?.right ?? 'bubble');
  const [size, setSize] = useState(initialSort?.size ?? 80);
  const [speed, setSpeed] = useState(initialSort?.speed ?? 6);
  const [workload, setWorkload] = useState<Workload>(initialSort?.workload ?? 'random');
  const [seed, setSeed] = useState(initialSort?.seed ?? 1);
  const [runId, setRunId] = useState(0);
  const [paused, setPaused] = useState(false);
  const [leftFinish, setLeftFinish] = useState<FinishRecord | null>(null);
  const [rightFinish, setRightFinish] = useState<FinishRecord | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const autoEngagedRef = useRef(false);

  const leftAlgo = useMemo(() => getSort(leftId), [leftId]);
  const rightAlgo = useMemo(() => getSort(rightId), [rightId]);

  const input = useMemo(() => generateArray(size, workload, seed), [size, workload, seed]);

  const startRace = () => {
    setLeftFinish(null);
    setRightFinish(null);
    setPaused(false);
    setRunId((r) => r + 1);
    play('clash');
  };

  // Auto-engage once if landed from a share URL.
  useEffect(() => {
    if (autoEngagedRef.current || !initialSort) return;
    autoEngagedRef.current = true;
    startRace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    const url = buildShareUrl({
      mode: 'sort',
      left: leftId,
      right: rightId,
      workload,
      size,
      seed,
      speed,
    });
    const ok = await copyText(url);
    setCopyState(ok ? 'ok' : 'fail');
    window.setTimeout(() => setCopyState('idle'), 1800);
  };

  const newInput = () => {
    setSeed((s) => s + 1);
    setLeftFinish(null);
    setRightFinish(null);
    setRunId(0);
    setPaused(false);
  };

  const winner =
    leftFinish && rightFinish
      ? leftFinish.elapsedMs < rightFinish.elapsedMs
        ? 'left'
        : rightFinish.elapsedMs < leftFinish.elapsedMs
          ? 'right'
          : 'tie'
      : null;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-widest uppercase text-parchment">
            Sorting Arena
          </h2>
          <p className="text-sm text-parchment/60">
            Two beasts. One array. The first to order all elements wins.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <Slider
            label={`Size · ${size}`}
            min={10}
            max={250}
            value={size}
            onChange={(v) => {
              setSize(v);
              setRunId(0);
              setLeftFinish(null);
              setRightFinish(null);
            }}
          />
          <Slider
            label={`Speed · ${speed}x`}
            min={1}
            max={50}
            value={speed}
            onChange={setSpeed}
          />
          <div className="flex flex-col gap-1">
            <span className="stat-label">Workload</span>
            <select
              value={workload}
              onChange={(e) => {
                setWorkload(e.target.value as Workload);
                setRunId(0);
                setLeftFinish(null);
                setRightFinish(null);
              }}
              className="rounded-md border border-bone/70 bg-ash px-2 py-1 font-mono text-sm"
            >
              {WORKLOADS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
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
            <button
              className="btn"
              onClick={handleShare}
              title="Copy a shareable URL that replays this exact battle"
            >
              {copyState === 'ok' ? 'Copied ✓' : copyState === 'fail' ? 'Copy Failed' : 'Share Battle'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Picker label="Left" value={leftId} onChange={setLeftId} />
        <Picker label="Right" value={rightId} onChange={setRightId} />
        {winner && (
          <div className="ml-auto font-display text-sm tracking-widest uppercase text-gold">
            {winner === 'tie'
              ? 'Stalemate'
              : `${winner === 'left' ? leftAlgo.beast.name : rightAlgo.beast.name} stands triumphant`}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FighterPanel
          algo={leftAlgo}
          input={input}
          speed={speed}
          runId={runId}
          paused={paused}
          onFinish={(elapsedMs, stepCount, comparisons, writes) =>
            setLeftFinish({ elapsedMs, stepCount, comparisons, writes })
          }
        />
        <FighterPanel
          algo={rightAlgo}
          input={input}
          speed={speed}
          runId={runId}
          paused={paused}
          onFinish={(elapsedMs, stepCount, comparisons, writes) =>
            setRightFinish({ elapsedMs, stepCount, comparisons, writes })
          }
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
        className="w-44 accent-crimson"
      />
    </label>
  );
}

function Picker({
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
        {SORT_ALGORITHM_LIST.map((a) => (
          <option key={a.id} value={a.id}>
            {a.beast.name}
          </option>
        ))}
      </select>
    </label>
  );
}
