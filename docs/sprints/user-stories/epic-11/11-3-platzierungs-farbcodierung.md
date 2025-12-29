# Story 11.3: Platzierungs-Farbcodierung in Heats

**Status:** ready
**Created:** 2025-12-28
**Story Points:** 3 (S-Shirt - CSS + Logik-Integration)
**Mockup:** [bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)

## Story

Als **Zuschauer auf dem Beamer**,
möchte ich **sofort sehen welche Piloten weiterkommen und welche ausscheiden**,
damit **ich den Turnierfortschritt ohne Erklärung verstehen kann**.

## Hintergrund

In abgeschlossenen Heats werden die Piloten-Zeilen farblich markiert:
- **Platz 1 + 2:** Grüner Hintergrund + grüner linker Border → Weiterkommer
- **Platz 3 + 4:** Roter Hintergrund + roter linker Border → Eliminiert/zum LB

## Acceptance Criteria

### AC1: Weiterkommer sind grün markiert

**Given** ein Heat ist abgeschlossen
**When** ich die Piloten im Heat betrachte
**Then** haben Platz 1 und 2 einen grünen Hintergrund (bg-winner)
**And** haben Platz 1 und 2 einen grünen linken Border (3px)

### AC2: Eliminierte sind rot markiert

**Given** ein Heat ist abgeschlossen
**When** ich die Piloten im Heat betrachte
**Then** haben Platz 3 und 4 einen roten Hintergrund (bg-loser)
**And** haben Platz 3 und 4 einen roten linken Border (3px)

### AC3: Noch nicht abgeschlossene Heats haben keine Markierung

**Given** ein Heat ist noch nicht abgeschlossen
**When** ich die Piloten im Heat betrachte
**Then** haben alle Piloten den neutralen Hintergrund (keine Farbcodierung)

### AC4: Im Grand Finale besondere Markierung für Champion

**Given** das Grand Finale ist abgeschlossen
**When** ich den Gewinner betrachte
**Then** hat der Champion einen goldenen Hintergrund
**And** hat der Champion einen goldenen linken Border

## Technische Anforderungen

### CSS-Klassen (aus Mockup)

```css
.pilot-row.top {
  background: rgba(57, 255, 20, 0.25);  /* bg-winner */
  border-left: 3px solid var(--winner-green);
}

.pilot-row.bottom {
  background: rgba(255, 7, 58, 0.25);  /* bg-loser */
  border-left: 3px solid var(--loser-red);
}

.pilot-row.champ {
  background: rgba(249, 200, 14, 0.2);
  border-left: 3px solid var(--gold);
}
```

### Logik für Klassenzuweisung

```tsx
function getPilotRowClass(rank: number, heatStatus: string, isGrandFinale: boolean) {
  if (heatStatus !== 'completed') return ''
  
  if (isGrandFinale && rank === 1) return 'champ'
  if (rank <= 2) return 'top'    // Weiterkommer
  return 'bottom'                // Eliminiert
}
```

## Tasks

- [ ] **Task 1:** CSS-Klassen für `pilot-row.top`, `.bottom`, `.champ` hinzufügen
- [ ] **Task 2:** Logik für Klassenzuweisung basierend auf Rang implementieren
- [ ] **Task 3:** Nur bei abgeschlossenen Heats anwenden
- [ ] **Task 4:** Champion-Hervorhebung im Grand Finale
- [ ] **Task 5:** Visuelle Tests mit Mockup vergleichen

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx` | Klassenzuweisung |
| `src/globals.css` | CSS-Klassen für Farbcodierung |

## Dev Notes

### Abhängigkeiten
- Keine direkte Abhängigkeit zu anderen Epic-11 Stories
- Kann parallel entwickelt werden

### Wichtige Hinweise
- Die Farbcodierung ist ein Enhancement zu FR20 (existierende Farbcodierung)
- Muss mit bestehendem Rank-Badge System harmonieren
- CSS-Variablen `--bg-winner` und `--bg-loser` sollten bereits in globals.css definiert sein
- Falls nicht vorhanden, müssen diese CSS-Variablen angelegt werden

### Testszenarien
1. Heat mit 4 Piloten abschließen → Platz 1+2 grün, Platz 3+4 rot
2. Nicht abgeschlossener Heat → Keine Farbcodierung
3. Grand Finale → Champion bekommt goldene Markierung

## References

- [Mockup: bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)
- [Epic 11 Overview](./00-epic-overview.md)
