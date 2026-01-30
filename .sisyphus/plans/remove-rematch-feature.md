# Remove Grand Finale Rematch-Regel Feature

## TL;DR

> **Quick Summary**: Complete removal of the Story 13.4 Rematch feature that allowed WB pilots a second chance after losing to LB pilots in Grand Finale. After removal, the 4-pilot Grand Finale directly determines final places 1-4.
> 
> **Deliverables**:
> - Clean Heat type without rematch properties
> - Simplified `getTop4Pilots()` that reads directly from Grand Finale
> - Removed `checkAndGenerateRematches()` and all rematch state
> - Deleted RematchSection component and rematch tests
> - Updated documentation
> 
> **Estimated Effort**: Medium (2-3 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (Types) → Task 2 (Store) → Task 5 (Verify) → Task 6 (Build)

---

## Context

### Original Request
User wants to completely REMOVE the Grand Finale Rematch-Regel feature from the FPV Racing Tournament application. The Rematch rule was implemented in Story 13.4 and adds 1v1 rematches after Grand Finale when a Loser Bracket pilot beats a Winner Bracket pilot.

### Interview Summary
**Key Discussions**:
- Feature is to be completely removed, not disabled
- Grand Finale with 4 pilots already determines places 1-4 without rematches
- `pilotBracketStates` with `bracketOrigin` should be KEPT (useful for UI display)
- RematchSection component is orphaned (not rendered anywhere) - safe deletion

**Research Findings**:
- `RematchSection.tsx` exists but is not exported or rendered - dead code
- `handleRematchCompletion` only called for rematch heats - safe to remove
- `getTop4Pilots()` has complex rematch override logic that can be simplified to ~15 lines
- Total ~1200 lines of code to remove across all files

### Self-Review (Gap Analysis)
**Identified Gaps** (addressed):
- Ensure `lsp_diagnostics` verification after each TypeScript edit
- Ensure `pilotBracketStates` and `bracketOrigin` are NOT removed (still used for WB/LB badges)
- Ensure `INITIAL_TOURNAMENT_STATE` is updated alongside interface changes
- Documentation updates should follow code changes (not parallel) to avoid merge conflicts

---

## Work Objectives

### Core Objective
Remove all rematch-related code, types, state, tests, and documentation from the codebase while ensuring the tournament flow continues to work correctly.

### Concrete Deliverables
- `src/types/tournament.ts` - Clean Heat interface without `isRematch`, `rematchBetween`, `rematchForPlace`
- `src/stores/tournamentStore.ts` - Simplified store without rematch state and logic
- `src/lib/heat-completion.ts` - Removed rematch handling functions
- `src/components/bracket/sections/RematchSection.tsx` - DELETED
- `tests/rematch-logic.test.ts` - DELETED
- `src/lib/demo-data.ts` - Cleaned demo state
- Documentation files - Updated to remove rematch references

### Definition of Done
- [ ] `npm run build` exits with code 0
- [ ] `npm test` passes (with rematch tests removed)
- [ ] `lsp_diagnostics` shows no errors in modified TypeScript files
- [ ] `getTop4Pilots()` returns correct results for 4-pilot Grand Finale
- [ ] No TypeScript compilation errors

### Must Have
- Type-safe removal (no `any` casts or ts-ignore comments)
- All rematch state removed from INITIAL_TOURNAMENT_STATE
- All rematch methods removed from TournamentState interface
- Simplified `getTop4Pilots()` that reads Grand Finale rankings directly

### Must NOT Have (Guardrails)
- DO NOT remove `pilotBracketStates` or `bracketOrigin` (still used for WB/LB display)
- DO NOT modify Grand Finale generation logic (it already creates 4-pilot heats correctly)
- DO NOT add new features or "improvements" during removal
- DO NOT change the tournament flow beyond removing rematches
- DO NOT remove `PilotBracketState` type (still used)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (bun test / vitest)
- **User wants tests**: Tests-after (verify existing tests pass, minus deleted rematch tests)
- **Framework**: bun test

### Automated Verification

Each task includes verification via:
1. `lsp_diagnostics` - Check for TypeScript errors after each code edit
2. `npm test` - Run after all code changes complete
3. `npm run build` - Final build verification

**Evidence Requirements:**
- Terminal output captured from verification commands
- Build exit code must be 0
- Test output showing pass/fail counts

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Independent File Deletions):
├── Task 3: Delete RematchSection.tsx component
└── Task 4: Delete rematch-logic.test.ts

