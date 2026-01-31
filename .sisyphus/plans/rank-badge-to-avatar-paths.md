# Rank-Badge to Pilot-Avatar Bezier Paths

## TL;DR

> **Quick Summary**: Refactor path source points to originate from rank badges (showing placement 1,2,3,4) instead of pilot avatars, creating clearer visual connection between ranking results and pilot progression.
> 
> **Deliverables**:
> - Rank-Badge DOM IDs: `rank-badge-${pilotId}-${heatId}`
> - New `getRankBadgePosition()` function in SVGPilotPaths.tsx
> - Updated path calculation: Rank-Badge → Pilot-Avatar
> - Tests for rank-badge position detection with fallback behavior
> 
> **Estimated Effort**: Short (2-3 focused work sessions)
> **Parallel Execution**: NO - Sequential TDD workflow
> **Critical Path**: Task 1 (Test + ID) → Task 2 (Test + Function) → Task 3 (Test + Integration)

---

## Context

### Original Request
Paths should go from RANK-BADGE → PILOT-AVATAR:
- START: Right edge of Rank-Badge + 8px offset (shows placement 1,2,3,4)
- END: Left edge of Pilot-Avatar - 8px offset (as before)

### Prior Work
Plan `pilot-avatar-bezier-paths.md` established avatar-to-avatar paths. This plan REFINES the source point from avatar to rank-badge.

### Current State
**BracketHeatBox.tsx** (lines 146-150):
```tsx
{rank && (
  <span className={cn('rank-badge', `r${rank}`)}>
    {rank}
  </span>
)}
```
- Pilot-avatar ID: `pilot-avatar-${pilotId}-${heatId}` (line 137)
- Rank-Badge: NO ID currently

**SVGPilotPaths.tsx**:
- `getPilotAvatarPosition(pilotId, heatId)` exists (lines 81-94)
- Path calculation (lines 118-119):
```tsx
const fromPos = getPilotAvatarPosition(segment.pilotId, segment.fromHeatId) ?? getPosition(segment.fromHeatId)
const toPos = getPilotAvatarPosition(segment.pilotId, segment.toHeatId) ?? getPosition(segment.toHeatId)
```
- Uses 8px AVATAR_OFFSET for positioning

**Key Constraint**: Rank-Badge only exists for completed heats with rankings.

---

## Work Objectives

### Core Objective
Connect Bezier paths from rank-badge (source heat) to pilot-avatar (target heat), providing visual clarity that paths originate from placement results.

### Concrete Deliverables
- `id="rank-badge-${pilot.id}-${heat.id}"` attribute on rank-badge span
- `getRankBadgePosition(pilotId, heatId)` function returning Position | null
- Modified path calculation with rank-badge → avatar fallback chain
- Test coverage for all scenarios

### Definition of Done
- [ ] `bun test tests/pilot-path-rendering.test.tsx` → All tests pass
- [ ] Paths visually start from rank badges in browser (completed heats)
- [ ] Paths fall back to avatar when rank-badge doesn't exist (pending heats)

### Must Have
- TDD workflow: failing test → implementation → passing test
- Git commit after each completed task
- Fallback chain: getRankBadgePosition() ?? getPilotAvatarPosition() ?? getPosition()

### Must NOT Have (Guardrails)
- NO changes to path END points (toPos stays avatar-based)
- NO changes to Bezier curve calculation logic (control points stay the same)
- NO changes to AVATAR_OFFSET constant
- NO changes to pilot-path-manager.ts (segment calculation is unchanged)
- NO refactoring beyond the specific task scope

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (vitest + @testing-library/react)
- **User wants tests**: TDD
- **Framework**: vitest with bun test

### TDD Structure
Each TODO follows RED-GREEN-REFACTOR:
1. **RED**: Write failing test first
2. **GREEN**: Implement minimum code to pass
3. **REFACTOR**: Clean up while keeping green

---

## Execution Strategy

### Sequential Execution (TDD Mandate)

```
Task 1: Add Rank-Badge ID
├── Write test for rank-badge ID existence
├── Add ID attribute to BracketHeatBox.tsx
└── Verify test passes → COMMIT

Task 2: Create getRankBadgePosition()
├── Write test for position detection
├── Implement function in SVGPilotPaths.tsx
└── Verify test passes → COMMIT

Task 3: Integrate into Path Calculation
├── Write test for rank-badge → avatar path
├── Modify fromPos calculation
└── Verify test passes → COMMIT
```

**Why Sequential**: TDD requires each test to fail before implementation. Parallel execution would break RED-GREEN-REFACTOR discipline.

### Dependency Matrix

