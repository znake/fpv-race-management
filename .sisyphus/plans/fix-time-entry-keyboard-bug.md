# Fix Time Entry Keyboard Bug + Visual Overlay

## TL;DR

> **Quick Summary**: Fix keyboard handler in PlacementEntryModal so digits 1-4 are captured as time digits when time entry mode is active, and add a centered visual overlay showing the formatted time as users type.
> 
> **Deliverables**:
> - Fixed `handleKeyDown` logic with correct priority order
> - New `TimeEntryOverlay` component with live formatted preview
> - Backspace support for digit deletion
> - Updated Escape key behavior for time entry mode
> - Updated tests reflecting correct behavior
> 
> **Estimated Effort**: Short (2-3 hours)
> **Parallel Execution**: NO - sequential (each task builds on previous)
> **Critical Path**: Task 1 (state) → Task 2 (overlay) → Task 3 (key handler) → Task 4 (tests)

---

## Context

### Original Request
User reported that typing digits 1-4 during time entry mode triggers rank changes instead of being captured as time digits. User also requested a large visual overlay to show the currently typed time for immediate feedback.

### Interview Summary
**Key Discussions**:
- Priority order: Time entry mode check FIRST, then rank shortcuts
- Overlay shows FORMATTED time ("1:23"), not raw digits ("123")
- Backspace deletes last digit; Escape clears buffer and exits time entry mode
- Test approach: Fix first, add tests after

**Research Findings**:
- Bug location: `handleKeyDown` lines 237-261 in `placement-entry-modal.tsx`
- Existing test on line 361-392 codifies buggy behavior - must be updated
- `formatLapTime` exists but needs partial input variant for overlay preview
- Modal overlay pattern: `fixed inset-0 z-50` with `bg-void/80` backdrop

### Metis Review
**Identified Gaps** (addressed):
- Partial time formatting needed for 1-2 digit previews → Add `formatPartialTimeEntry` helper
- Refs don't trigger re-renders → Use `useState` for overlay display state
- Escape key cascading → Stop propagation when clearing time buffer
- Accessibility → Add aria-live for screen reader announcements

---

## Work Objectives

### Core Objective
Fix the keyboard handler priority bug so all digits 0-9 are captured during time entry mode, and provide visual feedback via a prominent overlay.

### Concrete Deliverables
- Modified `handleKeyDown` function with correct condition order
- New `formatPartialTimeEntry` helper function in `ui-helpers.ts`
- New `TimeEntryOverlay` inline component in `placement-entry-modal.tsx`
- Updated `useState` for `displayedTimeDigits` to drive overlay
- Backspace key handler for digit deletion
- Modified Escape key behavior with time entry priority
- Updated test case for correct 1-4 digit handling
- New test cases for overlay, backspace, and escape behaviors

### Definition of Done
- [ ] `bun test` passes (all tests green)
- [ ] Clicking pilot → typing "123" → displays "1:23" in overlay → records 83000ms on submit
- [ ] Backspace removes last digit from overlay
- [ ] Escape clears overlay without resetting rankings

### Must Have
- Digits 1-4 captured as time digits when `lastClickedPilotIdRef.current` is set
- Live overlay showing formatted time preview
- Backspace support
- Escape clears time entry without affecting rankings

### Must NOT Have (Guardrails)
- DO NOT change rank assignment logic (`toggleRank`, `assignDirectRank`)
- DO NOT change timeout duration (stays at 2000ms)
- DO NOT change `parseLapTimeDigits` validation rules
- DO NOT add mobile-specific overlay variations
- DO NOT over-engineer with separate component files - inline overlay is sufficient

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES
- **User wants tests**: Tests-after
- **Framework**: vitest

### Manual Execution Verification

**For each task, verify via browser:**
1. Open app, navigate to bracket view
2. Click a heat to open PlacementEntryModal
3. Click pilot (rank assigned)
4. Type "123" → verify overlay shows "1:23"
5. Press Backspace → verify overlay shows "0:12"
6. Type "3" → verify overlay shows "1:23" again
7. Press Escape → verify overlay disappears, ranking stays
8. Wait 2s timeout, verify time recorded on submit

---

## Execution Strategy

### Sequential Execution (No Parallelization)
Each task depends on the previous one:

