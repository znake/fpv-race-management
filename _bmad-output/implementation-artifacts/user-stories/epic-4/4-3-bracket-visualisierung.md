# Story 4.3: Dynamische Bracket-Visualisierung mit Pools

**Status:** review
**Updated:** 2025-12-25
**Source:** [Course Correction Dynamic Brackets 2025-12-23](../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)

> **🔄 COURSE CORRECTION 2025-12-23**
> Story wurde überarbeitet für dynamisches Bracket-System mit Pool-Visualisierung.
> Keine vorberechneten Strukturen mehr. Pools werden im Bracket angezeigt.
> Siehe: `docs/sprints/change-proposals/course-correction-dynamic-brackets-2025-12-23.md`

## Story

**Als ein** Zuschauer oder Pilot (Lisa, Familie Huber),
**möchte ich** den kompletten Turnierverlauf als dynamisches Bracket mit Pool-Visualisierung sehen,
**so dass** ich verstehe, welche Piloten in den Pools warten und wie neue Heats erstellt werden.

## Acceptance Criteria

### AC 1: Drei-Sektionen-Layout (Quali / Winner / Loser / Grand Finale)

**Given** ein Turnier wurde gestartet
**When** ich den Bracket-Tab öffne
**Then** sehe ich vier separate Bereiche:
- **QUALIFIKATION** (oben) - Alle Initial-Heats horizontal angeordnet
- **WINNER BRACKET** (mitte) - Dynamisch erstellte WB-Heats mit Pool-Anzeige
- **LOSER BRACKET** (unten) - Dynamisch erstellte LB-Heats mit Pool-Anzeige
- **GRAND FINALE** (zentral) - Grand Finale Heat (wenn bereit)

### AC 2: Pool-Visualisierung im Winner Bracket (NEU)

**Given** ich bin im Bracket-Tab
**When** der WB Pool Piloten enthält
**Then** sehe ich die WB Pool-Piloten im Winner Bracket
**And** die Piloten werden in der Reihenfolge angezeigt, in der sie in den Pool gekommen sind
**And** ich sehe wie viele Piloten noch für den nächsten WB-Heat fehlen
**And** der Status zeigt "Warte auf Piloten..." oder "WB Heat bereit!"

### AC 3: Pool-Visualisierung im Loser Bracket (NEU)

**Given** ich bin im Bracket-Tab
**When** der LB Pool Piloten enthält
**Then** sehe ich die LB Pool-Piloten im Loser Bracket
**And** die Piloten werden in der Reihenfolge angezeigt (FIFO)
**And** ein Pfeil zeigt, dass die ersten 4 Piloten in den nächsten LB-Heat gehen
**And** ich sehe wie viele Piloten noch für den nächsten LB-Heat fehlen
**And** der Status zeigt "Warte auf Piloten..." oder "LB Heat bereit!"

### AC 4: Dynamische Heat-Erstellung Visualisierung

**Given** ein Heat abgeschlossen wird
**When** neue Heats erstellt werden
**Then** sehe ich kurz eine Animation, dass neue Heats zum Bracket hinzugefügt werden
**And** die Pool-Anzeige wird sofort aktualisiert (Piloten entfernt)

### AC 5: Keine vorberechnete Struktur mehr (NEU)

**Given** ein Turnier wurde gestartet
**When** noch keine Heats gespielt wurden
**Then** sehe ich nur die Qualifikations-Heats
**And** ich sehe KEINE vorberechneten WB/LB Platzhalter
**And** das Bracket wächst dynamisch wenn Heats abgeschlossen werden

### AC 6: Visuelle Farbcodierung

**Given** ich bin im Bracket-Tab
**When** ich das Bracket betrachte
**Then** haben Qualifikations-Elemente neutrale Styling (Cyan)
**And** Winner-Bracket-Elemente haben Grün-Akzente
**And** Loser-Bracket-Elemente haben Rot/Pink-Akzente
**And** das Grand Finale hat Gold-Styling mit verstärktem Glow
**And** abgeschlossene Heats haben Winner-Green Border

### AC 7: Heat-Boxen im Bracket

