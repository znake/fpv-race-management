# Learnings - Lap Time Feature

## Conventions & Patterns

## Lap Time Feature - Foundation
- Added optional `lapTimeMs?: number` to `Ranking` interface in `/src/lib/schemas.ts`.
- This property is intended to store lap times in milliseconds for heat results.
- Verified that the change does not break existing code via `npm run build`.

## Lap Time Formatting & Parsing
- Implemented `formatLapTime` and `parseLapTimeDigits` in `src/lib/ui-helpers.ts`.
- `formatLapTime` converts ms to `M:SS` format.
- `parseLapTimeDigits` handles 2-digit (SS) and 3-digit (MSS) inputs.
- Validation range: 20s (20000ms) to 5min (300000ms).
- Seconds part in 3-digit input must be < 60.

## PlacementEntryModal time digit accumulation
- Use `useRef` for time-entry state (`lastClickedPilotIdRef`, `timeDigitBufferRef`, `timeoutRef`) to avoid stale closures in the global `keydown` listener.
- Keep `rankingsSizeRef` pattern; add new refs instead of adding listener dependencies that churn.
- Time digits: only `0` and `5-9` are captured (because `1-4` are reserved for rank hotkeys).
- Finalization uses a simple 2s `setTimeout` that is reset on every time digit.
## Lap Time Display in FilledBracketHeatBox

- Successfully added lap time display next to rank badges.
- Used `formatLapTime` from `ui-helpers.ts`.
- Applied styling: `text-xs text-steel ml-1`.
- Verified that it only shows when `ranking.lapTimeMs` is present.
- TypeScript compilation passed.

## HeatDetailModal inline lap time edit

- Pattern: blur-vs-delete race condition when clicking an inline delete (X) button next to an input.
- Mitigation: use a `useRef` flag set in `onMouseDown` for the delete button; in `onBlur`, skip save if the flag is set, then reset the flag.
- When using `submitHeatResults` for lap time edits, keep rank values unchanged (only patch `lapTimeMs`) to avoid bracket/pool side effects.
- Included lap times in CSV export results column using `formatLapTime` from `ui-helpers`.
- Format: `HeatName: Rank. (M:SS)` if time exists, otherwise `HeatName: Rank.`.
