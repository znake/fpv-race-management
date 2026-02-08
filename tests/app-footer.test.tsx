import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import { AppFooter } from '@/components/app-footer'

describe('AppFooter', () => {
  it('renders Import/Export buttons', () => {
    render(
      <AppFooter
        onExportJSON={vi.fn()}
        onExportCSV={vi.fn()}
        onImportJSON={vi.fn()}
      />
    )

    expect(screen.getByText('Import')).toBeInTheDocument()
    expect(screen.getByText('Export JSON')).toBeInTheDocument()
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  it('triggers export handlers', () => {
    const onExportJSON = vi.fn()
    const onExportCSV = vi.fn()

    render(
      <AppFooter
        onExportJSON={onExportJSON}
        onExportCSV={onExportCSV}
        onImportJSON={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('Export JSON'))
    fireEvent.click(screen.getByText('Export CSV'))

    expect(onExportJSON).toHaveBeenCalled()
    expect(onExportCSV).toHaveBeenCalled()
  })

  it('reads selected file and calls onImportJSON', async () => {
    const onImportJSON = vi.fn()

    render(
      <AppFooter
        onExportJSON={vi.fn()}
        onExportCSV={vi.fn()}
        onImportJSON={onImportJSON}
      />
    )

    const input = screen.getByLabelText('JSON-Datei auswählen') as HTMLInputElement
    const file = new File(['{"state":{}}'], 'heats.json', { type: 'application/json' })
    Object.defineProperty(file, 'text', {
      value: () => Promise.resolve('{"state":{}}')
    })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText('Import')).toBeInTheDocument()
    expect(onImportJSON).toHaveBeenCalledWith('{"state":{}}')
  })
})
