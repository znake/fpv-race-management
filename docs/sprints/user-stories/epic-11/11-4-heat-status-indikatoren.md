# Story 11.4: Heat-Status Indikatoren

**Status:** ready
**Created:** 2025-12-28
**Story Points:** 2 (XS-Shirt - einfache UI-Erweiterung)
**Mockup:** [bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)

## Story

Als **Zuschauer auf dem Beamer**,
möchte ich **sofort sehen welche Heats bereits abgeschlossen sind**,
damit **ich dem Turnierfortschritt folgen kann**.

## Hintergrund

Im Header jeder Heat-Box wird der Status angezeigt:
- **Checkmark (✓):** Heat ist abgeschlossen
- **Kein Badge:** Heat ist noch nicht abgeschlossen (wartend)

**Hinweis:** Es gibt keinen "laufenden" Status im System - Heats sind entweder abgeschlossen oder nicht.

## Acceptance Criteria

### AC1: Abgeschlossene Heats zeigen Checkmark

**Given** ein Heat ist abgeschlossen (status: 'completed')
**When** ich den Heat-Header betrachte
**Then** wird ein Checkmark (✓) angezeigt
**And** das Checkmark ist in der Bracket-Farbe (grün für WB, rot für LB, gold für GF)

### AC2: Nicht abgeschlossene Heats haben keinen Indikator

**Given** ein Heat ist noch nicht abgeschlossen
**When** ich den Heat-Header betrachte
**Then** wird kein Status-Indikator angezeigt

### AC3: Checkmark-Farbe passt zum Bracket-Typ

**Given** ein WB-Heat ist abgeschlossen
**When** ich das Checkmark betrachte
**Then** ist es grün (winner-green)

**Given** ein LB-Heat ist abgeschlossen
**When** ich das Checkmark betrachte
**Then** ist es rot (loser-red)

**Given** das Grand Finale ist abgeschlossen
**When** ich das Checkmark betrachte
**Then** ist es gold

## Technische Anforderungen

### Heat Header Struktur

```tsx
<div className="heat-header">
  WB HEAT 5
  {heat.status === 'completed' && (
    <span className="heat-status">✓</span>
  )}
</div>
```

### CSS für Status Badge

```css
.heat-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--winner-green);
  color: var(--void);
}

.heat-box.lb .heat-status {
  background: var(--loser-red);
}

.heat-box.gf .heat-status {
  background: var(--gold);
}
```

### Status-Logik

```tsx
function getHeatStatusIndicator(heat: Heat) {
  if (heat.status === 'completed') return '✓'
  return null
}
```

## Tasks

- [ ] **Task 1:** Heat-Header Komponente um Status-Indikator erweitern
- [ ] **Task 2:** CSS für Status-Badge implementieren
- [ ] **Task 3:** Farbvarianten für WB/LB/GF
- [ ] **Task 4:** Testen mit abgeschlossenen und wartenden Heats

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx` | Status-Indikator im Header |
| `src/globals.css` | CSS für `.heat-status` |

## Dev Notes

### Abhängigkeiten
- Keine direkte Abhängigkeit zu anderen Epic-11 Stories
- Kann parallel entwickelt werden

### Wichtige Hinweise
- Einfache Logik: nur `completed` wird angezeigt
- Status-Badge sollte nicht zu groß sein, um Heat-Namen nicht zu verdecken
- Heat-Status wird aus `heat.status === 'completed'` abgeleitet
- Bracket-Typ für Farbvariante aus `heat.bracketType` ('winner' | 'loser' | 'grandFinale')

### Testszenarien
1. Abgeschlossener WB-Heat → Grünes ✓
2. Abgeschlossener LB-Heat → Rotes ✓
3. Abgeschlossenes Grand Finale → Goldenes ✓
4. Nicht abgeschlossener Heat → Kein Badge

## References

- [Mockup: bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)
- [Epic 11 Overview](./00-epic-overview.md)