Wave 2 (After Wave 1 - Core Code Changes, Sequential within wave):
├── Task 1: Remove rematch properties from Heat type
├── Task 2: Remove rematch logic from tournamentStore (depends: 1)
├── Task 2b: Remove rematch functions from heat-completion.ts (depends: 1)
└── Task 2c: Clean demo-data.ts (depends: 1)

Wave 3 (After Wave 2 - Verification & Docs):
├── Task 5: Run tests and verify build
└── Task 6: Update documentation files

Critical Path: Task 1 → Task 2 → Task 5 → Task 6
Parallel Speedup: ~35% faster than fully sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 2b, 2c | 3, 4 |
| 2 | 1 | 5 | 2b, 2c (after 1) |
| 2b | 1 | 5 | 2, 2c (after 1) |
| 2c | 1 | 5 | 2, 2b (after 1) |
| 3 | None | None | 1, 4 |
| 4 | None | 5 | 1, 3 |
| 5 | 2, 2b, 2c, 4 | 6 | None |
| 6 | 5 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Execution |
|------|-------|----------------------|
| 1 | 3, 4 | Can run in parallel with Task 1 |
| 2 | 1, 2, 2b, 2c | Task 1 first, then 2/2b/2c in parallel |
| 3 | 5, 6 | Sequential - verify before documenting |

---

## TODOs

