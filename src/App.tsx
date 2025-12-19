import { useState, useCallback } from 'react'
import { PilotCard } from './components/pilot-card'
import { AddPilotForm } from './components/add-pilot-form'
import { CSVImport } from './components/csv-import'
import { Header } from './components/header'
import { TournamentStartDialog } from './components/tournament-start-dialog'
import { HeatOverview } from './components/heat-overview'
import { HeatAssignmentView } from './components/heat-assignment-view'
import { ActiveHeatView } from './components/active-heat-view'
import { BracketTree } from './components/bracket-tree'
import { ResetConfirmationDialog } from './components/reset-confirmation-dialog'
import { usePilots } from './hooks/usePilots'
import { useTournamentStore } from './stores/tournamentStore'

type Tab = 'piloten' | 'heats' | 'bracket'

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('piloten')
  const { pilots, importPilots, updatePilot, deletePilot, markPilotAsDroppedOut, tournamentStarted } = usePilots()
  const tournamentPhase = useTournamentStore((state) => state.tournamentPhase)
  const heats = useTournamentStore((state) => state.heats)
  const confirmTournamentStart = useTournamentStore((state) => state.confirmTournamentStart)
  const confirmHeatAssignment = useTournamentStore((state) => state.confirmHeatAssignment)
  const cancelHeatAssignment = useTournamentStore((state) => state.cancelHeatAssignment)
  const submitHeatResults = useTournamentStore((state) => state.submitHeatResults)
  const getActiveHeat = useTournamentStore((state) => state.getActiveHeat)
  const getNextHeat = useTournamentStore((state) => state.getNextHeat)
  const resetTournament = useTournamentStore((state) => state.resetTournament)
  const deleteAllPilots = useTournamentStore((state) => state.deleteAllPilots)
  const resetAll = useTournamentStore((state) => state.resetAll)
  
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [showStartDialog, setShowStartDialog] = useState(false)
  
  // Reset dialog states
  const [showResetTournamentDialog, setShowResetTournamentDialog] = useState(false)
  const [showDeleteAllPilotsDialog, setShowDeleteAllPilotsDialog] = useState(false)
  const [showResetAllDialog, setShowResetAllDialog] = useState(false)
  
  // State for showing "Continue to next heat" button on bracket tab
  const [showContinueToHeats, setShowContinueToHeats] = useState(false)
  
  // Callback when heat is completed - auto switch to bracket tab (AC 4)
  const handleHeatComplete = useCallback(() => {
    // Switch to bracket tab to show results
    setActiveTab('bracket')
    // Show "Continue to next heat" button
    setShowContinueToHeats(true)
    
    // Auto-hide the button after 10 seconds
    setTimeout(() => {
      setShowContinueToHeats(false)
    }, 10000)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-void to-night text-chrome font-ui relative">
      {/* Synthwave Grid Background */}
      <div className="synthwave-grid" />
      
      {/* Header */}
      <Header onResetAll={() => setShowResetAllDialog(true)} />
      
      {/* Tournament Status Bar - Phase-dependent */}
      {tournamentStarted && (
        <div className={`px-8 py-2 text-center border-b ${
          tournamentPhase === 'heat-assignment' 
            ? 'bg-night-light border-neon-cyan/30' 
            : tournamentPhase === 'running'
            ? 'bg-night-light border-gold/30'
            : tournamentPhase === 'finale'
            ? 'bg-night-light border-gold/50'
            : tournamentPhase === 'completed'
            ? 'bg-night-light border-winner-green/30'
            : 'bg-night-light border-gold/30'
        }`}>
          <span className={`text-sm font-semibold ${
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
            {tournamentPhase === 'heat-assignment' && 'HEAT-ZUWEISUNG'}
            {tournamentPhase === 'running' && 'TURNIER LÄUFT'}
            {tournamentPhase === 'finale' && 'FINALE'}
            {tournamentPhase === 'completed' && 'TURNIER BEENDET'}
          </span>
        </div>
      )}
      
      {/* Tournament Start Button - only visible with 7-60 pilots */}
      {!tournamentStarted && pilots.length >= 7 && pilots.length <= 60 && (
        <div className="bg-void px-8 py-4 text-center">
          <button
            onClick={() => setShowStartDialog(true)}
            className="btn-primary"
          >
            Turnier starten
          </button>
        </div>
      )}
      
      {/* Pilot count hints */}
      {!tournamentStarted && pilots.length > 0 && pilots.length < 7 && (
        <div className="bg-void px-8 py-3 text-center">
          <p className="text-steel text-sm">
            Mindestens 7 Piloten benötigt ({pilots.length}/7)
          </p>
        </div>
      )}
      {!tournamentStarted && pilots.length > 60 && (
        <div className="bg-void px-8 py-3 text-center">
          <p className="text-loser-red text-sm">
            Maximal 60 Piloten erlaubt ({pilots.length}/60)
          </p>
        </div>
      )}

      {/* Tabs */}
      <nav className="tabs">
        {(['piloten', 'heats', 'bracket'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>
      
      {/* Main Content */}
      <main className="main-content">

      {activeTab === 'piloten' && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
            {pilots.map((pilot) => (
              <PilotCard 
                key={pilot.id} 
                pilot={pilot} 
                tournamentStarted={tournamentStarted}
                onEdit={(id, updates) => {
                  const result = updatePilot(id, updates)
                  if (result === false) return false
                  return result.success
                }}
                onDelete={deletePilot}
                onMarkDroppedOut={markPilotAsDroppedOut}
              />
            ))}
            {pilots.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-2xl text-steel mb-4">Keine Piloten</p>
                <p className="text-lg text-steel/70">Füge den ersten Pilot hinzu!</p>
              </div>
            )}
          </div>
          <div className="max-w-md mx-auto bg-night/30 p-6 rounded-2xl border border-neon-pink/20">
            <h2 className="text-2xl font-bold text-neon-pink mb-4">Piloten hinzufügen</h2>
            
            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setShowCSVImport(true)}
                className="flex-1 bg-neon-cyan text-void px-4 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(5,217,232,0.5)] transition-all duration-200"
              >
                CSV Import
              </button>
              <button
                onClick={() => {
                  // Scroll to form
                  document.getElementById('manual-add-form')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex-1 bg-night border border-steel text-steel px-4 py-3 rounded-lg font-semibold hover:border-neon-pink hover:text-neon-pink transition-colors"
              >
                Manuell
              </button>
            </div>

            {/* Manual Add Form - nur vor Turnierstart */}
            {!tournamentStarted && (
              <div id="manual-add-form">
                <AddPilotForm 
                  onSuccess={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                />
              </div>
            )}
            
            {tournamentStarted && (
              <div className="text-center py-8 text-steel">
                <p className="text-lg">Piloten können nach Turnierstart nicht mehr hinzugefügt werden.</p>
                <p className="text-sm mt-2">Nutze die Bearbeiten-Funktion um Piloten als "ausgefallen" zu markieren.</p>
              </div>
            )}
          </div>

          {/* Footer mit Reset-Buttons */}
          <div className="max-w-md mx-auto mt-8 pt-6 border-t border-steel/20">
            <div className="flex flex-wrap gap-4 justify-center">
              {/* "Alle Piloten löschen" - nur wenn Piloten existieren */}
              {pilots.length > 0 && (
                <button
                  onClick={() => setShowDeleteAllPilotsDialog(true)}
                  className="bg-night border-2 border-loser-red text-loser-red px-4 py-2 rounded-lg text-sm hover:bg-loser-red/10 transition-colors"
                >
                  Alle Piloten löschen
                </button>
              )}
              
              {/* "Turnier zurücksetzen" - nur wenn Turnier läuft */}
              {tournamentPhase !== 'setup' && (
                <button
                  onClick={() => setShowResetTournamentDialog(true)}
                  className="bg-night border-2 border-loser-red text-loser-red px-4 py-2 rounded-lg text-sm hover:bg-loser-red/10 transition-colors"
                >
                  Turnier zurücksetzen
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'heats' && (
        tournamentPhase === 'heat-assignment' ? (
          <HeatAssignmentView
            heats={heats}
            pilots={pilots}
            onConfirm={() => {
              confirmHeatAssignment()
              // Stay on heats tab to see the running tournament
            }}
            onCancel={() => {
              cancelHeatAssignment()
              setActiveTab('piloten')
            }}
          />
        ) : tournamentPhase === 'running' ? (
          // Active Heat View when tournament is running
          (() => {
            const activeHeat = getActiveHeat()
            const nextHeat = getNextHeat()
            
            if (activeHeat) {
              return (
                <ActiveHeatView
                  heat={activeHeat}
                  nextHeat={nextHeat}
                  pilots={pilots}
                  onSubmitResults={submitHeatResults}
                  onHeatComplete={handleHeatComplete}
                />
              )
            }
            
            // No active heat - show overview
            return (
              <HeatOverview
                heats={heats}
                pilots={pilots}
              />
            )
          })()
        ) : (
          <HeatOverview
            heats={heats}
            pilots={pilots}
          />
        )
      )}

      {activeTab === 'bracket' && (
        <div className="max-w-7xl mx-auto p-6">
          {/* Continue to next heat button - shows after heat completion */}
          {showContinueToHeats && (
            <div className="text-center mb-6">
              <button
                onClick={() => {
                  setActiveTab('heats')
                  setShowContinueToHeats(false)
                }}
                className="btn-primary text-xl px-8 py-4 animate-pulse"
              >
                → Weiter zum nächsten Heat
              </button>
            </div>
          )}
          
          <BracketTree 
            pilots={pilots}
          />
        </div>
      )}
      </main>

      {/* CSV Import Modal */}
      {showCSVImport && (
        <CSVImport
          onImport={(csvPilots) => {
            importPilots(csvPilots)
            setShowCSVImport(false)
          }}
          existingPilots={pilots}
          onCancel={() => setShowCSVImport(false)}
        />
      )}

      {/* Tournament Start Dialog */}
      {showStartDialog && (
        <TournamentStartDialog
          pilotCount={pilots.length}
          onConfirm={() => {
            const success = confirmTournamentStart()
            if (success) {
              setShowStartDialog(false)
              setActiveTab('heats')  // Auto-navigation to heats tab
            }
          }}
          onCancel={() => setShowStartDialog(false)}
        />
      )}

      {/* Reset Tournament Dialog */}
      {showResetTournamentDialog && (
        <ResetConfirmationDialog
          title="Turnier zurücksetzen?"
          description="Alle Ergebnisse werden gelöscht. Piloten bleiben erhalten."
          confirmText="Zurücksetzen"
          onConfirm={() => {
            resetTournament()
            setShowResetTournamentDialog(false)
          }}
          onCancel={() => setShowResetTournamentDialog(false)}
        />
      )}

      {/* Delete All Pilots Dialog */}
      {showDeleteAllPilotsDialog && (
        <ResetConfirmationDialog
          title="Alle Piloten löschen?"
          description={`${pilots.length} Piloten werden gelöscht. Das Turnier wird zurückgesetzt.`}
          confirmText="Alle löschen"
          onConfirm={() => {
            deleteAllPilots()
            setShowDeleteAllPilotsDialog(false)
          }}
          onCancel={() => setShowDeleteAllPilotsDialog(false)}
        />
      )}

      {/* Reset All Dialog (with typed confirmation) */}
      {showResetAllDialog && (
        <ResetConfirmationDialog
          title="Alles löschen?"
          description="Alle Piloten und Turnierdaten werden unwiderruflich gelöscht."
          confirmText="Endgültig löschen"
          requireTypedConfirmation={true}
          onConfirm={() => {
            resetAll()
            setShowResetAllDialog(false)
            setActiveTab('piloten')
          }}
          onCancel={() => setShowResetAllDialog(false)}
        />
      )}
    </div>
  )
}
