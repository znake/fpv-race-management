import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import {
  generateTimestamp,
  generateFilename,
  exportJSON,
  parseImportedJSON,
  generateCSVExport
} from '@/lib/export-import'
import type { TournamentStateData } from '@/types'

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
    expect(header).toBe('Pilot,Status,Platzierung,Ranggruppe,Bracket,Heats Geflogen,Ergebnisse,Nächster Heat')
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
    // Winner should have placement 1 and Ranggruppe 1
    expect(lines[1]).toContain('Winner')
    expect(lines[1]).toContain(',1,1,') // Platzierung,Ranggruppe
    // Second should have placement 2 and Ranggruppe 2
    expect(lines[2]).toContain('Second')
    expect(lines[2]).toContain(',2,2,') // Platzierung,Ranggruppe
  })

  describe('Ranggruppe (placement group)', () => {
    it('shows exact placement (1-4) for Grand Finale participants', () => {
      const state: TournamentStateData = {
        pilots: [
          { id: 'p1', name: 'First', imageUrl: '' },
          { id: 'p2', name: 'Second', imageUrl: '' },
          { id: 'p3', name: 'Third', imageUrl: '' },
          { id: 'p4', name: 'Fourth', imageUrl: '' }
        ],
        tournamentStarted: true,
        tournamentPhase: 'completed',
        heats: [{
          id: 'gf',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'completed',
          bracketType: 'grand_finale',
          results: {
            rankings: [
              { pilotId: 'p1', rank: 1 },
              { pilotId: 'p2', rank: 2 },
              { pilotId: 'p3', rank: 3 },
              { pilotId: 'p4', rank: 4 }
            ]
          }
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
        place1: { id: 'p1', name: 'First', imageUrl: '' },
        place2: { id: 'p2', name: 'Second', imageUrl: '' },
        place3: { id: 'p3', name: 'Third', imageUrl: '' },
        place4: { id: 'p4', name: 'Fourth', imageUrl: '' }
      }

      const csv = generateCSVExport(state, { top4 })
      const lines = csv.split('\n')
      
      // Check Ranggruppe column (4th column, index 3)
      expect(lines[1].split(',')[3]).toBe('1')
      expect(lines[2].split(',')[3]).toBe('2')
      expect(lines[3].split(',')[3]).toBe('3')
      expect(lines[4].split(',')[3]).toBe('4')
    })

    it('shows empty Ranggruppe for active pilots', () => {
      const state: TournamentStateData = {
        pilots: [{ id: 'p1', name: 'Active', imageUrl: '' }],
        tournamentStarted: true,
        tournamentPhase: 'running',
        heats: [{
          id: 'wb1',
          heatNumber: 1,
          pilotIds: ['p1'],
          status: 'completed',
          bracketType: 'winner',
          roundNumber: 1,
          results: { rankings: [{ pilotId: 'p1', rank: 1 }] }
        }],
        currentHeatIndex: 0,
        winnerPilots: ['p1'],
        loserPilots: [],
        eliminatedPilots: [],
        loserPool: [],
        grandFinalePool: [],
        isQualificationComplete: true,
        isWBFinaleComplete: false,
        isLBFinaleComplete: false,
        isGrandFinaleComplete: false,
        lastCompletedBracketType: null
      }

      const csv = generateCSVExport(state)
      const lines = csv.split('\n')
      
      // Ranggruppe should be empty for active pilot
      expect(lines[1].split(',')[3]).toBe('')
    })

    it('calculates correct Ranggruppe for eliminated pilots in different LB rounds', () => {
      // 8 pilots: 4 eliminated in LB R1, remaining 4 go to Grand Finale
      const state: TournamentStateData = {
        pilots: [
          { id: 'p1', name: 'GF-1', imageUrl: '' },
          { id: 'p2', name: 'GF-2', imageUrl: '' },
          { id: 'p3', name: 'GF-3', imageUrl: '' },
          { id: 'p4', name: 'GF-4', imageUrl: '' },
          { id: 'p5', name: 'Elim-LB1-A', imageUrl: '' },
          { id: 'p6', name: 'Elim-LB1-B', imageUrl: '' },
          { id: 'p7', name: 'Elim-LB1-C', imageUrl: '' },
          { id: 'p8', name: 'Elim-LB1-D', imageUrl: '' }
        ],
        tournamentStarted: true,
        tournamentPhase: 'completed',
        heats: [
          // LB Round 1: 4 pilots eliminated (rank 3-4)
          {
            id: 'lb1-h1',
            heatNumber: 1,
            pilotIds: ['p5', 'p6', 'p3', 'p4'],
            status: 'completed',
            bracketType: 'loser',
            roundNumber: 1,
            results: {
              rankings: [
                { pilotId: 'p3', rank: 1 },
                { pilotId: 'p4', rank: 2 },
                { pilotId: 'p5', rank: 3 },
                { pilotId: 'p6', rank: 4 }
              ]
            }
          },
          {
            id: 'lb1-h2',
            heatNumber: 2,
            pilotIds: ['p7', 'p8', 'p1', 'p2'],
            status: 'completed',
            bracketType: 'loser',
            roundNumber: 1,
            results: {
              rankings: [
                { pilotId: 'p1', rank: 1 },
                { pilotId: 'p2', rank: 2 },
                { pilotId: 'p7', rank: 3 },
                { pilotId: 'p8', rank: 4 }
              ]
            }
          },
          // Grand Finale
          {
            id: 'gf',
            heatNumber: 3,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'completed',
            bracketType: 'grand_finale',
            results: {
              rankings: [
                { pilotId: 'p1', rank: 1 },
                { pilotId: 'p2', rank: 2 },
                { pilotId: 'p3', rank: 3 },
                { pilotId: 'p4', rank: 4 }
              ]
            }
          }
        ],
        currentHeatIndex: 2,
        winnerPilots: [],
        loserPilots: [],
        eliminatedPilots: ['p5', 'p6', 'p7', 'p8'],
        loserPool: [],
        grandFinalePool: [],
        isQualificationComplete: true,
        isWBFinaleComplete: true,
        isLBFinaleComplete: true,
        isGrandFinaleComplete: true,
        lastCompletedBracketType: null
      }

      const top4 = {
        place1: { id: 'p1', name: 'GF-1', imageUrl: '' },
        place2: { id: 'p2', name: 'GF-2', imageUrl: '' },
        place3: { id: 'p3', name: 'GF-3', imageUrl: '' },
        place4: { id: 'p4', name: 'GF-4', imageUrl: '' }
      }

      const csv = generateCSVExport(state, { top4 })
      const lines = csv.split('\n')
      
      // Top 4 have exact placements
      const gf1Row = lines.find(l => l.includes('GF-1'))!
      const gf2Row = lines.find(l => l.includes('GF-2'))!
      const gf3Row = lines.find(l => l.includes('GF-3'))!
      const gf4Row = lines.find(l => l.includes('GF-4'))!
      
      expect(gf1Row.split(',')[3]).toBe('1')
      expect(gf2Row.split(',')[3]).toBe('2')
      expect(gf3Row.split(',')[3]).toBe('3')
      expect(gf4Row.split(',')[3]).toBe('4')
      
      // 4 pilots eliminated in LB R1 should have Ranggruppe 5-8
      const elimARow = lines.find(l => l.includes('Elim-LB1-A'))!
      const elimBRow = lines.find(l => l.includes('Elim-LB1-B'))!
      const elimCRow = lines.find(l => l.includes('Elim-LB1-C'))!
      const elimDRow = lines.find(l => l.includes('Elim-LB1-D'))!
      
      expect(elimARow.split(',')[3]).toBe('5-8')
      expect(elimBRow.split(',')[3]).toBe('5-8')
      expect(elimCRow.split(',')[3]).toBe('5-8')
      expect(elimDRow.split(',')[3]).toBe('5-8')
    })

    it('calculates correct Ranggruppe with multiple LB rounds', () => {
      // Scenario: 2 eliminated in LB Finale (place 3-4), 2 eliminated in LB R1
      const state: TournamentStateData = {
        pilots: [
          { id: 'p1', name: 'Champion', imageUrl: '' },
          { id: 'p2', name: 'Second', imageUrl: '' },
          { id: 'p3', name: 'Third', imageUrl: '' },
          { id: 'p4', name: 'Fourth', imageUrl: '' },
          { id: 'p5', name: 'LBFinale-3rd', imageUrl: '' },
          { id: 'p6', name: 'LBFinale-4th', imageUrl: '' },
          { id: 'p7', name: 'LBR1-Elim-A', imageUrl: '' },
          { id: 'p8', name: 'LBR1-Elim-B', imageUrl: '' }
        ],
        tournamentStarted: true,
        tournamentPhase: 'completed',
        heats: [
          // LB R1: 2 eliminated
          {
            id: 'lb1',
            heatNumber: 1,
            pilotIds: ['p5', 'p6', 'p7', 'p8'],
            status: 'completed',
            bracketType: 'loser',
            roundNumber: 1,
            results: {
              rankings: [
                { pilotId: 'p5', rank: 1 },
                { pilotId: 'p6', rank: 2 },
                { pilotId: 'p7', rank: 3 },
                { pilotId: 'p8', rank: 4 }
              ]
            }
          },
          // LB Finale: 2 eliminated (p5, p6 on rank 3-4)
          {
            id: 'lb-finale',
            heatNumber: 2,
            pilotIds: ['p3', 'p4', 'p5', 'p6'],
            status: 'completed',
            bracketType: 'loser',
            roundNumber: 2,
            isFinale: true,
            results: {
              rankings: [
                { pilotId: 'p3', rank: 1 },
                { pilotId: 'p4', rank: 2 },
                { pilotId: 'p5', rank: 3 },
                { pilotId: 'p6', rank: 4 }
              ]
            }
          },
          // Grand Finale
          {
            id: 'gf',
            heatNumber: 3,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'completed',
            bracketType: 'grand_finale',
            results: {
              rankings: [
                { pilotId: 'p1', rank: 1 },
                { pilotId: 'p2', rank: 2 },
                { pilotId: 'p3', rank: 3 },
                { pilotId: 'p4', rank: 4 }
              ]
            }
          }
        ],
        currentHeatIndex: 2,
        winnerPilots: [],
        loserPilots: [],
        eliminatedPilots: ['p5', 'p6', 'p7', 'p8'],
        loserPool: [],
        grandFinalePool: [],
        isQualificationComplete: true,
        isWBFinaleComplete: true,
        isLBFinaleComplete: true,
        isGrandFinaleComplete: true,
        lastCompletedBracketType: null
      }

      const top4 = {
        place1: { id: 'p1', name: 'Champion', imageUrl: '' },
        place2: { id: 'p2', name: 'Second', imageUrl: '' },
        place3: { id: 'p3', name: 'Third', imageUrl: '' },
        place4: { id: 'p4', name: 'Fourth', imageUrl: '' }
      }

      const csv = generateCSVExport(state, { top4 })
      const lines = csv.split('\n')
      
      // LB Finale eliminated (better than LB R1): 5-6
      const lbFinale3rd = lines.find(l => l.includes('LBFinale-3rd'))!
      const lbFinale4th = lines.find(l => l.includes('LBFinale-4th'))!
      expect(lbFinale3rd.split(',')[3]).toBe('5-6')
      expect(lbFinale4th.split(',')[3]).toBe('5-6')
      
      // LB R1 eliminated (worse): 7-8
      const lbr1ElimA = lines.find(l => l.includes('LBR1-Elim-A'))!
      const lbr1ElimB = lines.find(l => l.includes('LBR1-Elim-B'))!
      expect(lbr1ElimA.split(',')[3]).toBe('7-8')
      expect(lbr1ElimB.split(',')[3]).toBe('7-8')
    })

    it('shows elimination heat name in Status column', () => {
      const state: TournamentStateData = {
        pilots: [
          { id: 'p1', name: 'LBR1-Eliminated', imageUrl: '' },
          { id: 'p2', name: 'LBFinale-Eliminated', imageUrl: '' },
          { id: 'p3', name: 'Active-Pilot', imageUrl: '' }
        ],
        tournamentStarted: true,
        tournamentPhase: 'running',
        heats: [
          // LB R1: p1 eliminated
          {
            id: 'lb1',
            heatNumber: 1,
            pilotIds: ['p1', 'p3'],
            status: 'completed',
            bracketType: 'loser',
            roundNumber: 1,
            results: {
              rankings: [
                { pilotId: 'p3', rank: 1 },
                { pilotId: 'p1', rank: 3 }
              ]
            }
          },
          // LB Finale: p2 eliminated
          {
            id: 'lb-finale',
            heatNumber: 2,
            pilotIds: ['p2', 'p3'],
            status: 'completed',
            bracketType: 'loser',
            roundNumber: 2,
            isFinale: true,
            results: {
              rankings: [
                { pilotId: 'p3', rank: 1 },
                { pilotId: 'p2', rank: 3 }
              ]
            }
          }
        ],
        currentHeatIndex: 1,
        winnerPilots: [],
        loserPilots: [],
        eliminatedPilots: ['p1', 'p2'],
        loserPool: [],
        grandFinalePool: [],
        isQualificationComplete: true,
        isWBFinaleComplete: false,
        isLBFinaleComplete: false,
        isGrandFinaleComplete: false,
        lastCompletedBracketType: null
      }

      const csv = generateCSVExport(state)
      const lines = csv.split('\n')
      
      // Status column is index 1
      const lbr1Row = lines.find(l => l.includes('LBR1-Eliminated'))!
      const lbFinaleRow = lines.find(l => l.includes('LBFinale-Eliminated'))!
      const activeRow = lines.find(l => l.includes('Active-Pilot'))!
      
      // Check Status includes heat name
      expect(lbr1Row.split(',')[1]).toBe('Ausgeschieden (LB-R1)')
      expect(lbFinaleRow.split(',')[1]).toBe('Ausgeschieden (LB-Finale)')
      expect(activeRow.split(',')[1]).toBe('Aktiv')
    })
  })
})
