import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import {
  generateTimestamp,
  generateFilename,
  exportJSON,
  parseImportedJSON,
  generateCSVExport
} from '../src/lib/export-import'
import type { TournamentStateData } from '../src/types'

// Mock URL methods for Node environment
const originalCreateObjectURL = globalThis.URL.createObjectURL
const originalRevokeObjectURL = globalThis.URL.revokeObjectURL

describe('export-import utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-22T09:15:00Z'))
    // Setup URL mocks
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    // Restore URL methods
    globalThis.URL.createObjectURL = originalCreateObjectURL
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('generates timestamp in expected format', () => {
    const stamp = generateTimestamp()
    // Format: YYYY-MM-DD_HH-MM (local time varies by timezone)
    expect(stamp).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$/)
  })

  it('generates filename with extension', () => {
    const jsonName = generateFilename('json')
    const csvName = generateFilename('csv')
    expect(jsonName).toMatch(/^heats_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.json$/)
    expect(csvName).toMatch(/^heats_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.csv$/)
  })

  it('exports JSON using provided snapshot', () => {
    const mockClick = vi.fn()
    const mockLink = { click: mockClick, href: '', download: '' } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink)

    const snapshot: TournamentStateData = {
      pilots: [],
      tournamentStarted: false,
      tournamentPhase: 'setup',
      heats: [],
      currentHeatIndex: 0,
      winnerPilots: [],
      loserPilots: [],
      eliminatedPilots: [],
      loserPool: [],
      grandFinalePool: [],
      isQualificationComplete: false,
      isWBFinaleComplete: false,
      isLBFinaleComplete: false,
      isGrandFinaleComplete: false,
      lastCompletedBracketType: null
    }

    exportJSON(snapshot)

    expect(mockClick).toHaveBeenCalled()
    expect(mockLink.download).toMatch(/^heats_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.json$/)
  })

  it('parses valid import JSON and extracts summary', () => {
    const payload = {
      state: {
        pilots: [{ id: 'p1', name: 'A', imageUrl: 'https://img' }],
        tournamentStarted: true,
        tournamentPhase: 'running',
        heats: [{ id: 'h1', heatNumber: 1, pilotIds: ['p1'], status: 'completed' }],
        currentHeatIndex: 0
      }
    }

    const result = parseImportedJSON(JSON.stringify(payload))
    expect(result?.pilotCount).toBe(1)
    expect(result?.heatCount).toBe(1)
    expect(result?.phase).toBe('Läuft')
  })

  it('rejects invalid JSON with missing pilots', () => {
    const payload = { state: { heats: [], tournamentStarted: false, currentHeatIndex: 0 } }
    const result = parseImportedJSON(JSON.stringify(payload))
    expect(result).toBeNull()
  })

  it('rejects invalid JSON with malformed heats', () => {
    const payload = {
      state: {
        pilots: [{ id: 'p1', name: 'A', imageUrl: 'https://img' }],
        tournamentStarted: true,
        tournamentPhase: 'running',
        heats: [{ id: 'h1' }], // Missing required fields
        currentHeatIndex: 0
      }
    }
    const result = parseImportedJSON(JSON.stringify(payload))
    expect(result).toBeNull()
  })

  it('builds CSV with required header and results format', () => {
    const state: TournamentStateData = {
      pilots: [{ id: 'p1', name: 'Max', imageUrl: 'https://img' }],
      tournamentStarted: true,
      tournamentPhase: 'running',
      heats: [{
        id: 'h1',
        heatNumber: 1,
        pilotIds: ['p1'],
        status: 'completed',
        bracketType: 'winner',
        roundNumber: 1,
        results: { rankings: [{ pilotId: 'p1', rank: 1 }] }
      }],
      currentHeatIndex: 0,
      winnerPilots: [],
      loserPilots: [],
      eliminatedPilots: [],
      loserPool: [],
      grandFinalePool: [],
      isQualificationComplete: false,
      isWBFinaleComplete: false,
      isLBFinaleComplete: false,
      isGrandFinaleComplete: false,
      lastCompletedBracketType: null
    }

    const csv = generateCSVExport(state)
    const [header, row] = csv.split('\n')
    expect(header).toBe('Pilot,Status,Platzierung,Bracket,Heats Geflogen,Ergebnisse,Nächster Heat')
    expect(row).toContain('WB-R1-H1: 1.')
  })

  it('uses top4 placement map when provided', () => {
    const state: TournamentStateData = {
      pilots: [
        { id: 'p1', name: 'Winner', imageUrl: 'https://img' },
        { id: 'p2', name: 'Second', imageUrl: 'https://img' }
      ],
      tournamentStarted: true,
      tournamentPhase: 'completed',
      heats: [{
        id: 'gf',
        heatNumber: 1,
        pilotIds: ['p1', 'p2'],
        status: 'completed',
        bracketType: 'grand_finale',
        results: { rankings: [{ pilotId: 'p1', rank: 1 }, { pilotId: 'p2', rank: 2 }] }
      }],
      currentHeatIndex: 0,
      winnerPilots: [],
      loserPilots: [],
      eliminatedPilots: [],
      loserPool: [],
      grandFinalePool: [],
      isQualificationComplete: true,
      isWBFinaleComplete: true,
      isLBFinaleComplete: true,
      isGrandFinaleComplete: true,
      lastCompletedBracketType: null
    }

    const top4 = {
      place1: { id: 'p1', name: 'Winner', imageUrl: 'https://img' },
      place2: { id: 'p2', name: 'Second', imageUrl: 'https://img' },
      place3: undefined,
      place4: undefined
    }

    const csv = generateCSVExport(state, { top4 })
    const lines = csv.split('\n')
    // Winner should have placement 1
    expect(lines[1]).toContain('Winner')
    expect(lines[1]).toContain(',1,')
    // Second should have placement 2
    expect(lines[2]).toContain('Second')
    expect(lines[2]).toContain(',2,')
  })
})