**Given** ich bin im Bracket-Tab
**When** ich eine HeatBox betrachte
**Then** sehe ich alle Piloten des Heats mit Mini-Fotos (32px)
**And** bei completed Heats sehe ich die Platzierungen (1, 2, 3, 4)
**And** Pending Heats zeigen "Wartet..." mit gestricheltem Border
**And** der aktive Heat ist hervorgehoben (Cyan-Glow)

### AC 8: Responsive & Scrollbar

**Given** das Turnier hat viele Piloten (20+)
**When** das Bracket größer als der Viewport wird
**Then** kann ich horizontal scrollen
**And** auf 1920x1080 (Beamer) ist das Bracket gut lesbar

### AC 9: Klick auf HeatBox

**Given** ich bin im Bracket-Tab
**When** ich auf eine HeatBox klicke
**Then** sehe ich die Heat-Details (Piloten + vollständige Platzierungen)
**And** bei completed Heats kann ich den Edit-Button sehen

### AC 10: Pool-Status Indikator (NEU)

**Given** ich betrachte einen Pool (WB oder LB)
**When** der Pool Piloten enthält
**Then** sehe ich einen Indikator:
  - "3/4 Piloten" - Wenn noch 1 Pilot fehlt
  - "4/4 Piloten ✓" - Wenn Heat bereit ist
  - "1 Pilot wartet..." - Wenn WB noch aktiv und nur 1 Pilot im Pool

## Tasks / Subtasks

### Phase 1: Pool-Komponenten

- [x] Task 1: `PoolDisplay` Komponente erstellen (AC: 2, 3)
  - [x] Props: `pilotIds: string[]`, `poolName: string`, `maxPilots: number`
  - [x] Zeigt Piloten mit Mini-Fotos (32px)
  - [x] Zeigt Status-Indikator (z.B. "3/4 Piloten")
  - [x] FIFO-Reihenfolge: Älteste Piloten zuerst

- [x] Task 2: `PoolStatusIndicator` erstellen (AC: 2, 3, 10)
  - [x] Zeigt "Warte auf Piloten..." wenn poolSize < maxPilots
  - [x] Zeigt "Heat bereit!" wenn poolSize >= maxPilots
  - [x] Visueller Indikator (Grün für bereit, Grau für warten)

### Phase 2: BracketTree Redesign

- [x] Task 3: Drei-Sektionen-Layout implementieren (AC: 1)
  - [x] Qualifikations-Sektion (horizontal, oben)
  - [x] Winner-Bracket-Sektion mit Pool (mitte)
  - [x] Loser-Bracket-Sektion mit Pool (unten)
  - [x] Grand-Finale-Sektion (zentral/prominent)

- [x] Task 4: Pool-Visualisierung in WB integrieren (AC: 2)
  - [x] WB Pool Display über den WB-Heats
  - [x] Zeigt Piloten aus `winnerPool` State
  - [x] Update wenn `winnerPool` ändert

- [x] Task 5: Pool-Visualisierung in LB integrieren (AC: 3)
  - [x] LB Pool Display über den LB-Heats
  - [x] Zeigt Piloten aus `loserPool` State
  - [x] FIFO-Pfeil: "Nächste 4 Piloten gehen in Heat"
  - [x] Update wenn `loserPool` ändert

- [x] Task 6: Heat-Animation beim Erstellen (AC: 4)
  - [x] Kurzzeitige Glow-Animation (300ms) wenn neuer Heat hinzugefügt wird
  - [x] Pool-Anzeige wird gleichzeitig aktualisiert

### Phase 3: Dynamisches Bracket

- [x] Task 7: Vorberechnete Struktur entfernen (AC: 5)
  - [x] Keine leeren Platzhalter mehr anzeigen
  - [x] Bracket wächst dynamisch mit echten Daten

- [x] Task 8: Heats dynamisch rendern (AC: 5)
  - [x] Heats werden gerendert basierend auf `heats` Array
  - [x] Sortierung nach `heatNumber`
  - [x] Gruppierung nach `bracketType`

### Phase 4: Grand Finale

- [x] Task 9: Grand Finale Pool Display (Grand Finale)
  - [x] Zeigt WB-Finale-Gewinner + LB-Finale-Gewinner
  - [x] Visuelle Hervorhebung (Gold-Styling)
  - [x] Status: "Grand Finale bereit!" wenn 2+ Piloten

