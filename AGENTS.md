# AlgoArena — Battle of the Beasts

> A live algorithm-battle arena where classic algorithms are reimagined as combatant "beasts." Submission for the AlgoFest Hackathon (Devpost). Hard deadline: **22 May 2026, 22:00 WAT (GMT+1)**.

This file is the source of truth for what we are building. When something is ambiguous, this file wins. When this file is silent, ask before assuming.

---

## 1. Project Identity

**Name:** AlgoArena
**Tagline:** Two algorithms enter. One algorithm leaves.
**Pitch:** An in-browser visual arena where classical algorithms compete head-to-head on real workloads. Each algorithm is presented as a "beast" with stats, lore, and a fighting style. Users watch them race, get crushed by adversarial inputs, and have their complexity classes discovered live.

**Why this wins judging:**
- Judging criteria are *Innovation & Creativity* and *Presentation & Documentation* — both reward strong concept + strong demo over feature count.
- The hackathon's tagline is literally "Battle of the Beasts." This project embodies it. Most submissions will miss this.
- Algorithm visualizers are common; **adversarial battles + emergent Big-O discovery + tournament mode** are not.

**Track:** Open Innovation. Also eligible for "Most Innovative Idea" and "Best Design & UI/UX" special awards.

---

## 2. Hard Constraints (do not violate)

- **Time budget:** ~50 hours total from start to submission. Final 4 hours are reserved for recording the demo video, writing the README, and Devpost submission. Do not eat into that window.
- **Pure client-side.** No backend. No database. No auth. No server functions. Anything that would need one is out of scope.
- **No user-uploaded code execution.** v1 ships with a fixed library of algorithm implementations only. Custom code upload is a "future work" bullet, not a feature.
- **Browser-only.** Must run in any evergreen Chromium browser. Mobile is nice-to-have but not required.
- **Solo developer.** Do not propose architectures that assume multiple contributors or a CI pipeline.

---

## 3. Tech Stack (locked — do not suggest alternatives)

| Layer | Choice |
|---|---|
| Build tool | Vite |
| Framework | React 18 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Animation | Framer Motion (only where it earns its weight) |
| Visualization | Native SVG + Canvas where SVG gets slow |
| State | React state + Context. No Redux, no Zustand, no Jotai. |
| Deploy | Vercel (connect repo, push to deploy) |
| Package manager | npm |

If a feature would require adding a new heavy dependency, flag it and wait for approval before installing. Lightweight utilities (lodash-es, clsx) are fine.

---

## 4. Project Structure

```
src/
  algorithms/
    sorting/           # one file per algo: bubble.ts, quick.ts, etc.
    pathfinding/
    searching/
    index.ts           # registry exporting all algos with metadata
  beasts/
    cards/             # creature card components
    lore.ts            # name + stats + description per algorithm
  arenas/
    SortingArena.tsx
    PathfindingArena.tsx
    SearchingArena.tsx
  modes/
    AdversarialMode.tsx
    ComplexityDiscovery.tsx
    Tournament.tsx
  components/          # shared UI (Button, Stat, etc.)
  lib/
    workloadGen.ts     # input generators (random, sorted, reversed, adversarial)
    complexity.ts      # Big-O curve fitting from runtime samples
    stepper.ts         # generator-based step engine
  pages/
    Home.tsx
    Arena.tsx
  App.tsx
  main.tsx
```

Keep files small. One component per file. Co-locate the algorithm with its step-generator and its beast metadata where possible.

---

## 5. The Core Abstraction

Every algorithm must conform to this interface:

```ts
interface Algorithm<TInput, TState> {
  id: string;
  beast: BeastMetadata;
  run(input: TInput): TState;                    // computes the final result
  steps(input: TInput): Generator<TState>;       // yields every intermediate state for visualization
  worstCaseInput(size: number): TInput;          // for Adversarial Mode
  bestCaseInput(size: number): TInput;
}
```

The generator-based `steps()` function is the heart of the visualization. The renderer drives the generator at a user-controlled speed. No setTimeout chains, no manual animation loops outside of the renderer.

