import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PATH_ALGORITHM_LIST, getPath } from '@/algorithms';
import { PathFighter } from './PathFighter';
import { GridCanvas } from './GridCanvas';
import { generateGrid, type MazeStyle } from '@/lib/mazeGen';
import { makeInitialState, type Grid } from '@/algorithms/pathfinding/types';
import { play } from '@/lib/sound';
import { buildShareUrl, copyText, readBattleFromHash } from '@/lib/battleUrl';

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
  const [speed, setSpeed] = useState(initialPath?.speed ?? 4);
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

  // Verdict: prefer the explorer that touched fewer cells; tie-break on time.
  let verdict: string | null = null;
  if (leftFinish && rightFinish) {
    if (!leftFinish.found && !rightFinish.found) {
      verdict = 'Neither beast reached the goal.';
    } else if (leftFinish.found && !rightFinish.found) {
      verdict = `${leftAlgo.beast.name} found the only path.`;
    } else if (!leftFinish.found && rightFinish.found) {
      verdict = `${rightAlgo.beast.name} found the only path.`;
    } else if (leftFinish.expansions < rightFinish.expansions) {
      verdict = `${leftAlgo.beast.name} reached the goal exploring ${rightFinish.expansions - leftFinish.expansions} fewer cells.`;
    } else if (rightFinish.expansions < leftFinish.expansions) {
      verdict = `${rightAlgo.beast.name} reached the goal exploring ${leftFinish.expansions - rightFinish.expansions} fewer cells.`;
    } else {
      verdict = 'Both beasts touched the same number of cells.';
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-widest uppercase text-parchment">
            Pathfinding Arena
          </h2>
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
        {verdict && (
          <div className="ml-auto font-display text-sm tracking-widest uppercase text-gold">
            {verdict}
          </div>
        )}
      </div>

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
        {PATH_ALGORITHM_LIST.map((a) => (
          <option key={a.id} value={a.id}>
            {a.beast.name}
          </option>
        ))}
      </select>
    </label>
  );
}
