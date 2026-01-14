# US-14-REWRITE: Bracket Visualisierung Mockup-Konformität

| Feld | Wert |
|------|------|
| **Story ID** | US-14-REWRITE |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | CRITICAL |
| **Geschätzter Aufwand** | 8-10 Story Points (3-4 Tage) |
| **Referenz-Mockup** | `_bmad-output/planning-artifacts/design/bracket-tree-dynamic-svg.html` |

---

## Hintergrund

Die aktuelle Implementierung weicht signifikant vom HTML-Mockup ab. Diese Story konsolidiert alle notwendigen Änderungen um das Bracket exakt wie im Mockup darzustellen.

---

## Kritische Abweichungen (Ist vs. Soll)

### 1. Layout-Struktur

**Mockup (SOLL):**
```
┌─────────────────────────────────────────────────────────┐
│                    QUALIFIKATION                        │
│  [H1] [H2] [H3] [H4] [H5] [H6] [H7] [H8]               │
│     ↓ Platz 1+2 → WB    ↓ Platz 3+4 → LB               │
├─────────────────────────────────────────────────────────┤
│  WINNER BRACKET          │    LOSER BRACKET             │
│  (vertikale Runden)      │    (vertikale Runden)        │
│  mit SVG-Linien          │    mit Pool-Indicators       │
├─────────────────────────────────────────────────────────┤
│               ★ GRAND FINALE ★                          │
│           (unten, horizontal mittig)                    │
└─────────────────────────────────────────────────────────┘
```

**Aktuell (IST):**
```
┌────────────────────────────────────────────────────────────┐
│  POOLS  │  HEATS  │  CONNECTOR  │  FINALS  │  GRAND FINALE │
│  (horizontal, Spalten-basiert)                             │
└────────────────────────────────────────────────────────────┘
```

### 2. Fehlende Elemente

- Pool-Indicator im LB ("↓ 12 Piloten weiter + 4 WB → Neu gemischt")
- Pilot-Row Farbcodierung (.top grün, .bottom rot)
- Korrekte Heat-Box Größen (140px/120px/180px)
- Flow-Indicator unter Quali
- Grand Finale Position (unten mittig, nicht rechte Spalte)

---

## Akzeptanzkriterien

### AC1: Quali-Section nach Mockup
- [ ] Horizontale Reihe mit allen Quali-Heats
- [ ] Section-Header: "QUALIFIKATION" in Cyan
- [ ] Flow-Indicator darunter:
  - "↓ Platz 1+2 (16) → Winner Bracket" (grün)
  - "↓ Platz 3+4 (16) → Loser Bracket" (rot)
- [ ] Cyan Border-Bottom als Trenner

### AC2: Bracket-Layout (WB + LB side-by-side)
- [ ] `display: flex; gap: 40px` für WB und LB nebeneinander
- [ ] WB links, LB rechts
- [ ] Beide mit eigenem Column-Header

### AC3: Winner Bracket Column
- [ ] Header: "WINNER BRACKET" mit grünem Glow-Border
- [ ] Vertikale Runden-Sections
- [ ] Round-Labels: "RUNDE N (X Piloten)"
- [ ] Connector-Spaces (40px) zwischen Runden für SVG-Linien
- [ ] Finale-Label: "FINALE (4 Piloten)"

### AC4: Loser Bracket Column
- [ ] Header: "LOSER BRACKET" mit rotem Glow-Border
- [ ] Vertikale Runden-Sections
- [ ] Round-Labels mit Komposition: "RUNDE 1 (24 Piloten: 16 Quali + 8 WB R1)"
- [ ] **Pool-Indicator** zwischen Runden:
  ```
  ↓ 12 Piloten weiter + 4 WB R2 Verlierer = 16 Piloten → Neu gemischt
  ```
- [ ] KEINE SVG-Linien (Pool-basiert)

### AC5: Heat-Box Design (exakt nach Mockup)
- [ ] Standard: 140px Breite
- [ ] 3er-Heat: 120px Breite (`.three-pilot`)
- [ ] Grand Finale: 180px Breite, 3px Gold-Border
- [ ] Heat-Header: Bebas Neue 10px, mit Status-Badge ("4x", "3x", "LIVE")
- [ ] Pilot-Row mit Farbcodierung:
  - `.top` (Platz 1+2): grüner Hintergrund + grüner Border-Left
  - `.bottom` (Platz 3+4): roter Hintergrund + roter Border-Left
