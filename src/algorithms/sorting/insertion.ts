// Insertion Sort — Cardweaver, Hand of the Dealer.
// O(n) on nearly-sorted, O(n²) worst. The patient one.

import { beastFor } from '@/beasts/lore';
import type { OpCounts, SortAlgorithm, SortState } from '../types';
import { generateArray } from '@/lib/workloadGen';

function insertionCount(input: number[]): OpCounts {
  const arr = input.slice();
  let comparisons = 0;
  let writes = 0;
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0) {
      comparisons++;
      if (arr[j] <= key) break;
      arr[j + 1] = arr[j];
      writes++;
      j--;
    }
    arr[j + 1] = key;
    writes++;
  }
  return { comparisons, writes };
}

function* insertionSteps(input: number[]): Generator<SortState> {
  const arr = input.slice();
  const state: SortState = {
    array: arr.slice(),
    comparisons: 0,
    writes: 0,
    done: false,
    highlights: {},
  };

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    state.highlights = { pivot: [i] };
    yield { ...state, array: arr.slice() };

    while (j >= 0) {
      state.comparisons++;
      state.highlights = { compare: [j, j + 1], pivot: [i] };
      yield { ...state, array: arr.slice() };
      if (arr[j] <= key) break;

      arr[j + 1] = arr[j];
      state.writes++;
      state.highlights = { overwrite: [j + 1], pivot: [i] };
      yield { ...state, array: arr.slice() };
      j--;
    }
    arr[j + 1] = key;
    state.writes++;
    state.highlights = { overwrite: [j + 1] };
    yield { ...state, array: arr.slice() };
  }

  state.done = true;
  state.highlights = { 'mark-sorted': arr.map((_, i) => i) };
  yield { ...state, array: arr.slice() };
}

export const insertionSort: SortAlgorithm = {
  id: 'insertion',
  category: 'sorting',
  beast: beastFor('insertion'),
  run(input) {
    let last: SortState | undefined;
    for (const s of insertionSteps(input)) last = s;
    return last ?? { array: input.slice(), comparisons: 0, writes: 0, done: true, highlights: {} };
  },
  steps: insertionSteps,
  count: insertionCount,
  worstCaseInput: (size) => generateArray(size, 'reversed'),
  bestCaseInput: (size) => generateArray(size, 'sorted'),
};
