// Dijkstra — The Cartographer, Keeper of Distances.
// Weighted shortest path. On a unit-cost grid behaves like a slower BFS but
// the framework is here for future weighted terrains.

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
import { MinHeap } from '@/lib/minHeap';

function* dijkstraSteps(input: PathInput): Generator<PathState> {
  const { grid } = input;
  const n = grid.rows * grid.cols;
  const dist = new Float64Array(n).fill(Infinity);
  const parent = new Int32Array(n).fill(-1);
  const state = makeInitialState(grid);

  dist[grid.start] = 0;
  const pq = new MinHeap<number>();
  pq.push(0, grid.start);
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
      const alt = dist[cur] + 1;
      if (alt < dist[nb]) {
        dist[nb] = alt;
        parent[nb] = cur;
        state.frontier[nb] = 1;
        pq.push(alt, nb);
      }
    }
    yield cloneState(state);
  }

  state.done = true;
  yield cloneState(state);
}

export const dijkstra: PathAlgorithm = {
  id: 'dijkstra',
  category: 'pathfinding',
  beast: beastFor('dijkstra'),
  run(input) {
    let last: PathState | undefined;
    for (const s of dijkstraSteps(input)) last = s;
    return last ?? makeInitialState(input.grid);
  },
  steps: dijkstraSteps,
  worstCaseInput: (size) => ({ grid: generateGrid(size, size * 2, 'sparse-walls', 3) }),
  bestCaseInput: (size) => ({ grid: generateGrid(size, size * 2, 'open') }),
};
