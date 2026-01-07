# US-14.2: Qualifikations-Section

| Feld | Wert |
|------|------|
| **Story ID** | US-14.2 |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | HIGH |
| **Geschätzter Aufwand** | 3 Story Points (0.5-1 Tag) |
| **Abhängigkeiten** | US-14.1 (CSS-Variablen) |

---

## User Story

**Als** Turnierleiter  
**möchte ich** die Qualifikations-Heats horizontal in einer Section sehen  
**sodass** ich den Turniereinstieg übersichtlich verfolgen kann

---

## Akzeptanzkriterien

### AC1: Section-Container
- [ ] Eigene Section mit Cyan-Border unten (2px solid `--quali-blue`)
- [ ] Margin-Bottom: 35px
- [ ] Padding-Bottom: 30px
- [ ] z-index: 2 (über SVG-Layer)

### AC2: Section-Header
- [ ] Text "QUALIFIKATION" in Cyan (`--quali-blue`)
- [ ] Font: Bebas Neue, 16px
- [ ] Letter-Spacing: 3px
- [ ] Text-Shadow: `0 0 10px currentColor`
- [ ] Text-Align: center
- [ ] Margin-Bottom: 15px

### AC3: Heats-Layout
- [ ] Heats horizontal in einer Reihe (flex, no-wrap)
- [ ] Gap: 12px zwischen Heats
- [ ] Justify-Content: center
- [ ] Keine Umbrüche (horizontales Scrolling bei vielen Heats)

### AC4: Flow-Indicator
- [ ] Unterhalb der Heats-Reihe
- [ ] Zwei Indikatoren mit 60px Gap:
  - "↓ Platz 1+2 (N) → Winner Bracket" (grüner Pfeil)
  - "↓ Platz 3+4 (N) → Loser Bracket" (roter Pfeil)
- [ ] Font-Size: 11px
- [ ] Farbe: `--steel`
- [ ] Margin-Top: 18px

### AC5: Heat-Boxes Qualifikations-Styling
- [ ] Cyan Border: 2px solid `--quali-blue`
- [ ] Box-Shadow: `--glow-blue`
- [ ] Status-Badge: Cyan-Hintergrund
- [ ] Standardbreite: 140px (`--heat-width`)

---

## Technische Hinweise

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/components/bracket/sections/QualiSection.tsx` | NEU erstellen |
| `src/components/bracket/heat-boxes/BracketHeatBox.tsx` | Quali-Styling hinzufügen |
| `src/components/bracket/BracketTree.tsx` | QualiSection einbinden |

### Komponenten-Struktur

```tsx
// QualiSection.tsx
interface QualiSectionProps {
  qualiHeats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
  registerHeatRef: (heatId: string, el: HTMLDivElement | null) => void
}

export function QualiSection({
  qualiHeats,
  pilots,
  onHeatClick,
  registerHeatRef
}: QualiSectionProps) {
  if (qualiHeats.length === 0) return null
  
  const totalPilots = qualiHeats.length * 4 // Approximation
  const winnersCount = Math.floor(totalPilots / 2)
  const losersCount = totalPilots - winnersCount
  
  return (
    <div className="quali-section">
      <div className="section-header quali">QUALIFIKATION</div>
      <div className="heats-row">
        {qualiHeats.map((heat) => (
          <div key={heat.id} ref={(el) => registerHeatRef(heat.id, el)}>
            <BracketHeatBox
              heat={heat}
              pilots={pilots}
              bracketType="qualification"
              onClick={() => onHeatClick(heat.id)}
            />
          </div>
        ))}
      </div>
      <div className="flow-indicator">
        <span>
          <span className="arrow wb-arrow">↓</span> Platz 1+2 ({winnersCount}) → Winner Bracket
        </span>
        <span>
          <span className="arrow lb-arrow">↓</span> Platz 3+4 ({losersCount}) → Loser Bracket
        </span>
      </div>
    </div>
  )
}
```

### CSS-Styling

```css
.quali-section {
  margin-bottom: 35px;
  padding-bottom: 30px;
  border-bottom: 2px solid var(--quali-blue);
  position: relative;
  z-index: 2;
}

.section-header {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 16px;
  letter-spacing: 3px;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 0 0 10px currentColor;
}

.section-header.quali {
  color: var(--quali-blue);
}

.heats-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: nowrap;
}

.flow-indicator {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin: 18px 0 0 0;
  font-size: 11px;
  color: var(--steel);
}

.flow-indicator .arrow { font-size: 14px; }
.flow-indicator .wb-arrow { color: var(--winner-green); }
.flow-indicator .lb-arrow { color: var(--loser-red); }
```

---

## Migration von bestehendem Code

Die aktuelle `renderQualificationSection()` in `BracketTree.tsx` muss in eine eigene Komponente ausgelagert werden:

```tsx
// Aktuell in BracketTree.tsx
const renderQualificationSection = () => {
  if (qualiHeats.length === 0) return null
  
  return (
    <div className="qualification-section mb-8">
      <div className="font-display text-lg text-neon-cyan tracking-widest mb-4">
        QUALIFIKATION
      </div>
      ...
    </div>
  )
}

// → Wird ersetzt durch <QualiSection ... />
```

---

## Definition of Done

- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] QualiSection als eigene Komponente erstellt
- [ ] Cyan-Styling nach Mockup implementiert
- [ ] Flow-Indicator zeigt korrekte Pilot-Zahlen
- [ ] Heat-Boxes mit Quali-spezifischem Styling
- [ ] Horizontales Layout funktioniert mit 1-12 Heats
- [ ] Visueller Vergleich mit Mockup erfolgreich
- [ ] Unit Tests für Flow-Indicator Berechnung
- [ ] Code Review durchgeführt
