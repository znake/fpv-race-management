import { useState } from 'react'
import { PilotCard } from './components/pilot-card'
import { AddPilotForm } from './components/add-pilot-form'
import { CSVImport } from './components/csv-import'
import { Header } from './components/header'
import { usePilots } from './hooks/usePilots'

type Tab = 'piloten' | 'heats' | 'bracket'

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('piloten')
  const { pilots, importPilots, updatePilot, deletePilot, markPilotAsDroppedOut, tournamentStarted, startTournament, clearAllPilots } = usePilots()
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-void to-night text-chrome font-ui relative">
      {/* Synthwave Grid Background */}
      <div className="synthwave-grid" />
      
      {/* Header */}
      <Header />
      
      {/* Tournament Status Bar */}
      {tournamentStarted && (
        <div className="bg-night-light border-b border-gold/30 px-8 py-2 text-center">
          <span className="text-gold text-sm font-semibold">TURNIER LÄUFT</span>
        </div>
      )}
      
      {/* Tournament Start Button */}
      {!tournamentStarted && pilots.length >= 7 && (
        <div className="bg-void px-8 py-4 text-center">
          <button
            onClick={startTournament}
            className="btn-primary"
          >
            Turnier starten
          </button>
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
                  // result ist ein Objekt { success, errors }
                  return result?.success === true
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

          {/* Danger Zone - Alle Piloten löschen */}
          {!tournamentStarted && pilots.length > 0 && (
            <div className="max-w-md mx-auto mt-8 pt-6 border-t border-steel/20">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full text-sm text-steel/60 hover:text-loser-red transition-colors py-2"
              >
                ⚠️ Danger: Alle Piloten löschen
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab !== 'piloten' && (
        <div className="text-center py-20 text-steel">
          Coming soon...
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

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-void/80 flex items-center justify-center z-50">
          <div className="bg-night border-2 border-loser-red rounded-2xl p-6 max-w-md mx-4 shadow-glow-red">
            <h3 className="font-display text-2xl font-bold text-loser-red mb-4">
              ⚠️ Alle Piloten löschen?
            </h3>
            <p className="font-ui text-steel mb-2">
              Diese Aktion löscht <span className="text-chrome font-semibold">{pilots.length} Piloten</span> unwiderruflich.
            </p>
            <p className="font-ui text-steel/70 text-sm mb-6">
              Das Turnier wird zurückgesetzt. Alle Daten gehen verloren.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-steel text-chrome rounded font-bold hover:bg-steel/80 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  clearAllPilots()
                  setShowClearConfirm(false)
                }}
                className="px-4 py-2 bg-loser-red text-white rounded font-bold hover:shadow-glow-red transition-all duration-200"
              >
                Ja, alle löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}