- [ ] 1. Remove rematch properties from Heat interface

  **What to do**:
  - Remove `isRematch?: boolean` (line 36)
  - Remove `rematchBetween?: [string, string]` (line 38)
  - Remove `rematchForPlace?: 1 | 2` (line 40)
  - Remove associated JSDoc comments (lines 35, 37, 39)
  - Run `lsp_diagnostics` to verify no type errors

  **Must NOT do**:
  - Do NOT remove `PilotBracketState` interface
  - Do NOT remove `bracketOrigin` property from PilotBracketState

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file edit, clear scope, type-only changes
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed for individual edits

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 3, 4)
  - **Blocks**: Tasks 2, 2b, 2c (they depend on clean types)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/types/tournament.ts:24-41` - Current Heat interface definition (lines to modify)

  **API/Type References**:
  - `src/types/tournament.ts:47-54` - PilotBracketState interface (DO NOT MODIFY)

  **Acceptance Criteria**:

  - [ ] Lines 35-40 removed from src/types/tournament.ts
  - [ ] `lsp_diagnostics` on `src/types/tournament.ts` returns no errors
  ```bash
  # Agent runs lsp_diagnostics tool:
  lsp_diagnostics(filePath="src/types/tournament.ts", severity="error")
  # Assert: No errors returned (may have errors in OTHER files until Task 2 completes)
  ```

  **Commit**: NO (groups with Task 2)

---

- [ ] 2. Remove rematch logic from tournamentStore.ts

  **What to do**:
  
  **Step 2.1: Remove from INITIAL_TOURNAMENT_STATE (lines 46-47)**:
  - Remove `rematchHeats: [] as Heat[]`
  - Remove `grandFinaleRematchPending: false`

  **Step 2.2: Remove from TournamentState interface (lines 97-100)**:
  - Remove `pilotBracketStates` line if it only references rematch (VERIFY FIRST - may be used elsewhere)
  - Remove `rematchHeats: Heat[]`
  - Remove `grandFinaleRematchPending: boolean`

  **Step 2.3: Remove from submitHeatResults (lines 521-558)**:
  - Remove `rematchHeats, grandFinaleRematchPending` from destructuring (line 521)
  - Remove `const isRematch = heat.isRematch === true` (line 530)
  - Remove entire rematch completion block (lines 547-558)
  - Remove `newRematchHeats` and `newGrandFinaleRematchPending` variables
  - Remove these from final `set()` call (lines 722-723)

  **Step 2.4: Simplify getTop4Pilots() (lines 813-893)**:
  - Remove `rematchHeats, grandFinaleRematchPending` from destructuring (line 814)
  - Remove pending check block (lines 817-823)
  - Remove `hasRematches` variable (line 835)
  - Remove entire rematch override loop (lines 868-885)
  - Simplify to directly return Grand Finale rankings 1-4:
  ```typescript
  getTop4Pilots: () => {
    const { pilots, heats } = get()

    // Find Grand Finale heat
    const grandFinaleHeat = heats.find(h =>
      h.bracketType === 'grand_finale' ||
      h.bracketType === 'finale' ||
      h.id.includes('grand-finale')
    )

    if (!grandFinaleHeat?.results) return null

    // 4-pilot Grand Finale - rankings directly determine final places
    const place1Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 1)
    const place2Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 2)
    const place3Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 3)
    const place4Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 4)

    return {
      place1: pilots.find(p => p.id === place1Ranking?.pilotId),
      place2: pilots.find(p => p.id === place2Ranking?.pilotId),
      place3: pilots.find(p => p.id === place3Ranking?.pilotId),
      place4: pilots.find(p => p.id === place4Ranking?.pilotId),
    }
  }
  ```

  **Step 2.5: Remove checkAndGenerateRematches function (lines 1294-1362)**:
  - Delete entire function definition
  - Remove from TournamentState interface (line 180)

  **Step 2.6: Remove import of handleRematchCompletion (line 17)**:
  - Remove `handleRematchCompletion` from import statement

  **Must NOT do**:
  - Do NOT remove `pilotBracketStates` state (still used for bracketOrigin tracking)
  - Do NOT modify generateGrandFinale() logic
  - Do NOT change submitHeatResults ranking processing for non-rematch heats

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused refactoring task with clear deletion targets
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed for individual edits

  **Parallelization**:
  - **Can Run In Parallel**: NO (must wait for Task 1)
  - **Parallel Group**: Wave 2 (sequential after Task 1)
  - **Blocks**: Task 5 (verification)
  - **Blocked By**: Task 1 (types must be clean first)

  **References**:

  **Pattern References**:
  - `src/stores/tournamentStore.ts:46-47` - INITIAL_TOURNAMENT_STATE rematch fields
  - `src/stores/tournamentStore.ts:97-100` - TournamentState interface rematch fields
  - `src/stores/tournamentStore.ts:521-558` - submitHeatResults rematch handling
  - `src/stores/tournamentStore.ts:813-893` - getTop4Pilots() current implementation
  - `src/stores/tournamentStore.ts:1294-1362` - checkAndGenerateRematches function

  **Acceptance Criteria**:

  - [ ] No `rematchHeats` or `grandFinaleRematchPending` in store state
  - [ ] No `checkAndGenerateRematches` function exists
  - [ ] `getTop4Pilots()` simplified to ~20 lines (no rematch override logic)
  - [ ] `lsp_diagnostics` on `src/stores/tournamentStore.ts` returns no errors
  ```bash
  # Agent runs:
  lsp_diagnostics(filePath="src/stores/tournamentStore.ts", severity="error")
  # Assert: No errors returned
  ```

  **Commit**: NO (groups with Task 2b, 2c)

---

- [ ] 2b. Remove rematch functions from heat-completion.ts

  **What to do**:
  - Remove `RematchCompletionInput` interface (lines 54-59)
  - Remove `RematchCompletionResult` interface (lines 64-67)
  - Remove `handleRematchCompletion` function (lines 78-97)
  - Remove section header comment "Story 1.6: Rematch Completion Handling" (lines 47-49)

  **Must NOT do**:
  - Do NOT remove other interfaces or functions (HeatCompletionState, processRankingsByBracket, etc.)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, clear deletions
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 2 (with Tasks 2, 2c after Task 1)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/lib/heat-completion.ts:47-97` - All rematch-related code to remove

  **Acceptance Criteria**:

  - [ ] No `RematchCompletionInput` interface in file
  - [ ] No `RematchCompletionResult` interface in file
  - [ ] No `handleRematchCompletion` function in file
  - [ ] `lsp_diagnostics` on `src/lib/heat-completion.ts` returns no errors
  ```bash
  lsp_diagnostics(filePath="src/lib/heat-completion.ts", severity="error")
  # Assert: No errors returned
  ```

  **Commit**: NO (groups with Task 2)

