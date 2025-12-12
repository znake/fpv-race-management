import { useState } from 'react'
import { PilotCard } from './components/pilot-card'
import { AddPilotForm } from './components/add-pilot-form'
import { usePilots } from './hooks/usePilots'

type Tab = 'piloten' | 'heats' | 'bracket'

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('piloten')
  const { pilots } = usePilots()

  return (
    <div className="min-h-screen bg-gradient-to-br from-void via-night to-black text-white p-8">
      <header className="text-center mb-12">
        <h1 className="text-6xl font-black bg-gradient-to-r from-neon-pink to-glow-pink bg-clip-text text-transparent drop-shadow-2xl">
          FPV Racing Heats
        </h1>
        <p className="text-xl text-gray-400 mt-4">Piloten Management</p>
      </header>

      <div className="flex justify-center mb-12">
        <nav className="flex space-x-1 bg-night/50 backdrop-blur-xl rounded-2xl p-1 border border-neon-pink/30">
          {(['piloten', 'heats', 'bracket'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab
                  ? 'bg-neon-pink text-black shadow-2xl shadow-neon-pink/50'
                  : 'text-gray-400 hover:text-neon-pink hover:bg-night/70'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'piloten' && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
            {pilots.map((pilot) => (
              <PilotCard key={pilot.id} pilot={pilot} />
            ))}
            {pilots.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-2xl text-gray-500 mb-4">Keine Piloten</p>
                <p className="text-lg text-gray-600">Füge den ersten Pilot hinzu!</p>
              </div>
            )}
          </div>
          <div className="max-w-md mx-auto bg-night/30 p-6 rounded-2xl border border-neon-pink/20">
            <h2 className="text-2xl font-bold text-neon-pink mb-4">Neuen Pilot hinzufügen</h2>
            <AddPilotForm 
              onSuccess={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            />
          </div>
        </div>
      )}

      {activeTab !== 'piloten' && (
        <div className="text-center py-20 text-gray-500">
          Coming soon...
        </div>
      )}
    </div>
  )
}