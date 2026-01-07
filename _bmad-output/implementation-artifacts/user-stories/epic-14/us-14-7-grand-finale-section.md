# US-14.7: Grand Finale Section

| Feld | Wert |
|------|------|
| **Story ID** | US-14.7 |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | HIGH |
| **Geschätzter Aufwand** | 5 Story Points (1-1.5 Tage) |
| **Abhängigkeiten** | US-14.1 (CSS-Variablen), US-14.5 (Heat-Box GF-Styling), Epic 13 (4-Piloten GF) |

---

## User Story

**Als** Zuschauer  
**möchte ich** das Grand Finale als visuellen Höhepunkt sehen  
**sodass** klar ist dass hier alles entschieden wird

---

## Akzeptanzkriterien

### AC1: Section-Positionierung
- [ ] Unterhalb von WB + LB Brackets
- [ ] Horizontal mittig zwischen WB-Finale und LB-Finale
- [ ] Dynamische Berechnung des Mittelpunkts via JavaScript
- [ ] Margin-Top: 40px
- [ ] Padding-Top: 20px

### AC2: GF-Sources Anzeige
- [ ] Zwei Labels über der GF-Box:
  - "WB TOP 2" in Grün (`--winner-green`)
  - "LB TOP 2" in Rot (`--loser-red`)
- [ ] Font: Bebas Neue, 9px
- [ ] Letter-Spacing: 1px
- [ ] Flex-Layout: center, gap 60px
- [ ] Margin-Bottom: 15px

### AC3: GF-Label
- [ ] Text "GRAND FINALE"
- [ ] Font: Bebas Neue, 18px
- [ ] Letter-Spacing: 4px
- [ ] Farbe: `--gold`
- [ ] Text-Shadow: `0 0 10px rgba(249, 200, 14, 0.5)`
- [ ] Margin-Bottom: 15px

### AC4: GF Heat-Box
- [ ] Breite: 180px
- [ ] Border: 3px solid `--gold`
- [ ] Box-Shadow: `--glow-gold` (stärker als normal)
- [ ] Padding: 10px 12px

### AC5: 4-Piloten Darstellung
- [ ] 4 Piloten aus Epic 13: 2 WB + 2 LB
- [ ] Pilot-Rows zeigen WB/LB Tags für Herkunft
- [ ] Tags: Grüner/Roter Badge mit "WB" / "LB"

### AC6: Champion-Row Styling
- [ ] Platz 1 Pilot bekommt spezielles Styling
- [ ] Hintergrund: goldener Tint (rgba(249, 200, 14, 0.2))
- [ ] Border-Left: 2px solid `--gold`
- [ ] CSS-Klasse: `.champ`

### AC7: Dynamische Positionierung
- [ ] JavaScript berechnet Mittelpunkt zwischen WB-Finale und LB-Finale
- [ ] `positionGrandFinale()` Funktion
- [ ] Wird bei Initial-Load und Resize aufgerufen
- [ ] Padding-Left wird dynamisch gesetzt

### AC8: WB/LB Pilot-Tags
- [ ] Kleine Badges neben Pilot-Name
- [ ] Font-Size: 6px
- [ ] Padding: 1px 3px
- [ ] Border-Radius: 2px
- [ ] WB-Tag: Grüner Hintergrund, `--void` Text
- [ ] LB-Tag: Roter Hintergrund, `--void` Text

---

## Technische Hinweise

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/components/bracket/sections/GrandFinaleSection.tsx` | Komplett Rewrite |
| `src/components/bracket/sections/GrandFinaleHeatBox.tsx` | Rewrite für 4 Piloten |
| `src/components/bracket/BracketTree.tsx` | GF-Positionierung integrieren |

### Komponenten-Struktur

```tsx
// GrandFinaleSection.tsx
interface GrandFinaleSectionProps {
  grandFinaleHeat: Heat | null
  pilots: Pilot[]
  heats: Heat[] // Für bracketOrigin Lookup
  wbFinaleRef: RefObject<HTMLDivElement>
  lbFinaleRef: RefObject<HTMLDivElement>
}

