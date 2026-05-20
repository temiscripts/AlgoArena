// Depth-First Search — Shadowdelver, Of the Long Corridor.
// Plunges down one path until a wall, then backtracks. No optimality guarantees.

import { beastFor } from '@/beasts/lore';
import {
  cloneState,
  makeInitialState,
  neighbours,
  reconstructPath,
  type PathAlgorithm,
  type PathInput,
  type PathState,
} from './types';
import { generateGrid } from '@/lib/mazeGen';

function* dfsSteps(input: PathInput): Generator<PathState> {
  const { grid } = input;
  const n = grid.rows * grid.cols;
  const parent = new Int32Array(n).fill(-1);
  const state = makeInitialState(grid);

  const stack: number[] = [grid.start];
  state.frontier[grid.start] = 1;
  yield cloneState(state);

  while (stack.length) {
    const cur = stack.pop()!;
    if (state.visited[cur]) continue;
    state.frontier[cur] = 0;
    state.visited[cur] = 1;
    state.current = cur;
    state.expansions++;

    if (cur === grid.goal) {
      state.path = reconstructPath(parent, grid.goal);
      state.pathFound = true;
      state.done = true;
      yield cloneState(state);
      return;
    }

    for (const nb of neighbours(cur, grid)) {
      if (state.visited[nb]) continue;
      if (parent[nb] === -1 && nb !== grid.start) parent[nb] = cur;
      state.frontier[nb] = 1;
      stack.push(nb);
    }
    yield cloneState(state);
  }

  state.done = true;
  yield cloneState(state);
}

export const dfs: PathAlgorithm = {
  id: 'dfs',
  category: 'pathfinding',
  beast: beastFor('dfs'),
  run(input) {
    let last: PathState | undefined;
    for (const s of dfsSteps(input)) last = s;
    return last ?? makeInitialState(input.grid);
  },
  steps: dfsSteps,
  worstCaseInput: (size) => ({ grid: generateGrid(size, size * 2, 'rooms', 11) }),
  bestCaseInput: (size) => ({ grid: generateGrid(size, size * 2, 'open') }),
};
