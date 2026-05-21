import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PATH_ALGORITHM_LIST, getPath } from '@/algorithms';
import { PathFighter } from './PathFighter';
import { GridCanvas } from './GridCanvas';
import { generateGrid, type MazeStyle } from '@/lib/mazeGen';
import { makeInitialState, type Grid } from '@/algorithms/pathfinding/types';
import { play } from '@/lib/sound';
import { buildShareUrl, copyText, readBattleFromHash } from '@/lib/battleUrl';
import { ArenaHint } from '@/components/ArenaHint';
import { InfoButton } from '@/components/InfoButton';

const STYLES: { id: MazeStyle; label: string }[] = [
  { id: 'open', label: 'Open Field' },
  { id: 'sparse-walls', label: 'Sparse Walls' },
  { id: 'dense-walls', label: 'Dense Walls' },
  { id: 'rooms', label: 'Rooms' },
];

const ROWS = 22;
const COLS = 38;

const initialPathBattle = typeof window !== 'undefined' ? readBattleFromHash() : null;
const initialPath = initialPathBattle?.mode === 'path' ? initialPathBattle : null;

export function PathfindingArena() {
  const [leftId, setLeftId] = useState(initialPath?.left ?? 'astar');
  const [rightId, setRightId] = useState(initialPath?.right ?? 'dijkstra');
  const [style, setStyle] = useState<MazeStyle>(initialPath?.style ?? 'sparse-walls');
  const [seed, setSeed] = useState(initialPath?.seed ?? 1);
  const [speed, setSpeed] = useState(initialPath?.speed ?? 2);
  const [runId, setRunId] = useState(0);
  const [paused, setPaused] = useState(false);
  const [editing, setEditing] = useState(false);
  const [leftFinish, setLeftFinish] = useState<null | { ms: number; expansions: number; pathLen: number; found: boolean }>(null);
  const [rightFinish, setRightFinish] = useState<null | { ms: number; expansions: number; pathLen: number; found: boolean }>(null);
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const autoEngagedRef = useRef(false);

  const [gridOverride, setGridOverride] = useState<Grid | null>(null);
  const baseGrid = useMemo(() => generateGrid(ROWS, COLS, style, seed), [style, seed]);
  const grid = gridOverride ?? baseGrid;

  const leftAlgo = useMemo(() => getPath(leftId), [leftId]);
  const rightAlgo = useMemo(() => getPath(rightId), [rightId]);

  const input = useMemo(() => ({ grid }), [grid]);

  const startRace = () => {
    setLeftFinish(null);
    setRightFinish(null);
    setPaused(false);
    setEditing(false);
    setRunId((r) => r + 1);
    play('clash');
  };

  useEffect(() => {
    if (autoEngagedRef.current || !initialPath) return;
    autoEngagedRef.current = true;
    startRace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    const url = buildShareUrl({
      mode: 'path',
      left: leftId,
      right: rightId,
      style,
      seed,
      speed,
    });
    const ok = await copyText(url);
    setCopyState(ok ? 'ok' : 'fail');
    window.setTimeout(() => setCopyState('idle'), 1800);
  };

  const newMaze = () => {
    setSeed((s) => s + 1);
    setGridOverride(null);
    setRunId(0);
    setLeftFinish(null);
    setRightFinish(null);
  };

  const clearOverrides = () => {
    setGridOverride(null);
    setRunId(0);
    setLeftFinish(null);
    setRightFinish(null);
  };

  const toggleWall = useCallback(
    (cellIndex: number) => {
      const next: Grid = {
        ...grid,
        walls: grid.walls.slice(),
      };
      next.walls[cellIndex] = !next.walls[cellIndex];
      setGridOverride(next);
      setRunId(0);
      setLeftFinish(null);
      setRightFinish(null);
    },
    [grid],
  );

  // Summary panel content — both panels finished. Spelled out as a learning moment.
  const summary = (() => {
    if (!leftFinish || !rightFinish) return null;
    const leftLabel = `${leftAlgo.beast.name} (${leftAlgo.beast.algoName})`;
    const rightLabel = `${rightAlgo.beast.name} (${rightAlgo.beast.algoName})`;

    if (!leftFinish.found && !rightFinish.found) {
      return {
        headline: 'Neither beast reached the goal.',
        body: 'The walls cut every route between the start and the end. Lift some walls or pick a less hostile maze.',
        tone: 'crimson' as const,
      };
    }
    if (leftFinish.found !== rightFinish.found) {
      const winner = leftFinish.found ? leftLabel : rightLabel;
      return {
        headline: `${winner} found the only path.`,
        body: 'Only one beast actually reached the goal. The other gave up — try a different maze if that surprises you.',
        tone: 'gold' as const,
      };
    }
    if (leftFinish.expansions === rightFinish.expansions) {
      return {
        headline: 'Both beasts touched the same number of cells.',
        body: 'On this maze the two algorithms had no efficiency advantage over each other.',
        tone: 'gold' as const,
      };
    }
    const leftWins = leftFinish.expansions < rightFinish.expansions;
    const winnerFin = leftWins ? leftFinish : rightFinish;
    const loserFin = leftWins ? rightFinish : leftFinish;
    const winner = leftWins ? leftLabel : rightLabel;
    const loser = leftWins ? rightLabel : leftLabel;
    const ratio = loserFin.expansions / Math.max(1, winnerFin.expansions);
    const ratioText = ratio >= 2 ? ` — ${ratio.toFixed(1)}× more efficient` : '';
    return {
      headline: `${winner} explored ${winnerFin.expansions.toLocaleString()} cells to find a path of length ${winnerFin.pathLen}. ${loser} explored ${loserFin.expansions.toLocaleString()} cells${ratioText}.`,
      body: ratio >= 2
        ? `${winner} reached the same goal touching far fewer cells. That is the lesson of pathfinding — fewer explored cells = less work for the same answer.`
        : `The two algorithms were close in efficiency on this maze. Try Open Field for the biggest visual gap, or a denser maze for a different lesson.`,
      tone: 'gold' as const,
    };
  })();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-3xl tracking-widest uppercase text-parchment">
              Pathfinding Arena
            </h2>
            <InfoButton id="pathfinding" title="What am I seeing?">
              <p>
                Two pathfinding algorithms race through the same maze. Each beast represents a
                classic algorithm — pick any two and watch them search.
              </p>
              <p>
                <span className="text-parchment">Yellow / coloured cells</span> show where each
                algorithm has searched. The <span className="text-gold">white-gold line</span> at
                the end is the final path. The <span className="text-teal">teal cell</span> is the
                start; the <span className="text-crimson">crimson cell</span> is the goal.
              </p>
              <p>
                <span className="text-parchment">A* (The Oracle)</span> uses a heuristic to head
                straight toward the goal. <span className="text-parchment">Dijkstra</span>{' '}
                explores all directions equally by distance. <span className="text-parchment">BFS</span>{' '}
                floods in waves. <span className="text-parchment">DFS</span> dives down one corridor
                at a time. Watch how A* usually explores far fewer cells to find the same path.
              </p>
            </InfoButton>
          </div>
          <p className="text-sm text-parchment/60">
            Same maze. Same goal. Different minds. Click cells in the editor below to lay walls.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <Slider
            label={`Speed · ${speed}x`}
            min={1}
            max={20}
            value={speed}
            onChange={setSpeed}
          />
          <div className="flex flex-col gap-1">
            <span className="stat-label">Maze</span>
            <select
              value={style}
              onChange={(e) => {
                setStyle(e.target.value as MazeStyle);
                setGridOverride(null);
                setRunId(0);
                setLeftFinish(null);
                setRightFinish(null);
              }}
              className="rounded-md border border-bone/70 bg-ash px-2 py-1 font-mono text-sm"
            >
              {STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
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
            <button className="btn" onClick={newMaze}>
              New Maze
            </button>
            <button
              className="btn"
              onClick={handleShare}
              title="Copy a shareable URL that replays this maze + beasts"
            >
              {copyState === 'ok' ? 'Copied ✓' : copyState === 'fail' ? 'Copy Failed' : 'Share Battle'}
            </button>
          </div>
        </div>
      </header>

      <ArenaHint
        id="pathfinding-intro"
        message="Each algorithm is represented as a beast. Pick two below and watch them search the same maze — coloured cells are explored, the gold line is the final path."
        externalDismissCount={runId}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Picker label="Left" value={leftId} onChange={setLeftId} />
        <Picker label="Right" value={rightId} onChange={setRightId} />
        <button
          className="btn"
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? 'Done Editing' : 'Edit Walls'}
        </button>
        {gridOverride && (
          <button className="btn" onClick={clearOverrides}>
            Clear Edits
          </button>
        )}
      </div>

      <ColorLegend />

      {editing ? (
        <div className="panel flex flex-col gap-3 p-4">
          <div className="text-[0.65rem] uppercase tracking-[0.25em] text-parchment/60">
            Drag to draw walls. Click a wall to remove it. Teal cell is the start, crimson is the goal.
          </div>
          <GridCanvas
            grid={grid}
            state={makeInitialState(grid)}
            accent="gold"
            cellPx={20}
            editable
            onToggleWall={toggleWall}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <PathFighter
            algo={leftAlgo}
            input={input}
            speed={speed}
            runId={runId}
            paused={paused}
            onFinish={(ms, _steps, expansions, pathLen, found) =>
              setLeftFinish({ ms, expansions, pathLen, found })
            }
          />
          <PathFighter
            algo={rightAlgo}
            input={input}
            speed={speed}
            runId={runId}
            paused={paused}
            onFinish={(ms, _steps, expansions, pathLen, found) =>
              setRightFinish({ ms, expansions, pathLen, found })
            }
          />
        </div>
      )}

      {summary && !editing && (
        <div className={
          summary.tone === 'crimson'
            ? 'panel border-crimson/60 p-4'
            : 'panel border-gold/60 p-4 shadow-glow'
        }>
          <div className={
            summary.tone === 'crimson'
              ? 'font-display text-xs uppercase tracking-[0.3em] text-crimson'
              : 'font-display text-xs uppercase tracking-[0.3em] text-gold'
          }>
            Race summary
          </div>
          <div className="mt-2 text-sm text-parchment">{summary.headline}</div>
          <p className="mt-2 text-sm leading-relaxed text-parchment/70">{summary.body}</p>
        </div>
      )}
    </section>
  );
}

