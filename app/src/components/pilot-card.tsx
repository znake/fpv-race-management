import { useState } from 'react'
import type { Pilot } from '../lib/schemas'

type PilotCardProps = {
  pilot: Pilot
  selected?: boolean
  rank?: number
  onEdit?: (id: string, updates: { name?: string; imageUrl?: string; instagramHandle?: string }) => boolean
  onDelete?: (id: string) => boolean
  onMarkDroppedOut?: (id: string) => boolean
  tournamentStarted?: boolean
}

export function PilotCard({ 
  pilot, 
  selected = false, 
  rank, 
  onEdit, 
  onDelete, 
  onMarkDroppedOut,
  tournamentStarted = false
}: PilotCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(pilot.name)
  const [editImageUrl, setEditImageUrl] = useState(pilot.imageUrl)
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
      const updates = { 
        name: editName !== pilot.name ? editName : undefined,
        imageUrl: editImageUrl !== pilot.imageUrl ? editImageUrl : undefined,
        instagramHandle: editInstagramHandle !== (pilot.instagramHandle || '') ? editInstagramHandle || undefined : undefined
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
    <div 
      className={`
        pilot-card relative bg-night text-center cursor-pointer
        border-[3px] rounded-[16px] p-6
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
      {/* Rank Badge - US-2.3: Scale-In Animation */}
      {rank && !pilot.droppedOut && (
        <div className={`
          absolute -top-2 -right-2 w-12 h-12 rounded-full
          flex items-center justify-center font-display text-[28px] text-void
          rank-badge-animate
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

      {/* Action Buttons - nur auf Hover sichtbar */}
      {!isEditing && (
        <div className={`
          absolute -top-2 -left-2 flex gap-1
          transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          {!tournamentStarted && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className="w-8 h-8 bg-neon-cyan text-void rounded-full flex items-center justify-center hover:bg-neon-pink hover:shadow-glow-pink transition-all duration-200"
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
              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:shadow-glow-red transition-all duration-200"
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
              className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 hover:shadow-glow-orange transition-all duration-200"
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
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/ff2a6d/0d0221?text=Pilot'
              }}
            />
          )}
        </div>
      </div>

      {/* Pilot Name */}
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="font-display text-2xl font-bold text-chrome mb-2 bg-void border border-neon-cyan rounded px-2 py-1 w-full text-center"
          placeholder="Pilotenname"
        />
      ) : (
        <div className="font-display text-2xl font-bold text-chrome mb-2">
          {pilot.name}
        </div>
      )}

      {/* Instagram Handle */}
      {isEditing ? (
        <input
          type="text"
          value={editInstagramHandle}
          onChange={(e) => setEditInstagramHandle(e.target.value)}
          className="font-ui text-sm text-steel mb-2 bg-void border border-neon-cyan rounded px-2 py-1 w-full text-center"
          placeholder="@pilot_fpv"
        />
      ) : (
        /* Instagram Handle - nur anzeigen wenn vorhanden */
        pilot.instagramHandle && (
          <div className="font-ui text-sm text-steel flex items-center justify-center gap-1">
            <svg 
              className="w-3 h-3" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
            </svg>
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

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-2 justify-center mt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-neon-cyan text-void rounded font-bold hover:bg-neon-pink transition-colors"
          >
            Speichern
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-steel text-chrome rounded font-bold hover:border-neon-cyan transition-colors"
          >
            Abbrechen
          </button>
        </div>
      )}

      {/* Instagram Handle - nur anzeigen wenn vorhanden */}
      {!isEditing && pilot.instagramHandle && (
        <div className="font-ui text-sm text-steel flex items-center justify-center gap-1">
          <svg 
            className="w-3 h-3" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
          </svg>
          {pilot.instagramHandle}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-void/80 flex items-center justify-center z-50">
          <div className="bg-night border-3 border-neon-cyan rounded-2xl p-6 max-w-md mx-4 shadow-glow-cyan">
            <h3 className="font-display text-xl font-bold text-chrome mb-4">
              {tournamentStarted 
                ? 'Pilot als ausgefallen markieren?' 
                : 'Pilot wirklich löschen?'
              }
            </h3>
            <p className="font-ui text-steel mb-6">
              {tournamentStarted 
                ? 'Der Pilot erhält ein Freelos im nächsten Heat und bleibt im Bracket sichtbar.'
                : 'Diese Aktion kann nicht rückgängig gemacht werden.'
              }
            </p>
            <div className="flex gap-3 justify-end">
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}