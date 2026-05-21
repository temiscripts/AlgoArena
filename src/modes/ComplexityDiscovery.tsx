import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SORT_ALGORITHM_LIST, getSort } from '@/algorithms';
import { BeastCard } from '@/components/BeastCard';
import { generateArray } from '@/lib/workloadGen';
import { fitComplexity, type ComplexityClass, type FitResult } from '@/lib/curveFit';
import { play } from '@/lib/sound';

type Scenario = 'best' | 'average' | 'worst';

const SIZES = [10, 30, 100, 300, 800, 1500];

interface SampleRow {
  size: number;
  measured: number;
}

const SCENARIO_LABEL: Record<Scenario, string> = {
  best: 'Best-Case Terrain',
  average: 'Average Terrain',
  worst: 'Worst-Case Terrain',
};

const SCENARIO_BORDER: Record<Scenario, string> = {
  best: 'border-teal/60',
  average: 'border-bone/60',
  worst: 'border-crimson/60',
};

export function ComplexityDiscovery() {
  const [algoId, setAlgoId] = useState('quick');
  const [scenario, setScenario] = useState<Scenario>('average');
  const [samples, setSamples] = useState<SampleRow[] | null>(null);
  const [fit, setFit] = useState<FitResult | null>(null);
  const [running, setRunning] = useState(false);

  const algo = useMemo(() => getSort(algoId), [algoId]);
  const stated: ComplexityClass | null = useMemo(() => {
    const v = algo.beast.complexity[scenario];
    if (v === 'O(log n)' || v === 'O(n)' || v === 'O(n log n)' || v === 'O(n²)') return v;
    return null;
  }, [algo, scenario]);

  const reset = () => {
    setSamples(null);
    setFit(null);
  };

  const inputFor = (size: number): number[] => {
    if (scenario === 'best') return algo.bestCaseInput(size);
    if (scenario === 'worst') return algo.worstCaseInput(size);
    return generateArray(size, 'random', size * 31 + 7);
  };

  const discover = async () => {
    setRunning(true);
    setSamples([]);
    setFit(null);
    play('clash');

    // Yield to the browser between sizes so points appear on the chart one by one.
    const collected: SampleRow[] = [];
    for (let i = 0; i < SIZES.length; i++) {
      const size = SIZES[i];
      const input = inputFor(size);
      const { comparisons } = algo.count(input);
      collected.push({ size, measured: comparisons });
      setSamples([...collected]);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => window.setTimeout(r, 60));
    }

    const result = fitComplexity(
      collected.map((s) => s.size),
      collected.map((s) => s.measured),
    );
    setFit(result);
    setRunning(false);
    play('victory');
  };

  const matchVerdict =
    fit && stated
      ? fit.best.label === stated
        ? 'matches'
        : 'differs'
      : null;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-widest uppercase text-parchment">
            Complexity Discovery
          </h2>
          <p className="max-w-2xl text-sm text-parchment/70">
            Force a beast to fight on six battlefields, each larger than the last. Measure how
            its work grows. Fit the curve. Name the law that binds it.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="stat-label">Beast</span>
            <select
              value={algoId}
              onChange={(e) => {
                setAlgoId(e.target.value);
                reset();
              }}
              disabled={running}
              className="rounded-md border border-bone/70 bg-ash px-2 py-1 font-mono text-sm"
            >
              {SORT_ALGORITHM_LIST.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.beast.algoName} — {a.beast.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="stat-label">Terrain</span>
            <select
              value={scenario}
              onChange={(e) => {
                setScenario(e.target.value as Scenario);
                reset();
              }}
              disabled={running}
              className="rounded-md border border-bone/70 bg-ash px-2 py-1 font-mono text-sm"
            >
              <option value="best">Best Case</option>
              <option value="average">Average Case</option>
              <option value="worst">Worst Case</option>
            </select>
          </label>
          <button
            className="btn btn-primary"
            onClick={discover}
            onMouseEnter={() => play('hover')}
            disabled={running}
          >
            {running ? 'Sampling…' : fit ? 'Run Again' : 'Begin Discovery'}
          </button>
        </div>
      </header>

      <div className={clsx('rounded-md border px-3 py-2 text-xs uppercase tracking-[0.25em]', SCENARIO_BORDER[scenario])}>
        <span className="text-parchment/50">{SCENARIO_LABEL[scenario]} · </span>
        <span className="text-parchment/80">
          Beasts are sampled at sizes {SIZES.join(', ')}; each measurement is the comparison count
          of the algorithm on that input.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <ChartPanel samples={samples ?? []} fit={fit} />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'] as ComplexityClass[]).map((label) => {
              const f = fit?.all.find((x) => x.label === label);
              const isBest = fit && fit.best.label === label;
              return (
                <div
                  key={label}
                  className={clsx(
                    'panel flex flex-col gap-1 px-3 py-2 transition',
                    isBest
                      ? 'border-gold/70 shadow-glow'
                      : f
                        ? 'border-bone/60'
                        : 'border-bone/30 opacity-60',
                  )}
                >
                  <div className="font-display text-xs tracking-widest uppercase text-parchment/70">
                    {label}
                  </div>
                  <div className={clsx('font-mono text-sm tabular-nums', isBest ? 'text-gold' : 'text-parchment/80')}>
                    R² = {f ? f.r2.toFixed(4) : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {fit ? (
              <motion.div
                key="verdict"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-4"
              >
                <Verdict
                  detected={fit.best.label}
                  stated={stated}
                  scenario={scenario}
                  matchVerdict={matchVerdict}
                  r2={fit.best.r2}
                />
                <BeastCard beast={algo.beast} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="panel flex flex-col gap-3 p-5 text-sm text-parchment/70"
              >
                <div className="font-display text-lg tracking-widest uppercase text-parchment">
                  The Method
                </div>
                <p>
                  Six samples are not enough to prove a theorem. They are enough to glimpse the
                  shape. Watch the curve bend — that bend is the cost of the algorithm itself,
                  laid bare.
                </p>
                <ul className="flex flex-col gap-1 font-mono text-[0.7rem] text-parchment/50">
                  <li>O(log n) — bends almost flat as n grows.</li>
                  <li>O(n) — a straight line through the origin.</li>
                  <li>O(n log n) — a near-straight line, kinked upward.</li>
                  <li>O(n²) — a sharp curve, doubling on doubling.</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </section>
  );
}

interface ChartProps {
  samples: SampleRow[];
  fit: FitResult | null;
}

function ChartPanel({ samples, fit }: ChartProps) {
  const data = useMemo(() => {
    // Densify x-axis: union of sampled sizes + interpolated ticks for smooth curves.
    const sizes = samples.length > 0 ? samples.map((s) => s.size) : SIZES;
    const denseSizes: number[] = [];
    if (sizes.length > 0) {
      const min = Math.min(...sizes);
      const max = Math.max(...sizes);
      for (let i = 0; i <= 60; i++) {
        denseSizes.push(min + ((max - min) * i) / 60);
      }
    }
    return denseSizes.map((n) => {
      const measured = samples.find((s) => Math.abs(s.size - n) < 0.5)?.measured ?? null;
      const row: Record<string, number | null> = { size: Math.round(n), measured };
      if (fit) {
        fit.all.forEach((f) => {
          row[f.label] = Math.max(0, f.predict(n));
        });
      }
      return row;
    });
  }, [samples, fit]);

  const lineColor: Record<ComplexityClass, string> = {
    'O(log n)': '#5fb3a1',
    'O(n)': '#9aa4ad',
    'O(n log n)': '#d4af37',
    'O(n²)': '#c4322b',
  };

  return (
    <div className="panel h-72 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid stroke="#3a3a44" strokeDasharray="2 4" />
          <XAxis
            dataKey="size"
            tick={{ fill: '#a8a294', fontSize: 11 }}
            stroke="#3a3a44"
            type="number"
            domain={['dataMin', 'dataMax']}
            label={{ value: 'input size n', position: 'insideBottom', offset: -4, fill: '#a8a294', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: '#a8a294', fontSize: 11 }}
            stroke="#3a3a44"
            tickFormatter={(v) => formatOps(Number(v))}
            label={{ value: 'comparisons', angle: -90, position: 'insideLeft', fill: '#a8a294', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: '#1c1c24', border: '1px solid #3a3a44', fontFamily: 'JetBrains Mono', fontSize: 12 }}
            labelStyle={{ color: '#d4af37' }}
            formatter={(value, name) => {
              if (value == null) return ['—', name];
              const n = Array.isArray(value) ? Number(value[0]) : Number(value);
              return [formatOps(n), name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
          {fit &&
            fit.all.map((f) => (
              <Line
                key={f.label}
                type="monotone"
                dataKey={f.label}
                stroke={lineColor[f.label]}
                strokeWidth={fit.best.label === f.label ? 2.5 : 1}
                strokeOpacity={fit.best.label === f.label ? 1 : 0.45}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          <Line
            type="monotone"
            dataKey="measured"
            stroke="#e8e3d3"
            strokeWidth={0}
            dot={{ r: 4, fill: '#e8e3d3' }}
            activeDot={{ r: 6, fill: '#d4af37' }}
            isAnimationActive={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatOps(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toFixed(0);
}

function Verdict({
  detected,
  stated,
  scenario,
  matchVerdict,
  r2,
}: {
  detected: ComplexityClass;
  stated: ComplexityClass | null;
  scenario: Scenario;
  matchVerdict: 'matches' | 'differs' | null;
  r2: number;
}) {
  const good = matchVerdict === 'matches';
  return (
    <div className={clsx('panel p-4', good ? 'border-gold/60 shadow-glow' : 'border-crimson/60')}>
      <div className={clsx('font-display text-lg tracking-widest uppercase', good ? 'text-gold' : 'text-crimson')}>
        {good ? 'Law Confirmed' : 'A Twist of Cost'}
      </div>
      <div className="mt-2 font-mono text-2xl tracking-wide text-parchment">
        Detected · {detected}
      </div>
      <div className="mt-1 text-xs text-parchment/60">
        R² = {r2.toFixed(4)} · matches {SCENARIO_LABEL[scenario].toLowerCase()}
        {stated && (
          <>
            {' · '}beast claims <span className="font-mono text-parchment">{stated}</span>
          </>
        )}
      </div>
      {!good && stated && (
        <p className="mt-3 text-sm text-parchment/80">
          The beast's stated law and the curve disagree. Read the chart — sometimes the chosen
          terrain doesn't push the algorithm hard enough to reveal its true cost, or the
          constant factors dominate at this scale.
        </p>
      )}
      {good && (
        <p className="mt-3 text-sm text-parchment/80">
          The fit is true. At these sizes the beast's growth is unmistakably {detected.toLowerCase()}.
        </p>
      )}
    </div>
  );
}
