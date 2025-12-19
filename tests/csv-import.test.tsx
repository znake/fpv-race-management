import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CSVImport } from '../src/components/csv-import'
import { parseCSV, validateImageUrl } from '../src/lib/utils'

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
  })

  it('renders CSV import interface correctly', () => {
    render(<CSVImport onImport={mockOnImport} onCancel={mockOnCancel} />)
    
    expect(screen.getByText('CSV Import')).toBeInTheDocument()
    expect(screen.getByText('CSV Template herunterladen')).toBeInTheDocument()
    expect(screen.getByText('CSV-Datei hier ablegen')).toBeInTheDocument()
  })

  it('handles drag events by updating visual state', () => {
    render(<CSVImport onImport={mockOnImport} onCancel={mockOnCancel} />)
    
    // Find the drop zone container (the bordered div)
    const dropZoneText = screen.getByText('CSV-Datei hier ablegen')
    const dropZone = dropZoneText.closest('.border-dashed')
    
    expect(dropZone).toBeTruthy()
    
    // Initial state - should have border-steel
    expect(dropZone).toHaveClass('border-steel')
    
    // After drag over - should have border-neon-cyan
    fireEvent.dragOver(dropZone!)
    expect(dropZone).toHaveClass('border-neon-cyan')
    
    // After drag leave - should return to border-steel
    fireEvent.dragLeave(dropZone!)
    expect(dropZone).toHaveClass('border-steel')
  })

  it('processes valid CSV file via drop', async () => {
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
    
    const dropZone = screen.getByText('CSV-Datei hier ablegen').closest('.border-dashed')
    
    // Create a mock file with text() method
    const csvContent = 'Name,Bild-URL\nMax,https://example.com/max.jpg'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    // Mock the text() method since JSDOM doesn't support it
    Object.defineProperty(file, 'text', {
      value: () => Promise.resolve(csvContent)
    })
    
    // Simulate drop event
    const dataTransfer = {
      files: [file],
    }
    
    fireEvent.drop(dropZone!, { dataTransfer })
    
    await waitFor(() => {
      expect(screen.getByText('Import-Zusammenfassung')).toBeInTheDocument()
    })
  })

  it('downloads CSV template via link click', () => {
    // Mock document.createElement to track link creation
    const mockClick = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName)
      if (tagName === 'a') {
        element.click = mockClick
      }
      return element
    })
    
    render(<CSVImport onImport={mockOnImport} onCancel={mockOnCancel} />)
    
    const templateButton = screen.getByText('CSV Template herunterladen')
    fireEvent.click(templateButton)
    
    expect(mockClick).toHaveBeenCalled()
    
    // Restore original
    vi.mocked(document.createElement).mockRestore()
  })

  it('handles cancel action', () => {
    render(<CSVImport onImport={mockOnImport} onCancel={mockOnCancel} />)
    
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })
})
