# Draft: Remove Grand Finale Rematch-Regel Feature

## Requirements (confirmed)
- User wants to COMPLETELY REMOVE the Rematch feature from Story 13.4
- After removal, Grand Finale directly determines places 1-4 (no second chances)
- Tournament flow must remain intact
- Tests must pass (minus rematch tests which are deleted)
- Build must succeed

## Research Findings

### Code Files Affected

| File | What to Remove | Impact |
|------|----------------|--------|
| `src/types/tournament.ts` (35-40) | `isRematch?`, `rematchBetween?`, `rematchForPlace?` properties from Heat interface | Type-level change |
| `src/stores/tournamentStore.ts` | `rematchHeats`, `grandFinaleRematchPending` state; `checkAndGenerateRematches()` function; rematch handling in `submitHeatResults`; rematch logic in `getTop4Pilots()` | Core logic |
| `src/lib/heat-completion.ts` (48-97) | `RematchCompletionInput`, `RematchCompletionResult` interfaces; `handleRematchCompletion()` function | Helper functions |
| `src/components/bracket/sections/RematchSection.tsx` | ENTIRE FILE (~212 lines) | **Note: Currently orphaned - not rendered anywhere!** |
| `src/components/bracket/index.ts` | No RematchSection export exists - already clean | None |
| `src/lib/demo-data.ts` (121-122) | `rematchHeats: []`, `grandFinaleRematchPending: false` | Demo state |

### Test Files Affected

| File | Action |
|------|--------|
| `tests/rematch-logic.test.ts` | DELETE ENTIRE FILE |

### Documentation Files Affected

| File | Action |
|------|--------|
| `_bmad-output/planning-artifacts/analysis/tournament-rules.md` | Remove sections 2, 4, 5 |
| `docs/store-api.md` | Remove Rematch section |
| `docs/README.md` | Remove Rematch references |
| `docs/architecture-deep-dive.md` | Remove Rematch mentions |
| `_bmad-output/architecture.md` | Remove Rematch-Mechanismus section |
| `_bmad-output/planning-artifacts/epics.md` | Remove Rematch references |
| `_bmad-output/implementation-artifacts/user-stories/epic-13/13-4-grand-finale-rematch-regel.md` | Mark as REMOVED/deprecated |

### Key Insight: `getTop4Pilots()` Simplification

Current logic (complex):
1. Checks if `grandFinaleRematchPending` - blocks if true
2. Extracts base results from Grand Finale
3. Loops through `rematchHeats` to override placements

**After removal (simple)**:
1. Find Grand Finale heat
2. Return rankings 1-4 directly from Grand Finale results
3. That's it! 4-pilot Grand Finale already determines final standings

### Key Insight: `RematchSection.tsx` is Orphaned

The component exists but is:
- NOT exported from `src/components/bracket/index.ts`
- NOT imported or rendered in `BracketTree.tsx`
- Effectively dead code - safe to delete with no UI impact

## Open Questions
- [PENDING] Test strategy: Should we just delete rematch tests, or add a test verifying "no rematches are generated"?
- [PENDING] Documentation: Full cleanup or just mark as deprecated/removed?

## Scope Boundaries
- INCLUDE: All rematch-related code, tests, and documentation
- INCLUDE: Simplification of `getTop4Pilots()` 
- EXCLUDE: Any changes to Grand Finale generation logic (it already creates 4-pilot heats)
- EXCLUDE: Changes to pilotBracketStates (bracketOrigin still useful for display)

## Technical Decisions
- `pilotBracketStates` and `bracketOrigin` can remain - they track which bracket a pilot came from for UI display purposes (WB vs LB badge)
- INITIAL_TOURNAMENT_STATE needs to be cleaned up to remove rematch-related fields
- TournamentState interface needs to be updated to remove rematch-related properties and methods
