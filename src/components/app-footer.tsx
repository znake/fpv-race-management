/**
 * App Footer Component
 * 
 * Tech-Spec: export-import-turnier-state
 * Story 3: Sticky footer with Import/Export buttons
 */

import { useRef } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

type TournamentPhase = 'setup' | 'heat-assignment' | 'running' | 'finale' | 'completed'

interface AppFooterProps {
  onExportJSON: () => void
  onExportCSV: () => void
  onImportJSON: (fileContent: string) => void
  onResetTournament?: () => void
  showResetButton?: boolean
  tournamentPhase?: TournamentPhase
}

export function AppFooter({
  onExportJSON,
  onExportCSV,
  onImportJSON,
  onResetTournament,
  showResetButton = false,
  tournamentPhase
}: AppFooterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

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
    <footer className={`fixed bottom-0 left-0 right-0 bg-void/90 backdrop-blur-sm border-t border-steel/20 z-40 ${isMobile ? 'py-1.5 px-4' : 'py-2 px-4'} pb-[env(safe-area-inset-bottom,6px)]`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        aria-label="JSON-Datei auswählen"
      />

      <div className={`flex justify-between items-center ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
        {/* Left side: Reset button (only shown during active tournament) */}
        <div className="flex-1">
          {showResetButton && onResetTournament && (
            <button
              onClick={onResetTournament}
              className="text-loser-red hover:text-loser-red/80 transition-colors"
              aria-label="Turnier zurücksetzen"
            >
              {isMobile ? 'Reset' : 'Turnier zurücksetzen'}
            </button>
          )}
        </div>

        {/* Center: Tournament status */}
        <div className="flex-1 text-center">
          {tournamentPhase && tournamentPhase !== 'setup' && (
            <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} ${
              tournamentPhase === 'heat-assignment'
                ? 'text-neon-cyan'
                : tournamentPhase === 'running'
                ? 'text-gold'
                : tournamentPhase === 'finale'
                ? 'text-gold animate-pulse'
                : tournamentPhase === 'completed'
                ? 'text-winner-green'
                : 'text-gold'
            }`}>
              {tournamentPhase === 'heat-assignment' && (isMobile ? 'ZUWEISUNG' : 'HEAT-ZUWEISUNG')}
              {tournamentPhase === 'running' && (isMobile ? 'LÄUFT' : 'TURNIER LÄUFT')}
              {tournamentPhase === 'finale' && 'FINALE'}
              {tournamentPhase === 'completed' && (isMobile ? 'BEENDET' : 'TURNIER BEENDET')}
            </span>
          )}
        </div>

        {/* Right side: Import/Export buttons */}
        <div className={`flex-1 flex justify-end ${isMobile ? 'gap-2' : 'gap-4'}`}>
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
            {isMobile ? 'JSON' : 'Export JSON'}
          </button>
          <button
            onClick={onExportCSV}
            className="text-steel hover:text-neon-cyan transition-colors"
            aria-label="Als CSV exportieren"
          >
            {isMobile ? 'CSV' : 'Export CSV'}
          </button>
        </div>
      </div>
    </footer>
  )
}
