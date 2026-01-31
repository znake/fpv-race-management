# Pilot Avatar Bezier Path Connections

## TL;DR

> **Quick Summary**: Refactor Bezier curve paths to connect individual pilot avatars instead of heat box centers, creating elegant S-curves between specific pilots as they progress through the tournament bracket.
> 
> **Deliverables**:
> - Unique DOM IDs on pilot avatar elements for position tracking
> - Enhanced PathSegment interface with pilotId
> - Cubic Bezier S-curve calculation for avatar-to-avatar paths
> - Updated tests covering new functionality
> 
> **Estimated Effort**: Medium (3-4 focused work sessions)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 3 → Task 4

---

## Context

### Original Request
Connect Bezier curves between individual pilot avatars instead of heat centers. Curves should start FROM the pilot's image/avatar in the source heat and end AT the pilot's image/avatar in the target heat, with elegant S-curves that start offset from the avatar edge.

### Interview Summary
**Key Discussions**:
- Bracket flows top-to-bottom (Qualification → Winners/Losers → Grand Finale)
- Current implementation uses `document.getElementById(heat.id)` to find heat positions
- Pilots rendered in `FilledBracketHeatBox` have NO unique DOM identifiers
- PathSegment interface lacks pilotId field
- Existing Quadratic Bezier goes from heat bottom-center to heat top-center

**Research Findings**:
- `SVGPilotPaths.tsx` uses Quadratic Bezier (`Q` command) with single control point
- `pilot-path-manager.ts` already loops through pilots calling `calculatePilotPath(pilot.id, heats)` - pilotId is known at render time
- FilledBracketHeatBox has `bracketHeat.id` on container but nothing on individual pilots
- Good test coverage exists: `pilot-path-calculation.test.ts`, `pilot-path-rendering.test.tsx`
- Scale compensation already works correctly (dividing by `scale`)

### Gap Analysis (Self-Review)
**Identified Gaps** (addressed):
- Curve direction choice: Applied default of Right-to-Left exit/entry for natural flow
- Offset distance: Applied default of 8-10px for breathing room
- Curve style: Applied Cubic Bezier S-curve for elegance
- Arrow markers: Keeping existing `#pilot-arrow` and `#pilot-x` markers

---

## Work Objectives

### Core Objective
Enable Bezier path lines to connect specific pilot avatars across heats, creating a visual journey for each pilot through the bracket that highlights their actual position within each heat box.

### Concrete Deliverables
- `FilledBracketHeatBox.tsx`: Pilot avatar elements with unique IDs `pilot-avatar-{pilotId}-{heatId}`
- `pilot-path-manager.ts`: PathSegment interface extended with `pilotId: string`
- `SVGPilotPaths.tsx`: New `getPilotAvatarPosition()` function and Cubic Bezier calculation
- Updated test files covering new functionality

### Definition of Done
- [ ] `bun test` passes with all existing + new tests
- [ ] Pilot path lines visibly connect avatar-to-avatar (verified via Playwright screenshot)
- [ ] Zoom/pan still works correctly with new path calculations
- [ ] Hover highlight still works on pilot paths

### Must Have
- Unique DOM identifiers on pilot avatars
- pilotId included in PathSegment
- Cubic Bezier S-curve between avatars
- Scale compensation (existing pattern)
- Backward-compatible with existing hover/marker functionality

### Must NOT Have (Guardrails)
- DO NOT change the hover behavior or color assignment logic
- DO NOT modify the SVG marker definitions (`#pilot-arrow`, `#pilot-x`)
- DO NOT add new dependencies for path calculation
- DO NOT break existing tests - extend them
- DO NOT change heat box layout or pilot row styling
- AVOID over-engineering: Simple offset values (8px constant), not dynamic calculations

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (Vitest + Testing Library)
- **User wants tests**: YES (TDD approach - tests first)
- **Framework**: `vitest` with `@testing-library/react`

### TDD Approach

Each task follows RED-GREEN-REFACTOR:
1. **RED**: Write failing test first
2. **GREEN**: Implement minimum code to pass
3. **REFACTOR**: Clean up while keeping green

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Add pilot avatar DOM IDs to FilledBracketHeatBox
└── Task 2: Extend PathSegment interface with pilotId

Wave 2 (After Wave 1):
├── Task 3: Implement avatar position lookup in SVGPilotPaths
└── Task 4: Implement Cubic Bezier S-curve calculation

Critical Path: Task 1 → Task 3 → Task 4
Parallel Speedup: ~30% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3 | 2 |
| 2 | None | 3 | 1 |
| 3 | 1, 2 | 4 | None |
| 4 | 3 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | Both can run in parallel with `run_in_background=true` |
| 2 | 3, 4 | Sequential - 3 must complete before 4 |

