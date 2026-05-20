import type { Grid } from '@/algorithms/pathfinding/types';
import { idx } from '@/algorithms/pathfinding/types';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type MazeStyle = 'open' | 'sparse-walls' | 'dense-walls' | 'rooms';

export function emptyGrid(rows: number, cols: number): Grid {
  return {
    rows,
    cols,
    walls: new Array(rows * cols).fill(false),
    start: idx(Math.floor(rows / 2), 1, cols),
    goal: idx(Math.floor(rows / 2), cols - 2, cols),
  };
}

export function generateGrid(rows: number, cols: number, style: MazeStyle, seed = 1): Grid {
  const rng = mulberry32(seed);
  const grid = emptyGrid(rows, cols);
  const wallProb =
    style === 'open' ? 0 : style === 'sparse-walls' ? 0.18 : style === 'dense-walls' ? 0.32 : 0;

  for (let i = 0; i < grid.walls.length; i++) {
    if (i === grid.start || i === grid.goal) continue;
    if (style === 'rooms') {
      const r = Math.floor(i / cols);
      const c = i % cols;
      // Horizontal walls every 4 rows with random gaps.
      if (r % 4 === 0 && r !== 0 && r !== rows - 1) {
        grid.walls[i] = rng() > 0.25;
      } else if (c % 6 === 0 && c !== 0 && c !== cols - 1) {
        grid.walls[i] = rng() > 0.25;
      }
    } else if (wallProb > 0 && rng() < wallProb) {
      grid.walls[i] = true;
    }
  }

  // Always carve out cells adjacent to start/goal so they have at least one exit.
  const carve = (ix: number) => {
    const cellsToFree = [ix - 1, ix + 1, ix - cols, ix + cols];
    for (const c of cellsToFree) {
      if (c >= 0 && c < grid.walls.length) grid.walls[c] = false;
    }
  };
  carve(grid.start);
  carve(grid.goal);

  return grid;
}
