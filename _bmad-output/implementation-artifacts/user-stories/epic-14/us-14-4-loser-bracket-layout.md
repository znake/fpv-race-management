# US-14.4: Loser Bracket Layout

| Feld | Wert |
|------|------|
| **Story ID** | US-14.4 |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | HIGH |
| **Geschätzter Aufwand** | 5 Story Points (1-1.5 Tage) |
| **Abhängigkeiten** | US-14.1 (CSS-Variablen), US-14.10 (Layout-Calculator), Epic 13 (Pool-basiertes LB) |

---

## User Story

**Als** Zuschauer  
**möchte ich** das Loser Bracket als Pool-basierte Spalte sehen  
**sodass** ich verstehe dass LB-Piloten neu gemischt werden

---

## Akzeptanzkriterien

### AC1: Bracket-Column Container
- [ ] Rechts neben WB positioniert (Gap: 40px)
- [ ] Feste Breite berechnet aus: (max Heats in einer Runde) × Heat-Width + (Heats-1) × Gap
- [ ] Für 32 Piloten LB R1: 6 Heats × 140px + 5 × 10px = 890px
- [ ] Flex-Direction: column
- [ ] Align-Items: center

### AC2: Column-Header
- [ ] Text "LOSER BRACKET"
- [ ] Font: Bebas Neue, 14px
- [ ] Letter-Spacing: 3px
- [ ] Roter Border: 2px solid `--loser-red`
- [ ] Box-Shadow: `--glow-red`
- [ ] Hintergrund: rgba(255, 7, 58, 0.08)
- [ ] Border-Radius: 6px
- [ ] Padding: 8px 20px
- [ ] Margin-Bottom: 20px

### AC3: Round-Sections mit Pool-Komposition
- [ ] Round-Label inkl. Pool-Zusammensetzung:
  - "RUNDE 1 (24 Piloten: 16 Quali + 8 WB R1)"
  - "RUNDE 2 (16 Piloten: 12 LB R1 + 4 WB R2)"
- [ ] Font: Bebas Neue, 10px
- [ ] Letter-Spacing: 2px
- [ ] Farbe: `--steel`

### AC4: Pool-Indicator zwischen Runden
- [ ] Zeigt Piloten-Fluss: "↓ 12 Piloten weiter + 4 WB R2 Verlierer = 16 Piloten → Neu gemischt"
- [ ] Font-Size: 9px
- [ ] Farbe: `--steel`
- [ ] Pfeil-Farbe: `--loser-red`
- [ ] Text-Align: center
- [ ] Padding: 8px 0
- [ ] Margin: 5px 0

### AC5: Keine SVG-Linien im LB
- [ ] Im Gegensatz zu WB keine Verbindungslinien
- [ ] Pool-basiertes System → Piloten werden neu gemischt
- [ ] Pool-Indicator visualisiert den Fluss stattdessen

### AC6: Support für 3er-Heats
- [ ] Schmalere Box mit `--heat-width-3` (120px)
- [ ] CSS-Klasse `.three-pilot`
- [ ] Automatische Erkennung basierend auf Pilot-Anzahl

### AC7: LB-spezifisches Heat-Styling
- [ ] Roter Border: 2px solid `--loser-red`
- [ ] Box-Shadow: `--glow-red`
- [ ] Status-Badge: Roter Hintergrund

---

## Technische Hinweise

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/components/bracket/sections/LoserBracketSection.tsx` | Komplett Rewrite |
| `src/components/bracket/PoolDisplay.tsx` | Pool-Indicator Style anpassen |
| `src/lib/bracket-layout-calculator.ts` | LB-Breiten-Berechnung nutzen |

### Komponenten-Struktur

```tsx
// LoserBracketSection.tsx
interface LoserBracketSectionProps {
  rounds: LBRound[] // Aus bracket-structure-generator
  heats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
  registerHeatRef: (heatId: string, el: HTMLDivElement | null) => void
  columnWidth: number // Aus Layout-Calculator
}

interface LBRound {
  id: string
  roundNumber: number
  pilotCount: number
  composition: string // z.B. "16 Quali + 8 WB R1"
  heats: BracketHeat[]
  advancingCount: number // Wie viele gehen weiter
  incomingFromWB: number // WB-Verlierer die dazukommen
}

