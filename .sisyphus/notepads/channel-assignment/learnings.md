# Channel Assignment - Learnings

## Conventions & Patterns
<!-- Append findings here -->

Added lastChannel field to Pilot interface in src/lib/schemas.ts as a foundation for Raceband channel assignment.

Implemented channel assignment as pure utility module:
- Heat channel sets are size-dependent (4: [1,4,6,8], 3: [1,4,8], 2: [1,8], 1: [1]) to maximize RF spacing.
- Smart ordering uses a simple greedy pass over channels, selecting pilots whose lastChannel matches the current channel.
- When multiple pilots prefer the same channel, tie-break is randomized (Math.random), which tests can control via spying.
- If no pilots have lastChannel data, optimization intentionally returns the original order (no-op).

- **Channel Assignment in Brackets**: When displaying pilots in bracket heats, their channel assignment is determined by their *original* position in the `bracketHeat.pilotIds` array, not their sorted position (e.g., by rank). This is crucial for consistency.
- **Visual Hierarchy**: Added channel badges (R1, R4, etc.) before pilot names. Used subtle styling (`bg-zinc-700 text-xs`) to ensure they provide information without competing with the pilot name or rank badge.

When completing a heat (tournamentStore.submitHeatResults), update each participating pilot's `lastChannel` using `getChannelForPosition(positionInHeat, heat.pilotIds.length)` where `positionInHeat` is the index in `heat.pilotIds`.

Bracket heat generation now supports channel-retention optimization: `createWBHeatFromPool` / `createLBHeatFromPool` call `optimizePilotOrder(pilotsForHeat, pilots)` and store the returned id order in `heat.pilotIds`. For backward compatibility, `createLBHeatFromPool` accepts both the new `(pool, heats, pilots, minPilots?)` form and the legacy `(pool, heats, minPilots?)` form.

## Completion Summary (2026-01-30)

All 5 tasks completed successfully:
1. **Task 1**: `lastChannel` field added to Pilot interface ✓
2. **Task 2**: Channel assignment logic with TDD (12 tests passing) ✓
3. **Task 3**: Channel badges in bracket view ✓
4. **Task 4**: Channel badges in placement modal ✓
5. **Task 5**: Integration - lastChannel persistence + pilot order optimization ✓

Key commits:
- `d8ed66a` feat(pilot): add lastChannel field for channel persistence
- `1c4a524` feat(channel): add channel assignment logic with smart optimization
- `8295370` feat(ui): display channel badges in bracket heat boxes
- `eb4a289` feat(channel): complete channel assignment system
