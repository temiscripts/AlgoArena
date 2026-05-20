import type { SortAlgorithm } from './types';
import { bubbleSort } from './sorting/bubble';
import { insertionSort } from './sorting/insertion';
import { mergeSort } from './sorting/merge';
import { quickSort } from './sorting/quick';
import { heapSort } from './sorting/heap';

import type { PathAlgorithm } from './pathfinding/types';
import { bfs } from './pathfinding/bfs';
import { dfs } from './pathfinding/dfs';
import { dijkstra } from './pathfinding/dijkstra';
import { astar } from './pathfinding/astar';

import type { SearchAlgorithm } from './searching/types';
import { linearSearch } from './searching/linear';
import { binarySearch } from './searching/binary';
import { interpolationSearch } from './searching/interpolation';

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

export const PATH_ALGORITHMS: Record<string, PathAlgorithm> = {
  [bfs.id]: bfs,
  [dfs.id]: dfs,
  [dijkstra.id]: dijkstra,
  [astar.id]: astar,
};

export const PATH_ALGORITHM_LIST: PathAlgorithm[] = Object.values(PATH_ALGORITHMS);

export function getPath(id: string): PathAlgorithm {
  const algo = PATH_ALGORITHMS[id];
  if (!algo) throw new Error(`Unknown pathfinding algorithm: ${id}`);
  return algo;
}

export const SEARCH_ALGORITHMS: Record<string, SearchAlgorithm> = {
  [linearSearch.id]: linearSearch,
  [binarySearch.id]: binarySearch,
  [interpolationSearch.id]: interpolationSearch,
};

export const SEARCH_ALGORITHM_LIST: SearchAlgorithm[] = Object.values(SEARCH_ALGORITHMS);

export function getSearch(id: string): SearchAlgorithm {
  const algo = SEARCH_ALGORITHMS[id];
  if (!algo) throw new Error(`Unknown search algorithm: ${id}`);
  return algo;
}

export const ALL_ALGORITHMS = [...SORT_ALGORITHM_LIST, ...PATH_ALGORITHM_LIST, ...SEARCH_ALGORITHM_LIST];
