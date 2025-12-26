import { useState } from 'react'
import type { Pilot } from '../lib/schemas'
import { FALLBACK_PILOT_IMAGE } from '../lib/ui-helpers'
import { Modal } from './ui/modal'

type PilotCardProps = {
  pilot: Pilot
  selected?: boolean
  rank?: number
  showRank?: boolean  // US-4.4: Optional anzeigen
  size?: 'small' | 'medium' | 'large'  // US-4.4: Für Bracket vs Heat-Übersicht
  onEdit?: (id: string, updates: { name?: string; imageUrl?: string; instagramHandle?: string }) => boolean
  onDelete?: (id: string) => boolean
  onMarkDroppedOut?: (id: string) => boolean
  tournamentStarted?: boolean
}

export function PilotCard({
  pilot,
  selected = false,
  rank,
  showRank = true,  // US-4.4: Default true (backward compatible)
  size = 'medium',  // US-4.4: Default medium
  onEdit,
  onDelete,
  onMarkDroppedOut,
  tournamentStarted = false
}: PilotCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(pilot.name)
  const [editImageUrl, setEditImageUrl] = useState(pilot.imageUrl || '')
  const [editInstagramHandle, setEditInstagramHandle] = useState(pilot.instagramHandle || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isHovered, setIsHovered] = useState(false)

  // US-2.3: Rang-spezifische Farben
  const getRankBorderClass = () => {
    if (pilot.droppedOut) return 'border-steel opacity-60'
    if (rank === 1) return 'border-gold' // Gold für Rang 1
    if (rank === 2) return 'border-neon-cyan' // Cyan für Rang 2
    if (rank === 3 || rank === 4) return 'border-neon-pink' // Pink für Rang 3+4
    if (selected) return 'border-neon-pink'
    return 'border-steel'
  }

  const getRankGlowClass = () => {
    if (pilot.droppedOut) return ''
    if (rank === 1) return 'shadow-glow-gold animate-[glow-pulse-gold_2s_ease-in-out_infinite]'
    if (rank === 2) return 'shadow-glow-cyan animate-[glow-pulse-cyan_2s_ease-in-out_infinite]'
    if (rank === 3 || rank === 4 || selected) return 'shadow-glow-pink'
    return ''
  }

  // US-2.3: Animated border for selected state
  const getSelectedClass = () => {
    if (rank && !pilot.droppedOut) return 'pilot-card-selected'
    return ''
  }

  const handleSave = () => {
    if (onEdit) {
      const currentImageUrl = pilot.imageUrl || ''
      const currentInstagramHandle = pilot.instagramHandle || ''

      // Nur die Felder hinzufügen, die sich wirklich geändert haben
      const updates: { name?: string; imageUrl?: string; instagramHandle?: string } = {}

      if (editName !== pilot.name) {
        updates.name = editName
      }

      if (editImageUrl !== currentImageUrl) {
        updates.imageUrl = editImageUrl
      }

      if (editInstagramHandle !== currentInstagramHandle) {
        updates.instagramHandle = editInstagramHandle || undefined
      }

      // Wenn nichts geändert wurde, einfach den Edit-Modus beenden
      if (Object.keys(updates).length === 0) {
        setIsEditing(false)
        setValidationErrors([])
        return
      }

      const result = onEdit(pilot.id, updates)

      if (result) {
        setIsEditing(false)
        setValidationErrors([])
      } else {
        setValidationErrors(['Fehler beim Speichern'])
      }
    }
  }

  const handleCancel = () => {
    setEditName(pilot.name)
    setEditImageUrl(pilot.imageUrl)
    setEditInstagramHandle(pilot.instagramHandle || '')
    setIsEditing(false)
    setValidationErrors([])
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(pilot.id)
    }
    setShowDeleteConfirm(false)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleMarkDroppedOut = () => {
    if (onMarkDroppedOut) {
      onMarkDroppedOut(pilot.id)
    }
  }

  const handleCardClick = () => {
    if (!isEditing && !tournamentStarted && onEdit) {
      setIsEditing(true)
    }
  }

  return (
    <>
      <div
        className={`
          pilot-card relative bg-night text-center cursor-pointer
          border-[3px] rounded-[16px] p-6 min-w-[150px]
          transition-all duration-200 ease-out
          hover:-translate-y-1 hover:border-neon-cyan
          ${getRankBorderClass()}
          ${getRankGlowClass()}
          ${getSelectedClass()}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Rank Badge - Beamer-optimiert (min 32px Zahl für Beamer-Lesbarkeit - AC5) */}
        {showRank && rank && !pilot.droppedOut && (
          <div className={`
            absolute -top-2 -right-2
            ${size === 'large' ? 'w-14 h-14' : 'w-12 h-12'}
            rounded-full flex items-center justify-center font-display text-void rank-badge-animate text-beamer-rank
            ${rank === 1 ? 'bg-gold shadow-glow-gold' : ''}
            ${rank === 2 ? 'bg-neon-cyan shadow-glow-cyan' : ''}
            ${rank === 3 || rank === 4 ? 'bg-neon-pink shadow-glow-pink' : ''}
          `}>
            {rank}
          </div>
        )}

        {/* Dropped Out Badge */}
        {pilot.droppedOut && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            AUSGEFALLEN
          </div>
        )}

        {/* Action Buttons - Beamer-optimiert (min 44x44px Klickfläche) */}
        {!isEditing && (
          <div className={`
            absolute -top-3 -left-3 flex gap-2 z-10
            transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}>
            {!tournamentStarted && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
                className="w-11 h-11 min-w-[44px] min-h-[44px] bg-neon-cyan text-void rounded-full flex items-center justify-center hover:bg-neon-pink hover:shadow-glow-pink transition-all duration-200 text-lg"
                title="Bearbeiten"
              >
                ✏️
              </button>
            )}
            {!tournamentStarted && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="w-11 h-11 min-w-[44px] min-h-[44px] bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:shadow-glow-red transition-all duration-200 text-lg"
                title="Löschen"
              >
                🗑️
              </button>
            )}
            {tournamentStarted && !pilot.droppedOut && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleMarkDroppedOut()
                }}
                className="w-11 h-11 min-w-[44px] min-h-[44px] bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 hover:shadow-glow-orange transition-all duration-200 text-lg"
                title="Als ausgefallen markieren"
              >
                ⚠️
              </button>
            )}
          </div>
        )}

        {/* Pilot Photo - US-2.2: 120px Durchmesser, rund, Pink→Magenta Gradient */}
        <div className="relative mb-4 mx-auto w-[120px] h-[120px]">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-gradient-to-br from-neon-pink to-neon-magenta">
            {isEditing ? (
              <input
                type="text"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="w-full h-full object-cover bg-void text-center text-xs p-1"
                placeholder="Bild-URL"
              />
            ) : (
              <img
                src={pilot.imageUrl}
                alt={pilot.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
            )}
          </div>
        </div>

        {/* Pilot Name - Beamer-optimiert (min 24px) */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="font-display text-beamer-name font-bold text-chrome mb-2 bg-void border border-neon-cyan rounded px-2 py-1 w-full text-center"
            placeholder="Pilotenname"
          />
        ) : (
          <div className="font-display text-beamer-name font-bold text-chrome mb-2">
            {pilot.name}
          </div>
        )}

        {/* Instagram Handle - Beamer-optimiert (min 16px caption) */}
        {isEditing ? (
          <input
            type="text"
            value={editInstagramHandle}
            onChange={(e) => setEditInstagramHandle(e.target.value)}
            className="font-ui text-beamer-caption text-steel mb-2 bg-void border border-neon-cyan rounded px-2 py-1 w-full text-center"
            placeholder="@pilot_fpv"
          />
        ) : (
           /* Instagram Handle - nur anzeigen wenn vorhanden */
           pilot.instagramHandle && (
             <div className="font-ui text-beamer-caption text-steel text-center">
               {pilot.instagramHandle}
             </div>
          )
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 text-red-400 text-sm">
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        {/* Edit Actions - Beamer-optimiert (min 48px Höhe) */}
        {isEditing && (
          <div className="flex gap-2 justify-center mt-4">
            <button
              onClick={handleSave}
              className="px-6 py-3 min-h-[48px] bg-neon-cyan text-void rounded font-bold hover:bg-neon-pink transition-colors text-beamer-body"
            >
              Speichern
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 min-h-[48px] bg-steel text-chrome rounded font-bold hover:border-neon-cyan transition-colors text-beamer-body"
            >
              Abbrechen
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        title={tournamentStarted ? 'Pilot als ausgefallen markieren?' : 'Pilot wirklich löschen?'}
        size="sm"
      >
        <p className="font-ui text-steel mb-6">
          {tournamentStarted
            ? 'Der Pilot erhält ein Freelos im nächsten Heat und bleibt im Bracket sichtbar.'
            : 'Diese Aktion kann nicht rückgängig gemacht werden.'
          }
        </p>
        <Modal.Footer>
          <button
            onClick={cancelDelete}
            className="px-4 py-2 bg-steel text-chrome rounded font-bold hover:border-neon-cyan hover:shadow-glow-cyan transition-all duration-200"
          >
            Abbrechen
          </button>
          <button
            onClick={confirmDelete}
            className={`px-4 py-2 rounded font-bold hover:shadow-glow-red transition-all duration-200 ${
              tournamentStarted
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {tournamentStarted ? 'Ausgefallen' : 'Löschen'}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
