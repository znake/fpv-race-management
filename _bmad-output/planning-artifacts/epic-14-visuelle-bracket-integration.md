---
date: 2026-01-04
author: John (PM)
type: epic
context: Epic 14 - Visuelle Integration Bracket-Mockup
status: draft
source: bracket-tree-dynamic-svg.html, epic-13-runden-basiertes-bracket-redesign.md
depends_on: Epic 13 (teilweise parallel möglich)
---

# Epic 14: Visuelle Integration Bracket-Mockup

## Zusammenfassung

Das vorhandene Bracket-Design wird durch eine **1:1 Umsetzung des Mockups `bracket-tree-dynamic-svg.html`** ersetzt. Dieses Epic fokussiert auf den **visuellen Umbau** - Layout, Styling, SVG-Linien, Zoom/Pan - während Epic 13 die **Logik-Änderungen** (Runden-basiert, Grand Finale 4 Piloten, Rematch) behandelt.

**Kernprinzip:** Das Mockup zeigt 32 Piloten - die Implementierung muss für **8-60 Piloten** dynamisch skalieren.

---

## Referenz-Mockup Analyse

### Layout-Struktur (aus `bracket-tree-dynamic-svg.html`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: "FPV RACING HEATS" + Turnier-Info                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ TITLE: "DYNAMISCHER TURNIERBAUM - 32 PILOTEN"                               │
│ RULES-INFO BOX: Turnier-Ablauf Erklärung                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                           BRACKET CONTAINER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ QUALIFIKATION (8 Heats horizontal)                                   │    │
│  │ [Q1] [Q2] [Q3] [Q4] [Q5] [Q6] [Q7] [Q8]                              │    │
│  │      ↓ Flow-Indicator: "1+2 → WB" | "3+4 → LB"                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────┬──────────────────────────────────────────┐    │
│  │    WINNER BRACKET        │           LOSER BRACKET                   │    │
│  │    (Grüner Header)       │           (Roter Header)                  │    │
│  │                          │                                          │    │
│  │  RUNDE 1 (4 Heats)       │  RUNDE 1 (6 Heats)                       │    │
│  │  [H1] [H2] [H3] [H4]     │  [H1] [H2] [H3] [H4] [H5] [H6]           │    │
│  │     \  /    \  /         │      Pool-Indicator ↓                    │    │
│  │      SVG-Linien          │  RUNDE 2 (4 Heats)                       │    │
│  │  RUNDE 2 (2 Heats)       │  [H7] [H8] [H9] [H10]                    │    │
│  │     [H5]   [H6]          │      Pool-Indicator ↓                    │    │
│  │       \    /             │  RUNDE 3 (3 Heats: 2x3er + 1x4er)        │    │
│  │        SVG-Linien        │  [H11] [H12] [H13]                       │    │
│  │  FINALE (1 Heat)         │      Pool-Indicator ↓                    │    │
│  │      [WB FINALE]         │  RUNDE 4 (2 Heats: 2x3er)                │    │
│  │          │               │  [H14] [H15]                             │    │
│  │          │               │      Pool-Indicator ↓                    │    │
│  │          │               │  FINALE (1 Heat)                         │    │
│  │          │               │      [LB FINALE]                         │    │
│  │          │               │          │                               │    │
│  │          └───────────────┼──────────┘                               │    │
│  │                          │    GRAND FINALE                          │    │
│  │                          │   ┌─────────────┐                        │    │
│  │                          │   │ WB TOP 2    │                        │    │
│  │                          │   │ LB TOP 2    │                        │    │
│  │                          │   │ GRAND FINALE│                        │    │
│  │                          │   └─────────────┘                        │    │
│  └──────────────────────────┴──────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEGEND: Farbcodierung Erklärung                                              │
│ ZOOM-INDICATOR: +/- Buttons + Zoom-Level + Hint                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Visuelle Elemente aus dem Mockup

#### 1. CSS-Variablen / Design-Tokens

