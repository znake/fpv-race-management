# FPV Raceband Channel Assignment System

## TL;DR

> **Quick Summary**: Implement a smart channel assignment system that displays Raceband channels (R1, R4, R6, R8) next to pilot names and optimizes pilot order in heats to minimize channel switches between races.
> 
> **Deliverables**:
> - Channel display ("Rx") in bracket view and placement modal
> - `lastChannel` field on Pilot interface with persistence
> - Smart assignment algorithm that reorders pilots to match their preferred channels
> - Channel assignment logic for all heat sizes (1-4 pilots)
> 
> **Estimated Effort**: Medium (4-6 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (Types) -> Task 2 (Logic) -> Task 3/4 (UI parallel) -> Task 5 (Integration)

---

## Context

### Original Request
User wants to display FPV Raceband channels next to pilot names in the bracket view and placement entry modal. Channels should be assigned based on position (1st pilot = R1, 2nd = R4, etc.) but also stored per pilot to minimize channel switches between heats. When generating new heats, the system should try to reorder pilots so they can keep their previous channel.

### Interview Summary
**Key Discussions**:
- Channels: Raceband 1, 4, 6, 8 - displayed as "R1", "R4", "R6", "R8"
- 3-pilot heats: Use R1, R4, R8 (skip R6 for more frequency spacing)
- 2-pilot heats: Use R1, R8 (maximum spacing)
- Conflict resolution: Random (no pilot has priority)
- Assignment strategy: Pilot order in heat CAN be changed to maximize channel retention
- Channel saved after EVERY heat completion
- Applies to ALL heats including qualification
- No visual feedback for channel switches (just show current channel)

**Research Findings**:
- Pilot interface in `src/lib/schemas.ts` - needs `lastChannel` field
- Heat generation uses FIFO from pools in `src/lib/bracket-logic.ts`
- Heat completion in `src/lib/heat-completion.ts` - place to update `lastChannel`
- Persistence: Zustand with localStorage (`tournament-storage` key)
- UI: `FilledBracketHeatBox.tsx` and `placement-entry-modal.tsx`
- Existing test infrastructure: Vitest with 19 tests

### Metis Review
**Identified Gaps** (addressed):
- Persistence layer: Confirmed - Zustand with localStorage persist middleware
- 2-pilot heats: User confirmed R1, R8
- 5+ pilot heats: Not supported by app (max 4 pilots per heat)
- Algorithm specificity: Greedy assignment with random tiebreaker
- Channel-switch visibility: User declined - just show current channel

---

## Work Objectives

### Core Objective
Display Raceband channels next to pilot names and minimize channel switches between heats by storing each pilot's last channel and optimizing pilot order in new heats.

### Concrete Deliverables
- `lastChannel` field added to Pilot interface
- `getChannelsForHeat(pilotCount)` utility function
- `optimizePilotOrder(pilotIds, pilots)` smart assignment function
- Channel badge component/element in `FilledBracketHeatBox.tsx`
- Channel badge in `placement-entry-modal.tsx`
- `lastChannel` update logic in `submitHeatResults`
- Unit tests for channel assignment logic

### Definition of Done
- [x] `vitest run` passes all tests (existing + new)
- [x] Channel badges visible in bracket view for all heat types
- [x] Channel badges visible in placement entry modal
- [x] Pilot's `lastChannel` persists after heat completion and page refresh
- [x] Pilot order in new heats is optimized to reduce channel switches

### Must Have
- Position-based channel assignment as fallback
- Silent assignment (no user prompts)
- Read-only display ("Rx" badge is informational only)
- Persistence across heats and page refreshes
- All heat types use same assignment logic

### Must NOT Have (Guardrails)
- No manual channel selection UI (no dropdown, no click-to-change)
- No conflict resolution dialog (resolve silently/randomly)
- No channel history visualization (no timeline)
- No analytics/statistics (no "total switches" counter)
- No configuration settings (no "enable smart assignment" toggle)
- No channel validation against hardware
- No export to external systems
- No bulk reassignment tools
- No undo/redo for assignments
- No "channel locked" state
- No complex optimization algorithms (keep it simple/greedy)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (Vitest configured)
- **User wants tests**: YES (TDD for logic, tests for integration)
- **Framework**: Vitest (`bun test` or `vitest run`)

### TDD Approach
New channel assignment logic will be developed with TDD:
1. **RED**: Write failing tests for `getChannelsForHeat` and `optimizePilotOrder`
2. **GREEN**: Implement minimum code to pass
3. **REFACTOR**: Clean up while keeping tests green

### Automated Verification
All acceptance criteria are agent-executable via:
- `vitest run` for unit tests
- Playwright for UI verification (bracket view, modal)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Extend Pilot type with lastChannel [no dependencies]
└── (prepare test file structure)

Wave 2 (After Task 1):
├── Task 2: Channel assignment logic + tests [depends: 1]
└── (can start UI work in parallel once types ready)

Wave 3 (After Task 2):
├── Task 3: UI - Bracket view channel badges [depends: 2]
└── Task 4: UI - Placement modal channel badges [depends: 2]

Wave 4 (After Tasks 3, 4):
└── Task 5: Integration - update lastChannel on heat completion [depends: 2, 3, 4]

Critical Path: Task 1 → Task 2 → Task 5
Parallel Speedup: Tasks 3 & 4 run in parallel after Task 2
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4, 5 | None |
| 2 | 1 | 3, 4, 5 | None |
| 3 | 2 | 5 | 4 |
| 4 | 2 | 5 | 3 |
| 5 | 2, 3, 4 | None | None (final) |

---

## TODOs

### Task 1: Extend Pilot Interface with lastChannel

**What to do**:
- Add `lastChannel?: 1 | 4 | 6 | 8` to Pilot interface in `src/lib/schemas.ts`
- Ensure type is optional (undefined for new pilots)
- No schema validation needed (field is set programmatically, not by user input)

**Must NOT do**:
- Don't add to Zod schema (not user-editable)
- Don't add to CSV import schema
- Don't modify any other pilot fields

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Single-file type addition, minimal change
- **Skills**: `[]`
  - No special skills needed for type modification

**Parallelization**:
- **Can Run In Parallel**: NO (foundation task)
- **Parallel Group**: Wave 1 (alone)
- **Blocks**: Tasks 2, 3, 4, 5
- **Blocked By**: None (can start immediately)

**References**:
- `src/lib/schemas.ts:3-10` - Pilot interface definition (add field here)

**Acceptance Criteria**:

**Automated Verification:**
```bash
# TypeScript compilation check
bun run build 2>&1 | head -20
# Assert: No type errors related to Pilot interface
# Assert: Build succeeds or only unrelated warnings

# Type check specifically
npx tsc --noEmit 2>&1 | grep -i "lastChannel" || echo "No errors for lastChannel"
# Assert: No errors mentioning lastChannel
```

**Commit**: YES
- Message: `feat(pilot): add lastChannel field for channel persistence`
- Files: `src/lib/schemas.ts`
- Pre-commit: `bun run build`

---

### Task 2: Channel Assignment Logic with TDD

**What to do**:
- Create `src/lib/channel-assignment.ts` with:
  - `CHANNEL_MAP` constant: `{ 1: 1, 2: 4, 3: 6, 4: 8 }` for position-to-channel
  - `getChannelsForHeat(pilotCount: number): number[]` - returns channels for heat size
    - 4 pilots: [1, 4, 6, 8]
    - 3 pilots: [1, 4, 8]
    - 2 pilots: [1, 8]
    - 1 pilot: [1]
  - `getChannelForPosition(position: number, pilotCount: number): number` - returns channel for specific position
  - `optimizePilotOrder(pilotIds: string[], pilots: Pilot[]): string[]` - reorders pilots to maximize channel matches
    - Greedy algorithm: iterate through channels, assign pilot who last used that channel if available
    - Random tiebreaker if multiple pilots prefer same channel
    - Fallback: original order if no optimization possible
  - `formatChannel(channel: number): string` - returns "R1", "R4", etc.
- Create `tests/channel-assignment.test.ts` with tests for:
  - getChannelsForHeat for all sizes (1-4)
  - getChannelForPosition edge cases
  - optimizePilotOrder with various scenarios
  - formatChannel output

**Must NOT do**:
- Don't implement complex optimization (Hungarian algorithm, brute force permutations)
- Don't add configuration options
- Don't modify existing files yet (pure new module)

**Recommended Agent Profile**:
- **Category**: `business-logic`
  - Reason: Core algorithm implementation with TDD
- **Skills**: `[]`
  - Standard TypeScript development

**Parallelization**:
- **Can Run In Parallel**: NO (needs types from Task 1)
- **Parallel Group**: Wave 2 (alone)
- **Blocks**: Tasks 3, 4, 5
- **Blocked By**: Task 1

**References**:
- `src/lib/schemas.ts:3-10` - Pilot interface with lastChannel field
- `tests/heat-distribution.ts` - Example test file structure to follow
- `src/lib/heat-distribution.ts` - Similar utility module pattern

**Acceptance Criteria**:

**TDD Flow:**
```bash
# RED: Create test file first, run tests (should fail initially)
bun test tests/channel-assignment.test.ts
# Expected: Tests fail (implementation doesn't exist yet)

# GREEN: Implement channel-assignment.ts
bun test tests/channel-assignment.test.ts
# Expected: All tests pass

# REFACTOR: Clean up code
bun test tests/channel-assignment.test.ts
# Expected: Still passes
```

**Specific Test Cases to Cover:**
```typescript
// getChannelsForHeat
expect(getChannelsForHeat(4)).toEqual([1, 4, 6, 8])
expect(getChannelsForHeat(3)).toEqual([1, 4, 8])
expect(getChannelsForHeat(2)).toEqual([1, 8])
expect(getChannelsForHeat(1)).toEqual([1])

// getChannelForPosition
expect(getChannelForPosition(0, 4)).toBe(1)
expect(getChannelForPosition(1, 4)).toBe(4)
expect(getChannelForPosition(2, 4)).toBe(6)
expect(getChannelForPosition(3, 4)).toBe(8)
expect(getChannelForPosition(0, 3)).toBe(1)
expect(getChannelForPosition(1, 3)).toBe(4)
expect(getChannelForPosition(2, 3)).toBe(8)

// formatChannel
expect(formatChannel(1)).toBe('R1')
expect(formatChannel(4)).toBe('R4')

// optimizePilotOrder - all pilots have matching lastChannel
// Given: pilots with lastChannel [1, 4, 6, 8]
// When: optimizePilotOrder called
// Then: order unchanged (all match)

// optimizePilotOrder - cold start (no lastChannel)
// Given: pilots with undefined lastChannel
// When: optimizePilotOrder called
// Then: original order returned

// optimizePilotOrder - conflict resolution
// Given: 2 pilots both have lastChannel = 1
// When: optimizePilotOrder called
// Then: one gets position 0 (R1), other gets different position (random)
```

**Automated Verification:**
```bash
bun test tests/channel-assignment.test.ts
# Assert: All tests pass (0 failures)
# Assert: Coverage for getChannelsForHeat, getChannelForPosition, optimizePilotOrder, formatChannel
```

**Commit**: YES
- Message: `feat(channel): add channel assignment logic with smart optimization`
- Files: `src/lib/channel-assignment.ts`, `tests/channel-assignment.test.ts`
- Pre-commit: `bun test tests/channel-assignment.test.ts`

---

### Task 3: UI - Channel Badges in Bracket View

**What to do**:
- Import `formatChannel`, `getChannelForPosition` in `FilledBracketHeatBox.tsx`
- Add channel badge BEFORE pilot name in pilot row
- Badge format: `<span className="channel-badge">R1</span>`
- Style: Small, monospace font, subtle background (e.g., `bg-zinc-700 text-xs px-1 rounded`)
- Calculate channel from pilot's position in `heat.pilotIds` array

**Must NOT do**:
- Don't make badge interactive (no click handlers)
- Don't add tooltip or hover effects
- Don't change existing layout significantly
- Don't add channel history display

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: UI component modification with styling
- **Skills**: `["frontend-ui-ux"]`
  - frontend-ui-ux: For styling the badge appropriately

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Task 4)
- **Blocks**: Task 5
- **Blocked By**: Task 2

