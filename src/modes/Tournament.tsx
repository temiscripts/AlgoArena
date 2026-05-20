import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { SORT_ALGORITHM_LIST, getSort } from '@/algorithms';
import { FighterPanel } from '@/arenas/FighterPanel';
import { BeastCard } from '@/components/BeastCard';
import { generateArray, type Workload } from '@/lib/workloadGen';
import { play } from '@/lib/sound';

type MatchId = 'semi-a' | 'semi-b' | 'final';

interface MatchResult {
  winnerId: string;
  loserId: string;
  winnerOps: number;
  loserOps: number;
}

interface MatchSlot {
  leftId: string;
  rightId: string;
  result: MatchResult | null;
}

const WORKLOADS: { id: Workload; label: string }[] = [
  { id: 'random', label: 'Random' },
  { id: 'sorted', label: 'Sorted' },
  { id: 'reversed', label: 'Reversed' },
  { id: 'nearly-sorted', label: 'Nearly Sorted' },
  { id: 'few-unique', label: 'Few Unique' },
];

const DEFAULT_ENTRANTS = ['quick', 'merge', 'heap', 'bubble'];

export function Tournament() {
  const [entrants, setEntrants] = useState<string[]>(DEFAULT_ENTRANTS);
  const [workload, setWorkload] = useState<Workload>('random');
  const [size, setSize] = useState(80);
  const [speed, setSpeed] = useState(8);
  const [seed, setSeed] = useState(1);
  const [stage, setStage] = useState<'setup' | MatchId | 'crowned'>('setup');
  const [runId, setRunId] = useState(0);

  const [semiA, setSemiA] = useState<MatchSlot>({ leftId: entrants[0], rightId: entrants[1], result: null });
  const [semiB, setSemiB] = useState<MatchSlot>({ leftId: entrants[2], rightId: entrants[3], result: null });
  const [final, setFinal] = useState<MatchSlot | null>(null);

  // When entrants change in the setup, reflect into bracket slots.
  useEffect(() => {
    if (stage !== 'setup') return;
    setSemiA({ leftId: entrants[0], rightId: entrants[1], result: null });
    setSemiB({ leftId: entrants[2], rightId: entrants[3], result: null });
    setFinal(null);
  }, [entrants, stage]);

  const input = useMemo(() => generateArray(size, workload, seed), [size, workload, seed]);

  const current: MatchSlot | null =
    stage === 'semi-a' ? semiA : stage === 'semi-b' ? semiB : stage === 'final' ? final : null;

  const beginTournament = () => {
    if (new Set(entrants).size !== entrants.length) return; // require unique entrants
    play('clash');
    setStage('semi-a');
    setRunId((r) => r + 1);
  };

  const restart = () => {
    setSemiA({ leftId: entrants[0], rightId: entrants[1], result: null });
    setSemiB({ leftId: entrants[2], rightId: entrants[3], result: null });
    setFinal(null);
    setStage('setup');
    setRunId(0);
  };

  const advance = () => {
    if (stage === 'semi-a' && semiA.result) {
      play('clash');
      setStage('semi-b');
      setRunId((r) => r + 1);
    } else if (stage === 'semi-b' && semiB.result) {
      play('clash');
      const finalSlot: MatchSlot = {
        leftId: semiA.result!.winnerId,
        rightId: semiB.result!.winnerId,
        result: null,
      };
      setFinal(finalSlot);
      setStage('final');
      setRunId((r) => r + 1);
    } else if (stage === 'final' && final?.result) {
      setStage('crowned');
    }
  };

  // Each finished match populates the next slot via the FighterPanel callbacks.
  const recordMatchResult = (slot: MatchSlot, setter: (s: MatchSlot) => void, leftOps: number, rightOps: number) => {
    if (slot.result) return;
    const leftWins = leftOps <= rightOps;
    setter({
      ...slot,
      result: {
        winnerId: leftWins ? slot.leftId : slot.rightId,
        loserId: leftWins ? slot.rightId : slot.leftId,
        winnerOps: leftWins ? leftOps : rightOps,
        loserOps: leftWins ? rightOps : leftOps,
      },
    });
  };

  const championId =
    stage === 'crowned' && final?.result ? final.result.winnerId : null;
  const champion = championId ? getSort(championId) : null;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-widest uppercase text-parchment">
            Tournament
          </h2>
          <p className="max-w-2xl text-sm text-parchment/70">
            Four beasts. Two semifinals. One throne. The fighter that finishes with fewer
            comparisons takes the round; the loser leaves the arena.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Slider label={`Size · ${size}`} min={20} max={200} value={size} onChange={setSize} disabled={stage !== 'setup'} />
          <Slider label={`Speed · ${speed}x`} min={1} max={40} value={speed} onChange={setSpeed} />
          <label className="flex flex-col gap-1">
            <span className="stat-label">Terrain</span>
            <select
              value={workload}
              onChange={(e) => setWorkload(e.target.value as Workload)}
              disabled={stage !== 'setup'}
              className="rounded-md border border-bone/70 bg-ash px-2 py-1 font-mono text-sm"
            >
              {WORKLOADS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            {stage === 'setup' ? (
              <button className="btn btn-primary" onClick={beginTournament} onMouseEnter={() => play('hover')}>
                Begin Tournament
              </button>
            ) : (
              <button className="btn" onClick={restart} onMouseEnter={() => play('hover')}>
                Reset Bracket
              </button>
            )}
            {stage === 'setup' && (
              <button className="btn" onClick={() => setSeed((s) => s + 1)}>
                Reroll Seed
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {stage === 'setup' && (
            <EntrantPicker entrants={entrants} onChange={setEntrants} />
          )}

          <AnimatePresence mode="wait">
            {current && stage !== 'setup' && stage !== 'crowned' && (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-xs uppercase tracking-[0.4em] text-gold">
                    {stage === 'final' ? 'The Final' : stage === 'semi-a' ? 'Semifinal · I' : 'Semifinal · II'}
                  </div>
                  {current.result && (
                    <button className="btn btn-primary" onClick={advance} onMouseEnter={() => play('hover')}>
                      {stage === 'final' ? 'Crown the Champion' : 'Next Match'}
                    </button>
                  )}
                </div>
                <BracketMatch
                  slot={current}
                  input={input}
                  speed={speed}
                  runId={runId}
                  setter={
                    stage === 'semi-a'
                      ? (s, l, r) => recordMatchResult(s, setSemiA, l, r)
                      : stage === 'semi-b'
                        ? (s, l, r) => recordMatchResult(s, setSemiB, l, r)
                        : (s, l, r) => recordMatchResult(s, (v) => setFinal(v), l, r)
                  }
                />
              </motion.div>
            )}

            {stage === 'crowned' && champion && (
              <motion.div
                key="crowned"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="panel flex flex-col items-center gap-4 border-gold/70 p-10 text-center shadow-glow"
              >
                <div className="font-display text-xs uppercase tracking-[0.5em] text-gold">Champion</div>
                <div className="font-display text-5xl tracking-[0.3em] uppercase text-gold md:text-6xl">
                  {champion.beast.name}
                </div>
                <div className="font-display text-sm tracking-[0.3em] uppercase text-parchment/60">
                  {champion.beast.title}
                </div>
                <p className="max-w-lg text-sm text-parchment/70">
                  {champion.beast.lore}
                </p>
                <button className="btn" onClick={restart} onMouseEnter={() => play('hover')}>
                  Hold Another Tournament
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="flex flex-col gap-4">
          <BracketDiagram semiA={semiA} semiB={semiB} final={final} stage={stage} />
          {champion && <BeastCard beast={champion.beast} />}
        </aside>
      </div>
    </section>
  );
}

function EntrantPicker({ entrants, onChange }: { entrants: string[]; onChange(next: string[]): void }) {
  const update = (i: number, id: string) => {
    const next = entrants.slice();
    next[i] = id;
    onChange(next);
  };
  const duplicates = new Set(entrants).size !== entrants.length;
  return (
    <div className="panel flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="font-display text-xs uppercase tracking-[0.3em] text-parchment/60">Entrants</div>
        {duplicates && (
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-crimson">
            no beast may fight itself — pick four distinct
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {entrants.map((id, i) => (
          <label key={i} className="flex flex-col gap-1">
            <span className="stat-label">Slot {i + 1}</span>
            <select
              value={id}
              onChange={(e) => update(i, e.target.value)}
              className="rounded-md border border-bone/70 bg-ash px-2 py-1 font-mono text-sm"
            >
              {SORT_ALGORITHM_LIST.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.beast.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

function BracketMatch({
  slot,
  input,
  speed,
  runId,
  setter,
}: {
  slot: MatchSlot;
  input: number[];
  speed: number;
  runId: number;
  setter(s: MatchSlot, leftOps: number, rightOps: number): void;
}) {
  const leftAlgo = getSort(slot.leftId);
  const rightAlgo = getSort(slot.rightId);
  const [leftOps, setLeftOps] = useState<number | null>(null);
  const [rightOps, setRightOps] = useState<number | null>(null);

  // Reset captured ops when a new match is engaged.
  useEffect(() => {
    setLeftOps(null);
    setRightOps(null);
  }, [runId]);

  useEffect(() => {
    if (slot.result || leftOps == null || rightOps == null) return;
    setter(slot, leftOps, rightOps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftOps, rightOps]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <FighterPanel
        algo={leftAlgo}
        input={input}
        speed={speed}
        runId={runId}
        paused={false}
        onFinish={(_ms, _steps, comparisons) => setLeftOps(comparisons)}
      />
      <FighterPanel
        algo={rightAlgo}
        input={input}
        speed={speed}
        runId={runId}
        paused={false}
        onFinish={(_ms, _steps, comparisons) => setRightOps(comparisons)}
      />
    </div>
  );
}

function BracketDiagram({
  semiA,
  semiB,
  final,
  stage,
}: {
  semiA: MatchSlot;
  semiB: MatchSlot;
  final: MatchSlot | null;
  stage: 'setup' | MatchId | 'crowned';
}) {
  return (
    <div className="panel flex flex-col gap-3 p-4">
      <div className="font-display text-xs uppercase tracking-[0.3em] text-parchment/60">Bracket</div>
      <BracketMatchRow label="Semifinal I" slot={semiA} active={stage === 'semi-a'} />
      <BracketMatchRow label="Semifinal II" slot={semiB} active={stage === 'semi-b'} />
      <BracketMatchRow label="The Final" slot={final} active={stage === 'final'} />
      {final?.result && (
        <div className="mt-1 border-t border-bone/40 pt-3 text-center font-display text-sm tracking-[0.3em] uppercase text-gold">
          Champion · {getSort(final.result.winnerId).beast.name}
        </div>
      )}
    </div>
  );
}

function BracketMatchRow({
  label,
  slot,
  active,
}: {
  label: string;
  slot: MatchSlot | null;
  active: boolean;
}) {
  return (
    <div
      className={clsx(
        'rounded-md border p-2 transition',
        active ? 'border-crimson/70 bg-crimson/5' : 'border-bone/40',
      )}
    >
      <div className="mb-1 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.25em] text-parchment/50">
        <span>{label}</span>
        {slot?.result && (
          <span className="text-gold">
            {formatOps(slot.result.winnerOps)} vs {formatOps(slot.result.loserOps)}
          </span>
        )}
      </div>
      {slot ? (
        <div className="flex flex-col gap-1">
          <SlotRow id={slot.leftId} won={slot.result?.winnerId === slot.leftId} lost={slot.result?.loserId === slot.leftId} />
          <SlotRow id={slot.rightId} won={slot.result?.winnerId === slot.rightId} lost={slot.result?.loserId === slot.rightId} />
        </div>
      ) : (
        <div className="rounded-md border border-bone/30 px-2 py-1 text-center font-mono text-[0.65rem] uppercase tracking-widest text-parchment/30">
          Awaiting semifinal winners
        </div>
      )}
    </div>
  );
}

function SlotRow({ id, won, lost }: { id: string; won?: boolean; lost?: boolean }) {
  const beast = getSort(id).beast;
  return (
    <div
      className={clsx(
        'flex items-center justify-between rounded border px-2 py-1 font-display text-[0.7rem] uppercase tracking-[0.2em]',
        won && 'border-gold/70 bg-gold/10 text-gold',
        lost && 'border-crimson/30 text-parchment/40 line-through',
        !won && !lost && 'border-bone/50 text-parchment',
      )}
    >
      <span>{beast.name}</span>
      <span className="text-base leading-none" aria-hidden>
        {beast.sigil}
      </span>
    </div>
  );
}

function formatOps(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toString();
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
  disabled,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange(v: number): void;
  disabled?: boolean;
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
        disabled={disabled}
        className="w-40 accent-crimson"
      />
    </label>
  );
}