---

## 6. Scope — What Ships

### MVP (must work by end of Day 2)

- **Sorting Arena** with 5 algorithms: Bubble, Insertion, Merge, Quick, Heap. Animated bar-chart race side-by-side. Speed slider. Input size slider.
- **Pathfinding Arena** with 4 algorithms: BFS, DFS, Dijkstra, A\*. Animated grid maze with explored/frontier/path coloring. User can place walls.
- **Beast cards** for every algorithm: name, portrait (CSS/SVG, no external art), stats (Speed / Memory / Stability / Best Case / Worst Case), one-line lore.
- **Adversarial Mode**: pick an algorithm, generate its worst-case input, watch it fall apart. The "Quicksort vs already-sorted input" moment is non-negotiable — that's the demo highlight.
- **Polished landing page** with the tagline, three arena cards, and a clear CTA.

### Stretch (only if MVP is solid by Friday morning)

**Polish layers — highest leverage, do these BEFORE adding new features. They cost little and transform the demo video.**

- **Combat animations.** Render algorithm operations as fight moves. Sorting swaps become "pivot strikes" with a brief flash and screen-shake. Pathfinding frontier expansion ripples outward like a shockwave. The final path traces with a "finishing blow" glow. This doesn't add new content — it makes the existing content *feel* like a battle instead of a chart. Implement with Framer Motion variants triggered by the stepper's event types.
- **Sound design.** Sword/metal clangs on swaps, low ambient hum during exploration, a victory fanfare on completion, a low growl when Adversarial Mode triggers a worst-case. Pull a free pack from freesound.org or zapsplat. Wire through a single `useSound` hook that respects a mute toggle. ~2 hours of work, dramatically lifts the demo.

**New features — only after polish layers are in.**

- **Hall of Beasts.** Standalone gallery page browsing every beast with full lore, stats, matchup advantages ("strong vs sorted inputs, weak vs reversed"), and a "see them in action" link to a pre-built showcase battle. Cheap to build, makes the world feel bigger.
- **Big-O Quiz Mode.** Show an algorithm running on mystery input; user guesses the complexity class from four options. Turns the visualizer into a learning tool — strengthens the "Best Social Impact" and "Most Innovative" award angles.
- **Replay system.** Save battle seeds + algorithm pair to IndexedDB (no backend needed — pure browser storage). Generate a shareable URL with the seed encoded, so anyone clicking the link replays the exact same match. Demos beautifully.
- **Searching Arena** with linear / binary / interpolation search.
- **Complexity Discovery.** Run an algorithm at sizes [10, 100, 1k, 10k, 100k], plot runtime, fit a curve, declare "O(n log n) detected."
- **Tournament Mode.** Bracket-style elimination across all algos in a category.

### Explicitly out of scope

- User-uploaded custom algorithms
- Multiplayer / shared sessions
- Account system
- Saving results
- Mobile-first responsive design (desktop-first is fine)
- Audio / sound effects
- i18n
- Dark/light theme toggle (pick one — see §8)
- Any kind of AI/LLM integration. This project is about classical algorithms. Adding AI for AI's sake weakens the pitch.

---

## 7. Build Priority (do work in this order)

**Day 1 (Wednesday night):**
1. Vite + React + TS + Tailwind scaffold
2. Algorithm interface, registry pattern, stepper engine
3. Bubble sort + Quick sort end-to-end with the generator-based renderer
4. Side-by-side race UI working with two algorithms
5. Goal: by bedtime, you can watch bubble vs quick race on a random array.

**Day 2 (Thursday):**
6. Remaining sorting algorithms (Insertion, Merge, Heap)
7. Pathfinding arena — this is the most visually striking arena, so prioritize it. Grid component, wall placement, BFS first, then A\* (the visual contrast between them is gold).
8. Dijkstra, DFS.
9. Beast cards + lore. This is where the personality lives — don't skip it for "more features."
10. Adversarial Mode.