**References**:
- `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx` - Target component
- `src/lib/channel-assignment.ts` - Import formatChannel, getChannelForPosition
- Existing pilot row structure in component (look for `pilot-name` class)

**Acceptance Criteria**:

**Automated Verification (Playwright):**
```
# Agent executes via playwright browser automation:
1. Start dev server: bun run dev (background)
2. Navigate to: http://localhost:5173 (or configured port)
3. Create test tournament with 8 pilots
4. Start tournament, confirm heat assignment
5. Wait for bracket view to load
6. Assert: selector "[data-testid='channel-badge']" exists (or class .channel-badge)
7. Assert: Text content matches pattern /R[1468]/
8. Assert: Badge appears before pilot name in DOM order
9. Screenshot: .sisyphus/evidence/task-3-bracket-channels.png
```

**Manual Verification Command:**
```bash
# Build check
bun run build
# Assert: No TypeScript errors

# Dev server visual check (for development)
bun run dev
# Navigate to bracket view, verify badges appear
```

**Commit**: YES
- Message: `feat(ui): display channel badges in bracket heat boxes`
- Files: `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx`
- Pre-commit: `bun run build`

---

### Task 4: UI - Channel Badges in Placement Entry Modal

**What to do**:
- Import `formatChannel`, `getChannelForPosition` in `placement-entry-modal.tsx`
- Add channel badge next to pilot name in the pilot selection grid
- Same badge style as bracket view for consistency
- Calculate channel from pilot's position in original `heat.pilotIds` array (not from ranking)

