import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import {
  generateTimestamp,
  generateFilename,
  exportJSON,
  parseImportedJSON,
  generateCSVExport
} from '../src/lib/export-import'
import type { TournamentStateData } from '../src/types'

describe('export-import utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-22T09:15:00Z'))
  })

  it('generates timestamp in expected format', () => {
    const stamp = generateTimestamp()
    expect(stamp).toBe('2026-01-22_09-15')
  })

  it('generates filename with extension', () => {
    expect(generateFilename('json')).toBe('heats_2026-01-22_09-15.json')
    expect(generateFilename('csv')).toBe('heats_2026-01-22_09-15.csv')
  })

  it('exports JSON using provided snapshot', () => {
    const mockClick = vi.fn()
    const mockLink = { click: mockClick, set href(_value: string) {}, download: '' } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

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
    expect(mockLink.download).toBe('heats_2026-01-22_09-15.json')
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
})