---

- [ ] 2c. Clean demo-data.ts

  **What to do**:
  - Remove `rematchHeats: []` (line 121)
  - Remove `grandFinaleRematchPending: false` (line 122)

  **Must NOT do**:
  - Do NOT remove `pilotBracketStates: {}`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Two line deletions
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 2 (with Tasks 2, 2b after Task 1)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/lib/demo-data.ts:121-122` - Lines to remove

  **Acceptance Criteria**:

  - [ ] Lines 121-122 removed
  - [ ] `lsp_diagnostics` on `src/lib/demo-data.ts` returns no errors
  ```bash
  lsp_diagnostics(filePath="src/lib/demo-data.ts", severity="error")
  # Assert: No errors returned
  ```

  **Commit**: NO (groups with Task 2)

---

- [ ] 3. Delete RematchSection.tsx component

  **What to do**:
  - Delete entire file `src/components/bracket/sections/RematchSection.tsx` (~212 lines)
  - Verify no imports exist (already confirmed: component is orphaned)

  **Must NOT do**:
  - Do NOT modify index.ts (RematchSection is not exported there)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file deletion
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 4)
  - **Blocks**: None
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/components/bracket/sections/RematchSection.tsx` - ENTIRE FILE to delete
  - `src/components/bracket/index.ts` - Verify no export exists (confirmed: no RematchSection export)

  **Acceptance Criteria**:

  - [ ] File `src/components/bracket/sections/RematchSection.tsx` does not exist
  ```bash
  # Agent runs:
  ls src/components/bracket/sections/RematchSection.tsx 2>&1
  # Assert: "No such file or directory"
  ```
  - [ ] No import errors in other files (grep for RematchSection returns nothing)
  ```bash
  # Agent runs via grep tool:
  grep -r "RematchSection" src/
  # Assert: No matches found
  ```

  **Commit**: NO (groups with final commit)

---

