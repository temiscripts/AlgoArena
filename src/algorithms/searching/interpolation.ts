// Interpolation Search — The Surveyor, Reader of Distances.
// Estimates the position of `target` using lo/hi values. On uniform data
// approaches O(log log n); on clumped distributions degenerates to O(n).

import { beastFor } from '@/beasts/lore';
import {
  cloneSearchState,
  makeInitialSearchState,
  type SearchAlgorithm,
  type SearchInput,
  type SearchState,
} from './types';
import { generateArray } from '@/lib/workloadGen';

function* interpolationSteps(input: SearchInput): Generator<SearchState> {
  const { array, target } = input;
  const state = makeInitialSearchState(array.length);

  let lo = 0;
  let hi = array.length - 1;
  while (lo <= hi && target >= array[lo] && target <= array[hi]) {
    if (array[hi] === array[lo]) {
      state.current = lo;
      state.lo = lo;
      state.hi = hi;
      state.comparisons++;
      yield cloneSearchState(state);
      state.visited[lo] = 1;
      if (array[lo] === target) {
        state.found = true;
        state.foundIndex = lo;
      }
      state.done = true;
      yield cloneSearchState(state);
      return;
    }
    const pos = lo + Math.floor(((target - array[lo]) * (hi - lo)) / (array[hi] - array[lo]));
    if (pos < lo || pos > hi) break;

    state.current = pos;
    state.lo = lo;
    state.hi = hi;
    state.comparisons++;
    yield cloneSearchState(state);
    state.visited[pos] = 1;

    if (array[pos] === target) {
      state.found = true;
      state.foundIndex = pos;
      state.done = true;
      yield cloneSearchState(state);
      return;
    }
    if (array[pos] < target) lo = pos + 1;
    else hi = pos - 1;
  }
  state.done = true;
  state.lo = lo;
  state.hi = hi;
  yield cloneSearchState(state);
}

export const interpolationSearch: SearchAlgorithm = {
  id: 'interpolation',
  category: 'searching',
  beast: beastFor('interpolation'),
  run(input) {
    let last: SearchState | undefined;
    for (const s of interpolationSteps(input)) last = s;
    return last ?? makeInitialSearchState(input.array.length);
  },
  steps: interpolationSteps,
  // Worst case: few-unique values force the position estimate to repeatedly
  // collapse to lo and the search degrades to a linear walk.
  worstCaseInput: (size) => {
    const array = generateArray(size, 'few-unique').sort((a, b) => a - b);
    return { array, target: array[array.length - 1] };
  },
  bestCaseInput: (size) => {
    const array = generateArray(size, 'sorted');
    const t = Math.floor((array[0] + array[array.length - 1]) / 2);
    return { array, target: t };
  },
};
