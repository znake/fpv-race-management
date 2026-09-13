# src/types KNOWLEDGE BASE

**Generated:** 2026-09-13

## OVERVIEW

Domain type definitions + barrel. **Canonical `Pilot`, `PilotInput`, `Ranking`, `RankPosition`, `HeatResults` live in `src/lib/schemas.ts`** (Zod) and are re-exported here — do not redefine them.

## STRUCTURE

```
src/types/
├── index.ts       # Barrel: re-exports csv + tournament + lib/schemas types
├── tournament.ts  # TournamentPhase, HeatStatus, Heat, PilotBracketState, Top4Pilots, TournamentStateData
└── csv.ts         # CSVRow, CSVImportResult/Error/State, DuplicatePilot, ImportProgress, ImportStatus
```

## WHERE TO LOOK

| Type | Location | Notes |
|------|----------|-------|
| `TournamentPhase` | `tournament.ts` | `'setup' \| 'heat-assignment' \| 'running' \| 'finale' \| 'completed'` |
| `Heat` | `tournament.ts` | id, heatNumber, pilotIds, status, bracketType, roundNumber, results |
| `PilotBracketState` | `tournament.ts` | bracket, bracketOrigin, roundReached |
| `TournamentStateData` | `tournament.ts` | Full state shape (`heats[]` = SoT) |
| `CSV*` types | `csv.ts` | CSV import pipeline |

## CONVENTIONS

- Import domain types via `@/types` (barrel) in app code; import `Pilot`/`Ranking`/`HeatResults` from `@/lib/schemas` when you need the Zod schema too.
- `HeatStatus`, `ImportProgress`, `ImportStatus` are **not** re-exported through the barrel — import from their module.

## ANTI-PATTERNS

- **No runtime logic here** — types only.
- **No duplicate definitions** of canonical schema types.
- **No `any`** — strict TS.
