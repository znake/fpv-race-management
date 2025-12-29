# Story 11.7: Bracket-Legende

**Status:** review
**Created:** 2025-12-28
**Story Points:** 2 (XS-Shirt - neue statische Komponente)
**Mockup:** [bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)

## Story

Als **Zuschauer auf dem Beamer**,
möchte ich **eine Legende sehen die alle Farbcodierungen erklärt**,
damit **ich das Bracket ohne Erklärung vom Organisator verstehen kann**.

## Hintergrund

Am unteren Rand des Brackets wird eine Legende angezeigt, die erklärt:
- Grüne Linie = Winner Bracket
- Rote Linie = Loser Bracket
- Goldene Linie = → Grand Finale
- Grüner Hintergrund = Platz 1+2 (weiter)
- Roter Hintergrund = Platz 3+4 (raus)

## Acceptance Criteria

### AC1: Legende zeigt Linien-Bedeutung

**Given** das Bracket wird gerendert
**When** ich die Legende betrachte
**Then** sehe ich:
  - Grüne Linie mit Label "Winner Bracket"
  - Rote Linie mit Label "Loser Bracket"
  - Goldene Linie mit Label "→ Grand Finale"

### AC2: Legende zeigt Platzierungs-Bedeutung

**Given** das Bracket wird gerendert
**When** ich die Legende betrachte
**Then** sehe ich:
  - Grünes Farbfeld mit Label "Platz 1+2 (weiter)"
  - Rotes Farbfeld mit Label "Platz 3+4 (raus)"

### AC3: Legende ist am unteren Rand

**Given** das Bracket wird gerendert
**When** ich die Position der Legende betrachte
**Then** ist sie unterhalb des Bracket-Trees
**And** hat ausreichend Abstand (margin-top)

### AC4: Legende ist auf Beamer lesbar

**Given** das Bracket wird auf einem Beamer angezeigt
**When** ich die Legende aus 10m Entfernung betrachte
**Then** sind alle Texte lesbar
**And** die Farben sind klar erkennbar

## Technische Anforderungen

### Legende Struktur (aus Mockup)

```tsx
<div className="legend">
  <div className="legend-item">
    <div className="legend-line green"></div>
    Winner Bracket
  </div>
  <div className="legend-item">
    <div className="legend-line red"></div>
    Loser Bracket
  </div>
  <div className="legend-item">
    <div className="legend-line gold"></div>
    → Grand Finale
  </div>
  <div className="legend-item">
    <div className="legend-color winner"></div>
    Platz 1+2 (weiter)
  </div>
  <div className="legend-item">
    <div className="legend-color loser"></div>
    Platz 3+4 (raus)
  </div>
</div>
```

### CSS (aus Mockup)

```css
.legend {
  display: flex;
  gap: 30px;
  padding: 15px 20px;
  background: var(--night);
  border-radius: 10px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--steel);
}

.legend-line {
  width: 30px;
  height: 3px;
}

.legend-line.green { background: var(--winner-green); }
.legend-line.red { background: var(--loser-red); }
.legend-line.gold { background: var(--gold); }

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-color.winner { 
  background: var(--bg-winner); 
  border: 2px solid var(--winner-green); 
}

.legend-color.loser { 
  background: var(--bg-loser); 
  border: 2px solid var(--loser-red); 
}
```

## Tasks

- [x] **Task 1:** `BracketLegend` Komponente erstellen
- [x] **Task 2:** CSS für Legende implementieren
- [x] **Task 3:** Positionierung unterhalb des Brackets
- [x] **Task 4:** Beamer-Lesbarkeit testen (Schriftgröße)
- [x] **Task 5:** Responsive Wrapping bei schmalen Bildschirmen

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/bracket/BracketLegend.tsx` | NEU |
| `src/components/bracket/BracketTree.tsx` | Legende einbinden |
| `src/globals.css` | CSS für Legende |

## Dev Notes

### Abhängigkeiten
- Keine direkte Abhängigkeit zu anderen Stories
- Kann als letztes entwickelt werden (Polish)

### Wichtige Hinweise
- Legende könnte optional ausblendbar sein für mehr Platz
- Schriftgröße muss für Beamer-Projektion getestet werden
- Statische Komponente ohne State-Abhängigkeiten
- CSS-Variablen wiederverwenden: `--winner-green`, `--loser-red`, `--gold`, `--bg-winner`, `--bg-loser`

### Testszenarien
1. Legende zeigt alle 5 Erklärungen
2. Auf schmalem Bildschirm → Wrapping funktioniert
3. Beamer-Test → Lesbar aus 5-10m Entfernung

### Optionale Erweiterung
- Toggle-Button zum Ein-/Ausblenden der Legende (Post-MVP)

## References

- [Mockup: bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)
- [Epic 11 Overview](./00-epic-overview.md)