export function GrandFinaleSection({
  grandFinaleHeat,
  pilots,
  heats,
  wbFinaleRef,
  lbFinaleRef
}: GrandFinaleSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  
  // Dynamische Positionierung
  useEffect(() => {
    positionGrandFinale()
    window.addEventListener('resize', positionGrandFinale)
    return () => window.removeEventListener('resize', positionGrandFinale)
  }, [])
  
  function positionGrandFinale() {
    const wbFinale = wbFinaleRef.current
    const lbFinale = lbFinaleRef.current
    const gfSection = sectionRef.current
    
    if (!wbFinale || !lbFinale || !gfSection) return
    
    const wbRect = wbFinale.getBoundingClientRect()
    const lbRect = lbFinale.getBoundingClientRect()
    const containerRect = document.getElementById('bracket-container')?.getBoundingClientRect()
    
    if (!containerRect) return
    
    // Mittelpunkt zwischen WB-Finale und LB-Finale
    const wbCenter = wbRect.left + wbRect.width / 2 - containerRect.left
    const lbCenter = lbRect.left + lbRect.width / 2 - containerRect.left
    const midpoint = (wbCenter + lbCenter) / 2
    
    // GF-Box Breite (180px)
    const gfWidth = 180
    
    // Padding-Left setzen
    gfSection.style.paddingLeft = `${midpoint - gfWidth / 2}px`
  }
  
  if (!grandFinaleHeat) return null
  
  return (
    <div ref={sectionRef} className="grand-finale-section positioned">
      <div className="gf-content">
        <div className="gf-sources">
          <div className="gf-source wb">WB TOP 2</div>
          <div className="gf-source lb">LB TOP 2</div>
        </div>
        <div className="gf-label">GRAND FINALE</div>
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={heats}
        />
      </div>
    </div>
  )
}
```

### GrandFinaleHeatBox für 4 Piloten

```tsx
// GrandFinaleHeatBox.tsx
import { getPilotBracketOrigin } from '../../../lib/bracket-logic'

interface GrandFinaleHeatBoxProps {
  heat: Heat
  pilots: Pilot[]
  heats: Heat[]
}

export function GrandFinaleHeatBox({
  heat,
  pilots,
  heats
}: GrandFinaleHeatBoxProps) {
  // Piloten mit bracketOrigin
  const pilotsWithOrigin = heat.pilotIds.map(pilotId => {
    const pilot = pilots.find(p => p.id === pilotId)
    const origin = getPilotBracketOrigin(pilotId, heats)
    const rank = heat.results?.find(r => r.pilotId === pilotId)?.rank
    return { pilot, origin, rank }
  }).sort((a, b) => (a.rank || 5) - (b.rank || 5))
  
  return (
    <div className="heat-box gf" id="grand-finale">
      <div className="heat-header">
        GRAND FINALE
        <span className="heat-status">
          {heat.status === 'active' ? 'LIVE' : `${heat.pilotIds.length}x`}
        </span>
      </div>
      
      {pilotsWithOrigin.map(({ pilot, origin, rank }, idx) => {
        if (!pilot) return null
        
        const isChamp = rank === 1
        const rowClass = isChamp ? 'champ' : ''
        
        return (
          <div key={pilot.id} className={`pilot-row ${rowClass}`}>
            <img 
              className="pilot-avatar"
              src={pilot.avatarUrl}
              alt={pilot.name}
              style={{ borderColor: origin === 'wb' ? 'var(--winner-green)' : 'var(--loser-red)' }}
            />
            <span className="pilot-name">
              {isChamp ? <strong>{pilot.name}</strong> : pilot.name}
            </span>
            <span className={`pilot-tag ${origin}`}>
              {origin.toUpperCase()}
            </span>
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
.grand-finale-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
  padding-top: 20px;
  position: relative;
  z-index: 2;
}

.grand-finale-section.positioned {
  align-items: flex-start;
}

.gf-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gf-sources {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 60px;
  margin-bottom: 15px;
}

.gf-source {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 9px;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
}

.gf-source.wb { color: var(--winner-green); }
.gf-source.lb { color: var(--loser-red); }

.gf-label {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  letter-spacing: 4px;
  color: var(--gold);
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(249, 200, 14, 0.5);
}

/* Champion Row */
.pilot-row.champ {
  background: rgba(249, 200, 14, 0.2);
  border-left: 2px solid var(--gold);
}

/* Pilot Tags */
.pilot-tag {
  font-size: 6px;
  padding: 1px 3px;
  border-radius: 2px;
}

.pilot-tag.wb { 
  background: var(--winner-green); 
  color: var(--void); 
}

.pilot-tag.lb { 
  background: var(--loser-red); 
  color: var(--void); 
}
```

---

## Abhängigkeiten zu anderen Stories

| Story | Abhängigkeit |
|-------|-------------|
| US-14.1 | CSS-Variablen müssen definiert sein |
| US-14.5 | GF Heat-Box Basis-Styling |
| US-14.6 | SVG-Linien führen zum GF |
| Epic 13 | 4-Piloten GF + bracketOrigin Feld |

---

## Integration mit Epic 13

Die `getPilotBracketOrigin()` Funktion aus `bracket-logic.ts` liefert:
- `'wb'` für Piloten die über WB-Finale kommen
- `'lb'` für Piloten die über LB-Finale kommen

---

## Definition of Done

- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] GrandFinaleSection mit dynamischer Positionierung
- [ ] GrandFinaleHeatBox zeigt 4 Piloten mit Tags
- [ ] GF-Sources Labels (WB TOP 2 / LB TOP 2)
- [ ] GF-Label mit Gold-Styling und Glow
- [ ] Champion-Row mit speziellem Styling
- [ ] WB/LB Tags zeigen Pilot-Herkunft
- [ ] Dynamische Mittelpunkt-Berechnung
- [ ] Responsive bei Resize
- [ ] Visueller Vergleich mit Mockup
- [ ] Code Review durchgeführt
