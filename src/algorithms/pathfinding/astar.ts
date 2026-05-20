// A* — The Oracle, Whose Eyes See the End.
// Dijkstra + Manhattan heuristic. Drives the search toward the goal.

import { beastFor } from '@/beasts/lore';
import {
  cloneState,
  makeInitialState,
  manhattan,
  neighbours,
  reconstructPath,
  type PathAlgorithm,
  type PathInput,
  type PathState,
} from './types';
import { generateGrid } from '@/lib/mazeGen';
import { MinHeap } from '@/lib/minHeap';

function* astarSteps(input: PathInput): Generator<PathState> {
  const { grid } = input;
  const n = grid.rows * grid.cols;
  const g = new Float64Array(n).fill(Infinity);
  const parent = new Int32Array(n).fill(-1);
  const state = makeInitialState(grid);

  g[grid.start] = 0;
  const pq = new MinHeap<number>();
  pq.push(manhattan(grid.start, grid.goal, grid.cols), grid.start);
  state.frontier[grid.start] = 1;
  yield cloneState(state);

  while (pq.size() > 0) {
    const cur = pq.pop()!;
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
      const tentativeG = g[cur] + 1;
      if (tentativeG < g[nb]) {
        g[nb] = tentativeG;
        parent[nb] = cur;
        const f = tentativeG + manhattan(nb, grid.goal, grid.cols);
        state.frontier[nb] = 1;
        pq.push(f, nb);
      }
    }
    yield cloneState(state);
  }

  state.done = true;
  yield cloneState(state);
}

export const astar: PathAlgorithm = {
  id: 'astar',
  category: 'pathfinding',
  beast: beastFor('astar'),
  run(input) {
    let last: PathState | undefined;
    for (const s of astarSteps(input)) last = s;
    return last ?? makeInitialState(input.grid);
  },
  steps: astarSteps,
  worstCaseInput: (size) => ({ grid: generateGrid(size, size * 2, 'rooms', 13) }),
  bestCaseInput: (size) => ({ grid: generateGrid(size, size * 2, 'open') }),
};
