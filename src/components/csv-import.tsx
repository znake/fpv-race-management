import React, { useState, useCallback, useRef } from 'react'
import { parseCSV } from '@/lib/csv-parser'
import { debounce, cn } from '@/lib/utils'
import { pilotSchema } from '@/lib/schemas'
import { Modal } from './ui/modal'
import type { CSVImportResult, CSVImportState, DuplicatePilot } from '@/types/csv'

interface CSVImportProps {
  onImport: (pilots: Array<{ name: string; imageUrl?: string; instagramHandle?: string }>) => void
  onCancel: () => void
  existingPilots?: Array<{ id: string; name: string; imageUrl?: string; instagramHandle?: string }>
}

export function CSVImport({ onImport, onCancel, existingPilots = [] }: CSVImportProps) {
  const [state, setState] = useState<CSVImportState>({
    isDragging: false,
    isProcessing: false,
    progress: 0,
    result: null,
    selectedFile: null
  })

  const [duplicateResolution, setDuplicateResolution] = useState<Record<string, 'merge' | 'skip'>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debounced progress update for performance
  const debouncedProgressUpdate = useCallback(
    debounce((progress: number) => {
      setState(prev => ({ ...prev, progress }))
    }, 100),
    []
  )

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isDragging: true }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isDragging: false }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isDragging: false }))

    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'))

    if (csvFile) {
      processFile(csvFile)
    } else {
      alert('Bitte CSV-Datei hochladen')
    }
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [])

  // Process CSV file
  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Datei zu groß (max 10MB)')
      return
    }

    setState(prev => ({ ...prev, isProcessing: true, selectedFile: file, progress: 0 }))

    try {
      const text = await file.text()
      debouncedProgressUpdate(25)

      const result = await parseCSV(text)
      debouncedProgressUpdate(50)

      // Validate with Zod schema
      const validationErrors: typeof result.errors = []
      const validPilots: Array<{ name: string; imageUrl?: string; instagramHandle?: string }> = []

      for (let i = 0; i < result.pilots.length; i++) {
        const pilot = result.pilots[i]
        const validation = pilotSchema.safeParse(pilot)

        if (!validation.success) {
          const fieldPath = validation.error.issues[0]?.path[0]
          const fieldName: 'Name' | 'Bild-URL' | 'general' =
            fieldPath === 'name' ? 'Name' :
            fieldPath === 'imageUrl' ? 'Bild-URL' : 'general'
          validationErrors.push({
            row: i + 2,
            field: fieldName,
            message: validation.error.issues[0]?.message || 'Validation error',
            value: pilot[fieldPath as keyof typeof pilot]
          })
        } else {
          validPilots.push(validation.data)
        }

        // Update progress for large files
        if (result.pilots.length > 100) {
          debouncedProgressUpdate(50 + (i / result.pilots.length) * 30)
        }
      }

      debouncedProgressUpdate(80)

      // Check for duplicates
      const duplicates: DuplicatePilot[] = []
      const uniquePilots: Array<{ name: string; imageUrl?: string; instagramHandle?: string }> = []

      for (const pilot of validPilots) {
        const existing = existingPilots.find(existing =>
          existing.name.toLowerCase().normalize('NFC').trim() ===
          pilot.name.toLowerCase().normalize('NFC').trim()
        )

        if (existing) {
          duplicates.push({
            row: 0, // Will be calculated later
            name: pilot.name,
            imageUrl: pilot.imageUrl,
            existingPilot: existing,
            action: 'pending'
          })
        } else {
          uniquePilots.push(pilot)
        }
      }

      debouncedProgressUpdate(100)

      const finalResult: CSVImportResult = {
        totalRows: result.totalRows,
        validRows: uniquePilots.length,
        pilots: uniquePilots,
        errors: [...result.errors, ...validationErrors],
        duplicates
      }

      setState(prev => ({
        ...prev,
        isProcessing: false,
        result: finalResult,
        progress: 100
      }))

    } catch (error) {
      console.error('CSV processing error:', error)
      alert('CSV-Verarbeitung fehlgeschlagen')
      setState(prev => ({ ...prev, isProcessing: false, progress: 0 }))
    }
  }

  // Handle duplicate resolution
  const handleDuplicateAction = (index: number, action: 'merge' | 'skip') => {
    setDuplicateResolution(prev => ({ ...prev, [index]: action }))
  }

  // Final import
  const handleImport = () => {
    if (!state.result) return

    const pilotsToImport = [...state.result.pilots]

    // Add resolved duplicates
    state.result.duplicates.forEach((duplicate, index) => {
      const action = duplicateResolution[index]
      if (action === 'merge') {
        pilotsToImport.push({
          name: duplicate.name,
          imageUrl: duplicate.imageUrl,
          instagramHandle: duplicate.instagramHandle
        })
      }
    })

    onImport(pilotsToImport)
    onCancel()
  }

  // Download CSV template
  const downloadTemplate = () => {
    const template = 'Name,Bild-URL,Instagram\nMax Mustermann,https://i.pravatar.cc/150?img=1,@max_fpv\nErika Mustermann,https://i.pravatar.cc/150?img=2,'
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'piloten-template.csv'
    link.click()
  }

  return (
    <Modal isOpen={true} onClose={onCancel} title="CSV Import" size="lg">
      {/* Content */}
      {!state.result ? (
        /* Upload Area */
        <div className="space-y-6">
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200',
              state.isDragging
                ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_20px_rgba(5,217,232,0.3)]'
                : 'border-steel bg-night hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(5,217,232,0.2)]'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-6xl">📁</div>
              <div>
                <p className="text-xl font-semibold text-chrome mb-2">
                  CSV-Datei hier ablegen
                </p>
                <p className="text-steel">
                  oder klicken zum Auswählen
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-neon-pink text-void px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(255,42,109,0.5)] transition-all duration-200"
              >
                Datei auswählen
              </button>
            </div>
          </div>

          {/* Template Download */}
          <div className="text-center space-y-2">
            <p className="text-steel">
              Benötigen Sie eine Vorlage?
            </p>
            <button
              onClick={downloadTemplate}
              className="text-neon-cyan hover:text-neon-pink transition-colors underline"
            >
              CSV Template herunterladen
            </button>
          </div>

          {/* Processing Progress */}
          {state.isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-chrome">Verarbeite CSV...</span>
                <span className="text-neon-cyan">{state.progress}%</span>
              </div>
              <div className="w-full bg-void rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-neon-cyan transition-all duration-300 shadow-[0_0_10px_rgba(5,217,232,0.5)]"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Results Area */
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-void rounded-lg p-4 border border-steel">
            <h3 className="text-lg font-semibold text-chrome mb-3">Import-Zusammenfassung</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-steel block">Gesamt</span>
                <span className="text-chrome text-xl font-bold">{state.result.totalRows}</span>
              </div>
              <div>
                <span className="text-steel block">Gültig</span>
                <span className="text-winner-green text-xl font-bold">{state.result.validRows}</span>
              </div>
              <div>
                <span className="text-steel block">Duplikate</span>
                <span className="text-gold text-xl font-bold">{state.result.duplicates.length}</span>
              </div>
              <div>
                <span className="text-steel block">Fehler</span>
                <span className="text-loser-red text-xl font-bold">{state.result.errors.length}</span>
              </div>
            </div>
          </div>

          {/* Duplicates */}
          {state.result.duplicates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-chrome mb-3">Duplikate gefunden</h3>
              <div className="space-y-2">
                {state.result.duplicates.map((duplicate, index) => (
                  <div key={index} className="bg-void rounded-lg p-4 border border-steel">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-chrome font-semibold">{duplicate.name}</p>
                        <p className="text-steel text-sm">Existiert bereits als "{duplicate.existingPilot.name}"</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDuplicateAction(index, 'skip')}
                          className={cn(
                            'px-3 py-1 rounded text-sm font-medium transition-colors',
                            duplicateResolution[index] === 'skip'
                              ? 'bg-steel text-void'
                              : 'bg-night border border-steel text-steel hover:border-neon-cyan hover:text-neon-cyan'
                          )}
                        >
                          Überspringen
                        </button>
                        <button
                          onClick={() => handleDuplicateAction(index, 'merge')}
                          className={cn(
                            'px-3 py-1 rounded text-sm font-medium transition-colors',
                            duplicateResolution[index] === 'merge'
                              ? 'bg-neon-pink text-void'
                              : 'bg-night border border-steel text-steel hover:border-neon-pink hover:text-neon-pink'
                          )}
                        >
                          Überschreiben
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {state.result.errors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-chrome mb-3">Fehler</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {state.result.errors.map((error, index) => (
                  <div key={index} className="bg-void rounded-lg p-3 border border-loser-red/50">
                    <p className="text-loser-red text-sm">
                      Zeile {error.row}: {error.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Modal.Footer>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-night border border-steel text-steel rounded-lg hover:border-neon-cyan hover:text-neon-cyan transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleImport}
              className="px-6 py-3 bg-neon-pink text-void rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(255,42,109,0.5)] transition-all duration-200"
            >
              {state.result.validRows} Piloten importieren
            </button>
          </Modal.Footer>
        </div>
      )}
    </Modal>
  )
}
