import { useTournamentStore } from '../../src/stores/tournamentStore';
import { act, renderHook } from '@testing-library/react';

/**
 * Resets the tournament store to its initial state.
 * Use this in beforeEach() to ensure test isolation.
 *
 * @example
 * beforeEach(() => {
 *   resetTournamentStore();
 * });
 */
export function resetTournamentStore(): void {
  useTournamentStore.setState({
    // Pilots
    pilots: [],

    // Tournament State
    tournamentStarted: false,
    tournamentPhase: 'setup',

    // Heats
    heats: [],
    currentHeatIndex: 0,

    // Bracket Progression
    winnerPilots: [],
    loserPilots: [],
    eliminatedPilots: [],

    // Pools
    loserPool: [],
    grandFinalePool: [],

    // Completion Flags
    isQualificationComplete: false,
    isWBFinaleComplete: false,
    isLBFinaleComplete: false,
    isGrandFinaleComplete: false,

    // Structure
    fullBracketStructure: null,
    lastCompletedBracketType: null,
  });
}

/**
 * Gets the current store state (shorthand for tests)
 */
export function getStoreState() {
  return useTournamentStore.getState();
}

/**
 * Sets up a tournament with the given number of pilots
 * Useful for tests that need pilots without starting tournament
 *
 * @param pilotCount - Number of pilots to add (default: 12)
 * @returns renderHook result object with store access
 */
export function setupTournamentWithPilots(pilotCount: number = 12) {
  resetTournamentStore();
  const { result } = renderHook(() => useTournamentStore());

  for (let i = 0; i < pilotCount; i++) {
    act(() => {
      result.current.addPilot({
        name: `Pilot ${i + 1}`,
        imageUrl: `https://example.com/pilot${i + 1}.jpg`,
      });
    });
  }

  return result;
}

/**
 * Sets up and starts a tournament with heats generated and confirmed
 * Returns to 'running' phase with first heat active
 *
 * @param pilotCount - Number of pilots to add (default: 12)
 * @returns renderHook result object with store access
 */
export function setupRunningTournament(pilotCount: number = 12) {
  const result = setupTournamentWithPilots(pilotCount);

  act(() => {
    result.current.confirmTournamentStart();
  });

  act(() => {
    result.current.confirmHeatAssignment();
  });

  return result;
}
