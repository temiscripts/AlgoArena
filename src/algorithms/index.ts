import type { SortAlgorithm } from './types';
import { bubbleSort } from './sorting/bubble';
import { insertionSort } from './sorting/insertion';
import { mergeSort } from './sorting/merge';
import { quickSort } from './sorting/quick';
import { heapSort } from './sorting/heap';

export const SORT_ALGORITHMS: Record<string, SortAlgorithm> = {
  [bubbleSort.id]: bubbleSort,
  [insertionSort.id]: insertionSort,
  [mergeSort.id]: mergeSort,
  [quickSort.id]: quickSort,
  [heapSort.id]: heapSort,
};

export const SORT_ALGORITHM_LIST: SortAlgorithm[] = Object.values(SORT_ALGORITHMS);

export function getSort(id: string): SortAlgorithm {
  const algo = SORT_ALGORITHMS[id];
  if (!algo) throw new Error(`Unknown sort algorithm: ${id}`);
  return algo;
}
