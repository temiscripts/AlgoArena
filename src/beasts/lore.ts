export interface BeastStats {
  speed: number;
  memory: number;
  stability: number;
  bestCase: string;
  worstCase: string;
}

export interface BeastMetadata {
  algorithmId: string;
  /** Real, neutral algorithm name (e.g. "Quick Sort", "A* Search"). */
  algoName: string;
  /** One- to two-sentence plain-English explanation of how it works. */
  algoDescription: string;
  /** Beast persona — used in dropdowns alongside algoName. */
  name: string;
  title: string;
  tagline: string;
  lore: string;
  stats: BeastStats;
  sigil: string;
  accent: 'crimson' | 'gold' | 'teal';
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
  strongAgainst: string;
  weakAgainst: string;
}

export const BEASTS: Record<string, BeastMetadata> = {
  bubble: {
    algorithmId: 'bubble',
    algoName: 'Bubble Sort',
    algoDescription:
      'Walks the array repeatedly, swapping any pair of neighbours that are out of order until no swaps are needed. Simple but slow on large or shuffled inputs.',
    name: 'Bubblesnail',
    title: 'The Plodder',
    tagline: 'Slow. Stubborn. Inevitable.',
    lore: 'Slow, simple, and stubbornly persistent. It compares every neighbour it passes. Strong against the small. Crushed by the many.',
    stats: { speed: 1, memory: 5, stability: 5, bestCase: 'sorted', worstCase: 'reversed' },
    sigil: '🐌',
    accent: 'teal',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    strongAgainst: 'already-sorted arrays',
    weakAgainst: 'large reversed inputs',
  },
  insertion: {
    algorithmId: 'insertion',
    algoName: 'Insertion Sort',
    algoDescription:
      'Treats the array as a growing sorted prefix and slides each new element back to its correct place. Excellent on nearly-sorted data, quadratic on chaos.',
    name: 'Cardweaver',
    title: 'Hand of the Dealer',
    tagline: 'Each card finds its place.',
    lore: 'A patient dealer of fates. Slides each new arrival into the line where it belongs. Calm with the nearly-sorted. Broken by chaos.',
    stats: { speed: 2, memory: 5, stability: 5, bestCase: 'sorted', worstCase: 'reversed' },
    sigil: '🂠',
    accent: 'teal',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    strongAgainst: 'nearly-sorted arrays',
    weakAgainst: 'fully reversed inputs',
  },
  merge: {
    algorithmId: 'merge',
    algoName: 'Merge Sort',
    algoDescription:
      'Splits the array in half recursively, sorts each half, then merges them back together in order. Guaranteed O(n log n) on any input — at the cost of O(n) extra memory.',
    name: 'The Twin Wyrms',
    title: 'Of Divided Skies',
    tagline: 'Two halves. One song.',
    lore: 'A pair of serpents that split the world in two, then bind it back stronger than it was. They never miss. They never falter. They never sleep.',
    stats: { speed: 4, memory: 2, stability: 5, bestCase: 'any', worstCase: 'any' },
    sigil: '⚯',
    accent: 'gold',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
    strongAgainst: 'consistency on any input',
    weakAgainst: 'memory-constrained battlegrounds',
  },
  quick: {
    algorithmId: 'quick',
    algoName: 'Quick Sort',
    algoDescription:
      'Picks a pivot, partitions the array into smaller-than and larger-than halves, then recurses on each. Fastest sort on average — but a bad pivot choice degrades it to O(n²).',
    name: 'Lightning Adder',
    title: 'Strike of the Pivot',
    tagline: 'Pick. Strike. Sunder.',
    lore: 'A blur. A flash. A choice. Cleaves the field in two with a single strike. Untouchable on the chaos of war — but show it order, and the snake eats its tail.',
    stats: { speed: 5, memory: 4, stability: 2, bestCase: 'random', worstCase: 'sorted' },
    sigil: '⚡',
    accent: 'crimson',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
    strongAgainst: 'random inputs',
    weakAgainst: 'already-sorted inputs (worst-case ambush)',
  },
  heap: {
    algorithmId: 'heap',
    algoName: 'Heap Sort',
    algoDescription:
      'Builds a max-heap from the array, then repeatedly removes the largest element and rebuilds the heap. In-place and guaranteed O(n log n) on any input.',
    name: 'The Pyrelord',
    title: 'Crowned in Ash',
    tagline: 'The largest burns last.',
    lore: 'Every duel ends at the throne. Forges a pyramid of fire, then plucks the brightest ember from its peak — again, and again, and again — until only embers remain.',
    stats: { speed: 4, memory: 5, stability: 1, bestCase: 'any', worstCase: 'any' },
    sigil: '🜂',
    accent: 'crimson',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
    strongAgainst: 'guaranteed performance on any input',
    weakAgainst: 'cache-sensitive workloads',
  },
  bfs: {
    algorithmId: 'bfs',
    algoName: 'Breadth-First Search (BFS)',
    algoDescription:
      'Explores the grid in concentric waves, visiting every cell at distance 1, then distance 2, and so on. Guarantees the shortest path on unweighted maps.',
    name: 'Tidecaller',
    title: 'Of the Hundred Mouths',
    tagline: 'Floods every passage at once.',
    lore: 'Releases a wave that spreads outward in equal measure, swallowing the map in concentric rings. Finds the shortest path because it cannot do otherwise — the tide reaches everywhere at once.',
    stats: { speed: 3, memory: 2, stability: 5, bestCase: 'unweighted', worstCase: 'sparse target' },
    sigil: '🌊',
    accent: 'teal',
    complexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
    strongAgainst: 'shortest paths on unweighted grids',
    weakAgainst: 'weighted edges (use Dijkstra instead)',
  },
  dfs: {
    algorithmId: 'dfs',
    algoName: 'Depth-First Search (DFS)',
    algoDescription:
      'Plunges down one corridor until it hits a dead end, then backtracks to the last junction and tries another. Finds *a* path quickly — not necessarily the shortest.',
    name: 'Shadowdelver',
    title: 'Of the Long Corridor',
    tagline: 'Plunges. Retreats. Plunges again.',
    lore: 'Drives into the dark until it strikes stone, then crawls back to the last fork and tries the next door. Reckless. Stubborn. Sometimes lucky. Almost never optimal.',
    stats: { speed: 3, memory: 4, stability: 1, bestCase: 'lucky path', worstCase: 'wrong direction' },
    sigil: '🕳',
    accent: 'crimson',
    complexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
    strongAgainst: 'maze topology, cycle detection',
    weakAgainst: 'shortest-path problems (no guarantee)',
  },
  dijkstra: {
    algorithmId: 'dijkstra',
    algoName: "Dijkstra's Algorithm",
    algoDescription:
      'Checks all paths by accumulated distance using a priority queue, expanding the cheapest unexplored cell next. Finds the shortest weighted path with no shortcuts.',
    name: 'The Cartographer',
    title: 'Keeper of Distances',
    tagline: 'Measures every road before walking it.',
    lore: 'Carries a ledger of every cost. Never assumes; always weighs. Slow to commit, impossible to fool. Will find the cheapest path even if it has to weigh the whole world.',
    stats: { speed: 2, memory: 2, stability: 5, bestCase: 'sparse graph', worstCase: 'dense graph' },
    sigil: '🗺',
    accent: 'gold',
    complexity: { best: 'O((V+E) log V)', average: 'O((V+E) log V)', worst: 'O((V+E) log V)', space: 'O(V)' },
    strongAgainst: 'weighted graphs with no negative edges',
    weakAgainst: 'when you already have a heuristic (A* dominates)',
  },
  astar: {
    algorithmId: 'astar',
    algoName: 'A* Search',
    algoDescription:
      "Like Dijkstra, but adds a heuristic estimate of distance to the goal and prioritises promising cells. Faster than BFS/Dijkstra when the heuristic is good — its quality is everything.",
    name: 'The Oracle',
    title: 'Whose Eyes See the End',
    tagline: 'Sees the destination. Walks toward it.',
    lore: 'Born with a vision of the goal, the Oracle weighs each step against the road remaining. Wastes no breath on dead ends. Where Dijkstra ponders, the Oracle strides.',
    stats: { speed: 5, memory: 3, stability: 4, bestCase: 'good heuristic', worstCase: 'pathological maze' },
    sigil: '✦',
    accent: 'gold',
    complexity: { best: 'O(E)', average: 'O((V+E) log V)', worst: 'O((V+E) log V)', space: 'O(V)' },
    strongAgainst: 'navigating large open spaces',
    weakAgainst: 'mazes that defeat the heuristic',
  },
  linear: {
    algorithmId: 'linear',
    algoName: 'Linear Search',
    algoDescription:
      'Walks the array from start to finish, comparing each element to the target. Works on any data, sorted or not — but slow on large inputs.',
    name: 'The Plodseeker',
    title: 'Tracker of Footsteps',
    tagline: 'One door at a time.',
    lore: 'Walks the line, knocking on every door in turn. Slow, untiring, unblinking. Will find anything — given enough doors.',
    stats: { speed: 1, memory: 5, stability: 5, bestCase: 'first match', worstCase: 'last or missing' },
    sigil: '🚶',
    accent: 'teal',
    complexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    strongAgainst: 'unsorted inputs',
    weakAgainst: 'long sorted arrays where the prize hides at the end',
  },
  binary: {
    algorithmId: 'binary',
    algoName: 'Binary Search',
    algoDescription:
      'Halves the remaining search space each step by comparing the target to the middle element. Requires the array to be sorted — finds anything in log n questions.',
    name: 'The Cleaver',
    title: 'Halver of Worlds',
    tagline: 'Above. Below. Choose.',
    lore: "Steps to the middle and asks one question: is the prize above or below? Cleaves the world in two, then cleaves again, and again. There is no place to hide for long.",
    stats: { speed: 5, memory: 5, stability: 5, bestCase: 'middle match', worstCase: 'edge match' },
    sigil: '⚔',
    accent: 'gold',
    complexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
    strongAgainst: 'large sorted arrays',
    weakAgainst: 'unsorted inputs (cannot operate)',
  },
  interpolation: {
    algorithmId: 'interpolation',
    algoName: 'Interpolation Search',
    algoDescription:
      'Estimates where the target should sit based on the lo/hi values and the target itself, then jumps there. Near-instant on uniform data; degrades to linear when values cluster.',
    name: 'The Surveyor',
    title: 'Reader of Distances',
    tagline: 'Guess from the gap.',
    lore: "Looks at the lowest and the highest, and the prize sought, and reckons where the prize must lie. Lands close on the first leap when the numbers are even. Stumbles when the field is clumped.",
    stats: { speed: 5, memory: 5, stability: 3, bestCase: 'uniform distribution', worstCase: 'clumped values' },
    sigil: '◈',
    accent: 'crimson',
    complexity: { best: 'O(1)', average: 'O(log log n)', worst: 'O(n)', space: 'O(1)' },
    strongAgainst: 'large sorted arrays with even spacing',
    weakAgainst: 'few-unique or skewed value distributions',
  },
};

export const beastFor = (id: string): BeastMetadata => {
  const b = BEASTS[id];
  if (!b) throw new Error(`No beast metadata for algorithm "${id}"`);
  return b;
};