```css
--void: #0d0221;          /* Hintergrund */
--night: #1a0533;         /* Container BG */
--night-light: #2a0845;   /* Heat-Box BG */
--neon-pink: #ff2a6d;     /* Akzent */
--neon-cyan: #05d9e8;     /* Info/Quali */
--gold: #f9c80e;          /* Grand Finale */
--winner-green: #39ff14;  /* WB / Platz 1+2 */
--loser-red: #ff073a;     /* LB / Platz 3+4 */
--chrome: #e0e0e0;        /* Text */
--steel: #888888;         /* Muted Text */
--quali-blue: #00bfff;    /* Qualifikation */

--heat-width: 140px;      /* Standard Heat-Box */
--heat-width-3: 120px;    /* 3er-Heat Box */
```

#### 2. Glow-Effekte

```css
--glow-green: 0 0 10px rgba(57, 255, 20, 0.4);
--glow-red: 0 0 10px rgba(255, 7, 58, 0.4);
--glow-gold: 0 0 15px rgba(249, 200, 14, 0.5);
--glow-blue: 0 0 10px rgba(0, 191, 255, 0.4);
```

#### 3. Heat-Box Struktur

```html
<div class="heat-box [quali|lb|gf] [three-pilot]">
  <div class="heat-header">
    HEAT NAME <span class="heat-status">4x</span>
  </div>
  <div class="pilot-row [top|bottom|champ]">
    <img class="pilot-avatar" />
    <span class="pilot-name">Name</span>
    <span class="pilot-tag [wb|lb]">WB</span>  <!-- nur im GF -->
    <span class="rank-badge [r1|r2|r3|r4]">1</span>
  </div>
</div>
```

#### 4. SVG-Connector System

- **Nur für WB + Grand Finale** (LB ist Pool-basiert ohne Linien)
- SVG-Overlay über gesamtem Bracket-Container
- Dynamische Berechnung basierend auf DOM-Positionen
- Merge-Connections (2 Heats → 1 Heat)
- Spezielle Grand Finale Connection (WB + LB → GF)

#### 5. Zoom & Pan

- Ctrl/Cmd + Scroll = Zoom zur Mausposition
- Space + Drag = Pan
- +/- Buttons für Zoom
- Doppelklick mit Ctrl/Cmd = Reset
- Zoom-Indicator zeigt aktuellen Level

---

## User Stories

### US-14.1: Synthwave Bracket Container (HIGH)

**Als** Zuschauer auf dem Beamer  
**möchte ich** einen zusammenhängenden Bracket-Container im Synthwave-Design  
**sodass** ich das gesamte Turnier auf einen Blick erfassen kann

**Akzeptanzkriterien:**
1. Bracket-Container mit `--night` Hintergrund und 12px Border-Radius
2. SVG-Overlay Layer für Verbindungslinien (pointer-events: none)
3. Synthwave Grid-Hintergrund im Body (fixed, unten)
4. Container-Breite passt sich Bracket-Größe an (WB + Gap + LB + Padding)
5. Padding: 25px innerhalb des Containers

**Betroffene Dateien:**
- `src/components/bracket/BracketTree.tsx` - Hauptcontainer
- `src/globals.css` - CSS-Variablen

---

### US-14.2: Qualifikations-Section (HIGH)

**Als** Turnierleiter  
**möchte ich** die Qualifikations-Heats horizontal in einer Section sehen  
**sodass** ich den Turniereinstieg übersichtlich verfolgen kann

**Akzeptanzkriterien:**
1. Eigene Section mit Cyan-Border unten (2px solid `--quali-blue`)
2. Section-Header "QUALIFIKATION" in Cyan mit Text-Shadow
3. Heats horizontal in einer Reihe mit 12px Gap
4. Flow-Indicator darunter: "Platz 1+2 → Winner Bracket" | "Platz 3+4 → Loser Bracket"
5. Heat-Boxes mit Cyan-Border und Glow

**Betroffene Dateien:**
- `src/components/bracket/sections/QualiSection.tsx` (neu)
- `src/components/bracket/heat-boxes/QualiHeatBox.tsx` (neu oder extend)

---

### US-14.3: Winner Bracket Layout (HIGH)

**Als** Zuschauer  
**möchte ich** das Winner Bracket als vertikale Spalte mit Runden sehen  
**sodass** ich den WB-Fortschritt verfolgen kann

