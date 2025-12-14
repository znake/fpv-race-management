import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CSVImport } from '../src/components/csv-import'
import { parseCSV, validateImageUrl } from '../src/lib/utils'
import { validateCSVRow } from '../src/lib/schemas'

// Mock dependencies
vi.mock('../src/lib/utils', async () => {
  const actual = await vi.importActual('../src/lib/utils')
  return {
    ...actual,
    parseCSV: vi.fn(),
    validateImageUrl: vi.fn(),
    debounce: (fn: any) => fn
  }
})

vi.mock('../src/lib/schemas', async () => {
  const actual = await vi.importActual('../src/lib/schemas')
  return {
    ...actual,
    validateCSVRow: vi.fn()
  }
})

vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}))

// Mock URL.createObjectURL for tests
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mock-url'),
  writable: true
})

describe('CSVImport', () => {
  const mockOnImport = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(validateImageUrl).mockResolvedValue(true)
    vi.mocked(validateCSVRow).mockReturnValue({
      success: true,
      data: { name: 'Test Pilot', imageUrl: 'https://example.com/test.jpg' }
    })
  })

  it('renders CSV import interface correctly', () => {
    render(<CSVImport onImport={mockOnImport} onCancel={mockOnCancel} />)
    
    expect(screen.getByText('CSV Import')).toBeInTheDocument()
    expect(screen.getByText('CSV Template herunterladen')).toBeInTheDocument()
    expect(screen.getByText('CSV-Datei hier ablegen')).toBeInTheDocument()
  })

  it('handles drag over events', () => {
    render(<CSVImport onImport={mockOnImport} onCancel={mockOnCancel} />)
    
    const dropZone = screen.getByText('CSV-Datei hier ablegen').closest('div')
    
    fireEvent.dragOver(dropZone!)
    
    expect(dropZone).toHaveClass('border-neon-cyan')
  })

  it('processes valid CSV file correctly', async () => {
    const mockResult = {
      totalRows: 2,
      validRows: 2,
      pilots: [
        { name: 'Max Mustermann', imageUrl: 'https://example.com/max.jpg' },
        { name: 'Anna Schmidt', imageUrl: 'https://example.com/anna.jpg' }
      ],
      errors: [],
      duplicates: []
    }
    
    vi.mocked(parseCSV).mockResolvedValue(mockResult)
    
    render(<CSVImport onImport={mockOnImport} onCancel={mockOnCancel} />)
    
    // Find the file input (it's hidden)
    const fileInput = screen.getByRole('button', { name: /Datei auswählen/i }).querySelector('input[type="file"]') as HTMLInputElement
    
    const file = new File(['Name,Bild-URL\nMax,https://example.com/max.jpg'], 'test.csv', { type: 'text/csv' })
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    })
    
    fireEvent.change(fileInput)
    
    await waitFor(() => {
      expect(screen.getByText('Import-Zusammenfassung')).toBeInTheDocument()
    })
  })

  it('handles file size validation', async () => {
    render(<CSVImport onImport={mockOnImport} onCancel={mockOnCancel} />)
    
    const fileInput = screen.getByRole('button', { name: /Datei auswählen/i }).querySelector('input[type="file"]') as HTMLInputElement
    
    const largeFile = new File(['test'], 'large.csv', { type: 'text/csv' })
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 }) // 11MB
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false
    })
    
    fireEvent.change(fileInput)
    
    await waitFor(() => {
      expect(screen.getByText(/Datei zu groß/)).toBeInTheDocument()
    })
  })

  it('downloads CSV template', () => {
    const { saveAs } = require('file-saver')
    
    render(<CSVImport onImport={mockOnImport} onCancel={mockOnCancel} />)
    
    const templateButton = screen.getByText('CSV Template herunterladen')
    fireEvent.click(templateButton)
    
    expect(saveAs).toHaveBeenCalled()
  })

  it('handles cancel action', () => {
    render(<CSVImport onImport={mockOnImport} onCancel={mockOnCancel} />)
    
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })
})