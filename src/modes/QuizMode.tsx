import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { SORT_ALGORITHM_LIST } from '@/algorithms';
import type { SortAlgorithm, SortState } from '@/algorithms/types';
import { useStepper } from '@/lib/stepper';
import { SortCanvas } from '@/arenas/SortCanvas';
import { BeastCard } from '@/components/BeastCard';
import { generateArray } from '@/lib/workloadGen';
import { play } from '@/lib/sound';

type Scenario = 'best' | 'average' | 'worst';

interface Round {
  algo: SortAlgorithm;
  scenario: Scenario;
  input: number[];
  correct: string;
}

const OPTIONS = ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];

const SCENARIO_COPY: Record<Scenario, { tag: string; flavor: string }> = {
  best: {
    tag: 'Friendly Terrain',
    flavor: 'The beast walks ground that suits it. What is its cost here?',
  },
  average: {
    tag: 'Common Battleground',
    flavor: 'An ordinary, unsorted field. How fast does the beast move?',
  },
  worst: {
    tag: 'Cursed Ground',
    flavor: 'The beast meets its nightmare. How badly does it suffer?',
  },
};

const SCENARIO_BORDER: Record<Scenario, string> = {
  best: 'border-teal/60',
  average: 'border-bone/60',
  worst: 'border-crimson/60',
};

const ROUND_SIZE = 70;
const QUIZ_SPEED = 6;

function pickRound(prev?: Round): Round {
  const scenarios: Scenario[] = ['best', 'average', 'worst'];
  let algo: SortAlgorithm;
  let scenario: Scenario;
  // Don't repeat the same (algo, scenario) twice in a row.
  do {
    algo = SORT_ALGORITHM_LIST[Math.floor(Math.random() * SORT_ALGORITHM_LIST.length)];
    scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  } while (prev && prev.algo.id === algo.id && prev.scenario === scenario);

  const input =
    scenario === 'best'
      ? algo.bestCaseInput(ROUND_SIZE)
      : scenario === 'worst'
        ? algo.worstCaseInput(ROUND_SIZE)
        : generateArray(ROUND_SIZE, 'random', Date.now() & 0xffff);

  const correct = algo.beast.complexity[scenario];

  return { algo, scenario, input, correct };
}