**Must NOT do**:
- Don't change the click-to-rank functionality
- Don't add channel selection capability
- Don't modify keyboard shortcuts
- Don't change lap time entry flow

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: UI component modification with styling
- **Skills**: `["frontend-ui-ux"]`
  - frontend-ui-ux: For consistent badge styling

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Task 3)
- **Blocks**: Task 5
- **Blocked By**: Task 2

**References**:
- `src/components/placement-entry-modal.tsx` - Target component
- `src/lib/channel-assignment.ts` - Import formatChannel, getChannelForPosition
- Task 3 implementation for badge styling consistency

**Acceptance Criteria**:

**Automated Verification (Playwright):**
```
# Agent executes via playwright browser automation:
1. Continue from Task 3 state (tournament running)
2. Click on active heat to open placement modal
3. Wait for modal to be visible
4. Assert: Channel badges visible next to pilot names in modal
5. Assert: Badge text matches pattern /R[1468]/
6. Assert: Click-to-rank still works (click pilot, verify rank assigned)
7. Screenshot: .sisyphus/evidence/task-4-modal-channels.png
```

**Manual Verification Command:**
```bash
bun run build
# Assert: No TypeScript errors
```

**Commit**: YES
- Message: `feat(ui): display channel badges in placement entry modal`
- Files: `src/components/placement-entry-modal.tsx`
- Pre-commit: `bun run build`

