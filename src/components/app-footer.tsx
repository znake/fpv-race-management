/**
 * App Footer Component
 * 
 * Tech-Spec: export-import-turnier-state
 * Story 3: Sticky footer with Import/Export buttons
 */

import { useRef } from 'react'

interface AppFooterProps {
  onExportJSON: () => void
  onExportCSV: () => void
  onImportJSON: (fileContent: string) => void
}

export function AppFooter({
  onExportJSON,
  onExportCSV,
  onImportJSON
}: AppFooterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      onImportJSON(content)
    } catch (error) {
      console.error('Error reading file:', error)
      alert('Fehler beim Lesen der Datei.')
    } finally {
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-void/90 backdrop-blur-sm border-t border-steel/20 py-2 px-4 z-40">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        aria-label="JSON-Datei auswählen"
      />

      <div className="flex justify-end gap-4 text-xs">
        <button
          onClick={handleImportClick}
          className="text-steel hover:text-neon-cyan transition-colors"
          aria-label="Turnier importieren"
        >
          Import
        </button>
        <button
          onClick={onExportJSON}
          className="text-steel hover:text-neon-cyan transition-colors"
          aria-label="Als JSON exportieren"
        >
          Export JSON
        </button>
        <button
          onClick={onExportCSV}
          className="text-steel hover:text-neon-cyan transition-colors"
          aria-label="Als CSV exportieren"
        >
          Export CSV
        </button>
      </div>
    </footer>
  )
}