- [ ] 4. Delete rematch-logic.test.ts

  **What to do**:
  - Delete entire file `tests/rematch-logic.test.ts` (~1000 lines)

  **Must NOT do**:
  - Do NOT modify other test files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file deletion
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 5 (tests won't pass if file references deleted types)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `tests/rematch-logic.test.ts` - ENTIRE FILE to delete

  **Acceptance Criteria**:

  - [ ] File `tests/rematch-logic.test.ts` does not exist
  ```bash
  # Agent runs:
  ls tests/rematch-logic.test.ts 2>&1
  # Assert: "No such file or directory"
  ```

  **Commit**: NO (groups with final commit)

---

- [ ] 5. Run tests and verify build

  **What to do**:
  - Run `npm test` and verify all tests pass
  - Run `npm run build` and verify build succeeds
  - Capture output as evidence

  **Must NOT do**:
  - Do NOT skip failing tests with `.skip`
  - Do NOT ignore build warnings that are actually errors

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Command execution and verification
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after all code changes)
  - **Blocks**: Task 6 (documentation)
  - **Blocked By**: Tasks 2, 2b, 2c, 3, 4

  **References**:

  **Pattern References**:
  - `package.json` - For test and build commands

  **Acceptance Criteria**:

  - [ ] `npm test` passes with 0 failures
  ```bash
  # Agent runs:
  npm test
  # Assert: Exit code 0, output shows "X passed, 0 failed"
  ```
  - [ ] `npm run build` succeeds
  ```bash
  # Agent runs:
  npm run build
  # Assert: Exit code 0, no TypeScript errors
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from `npm test` showing pass count
  - [ ] Terminal output from `npm run build` showing success

  **Commit**: YES
  - Message: `refactor(tournament): remove Grand Finale Rematch feature (Story 13.4)`
  - Files: All modified/deleted files from Tasks 1-4
  - Pre-commit: `npm test && npm run build`

---

- [ ] 6. Update documentation files

  **What to do**:
  
  **6.1: `_bmad-output/planning-artifacts/analysis/tournament-rules.md`**:
  - Remove Section 2 "Grand Finale Rematch-Regel" (lines ~85-125)
  - Remove Section 4 "Beispiel 4: Tom Bergers Revanche" (lines ~402-444)
  - Remove Section 5 "Rematch-Szenarien (Referenz)" (lines ~447-507)

  **6.2: `docs/store-api.md`**:
  - Remove Rematch section entirely
  - Remove `rematchHeats`, `grandFinaleRematchPending`, `checkAndGenerateRematches` from API docs

  **6.3: `docs/README.md`**:
  - Remove any Rematch feature descriptions

  **6.4: `docs/architecture-deep-dive.md`**:
  - Remove Rematch mentions from data structures section

  **6.5: `_bmad-output/architecture.md`**:
  - Remove "Rematch-Mechanismus" section

  **6.6: `_bmad-output/planning-artifacts/epics.md`**:
  - Mark Epic 13-4 as REMOVED or add note that feature was removed

  **6.7: `_bmad-output/implementation-artifacts/user-stories/epic-13/13-4-grand-finale-rematch-regel.md`**:
  - Add header: `# [REMOVED] Grand Finale Rematch-Regel`
  - Add note: `> **Status**: This feature was removed. Grand Finale now directly determines places 1-4 without rematches.`

  **Must NOT do**:
  - Do NOT delete the 13-4 story file (keep for historical reference)
  - Do NOT modify code files in this task

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation updates across multiple files
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after verification)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 5 (verify code works before documenting)

  **References**:

  **Pattern References**:
  - `_bmad-output/planning-artifacts/analysis/tournament-rules.md` - Sections to remove
  - `docs/store-api.md` - Rematch API documentation
  - `docs/README.md` - Feature overview
  - `docs/architecture-deep-dive.md` - Technical architecture
  - `_bmad-output/architecture.md` - System architecture
  - `_bmad-output/planning-artifacts/epics.md` - Epic tracking
  - `_bmad-output/implementation-artifacts/user-stories/epic-13/13-4-grand-finale-rematch-regel.md` - Story file

  **Acceptance Criteria**:

  - [ ] No "Rematch" or "rematch" mentions in `docs/store-api.md` (except in removed/deprecated context)
  ```bash
  # Agent runs via grep:
  grep -i "rematch" docs/store-api.md
  # Assert: No matches OR only "[REMOVED]" context
  ```
  - [ ] Story 13-4 file has [REMOVED] header
  ```bash
  # Agent runs:
  head -5 "_bmad-output/implementation-artifacts/user-stories/epic-13/13-4-grand-finale-rematch-regel.md"
  # Assert: Contains "[REMOVED]" in first 5 lines
  ```

  **Commit**: YES
  - Message: `docs: remove Grand Finale Rematch documentation`
  - Files: All documentation files updated in this task
  - Pre-commit: None (docs only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 5 | `refactor(tournament): remove Grand Finale Rematch feature (Story 13.4)` | src/types/tournament.ts, src/stores/tournamentStore.ts, src/lib/heat-completion.ts, src/lib/demo-data.ts, src/components/bracket/sections/RematchSection.tsx (deleted), tests/rematch-logic.test.ts (deleted) | npm test && npm run build |
| 6 | `docs: remove Grand Finale Rematch documentation` | All docs files | None |

---

## Success Criteria

### Verification Commands
```bash
# Test suite passes
npm test
# Expected: All tests pass (rematch tests deleted, others pass)

# Build succeeds
npm run build
# Expected: Exit code 0, no TypeScript errors

# No rematch references in source code
grep -r "rematch" src/ --include="*.ts" --include="*.tsx" | grep -v "// removed" | wc -l
# Expected: 0 (or only comments about removal)

# No rematch types remain
grep -E "(isRematch|rematchBetween|rematchForPlace|rematchHeats|grandFinaleRematchPending)" src/
# Expected: No matches
```

### Final Checklist
- [ ] All "Must Have" present (clean types, simplified getTop4Pilots, no rematch state)
- [ ] All "Must NOT Have" absent (pilotBracketStates preserved, no new features)
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Documentation updated