- [x] Task 10: Grand Finale Heat Box (Grand Finale)
  - [x] Spezielle HeatBox für Grand Finale
  - [x] Gold-Gradient Border
  - [x] Verstärkter Glow-Effekt

### Phase 5: Tests

- [x] Task 11: Pool-Visualisierung Tests
  - [x] Test: WB Pool zeigt Piloten korrekt an
  - [x] Test: LB Pool zeigt Piloten in FIFO-Reihenfolge
  - [x] Test: Pool-Status-Indikator zeigt korrekten Status

- [x] Task 12: Dynamisches Bracket Tests
  - [x] Test: Neue Heats werden zum Bracket hinzugefügt
  - [x] Test: Pool wird aktualisiert wenn Piloten entfernt werden
  - [x] Test: Grand Finale Pool zeigt korrekte Piloten

## Dev Notes

### Bracket-Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    QUALIFIKATION                             │
│                                                              │
│   [Heat 1]     [Heat 2]     [Heat 3]     [Heat 4]           │
│   Status: ✓     Status: ✓    Status: ✓    Status: ✓         │
│                                                              │
│   → Platz 1+2 → WB Pool                                      │
│   → Platz 3+4 → LB Pool                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     WINNER BRACKET                          │
│                                                              │
│   WB POOL                                                     │
│   ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                   │
│   │Jakob  │ │Niklas │ │Jürgen │ │Berni  │                   │
│   └───────┘ └───────┘ └───────┘ └───────┘                   │
│            ↑                                                  │
│   Status: WB Heat bereit! (4/4)                              │
│                                                              │
│   WB HEAT 5                                                  │
│   ┌─────┐                                                    │
│   │Jakob│ ← Nächste 4 aus Pool (FIFO)                       │
│   │Niklas│                                                   │
│   │Jürgen│                                                   │
│   │Berni │                                                   │
│   └─────┘                                                    │
│   Status: Wartet                                             │
│                                                              │
│                              ↓                               │
│                     ┌───────────────┐                        │
│                     │ WB FINALE     │                        │
│                     │ Winner vs ... │                        │
│                     └───────────────┘                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     LOSER BRACKET                            │
│                                                              │
│   LB POOL                                                     │
│   ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                   │
│   │Max    │ │Markus │ │Simon  │ │Andi   │                   │
│   └───────┘ └───────┘ └───────┘ └───────┘                   │
│            ↑                                                  │
│   First In, First Out!                                       │
│   Status: LB Heat bereit! (4/4)                              │
│                                                              │
│   LB HEAT 6                                                  │
│   ┌─────┐                                                    │
│   │Max   │ ← Nächste 4 aus Pool (FIFO)                       │
│   │Markus│                                                   │
│   │Simon │                                                   │
│   │Andi  │                                                   │
│   └─────┘                                                    │
│   Status: Wartet                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    GRAND FINALE                             │
│                                                              │
│   GF POOL: [Jakob, Niklas, Max, Jürgen]                      │
│            (WB Finale Winner + LB Finale Winner)            │
│                                                              │
│   GRAND FINALE                                               │
│   ┌─────┐                                                    │
│   │Jakob│                                                    │
│   │Niklas│                                                   │
│   │Max  │                                                    │
│   │Jürgen│                                                   │
│   └─────┘                                                    │
│   Status: Wartet                                             │
└─────────────────────────────────────────────────────────────┘
```

### PoolDisplay Komponente

```tsx
interface PoolDisplayProps {
  pilotIds: string[]
  poolName: string  // "WB Pool" oder "LB Pool"
  maxPilots: number  // 4 für WB/LB
  pilots: Pilot[]  // Alle Piloten für Foto/Namen
}

