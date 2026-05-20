// Linear Search — The Plodseeker, Tracker of Footsteps.
// Knocks on every door from 0 to n-1. O(n).

import { beastFor } from '@/beasts/lore';
import {
  cloneSearchState,
  makeInitialSearchState,
  type SearchAlgorithm,
  type SearchInput,
  type SearchState,
} from './types';
import { generateArray } from '@/lib/workloadGen';

function* linearSteps(input: SearchInput): Generator<SearchState> {
  const { array, target } = input;
  const state = makeInitialSearchState(array.length);

  for (let i = 0; i < array.length; i++) {
    state.current = i;
    state.comparisons++;
    yield cloneSearchState(state);
    state.visited[i] = 1;
    if (array[i] === target) {
      state.found = true;
      state.foundIndex = i;
      state.done = true;
      yield cloneSearchState(state);
      return;
    }
  }
  state.done = true;
  yield cloneSearchState(state);
}

export const linearSearch: SearchAlgorithm = {
  id: 'linear',
  category: 'searching',
  beast: beastFor('linear'),
  run(input) {
    let last: SearchState | undefined;
    for (const s of linearSteps(input)) last = s;
    return last ?? makeInitialSearchState(input.array.length);
  },
  steps: linearSteps,
  worstCaseInput: (size) => {
    const array = sortedArray(size);
    return { array, target: array[array.length - 1] };
  },
  bestCaseInput: (size) => {
    const array = sortedArray(size);
    return { array, target: array[0] };
  },
};

function sortedArray(size: number): number[] {
  return generateArray(size, 'sorted');
}