| Task | Depends On | Blocks | Parallel |
|------|------------|--------|----------|
| 1 | None | 2, 3 | NO |
| 2 | 1 | 3 | NO |
| 3 | 1, 2 | None | NO |

---

## TODOs

### Task 1: Add Rank-Badge DOM ID

**What to do**:
1. **RED**: Add test verifying rank-badge has correct ID attribute
2. **GREEN**: Add `id={`rank-badge-${pilot.id}-${heat.id}`}` to span in BracketHeatBox.tsx
3. **REFACTOR**: Ensure ID format is consistent with avatar ID pattern

**Must NOT do**:
- Change rank-badge styling or className
- Modify conditional rendering logic
- Touch any other elements

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Single-file change, minimal scope, clear implementation
- **Skills**: None required
  - Simple DOM attribute addition

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential - Task 1
- **Blocks**: Tasks 2, 3
- **Blocked By**: None

**References**:

**Pattern References** (existing code to follow):
- `src/components/bracket/heat-boxes/BracketHeatBox.tsx:137` - Avatar ID pattern: `pilot-avatar-${pilot.id}-${heat.id}`
- `src/components/bracket/heat-boxes/BracketHeatBox.tsx:146-150` - Current rank-badge rendering

**Test References** (testing patterns to follow):
- `tests/pilot-path-rendering.test.tsx:141-150` - DOM element ID setup in tests
- `tests/pilot-path-rendering.test.tsx:49-54` - innerHTML setup for test elements

**WHY Each Reference Matters**:
- Line 137 shows the exact ID format to mirror for consistency
- Lines 146-150 are the exact location to modify
- Test patterns show how to set up DOM with IDs for verification

**Acceptance Criteria**:

**TDD Verification:**
- [ ] Test file: tests/pilot-path-rendering.test.tsx (or new file if preferred)
- [ ] Test: "rank-badge has correct ID when pilot has ranking"
- [ ] `bun test tests/pilot-path-rendering.test.tsx` → PASS

**Automated Verification:**
```bash
# Verify ID attribute exists in source
grep -n "rank-badge-\${pilot.id}-\${heat.id}" src/components/bracket/heat-boxes/BracketHeatBox.tsx
# Expected: Match on line ~147
```

**Commit**: YES
- Message: `feat(bracket): add DOM ID to rank-badge for path anchoring`
- Files: `src/components/bracket/heat-boxes/BracketHeatBox.tsx`, `tests/pilot-path-rendering.test.tsx`
- Pre-commit: `bun test tests/pilot-path-rendering.test.tsx`

---

### Task 2: Create getRankBadgePosition() Function

**What to do**:
1. **RED**: Add test for getRankBadgePosition returning correct Position when element exists
2. **RED**: Add test for getRankBadgePosition returning null when element doesn't exist
3. **GREEN**: Implement function analogous to getPilotAvatarPosition (lines 81-94)
4. **REFACTOR**: Ensure Position interface is reused correctly