**Day 3 (Friday, before 18:00 WAT):**
11. Landing page polish.
12. Stretch — strict order: **(a) combat animations, (b) sound design**, then (c) Hall of Beasts / Quiz Mode / Replay / new arenas / Complexity Discovery / Tournament. Stop when the clock hits 18:00 regardless of progress. The video matters more than the next feature.

**Day 3 (Friday 18:00–22:00 WAT) — submission window:**
13. Record demo video (script in §10).
14. Write README.
15. Deploy to Vercel, verify live URL.
16. Submit on Devpost. Done.

---

## 8. Design Language

**Aesthetic:** Dark fantasy meets terminal. Think *Slay the Spire* x *Hades* x a competitive programming judge.

- **Base palette:** Near-black background (`#0a0a0f`), parchment off-white text (`#e8e3d3`), blood-crimson accent (`#c4322b`), gold for winners (`#d4af37`), muted teal for "frontier" states (`#5fb3a1`).
- **Typography:** A serif display font for headings and beast names (Cinzel or Cormorant from Google Fonts). A clean monospace for stats and algorithm names (JetBrains Mono).
- **Tone of writing:** Beast lore should sound like a bestiary entry, not a Wikipedia stub. Example: *"BUBBLESNAIL — The Plodder. Slow, simple, and stubbornly persistent. It compares every neighbour it passes. Strong against the small. Crushed by the many."*
- **Motion:** Cells/bars animate position changes smoothly. New comparisons flash briefly. Path exploration pulses. Don't over-animate — the algorithm is the show, not the framework.

Lock the theme on Day 1. Do not redesign mid-build.

---

## 9. Beast Roster (initial)

| Algorithm | Beast Name | Vibe |
|---|---|---|
| Bubble Sort | Bubblesnail, the Plodder | Slow, methodical, oddly endearing |
| Insertion Sort | Cardweaver | Patient hand-of-the-dealer |
| Merge Sort | The Twin Wyrms | Divides what it cannot conquer alone |
| Quick Sort | Lightning Adder | Devastatingly fast, fragile to ambush |
| Heap Sort | The Pyrelord | Burns through the heap |
| BFS | Tidecaller | Floods every passage at once |
| DFS | Shadowdelver | Plunges, retreats, plunges again |
| Dijkstra | The Cartographer | Measures every road before walking |
| A\* | The Oracle | Sees the destination, walks toward it |

This is a starting point. Feel free to refine the names — but keep the voice consistent.

---

## 10. Demo Video Script (2:30 target)

The video matters as much as the code. Half the rubric is presentation. Record with OBS, voiceover with a USB mic if available — phone mic is fine if not.

