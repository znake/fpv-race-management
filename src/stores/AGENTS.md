# src/stores KNOWLEDGE BASE

**Generated:** 2026-09-13

## OVERVIEW

Single Zustand store owning the entire tournament lifecycle, persisted to localStorage (key `heats-tournament`). `heats[]` is the single source of truth; all bracket structure is computed dynamically.

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Store hook | `tournamentStore.ts:185` | `useTournamentStore(selector)` |
| Initial state / reset baseline | `tournamentStore.ts:22` | `INITIAL_TOURNAMENT_STATE` |
| Submit heat results | `tournamentStore.ts:518` | **Highest-risk fn** — see below |
| Dynamic bracket generation | `tournamentStore.ts:868–1190` | `generateLBHeat`, `generateLBRound`, `generateLBFinale`, `generateGrandFinale` |
| Reopen completed heat | `tournamentStore.ts:722` | Manual pool rollback |
| Phase description | `tournamentStore.ts:1198` | `getCurrentPhaseDescription` |
| Reset | `performReset` (line 344) | Shared by `resetTournament` / `deleteAllPilots` / `resetAll` |

## STATE SHAPE

- Lifecycle: `pilots`, `tournamentStarted`, `tournamentPhase` (`setup` → `heat-assignment` → `running` → `finale` → `completed`).
- Bracket: `heats[]`, `currentHeatIndex`, `currentWBRound`, `currentLBRound`, `lbRoundWaitingForWB`.
- Pools: `winnerPilots`/`winnerPool`, `loserPilots`/`loserPool`, `eliminatedPilots`, `grandFinalePool`.
- Flags: `isQualificationComplete`, `isWBFinaleComplete`, `isLBFinaleComplete`, `isGrandFinaleComplete`, `lastCompletedBracketType`.
- Per-pilot: `pilotBracketStates` (bracket, bracketOrigin, roundReached); `showPilotPaths`.

## HIGH-RISK: `submitHeatResults`

One `set()` orchestrates 5 sub-systems: ranking rollback → pool updates → `generateNextHeats` → phase transition → heat activation. It mutates ~10 state slices. Any change can silently corrupt bracket state.

- Arrays (`winnerPilots` etc.) and Sets (`winnerPool` etc.) must stay in sync; rollback logic is duplicated in `submitHeatResults` and `reopenHeat`.
- Selectors still match heat IDs by string prefix (`wb-`, `lb-`, `grand-finale-`); keep `HEAT_ID_PREFIXES`.
- `getNextRecommendedHeat` encodes WB/LB alternation priority — subtle.

## CONVENTIONS

- **Consumers use selectors**: `useTournamentStore(state => state.x)`, never whole-store subscription (one violation: `bracket/PilotPathToggle.tsx`).
- Non-reactive reads outside React use `useTournamentStore.getState()`.
- Store may call `crypto.randomUUID()` directly (documented drift from `src/lib` rules).
- Uses `alert()`/`confirm()` for validation UX (side effects in store).

## ANTI-PATTERNS

- **No second store** — keep one source of truth.
- **No direct array/Set mutation** in components — use actions.
- **No hardcoded heat ID prefixes** — use `HEAT_ID_PREFIXES`.
- **No parallel bracket structure** — never reintroduce `fullBracketStructure`.

## TESTS

Most store behavior is covered indirectly by `/tests/*.test.ts` (`round-progression`, `lb-*`, `eight-pilots-flow`, `heat-assignment`, `reset-functions`, `grand-finale-4-piloten`).
