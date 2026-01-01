# Story 11.1: Unified Layout Container

**Status:** ready
**Created:** 2025-12-28
**Story Points:** 8 (L-Shirt - kompletter Layout-Umbau)
**Mockup:** [bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)

## Story

Als **Zuschauer auf dem Beamer**,
möchte ich **alle Turnier-Heats in einem zusammenhängenden visuellen Container sehen**,
damit **ich den Turnierfluss auf einen Blick verstehen kann**.

## Hintergrund

Aktuell gibt es getrennte Sections mit eigenem Border für WB, LB und Grand Finale. Das neue Layout soll alle Heats in einem einzigen `bracket-container` zusammenfassen mit horizontalem Layout:

```
Pools → Runde 1 Heats → Finale → Grand Finale
```

## Acceptance Criteria

### AC1: Keine getrennten Sections mehr

**Given** die Bracket-Ansicht wird gerendert
**When** ich das Bracket betrachte
**Then** gibt es keine getrennten Container mit eigenem Border für WB/LB/GF mehr
**And** alles ist in einem zusammenhängenden Container
**And** es gibt keine separaten Border-Boxen für WB/LB/GF mehr
**And** der Container hat eine einheitliche `bg-night` Hintergrundfarbe

### AC2: Horizontales Spalten-Layout

**Given** das Bracket wird gerendert
**When** ich die Struktur betrachte
**Then** sind die Elemente in Spalten angeordnet:
  - Spalte 1: Pools (WB Pool oben, LB Pool unten)
  - Spalte 2: Runde 1 Heats (WB Heats oben gestapelt, LB Heats unten gestapelt)
  - Spalte 3: Connector Space (Platzhalter für SVG-Linien)
  - Spalte 4: Finals (WB Finale oben, LB Finale unten)
  - Spalte 5: Connector Space (Platzhalter für SVG-Linien)
  - Spalte 6: Grand Finale (vertikal zentriert)

### AC3: WB und LB vertikal getrennt

**Given** das Bracket wird gerendert
**When** ich die vertikale Struktur betrachte
**Then** sind WB-Heats in der oberen Hälfte
**And** LB-Heats in der unteren Hälfte
**And** es gibt einen visuellen Spacer dazwischen

### AC4: Horizontales Scrolling bei Bedarf

**Given** der Bildschirm ist schmaler als die Minimum-Breite
**When** ich das Bracket betrachte
**Then** kann ich horizontal scrollen
**And** alle Elemente bleiben lesbar

### AC5: Beamer-lesbare Mindestgrößen

**Given** das Bracket wird auf einem Beamer angezeigt
**When** ich aus 5-10m Entfernung schaue
**Then** sind alle Heat-Boxen mindestens 200px breit
**And** Piloten-Namen haben mindestens 12px Schriftgröße
**And** der Container hat eine Mindesthöhe von 600px

## Technische Anforderungen

### Layout-Struktur (aus Mockup)

```tsx
<div className="bracket-container">
  <div className="bracket-tree">
    <div className="pools-column">...</div>
    <div className="heats-column">...</div>
    <div className="connector-column"></div>
    <div className="finals-column">...</div>
    <div className="connector-column"></div>
    <div className="grand-finale-column">...</div>
  </div>
</div>
```

### CSS Anforderungen (aus Mockup)

```css
.bracket-container {
  background: var(--night);
  border-radius: 16px;
  padding: 30px;
  position: relative;
  overflow-x: auto;
}

.bracket-tree {
  display: flex;
  align-items: stretch;
  gap: 0;
  min-width: 1100px;
  position: relative;
}
```

## Tasks

- [ ] **Task 1:** Bestehende Section-Container entfernen (WinnerBracketSection, etc.)
- [ ] **Task 2:** Neuen `BracketTree` Container mit Spalten-Layout erstellen
- [ ] **Task 3:** CSS Grid/Flexbox für horizontales Layout implementieren
- [ ] **Task 4:** Minimum-Breite und horizontales Scrolling einrichten
- [ ] **Task 5:** Visuellen Spacer zwischen WB und LB Heats hinzufügen
- [ ] **Task 6:** Visuelle Tests mit Screenshot-Vergleich für verschiedene Bracket-Größen (8, 15, 27, 60 Piloten)

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/bracket/BracketTree.tsx` | Kompletter Umbau |
| `src/components/bracket/sections/*.tsx` | Möglicherweise entfernen oder refactoren |
| `src/globals.css` | Neue CSS-Klassen für Spalten |

## Dev Notes

### Abhängigkeiten
- Keine - Basis-Story für Epic 11
- Kann parallel zu anderen Stories begonnen werden

### Wichtige Hinweise
- Das Layout muss flexibel genug sein für dynamische Bracket-Größen
- SVG-Linien (Story 11-2) werden über dem Container platziert
- Pools (Story 11-5) werden in der ersten Spalte positioniert

## References

- [Mockup: bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)
- [Epic 11 Overview](./00-epic-overview.md)