**Akzeptanzkriterien:**
1. Bracket-Column mit fester Breite (berechnet aus Heat-Anzahl × Heat-Breite + Gaps)
2. Column-Header "WINNER BRACKET" mit grünem Border, Glow und Hintergrund
3. Round-Sections mit Label ("RUNDE 1 (16 Piloten)") in `--steel` Farbe
4. Heats einer Runde horizontal nebeneinander
5. Connector-Space (40px Höhe) zwischen Runden für SVG-Linien
6. Runde 2 Heats mit größerem Gap (160px) für zentrierte Positionierung unter Eltern-Paaren

**Betroffene Dateien:**
- `src/components/bracket/sections/WinnerBracketSection.tsx` - Rewrite
- `src/components/bracket/layout/BracketRoundColumn.tsx` - Anpassen

---

### US-14.4: Loser Bracket Layout (HIGH)

**Als** Zuschauer  
**möchte ich** das Loser Bracket als Pool-basierte Spalte sehen  
**sodass** ich verstehe dass LB-Piloten neu gemischt werden

**Akzeptanzkriterien:**
1. Bracket-Column rechts neben WB mit fester Breite
2. Column-Header "LOSER BRACKET" mit rotem Border, Glow und Hintergrund
3. Round-Sections mit Label inkl. Pool-Zusammensetzung ("RUNDE 1 (24 Piloten: 16 Quali + 8 WB R1)")
4. Pool-Indicator zwischen Runden: "↓ 12 Piloten weiter + 4 WB R2 Verlierer = 16 Piloten → Neu gemischt"
5. **Keine SVG-Linien** im LB (Pool-basiert)
6. Support für 3er-Heats (schmalere Box mit `--heat-width-3`)

**Betroffene Dateien:**
- `src/components/bracket/sections/LoserBracketSection.tsx` - Rewrite
- `src/components/bracket/PoolDisplay.tsx` - Für Pool-Indicator

---

### US-14.5: Heat-Box Design 1:1 Mockup (HIGH)

**Als** Zuschauer  
**möchte ich** Heat-Boxes im exakten Mockup-Design  
**sodass** die visuelle Identität gewahrt bleibt

**Akzeptanzkriterien:**
1. Heat-Box: 140px breit, `--night-light` BG, 8px Border-Radius, 2px Border
2. 3er-Heat-Box: 120px breit (`.three-pilot` Klasse)
3. Grand Finale Box: 180px breit, 3px goldener Border, größeres Padding
4. Heat-Header: Bebas Neue Font, 10px, Heat-Name + Status-Badge
5. Status-Badge: 7px Font, 3px Border-Radius, Farbe nach Bracket-Typ
6. Pilot-Row: 2px Padding, 3px Border-Radius, farbiger linker Border
7. Pilot-Avatar: 18px rund, 1px Border
8. Pilot-Name: 9px, truncate mit ellipsis
9. Rank-Badge: 14px rund, Bebas Neue, Farbe nach Platz (Gold/Silber/Bronze/Cyan)
10. Top-Rows (Platz 1+2): Grüner Hintergrund + linker Border
11. Bottom-Rows (Platz 3+4): Roter Hintergrund + linker Border

**Betroffene Dateien:**
- `src/components/bracket/heat-boxes/BracketHeatBox.tsx` - Rewrite Styling
- `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx` - Rewrite
- `src/components/ui/rank-badge.tsx` - Anpassen

---

### US-14.6: SVG Connector Lines System (HIGH)

**Als** Zuschauer  
**möchte ich** SVG-Verbindungslinien die den Turnierverlauf zeigen  
**sodass** ich sehe welcher Heat wohin führt

