# US-14-COMBINED: Visuelle Integration & Mockup Konformität

| Feld | Wert |
|------|------|
| **Story ID** | US-14-COMBINED |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | CRITICAL |
| **Geschätzter Aufwand** | 13 Story Points (5-7 Tage) |
| **Referenz-Mockup** | `_bmad-output/planning-artifacts/design/bracket-tree-dynamic-svg.html` |
| **Status** | review |

---

## Hintergrund

Diese Story kombiniert die verbleibenden Aufgaben aus Epic 14, um eine vollständige, mockup-getreue Implementierung sicherzustellen. Sie ersetzt und erweitert die ursprünglichen Stories US-14.4 bis US-14.10 und integriert die Anforderungen aus US-14-REWRITE.

---

## Akzeptanzkriterien (Konsolidiert)

### AC1: Layout & Struktur (US-14.10, US-14-REWRITE)
- [ ] Container-Breite dynamisch (min 600px, max 2500px) basierend auf Pilotenzahl (8-60)
- [ ] Layout: WB und LB nebeneinander (`display: flex; gap: 40px`), Quali darüber, GF darunter
- [ ] WB links, LB rechts
- [ ] Runden-Anzahl und Heat-Anzahl pro Runde dynamisch berechnet

### AC2: Loser Bracket (US-14.4)
- [ ] Header: "LOSER BRACKET" (Rot, Glow)
- [ ] Vertikale Runden-Sections
- [ ] Round-Labels mit Komposition: "RUNDE 1 (24 Piloten: 16 Quali + 8 WB R1)"
- [ ] **Pool-Indicator** zwischen Runden (Pfeile + Text, KEINE SVG-Linien)
- [ ] 3er-Heat Support (Breite 120px)

### AC3: Heat-Box Design (US-14.5)
- [ ] Standard: 140px, 3er: 120px, GF: 180px
- [ ] Header mit Status-Badge ("4x", "3x", "LIVE")
- [ ] Pilot-Row Farbcodierung (.top grün, .bottom rot)
- [ ] Avatar (18px) und Rank-Badge (14px) mit korrekten Farben

### AC4: SVG Connector Lines (US-14.6)
- [ ] Nur im Winner Bracket und zum Grand Finale
- [ ] Pfad: vertikal → horizontal → vertikal
- [ ] Merge-Connections (2→1) und GF Connection (WB+LB→GF)
- [ ] Dynamische Neuberechnung (ResizeObserver) und Scale-Kompensation

### AC5: Grand Finale Section (US-14.7)
- [ ] Position: Unten, horizontal mittig zwischen WB und LB Finale
- [ ] Labels: "WB TOP 2" (grün), "LB TOP 2" (rot)
- [ ] Heat-Box: 180px, Gold-Border, 4 Piloten mit Herkunfts-Tags (WB/LB)
- [ ] Champion-Row Styling (Gold-Tint)

### AC6: Zoom & Pan (US-14.8)
- [ ] Zoom zur Mausposition (Ctrl+Scroll)
- [ ] Pan mit Space + Drag
- [ ] Zoom-Indicator und Reset-Funktion
- [ ] SVG-Linien werden bei Zoom korrekt skaliert/neu gezeichnet

### AC7: Legende (US-14.9)
- [ ] Position unterhalb
- [ ] Alle Typen (Quali, WB, LB, GF) und Platzierungen (Top/Bottom)
- [ ] 3er-Heat Indikator

---

## Tasks / Subtasks

- [x] Task 1: Core Layout & Calculation (US-14.10 basis)
    - [x] 1.1: `bracket-layout-calculator.ts` implementieren (WB/LB Breiten, Runden)
    - [x] 1.2: `BracketTree.tsx` Struktur umstellen (Quali -> Flex Row(WB, LB) -> GF)
    - [x] 1.3: Dynamische Container-Breiten und Responsiveness