export function QuizMode() {
  const [round, setRound] = useState<Round | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  const [guess, setGuess] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const factory = useMemo(
    () => (round ? () => round.algo.steps(round.input) : null),
    [round],
  );

  const initialState = useMemo<SortState>(
    () => ({
      array: round?.input.slice() ?? [],
      comparisons: 0,
      writes: 0,
      done: false,
      highlights: {},
    }),
    [round],
  );

  const handle = useStepper<SortState>({
    factory: factory ?? (() => emptyGenerator()),
    initialState,
    speed: QUIZ_SPEED,
  });

  useEffect(() => {
    handle.reset();
    if (round) handle.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey]);

  const newRound = () => {
    setRound((prev) => pickRound(prev ?? undefined));
    setRoundKey((k) => k + 1);
    setGuess(null);
    play('clash');
  };

  const submitGuess = (choice: string) => {
    if (!round || guess) return;
    setGuess(choice);
    setTotalCount((t) => t + 1);
    if (choice === round.correct) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      play('victory');
    } else {
      setStreak(0);
      play('growl');
    }
  };

  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-widest uppercase text-parchment">
            Big-O Trial
          </h2>
          <p className="max-w-2xl text-sm text-parchment/70">
            An unnamed beast steps into the arena. Watch it move. Wager on the law of cost that
            binds it. Read it right and the streak grows.
          </p>
        </div>
        <div className="flex items-stretch gap-2">
          <ScoreTile label="Score" value={`${correctCount}/${totalCount}`} accent="gold" />
          <ScoreTile label="Streak" value={streak.toString()} accent={streak >= 3 ? 'crimson' : 'teal'} />
          <ScoreTile label="Best" value={bestStreak.toString()} accent="gold" />
          <ScoreTile label="Acc" value={`${accuracy}%`} accent="teal" />
        </div>
      </header>

      {!round ? (
        <EmptyState onBegin={newRound} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            <div
              className={clsx(
                'rounded-md border px-3 py-2 text-xs uppercase tracking-[0.25em]',
                SCENARIO_BORDER[round.scenario],
              )}
            >
              <span className="text-parchment/50">{SCENARIO_COPY[round.scenario].tag} · </span>
              <span className="text-parchment/80">{SCENARIO_COPY[round.scenario].flavor}</span>
            </div>
            <MysteryPanel
              state={handle.state}
              isDone={handle.isDone}
              comparisons={handle.state.comparisons}
              writes={handle.state.writes}
              elapsedMs={handle.elapsedMs}
              revealed={Boolean(guess)}
              algo={round.algo}
            />

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {OPTIONS.map((opt) => {
                const isPicked = guess === opt;
                const isCorrect = opt === round.correct;
                const reveal = Boolean(guess);
                return (
                  <button
                    key={opt}
                    onClick={() => submitGuess(opt)}
                    disabled={Boolean(guess)}
                    className={clsx(
                      'btn flex h-14 items-center justify-center text-sm tracking-widest',
                      !reveal && 'hover:border-gold/70',
                      reveal && isCorrect && 'border-gold bg-gold/20 text-gold shadow-glow',
                      reveal && !isCorrect && isPicked && 'border-crimson bg-crimson/20 text-crimson',
                      reveal && !isCorrect && !isPicked && 'opacity-40',
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {guess ? (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col gap-4"
                >
                  <Verdict
                    correct={guess === round.correct}
                    guess={guess}
                    answer={round.correct}
                    explanation={buildExplanation(round)}
                  />
                  <BeastCard beast={round.algo.beast} />
                  <button className="btn btn-primary" onClick={newRound}>
                    Summon Next Beast
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="concealed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="panel flex flex-col gap-3 p-5 text-sm text-parchment/70"
                >
                  <div className="font-display text-lg tracking-widest uppercase text-parchment">
                    The Wager
                  </div>
                  <p>
                    The terrain has been chosen. The beast is at work. Tap a complexity to
                    place your bet — the right call adds to your streak; a wrong one ends it.
                  </p>
                  <ul className="flex flex-col gap-1 font-mono text-[0.7rem] text-parchment/50">
                    <li>O(log n) — halves the field each step.</li>
                    <li>O(n) — touches every element once.</li>
                    <li>O(n log n) — sorts as fast as comparison allows.</li>
                    <li>O(n²) — pairs every element against every other.</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      )}
    </section>
  );
}

function emptyGenerator(): Generator<SortState> {
  return (function* () {})();
}

function ScoreTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'crimson' | 'gold' | 'teal';
}) {
  const borderAccent =
    accent === 'crimson'
      ? 'border-crimson/60'
      : accent === 'gold'
        ? 'border-gold/60'
        : 'border-teal/60';
  return (
    <div className={clsx('panel min-w-[5rem] px-3 py-2 text-center', borderAccent)}>
      <div className="stat-label">{label}</div>
      <div className="stat-value tabular-nums">{value}</div>
    </div>
  );
}

function EmptyState({ onBegin }: { onBegin(): void }) {
  return (
    <div className="panel flex flex-col items-center gap-4 p-10 text-center">
      <div className="font-display text-4xl tracking-[0.3em] uppercase text-crimson">
        ???
      </div>
      <p className="max-w-xl text-sm text-parchment/70">
        Step into the trial. A mystery beast will sort an array in front of you. Read its
        movement, weigh the chaos, and bet on the law of cost that governs it.
      </p>
      <button className="btn btn-primary" onClick={onBegin}>
        Summon a Beast
      </button>
    </div>
  );
}

interface MysteryPanelProps {
  state: SortState;
  isDone: boolean;
  comparisons: number;
  writes: number;
  elapsedMs: number;
  revealed: boolean;
  algo: SortAlgorithm;
}

function MysteryPanel({ state, isDone, comparisons, writes, elapsedMs, revealed, algo }: MysteryPanelProps) {
  return (
    <div
      className={clsx(
        'panel flex flex-col gap-3 p-4',
        revealed ? `border-gold/40 shadow-glow` : 'border-bone/60',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl text-parchment/50" aria-hidden>
            {revealed ? algo.beast.sigil : '???'}
          </span>
          <div className="min-w-0">
            <div className="font-display text-sm tracking-widest uppercase text-parchment">
              {revealed ? algo.beast.name : 'Unnamed Beast'}
            </div>
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-parchment/40">
              {revealed ? algo.beast.title : 'Identity Concealed'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <Stat label="Compares" value={comparisons.toLocaleString()} />
          <Stat label="Writes" value={writes.toLocaleString()} />
          <Stat
            label={isDone ? 'Time' : 'Elapsed'}
            value={`${elapsedMs.toFixed(0)}ms`}
            highlight={isDone}
          />
        </div>
      </div>
      <SortCanvas state={state} accent={revealed ? algo.beast.accent : 'gold'} />
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-right leading-tight">
      <div className="stat-label">{label}</div>
      <div className={clsx('stat-value tabular-nums', highlight && 'text-gold')}>{value}</div>
    </div>
  );
}

function Verdict({
  correct,
  guess,
  answer,
  explanation,
}: {
  correct: boolean;
  guess: string;
  answer: string;
  explanation: string;
}) {
  return (
    <div
      className={clsx(
        'panel p-4',
        correct ? 'border-gold/60 shadow-glow' : 'border-crimson/60',
      )}
    >
      <div
        className={clsx(
          'font-display text-lg tracking-widest uppercase',
          correct ? 'text-gold' : 'text-crimson',
        )}
      >
        {correct ? 'A True Read' : 'Misjudged'}
      </div>
      <p className="mt-1 text-xs text-parchment/60">
        You wagered <span className="font-mono text-parchment">{guess}</span> ·
        truth was <span className="font-mono text-parchment">{answer}</span>
      </p>
      <p className="mt-3 text-sm text-parchment/80">{explanation}</p>
    </div>
  );
}

function buildExplanation(round: Round): string {
  const { algo, scenario } = round;
  const baseByAlgo: Record<string, string> = {
    bubble:
      'Bubblesnail compares every neighbour, pass after pass. On an already-sorted array it makes one clean sweep and quits — O(n). On chaos, the passes never end and it pairs every element with every other — O(n²).',
    insertion:
      'Cardweaver slides each new card into its place among the sorted ones. If the deck is already in order, every card stops on its first comparison — O(n). On reverse order, every card walks all the way to the front — O(n²).',
    merge:
      'The Twin Wyrms split the array in half, half again, half again — log n levels deep. Each level touches every element. Result is the same on any input: O(n log n).',
    quick:
      'Lightning Adder picks a pivot and cleaves the array in two. With a balanced pivot the recursion is log n deep and each level scans n — O(n log n). With a degenerate pivot (already-sorted last-element) one side is always empty and it degrades to O(n²).',
    heap:
      "The Pyrelord builds a max-heap (O(n)) then extracts log n times, each extraction sifting down log n more. Total O(n log n) on every input — no best, no worst, the throne is the throne.",
  };
  const scenarioPhrase: Record<Scenario, string> = {
    best: 'On its friendliest terrain',
    average: 'On a typical, unsorted field',
    worst: 'On its cursed ground',
  };
  return `${scenarioPhrase[scenario]} the answer is ${algo.beast.complexity[scenario]}. ${baseByAlgo[algo.id] ?? ''}`;
}
