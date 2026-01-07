# US-14.3: Winner Bracket Layout

| Feld | Wert |
|------|------|
| **Story ID** | US-14.3 |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | HIGH |
| **Geschätzter Aufwand** | 5 Story Points (1-1.5 Tage) |
| **Abhängigkeiten** | US-14.1 (CSS-Variablen), US-14.10 (Layout-Calculator) |

---

## User Story

**Als** Zuschauer  
**möchte ich** das Winner Bracket als vertikale Spalte mit Runden sehen  
**sodass** ich den WB-Fortschritt verfolgen kann

---

## Akzeptanzkriterien

### AC1: Bracket-Column Container
- [ ] Feste Breite berechnet aus: (Heats in R1) × Heat-Width + (Heats-1) × Gap
- [ ] Für 32 Piloten: 4 Heats × 140px + 3 × 10px = 590px
- [ ] Flex-Direction: column
- [ ] Align-Items: center

### AC2: Column-Header
- [ ] Text "WINNER BRACKET"
- [ ] Font: Bebas Neue, 14px
- [ ] Letter-Spacing: 3px
- [ ] Grüner Border: 2px solid `--winner-green`
- [ ] Box-Shadow: `--glow-green`
- [ ] Hintergrund: rgba(57, 255, 20, 0.08)
- [ ] Border-Radius: 6px
- [ ] Padding: 8px 20px
- [ ] Margin-Bottom: 20px

### AC3: Round-Sections
- [ ] Jede Runde hat eigene Section
- [ ] Round-Label zeigt: "RUNDE N (X Piloten)" in `--steel`
- [ ] Font: Bebas Neue, 10px
- [ ] Letter-Spacing: 2px
- [ ] Margin-Bottom: 10px
- [ ] Text-Align: center

### AC4: Heats-Layout pro Runde
- [ ] Heats einer Runde horizontal nebeneinander
- [ ] Standard-Gap: 10px
- [ ] Flex-Wrap: nowrap
- [ ] Justify-Content: center

### AC5: Runde 2+ Positionierung
- [ ] R2-Heats zentriert unter Eltern-Paaren
- [ ] Größerer Gap für R2: 160px (2×140px Heat-Width + 1×Gap - 2×Heat-Width)
- [ ] Berechnung: Gap = 2 × Heat-Width + Standard-Gap = 290px - aktuelle Heat-Width

### AC6: Connector-Space
- [ ] 40px Höhe zwischen Runden für SVG-Linien
- [ ] Position: relative für Linien-Referenz

### AC7: WB-spezifisches Heat-Styling
- [ ] Grüner Border: 2px solid `--winner-green`
- [ ] Box-Shadow: `--glow-green`
- [ ] Status-Badge: Grüner Hintergrund

---

## Technische Hinweise

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/components/bracket/sections/WinnerBracketSection.tsx` | Komplett Rewrite |
| `src/components/bracket/layout/BracketRoundColumn.tsx` | Anpassen für neues Layout |
| `src/lib/bracket-layout-calculator.ts` | Breiten-Berechnung nutzen |

### Komponenten-Struktur

```tsx
// WinnerBracketSection.tsx
interface WinnerBracketSectionProps {
  rounds: Round[] // Aus bracket-structure-generator
  heats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
  registerHeatRef: (heatId: string, el: HTMLDivElement | null) => void
  columnWidth: number // Aus Layout-Calculator
}

export function WinnerBracketSection({
  rounds,
  heats,
  pilots,
  onHeatClick,
  registerHeatRef,
  columnWidth
}: WinnerBracketSectionProps) {
  return (
    <div className="bracket-column wb" style={{ width: `${columnWidth}px` }}>
      <div className="bracket-column-header">WINNER BRACKET</div>
      
      <div className="bracket-tree" id="wb-tree">
        {rounds.map((round, idx) => (
          <React.Fragment key={round.id}>
            <div className="round-section">
              <div className="round-label">
                RUNDE {round.roundNumber} ({round.pilotCount} Piloten)
              </div>
              <div className={`round-heats ${idx > 0 ? 'wb-r' + (idx + 1) : ''}`}>
                {round.heats.map((bracketHeat) => {
                  const heat = heats.find(h => h.id === bracketHeat.id)
                  if (!heat) return <EmptyBracketHeatBox key={bracketHeat.id} ... />
                  return (
                    <div key={heat.id} ref={(el) => registerHeatRef(heat.id, el)}>
                      <BracketHeatBox
                        heat={heat}
                        pilots={pilots}
                        bracketType="winner"
                        onClick={() => onHeatClick(heat.id)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            
            {idx < rounds.length - 1 && (
              <div className="connector-space" id={`wb-conn-r${idx+1}-r${idx+2}`} />
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
.bracket-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bracket-column.wb {
  /* Dynamische Breite via inline style */
}

.bracket-column.wb .bracket-column-header {
  color: var(--winner-green);
  border: 2px solid var(--winner-green);
  box-shadow: var(--glow-green);
  background: rgba(57, 255, 20, 0.08);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 14px;
  letter-spacing: 3px;
  text-align: center;
  padding: 8px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  width: 100%;
}

.round-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.round-label {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--steel);
  margin-bottom: 10px;
  text-align: center;
}

.round-heats {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: nowrap;
  width: 100%;
}

/* WB Runde 2+: Heats zentriert unter ihren Eltern-Paaren */
.round-heats.wb-r2 {
  gap: 160px;
}

.connector-space {
  height: 40px;
  position: relative;
}
```

### Breiten-Berechnung (Dependency auf US-14.10)

```typescript
// Aus bracket-layout-calculator.ts
function calculateWBColumnWidth(heatsInR1: number): number {
  const HEAT_WIDTH = 140
  const GAP = 10
  return heatsInR1 * HEAT_WIDTH + (heatsInR1 - 1) * GAP
}

// Beispiel: 32 Piloten → 16 WB R1 → 4 Heats
// Breite = 4 * 140 + 3 * 10 = 590px
```

---

## Abhängigkeiten zu anderen Stories

| Story | Abhängigkeit |
|-------|-------------|
| US-14.1 | CSS-Variablen müssen definiert sein |
| US-14.5 | Heat-Box Design für korrekte Darstellung |
| US-14.6 | SVG-Linien werden in connector-space gezeichnet |
| US-14.10 | Layout-Calculator für dynamische Breiten |

---

## Migration von bestehendem Code

Die aktuelle `WinnerBracketSection.tsx` verwendet ein anderes Layout:

```tsx
// Aktuell
<section className="winner-bracket-section bg-void/50 border-2 border-winner-green/30 rounded-2xl p-6 mb-6">
  <h2 className="font-display text-beamer-heat text-winner-green mb-4">
    WINNER BRACKET
  </h2>
  <div className="flex gap-8 overflow-x-auto pb-4 min-w-fit">
    ...
  </div>
</section>

// Neu: Vertikales Layout mit Runden-Sections
```

---

## Definition of Done

- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] WinnerBracketSection komplett überarbeitet
- [ ] Vertikales Runden-Layout implementiert
- [ ] Grünes Header-Styling nach Mockup
- [ ] Round-Labels zeigen korrekte Piloten-Zahlen
- [ ] Connector-Spaces für SVG-Linien vorhanden
- [ ] Dynamische Breiten-Berechnung funktioniert
- [ ] Tests mit 8, 16, 32 Piloten erfolgreich
- [ ] Visueller Vergleich mit Mockup erfolgreich
- [ ] Code Review durchgeführt
