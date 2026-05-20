// Binary Search — The Cleaver, Halver of Worlds.
// Requires a sorted array. Halves the search space each step. O(log n).

import { beastFor } from '@/beasts/lore';
import {
  cloneSearchState,
  makeInitialSearchState,
  type SearchAlgorithm,
  type SearchInput,
  type SearchState,
} from './types';
import { generateArray } from '@/lib/workloadGen';

function* binarySteps(input: SearchInput): Generator<SearchState> {
  const { array, target } = input;
  const state = makeInitialSearchState(array.length);

  let lo = 0;
  let hi = array.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    state.current = mid;
    state.lo = lo;
    state.hi = hi;
    state.comparisons++;
    yield cloneSearchState(state);
    state.visited[mid] = 1;

    if (array[mid] === target) {
      state.found = true;
      state.foundIndex = mid;
      state.done = true;
      yield cloneSearchState(state);
      return;
    }
    if (array[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  state.done = true;
  state.lo = lo;
  state.hi = hi;
  yield cloneSearchState(state);
}

export const binarySearch: SearchAlgorithm = {
  id: 'binary',
  category: 'searching',
  beast: beastFor('binary'),
  run(input) {
    let last: SearchState | undefined;
    for (const s of binarySteps(input)) last = s;
    return last ?? makeInitialSearchState(input.array.length);
  },
  steps: binarySteps,
  // Worst case: target sits at one of the endpoints, forcing log₂(n) halvings.
  worstCaseInput: (size) => {
    const array = generateArray(size, 'sorted');
    return { array, target: array[0] };
  },
  bestCaseInput: (size) => {
    const array = generateArray(size, 'sorted');
    return { array, target: array[array.length >> 1] };
  },
};