- [ ] Pilot-Avatar: 18x18px, rund
- [ ] Pilot-Name: 9px, truncated
- [ ] Rank-Badge: 14x14px, rund (Gold/Silber/Bronze/Cyan)

### AC6: Grand Finale Section
- [ ] Position: Unterhalb von WB+LB, horizontal mittig
- [ ] GF-Sources Labels: "WB TOP 2" (grün), "LB TOP 2" (rot)
- [ ] GF-Label: "GRAND FINALE" in Gold mit Glow
- [ ] 4 Piloten mit WB/LB Tags
- [ ] Champion-Row: Gold-Tint Hintergrund für Platz 1 (`.champ`)

### AC7: SVG Connector Lines (nur WB)
- [ ] Nur im Winner Bracket
- [ ] Pfad: vertikal nach unten → horizontal → vertikal zum Ziel
- [ ] Farbe: Grün (#39ff14), 2px, 0.7 Opacity
- [ ] Merge-Connections: 2 Heats → 1 Heat
- [ ] Grand Finale Connection: WB-Finale + LB-Finale → GF (Gold, 3px)

### AC8: Legende nach Mockup
- [ ] Position: unterhalb des gesamten Brackets
- [ ] Line-Items: Quali (Cyan), WB (Grün), LB (Rot), GF (Gold)
- [ ] Color-Items: Platz 1+2 (grün), Platz 3+4 (rot)
- [ ] Spezial: "3x = 3-Pilot Heat"

---

## Tasks / Subtasks

### Task 1: BracketTree.tsx Layout-Restrukturierung
- [ ] 1.1: Neues Layout-Schema implementieren (Quali → WB+LB → GF)
- [ ] 1.2: `.bracket-layout` Container für WB+LB side-by-side
- [ ] 1.3: Grand Finale nach unten verschieben

### Task 2: QualiSection.tsx überarbeiten
- [ ] 2.1: Flow-Indicator hinzufügen
- [ ] 2.2: Cyan Border-Bottom
- [ ] 2.3: Korrekte Abstände

### Task 3: WinnerBracketSection.tsx anpassen
- [ ] 3.1: Column-Header Styling nach Mockup
- [ ] 3.2: Round-Sections mit Labels
- [ ] 3.3: Connector-Spaces für SVG

### Task 4: LoserBracketSection.tsx komplett überarbeiten
- [ ] 4.1: Column-Header Styling nach Mockup
- [ ] 4.2: Round-Sections mit Kompositions-Labels
- [ ] 4.3: **Pool-Indicator Komponente** erstellen und einfügen
- [ ] 4.4: Keine SVG-Linien

### Task 5: BracketHeatBox.tsx nach Mockup redesignen
- [ ] 5.1: Exakte Größen (140/120/180px)
- [ ] 5.2: Heat-Header mit Status-Badge
- [ ] 5.3: Pilot-Row mit .top/.bottom Styling
- [ ] 5.4: Pilot-Avatar 18x18px
- [ ] 5.5: Rank-Badge 14x14px mit korrekten Farben

### Task 6: GrandFinaleSection.tsx repositionieren
- [ ] 6.1: Position unten mittig (nicht rechts)
- [ ] 6.2: GF-Sources Labels
- [ ] 6.3: Champion-Row Styling

### Task 7: SVGConnectorLines.tsx überarbeiten
- [ ] 7.1: Nur WB-Linien (kein LB)
- [ ] 7.2: Pfad-Logik: vertikal → horizontal → vertikal
- [ ] 7.3: Grand Finale Connection
- [ ] 7.4: Scale-Kompensation bei Zoom

### Task 8: BracketLegend.tsx nach Mockup
- [ ] 8.1: Line-Items für alle Bracket-Typen
- [ ] 8.2: Color-Items für Platzierungen
- [ ] 8.3: "3x = 3-Pilot Heat"

### Task 9: globals.css - Alle Mockup-Styles
- [ ] 9.1: CSS-Variablen verifizieren
- [ ] 9.2: .bracket-layout, .bracket-column Styles
- [ ] 9.3: .heat-box, .pilot-row, .rank-badge Styles
- [ ] 9.4: .pool-indicator Styles
- [ ] 9.5: .flow-indicator Styles

### Task 10: Tests und Verifikation
- [ ] 10.1: Visueller Vergleich mit Mockup (Screenshot)
- [ ] 10.2: Test mit 8, 14, 32 Piloten
- [ ] 10.3: Alle existierenden Tests bestehen

---

## CSS aus Mockup (Referenz)

```css
/* Bracket Layout */
.bracket-layout {
  display: flex;
  gap: 40px;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}

.bracket-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bracket-column-header {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 14px;
  letter-spacing: 3px;
  text-align: center;
  padding: 8px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  width: 100%;
}

.bracket-column.wb .bracket-column-header {
  color: var(--winner-green);
  border: 2px solid var(--winner-green);
  box-shadow: var(--glow-green);
  background: rgba(57, 255, 20, 0.08);
}

.bracket-column.lb .bracket-column-header {
  color: var(--loser-red);
  border: 2px solid var(--loser-red);
  box-shadow: var(--glow-red);
  background: rgba(255, 7, 58, 0.08);
}

/* Pool Indicator */
.pool-indicator {
  font-size: 9px;
  color: var(--steel);
  text-align: center;
  padding: 8px 0;
  margin: 5px 0;
}

.pool-indicator .arrow {
  color: var(--loser-red);
}

/* Flow Indicator (unter Quali) */
.flow-indicator {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin: 18px 0 0 0;
  font-size: 11px;
  color: var(--steel);
}

.flow-indicator .wb-arrow { color: var(--winner-green); }
.flow-indicator .lb-arrow { color: var(--loser-red); }

/* Heat Box */
.heat-box {
  background: var(--night-light);
  border: 2px solid var(--winner-green);
  border-radius: 8px;
  padding: 6px 8px;
  width: 140px;
  box-shadow: var(--glow-green);
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
  width: 120px;
}

/* Pilot Row */
.pilot-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 5px;
  border-radius: 3px;
  margin: 1px 0;
}

.pilot-row.top {
  background: rgba(57, 255, 20, 0.25);
  border-left: 2px solid var(--winner-green);
}

.pilot-row.bottom {
  background: rgba(255, 7, 58, 0.25);
  border-left: 2px solid var(--loser-red);
}

.pilot-row.champ {
  background: rgba(249, 200, 14, 0.2);
  border-left: 2px solid var(--gold);
}

/* Pilot Avatar */
.pilot-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--night);
  border: 1px solid var(--steel);
  object-fit: cover;
}

/* Rank Badge */
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
}

.rank-badge.r1 { background: var(--gold); }
.rank-badge.r2 { background: #c0c0c0; }
.rank-badge.r3 { background: #cd7f32; }
.rank-badge.r4 { background: var(--neon-cyan); }

/* Grand Finale Section */
.grand-finale-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
  padding-top: 20px;
}

.gf-sources {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-bottom: 15px;
  font-size: 9px;
  font-family: 'Bebas Neue', sans-serif;
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
```

---

## Definition of Done

- [ ] Alle 8 Akzeptanzkriterien erfüllt
- [ ] Layout entspricht exakt dem Mockup
- [ ] WB links, LB rechts (side-by-side)
- [ ] Grand Finale unten mittig
- [ ] Pool-Indicator im LB vorhanden
- [ ] Heat-Box Design 1:1 nach Mockup
- [ ] SVG-Linien nur im WB
- [ ] Legende nach Mockup
- [ ] Test mit 8, 14, 32 Piloten erfolgreich
- [ ] Alle existierenden Tests bestehen
- [ ] Visueller Screenshot-Vergleich mit Mockup

---

## Referenzen

- Mockup: `_bmad-output/planning-artifacts/design/bracket-tree-dynamic-svg.html`
- Betroffene Stories: US-14.3, US-14.4, US-14.5, US-14.6, US-14.7, US-14.9
- Epic 13: Stellt korrektes Grand Finale mit 4 Piloten bereit (Story 13-7 gefixt)
