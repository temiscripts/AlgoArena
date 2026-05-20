// Heap Sort — The Pyrelord, Crowned in Ash.
// O(n log n) guaranteed. Builds a max-heap, then plucks the largest in turn.

import { beastFor } from '@/beasts/lore';
import type { SortAlgorithm, SortState } from '../types';
import { generateArray } from '@/lib/workloadGen';

function* heapSteps(input: number[]): Generator<SortState> {
  const arr = input.slice();
  const n = arr.length;
  const state: SortState = {
    array: arr.slice(),
    comparisons: 0,
    writes: 0,
    done: false,
    highlights: {},
  };

  function* siftDown(start: number, end: number): Generator<SortState> {
    let root = start;
    while (root * 2 + 1 < end) {
      let child = root * 2 + 1;
      if (child + 1 < end) {
        state.comparisons++;
        state.highlights = { compare: [child, child + 1], pivot: [root] };
        yield { ...state, array: arr.slice() };
        if (arr[child] < arr[child + 1]) child++;
      }
      state.comparisons++;
      state.highlights = { compare: [root, child] };
      yield { ...state, array: arr.slice() };
      if (arr[root] < arr[child]) {
        [arr[root], arr[child]] = [arr[child], arr[root]];
        state.writes += 2;
        state.highlights = { swap: [root, child] };
        yield { ...state, array: arr.slice() };
        root = child;
      } else {
        break;
      }
    }
  }

  for (let start = Math.floor(n / 2) - 1; start >= 0; start--) {
    yield* siftDown(start, n);
  }

  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    state.writes += 2;
    state.highlights = { swap: [0, end], 'mark-sorted': [end] };
    yield { ...state, array: arr.slice() };
    yield* siftDown(0, end);
    state.highlights = { 'mark-sorted': [end] };
    yield { ...state, array: arr.slice() };
  }

  state.done = true;
  state.highlights = { 'mark-sorted': arr.map((_, i) => i) };
  yield { ...state, array: arr.slice() };
}

export const heapSort: SortAlgorithm = {
  id: 'heap',
  category: 'sorting',
  beast: beastFor('heap'),
  run(input) {
    let last: SortState | undefined;
    for (const s of heapSteps(input)) last = s;
    return last ?? { array: input.slice(), comparisons: 0, writes: 0, done: true, highlights: {} };
  },
  steps: heapSteps,
  worstCaseInput: (size) => generateArray(size, 'reversed'),
  bestCaseInput: (size) => generateArray(size, 'sorted'),
};