export function LoserBracketSection({
  rounds,
  heats,
  pilots,
  onHeatClick,
  registerHeatRef,
  columnWidth
}: LoserBracketSectionProps) {
  return (
    <div className="bracket-column lb" style={{ width: `${columnWidth}px` }}>
      <div className="bracket-column-header">LOSER BRACKET</div>
      
      <div className="bracket-tree" id="lb-tree">
        {rounds.map((round, idx) => (
          <React.Fragment key={round.id}>
            <div className="round-section">
              <div className="round-label">
                RUNDE {round.roundNumber} ({round.pilotCount} Piloten: {round.composition})
              </div>
              <div className="round-heats">
                {round.heats.map((bracketHeat) => {
                  const heat = heats.find(h => h.id === bracketHeat.id)
                  const isThreePilot = heat?.pilotIds.length === 3
                  
                  if (!heat) return <EmptyBracketHeatBox key={bracketHeat.id} ... />
                  return (
                    <div key={heat.id} ref={(el) => registerHeatRef(heat.id, el)}>
                      <BracketHeatBox
                        heat={heat}
                        pilots={pilots}
                        bracketType="loser"
                        isThreePilot={isThreePilot}
                        onClick={() => onHeatClick(heat.id)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Pool-Indicator zwischen Runden */}
            {idx < rounds.length - 1 && (
              <div className="pool-indicator">
                <span className="arrow">↓</span> 
                {round.advancingCount} Piloten weiter + {rounds[idx+1].incomingFromWB} WB Verlierer = {rounds[idx+1].pilotCount} Piloten 
                <span className="arrow">→</span> Neu gemischt
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
```

### CSS-Styling

```css
.bracket-column.lb {
  /* Dynamische Breite via inline style */
}

.bracket-column.lb .bracket-column-header {
  color: var(--loser-red);
  border: 2px solid var(--loser-red);
  box-shadow: var(--glow-red);
  background: rgba(255, 7, 58, 0.08);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 14px;
  letter-spacing: 3px;
  text-align: center;
  padding: 8px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  width: 100%;
}

.pool-indicator {
  font-size: 9px;
  color: var(--steel);
  text-align: center;
  padding: 8px 0;
  margin: 5px 0;
}

.pool-indicator .arrow {
  color: var(--loser-red);
}

/* 3-Pilot Heat Box */
.heat-box.three-pilot {
  width: var(--heat-width-3); /* 120px */
}

.heat-box.lb {
  border-color: var(--loser-red);
  box-shadow: var(--glow-red);
}

.heat-box.lb .heat-status {
  background: var(--loser-red);
}
```

### Pool-Kompositions-Berechnung

Die Pool-Zusammensetzung muss aus Epic 13 kommen:

```typescript
// Beispiel für 32 Piloten:
const lbRounds = [
  {
    roundNumber: 1,
    pilotCount: 24,
    composition: "16 Quali + 8 WB R1",
    advancingCount: 12,
    incomingFromWB: 0 // Erster LB-Round
  },
  {
    roundNumber: 2,
    pilotCount: 16,
    composition: "12 LB R1 + 4 WB R2",
    advancingCount: 8,
    incomingFromWB: 4
  },
  // ... weitere Runden
]
```

---

## Abhängigkeiten zu anderen Stories

| Story | Abhängigkeit |
|-------|-------------|
| US-14.1 | CSS-Variablen müssen definiert sein |
| US-14.5 | Heat-Box Design für korrekte Darstellung |
| US-14.10 | Layout-Calculator für dynamische Breiten |
| Epic 13 | Pool-Kompositions-Daten aus Store |

---

## Wichtiger Unterschied zu WB

Im Gegensatz zum Winner Bracket:
- **Keine SVG-Linien** - Pool-System bedeutet keine direkten Heat-zu-Heat-Verbindungen
- **Pool-Indicator** ersetzt visuelle Verbindungen
- **Composition-Label** zeigt woher Piloten kommen
- **3er-Heats** sind häufiger im LB (ungerade Pilotenzahlen)

---

## Definition of Done

- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] LoserBracketSection komplett überarbeitet
- [ ] Pool-Indicator zwischen Runden implementiert
- [ ] Rotes Header-Styling nach Mockup
- [ ] Round-Labels zeigen Pool-Komposition
- [ ] 3er-Heat Support funktioniert
- [ ] Keine SVG-Linien im LB
- [ ] Dynamische Breiten-Berechnung funktioniert
- [ ] Tests mit verschiedenen Pilotenzahlen
- [ ] Visueller Vergleich mit Mockup erfolgreich
- [ ] Code Review durchgeführt
