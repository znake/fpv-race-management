# Story 6.3: Heats & Bracket Tabs zusammenführen

Status: done

## Story

**Als ein** Organisator (Thomas),  
**möchte ich** alle Turnier-Informationen auf einer scrollbaren Seite sehen,  
**so dass** ich nicht zwischen Tabs wechseln muss und den Überblick behalte.

## Acceptance Criteria

### AC 1: Zwei Tabs statt drei

**Given** die App ist geladen  
**When** ich die Navigation betrachte  
**Then** sehe ich nur zwei Tabs: "PILOTEN" und "TURNIER"

### AC 2: Turnier-Tab Layout

**Given** ein Turnier läuft  
**When** ich den TURNIER-Tab öffne  
**Then** sehe ich von oben nach unten:
1. Aktiver Heat (große Piloten-Karten mit Rang-Eingabe)
2. On-Deck Vorschau (nächster Heat)
3. Heats-Übersicht (alle initialen Heats horizontal)
4. Winner Bracket
5. Loser Bracket
6. Grand Finale (ganz unten)

### AC 3: Heats-Übersicht statt Qualifikation

**Given** ich bin im TURNIER-Tab  
**When** ich die Heats-Sektion betrachte  
**Then** heißt sie "HEATS" (nicht "QUALIFIKATION")  
**And** enthält die initialen Heats (WB/LB Heats sind in deren Sektionen)

### AC 4: Grand Finale am Ende

**Given** ich bin im TURNIER-Tab  
**When** ich nach unten scrolle  
**Then** ist das Grand Finale die letzte Sektion (nicht zwischen Winner und Loser)

### AC 5: Kein Auto-Tab-Wechsel mehr

**Given** ich schließe einen Heat ab  
**When** ich auf "Fertig" klicke  
**Then** bleibe ich im TURNIER-Tab  
**And** die Seite scrollt automatisch zum ActiveHeatView (smooth scroll)

### AC 6: Responsive Scrolling

**Given** das Bracket ist größer als der Viewport  
**When** ich scrolle  
**Then** kann ich vertikal durch alle Sektionen scrollen  
**And** horizontal innerhalb der Bracket-Sektionen (wenn nötig)

## Tasks

- [x] Task 1: Tab-Struktur anpassen (App.tsx)
  - [x] Tab-Typ von `'piloten' | 'heats' | 'bracket'` zu `'piloten' | 'turnier'` ändern
  - [x] Heats-Tab komplett entfernen
  - [x] Tab-Label von "BRACKET" zu "TURNIER" ändern
  - [x] Bei Turnier-Start automatisch zu "TURNIER" Tab wechseln

- [x] Task 2: BracketTree erweitern (bracket-tree.tsx)
  - [x] `ActiveHeatView` am Anfang der Komponente einbinden
  - [x] Props erweitern: `onSubmitResults`, `tournamentPhase`, `activeHeat`, `nextHeat`
  - [x] On-Deck Preview unterhalb ActiveHeatView einbinden (via ActiveHeatView component)
  - [x] Ref für Auto-Scroll zum ActiveHeatView

- [x] Task 3: Sektions-Reihenfolge und Naming anpassen
  - [x] "QUALIFIKATION" in "HEATS" umbenennen
  - [x] `GrandFinaleSection` ans Ende verschieben (nach LoserBracket)
  - [x] Reihenfolge: ActiveHeat → Heats → Winner → Loser → Finale

- [x] Task 4: Auto-Tab-Wechsel durch Auto-Scroll ersetzen
  - [x] `handleHeatComplete` Callback anpassen: Scroll statt Tab-Wechsel
  - [x] `showContinueToHeats` State entfernen
  - [x] "Weiter zum nächsten Heat" Button entfernen
  - [x] Smooth Scroll zum ActiveHeatView nach Heat-Completion

- [x] Task 5: Tests anpassen
  - [x] Alle bestehenden Tests grün (193/193 passed)

## Dev Notes

### Tab-Änderung in App.tsx

```typescript
// Vorher
type Tab = 'piloten' | 'heats' | 'bracket'

// Nachher  
type Tab = 'piloten' | 'turnier'
```

### Neue BracketTree Props

```typescript
interface BracketTreeProps {
  pilots: Pilot[]
  // NEU:
  tournamentPhase: TournamentPhase
  activeHeat?: Heat
  nextHeat?: Heat
  onSubmitResults: (heatId: string, rankings: { pilotId: string; rank: 1|2|3|4 }[]) => void
  onHeatComplete?: () => void  // Für Auto-Scroll
}
```

### Layout-Struktur

```
┌─────────────────────────────────────────────────────────────────┐
│                     AKTIVER HEAT (wenn running)                  │
│  [ActiveHeatView Komponente]                                    │
│  [On-Deck Preview]                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           HEATS                                  │
│  [Heat 1] [Heat 2] [Heat 3] [Heat 4] [Heat 5] ...              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      WINNER BRACKET                             │
│  [Bestehende WinnerBracketSection]                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      LOSER BRACKET                              │
│  [Bestehende LoserBracketSection]                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     ★ GRAND FINALE ★                            │
│  [GrandFinaleSection - GANZ UNTEN]                              │
└─────────────────────────────────────────────────────────────────┘
```

### Auto-Scroll Implementation

```typescript
// In BracketTree
const activeHeatRef = useRef<HTMLDivElement>(null)

const scrollToActiveHeat = useCallback(() => {
  activeHeatRef.current?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start' 
  })
}, [])

// Nach Heat-Completion aufrufen
useEffect(() => {
  if (activeHeat) {
    scrollToActiveHeat()
  }
}, [activeHeat?.id])
```

### Zu entfernender Code

- `showContinueToHeats` State in App.tsx
- `handleHeatComplete` Tab-Wechsel Logik
- "Weiter zum nächsten Heat" Button
- Kompletter `activeTab === 'heats'` Block

### Bestehende Komponenten wiederverwenden

| Komponente | Aktion |
|------------|--------|
| `ActiveHeatView` | In BracketTree einbetten |
| `OnDeckPreview` | In BracketTree einbetten |
| `HeatAssignmentView` | Bleibt für heat-assignment Phase |
| `BracketHeatBox` | Unverändert |
| `WinnerBracketSection` | Unverändert |
| `LoserBracketSection` | Unverändert |
| `GrandFinaleSection` | Nur Position ändern |

## Definition of Done

### Funktional
- [x] Nur 2 Tabs sichtbar: PILOTEN und TURNIER
- [x] TURNIER-Tab zeigt alle Sektionen in korrekter Reihenfolge
- [x] ActiveHeatView funktioniert innerhalb BracketTree
- [x] Heat-Completion scrollt zum nächsten Heat (kein Tab-Wechsel)
- [x] Grand Finale ist die letzte Sektion

### UI/Design
- [x] "HEATS" statt "QUALIFIKATION" als Sektion-Titel
- [x] Smooth Scroll nach Heat-Completion
- [x] Responsive: Vertikales Scrollen durch alle Sektionen
- [x] Heat-Assignment Phase funktioniert weiterhin

### Tests
- [x] Alle bestehenden Tests grün (193/193)

### Qualität
- [x] Keine TypeScript-Fehler
- [x] Build erfolgreich
- [x] Beamer-tauglich (1920x1080)

## References

- [Source: docs/sprint-change-proposal-ui-tab-merge-2025-12-19.md] - Change Proposal
- [Source: docs/prd.md#FR27] - Bracket-Tab
- [Source: docs/prd.md#FR28] - Aktueller-Heat-Tab
- [Source: docs/prd.md#FR29] - Tab-Wechsel
