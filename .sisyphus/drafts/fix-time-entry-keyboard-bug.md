# Draft: Fix Time Entry Keyboard Bug + Visual Overlay

## Requirements (confirmed)

### Bug Description
- In `PlacementEntryModal.handleKeyDown` (lines 233-274), digits 1-4 trigger rank changes even when time entry mode is active
- Time entry mode is indicated by `lastClickedPilotIdRef.current` being set
- Currently only digits 0, 5-9 are captured as time digits; 1-4 are always treated as rank shortcuts

### User's Decision on Fix Approach
- When time entry mode is active, ALL digits 0-9 should go to time buffer
- Priority order in handleKeyDown:
  1. FIRST: Check `lastClickedPilotIdRef.current` → capture ALL digits 0-9
  2. SECOND: Check focused pilot + no time entry mode → allow rank shortcuts 1-4
- User must click another pilot or wait for timeout to use rank shortcuts again

### Visual Overlay Requirements
- Show FORMATTED time preview (e.g., "1:23") not raw digits ("123")
- Centered on screen, large and prominent
- Updates LIVE as each digit is typed
- Backspace deletes last digit
- Escape clears time buffer AND closes time entry mode (does NOT reset rankings or close modal)

## Technical Decisions

### Key Handler Logic Change
- Move time digit check BEFORE focused pilot rank check
- Expand digit check from `['0', '5', '6', '7', '8', '9']` to `['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']` (or use regex `/^\d$/`)

### Overlay Implementation
- New React state: `displayedTimeDigits` to trigger re-renders for overlay
- Overlay component: Fixed position, centered, large font (matching existing design system)
- Use `formatLapTime` from `ui-helpers.ts` for preview (but need partial formatting for incomplete input)
- Animation: fade-in/fade-out matching existing transitions

### Escape Key Behavior (NEW)
- Current: Escape resets rankings OR closes modal
- New: When time entry active, Escape FIRST clears time buffer/closes time entry mode
- Priority: time entry active → clear buffer → return (don't reset rankings or close modal)

## Research Findings

### Existing Patterns
- `Modal` component uses `fixed inset-0 z-50` for overlay positioning
- Design system colors: `text-chrome`, `text-neon-cyan`, `bg-void/80` for backdrop
- Font classes: `font-display` for large text, `text-5xl` for prominent display
- Existing test file: `tests/placement-entry-modal.test.tsx` with vi.useFakeTimers for timeout testing

### formatLapTime Function
- Located in `src/lib/ui-helpers.ts:170-175`
- Takes milliseconds, returns "M:SS" format
- Need to handle partial input (1 digit, 2 digits) differently for preview

## Open Questions
None - all clarified by user

## Scope Boundaries

### INCLUDE
- Fix handleKeyDown priority logic
- Add time entry overlay component
- Add Backspace support for digit deletion
- Update Escape key behavior for time entry mode
- Update existing broken test
- Add new tests for fixed behavior

### EXCLUDE
- Changes to rank assignment logic (toggleRank, assignDirectRank)
- Changes to timeout duration (stays at 2s)
- Changes to parseLapTimeDigits validation
- Mobile-specific overlay variations (use same overlay for all)

## Test Strategy Decision
- **Infrastructure exists**: YES (Vitest + React Testing Library)
- **User wants tests**: YES (tests after)
- **Framework**: vitest
- **QA approach**: Fix first, add tests after
