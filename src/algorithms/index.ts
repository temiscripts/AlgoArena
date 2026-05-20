import type { SortAlgorithm } from './types';
import { bubbleSort } from './sorting/bubble';
import { quickSort } from './sorting/quick';

export const SORT_ALGORITHMS: Record<string, SortAlgorithm> = {
  [bubbleSort.id]: bubbleSort,
  [quickSort.id]: quickSort,
};

export const SORT_ALGORITHM_LIST: SortAlgorithm[] = Object.values(SORT_ALGORITHMS);

export function getSort(id: string): SortAlgorithm {
  const algo = SORT_ALGORITHMS[id];
  if (!algo) throw new Error(`Unknown sort algorithm: ${id}`);
  return algo;
}
