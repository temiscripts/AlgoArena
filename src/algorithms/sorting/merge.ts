// Merge Sort — The Twin Wyrms.
// O(n log n) on every input. The reliable warhorse, paid for in O(n) memory.

import { beastFor } from '@/beasts/lore';
import type { SortAlgorithm, SortState } from '../types';
import { generateArray } from '@/lib/workloadGen';

function* mergeSteps(input: number[]): Generator<SortState> {
  const arr = input.slice();
  const state: SortState = {
    array: arr.slice(),
    comparisons: 0,
    writes: 0,
    done: false,
    highlights: {},
  };

  function* mergeRange(lo: number, mid: number, hi: number): Generator<SortState> {
    const left = arr.slice(lo, mid + 1);
    const right = arr.slice(mid + 1, hi + 1);
    let i = 0;
    let j = 0;
    let k = lo;

    state.highlights = { 'partition-bounds': [lo, hi] };
    yield { ...state, array: arr.slice() };

    while (i < left.length && j < right.length) {
      state.comparisons++;
      state.highlights = {
        compare: [lo + i, mid + 1 + j],
        'partition-bounds': [lo, hi],
      };
      yield { ...state, array: arr.slice() };

      if (left[i] <= right[j]) {
        arr[k] = left[i++];
      } else {
        arr[k] = right[j++];
      }
      state.writes++;
      state.highlights = { 'merge-copy': [k], 'partition-bounds': [lo, hi] };
      yield { ...state, array: arr.slice() };
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i++];
      state.writes++;
      state.highlights = { 'merge-copy': [k], 'partition-bounds': [lo, hi] };
      yield { ...state, array: arr.slice() };
      k++;
    }
    while (j < right.length) {
      arr[k] = right[j++];
      state.writes++;
      state.highlights = { 'merge-copy': [k], 'partition-bounds': [lo, hi] };
      yield { ...state, array: arr.slice() };
      k++;
    }
  }

  function* ms(lo: number, hi: number): Generator<SortState> {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    yield* ms(lo, mid);
    yield* ms(mid + 1, hi);
    yield* mergeRange(lo, mid, hi);
  }

  yield* ms(0, arr.length - 1);

  state.done = true;
  state.highlights = { 'mark-sorted': arr.map((_, i) => i) };
  yield { ...state, array: arr.slice() };
}

export const mergeSort: SortAlgorithm = {
  id: 'merge',
  category: 'sorting',
  beast: beastFor('merge'),
  run(input) {
    let last: SortState | undefined;
    for (const s of mergeSteps(input)) last = s;
    return last ?? { array: input.slice(), comparisons: 0, writes: 0, done: true, highlights: {} };
  },
  steps: mergeSteps,
  worstCaseInput: (size) => generateArray(size, 'reversed'),
  bestCaseInput: (size) => generateArray(size, 'sorted'),
};