---

### Task 5: Integration - Update lastChannel on Heat Completion

**What to do**:
- In `submitHeatResults` (tournamentStore.ts):
  - After processing rankings, update each pilot's `lastChannel` based on their position
  - Use `getChannelForPosition(index, heat.pilotIds.length)` to determine channel
  - Update pilot in `pilots` array with new `lastChannel` value
- In heat generation (where `pilotIds` arrays are created):
  - Before creating heat, call `optimizePilotOrder(pilotIds, pilots)` to reorder
  - This applies to: `generateHeats`, `createWBHeatFromPool`, `createLBHeatFromPool`, etc.
- Ensure `lastChannel` persists via existing Zustand persist middleware

**Must NOT do**:
- Don't modify heat results structure
- Don't change how pilots progress between brackets
- Don't add UI for viewing channel history
- Don't add configuration for enabling/disabling optimization

**Recommended Agent Profile**:
- **Category**: `business-logic`
  - Reason: Store logic modification with state updates
- **Skills**: `[]`
  - Standard Zustand/React development

**Parallelization**:
- **Can Run In Parallel**: NO (final integration task)
- **Parallel Group**: Wave 4 (alone)
- **Blocks**: None (final task)
- **Blocked By**: Tasks 2, 3, 4

**References**:
- `src/stores/tournamentStore.ts:519-714` - submitHeatResults function
- `src/stores/tournamentStore.ts:294-343` - generateHeats function
- `src/lib/bracket-logic.ts` - createWBHeatFromPool, createLBHeatFromPool
- `src/lib/channel-assignment.ts` - optimizePilotOrder, getChannelForPosition