```
Task 1: Add state + helper function (foundation)
    ↓
Task 2: Add TimeEntryOverlay component (uses state from T1)
    ↓
Task 3: Fix handleKeyDown logic (uses state from T1, updates overlay from T2)
    ↓
Task 4: Update and add tests (verifies T1-T3)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4 | None |
| 2 | 1 | 3, 4 | None |
| 3 | 1, 2 | 4 | None |
| 4 | 1, 2, 3 | None | None (final) |

---

## TODOs

- [ ] 1. Add state management and partial time formatting helper

  **What to do**:
  - Add `formatPartialTimeEntry(digits: string): string` function to `src/lib/ui-helpers.ts`
    - Empty string → return empty string
    - 1 digit → "0:0X" (e.g., "1" → "0:01")
    - 2 digits → "0:XX" (e.g., "12" → "0:12")  
    - 3 digits → "M:SS" (e.g., "123" → "1:23")
    - 4+ digits → truncate to 3 and format
  - Add `useState` for `displayedTimeDigits` in `PlacementEntryModal` component
  - Update `timeDigitBufferRef` assignments to also call `setDisplayedTimeDigits`
  - Update `finalizeTimeEntry` and `resetRankings` to clear `displayedTimeDigits`
  - Update cleanup effect (lines 281-296) to also clear `displayedTimeDigits`

  **Must NOT do**:
  - DO NOT modify `parseLapTimeDigits` - it handles validation differently
  - DO NOT change the 2000ms timeout value

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, focused changes to existing files
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: React state management patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential - Task 1
  - **Blocks**: Tasks 2, 3, 4
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/lib/ui-helpers.ts:170-175` - `formatLapTime` function pattern (similar formatting logic)
  - `src/components/placement-entry-modal.tsx:42-50` - Existing useState declarations to follow pattern

  **API/Type References**:
  - `src/lib/ui-helpers.ts:182-209` - `parseLapTimeDigits` for understanding digit→time conversion (but different purpose)

  **Test References**:
  - `tests/lap-time-formatting.test.ts:27-65` - Test structure for time parsing functions

  **WHY Each Reference Matters**:
  - `formatLapTime`: Use same M:SS output format, ensure consistency
  - Existing useState: Follow same declaration pattern for consistency
  - `parseLapTimeDigits`: Understand the digit format expectations (2-3 digits)

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Using playwright browser automation:
    - Import `formatPartialTimeEntry` in browser console (or via test)
    - Verify: `formatPartialTimeEntry("")` → `""`
    - Verify: `formatPartialTimeEntry("1")` → `"0:01"`
    - Verify: `formatPartialTimeEntry("12")` → `"0:12"`
    - Verify: `formatPartialTimeEntry("123")` → `"1:23"`

  **Commit**: YES
  - Message: `feat(placement): add state and helper for time entry overlay`
  - Files: `src/lib/ui-helpers.ts`, `src/components/placement-entry-modal.tsx`
  - Pre-commit: `bun test tests/lap-time-formatting.test.ts`

---

- [ ] 2. Add TimeEntryOverlay component

  **What to do**:
  - Add inline `TimeEntryOverlay` component inside `PlacementEntryModal` (before the return statement, or as a render section)
  - Overlay structure:
    ```tsx
    {displayedTimeDigits && (
      <div 
        className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="bg-void/90 px-12 py-8 rounded-2xl border-2 border-neon-cyan shadow-glow-cyan">
          <div className="font-display text-8xl text-chrome tracking-wider">
            {formatPartialTimeEntry(displayedTimeDigits)}
          </div>
          <div className="text-center text-steel mt-2 text-xl">
            Zeit eingeben...
          </div>
        </div>
      </div>
    )}
    ```
  - Position: Fixed, centered, z-index above modal (z-[60] since modal is z-50)
  - Style: Match existing design system (font-display, text-chrome, border-neon-cyan, shadow-glow-cyan)
  - Add `pointer-events-none` so clicks pass through to pilot cards
  - Add `aria-live="polite"` for screen reader announcements

  **Must NOT do**:
  - DO NOT create a separate component file - inline is sufficient
  - DO NOT add dismiss button - Escape/Backspace handle this
  - DO NOT add animations yet - keep it simple

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with specific styling requirements
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: React component patterns, TailwindCSS styling

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential - Task 2
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/components/ui/modal.tsx:58-66` - Fixed overlay positioning pattern (`fixed inset-0 z-50 flex items-center justify-center`)
  - `src/components/placement-entry-modal.tsx:381-391` - Rank badge styling classes (font-display, text-chrome)

  **Documentation References**:
  - TailwindCSS: `pointer-events-none` class for click-through behavior

  **WHY Each Reference Matters**:
  - Modal overlay: Exact positioning pattern to follow (fixed, centered, z-index)
  - Rank badge styling: Consistent font and color classes from design system

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Using playwright browser automation:
    - Navigate to: `http://localhost:5173` (or dev server port)
    - Open bracket view, click heat to open modal
    - Click a pilot (rank assigned)
    - Verify: Overlay appears centered on screen
    - Verify: Overlay shows "0:0_" or similar placeholder if state is set
    - Verify: Clicking pilot cards still works (pointer-events-none)
    - Screenshot: Save evidence to `.sisyphus/evidence/task-2-overlay.png`

  **Commit**: YES
  - Message: `feat(placement): add time entry overlay component`
  - Files: `src/components/placement-entry-modal.tsx`
  - Pre-commit: `bun test tests/placement-entry-modal.test.tsx`