**Must NOT do**:
- Modify getPilotAvatarPosition
- Change Position interface
- Modify getPosition function
- Touch path calculation yet (that's Task 3)

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Single function addition, mirrors existing pattern
- **Skills**: None required
  - Copy-and-adapt pattern from existing code

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential - Task 2
- **Blocks**: Task 3
- **Blocked By**: Task 1 (needs ID to exist in DOM for testing)

**References**:

**Pattern References** (existing code to follow):
- `src/components/bracket/SVGPilotPaths.tsx:81-94` - Exact pattern to mirror:
```tsx
const getPilotAvatarPosition = (pilotId: string, heatId: string): Position | null => {
  const avatarElement = document.getElementById(`pilot-avatar-${pilotId}-${heatId}`)
  if (!avatarElement) return null

  const rect = avatarElement.getBoundingClientRect()
  return {
    centerX: (rect.left - containerRect.left + rect.width / 2) / scale,
    centerY: (rect.top - containerRect.top + rect.height / 2) / scale,
    top: (rect.top - containerRect.top) / scale,
    bottom: (rect.bottom - containerRect.top) / scale,
    left: (rect.left - containerRect.left) / scale,
    right: (rect.right - containerRect.left) / scale
  }
}
```

**Type References** (contracts to implement against):
- `src/components/bracket/SVGPilotPaths.tsx:13-20` - Position interface definition

**Test References** (testing patterns to follow):
- `tests/pilot-path-rendering.test.tsx:170-179` - getBoundingClientRect mocking pattern for specific elements
- `tests/pilot-path-rendering.test.tsx:155-156` - getElementById for specific elements in test

**WHY Each Reference Matters**:
- Lines 81-94 are the EXACT pattern to copy, just change element ID prefix
- Position interface must be reused, not redefined
- Test mocking pattern shows how to mock specific element positions

**Acceptance Criteria**:

**TDD Verification:**
- [ ] Test: "getRankBadgePosition returns Position when element exists"
- [ ] Test: "getRankBadgePosition returns null when element doesn't exist"
- [ ] `bun test tests/pilot-path-rendering.test.tsx` → PASS

**Automated Verification:**
```bash
# Verify function exists in source
grep -n "getRankBadgePosition" src/components/bracket/SVGPilotPaths.tsx
# Expected: Function definition found
```

**Commit**: YES
- Message: `feat(paths): add getRankBadgePosition function for path source detection`
- Files: `src/components/bracket/SVGPilotPaths.tsx`, `tests/pilot-path-rendering.test.tsx`
- Pre-commit: `bun test tests/pilot-path-rendering.test.tsx`

---

### Task 3: Integrate Rank-Badge into Path Calculation

**What to do**:
1. **RED**: Add test verifying path starts from rank-badge right edge (not avatar)
2. **GREEN**: Modify fromPos calculation (line 118):
   ```tsx
   const fromPos = getRankBadgePosition(segment.pilotId, segment.fromHeatId) 
     ?? getPilotAvatarPosition(segment.pilotId, segment.fromHeatId) 
     ?? getPosition(segment.fromHeatId)
   ```
3. **REFACTOR**: Verify fallback chain works correctly

**Must NOT do**:
- Change toPos calculation (stays avatar-based)
- Modify Bezier control point logic
- Change AVATAR_OFFSET value
- Rename existing functions

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Single line modification with existing function
- **Skills**: None required
  - Simple integration of new function

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential - Task 3
- **Blocks**: None (final task)
- **Blocked By**: Tasks 1, 2

**References**:

**Pattern References** (existing code to follow):
- `src/components/bracket/SVGPilotPaths.tsx:118-119` - Current path calculation to modify
- `src/components/bracket/SVGPilotPaths.tsx:124-132` - Offset application (stays unchanged)

**Test References** (testing patterns to follow):
- `tests/pilot-path-rendering.test.tsx:196-198` - Path coordinate assertion pattern:
```tsx
// Path should start at avatar right edge (120) + offset (8) = 128
expect(pathD).toContain('M 128')
```

**WHY Each Reference Matters**:
- Line 118 is the exact line to modify
- Lines 124-132 show AVATAR_OFFSET usage (remains unchanged)
- Test assertion pattern shows how to verify path starting coordinates

**Acceptance Criteria**:

**TDD Verification:**
- [ ] Test: "path starts from rank-badge when rank-badge exists"
- [ ] Test: "path falls back to avatar when rank-badge doesn't exist"
- [ ] `bun test tests/pilot-path-rendering.test.tsx` → PASS

**Automated Verification:**
```bash
# Verify fallback chain in source
grep -A2 "fromPos = getRankBadgePosition" src/components/bracket/SVGPilotPaths.tsx
# Expected: Shows ?? getPilotAvatarPosition ?? getPosition chain
```

**Manual Browser Verification (if tests pass):**
```
1. Open bracket view with completed heats
2. Enable path visualization
3. Verify: Paths originate from rank numbers (1,2,3,4), not avatars
4. Verify: Paths still end at pilot avatars in target heat
```

**Commit**: YES
- Message: `feat(paths): connect bezier curves from rank-badge to pilot-avatar`
- Files: `src/components/bracket/SVGPilotPaths.tsx`, `tests/pilot-path-rendering.test.tsx`
- Pre-commit: `bun test tests/pilot-path-rendering.test.tsx`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(bracket): add DOM ID to rank-badge for path anchoring` | BracketHeatBox.tsx, test | `bun test` |
| 2 | `feat(paths): add getRankBadgePosition function for path source detection` | SVGPilotPaths.tsx, test | `bun test` |
| 3 | `feat(paths): connect bezier curves from rank-badge to pilot-avatar` | SVGPilotPaths.tsx, test | `bun test` |

---

## Success Criteria

### Verification Commands
```bash
# All tests pass
bun test tests/pilot-path-rendering.test.tsx

# Grep verification
grep -n "rank-badge-\${pilot.id}-\${heat.id}" src/components/bracket/heat-boxes/BracketHeatBox.tsx
grep -n "getRankBadgePosition" src/components/bracket/SVGPilotPaths.tsx
```

### Final Checklist
- [ ] All 3 tasks completed with commits
- [ ] All tests pass
- [ ] Rank-badge IDs present in DOM for completed heats
- [ ] Paths originate from rank-badges in browser
- [ ] Fallback to avatar works for pending heats
- [ ] No changes to path END points or curve calculation
