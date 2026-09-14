import { act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { App } from '@/App'
import { parseCSV } from '@/lib/csv-parser'
import { usePilots } from '@/hooks/usePilots'
import type { PilotImportResult } from '@/hooks/usePilots'
import { resetTournamentStore } from './helpers'

// Mock the pilot gateway so the App-level wiring (await/alert/close) is tested in isolation
vi.mock('@/hooks/usePilots', () => ({
  usePilots: vi.fn()
}))

// Mock CSV parsing so the modal flow can be driven without real files
vi.mock('@/lib/csv-parser', async () => {
  const actual = await vi.importActual('@/lib/csv-parser')
  return {
    ...actual,
    parseCSV: vi.fn(),
    validateImageUrl: vi.fn()
  }
})

vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils')
  return {
    ...actual,
    debounce: (fn: unknown) => fn
  }
})

const importPilotsMock = vi.fn()

async function openModalAndDropValidCsv() {
  render(<App />)

  fireEvent.click(screen.getByText('CSV Import'))

  const dropZoneText = await screen.findByText('CSV-Datei hier ablegen')
  const dropZone = dropZoneText.closest('.border-dashed')
  const csvContent = 'Name,Bild-URL\nNeuer Pilot,https://example.com/neu.jpg'
  const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
  Object.defineProperty(file, 'text', {
    value: () => Promise.resolve(csvContent)
  })
  fireEvent.drop(dropZone!, { dataTransfer: { files: [file] } })

  await screen.findByText('Import-Zusammenfassung')
}

describe('App CSV-Import wiring', () => {
  beforeEach(() => {
    resetTournamentStore()
    vi.mocked(usePilots).mockReturnValue({
      pilots: [],
      tournamentStarted: false,
      addPilot: vi.fn(),
      importPilots: importPilotsMock,
      updatePilot: vi.fn(),
      deletePilot: vi.fn(),
      markPilotAsDroppedOut: vi.fn()
    })
    vi.mocked(parseCSV).mockResolvedValue({
      totalRows: 1,
      validRows: 1,
      pilots: [{ name: 'Neuer Pilot', imageUrl: 'https://example.com/neu.jpg' }],
      errors: [],
      duplicates: []
    })
  })

  it('awaits importPilots, alerts the summary before closing the modal', async () => {
    // Given: an import that stays pending until the test resolves it
    let resolveImport: (result: PilotImportResult) => void = () => {}
    const pendingImport = new Promise<PilotImportResult>((resolve) => {
      resolveImport = resolve
    })
    importPilotsMock.mockReturnValue(pendingImport)

    let modalOpenWhenAlerted: boolean | null = null
    vi.mocked(window.alert).mockImplementation(() => {
      modalOpenWhenAlerted = screen.queryByText('Import-Zusammenfassung') !== null
    })

    await openModalAndDropValidCsv()

    // When: the user confirms the import
    fireEvent.click(screen.getByText('1 Piloten importieren'))

    // Then: while the import is pending the modal stays open and nothing is alerted yet
    expect(importPilotsMock).toHaveBeenCalledTimes(1)
    expect(window.alert).not.toHaveBeenCalled()
    expect(screen.getByText('Import-Zusammenfassung')).toBeInTheDocument()

    // When: the import resolves
    await act(async () => {
      resolveImport({ success: true, errors: [], successCount: 1, errorCount: 0, duration: 3 })
    })

    // Then: the summary is alerted BEFORE the modal closes
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'CSV-Import abgeschlossen: 1 erfolgreich, 0 fehlgeschlagen.'
      )
    })
    expect(modalOpenWhenAlerted).toBe(true)
    await waitFor(() => {
      expect(screen.queryByText('Import-Zusammenfassung')).not.toBeInTheDocument()
    })
  })

  it('alerts a German error and still closes the modal when importPilots rejects', async () => {
    // Given: an import that fails
    importPilotsMock.mockRejectedValue(new Error('Persistenz fehlgeschlagen'))

    await openModalAndDropValidCsv()

    // When: the user confirms the import
    fireEvent.click(screen.getByText('1 Piloten importieren'))

    // Then: the failure is surfaced instead of silently dropped
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('CSV-Import fehlgeschlagen')
      )
    })
    await waitFor(() => {
      expect(screen.queryByText('Import-Zusammenfassung')).not.toBeInTheDocument()
    })
  })
})
