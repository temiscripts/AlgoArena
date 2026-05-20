// Breadth-First Search — Tidecaller, Of the Hundred Mouths.
// Unweighted shortest path. Floods the grid in equal measure.

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

function* bfsSteps(input: PathInput): Generator<PathState> {
  const { grid } = input;
  const n = grid.rows * grid.cols;
  const parent = new Int32Array(n).fill(-1);
  const state = makeInitialState(grid);

  const queue: number[] = [grid.start];
  state.frontier[grid.start] = 1;
  yield cloneState(state);

  while (queue.length) {
    const cur = queue.shift()!;
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
      if (state.visited[nb] || state.frontier[nb]) continue;
      parent[nb] = cur;
      state.frontier[nb] = 1;
      queue.push(nb);
    }
    yield cloneState(state);
  }

  state.done = true;
  yield cloneState(state);
}

export const bfs: PathAlgorithm = {
  id: 'bfs',
  category: 'pathfinding',
  beast: beastFor('bfs'),
  run(input) {
    let last: PathState | undefined;
    for (const s of bfsSteps(input)) last = s;
    return last ?? makeInitialState(input.grid);
  },
  steps: bfsSteps,
  worstCaseInput: (size) => ({ grid: generateGrid(size, size * 2, 'dense-walls', 7) }),
  bestCaseInput: (size) => ({ grid: generateGrid(size, size * 2, 'open') }),
};
