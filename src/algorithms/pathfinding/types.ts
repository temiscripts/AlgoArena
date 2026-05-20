import type { Algorithm } from '../types';

export interface Grid {
  rows: number;
  cols: number;
  walls: boolean[];
  start: number;
  goal: number;
}

export interface PathInput {
  grid: Grid;
}

export interface PathState {
  visited: Uint8Array;
  frontier: Uint8Array;
  current: number | null;
  path: number[];
  expansions: number;
  pathFound: boolean;
  done: boolean;
}

export type PathAlgorithm = Algorithm<PathInput, PathState>;

export const idx = (r: number, c: number, cols: number) => r * cols + c;
export const rowOf = (i: number, cols: number) => Math.floor(i / cols);
export const colOf = (i: number, cols: number) => i % cols;

export function neighbours(i: number, grid: Grid): number[] {
  const r = rowOf(i, grid.cols);
  const c = colOf(i, grid.cols);
  const out: number[] = [];
  const push = (rr: number, cc: number) => {
    if (rr < 0 || cc < 0 || rr >= grid.rows || cc >= grid.cols) return;
    const ni = idx(rr, cc, grid.cols);
    if (grid.walls[ni]) return;
    out.push(ni);
  };
  push(r - 1, c);
  push(r + 1, c);
  push(r, c - 1);
  push(r, c + 1);
  return out;
}

export function manhattan(a: number, b: number, cols: number): number {
  return Math.abs(rowOf(a, cols) - rowOf(b, cols)) + Math.abs(colOf(a, cols) - colOf(b, cols));
}

export function makeInitialState(grid: Grid): PathState {
  const n = grid.rows * grid.cols;
  return {
    visited: new Uint8Array(n),
    frontier: new Uint8Array(n),
    current: null,
    path: [],
    expansions: 0,
    pathFound: false,
    done: false,
  };
}

export function reconstructPath(parent: Int32Array, goal: number): number[] {
  const out: number[] = [];
  let cur = goal;
  while (cur !== -1) {
    out.push(cur);
    cur = parent[cur];
  }
  return out.reverse();
}

export function cloneState(s: PathState): PathState {
  return {
    visited: s.visited.slice(),
    frontier: s.frontier.slice(),
    current: s.current,
    path: s.path.slice(),
    expansions: s.expansions,
    pathFound: s.pathFound,
    done: s.done,
  };
}