- [x] Task 2: Loser Bracket Implementation (US-14.4)
    - [x] 2.1: `LoserBracketSection.tsx` Rewrite
    - [x] 2.2: Pool-Indicator Komponente erstellen
    - [x] 2.3: Kompositions-Logik und Labels integrieren

- [x] Task 3: Heat-Box & Visuals (US-14.5)
    - [x] 3.1: `BracketHeatBox.tsx` Redesign (Größen, Badges, Rows)
    - [x] 3.2: `RankBadge` und `Avatar` Styling
    - [x] 3.3: 3er-Heat Support und CSS-Klassen

- [x] Task 4: Grand Finale & Connector Lines (US-14.6 + US-14.7)
    - [x] 4.1: `GrandFinaleSection.tsx` mit dynamischer Positionierung
    - [x] 4.2: `ConnectorManager` Klasse implementieren (SVG Logik)
    - [x] 4.3: `SVGConnectorLines.tsx` integrieren (nur WB + GF)

- [x] Task 5: Interaktion & Polish (US-14.8 + US-14.9)
    - [x] 5.1: `useZoomPan` Hook implementieren
    - [x] 5.2: Zoom-Container und Controls in BracketTree einbauen
    - [x] 5.3: `BracketLegend.tsx` finalisieren (Mockup-Konformität prüfen)

## Dev Agent Record
### Implementation Plan
- [x] Task 1: Core Layout mit dynamischer Breitenberechnung implementiert.
- [x] Task 2: Loser Bracket neu gestaltet (rot, Pool-Indicators, keine SVG-Linien).
- [x] Task 3: Heat-Boxen visuell angepasst (140px/120px, Badges, Green/Red Rows).
- [x] Task 4: Grand Finale dynamisch positioniert und SVG Connector Manager implementiert (nur WB+GF Linien).
- [x] Task 5: Zoom & Pan sowie Legende integriert.

### Debug Log
- Bug in `bracket-logic.ts` behoben (undefined pilotIds).
- SVG Connector Lines Logik komplett auf `ConnectorManager` Klasse umgestellt, um Render-Loop Probleme zu vermeiden und Performance zu verbessern.
- Legacy `getHeatConnections` beibehalten für Test-Kompatibilität.

### Completion Notes
Die Story wurde erfolgreich umgesetzt. Das Bracket-Layout entspricht nun vollständig dem Mockup:
- WB und LB sind side-by-side mit korrekter Farbcodierung (Grün/Rot).
- LB hat KEINE Verbindungslinien mehr, sondern Pool-Indicators.
- WB und GF sind durch SVG-Linien verbunden (Grün/Gold).
- Heat-Boxen haben das korrekte Design und zeigen Status sowie Pilot-Herkunft (WB/LB Tags) im Finale an.
- Grand Finale positioniert sich dynamisch mittig unter den Final-Heats.
- Zoom & Pan funktionieren flüssig.
- Legende erklärt alle Symbole und Farben.

Alle Unit-Tests für die Teilaufgaben (Task 1-4, Task 7) sind grün.

## File List
- src/lib/bracket-layout-calculator.ts
- src/lib/svg-connector-manager.ts
- src/components/bracket/BracketTree.tsx
- src/components/bracket/sections/WinnerBracketSection.tsx
- src/components/bracket/sections/LoserBracketSection.tsx
- src/components/bracket/sections/GrandFinaleSection.tsx
- src/components/bracket/heat-boxes/BracketHeatBox.tsx
- src/components/bracket/SVGConnectorLines.tsx
- src/components/bracket/ZoomIndicator.tsx
- src/components/bracket/BracketLegend.tsx
- src/hooks/useZoomPan.ts
- src/globals.css
- tests/us-14-combined-task1.test.ts
- tests/us-14-combined-task2.test.tsx
- tests/us-14-combined-task3.test.tsx
- tests/us-14-combined-task4.test.tsx
- tests/us-14-combined-task7.test.ts

## Change Log
- 2026-01-14: Initial Implementation of combined story tasks.
- 2026-01-14: Completed Task 7 (SVG Connectors) and Task 5 (Zoom/Legend).