function ColorLegend() {
  const items: { label: string; meaning: string; swatch: string; ring?: string }[] = [
    { label: 'Start', meaning: 'Where the search begins', swatch: '#5fb3a1' },
    { label: 'Goal', meaning: 'Where it must reach', swatch: '#c4322b' },
    { label: 'Wall', meaning: 'Impassable cell', swatch: '#3a3a44' },
    { label: 'Unexplored', meaning: 'Not yet visited', swatch: '#1a1a22', ring: 'border-bone/40' },
    { label: 'Explored', meaning: 'Algorithm has checked here', swatch: '#3d3210' },
    { label: 'Final path', meaning: 'Route from start to goal', swatch: '#d4af37' },
  ];
  return (
    <div className="panel grid grid-cols-2 gap-2 p-3 text-xs md:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          <span
            className={`inline-block h-4 w-4 rounded-sm border ${it.ring ?? 'border-transparent'}`}
            style={{ background: it.swatch }}
            aria-hidden
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[0.65rem] uppercase tracking-[0.2em] text-parchment">
              {it.label}
            </span>
            <span className="font-mono text-[0.6rem] text-parchment/50">{it.meaning}</span>
          </span>
        </div>
      ))}
    </div>
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
        {PATH_ALGORITHM_LIST.map((a) => (
          <option key={a.id} value={a.id}>
            {a.beast.algoName} — {a.beast.name}
          </option>
        ))}
      </select>
    </label>
  );
}
