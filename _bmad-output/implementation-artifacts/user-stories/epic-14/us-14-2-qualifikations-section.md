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
- [x] Eigene Section mit Cyan-Border unten (2px solid `--quali-blue`)
- [x] Margin-Bottom: 35px
- [x] Padding-Bottom: 30px
- [x] z-index: 2 (über SVG-Layer)

### AC2: Section-Header
- [x] Text "QUALIFIKATION" in Cyan (`--quali-blue`)
- [x] Font: Bebas Neue, 16px
- [x] Letter-Spacing: 3px
- [x] Text-Shadow: `0 0 10px currentColor`
- [x] Text-Align: center
- [x] Margin-Bottom: 15px

### AC3: Heats-Layout
- [x] Heats horizontal in einer Reihe (flex, no-wrap)
- [x] Gap: 12px zwischen Heats
- [x] Justify-Content: center
- [x] Keine Umbrüche (horizontales Scrolling bei vielen Heats)

### AC4: Flow-Indicator
- [x] Unterhalb der Heats-Reihe
- [x] Zwei Indikatoren mit 60px Gap:
  - "↓ Platz 1+2 (N) → Winner Bracket" (grüner Pfeil)
  - "↓ Platz 3+4 (N) → Loser Bracket" (roter Pfeil)
- [x] Font-Size: 11px
- [x] Farbe: `--steel`
- [x] Margin-Top: 18px

### AC5: Heat-Boxes Qualifikations-Styling
- [x] Cyan Border: 2px solid `--quali-blue`
- [x] Box-Shadow: `--glow-blue`
- [x] Status-Badge: Cyan-Hintergrund
- [x] Standardbreite: 140px (`--heat-width`)

---

## Status
Status: completed

## Tasks/Subtasks
- [x] Implement AC1: Section-Container
- [x] Implement AC2: Section-Header
- [x] Implement AC3: Heats-Layout
- [x] Implement AC4: Flow-Indicator
- [x] Implement AC5: Heat-Boxes Qualifikations-Styling

## Dev Agent Record
### Implementation Plan
1. Neue Komponente `QualiSection.tsx` erstellt.
2. Styling für Quali-Section in `globals.css` hinzugefügt.
3. `BracketHeatBox` und `HeatCard` um `qualification` Bracket-Typ erweitert.
4. `BracketTree.tsx` auf neue `QualiSection` umgestellt.

### Debug Log
- Tests für Flow-Indicator Berechnung bestanden.
- Layout horizontal fixiert mit Overflow-Handling.

### Completion Notes
Qualifikations-Section ist nun visuell vom restlichen Bracket getrennt und folgt dem Mockup-Design.

## File List
- src/components/bracket/sections/QualiSection.tsx
- src/components/bracket/BracketTree.tsx
- src/components/ui/heat-card.tsx
- src/globals.css
- tests/us-14-2.test.tsx

## Change Log
- Add QualiSection component
- Update styling for qualification heats
- Update BracketTree to use QualiSection
