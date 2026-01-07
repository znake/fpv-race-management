# US-14.1: Synthwave Bracket Container

| Feld | Wert |
|------|------|
| **Story ID** | US-14.1 |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | HIGH |
| **Geschätzter Aufwand** | 3 Story Points (0.5-1 Tag) |
| **Abhängigkeiten** | Keine (kann parallel starten) |

---

## User Story

**Als** Zuschauer auf dem Beamer  
**möchte ich** einen zusammenhängenden Bracket-Container im Synthwave-Design  
**sodass** ich das gesamte Turnier auf einen Blick erfassen kann

---

## Akzeptanzkriterien

### AC1: Container-Styling nach Mockup
- [ ] Bracket-Container mit `--night` (#1a0533) Hintergrund
- [ ] 12px Border-Radius für abgerundete Ecken
- [ ] Padding: 25px innerhalb des Containers
- [ ] Container-Overflow: visible (für SVG-Linien)

### AC2: SVG-Overlay Layer
- [ ] SVG-Element als absolut positionierter Overlay
- [ ] `position: absolute; top: 0; left: 0; width: 100%; height: 100%`
- [ ] `pointer-events: none` für Durchklick-Funktionalität
- [ ] `z-index: 1` für korrekte Layering-Reihenfolge

### AC3: Synthwave Grid-Hintergrund
- [ ] Fixed-Position Grid im Body-Hintergrund
- [ ] Grid-Pattern: 60px Abstand, 2px Linien
- [ ] Farbe: rgba(255, 42, 109, 0.08) (transparentes Neon-Pink)
- [ ] Höhe: 200px am unteren Bildschirmrand
- [ ] Gradient-Overlay von transparent nach `--void`

### AC4: Dynamische Container-Breite
- [ ] Container-Breite berechnet sich aus: WB-Breite + Gap(40px) + LB-Breite + Padding(50px)
- [ ] Mindestbreite für 8 Piloten (~600px)
- [ ] Maximale Breite für 60 Piloten (~2500px)
- [ ] Horizontales Scrolling bei Bedarf

### AC5: CSS-Variablen Definition
- [ ] `--void: #0d0221` (Body-Hintergrund)
- [ ] `--night: #1a0533` (Container-BG)
- [ ] `--night-light: #2a0845` (Heat-Box BG)
- [ ] `--neon-pink: #ff2a6d` (Akzent)
- [ ] `--neon-cyan: #05d9e8` (Info/Quali)
- [ ] `--gold: #f9c80e` (Grand Finale)
- [ ] `--winner-green: #39ff14` (WB / Platz 1+2)
- [ ] `--loser-red: #ff073a` (LB / Platz 3+4)
- [ ] `--chrome: #e0e0e0` (Text)
- [ ] `--steel: #888888` (Muted Text)
- [ ] `--quali-blue: #00bfff` (Qualifikation)

### AC6: Glow-Effekte Variablen
- [ ] `--glow-green: 0 0 10px rgba(57, 255, 20, 0.4)`
- [ ] `--glow-red: 0 0 10px rgba(255, 7, 58, 0.4)`
- [ ] `--glow-gold: 0 0 15px rgba(249, 200, 14, 0.5)`
- [ ] `--glow-blue: 0 0 10px rgba(0, 191, 255, 0.4)`

---

## Technische Hinweise

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/components/bracket/BracketTree.tsx` | Container-Struktur anpassen |
| `src/globals.css` | CSS-Variablen hinzufügen |

### Implementierungsdetails

```tsx
// BracketTree.tsx - Container-Struktur
<div className="bracket-container">
  {/* SVG Overlay für Verbindungslinien */}
  <svg id="connector-svg" className="absolute inset-0 w-full h-full pointer-events-none z-[1] overflow-visible" />
  
  {/* Bracket-Inhalte */}
  ...
</div>
```

```css
/* globals.css - CSS-Variablen */
:root {
  --void: #0d0221;
  --night: #1a0533;
  --night-light: #2a0845;
  --neon-pink: #ff2a6d;
  --neon-cyan: #05d9e8;
  --gold: #f9c80e;
  --winner-green: #39ff14;
  --loser-red: #ff073a;
  --chrome: #e0e0e0;
  --steel: #888888;
  --quali-blue: #00bfff;
  
  --glow-green: 0 0 10px rgba(57, 255, 20, 0.4);
  --glow-red: 0 0 10px rgba(255, 7, 58, 0.4);
  --glow-gold: 0 0 15px rgba(249, 200, 14, 0.5);
  --glow-blue: 0 0 10px rgba(0, 191, 255, 0.4);
  
  --heat-width: 140px;
  --heat-width-3: 120px;
}

.synthwave-grid {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background:
    linear-gradient(180deg, transparent 0%, var(--void) 100%),
    repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255, 42, 109, 0.08) 60px, rgba(255, 42, 109, 0.08) 62px),
    repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255, 42, 109, 0.08) 60px, rgba(255, 42, 109, 0.08) 62px);
  pointer-events: none;
  z-index: 0;
}

.bracket-container {
  background: var(--night);
  border-radius: 12px;
  padding: 25px;
  position: relative;
  overflow: visible;
}
```

### Migration von bestehendem Code

Die aktuelle `BracketTree.tsx` verwendet bereits Tailwind-Klassen. Diese müssen auf die neuen CSS-Variablen umgestellt werden:

- `bg-night` → CSS-Variable `var(--night)`
- `rounded-2xl` → `border-radius: 12px`
- `p-8` → `padding: 25px`

---

## Status
Status: completed

## Tasks/Subtasks
- [x] Implement AC1: Container-Styling
- [x] Implement AC2: SVG-Overlay Layer
- [x] Implement AC3: Synthwave Grid-Hintergrund
- [x] Implement AC4: Dynamische Container-Breite
- [x] Implement AC5: CSS-Variablen Definition
- [x] Implement AC6: Glow-Effekte Variablen

## Dev Agent Record
### Implementation Plan
1. CSS-Variablen in globals.css definieren.
2. Synthwave-Grid in globals.css anpassen.
3. BracketTree.tsx: Container-Klassen bereinigen und SVG-Layer hinzufügen.
4. globals.css: .bracket-container Styling zentralisieren.

### Debug Log
- Tests bestanden. SVG-Layer korrekt positioniert.
- Dynamische Breite via fit-content und min/max-width umgesetzt.

### Completion Notes
Alle ACs erfüllt. Das Design folgt nun strikt dem Synthwave-Mockup.

## File List
## Change Log