**Acceptance Criteria**:

**TDD Tests to Add:**
```typescript
// tests/channel-persistence.test.ts
describe('Channel Persistence', () => {
  it('updates pilot lastChannel after heat completion', () => {
    // Setup: Create tournament, complete first heat
    // Assert: Each pilot's lastChannel matches their position's channel
  })
  
  it('persists lastChannel after page refresh', () => {
    // Setup: Complete heat, simulate localStorage restore
    // Assert: Pilot lastChannel values are restored
  })
  
  it('optimizes pilot order in new heats based on lastChannel', () => {
    // Setup: Set pilots with specific lastChannel values
    // Generate new heat
    // Assert: Pilot order maximizes channel matches
  })
})
```

**Automated Verification:**
```bash
# Run all tests including new integration tests
bun test
# Assert: All tests pass

# Specific integration test
bun test tests/channel-persistence.test.ts
# Assert: All channel persistence tests pass
```

**Playwright Verification:**
```
# Agent executes via playwright browser automation:
1. Start fresh dev server
2. Create tournament with 8 pilots
3. Start tournament, complete first heat with rankings
4. Refresh page
5. Assert: Pilots in next heat have channel badges
6. Assert: localStorage contains pilot data with lastChannel values
7. Screenshot: .sisyphus/evidence/task-5-persistence.png
```

**Commit**: YES
- Message: `feat(channel): persist pilot channels and optimize heat assignments`
- Files: `src/stores/tournamentStore.ts`, `src/lib/bracket-logic.ts`, `tests/channel-persistence.test.ts`
- Pre-commit: `bun test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(pilot): add lastChannel field for channel persistence` | schemas.ts | `bun run build` |
| 2 | `feat(channel): add channel assignment logic with smart optimization` | channel-assignment.ts, test | `bun test` |
| 3 | `feat(ui): display channel badges in bracket heat boxes` | FilledBracketHeatBox.tsx | `bun run build` |
| 4 | `feat(ui): display channel badges in placement entry modal` | placement-entry-modal.tsx | `bun run build` |
| 5 | `feat(channel): persist pilot channels and optimize heat assignments` | tournamentStore.ts, bracket-logic.ts, test | `bun test` |

---

## Success Criteria

### Verification Commands
```bash
# All tests pass
bun test
# Expected: 0 failures, all channel tests green

# Build succeeds
bun run build
# Expected: No errors

# TypeScript check
npx tsc --noEmit
# Expected: No type errors
```

### Final Checklist
- [x] All "Must Have" requirements implemented
- [x] All "Must NOT Have" guardrails respected
- [x] All 5 tasks completed with commits
- [x] Channel badges visible in bracket view
- [x] Channel badges visible in placement modal
- [x] lastChannel persists after heat completion
- [x] lastChannel persists after page refresh
- [x] Pilot order optimized in new heats
- [x] All existing tests still pass
- [x] New tests cover channel logic