const PoolDisplay: React.FC<PoolDisplayProps> = ({ pilotIds, poolName, maxPilots, pilots }) => {
  const poolPilots = pilotIds.map(id => pilots.find(p => p.id === id)).filter(Boolean)

  const status = pilotIds.length >= maxPilots
    ? `${poolName} bereit!`
    : `Warte auf Piloten... (${pilotIds.length}/${maxPilots})`

  return (
    <div className="pool-display">
      <h3>{poolName}</h3>
      <div className="pool-pilots">
        {poolPilots.map(pilot => (
          <div key={pilot.id} className="pool-pilot">
            <img src={pilot.image || FALLBACK_PILOT_IMAGE} alt={pilot.name} />
            <span>{pilot.name}</span>
          </div>
        ))}
      </div>
      <div className={`pool-status ${pilotIds.length >= maxPilots ? 'ready' : 'waiting'}`}>
        {status}
      </div>
    </div>
  )
}
```

### Dynamisches Bracket Rendering

```tsx
// BracketTree Komponente
const BracketTree: React.FC = () => {
  const { heats, winnerPool, loserPool, grandFinalePool, pilots } = useTournamentStore()

  const qualificationHeats = heats.filter(h => h.bracketType === 'qualification')
  const winnerHeats = heats.filter(h => h.bracketType === 'winner')
  const loserHeats = heats.filter(h => h.bracketType === 'loser')
  const grandFinale = heats.find(h => h.bracketType === 'grand')

  return (
    <div className="bracket-tree">
      {/* Qualifikation */}
      <section className="qualification-section">
        <h2>QUALIFIKATION</h2>
        {qualificationHeats.map(heat => (
          <HeatBox key={heat.id} heat={heat} pilots={pilots} />
        ))}
      </section>

      {/* Winner Bracket mit Pool */}
      <section className="winner-section">
        <h2>WINNER BRACKET</h2>
        {winnerPool.length > 0 && (
          <PoolDisplay
            pilotIds={winnerPool}
            poolName="WB Pool"
            maxPilots={4}
            pilots={pilots}
          />
        )}
        <div className="winner-heats">
          {winnerHeats.map(heat => (
            <HeatBox key={heat.id} heat={heat} pilots={pilots} />
          ))}
        </div>
      </section>

      {/* Loser Bracket mit Pool */}
      <section className="loser-section">
        <h2>LOSER BRACKET</h2>
        {loserPool.length > 0 && (
          <PoolDisplay
            pilotIds={loserPool}
            poolName="LB Pool"
            maxPilots={4}
            pilots={pilots}
          />
        )}
        <div className="loser-heats">
          {loserHeats.map(heat => (
            <HeatBox key={heat.id} heat={heat} pilots={pilots} />
          ))}
        </div>
      </section>

      {/* Grand Finale */}
      {grandFinale && (
        <section className="grand-finale-section">
          <h2>GRAND FINALE</h2>
          <HeatBox key={grandFinale.id} heat={grandFinale} pilots={pilots} />
        </section>
      )}
    </div>
  )
}
```

## Definition of Done

### Funktional
- [x] Pool-Visualisierung in WB und LB
- [x] FIFO-Reihenfolge in Pool-Anzeige
- [x] Pool-Status-Indikator (bereit / warten)
- [x] Dynamisches Bracket ohne vorberechnete Strukturen
- [x] Heats werden dynamisch zum Bracket hinzugefügt
- [x] Grand Finale Pool Display

### UI/Design
- [x] Drei-Sektionen-Layout (Quali / WB / LB / GF)
- [x] Pool-Piloten mit Mini-Fotos (32px)
- [x] Visuelle Farbcodierung (Cyan, Grün, Pink, Gold)
- [x] Status-Indikator für Pools
- [x] Animation beim Heat-Erstellen (300ms)

### Tests
- [x] Unit-Test: PoolDisplay zeigt Piloten korrekt
- [x] Unit-Test: FIFO-Reihenfolge wird beachtet
- [x] Unit-Test: Pool-Status-Indikator zeigt korrekten Status
- [x] Integration-Test: Dynamisches Bracket mit Pools

### Qualität
- [x] Keine TypeScript-Fehler
- [x] Keine Console-Errors
- [x] Beamer-tauglich (1920x1080)
- [x] Alle Tests grün

## References

- [Course Correction: Dynamic Brackets 2025-12-23](../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)
- [PRD: Bracket-Visualisierung](../../prd.md#Bracket-Visualisierung)
- [Architecture: TournamentStore](../../architecture.md#TournamentStore)
