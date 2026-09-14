# PROJECT KNOWLEDGE BASE

**Generated:** 2026-09-13
**Commit:** b4365fe
**Branch:** cleanup/phase-0-1-dead-code

## OVERVIEW

FPV Racing Heats — tournament management for FPV drone races using a double-elimination bracket.
React 18 + TypeScript + Vite + Tailwind (Synthwave theme), Zustand + localStorage persist.
Optimized for beamer/projector display at live events. German UI copy and docs.

## COMMANDS

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (port 5173) |
| `npm run build` | `tsc && vite build` — type-check is a hard build gate |
| `npm run preview` | Preview production build |
| `npm test` | Vitest watch mode |
| `npm test -- run` / `npm test -- <file>` | Run once / single file (no `test:run` script exists) |
| `npm run test:ui` | Vitest UI browser |
| `npm run lint` | ESLint flat config, `--report-unused-disable-directives --max-warnings 0` |

## STRUCTURE

```
src/
├── components/     # React components
│   ├── *.tsx       # Smart containers (store access, forms, modals)
│   ├── bracket/    # Bracket visualization (only barrel export here)
│   ├── ui/         # Reusable primitives (no barrel; import directly)
│   └── ...
├── lib/            # Pure TS business logic (no React)
├── stores/         # Single Zustand store (tournamentStore.ts, ~1350 LOC)
├── hooks/          # useZoomPan, usePilots, useIsMobile
├── types/          # Domain type defs + barrel
├── test/setup.ts   # Vitest setup (NOT tests — suite lives in /tests)
├── App.tsx         # Composition root
└── main.tsx        # Entry
tests/              # Centralized Vitest suite + helpers/
docs/               # Domain rules, architecture, store API
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Bracket logic | `src/lib/bracket-logic.ts` | `inferBracketType`, pool→heat creation |
| Heat completion / next heats | `src/lib/heat-completion.ts` | `generateNextHeats` — order-sensitive, 900+ LOC |
| Heat split (3er/4er) | `src/lib/heat-distribution.ts` | 7–60 pilots |
| Channel assignment | `src/lib/channel-assignment.ts` | Raceband R1/R3/R6/R8 |
| State management | `src/stores/tournamentStore.ts` | Single store, localStorage persist |
| Bracket rendering | `src/components/bracket/bracket-tree.tsx` | Only store-touching bracket file |
| Zoom/pan | `src/hooks/useZoomPan.ts` | 726-LOC hotspot |
| Export/Import | `src/lib/export-import.ts` | JSON backup, CSV results |
| CSV import | `src/components/csv-import.tsx` | PapaParse, drag & drop |
| Domain rules | `docs/tournament-rules.md` | Authoritative |
| Architecture | `docs/architecture-deep-dive.md` | Prefer over stale `architecture.md` |
| Store API | `docs/store-api.md` | State + actions reference |
| Tests | `tests/` | See `tests/AGENTS.md` |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `useTournamentStore` | store | `src/stores/tournamentStore.ts:185` | Entire tournament state + ~40 actions/selectors |
| `submitHeatResults` | action | `src/stores/tournamentStore.ts:518` | Highest-risk fn: rankings→pools→next heats→phase in one `set()` |
| `generateNextHeats` | fn | `src/lib/heat-completion.ts` | Dynamic WB/LB/finale generation |
| `processRankingsByBracket` | fn | `src/lib/heat-completion.ts` | Rank→pool/elimination transitions |
| `calculateHeatDistribution` | fn | `src/lib/heat-distribution.ts` | Optimal 4er/3er split |
| `inferBracketType` | fn | `src/lib/bracket-logic.ts` | Map heat id → bracket type |
| `BracketTree` | component | `src/components/bracket/bracket-tree.tsx` | Canvas + orchestration |
| `useZoomPan` | hook | `src/hooks/useZoomPan.ts:100` | Wheel/touch/pointer/keyboard zoom-pan |
| `usePilots` | hook | `src/hooks/usePilots.ts` | Pilot CRUD facade over store (Zod) |
| `App` | component | `src/App.tsx:27` | Root: tabs, dialogs, export/import |

## CONVENTIONS (deviations from standard only)

- **No default exports** — named only. `kebab-case.ts` for logic and `kebab-case.tsx` for components.
- **Imports**: React → external → `@/` alias → relative → `import type` last. Alias `@/*` → `src/*` must stay in sync in `tsconfig.json` AND `vite.config.ts`.
- **`border-3`** is a custom Tailwind width (not `border-4`). Beamer font sizes: `text-beamer-body` (18px) … `text-beamer-display` (48px).
- **Theme colors**: `void`, `night`, `neon-pink`, `neon-cyan`, `neon-magenta`, `gold`, `silver`, `bronze`, `winner-green`, `loser-red`.
- **State flow**: smart containers call `useTournamentStore(selector)`; presentation components receive props. `src/hooks/usePilots.ts` is the intended wrapper. No React Context anywhere.
- **Strict TS**: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Lint is zero-warning.
- **Zod** validates external input (`src/lib/schemas.ts`); `export-import.ts` uses hand-rolled type guards.
- **CSS**: `cn()` (`clsx`+`twMerge`); CVA for variants; `forwardRef` + `displayName` in `ui/`.

## ANTI-PATTERNS (THIS PROJECT)

- **No store imports in UI primitives / presentation components** — only smart containers (`App.tsx`, `bracket/bracket-tree.tsx`, `heat-detail-modal.tsx`, `heat-assignment-view.tsx`) may call the store. Pass data via props.
- **No `as any` / `@ts-ignore` / `@ts-expect-error`** — enforced by `tsc` in the build, not an ESLint rule.
- **No empty catch blocks** — handle or log every error.
- **No mutating Sets in `src/lib/`** — create new Sets (exception: `heat-completion.ts` mutates; documented drift).
- **No `crypto.randomUUID()` directly in `src/lib/`** — use helpers (the store calls it directly; documented drift).
- **Never reintroduce `fullBracketStructure`** — `heats[]` is the single source of truth (Phase 3).
- **No hardcoded heat ID strings** — always use `HEAT_ID_PREFIXES` from `src/lib/bracket-constants.ts`.

## UNIQUE STYLES

- Synthwave theme, beamer-first large fonts, PWA-installable, offline localStorage persistence.
- German UI copy and German comments; user-story traceability markers ("Story 1.6", "US-2.1 AC1") in `src/lib`.

## GOTCHAS

- **`heats[]` is the single source of truth**; all bracket structure is computed dynamically.
- **Heat ID prefixes are load-bearing** — store selectors match `wb-` / `lb-` / `grand-finale-` by string in addition to `bracketType`.
- **Pool invariant**: `winnerPilots`/`loserPilots`/`eliminatedPilots` arrays and `winnerPool`/`loserPool` Sets must stay in sync (rollback logic duplicated in `submitHeatResults` and `reopenHeat`).
- **Round-sync invariants**: LB Rn waits for WB Rn; WB Rn+1 waits for LB Rn; direct-qualify (2 pilots) bypasses finale heats via `pilotBracketStates`.
- **Canonical `Pilot`/`HeatResults`/`Ranking` types live in `src/lib/schemas.ts`**, re-exported through `src/types/index.ts`.
- **`src/test/` is Vitest setup, not tests** — the suite is centralized in `/tests/`.
- **`docs/architecture.md` is outdated** (describes a removed Provider); use `docs/architecture-deep-dive.md`.
- **`docs/dead-code-report.md` records historical cleanup context**; verify current paths against disk before trusting historical references.

## NOTES

- No CI/CD configured; manual build/deploy. Dockerfile present for containerization.
- Dual licensing: PolyForm Noncommercial 1.0.0 (free) / Commercial (paid, events with fees/sponsors).
- `src/components/heat-card.tsx` is a 177-LOC single-variant (`overview`) pure-props card used only by the heat-assignment view.