---

- [ ] 3. Fix handleKeyDown logic with correct priority order

  **What to do**:
  - Restructure `handleKeyDown` (lines 233-274) with this priority:
    1. **FIRST**: Time entry mode active (`lastClickedPilotIdRef.current`) + digit key → capture ALL 0-9
    2. **SECOND**: Time entry mode active + Backspace → delete last digit
    3. **THIRD**: Time entry mode active + Escape → clear buffer, exit time entry mode, stop propagation
    4. **FOURTH**: Pilot focused + no time entry + 1-4 → assign direct rank
    5. **FIFTH**: Escape (no time entry) → reset rankings or close modal (existing behavior)
  
  - Change digit check from `['0', '5', '6', '7', '8', '9'].includes(e.key)` to `/^[0-9]$/.test(e.key)`
  - Add Backspace handler:
    ```tsx
    if (lastClickedPilotIdRef.current && e.key === 'Backspace') {
      e.preventDefault()
      const newBuffer = timeDigitBufferRef.current.slice(0, -1)
      timeDigitBufferRef.current = newBuffer
      setDisplayedTimeDigits(newBuffer)
      // Reset timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (newBuffer) {
        timeoutRef.current = setTimeout(finalizeTimeEntry, 2000)
      } else {
        // Buffer empty, close time entry mode
        lastClickedPilotIdRef.current = null
        timeoutRef.current = null
      }
      return
    }
    ```
  - Add Escape handler for time entry mode (BEFORE existing Escape handler):
    ```tsx
    if (lastClickedPilotIdRef.current && e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      // Clear time entry without affecting rankings
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      lastClickedPilotIdRef.current = null
      timeDigitBufferRef.current = ''
      setDisplayedTimeDigits('')
      timeoutRef.current = null
      return
    }
    ```
  - Update digit handler to set `displayedTimeDigits` state alongside ref

  **Must NOT do**:
  - DO NOT change the behavior of rank shortcuts when time entry is NOT active
  - DO NOT change the 2000ms timeout
  - DO NOT change how `finalizeTimeEntry` parses/validates the time

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex conditional logic requiring careful ordering
  - **Skills**: None needed - pure logic refactoring

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential - Task 3
  - **Blocks**: Task 4
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `src/components/placement-entry-modal.tsx:233-274` - Current handleKeyDown implementation (THE CODE TO MODIFY)
  - `src/components/placement-entry-modal.tsx:89-103` - `finalizeTimeEntry` function (called after timeout)
  - `src/components/placement-entry-modal.tsx:105-119` - `openTimeEntryWindow` function (timeout setup pattern)

  **Test References**:
  - `tests/placement-entry-modal.test.tsx:361-392` - Test that codifies buggy behavior (MUST UPDATE)
  - `tests/placement-entry-modal.test.tsx:293-325` - Existing digit accumulation test pattern

  **WHY Each Reference Matters**:
  - handleKeyDown: This is the exact code being modified
  - finalizeTimeEntry: Understand how buffer is finalized (don't break this flow)
  - openTimeEntryWindow: Timeout management pattern to follow
  - Buggy test: Must be updated to reflect new correct behavior

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Using playwright browser automation:
    - Navigate to modal, click pilot
    - Type "1" → verify overlay shows "0:01"
    - Type "2" → verify overlay shows "0:12"
    - Type "3" → verify overlay shows "1:23"
    - Press Backspace → verify overlay shows "0:12"
    - Press Escape → verify overlay disappears, rank stays
    - Click pilot again, type "45" → wait 2s → submit
    - Verify: `lapTimeMs: 45000` in submitted data

  - [ ] Verify rank shortcuts still work when NOT in time entry mode:
    - Open fresh modal
    - Focus pilot card (don't click)
    - Press "2" → verify rank 2 assigned (NOT time entry)

  **Commit**: YES
  - Message: `fix(placement): capture digits 1-4 as time entry when mode active`
  - Files: `src/components/placement-entry-modal.tsx`
  - Pre-commit: `bun test tests/placement-entry-modal.test.tsx`

---

- [ ] 4. Update and add tests for fixed behavior

  **What to do**:
  - **UPDATE** existing test `'should treat keys 1-4 as rank keys and not time digits'` (lines 361-392):
    - Rename to: `'should capture digits 1-4 as time digits when time entry mode is active'`
    - Change expectation: typing "105" after clicking pilot → `lapTimeMs: 65000` (1:05)
  
  - **ADD** new test: `'should show overlay with formatted time while typing'`
    - Click pilot, type "1", verify overlay contains "0:01"
    - Type "23", verify overlay contains "1:23"
    - Use `screen.getByText` or `screen.queryByText` with regex
  
  - **ADD** new test: `'should delete last digit on Backspace'`
    - Click pilot, type "123"
    - Press Backspace, verify overlay shows "0:12"
    - Press Backspace twice more, verify overlay disappears (time entry mode exited)
  
  - **ADD** new test: `'should clear time entry on Escape without affecting rankings'`
    - Click pilot (rank 1 assigned), type "123"
    - Press Escape
    - Verify: overlay gone, rank 1 still visible
    - Click second pilot (rank 2), submit
    - Verify: `lapTimeMs: undefined` for first pilot (time was cleared)
  
  - **ADD** test for `formatPartialTimeEntry` in `tests/lap-time-formatting.test.ts`:
    - Test empty string, 1 digit, 2 digits, 3 digits, 4+ digits

  **Must NOT do**:
  - DO NOT remove existing passing tests
  - DO NOT change test infrastructure/setup

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Writing tests following existing patterns
  - **Skills**: None needed - follow existing test patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential - Task 4 (final)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - `tests/placement-entry-modal.test.tsx:284-291` - `beforeEach`/`afterEach` with fake timers
  - `tests/placement-entry-modal.test.tsx:293-325` - Digit accumulation test pattern (exact structure to follow)
  - `tests/lap-time-formatting.test.ts:27-65` - Unit test structure for helper functions

  **Test References**:
  - `tests/placement-entry-modal.test.tsx:361-392` - THE TEST TO UPDATE (currently codifies bug)

  **WHY Each Reference Matters**:
  - Timer setup: Must use `vi.useFakeTimers()` for timeout-dependent tests
  - Digit accumulation test: Exact pattern for typing digits and advancing timers
  - Buggy test: This specific test must be rewritten

  **Acceptance Criteria**:

  **Test Execution:**
  - [ ] `bun test tests/lap-time-formatting.test.ts` → ALL PASS
  - [ ] `bun test tests/placement-entry-modal.test.tsx` → ALL PASS
  - [ ] `bun test` → ALL PASS (full suite)

  **Commit**: YES
  - Message: `test(placement): update tests for fixed time entry behavior`
  - Files: `tests/placement-entry-modal.test.tsx`, `tests/lap-time-formatting.test.ts`
  - Pre-commit: `bun test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(placement): add state and helper for time entry overlay` | `src/lib/ui-helpers.ts`, `src/components/placement-entry-modal.tsx` | `bun test tests/lap-time-formatting.test.ts` |
| 2 | `feat(placement): add time entry overlay component` | `src/components/placement-entry-modal.tsx` | `bun test tests/placement-entry-modal.test.tsx` |
| 3 | `fix(placement): capture digits 1-4 as time entry when mode active` | `src/components/placement-entry-modal.tsx` | `bun test tests/placement-entry-modal.test.tsx` |
| 4 | `test(placement): update tests for fixed time entry behavior` | `tests/placement-entry-modal.test.tsx`, `tests/lap-time-formatting.test.ts` | `bun test` |

---

## Success Criteria

### Verification Commands
```bash
bun test                                    # ALL PASS
bun test tests/placement-entry-modal.test.tsx  # Specific component tests pass
bun test tests/lap-time-formatting.test.ts     # Helper function tests pass
```

### Final Checklist
- [ ] Typing "123" during time entry mode records lapTimeMs: 83000
- [ ] Overlay displays "1:23" when "123" is typed
- [ ] Backspace removes last digit from overlay
- [ ] Escape clears time entry without resetting rankings
- [ ] Rank shortcuts (1-4) still work when NOT in time entry mode
- [ ] All tests pass
- [ ] No console errors in browser