---

## TODOs

- [ ] 1. Add Pilot Avatar DOM IDs to FilledBracketHeatBox

  **What to do**:
  - Add `id` attribute to the pilot avatar `<img>` element
  - Format: `pilot-avatar-{pilotId}-{heatId}`
  - The heatId is available from `bracketHeat.id`
  - Write test first verifying DOM id attribute exists

  **Must NOT do**:
  - DO NOT change any styling or layout
  - DO NOT add data attributes - use standard `id`
  - DO NOT modify pilot row structure beyond adding the id

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, focused change to a single file with clear scope
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: React component modification with DOM awareness
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed until final commit phase

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `/src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx:126-133` - Current pilot avatar `<img>` element to modify
  - `/src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx:103` - How `bracketHeat` is used for heat identification (`data-testid`)

  **Test References** (testing patterns to follow):
  - `/tests/pilot-path-rendering.test.tsx:49-54` - How DOM elements are set up in tests with specific IDs
  - `/tests/pilot-path-calculation.test.ts:5-14` - `createMockHeat` pattern for test fixtures

  **Type References**:
  - `/src/components/bracket/types.ts` - `FilledBracketHeatBoxProps` interface (contains `bracketHeat` with `id`)

  **Acceptance Criteria**:

  **TDD (RED phase)**:
  - [ ] Test file: `tests/pilot-avatar-ids.test.tsx`
  - [ ] Test: `it('renders pilot avatars with unique IDs in format pilot-avatar-{pilotId}-{heatId}')`
  - [ ] `bun test tests/pilot-avatar-ids.test.tsx` → FAIL (test exists, DOM id doesn't)

  **TDD (GREEN phase)**:
  - [ ] Add `id={`pilot-avatar-${pilot.id}-${bracketHeat.id}`}` to the `<img>` element
  - [ ] `bun test tests/pilot-avatar-ids.test.tsx` → PASS

  **Automated Verification**:
  ```bash
  # Agent runs:
  bun test tests/pilot-avatar-ids.test.tsx
  # Assert: All tests pass
  
  # Verify existing tests still pass:
  bun test tests/pilot-path-rendering.test.tsx
  # Assert: No regressions
  ```

  **Commit**: YES
  - Message: `feat(bracket): add unique DOM IDs to pilot avatar elements`
  - Files: `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx`, `tests/pilot-avatar-ids.test.tsx`
  - Pre-commit: `bun test`

---

- [ ] 2. Extend PathSegment Interface with pilotId

  **What to do**:
  - Add `pilotId: string` field to the `PathSegment` interface
  - Update `calculatePilotPath` function to include pilotId in each segment
  - The pilotId is already the first argument to `calculatePilotPath(pilotId, heats)`
  - Write test first verifying pilotId is present in returned segments

  **Must NOT do**:
  - DO NOT change the function signature (pilotId is already passed in)
  - DO NOT modify color assignment logic
  - DO NOT change elimination detection logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small interface change with straightforward implementation
  - **Skills**: None needed
    - Reason: Pure TypeScript interface + logic change, no special skills required
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not a UI change

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `/src/lib/pilot-path-manager.ts:3-7` - Current `PathSegment` interface to extend
  - `/src/lib/pilot-path-manager.ts:40-66` - `calculatePilotPath` function to update
  - `/src/lib/pilot-path-manager.ts:58-62` - Where segments are pushed (add pilotId here)

  **Test References** (testing patterns to follow):
  - `/tests/pilot-path-calculation.test.ts:115-137` - Existing `calculatePilotPath` tests to extend
  - `/tests/pilot-path-calculation.test.ts:123-124` - Expected segment shape assertion pattern

  **Acceptance Criteria**:

  **TDD (RED phase)**:
  - [ ] Add test in `tests/pilot-path-calculation.test.ts`:
    ```typescript
    it('should include pilotId in each path segment', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'h1', heatNumber: 1, pilotIds: ['p1'], status: 'completed' }),
        createMockHeat({ id: 'h2', heatNumber: 2, pilotIds: ['p1'], status: 'completed' })
      ]
      const path = calculatePilotPath('p1', heats)
      expect(path[0]).toHaveProperty('pilotId', 'p1')
    })
    ```
  - [ ] `bun test tests/pilot-path-calculation.test.ts` → FAIL

  **TDD (GREEN phase)**:
  - [ ] Add `pilotId: string` to `PathSegment` interface
  - [ ] Add `pilotId` to segment object in `calculatePilotPath`
  - [ ] `bun test tests/pilot-path-calculation.test.ts` → PASS

  **Automated Verification**:
  ```bash
  # Agent runs:
  bun test tests/pilot-path-calculation.test.ts
  # Assert: All tests pass including new pilotId test
  
  # Type check:
  bunx tsc --noEmit
  # Assert: No type errors
  ```

  **Commit**: YES
  - Message: `feat(pilot-path): add pilotId field to PathSegment interface`
  - Files: `src/lib/pilot-path-manager.ts`, `tests/pilot-path-calculation.test.ts`
  - Pre-commit: `bun test`

---

- [ ] 3. Implement Avatar Position Lookup in SVGPilotPaths

  **What to do**:
  - Create new `getPilotAvatarPosition` function that finds pilot avatar by ID
  - Use format: `document.getElementById(`pilot-avatar-${pilotId}-${heatId}`)`
  - Return avatar position with right edge X, center Y for source; left edge X, center Y for target
  - Update path calculation loop to use pilotId from segment (Task 2)
  - Handle fallback to heat center if avatar element not found

  **Must NOT do**:
  - DO NOT remove the existing `getPosition` function (keep as fallback)
  - DO NOT change hover logic
  - DO NOT modify SVG marker definitions
  - DO NOT change the path rendering JSX (only the path `d` calculation)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: DOM geometry calculations requiring understanding of coordinate systems
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: React component with DOM interaction and coordinate math
  - **Skills Evaluated but Omitted**:
    - `playwright`: Testing will use existing patterns, not browser automation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1 (needs DOM IDs), Task 2 (needs pilotId in segment)

  **References**:

  **Pattern References** (existing code to follow):
  - `/src/components/bracket/SVGPilotPaths.tsx:79-90` - Current `getPosition` function (follow this pattern)
  - `/src/components/bracket/SVGPilotPaths.tsx:84-88` - Scale compensation pattern (divide by `scale`)
  - `/src/components/bracket/SVGPilotPaths.tsx:92-124` - Path calculation loop to update

  **API/Type References**:
  - `/src/components/bracket/SVGPilotPaths.tsx:13-18` - `Position` interface (may need extension)
  - `/src/lib/pilot-path-manager.ts:3-7` - `PathSegment` interface (now includes pilotId)

  **Test References**:
  - `/tests/pilot-path-rendering.test.tsx:46-60` - DOM setup pattern with mocked `getBoundingClientRect`
  - `/tests/pilot-path-rendering.test.tsx:9-10` - How to mock `getBoundingClientRect`

  **Acceptance Criteria**:

  **TDD (RED phase)**:
  - [ ] Test file: Update `tests/pilot-path-rendering.test.tsx`
  - [ ] Add test: `it('uses pilot avatar position when avatar element exists')`
  - [ ] Mock DOM with pilot avatar elements: `<img id="pilot-avatar-p1-heat-1" />`
  - [ ] Assert path uses avatar coordinates, not heat center
  - [ ] `bun test tests/pilot-path-rendering.test.tsx` → FAIL

  **TDD (GREEN phase)**:
  - [ ] Implement `getPilotAvatarPosition(pilotId: string, heatId: string): Position | null`
  - [ ] Update segment loop to call `getPilotAvatarPosition(segment.pilotId, segment.fromHeatId)`
  - [ ] Fallback to `getPosition(segment.fromHeatId)` if avatar not found
  - [ ] `bun test tests/pilot-path-rendering.test.tsx` → PASS

  **Automated Verification**:
  ```bash
  # Agent runs:
  bun test tests/pilot-path-rendering.test.tsx
  # Assert: All tests pass
  
  # Run full test suite for regressions:
  bun test
  # Assert: All tests pass
  ```

  **Commit**: YES
  - Message: `feat(pilot-path): implement avatar position lookup for path endpoints`
  - Files: `src/components/bracket/SVGPilotPaths.tsx`, `tests/pilot-path-rendering.test.tsx`
  - Pre-commit: `bun test`

---

- [ ] 4. Implement Cubic Bezier S-Curve Calculation

  **What to do**:
  - Replace Quadratic Bezier (`Q`) with Cubic Bezier (`C`) for smoother S-curves
  - Calculate two control points for elegant curvature:
    - Control Point 1: Horizontal exit from source avatar (startX + offset, startY + curveDepth)
    - Control Point 2: Horizontal entry to target avatar (endX - offset, endY - curveDepth)
  - Add offset constant (8px) for breathing room from avatar edge
  - Update Position interface to include `left`, `right` edges (not just centerX)

  **Cubic Bezier Formula**:
  ```
  const AVATAR_OFFSET = 8 // pixels
  const startX = fromPos.right + AVATAR_OFFSET  // Right edge of source avatar
  const startY = fromPos.centerY
  const endX = toPos.left - AVATAR_OFFSET       // Left edge of target avatar  
  const endY = toPos.centerY
  
  // Control points for S-curve
  const deltaY = endY - startY
  const cp1x = startX + 30  // Exit horizontal then curve
  const cp1y = startY + deltaY * 0.3
  const cp2x = endX - 30    // Approach horizontal
  const cp2y = endY - deltaY * 0.3
  
  const d = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`
  ```

  **Must NOT do**:
  - DO NOT change marker attachment (`markerEnd` still works with Cubic)
  - DO NOT make offset configurable (use constant 8px)
  - DO NOT over-engineer control point math - simple formula is sufficient
  - DO NOT break the path for edge cases (use sensible defaults)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: SVG path geometry and visual aesthetics requiring coordinate math
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: SVG manipulation and visual design implementation
  - **Skills Evaluated but Omitted**:
    - `playwright`: Final visual verification will be done manually or via screenshot

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (final task)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 3 (needs avatar position lookup working)

  **References**:

  **Pattern References** (existing code to follow):
  - `/src/components/bracket/SVGPilotPaths.tsx:104-114` - Current Bezier calculation to replace
  - `/src/components/bracket/SVGPilotPaths.tsx:13-18` - Position interface to extend with `left`, `right`

  **External References** (SVG path syntax):
  - MDN: Cubic Bezier syntax is `C cp1x cp1y, cp2x cp2y, endX endY`
  - The `M` (moveTo) and `C` (curveTo) commands

  **Test References**:
  - `/tests/pilot-path-rendering.test.tsx` - Existing path rendering tests

  **Acceptance Criteria**:

  **TDD (RED phase)**:
  - [ ] Add test: `it('generates Cubic Bezier path with C command')`
  - [ ] Assert rendered path `d` attribute contains `C` not `Q`
  - [ ] `bun test tests/pilot-path-rendering.test.tsx` → FAIL

  **TDD (GREEN phase)**:
  - [ ] Extend `Position` interface with `left: number`, `right: number`
  - [ ] Update `getPilotAvatarPosition` to return left/right edges
  - [ ] Replace `Q controlX controlY endX endY` with `C cp1x cp1y, cp2x cp2y, endX endY`
  - [ ] `bun test tests/pilot-path-rendering.test.tsx` → PASS

  **Automated Verification**:
  ```bash
  # Agent runs:
  bun test tests/pilot-path-rendering.test.tsx
  # Assert: Path uses Cubic Bezier (C command)
  
  # Full test suite:
  bun test
  # Assert: All tests pass
  
  # Type check:
  bunx tsc --noEmit
  # Assert: No type errors
  ```

  **Visual Verification** (using Playwright skill):
  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000/bracket (or bracket page URL)
  2. Wait for: selector ".pilot-path" to be visible
  3. Assert: SVG paths are visible connecting pilots
  4. Screenshot: .sisyphus/evidence/task-4-cubic-bezier-paths.png
  ```

  **Commit**: YES
  - Message: `feat(pilot-path): implement Cubic Bezier S-curves for avatar-to-avatar paths`
  - Files: `src/components/bracket/SVGPilotPaths.tsx`, `tests/pilot-path-rendering.test.tsx`
  - Pre-commit: `bun test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(bracket): add unique DOM IDs to pilot avatar elements` | FilledBracketHeatBox.tsx, tests/pilot-avatar-ids.test.tsx | `bun test` |
| 2 | `feat(pilot-path): add pilotId field to PathSegment interface` | pilot-path-manager.ts, tests/pilot-path-calculation.test.ts | `bun test` |
| 3 | `feat(pilot-path): implement avatar position lookup for path endpoints` | SVGPilotPaths.tsx, tests/pilot-path-rendering.test.tsx | `bun test` |
| 4 | `feat(pilot-path): implement Cubic Bezier S-curves for avatar-to-avatar paths` | SVGPilotPaths.tsx, tests/pilot-path-rendering.test.tsx | `bun test` |

---

## Success Criteria

### Verification Commands
```bash
bun test                    # Expected: All tests pass
bunx tsc --noEmit           # Expected: No type errors
bun run dev                 # Expected: App runs without errors
```

### Final Checklist
- [ ] Pilot avatars have unique DOM IDs in format `pilot-avatar-{pilotId}-{heatId}`
- [ ] PathSegment includes pilotId field
- [ ] SVG paths connect avatar-to-avatar (not heat-center-to-heat-center)
- [ ] Paths use Cubic Bezier (S-curve) for elegance
- [ ] Zoom/pan works correctly with new paths
- [ ] Hover highlighting still functions
- [ ] Arrow markers still appear at path endpoints
- [ ] All existing tests pass
- [ ] New tests cover the added functionality