1. **00:00–00:15** — Cold open. Title card: *"In the arena of algorithms, only one beast survives."* Fade to logo.
2. **00:15–00:35** — Sorting race: Quicksort vs Bubble sort on 500 random elements. Quicksort destroys.
3. **00:35–01:05** — Plot twist: same matchup, *sorted* input. Bubble sort wins. Cut to the beast cards explaining why (Quicksort's worst case).
4. **01:05–01:35** — Pathfinding maze: A\* vs Dijkstra side-by-side on the same maze. Dijkstra floods the map; A\* makes a beeline. Visual contrast is the whole point.
5. **01:35–02:00** — Adversarial Mode: pick the Lightning Adder (Quicksort), generate worst case, watch it crawl to O(n²). Beast card flashes red.
6. **02:00–02:20** — (If Tournament shipped) Bracket finale. Crown the champion.
7. **02:20–02:30** — Tagline + URL + GitHub link.

Script this on paper before recording. One take per segment is fine.

---

## 11. README Outline (write last)

Must contain, in this order:
1. Title + one-line pitch + GIF of sorting race
2. Live demo link + demo video link
3. The hook (Battle of the Beasts framing)
4. Features list with screenshots
5. Tech stack
6. Run locally (`npm install`, `npm run dev`)
7. Project structure
8. Algorithm interface explanation (this is where the CS substance shows)
9. **Roadmap / future work.** Include explicitly: custom algorithm upload with sandboxed WebWorker execution, global leaderboard ranking user-submitted algorithms, multiplayer tournaments, ML algorithms as a separate arena (gradient descent, k-means, decision trees as beasts), string algorithms arena (KMP, Boyer-Moore, Rabin-Karp), DP visualizers (knapsack solving itself), genetic algorithm "evolution" mode with hybrid sorts, teacher mode for classroom use, weekly community challenges. This section signals roadmap awareness to judges — write it deliberately, not as filler.
10. Credits

---

## 12. Code Conventions

- TypeScript strict mode on. No `any` unless commented with why.
- Functional components only. Hooks for state.
- Named exports, not default exports, except for page components.
- Files: `PascalCase.tsx` for components, `camelCase.ts` for logic.
- No premature abstraction. If something is used once, inline it. If twice, leave it. If three times, extract.
- Comments explain *why*, not *what*. Algorithm files should have a top-of-file comment with the Big-O, the use case, and the beast's tagline.

---

## 13. What I Want From You (Claude Code)

- When I describe a feature, propose the smallest version that demos well before suggesting extensions.
- Push back if I'm scope-creeping. Remind me of §6 if I drift.
- When stuck, prefer to ship a working ugly version, then polish, over a half-built clean version.
- Don't refactor working code unless I ask. Time is the constraint, not elegance.
- Don't suggest backend additions, auth, or persistence. Refer to §2.
- If a library would save real time, name it, justify it in one sentence, and wait for me to say yes before `npm install`.

---

## 14. Commands

```bash
npm install                # setup
npm run dev                # local dev server (Vite)
npm run build              # production build
npm run preview            # preview the production build locally
npx vercel                 # deploy
```

---

## 15. Git & Deployment

**Remote repository:** `https://github.com/temiscripts/AlgoArena.git`

On the first session, initialize and wire up the remote:

```bash
git init
git branch -M main
git remote add origin https://github.com/temiscripts/AlgoArena.git
```

**When to commit and push:**

Decide the moment yourself — don't ask permission every time. Commit and push:
- After each completed milestone in §7 (e.g. *"sorting arena MVP works"*, *"pathfinding arena MVP works"*, *"adversarial mode wired up"*, *"combat animations integrated"*, *"sound wired through"*)
- Before starting any large refactor (so we can roll back if it goes sideways)
- At the end of any work session
- After fixing something non-trivial

Do ask before doing anything destructive: force-push, rebase that rewrites shared history, deleting untracked files, or anything involving `--force`.

**Commit message rules — strict:**

- Use conventional-commit style prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `perf:`.
- Subject line under 60 characters, lowercase after the prefix, no trailing period.
- Body (optional) wrapped at 72 characters, explains *why* not *what*.
- **DO NOT add `Co-Authored-By: Claude <noreply@anthropic.com>` to any commit.**
- **DO NOT add the `🤖 Generated with Claude Code` footer to any commit.**
- **DO NOT mention Claude, AI, or assistance of any kind in commit messages.**
- The commit author comes from the user's `git config` — do not override it, do not add anything to it.

If your default behaviour is to append AI attribution lines, disable it for this project. Every commit on the public repo must read as if a solo human wrote it.

Example good commit:

```
feat: add generator-based stepper engine

Algorithms now yield intermediate states via a Generator, letting
the renderer drive playback at any speed without setTimeout chains.
```

Example bad commit (never do this):

```
feat: add stepper engine

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

## 16. Definition of Done

The project is done when **all of these are true** by 18:00 WAT on Friday 22 May:

- [ ] Live URL works on a fresh browser
- [ ] Sorting Arena: 5 algorithms, all race-able pairwise
- [ ] Pathfinding Arena: 4 algorithms, wall placement works
- [ ] Beast cards exist for every algorithm with lore
- [ ] Adversarial Mode visibly breaks Quicksort
- [ ] No console errors on the live URL
- [ ] README is written
- [ ] Demo video is recorded and uploaded
- [ ] Devpost submission is filled out (title, tagline, description, tech stack, demo video, live URL, repo URL)

Stretch features are bonuses, not blockers. Ship the MVP first.