**Akzeptanzkriterien:**
1. ConnectorManager Klasse wie im Mockup (oder React-Adaptation)
2. `addConnection(fromId, toId, type)` für einfache Verbindungen
3. `addMergeConnection(fromIds[], toId, type)` für Merge (2→1)
4. `addGrandFinaleConnection(wbFinaleId, lbFinaleId, gfId)` für spezielle GF-Linie
5. Linien: 2px stroke, `stroke-linecap: round`, `stroke-linejoin: round`
6. WB-Linien: Grün (#39ff14), 0.7 Opacity
7. GF-Linien: Gold (#f9c80e), 3px, 0.8 Opacity
8. Pfad-Berechnung: Start unten-mitte, 50% vertikaler Abstand, dann horizontal zum Ziel oben-mitte
9. Dynamische Neuberechnung bei Resize (debounced)
10. Scale-Kompensation bei Zoom

**Betroffene Dateien:**
- `src/components/bracket/SVGConnectorLines.tsx` - Komplett Rewrite
- `src/lib/svg-connector-manager.ts` (neu)

---

### US-14.7: Grand Finale Section (HIGH)

**Als** Zuschauer  
**möchte ich** das Grand Finale als visuellen Höhepunkt sehen  
**sodass** klar ist dass hier alles entschieden wird

**Akzeptanzkriterien:**
1. Section unterhalb von WB+LB, horizontal mittig zwischen beiden Finales
2. GF-Sources Anzeige: "WB TOP 2" (grün) | "LB TOP 2" (rot)
3. GF-Label: "GRAND FINALE" in Gold, 18px Bebas Neue, Letter-Spacing 4px, Text-Shadow
4. GF Heat-Box: 180px, goldener 3px Border, stärkerer Glow
5. Pilot-Rows mit WB/LB Tags zeigen Herkunft
6. Champion-Row mit speziellem Styling (goldener Hintergrund-Tint)
7. Dynamische Positionierung: JS berechnet Mittelpunkt zwischen WB-Finale und LB-Finale

**Betroffene Dateien:**
- `src/components/bracket/sections/GrandFinaleSection.tsx` - Rewrite
- `src/components/bracket/sections/GrandFinaleHeatBox.tsx` - Rewrite

---

### US-14.8: Zoom & Pan Funktionalität (MEDIUM)

**Als** Turnierleiter  
**möchte ich** das Bracket zoomen und verschieben können  
**sodass** ich Details sehen oder den Überblick behalten kann

**Akzeptanzkriterien:**
1. Zoom-Wrapper Container um Bracket
2. Ctrl/Cmd + Scroll: Zoom zur Mausposition (0.15 Step, 0.25-3.0 Range)
3. Space + Drag: Pan (Cursor ändert sich zu grab/grabbing)
4. Zoom-Indicator (fixed bottom-right): +/- Buttons, Zoom-Level %, Hint-Text
5. Doppelklick + Ctrl/Cmd: Reset zu 100%
6. Transform-Origin: 0 0 für korrektes Zoom-Verhalten
7. SVG-Linien werden bei Zoom/Pan neu gezeichnet (debounced)

**Betroffene Dateien:**
- `src/components/bracket/BracketTree.tsx` - Zoom-Wrapper hinzufügen
- `src/hooks/useZoomPan.ts` (neu)
- `src/components/bracket/ZoomIndicator.tsx` (neu)

---

### US-14.9: Legende im Mockup-Design (LOW)

**Als** neuer Zuschauer  
**möchte ich** eine Legende die alle Farben erklärt  
**sodass** ich das Bracket sofort verstehe

**Akzeptanzkriterien:**
1. Legende unterhalb des Brackets, `--night` BG, 8px Border-Radius
2. Flex-Layout mit 20px Gap, Wrapping erlaubt
3. Line-Items: 20px × 2px farbige Linie + Text
4. Color-Items: 14px × 14px Quadrat mit Border + Text
5. Einträge: Qualifikation (Cyan), Winner Bracket (Grün), Loser Bracket (Rot), Grand Finale (Gold), Platz 1+2 (Grün BG), Platz 3+4 (Rot BG), 3x = 3-Pilot Heat

**Betroffene Dateien:**
- `src/components/bracket/BracketLegend.tsx` - Rewrite

---

### US-14.10: Dynamische Skalierung für alle Pilotenzahlen (HIGH)

**Als** Turnierleiter  
**möchte ich** dass das Layout für 8-60 Piloten funktioniert  
**sodass** ich beliebig große Turniere veranstalten kann

**Akzeptanzkriterien:**
1. Container-Breite berechnet sich aus: max(WB-Breite, LB-Breite) + Gap + Padding
2. WB-Breite = (Heats in R1) × Heat-Width + (Heats-1) × Gap
3. LB-Breite = (max Heats in einer Runde) × Heat-Width + (Heats-1) × Gap
4. Runden-Anzahl dynamisch aus Pilotenzahl berechnet
5. Heat-Anzahl pro Runde dynamisch berechnet
6. 3er-Heats wenn Pilotenzahl nicht glatt durch 4 teilbar
7. SVG-Linien berechnen sich aus DOM-Positionen (keine Hardcoding)
8. Getestet mit: 8, 12, 15, 16, 24, 27, 32, 48, 60 Piloten

**Betroffene Dateien:**
- `src/lib/bracket-layout-calculator.ts` (neu)
- `src/components/bracket/BracketTree.tsx` - Layout-Logik

---

## Implementierungsreihenfolge

### Phase 1: Foundation (US-14.1, US-14.10)
- CSS-Variablen / Design-Tokens definieren
- Bracket-Layout-Calculator implementieren
- Bracket-Container Grundstruktur

### Phase 2: Sections (US-14.2, US-14.3, US-14.4)
- Qualifikations-Section
- Winner Bracket Section (ohne Linien)
- Loser Bracket Section (mit Pool-Indicators)

### Phase 3: Heat-Boxes (US-14.5)
- Heat-Box Redesign exakt nach Mockup
- Pilot-Rows mit Farbcodierung
- Rank-Badges

### Phase 4: SVG-System (US-14.6)
- ConnectorManager implementieren
- WB-Verbindungen
- GF-Verbindung

### Phase 5: Grand Finale & Polish (US-14.7, US-14.8, US-14.9)
- Grand Finale Section
- Zoom & Pan
- Legende

---

## Technische Umsetzungshinweise

### SVG-Connector Architektur

```typescript
// src/lib/svg-connector-manager.ts
interface Connection {
  fromId: string | string[]  // single oder merge
  toId: string
  type: 'wb' | 'lb' | 'gf'
  isMerge?: boolean
  isGrandFinale?: boolean
}

class ConnectorManager {
  private svg: SVGSVGElement
  private container: HTMLElement
  private connections: Connection[] = []
  
  getRelativePosition(element: HTMLElement): Position
  createPath(from: Position, to: Position, type: string): SVGPathElement
  createMergePath(from: Position[], to: Position, type: string): SVGGElement
  createGrandFinalePath(wb: Position, lb: Position, gf: Position): SVGGElement
  redraw(): void
  debouncedRedraw(): void
}
```

### Layout-Calculator

```typescript
// src/lib/bracket-layout-calculator.ts
interface BracketDimensions {
  containerWidth: number
  wbColumnWidth: number
  lbColumnWidth: number
  qualiWidth: number
  heatsPerRound: { wb: number[], lb: number[] }
  roundLabels: { wb: string[], lb: string[] }
}

function calculateBracketDimensions(pilotCount: number): BracketDimensions
function calculateHeatWidth(pilotCount: 3 | 4): number
```

### Zoom/Pan State

```typescript
// src/hooks/useZoomPan.ts
interface ZoomPanState {
  scale: number
  translateX: number
  translateY: number
}

function useZoomPan(options: {
  minScale: number
  maxScale: number
  step: number
}): {
  state: ZoomPanState
  handlers: EventHandlers
  reset: () => void
}
```

---

## Betroffene Dateien - Vollständige Liste

### Neue Dateien:

| Datei | Zweck |
|-------|-------|
| `src/components/bracket/sections/QualiSection.tsx` | Qualifikations-Section |
| `src/components/bracket/ZoomIndicator.tsx` | Zoom-Controls UI |
| `src/hooks/useZoomPan.ts` | Zoom/Pan State & Handler |
| `src/lib/svg-connector-manager.ts` | SVG-Linien Logik |
| `src/lib/bracket-layout-calculator.ts` | Layout-Berechnungen |

### Zu überarbeitende Dateien:

| Datei | Änderungsart |
|-------|--------------|
| `src/components/bracket/BracketTree.tsx` | Komplett Rewrite (Container, Zoom-Wrapper) |
| `src/components/bracket/SVGConnectorLines.tsx` | Komplett Rewrite (ConnectorManager nutzen) |
| `src/components/bracket/sections/WinnerBracketSection.tsx` | Komplett Rewrite (Runden-Layout) |
| `src/components/bracket/sections/LoserBracketSection.tsx` | Komplett Rewrite (Pool-Indicators) |
| `src/components/bracket/sections/GrandFinaleSection.tsx` | Komplett Rewrite (Positionierung, Design) |
| `src/components/bracket/sections/GrandFinaleHeatBox.tsx` | Komplett Rewrite (4 Piloten, Tags) |
| `src/components/bracket/heat-boxes/BracketHeatBox.tsx` | Signifikantes Rewrite (Mockup-Styling) |
| `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx` | Signifikantes Rewrite |
| `src/components/bracket/BracketLegend.tsx` | Rewrite (Mockup-Design) |
| `src/components/bracket/PoolDisplay.tsx` | Anpassen (Pool-Indicator Style) |
| `src/globals.css` | Neue CSS-Variablen hinzufügen |

### Zu aktualisierende Tests:

| Datei | Änderung |
|-------|----------|
| `tests/svg-connector-lines.test.tsx` | Neue ConnectorManager Tests |
| `tests/bracket-responsive.test.tsx` | Zoom/Pan Tests |
| `tests/unified-layout.test.tsx` | Neues Layout testen |
| `tests/pool-display-consolidated.test.tsx` | Pool-Indicator Style |

---

## Abgrenzung zu Epic 13

| Aspekt | Epic 13 (Logik) | Epic 14 (Visuell) |
|--------|-----------------|-------------------|
| **Fokus** | Runden-basierte Bracket-Logik, Store-Änderungen | 1:1 Mockup-Umsetzung, Styling, Layout |
| **Grand Finale** | 4 Piloten Logik, Rematch-Regel | 4 Piloten UI, WB/LB Tags, Positionierung |
| **SVG-Linien** | - | ConnectorManager, dynamische Berechnung |
| **Zoom/Pan** | - | Komplette Implementierung |
| **Pool-System** | LB bleibt Pool-basiert | Pool-Indicator UI |
| **Kann parallel?** | Teilweise - Datenmodell-Änderungen zuerst | Ja, nachdem Datenmodell steht |

---

## Abhängigkeiten

1. **Epic 13** - Datenmodell-Änderungen müssen zuerst erfolgen:
   - `roundNumber` Feld auf Heats
   - 4 Piloten Grand Finale
   - `bracketOrigin` für WB/LB Tags
   
2. **Kann parallel starten:**
   - CSS-Variablen / Design-Tokens
   - Heat-Box Styling (unabhängig von Logik)
   - Zoom/Pan Funktionalität
   - Layout-Calculator (basiert auf Pilotenzahl, nicht Store-Struktur)

---

## Geschätzter Aufwand

| Phase | Stories | Aufwand |
|-------|---------|---------|
| Phase 1: Foundation | US-14.1, US-14.10 | 1-2 Tage |
| Phase 2: Sections | US-14.2, US-14.3, US-14.4 | 2-3 Tage |
| Phase 3: Heat-Boxes | US-14.5 | 1-2 Tage |
| Phase 4: SVG-System | US-14.6 | 2-3 Tage |
| Phase 5: GF & Polish | US-14.7, US-14.8, US-14.9 | 2-3 Tage |
| **GESAMT** | 10 Stories | **8-13 Tage** |

---

## Risiken und Mitigationen

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| SVG-Linien Performance bei vielen Heats | Mittel | Debouncing, nur sichtbare Linien rendern |
| Zoom/Pan Konflikte mit anderen Events | Niedrig | Event-Capturing richtig konfigurieren |
| Layout-Bruch bei Edge-Case Pilotenzahlen | Mittel | Extensive Tests mit ungeraden Zahlen |
| Abweichungen vom Mockup | Niedrig | Pixel-genaue Vergleiche während Entwicklung |

---

## Acceptance Test Plan

1. **Visueller Vergleich:** Screenshot-Vergleich Mockup vs. Implementation für 32 Piloten
2. **Skalierbarkeit:** Layout-Test mit 8, 15, 27, 48 Piloten
3. **Zoom/Pan:** Manuelle Tests auf verschiedenen Geräten
4. **SVG-Linien:** Automatische Tests dass Linien DOM-Positionen korrekt referenzieren
5. **Responsive:** Test auf 1920px, 1440px, 1280px Breite
