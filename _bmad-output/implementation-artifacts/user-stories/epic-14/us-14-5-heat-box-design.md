# US-14.5: Heat-Box Design 1:1 Mockup

| Feld | Wert |
|------|------|
| **Story ID** | US-14.5 |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | HIGH |
| **Geschätzter Aufwand** | 5 Story Points (1-1.5 Tage) |
| **Abhängigkeiten** | US-14.1 (CSS-Variablen) |

---

## User Story

**Als** Zuschauer  
**möchte ich** Heat-Boxes im exakten Mockup-Design  
**sodass** die visuelle Identität gewahrt bleibt

---

## Akzeptanzkriterien

### AC1: Standard Heat-Box Container
- [ ] Breite: 140px (`--heat-width`)
- [ ] Hintergrund: `--night-light` (#2a0845)
- [ ] Border-Radius: 8px
- [ ] Border: 2px solid (Farbe je nach Bracket-Typ)
- [ ] Padding: 6px 8px
- [ ] Box-Shadow: entsprechender Glow-Effekt

### AC2: 3er-Heat Box
- [ ] Breite: 120px (`--heat-width-3`)
- [ ] CSS-Klasse: `.three-pilot`
- [ ] Gleiche Styles sonst

### AC3: Grand Finale Box
- [ ] Breite: 180px
- [ ] Border: 3px solid `--gold`
- [ ] Padding: 10px 12px
- [ ] Box-Shadow: `--glow-gold`
- [ ] Größerer Glow-Effekt

### AC4: Heat-Header
- [ ] Font: Bebas Neue, 10px
- [ ] Farbe: `--chrome`
- [ ] Letter-Spacing: 1px
- [ ] Margin-Bottom: 5px
- [ ] Flex-Layout: space-between für Name + Status

### AC5: Status-Badge
- [ ] Font-Size: 7px
- [ ] Padding: 1px 4px
- [ ] Border-Radius: 3px
- [ ] Font-Weight: 600
- [ ] Hintergrundfarbe: je nach Bracket-Typ
  - WB: `--winner-green`
  - LB: `--loser-red`
  - Quali: `--quali-blue`
  - GF: `--gold`
- [ ] Text-Farbe: `--void`
- [ ] Text: Pilotenzahl (z.B. "4x" oder "3x")

### AC6: Pilot-Row Basis
- [ ] Flex-Layout: align-items center, gap 5px
- [ ] Padding: 2px 5px
- [ ] Border-Radius: 3px
- [ ] Margin: 1px 0

### AC7: Pilot-Row Farbcodierung (Platz 1+2)
- [ ] Hintergrund: `--bg-winner` (rgba(57, 255, 20, 0.25))
- [ ] Border-Left: 2px solid `--winner-green`
- [ ] CSS-Klasse: `.top`

### AC8: Pilot-Row Farbcodierung (Platz 3+4)
- [ ] Hintergrund: `--bg-loser` (rgba(255, 7, 58, 0.25))
- [ ] Border-Left: 2px solid `--loser-red`
- [ ] CSS-Klasse: `.bottom`

### AC9: Pilot-Avatar
- [ ] Größe: 18px × 18px
- [ ] Border-Radius: 50% (rund)
- [ ] Hintergrund: `--night` (falls kein Bild)
- [ ] Border: 1px solid `--steel`
- [ ] Flex-Shrink: 0
- [ ] Object-Fit: cover

### AC10: Pilot-Name
- [ ] Font-Size: 9px
- [ ] Farbe: `--chrome`
- [ ] Flex: 1 (nimmt verfügbaren Platz)
- [ ] White-Space: nowrap
- [ ] Overflow: hidden
- [ ] Text-Overflow: ellipsis

### AC11: Rank-Badge
- [ ] Größe: 14px × 14px
- [ ] Border-Radius: 50% (rund)
- [ ] Font: Bebas Neue, 9px
- [ ] Text-Farbe: `--void`
- [ ] Flex-Shrink: 0
- [ ] Flex-Layout: center
- [ ] Hintergrundfarben:
  - Platz 1: `--gold` (#f9c80e)
  - Platz 2: Silber (#c0c0c0)
  - Platz 3: Bronze (#cd7f32)
  - Platz 4: `--neon-cyan` (#05d9e8)

---

## Technische Hinweise

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/components/bracket/heat-boxes/BracketHeatBox.tsx` | Rewrite Styling |
| `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx` | Rewrite |
| `src/components/ui/rank-badge.tsx` | Farben anpassen |
| `src/globals.css` | Neue Klassen hinzufügen |

### Komponenten-Struktur

```tsx
// BracketHeatBox.tsx
interface BracketHeatBoxProps {
  heat: Heat
  pilots: Pilot[]
  bracketType: 'qualification' | 'winner' | 'loser' | 'finale'
  isThreePilot?: boolean
  onClick?: () => void
}

export function BracketHeatBox({
  heat,
  pilots,
  bracketType,
  isThreePilot = false,
  onClick
}: BracketHeatBoxProps) {
  const pilotCount = heat.pilotIds.length
  const isGrandFinale = bracketType === 'finale'
  
  const boxClasses = cn(
    'heat-box',
    bracketType === 'loser' && 'lb',
    bracketType === 'qualification' && 'quali',
    isGrandFinale && 'gf',
    isThreePilot && 'three-pilot'
  )
  
  // Sortierte Piloten nach Rang (für completed Heats)
  const sortedPilots = getSortedPilots(heat, pilots)
  
  return (
    <div className={boxClasses} onClick={onClick}>
      <div className="heat-header">
        {heat.roundName || `HEAT ${heat.heatNumber}`}
        <span className="heat-status">{pilotCount}x</span>
      </div>
      
      {sortedPilots.map((pilot, idx) => {
        const rank = heat.results?.find(r => r.pilotId === pilot.id)?.rank
        const isTop = rank && rank <= 2
        const isBottom = rank && rank > 2
        
        return (
          <div 
            key={pilot.id} 
            className={cn('pilot-row', isTop && 'top', isBottom && 'bottom')}
          >
            <img 
              className="pilot-avatar" 
              src={pilot.avatarUrl || defaultAvatar} 
              alt={pilot.name} 
            />
            <span className="pilot-name">{pilot.name}</span>
            {rank && <span className={`rank-badge r${rank}`}>{rank}</span>}
          </div>
        )
      })}
    </div>
  )
}
```

### CSS-Styling

```css
/* Heat-Box Basis */
.heat-box {
  background: var(--night-light);
  border: 2px solid var(--winner-green);
  border-radius: 8px;
  padding: 6px 8px;
  width: var(--heat-width);
  box-shadow: var(--glow-green);
  position: relative;
}

.heat-box.lb {
  border-color: var(--loser-red);
  box-shadow: var(--glow-red);
}

.heat-box.quali {
  border-color: var(--quali-blue);
  box-shadow: var(--glow-blue);
}

.heat-box.gf {
  border: 3px solid var(--gold);
  box-shadow: var(--glow-gold);
  width: 180px;
  padding: 10px 12px;
}

.heat-box.three-pilot {
  width: var(--heat-width-3);
}

/* Heat-Header */
.heat-header {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 10px;
  color: var(--chrome);
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  letter-spacing: 1px;
}

/* Status-Badge */
.heat-status {
  font-size: 7px;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--winner-green);
  color: var(--void);
  font-weight: 600;
}

.heat-box.lb .heat-status { background: var(--loser-red); }
.heat-box.quali .heat-status { background: var(--quali-blue); }
.heat-box.gf .heat-status { background: var(--gold); }

/* Pilot-Row */
.pilot-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 5px;
  border-radius: 3px;
  margin: 1px 0;
}

.pilot-row.top {
  background: var(--bg-winner);
  border-left: 2px solid var(--winner-green);
}

.pilot-row.bottom {
  background: var(--bg-loser);
  border-left: 2px solid var(--loser-red);
}

/* Pilot-Avatar */
.pilot-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--night);
  border: 1px solid var(--steel);
  flex-shrink: 0;
  object-fit: cover;
}

/* Pilot-Name */
.pilot-name {
  font-size: 9px;
  color: var(--chrome);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Rank-Badge */
.rank-badge {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 9px;
  color: var(--void);
  flex-shrink: 0;
}

.rank-badge.r1 { background: var(--gold); }
.rank-badge.r2 { background: #c0c0c0; }
.rank-badge.r3 { background: #cd7f32; }
.rank-badge.r4 { background: var(--neon-cyan); }
```

---

## Migration von bestehendem Code

Die aktuelle `BracketHeatBox.tsx` delegiert an `HeatCard`:

```tsx
// Aktuell
export function BracketHeatBox(...) {
  return (
    <HeatCard
      variant="bracket"
      ...
      className={`min-w-[180px] cursor-pointer hover:scale-105 transition-transform ${animationClass}`}
    />
  )
}

// Neu: Eigenes Styling direkt in der Komponente
```

Die `HeatCard` UI-Komponente kann für andere Zwecke beibehalten werden, aber `BracketHeatBox` wird unabhängig.

---

## Definition of Done

- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] BracketHeatBox mit eigenem Mockup-Styling
- [ ] Heat-Header mit Status-Badge implementiert
- [ ] Pilot-Rows mit Top/Bottom Farbcodierung
- [ ] Pilot-Avatar korrekt dimensioniert
- [ ] Rank-Badges mit korrekten Farben
- [ ] 3er-Heat Support funktioniert
- [ ] Grand Finale Box größer und golden
- [ ] Visueller Pixel-Vergleich mit Mockup
- [ ] Responsive in Container (kein Overflow)
- [ ] Code Review durchgeführt
