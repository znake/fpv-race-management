# Story 4.1: Heat-Ergebnis eingeben (Toggle-to-Rank)

Status: done

## Story

**Als ein** Organisator (Thomas),  
**möchte ich** nach jedem Rennen die Platzierungen durch einfaches Anklicken der Piloten vergeben,  
**so dass** ich das Heat-Ergebnis in unter 10 Sekunden eingeben kann (2 Klicks Minimum + Fertig).

## Acceptance Criteria

### AC 1: Heat-Ansicht zeigt aktiven Heat

**Given** das Turnier läuft (Phase: 'running')  
**And** mindestens ein Heat hat Status 'active'  
**When** ich den Heats-Tab öffne  
**Then** sehe ich den aktiven Heat prominent mit großen Piloten-Karten (4x nebeneinander)  
**And** die Überschrift zeigt "HEAT {Nummer}" in großer Schrift  
**And** jeder Pilot hat ein 120px rundes Foto + Namen  
**And** die Karten sind klickbar und zeigen Hover-Effekt (Cyan-Border)

### AC 2: Toggle-to-Rank Eingabe

**Given** ich bin in der Heat-Ansicht eines aktiven Heats  
**When** ich auf einen unmarkierten Piloten klicke  
**Then** erhält dieser Pilot die nächste verfügbare Platzierung (1, dann 2, dann 3, dann 4)  
**And** die Platzierungszahl erscheint als RankBadge auf der Karte (oben rechts)  
**And** der RankBadge hat die rang-spezifische Farbe:
  - Rang 1: Gold (#f9c80e) mit Glow
  - Rang 2: Silber (#c0c0c0) mit Glow
  - Rang 3: Bronze (#cd7f32) mit Glow
  - Rang 4: Cyan (#05d9e8) mit Glow
**And** es erscheint eine Scale-In-Animation beim Badge

**Given** ich habe bereits Platzierungen vergeben  
**When** ich auf einen bereits markierten Piloten klicke  
**Then** wird seine Platzierung entfernt (Toggle-Off)  
**And** alle höheren Platzierungen werden um 1 reduziert (z.B. wenn Rang 1 entfernt wird, wird Rang 2 zu Rang 1)

### AC 3: Minimum-Anforderung für Fertig-Button

**Given** ich bin in der Heat-Ansicht  
**When** weniger als 2 Piloten Platzierungen haben  
**Then** ist der "Fertig"-Button disabled (grau, nicht klickbar)

**Given** ich bin in der Heat-Ansicht  
**When** mindestens 2 Piloten Platzierungen haben (Rang 1 + Rang 2)  
**Then** wird der "Fertig"-Button aktiv (Neon-Pink mit Glow)  
**And** ich kann optional Rang 3 und 4 noch vergeben

### AC 4: Keyboard-Unterstützung

**Given** ich bin in der Heat-Ansicht  
**And** eine Piloten-Karte ist fokussiert (per Tab-Navigation)  
**When** ich Taste 1, 2, 3 oder 4 drücke  
**Then** erhält der fokussierte Pilot diese Platzierung  
**And** ein bereits vorhandener Pilot mit dieser Platzierung verliert sie (direktes Überschreiben)

**Given** ich bin in der Heat-Ansicht  
**When** ich Escape drücke  
**Then** werden alle Platzierungen zurückgesetzt (Quick-Reset)

### AC 5: On-Deck Vorschau

**Given** ich bin in der Heat-Ansicht  
**And** es gibt einen weiteren Heat nach dem aktuellen  
**When** ich die Ansicht betrachte  
**Then** sehe ich am unteren Rand eine "On-Deck"-Vorschau  
**And** diese zeigt "NÄCHSTER HEAT – Bitte Drohnen vorbereiten"  
**And** die Piloten des nächsten Heats sind mit kleinen Fotos (48px) und Namen sichtbar  
**And** das Styling ist dezenter als der Hauptbereich (Steel-Border, kleinere Schrift)

### AC 6: Visuelle Zustandsanzeige

**Given** ein Heat wurde abgeschlossen  
**When** ich den Bracket-Tab oder Heat-Übersicht betrachte  
**Then** zeigt die HeatBox die vergebenen Ränge neben den Piloten-Namen  
**And** der Border wechselt zu Grün (winner-green) mit Glow

## Tasks / Subtasks

- [ ] Task 1: ActiveHeatView Komponente erstellen (AC: 1, 5)
  - [ ] Layout: 4 Piloten-Karten nebeneinander (Grid)
  - [ ] Header: "HEAT {Nummer}" mit Display-Font
  - [ ] Große PilotCards (120px Foto, Name)
  - [ ] On-Deck Vorschau am unteren Rand
  - [ ] Responsive für verschiedene Bildschirmgrößen

- [ ] Task 2: Heat-Ergebnis State-Management (AC: 2, 3)
  - [ ] `currentHeatRankings: Map<pilotId, rank>` als lokaler State
  - [ ] `assignRank(pilotId)` - vergibt nächste verfügbare Platzierung
  - [ ] `removeRank(pilotId)` - entfernt Platzierung, passt andere an
  - [ ] `toggleRank(pilotId)` - kombiniert assign/remove
  - [ ] `isFinishEnabled` - computed aus rankings.size >= 2

- [ ] Task 3: Klickbare PilotCard im Heat-Modus (AC: 2)
  - [ ] onClick Handler für Rang-Toggle
  - [ ] RankBadge Anzeige mit rang-spezifischer Farbe
  - [ ] Scale-In Animation für Badge-Erscheinen
  - [ ] Hover-State mit Cyan-Border

- [ ] Task 4: Fertig-Button mit Validation (AC: 3)
  - [ ] Button mit disabled-State (grau wenn < 2 Ränge)
  - [ ] Aktiv-State: Neon-Pink mit Glow
  - [ ] Click-Handler ruft Store-Action auf

- [ ] Task 5: Keyboard-Support (AC: 4)
  - [ ] Tab-Navigation durch Piloten-Karten
  - [ ] Tasten 1-4 für direkte Rang-Vergabe
  - [ ] Escape für Reset aller Platzierungen
  - [ ] Focus-Styling (Cyan-Glow-Ring)

- [ ] Task 6: On-Deck Preview Komponente (AC: 5)
  - [ ] Kompakte Piloten-Anzeige (48px Fotos)
  - [ ] Dezentes Styling (Steel-Border)
  - [ ] "NÄCHSTER HEAT" Header
  - [ ] Conditional Render (nur wenn next Heat existiert)

## Dev Notes

### UI-Layout Konzept

```
┌─────────────────────────────────────────────────────────────┐
│                        HEAT 5                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  │  [1]          │  │  [2]          │  │               │  │               │
│  │    🖼 120px   │  │    🖼 120px   │  │    🖼 120px   │  │    🖼 120px   │
│  │     ANNA      │  │      BEN      │  │     CHRIS     │  │     DANA      │
│  │   @anna_fpv   │  │   @ben_fpv    │  │  @chris_fpv   │  │   @dana_fpv   │
│  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘
│                                                             │
│                      [Fertig ✓]                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  NÄCHSTER HEAT – Bitte Drohnen vorbereiten                  │
│  🖼 Erik   🖼 Flo    🖼 Gina   🖼 Hans                       │
└─────────────────────────────────────────────────────────────┘
```

### Toggle-to-Rank Algorithmus

```typescript
// Lokaler State in ActiveHeatView
const [rankings, setRankings] = useState<Map<string, number>>(new Map())

const toggleRank = (pilotId: string) => {
  const currentRank = rankings.get(pilotId)
  
  if (currentRank !== undefined) {
    // REMOVE: Pilot hat bereits Rang → entfernen
    const newRankings = new Map(rankings)
    newRankings.delete(pilotId)
    
    // Alle höheren Ränge um 1 reduzieren
    for (const [id, rank] of newRankings) {
      if (rank > currentRank) {
        newRankings.set(id, rank - 1)
      }
    }
    setRankings(newRankings)
  } else {
    // ASSIGN: Nächsten freien Rang vergeben
    const nextRank = rankings.size + 1
    if (nextRank <= heat.pilotIds.length) {
      setRankings(new Map(rankings).set(pilotId, nextRank))
    }
  }
}

// Computed: Fertig-Button aktivieren?
const isFinishEnabled = rankings.size >= 2
```

### Store-Erweiterungen benötigt

```typescript
interface TournamentState {
  // Bestehend
  heats: Heat[]
  currentHeatIndex: number
  
  // NEU für US-4.1
  submitHeatResults: (heatId: string, rankings: { pilotId: string; rank: 1|2|3|4 }[]) => void
}

// Heat.results wird befüllt
interface Heat {
  results?: {
    rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]
    completedAt?: string
  }
}
```

**submitHeatResults Implementation:**
```typescript
submitHeatResults: (heatId, rankings) => {
  const { heats, currentHeatIndex } = get()
  
  const heatIndex = heats.findIndex(h => h.id === heatId)
  if (heatIndex === -1) return
  
  const updatedHeats = [...heats]
  updatedHeats[heatIndex] = {
    ...updatedHeats[heatIndex],
    status: 'completed',
    results: {
      rankings,
      completedAt: new Date().toISOString()
    }
  }
  
  // Nächsten Heat aktivieren (wenn vorhanden)
  const nextHeatIndex = heats.findIndex((h, i) => i > heatIndex && h.status === 'pending')
  if (nextHeatIndex !== -1) {
    updatedHeats[nextHeatIndex] = {
      ...updatedHeats[nextHeatIndex],
      status: 'active'
    }
  }
  
  set({ 
    heats: updatedHeats,
    currentHeatIndex: nextHeatIndex !== -1 ? nextHeatIndex : currentHeatIndex
  })
}
```

### Keyboard Navigation Pattern

```typescript
// In ActiveHeatView
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Nur wenn Focus auf Piloten-Karte liegt
    const focusedPilotId = document.activeElement?.getAttribute('data-pilot-id')
    
    if (focusedPilotId && ['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault()
      assignDirectRank(focusedPilotId, parseInt(e.key) as 1|2|3|4)
    }
    
    if (e.key === 'Escape') {
      resetRankings()
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

### RankBadge Styling (aus bestehender PilotCard übernehmen)

```tsx
// RankBadge - bereits in PilotCard implementiert!
{rank && (
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
```

**WICHTIG:** Die PilotCard-Komponente hat bereits `rank`-Prop Unterstützung! Nutze diese bestehende Implementierung.

### Integration in App.tsx

```tsx
// In Heats-Tab Content
{tournamentPhase === 'running' && (
  <ActiveHeatView 
    heat={heats.find(h => h.status === 'active')!}
    nextHeat={heats.find((h, i) => i > currentHeatIndex && h.status === 'pending')}
    pilots={pilots}
    onSubmitResults={submitHeatResults}
  />
)}
```

### Bestehende Komponenten wiederverwenden

| Komponente | Wiederverwendung | Anpassung |
|------------|------------------|-----------|
| `PilotCard` | ✅ Vollständig | `rank`-Prop + `onClick`-Handler hinzufügen |
| `HeatCard` | ✅ Für On-Deck | Ränge in HeatCard anzeigen wenn completed |
| `globals.css` | ✅ Synthwave-Styling | `rank-badge-animate` Animation bereits vorhanden |

### NFR-Compliance

| NFR | Anforderung | Umsetzung |
|-----|-------------|-----------|
| NFR3 | Ergebnis-Eingabe < 100ms Feedback | Lokaler State, sofortige UI-Updates |
| NFR4 | Bracket-Update < 200ms | Store-Update nach Fertig-Klick |
| NFR12 | Ergebnis in < 10 Sekunden | 2 Klicks + Fertig = ~3-5 Sekunden |
| NFR14 | Beamer-Lesbarkeit aus 10m | 120px Fotos, 24px+ Schrift |

### Project Structure Notes

- Neue Datei: `src/components/active-heat-view.tsx`
- Neue Datei: `src/components/on-deck-preview.tsx`
- Erweiterung: `src/stores/tournamentStore.ts` (submitHeatResults)
- Erweiterung: `src/App.tsx` (ActiveHeatView einbinden)
- Tests: `tests/heat-results.test.tsx`

### Edge Cases

| Case | Handling |
|------|----------|
| Heat mit 3 Piloten | Max. Rang 3 möglich, Fertig ab 2 Rängen |
| Schnelles Doppelklick | Rankings-Update ist idempotent |
| Browser-Refresh während Eingabe | Lokaler State geht verloren, Heats bleiben intakt |
| Letzter Heat (kein On-Deck) | On-Deck Section wird nicht gerendert |
| Alle Piloten gerankt | Fertig-Button prominent, Eingabe vollständig |

### References

- [Source: docs/prd.md#FR12] - Gewinner durch sequentielles Anklicken auswählen
- [Source: docs/prd.md#FR13] - Heat mit "Fertig"-Button bestätigen
- [Source: docs/prd.md#FR16] - On-Deck Vorschau
- [Source: docs/ux-design-specification.md#PilotCard] - RankBadge Anatomie
- [Source: docs/ux-design-specification.md#Toggle-to-Rank] - Interaktions-Pattern
- [Source: src/components/pilot-card.tsx] - Bestehende Rank-Implementierung

## Definition of Done

### Funktional
- [x] ActiveHeatView zeigt aktiven Heat mit 4 Piloten-Karten
- [x] Klick auf Pilot vergibt nächsten verfügbaren Rang
- [x] Erneuter Klick entfernt Rang (Toggle-Verhalten)
- [x] RankBadge erscheint mit rang-spezifischer Farbe (Gold/Cyan/Pink)
- [x] Fertig-Button disabled bei < 2 Rängen
- [x] Fertig-Button aktiv bei >= 2 Rängen (Neon-Pink + Glow)
- [x] Klick auf Fertig ruft `submitHeatResults` auf
- [x] Heat-Status wechselt zu 'completed'
- [x] Nächster Heat wird automatisch aktiviert

### UI/Design
- [x] 120px runde Piloten-Fotos
- [x] Grid-Layout: 4 Karten nebeneinander
- [x] "HEAT {N}" Header in Display-Font
- [x] RankBadge mit Scale-In-Animation
- [x] Hover-Effekt auf Piloten-Karten (Cyan-Border)
- [x] On-Deck Vorschau am unteren Rand
- [x] On-Deck zeigt "NÄCHSTER HEAT – Bitte Drohnen vorbereiten"
- [x] Synthwave-Styling durchgängig

### Keyboard
- [x] Tab-Navigation durch Piloten-Karten
- [x] Tasten 1-4 vergeben direkten Rang
- [x] Escape resettet alle Ränge
- [x] Focus-Styling sichtbar (Cyan-Glow)

### Tests
- [x] Unit-Test: `toggleRank()` vergibt Rang
- [x] Unit-Test: `toggleRank()` entfernt Rang
- [x] Unit-Test: Rang-Reduktion bei Entfernung
- [x] Unit-Test: `submitHeatResults()` aktualisiert Store
- [x] Unit-Test: Nächster Heat wird aktiviert
- [x] Unit-Test: Fertig-Button disabled bei < 2 Rängen

### Qualität
- [x] Visueller Test auf 1920x1080 (Beamer-Simulation)
- [x] Keine TypeScript-Fehler
- [x] Keine Console-Errors
- [x] NFR3 erfüllt (< 100ms Feedback)
- [ ] Code-Review bestanden

## Dev Agent Record

### Context Reference
- Story 4-1 ready-for-dev
- Abhängigkeit von Epic 3 (Turnier-Setup & Heat-Aufteilung) - ✅ DONE
- Erste Story im Epic 4 (Heat-Durchführung & Bracket)

### Agent Model Used
Claude (Anthropic) - claude-sonnet-4-20250514

### Completion Notes List
- Implemented ActiveHeatView component with full Toggle-to-Rank functionality
- Created OnDeckPreview component for next heat preparation display
- Added submitHeatResults, getActiveHeat, getNextHeat actions to tournament store
- Implemented keyboard navigation (Tab, 1-4 keys, Escape for reset)
- Fertig-Button disabled when less than 2 rankings assigned
- RankBadge shows with rank-specific colors (Gold/Cyan/Pink) and scale-in animation
- Heat status transitions: active → completed, next pending → active
- Tournament phase transitions to 'finale' when all heats completed
- All 18 unit tests passing (heat-results.test.tsx)
- Full TypeScript compilation without errors
- Production build successful

### File List
- `src/components/active-heat-view.tsx` (NEW) - Main heat result entry UI
- `src/components/on-deck-preview.tsx` (NEW) - Next heat preview component
- `src/stores/tournamentStore.ts` (MODIFIED) - Added submitHeatResults, getActiveHeat, getNextHeat
- `src/App.tsx` (MODIFIED) - Integrated ActiveHeatView in heats tab for running phase
- `tests/heat-results.test.tsx` (NEW) - 18 unit tests for heat results functionality
