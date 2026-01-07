# Story 11.6: Grand Finale Herkunfts-Tags

**Status:** ready
**Created:** 2025-12-28
**Story Points:** 3 (S-Shirt - Logik + UI-Integration)
**Mockup:** [bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)

## Story

Als **Zuschauer auf dem Beamer**,
möchte ich **sehen ob ein Finalist über das Winner oder Loser Bracket gekommen ist**,
damit **ich verstehe welchen Weg jeder Pilot durch das Turnier genommen hat**.

## Hintergrund

Im Grand Finale haben Piloten kleine Tags die zeigen woher sie kommen:
- **"WB" (grün):** Kam über das Winner Bracket
- **"LB" (rot):** Kam über das Loser Bracket

Das erzählt die Geschichte: Wer hat ohne Niederlage das Finale erreicht? Wer hat sich zurückgekämpft?

## Acceptance Criteria

### AC1: WB-Finalisten haben grünes Tag

**Given** ein Pilot ist im Grand Finale
**And** der Pilot kam über das Winner Bracket (keine Niederlage)
**When** ich den Piloten im Grand Finale betrachte
**Then** hat der Pilot ein "WB" Tag
**And** das Tag ist grün (winner-green)

### AC2: LB-Finalisten haben rotes Tag

**Given** ein Pilot ist im Grand Finale
**And** der Pilot kam über das Loser Bracket (1x verloren, zurückgekämpft)
**When** ich den Piloten im Grand Finale betrachte
**Then** hat der Pilot ein "LB" Tag
**And** das Tag ist rot (loser-red)

### AC3: Tags sind nur im Grand Finale

**Given** ich betrachte reguläre Heats (nicht Grand Finale)
**When** ich die Piloten betrachte
**Then** haben sie keine WB/LB Tags

### AC4: Herkunft wird aus Pilot-Historie ermittelt

**Given** ein Pilot erreicht das Grand Finale
**When** seine Herkunft bestimmt wird
**Then** wird geprüft ob er jemals im Loser Bracket war
**And** wenn ja → LB, wenn nein → WB

## Technische Anforderungen

### Tag Struktur (aus Mockup)

```tsx
<div className="pilot-row">
  <div className="pilot-avatar">MB</div>
  <span className="pilot-name">Michael Bauer</span>
  <span className="pilot-tag wb">WB</span>  {/* oder lb */}
</div>
```

### CSS (aus Mockup)

```css
.pilot-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
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

### Herkunfts-Logik

```tsx
function getPilotBracketOrigin(pilotId: string, heats: Heat[]): 'wb' | 'lb' {
  // Prüfe ob der Pilot jemals in einem LB-Heat war
  const wasInLoserBracket = heats.some(heat => 
    heat.bracketType === 'loser' && 
    heat.pilots.includes(pilotId)
  )
  return wasInLoserBracket ? 'lb' : 'wb'
}
```

## Tasks

- [ ] **Task 1:** CSS für `.pilot-tag.wb` und `.pilot-tag.lb`
- [ ] **Task 2:** Logik zur Ermittlung der Bracket-Herkunft
- [ ] **Task 3:** Tags nur im Grand Finale anzeigen
- [ ] **Task 4:** Integration in `GrandFinaleHeatBox` Komponente
- [ ] **Task 5:** Testen mit verschiedenen Turnierpfaden

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/bracket/sections/GrandFinaleHeatBox.tsx` | Tags hinzufügen |
| `src/lib/bracket-logic.ts` | Herkunfts-Logik |
| `src/globals.css` | CSS für Tags |

## Dev Notes

### Abhängigkeiten
- Keine direkte Abhängigkeit zu anderen Epic-11 Stories
- Kann parallel entwickelt werden

### Wichtige Hinweise
- Die Herkunft kann aus der Heat-Historie des Piloten ermittelt werden
- Alternative: Beim Erreichen des Grand Finale die Herkunft speichern
- Logik prüft alle Heats ob Pilot jemals in `bracketType: 'loser'` war

### Implementierungsoptionen
1. **Dynamisch berechnen:** Bei jedem Render die Heat-Historie durchsuchen
2. **State speichern:** Beim Grand Finale Eintritt die Herkunft im Pilot-Objekt speichern
   - Empfohlen: Option 1 (dynamisch) ist einfacher und konsistenter

### Testszenarien
1. Pilot gewinnt alle WB-Heats → "WB" Tag (grün)
2. Pilot verliert einmal, gewinnt LB → "LB" Tag (rot)
3. Reguläre Heats → Keine Tags anzeigen

## References

- [Mockup: bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)
- [Epic 11 Overview](./00-epic-overview.md)
