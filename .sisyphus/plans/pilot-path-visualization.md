# Pilot Path Visualization Toggle

## TL;DR

> **Quick Summary**: Toggle-Feature zum Visualisieren der Pilot-Reise durch das gesamte Turnier mit verbindenden Bezier-Kurven, Pfeilspitzen und X-Markern für eliminierte Piloten.
> 
> **Deliverables**:
> - `SVGPilotPaths.tsx` - Neuer SVG-Layer für Pilot-Pfade
> - `PilotPathToggle.tsx` - Radix UI Switch Toggle-Komponente
> - `pilot-path-manager.ts` - Pfad-Berechnung und Farbzuweisung
> - Store-Erweiterung: `showPilotPaths` State
> - Test-Suite: 6 Test-Dateien (TDD)
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 5 → Task 6

---

## Context

### Original Request
User möchte einen Toggle, um die Reise jedes Piloten durch das Turnier zu visualisieren. Filigrane Bezier-Kurven mit Pfeilspitzen zeigen, von welchem Heat ein Pilot kommt und wohin er geht. Bei Hover wird ein Pilot-Pfad hervorgehoben, andere verblassen.

### Interview Summary
**Key Discussions**:
- **Linien-Stil**: Bezier-Kurven (sanft gebogen), dünn und filigran
- **Pfeilspitzen**: Kleine Pfeilspitzen am Linien-Ende
- **Eliminierte Piloten**: X-Marker statt Pfeilspitze
- **Farben**: Synthwave-Palette, jeder Pilot eine fixe Farbe (durchgehend)
- **Hover**: Pfad hervorheben, andere verblassen
- **Toggle-Position**: Schwebendes UI-Element neben Zoom-Buttons (bottom-right)
- **Layer**: Separater SVG-Layer (zIndex: 2, über Heat-Connectors)
- **Umfang**: Quali → WB → LB → Grand Finale (inkl. Rematch)
- **Tests**: TDD mit bun test

**Research Findings**:
- `SVGConnectorLines.tsx` existiert mit `ConnectorManager` Pattern (zIndex: 1)
- `getRelativePosition()` für Koordinaten-Berechnung verfügbar
- `getPilotJourney(pilotId)` liefert bereits alle Heats eines Piloten
- Synthwave-Farben in `tailwind.config.js`: neon-pink, neon-cyan, neon-magenta, gold, winner-green, loser-red, live-orange
- `ZoomIndicator.tsx` als Positionierungsreferenz für Toggle

### Metis Review
**Identified Gaps** (addressed):

| Gap | Resolution |
|-----|------------|
| Pfad-Berechnungs-Scope unklar | **Default**: Komplette Journey (alle Heats, nicht aggregiert) |
| Wo erscheint X-Marker | **Default**: Am letzten Heat des eliminierten Piloten |
| Pfeilrichtung | **Default**: Immer vorwärts (chronologisch), Rematch = normales Segment |
| Hover-Trigger-Element | **Default**: Hover auf Pfad-Linie selbst (nicht auf Pilot-Namen in Heat-Boxen) |
| Persistence-Level | **Default**: LocalStorage via Zustand persist (überlebt Refresh) |
| Real-time Updates | **Default**: Nur completed Heats (Pfad wächst mit Turnier-Fortschritt) |
| Farbpalette-Erschöpfung | Farb-Rotation mit Modulo (Pilot 8 = Farbe 1, etc.) |
| Performance 60 Piloten | CSS-basiertes Fade via `:not(.highlighted)`, kein JS-Loop |

---

## Work Objectives

### Core Objective
Toggle-basierte Visualisierung der Pilot-Pfade durch alle Turnier-Phasen mit interaktivem Hover-Highlighting.

### Concrete Deliverables
- `src/components/bracket/SVGPilotPaths.tsx` - SVG-Layer-Komponente
- `src/components/bracket/PilotPathToggle.tsx` - Toggle-UI-Komponente
- `src/lib/pilot-path-manager.ts` - Pure Functions für Pfad-Berechnung
- Store-Extension in `tournamentStore.ts`
- 6 Test-Dateien in `tests/`

### Definition of Done
- [ ] `bun test` → alle neuen Tests PASS
- [ ] Toggle zeigt/versteckt Pilot-Pfade korrekt
- [ ] Bezier-Kurven mit Pfeilspitzen gerendert
- [ ] X-Marker bei eliminierten Piloten
- [ ] Hover hebt einen Pfad hervor, andere verblassen
- [ ] Performance bei 32 Piloten < 500ms Render-Zeit

### Must Have
- Separater SVG-Layer (zIndex: 2)
- Bezier-Kurven (SVG `Q` oder `C` Commands)
- Pfeilspitzen via SVG `<marker>`
- X-Marker für eliminierte Piloten
- Hover-basiertes Highlighting
- Toggle persistent in localStorage
- TDD für alle Komponenten

### Must NOT Have (Guardrails)
- KEINE Modifikation von `SVGConnectorLines.tsx` oder `ConnectorManager`
- KEINE Modifikation der Heat-Connector-Farben/Logik
- KEINE neuen Farben außerhalb der Synthwave-Palette
- KEINE Click-Interaktionen (nur Hover)
- KEINE Animation-Bibliotheken (kein GSAP, kein Framer Motion)
- KEINE Filter-UI ("zeige nur Top 4 Piloten")
- KEINE zufälligen Farbzuweisungen (deterministische Zuweisung)
- KEINE Hover-Handler auf Pilot-Namen in Heat-Boxen (nur auf Pfad-Linien)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (19 Test-Dateien, bun test)
- **User wants tests**: TDD
- **Framework**: bun test (Vitest-kompatibel)

### TDD Workflow

Jede Task folgt RED-GREEN-REFACTOR:

1. **RED**: Test schreiben, der fehlschlägt
2. **GREEN**: Minimale Implementation um Test zu bestehen
3. **REFACTOR**: Code aufräumen, Tests bleiben grün

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Pure Functions (calculatePilotPath, assignPilotColor)
└── Task 4: Store Extension (showPilotPaths State)

Wave 2 (After Wave 1):
├── Task 2: SVG Rendering (SVGPilotPaths Component)
└── Task 5: Toggle UI (PilotPathToggle Component)

Wave 3 (After Wave 2):
├── Task 3: Hover Interaction (CSS-based Highlighting)
└── Task 6: Integration & Edge Cases

Critical Path: Task 1 → Task 2 → Task 3 → Task 6
Parallel Speedup: ~35% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | 4 |
| 2 | 1 | 3, 6 | 5 |
| 3 | 2 | 6 | 5 (after 2) |
| 4 | None | 5 | 1 |
| 5 | 4 | 6 | 2, 3 |
| 6 | 2, 3, 5 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 4 | `delegate_task(category="quick", load_skills=[], run_in_background=true)` |
| 2 | 2, 5 | `delegate_task(category="visual-engineering", load_skills=["frontend-ui-ux"], ...)` |
| 3 | 3, 6 | `delegate_task(category="quick", load_skills=[], ...)` |

---

## TODOs

- [ ] 1. Pure Functions: Pfad-Berechnung und Farbzuweisung

  **What to do**:
  - Erstelle `src/lib/pilot-path-manager.ts`
  - Implementiere `calculatePilotPath(pilotId: string, heats: Heat[]): PathSegment[]`
    - Filtere Heats: `heat.pilotIds.includes(pilotId) && heat.status === 'completed'`
    - Sortiere nach `heatNumber` für chronologische Reihenfolge
    - Return Array von `PathSegment` mit `{ fromHeatId, toHeatId, isElimination }`
  - Implementiere `assignPilotColor(pilotId: string, allPilotIds: string[]): string`
    - Deterministische Zuweisung basierend auf Index in `allPilotIds`
    - Farb-Rotation: `SYNTHWAVE_COLORS[index % SYNTHWAVE_COLORS.length]`
  - Implementiere `isEliminatedInHeat(pilotId: string, heat: Heat): boolean`
    - True wenn Pilot Rank 3 oder 4 in LB-Heat
  - Definiere Synthwave-Farbpalette als Konstante:
    ```typescript
    const SYNTHWAVE_COLORS = [
      '#ff2a6d', // neon-pink
      '#05d9e8', // neon-cyan
      '#d300c5', // neon-magenta
      '#f9c80e', // gold
      '#39ff14', // winner-green
      '#ff6b00', // live-orange
      '#c0c0c0', // silver
    ]
    ```

  **Must NOT do**:
  - Keine DOM-Manipulation (pure functions only)
  - Keine zufälligen Farbzuweisungen
  - Keine Farben außerhalb SYNTHWAVE_COLORS

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure TypeScript logic, no UI, klar definierte Ein-/Ausgaben
  - **Skills**: `[]`
    - Keine speziellen Skills nötig für pure functions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 4)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/lib/bracket-logic.ts:getPilotBracketOrigin()` - Beispiel für Pilot-Historie-Berechnung
  - `src/stores/tournamentStore.ts:getPilotJourney()` - Bestehendes Pattern für Pilot-Heat-Filterung

  **API/Type References**:
  - `src/types/tournament.ts:Heat` - Heat Interface mit pilotIds, status, bracketType

  **Test References**:
  - `tests/heat-completion.test.ts` - Pattern für pure function testing

  **Documentation References**:
  - `tailwind.config.js:22-47` - Synthwave-Farbdefinitionen

  **WHY Each Reference Matters**:
  - `getPilotBracketOrigin()` zeigt wie man Pilot-Historie aus heats[] berechnet
  - `getPilotJourney()` ist fast das was wir brauchen, aber ohne Segment-Berechnung
  - Die Farbwerte in tailwind.config.js sind die Single Source of Truth für Synthwave-Farben

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `tests/pilot-path-calculation.test.ts`
  - [ ] Test: `calculatePilotPath` returns empty array for pilot with no completed heats
  - [ ] Test: `calculatePilotPath` returns correct segments for 3-heat journey
  - [ ] Test: `calculatePilotPath` marks last segment as elimination for LB rank 3/4
  - [ ] Test: `assignPilotColor` returns same color for same pilot on repeated calls
  - [ ] Test: `assignPilotColor` rotates through palette (pilot 8 = color 1)
  - [ ] Test: All colors in SYNTHWAVE_COLORS match tailwind.config.js values
  - [ ] `bun test tests/pilot-path-calculation.test.ts` → PASS

  **Automated Verification:**
  ```bash
  bun test tests/pilot-path-calculation.test.ts
  # Assert: 7+ tests pass
  # Assert: 0 failures
  ```

  **Commit**: YES
  - Message: `feat(bracket): add pilot path calculation and color assignment`
  - Files: `src/lib/pilot-path-manager.ts`, `tests/pilot-path-calculation.test.ts`
  - Pre-commit: `bun test tests/pilot-path-calculation.test.ts`

---

- [ ] 2. SVG Rendering: SVGPilotPaths Komponente

  **What to do**:
  - Erstelle `src/components/bracket/SVGPilotPaths.tsx`
  - SVG-Element mit:
    - `position: absolute`, `zIndex: 2` (über Heat-Connectors)
    - `pointerEvents: 'none'` auf SVG, `pointerEvents: 'auto'` auf `<path>` Elementen
  - Definiere `<defs>` mit:
    - `<marker id="pilot-arrow">` für Pfeilspitzen
    - `<marker id="pilot-x">` für Elimination-Marker (X-Form)
  - Für jeden Pilot mit completed heats:
    - Berechne Pfad-Segmente via `calculatePilotPath()`
    - Hole Farbe via `assignPilotColor()`
    - Rendere Bezier-Kurve via SVG `Q` Command
    - Setze `marker-end="url(#pilot-arrow)"` oder `url(#pilot-x)` basierend auf `isElimination`
  - Jeder `<path>` bekommt:
    - `data-pilot-id` Attribut
    - `stroke` = zugewiesene Farbe
    - `stroke-width="1.5"` (filigran)
    - `fill="none"`
    - `opacity="0.6"` (default, nicht-hover Zustand)
  - Nutze `ConnectorManager.getRelativePosition()` Pattern für Koordinaten
  - Props Interface:
    ```typescript
    interface SVGPilotPathsProps {
      heats: Heat[]
      pilots: Pilot[]
      containerRef: React.RefObject<HTMLDivElement>
      scale?: number
      visible: boolean
    }
    ```

  **Must NOT do**:
  - Keine Modifikation von SVGConnectorLines.tsx
  - Keine CSS Animations (nur Transitions für Hover)
  - Keine geraden Linien (muss Bezier sein)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: SVG-Rendering, visuelles Component, requires spatial thinking
  - **Skills**: `["frontend-ui-ux"]`
    - `frontend-ui-ux`: SVG Path-Generierung und visuelles Polish

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave 1)
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: Tasks 3, 6
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/components/bracket/SVGConnectorLines.tsx:110-246` - SVG Layer Struktur (absolute positioning, zIndex, lifecycle)
  - `src/lib/svg-connector-manager.ts:141-160` - `getRelativePosition()` für Koordinaten-Berechnung mit Scale-Kompensation
  - `src/lib/svg-connector-manager.ts:166-191` - `createPath()` für SVG Path-Erstellung

  **API/Type References**:
  - `src/components/bracket/SVGConnectorLines.tsx:93-100` - Props Interface Pattern
  - `src/lib/svg-connector-manager.ts:19-28` - Position Interface

  **Test References**:
  - `tests/finale-ceremony.test.tsx` - Pattern für Component-Testing mit DOM-Assertions

  **External References**:
  - MDN SVG `<marker>`: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
  - MDN SVG Path `Q` Command: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#curve_commands

  **WHY Each Reference Matters**:
  - `SVGConnectorLines.tsx` zeigt exakt das Pattern das wir nachahmen (100ms init delay, resize handler, scale compensation)
  - `getRelativePosition()` ist die existierende Utility für Container-relative Koordinaten
  - MDN Marker-Docs sind essentiell für Pfeilspitzen-Implementation

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `tests/pilot-path-rendering.test.tsx`
  - [ ] Test: SVGPilotPaths renders null when `visible=false`
  - [ ] Test: SVGPilotPaths renders SVG element when `visible=true`
  - [ ] Test: SVG has `zIndex: 2` style
  - [ ] Test: `<marker id="pilot-arrow">` exists in defs
  - [ ] Test: `<marker id="pilot-x">` exists in defs
  - [ ] Test: `<path>` elements have `data-pilot-id` attribute
  - [ ] Test: Path `d` attribute contains `Q` command (Bezier)
  - [ ] `bun test tests/pilot-path-rendering.test.tsx` → PASS

  **Automated Verification:**
  ```bash
  bun test tests/pilot-path-rendering.test.tsx
  # Assert: 8+ tests pass
  # Assert: 0 failures
  ```

  **Commit**: YES
  - Message: `feat(bracket): add SVGPilotPaths component with bezier curves`
  - Files: `src/components/bracket/SVGPilotPaths.tsx`, `tests/pilot-path-rendering.test.tsx`
  - Pre-commit: `bun test tests/pilot-path-rendering.test.tsx`

---

- [ ] 3. Hover Interaction: CSS-basiertes Highlighting

  **What to do**:
  - Erweitere `SVGPilotPaths.tsx` mit Hover-Logik:
    - State: `hoveredPilotId: string | null`
    - `onMouseEnter` auf `<path>`: setze `hoveredPilotId`
    - `onMouseLeave` auf `<path>`: setze `hoveredPilotId = null`
  - CSS-Klassen für Zustände:
    - `.pilot-path` - Basis-Klasse für alle Pfade
    - `.pilot-path-highlighted` - wenn dieser Pfad gehovert ist
    - `.pilot-path-faded` - wenn ein ANDERER Pfad gehovert ist
  - Styling:
    - Default: `opacity: 0.6`
    - Highlighted: `opacity: 1`, `stroke-width: 2.5`
    - Faded: `opacity: 0.15`
  - Transitions: `transition: opacity 150ms, stroke-width 150ms`
  - Debounce: 50ms auf hover events (verhindert Flackern)

  **Must NOT do**:
  - Keine JavaScript-Loops für opacity-Änderungen (CSS-basiert)
  - Keine Hover auf Pilot-Namen in Heat-Boxen
  - Keine Click-Handler

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: CSS/JS Interaction, klar definierte States
  - **Skills**: `[]`
    - Keine speziellen Skills, standard React State/CSS

  **Parallelization**:
  - **Can Run In Parallel**: NO (requires Task 2)
  - **Parallel Group**: Wave 2.5 (after Task 2, parallel with Task 5)
  - **Blocks**: Task 6
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `src/components/pilot-card.tsx` - `useState` für lokale UI-Toggles wie `isEditing`
  - `tailwind.config.js:91-97` - Animation/Transition Patterns

  **API/Type References**:
  - React `onMouseEnter`/`onMouseLeave` Events

  **Test References**:
  - `tests/pilot-card.test.tsx` - Pattern für Interaction-Testing

  **WHY Each Reference Matters**:
  - `pilot-card.tsx` zeigt das Pattern für lokalen UI-State mit useState
  - Die transition-durations in tailwind.config.js zeigen die Standard-Timings im Projekt

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `tests/pilot-path-hover.test.tsx`
  - [ ] Test: Hovering path adds `pilot-path-highlighted` class
  - [ ] Test: Non-hovered paths have `pilot-path-faded` class when one is hovered
  - [ ] Test: Hover state clears on mouse leave (all paths back to default)
  - [ ] Test: Hover debounced by 50ms (rapid enter/leave doesn't flicker)
  - [ ] `bun test tests/pilot-path-hover.test.tsx` → PASS

  **Automated Verification:**
  ```bash
  bun test tests/pilot-path-hover.test.tsx
  # Assert: 4+ tests pass
  # Assert: 0 failures
  ```

  **Commit**: YES
  - Message: `feat(bracket): add hover highlighting for pilot paths`
  - Files: `src/components/bracket/SVGPilotPaths.tsx` (update), `tests/pilot-path-hover.test.tsx`
  - Pre-commit: `bun test tests/pilot-path-hover.test.tsx`

---

- [ ] 4. Store Extension: showPilotPaths State

  **What to do**:
  - Erweitere `INITIAL_TOURNAMENT_STATE` in `tournamentStore.ts`:
    ```typescript
    showPilotPaths: false,
    ```
  - Erweitere `TournamentState` Interface:
    ```typescript
    showPilotPaths: boolean
    togglePilotPaths: () => void
    ```
  - Implementiere Action:
    ```typescript
    togglePilotPaths: () => {
      set({ showPilotPaths: !get().showPilotPaths })
    },
    ```
  - State wird automatisch via `persist` Middleware in localStorage gespeichert
  - NICHT in `performReset()` resetten (Toggle-Preference soll erhalten bleiben)

  **Must NOT do**:
  - Nicht in INITIAL_TOURNAMENT_STATE resetten
  - Keine separate localStorage-Logik (persist middleware handles it)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Einfache Store-Erweiterung, klares Pattern
  - **Skills**: `[]`
    - Standard Zustand Pattern, keine speziellen Skills

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/stores/tournamentStore.ts:22-47` - `INITIAL_TOURNAMENT_STATE` für neue Properties
  - `src/stores/tournamentStore.ts:187-189` - `persist` Middleware Setup

  **Test References**:
  - `tests/reset-functions.test.ts` - Pattern für Store-Testing mit `renderHook` und `act()`

  **WHY Each Reference Matters**:
  - `INITIAL_TOURNAMENT_STATE` zeigt wo neue State-Properties hinzugefügt werden
  - Die persist middleware in Zeile 188 sorgt automatisch für localStorage-Sync

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `tests/pilot-path-toggle.test.ts`
  - [ ] Test: `showPilotPaths` defaults to `false`
  - [ ] Test: `togglePilotPaths()` switches state from false to true
  - [ ] Test: `togglePilotPaths()` switches state from true to false
  - [ ] Test: `showPilotPaths` NOT reset by `performReset()`
  - [ ] Test: `showPilotPaths` persists in localStorage (survives store re-init)
  - [ ] `bun test tests/pilot-path-toggle.test.ts` → PASS

  **Automated Verification:**
  ```bash
  bun test tests/pilot-path-toggle.test.ts
  # Assert: 5+ tests pass
  # Assert: 0 failures
  ```

  **Commit**: YES
  - Message: `feat(store): add showPilotPaths toggle state`
  - Files: `src/stores/tournamentStore.ts`, `tests/pilot-path-toggle.test.ts`
  - Pre-commit: `bun test tests/pilot-path-toggle.test.ts`

---

- [ ] 5. Toggle UI: PilotPathToggle Komponente

  **What to do**:
  - Erstelle `src/components/bracket/PilotPathToggle.tsx`
  - Nutze `@radix-ui/react-switch` für Toggle
  - Styling (Synthwave-Theme):
    ```tsx
    <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 
                    bg-night/90 border border-neon-cyan/30 rounded-lg px-3 py-2">
      <span className="text-sm text-steel">Pilot-Pfade</span>
      <Switch.Root 
        checked={showPilotPaths} 
        onCheckedChange={togglePilotPaths}
        className="..."
      >
        <Switch.Thumb className="..." />
      </Switch.Root>
    </div>
    ```
  - Position: `bottom-20` (über ZoomIndicator, der bei `bottom-4` ist)
  - Verbinde mit Store:
    ```typescript
    const { showPilotPaths, togglePilotPaths } = useTournamentStore()
    ```
  - Rendere in `BracketTree.tsx` neben ZoomIndicator

  **Must NOT do**:
  - Keine Modifikation von ZoomIndicator.tsx
  - Keine eigene Toggle-Implementation (nutze Radix UI)
  - Keine inline styles für Farben (nutze Tailwind-Klassen)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI-Komponente mit Synthwave-Styling
  - **Skills**: `["frontend-ui-ux"]`
    - `frontend-ui-ux`: Radix UI Switch Styling, Synthwave-Theme-Anpassung

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 4)
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Task 6
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `src/components/bracket/ZoomIndicator.tsx` - Positionierung und Styling-Pattern für floating UI
  - `src/components/reset-confirmation-dialog.tsx` - Checkbox-Pattern (ähnlich zu Switch)

  **API/Type References**:
  - Radix UI Switch: https://www.radix-ui.com/primitives/docs/components/switch

  **Test References**:
  - `tests/app-footer.test.tsx` - Pattern für einfache UI-Component-Tests

  **WHY Each Reference Matters**:
  - `ZoomIndicator.tsx` zeigt die exakte Position (bottom-right) und das Styling-Pattern
  - Radix UI Switch Docs zeigen das API für checked/onCheckedChange

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `tests/pilot-path-toggle-ui.test.tsx`
  - [ ] Test: Toggle renders with "Pilot-Pfade" label
  - [ ] Test: Toggle reflects `showPilotPaths` state from store
  - [ ] Test: Clicking toggle calls `togglePilotPaths()`
  - [ ] Test: Toggle has correct Tailwind classes for positioning
  - [ ] `bun test tests/pilot-path-toggle-ui.test.tsx` → PASS

  **Automated Verification:**
  ```bash
  bun test tests/pilot-path-toggle-ui.test.tsx
  # Assert: 4+ tests pass
  # Assert: 0 failures
  ```

  **Commit**: YES
  - Message: `feat(bracket): add PilotPathToggle UI component`
  - Files: `src/components/bracket/PilotPathToggle.tsx`, `tests/pilot-path-toggle-ui.test.tsx`
  - Pre-commit: `bun test tests/pilot-path-toggle-ui.test.tsx`

---

- [ ] 6. Integration & Edge Cases

  **What to do**:
  - Integriere `SVGPilotPaths` und `PilotPathToggle` in `BracketTree.tsx`:
    ```tsx
    {/* Nach SVGConnectorLines */}
    <SVGPilotPaths 
      heats={heats} 
      pilots={pilots}
      containerRef={containerRef}
      scale={scale}
      visible={showPilotPaths}
    />
    
    {/* Neben ZoomIndicator */}
    <PilotPathToggle />
    ```
  - Teste Edge Cases:
    - Pilot mit `droppedOut: true` (Pfad endet bei letztem Heat vor Dropout)
    - Grand Finale mit Rematch (Pfad geht GF → Rematch → Final Position)
    - Quali-Heat mit 3 vs 4 Piloten (Pfad-Ursprung korrekt)
    - Zoom/Pan bei 50% und 200% (Pfade skalieren korrekt)
    - 32-Piloten-Turnier (Performance < 500ms)
  - Füge `scale` Handling hinzu (wie in SVGConnectorLines)
  - Handle `disabled` prop wenn Victory Ceremony aktiv

  **Must NOT do**:
  - Keine Breaking Changes an BracketTree Layout
  - Keine Änderungen an Heat-Rendering-Logik

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Integration-Task, zusammenführen der bereits implementierten Teile
  - **Skills**: `[]`
    - Keine speziellen Skills, standard React Integration

  **Parallelization**:
  - **Can Run In Parallel**: NO (final integration)
  - **Parallel Group**: Wave 3 (final)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 2, 3, 5

  **References**:

  **Pattern References**:
  - `src/components/bracket/BracketTree.tsx` - Integration Point für neue Komponenten
  - `src/components/bracket/SVGConnectorLines.tsx:98-99` - `disabled` Prop Pattern für Victory Ceremony

  **Test References**:
  - `tests/eight-pilots-flow.test.ts` - Pattern für End-to-End Flow Testing
  - `tests/grand-finale-4-piloten.test.ts` - Grand Finale Edge Cases

  **WHY Each Reference Matters**:
  - `BracketTree.tsx` ist der Integrationsort, hier werden SVGPilotPaths und PilotPathToggle eingebunden
  - Das `disabled` Pattern zeigt wie man Victory Ceremony handled

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `tests/pilot-path-integration.test.tsx`
  - [ ] Test: Toggle on → SVGPilotPaths visible
  - [ ] Test: Toggle off → SVGPilotPaths hidden
  - [ ] Test: Paths scale correctly at 200% zoom
  - [ ] Test: Paths hidden during Victory Ceremony (disabled state)
  - [ ] Test: Dropped-out pilot's path ends at last heat
  - [ ] Test: Rematch path renders correctly after Grand Finale
  - [ ] `bun test tests/pilot-path-integration.test.tsx` → PASS

  **Performance Verification:**
  ```bash
  # Agent runs:
  bun test tests/pilot-path-integration.test.tsx
  # Assert: 7+ tests pass
  # Assert: Performance test verifies < 500ms render for 32 pilots
  ```

  **Commit**: YES
  - Message: `feat(bracket): integrate pilot path visualization in BracketTree`
  - Files: `src/components/bracket/BracketTree.tsx`, `tests/pilot-path-integration.test.tsx`
  - Pre-commit: `bun test tests/pilot-path-integration.test.tsx`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(bracket): add pilot path calculation and color assignment` | pilot-path-manager.ts, test | `bun test tests/pilot-path-calculation.test.ts` |
| 2 | `feat(bracket): add SVGPilotPaths component with bezier curves` | SVGPilotPaths.tsx, test | `bun test tests/pilot-path-rendering.test.tsx` |
| 3 | `feat(bracket): add hover highlighting for pilot paths` | SVGPilotPaths.tsx, test | `bun test tests/pilot-path-hover.test.tsx` |
| 4 | `feat(store): add showPilotPaths toggle state` | tournamentStore.ts, test | `bun test tests/pilot-path-toggle.test.ts` |
| 5 | `feat(bracket): add PilotPathToggle UI component` | PilotPathToggle.tsx, test | `bun test tests/pilot-path-toggle-ui.test.tsx` |
| 6 | `feat(bracket): integrate pilot path visualization in BracketTree` | BracketTree.tsx, test | `bun test tests/pilot-path-integration.test.tsx` |

---

## Success Criteria

### Verification Commands
```bash
# Full test suite for new feature
bun test tests/pilot-path-*.test.ts tests/pilot-path-*.test.tsx

# Expected: 35+ tests, 0 failures

# Type check
bun run typecheck

# Build check
bun run build
```

### Final Checklist
- [ ] All "Must Have" present:
  - [ ] Separater SVG-Layer mit zIndex: 2
  - [ ] Bezier-Kurven in allen Pfaden
  - [ ] Pfeilspitzen bei normalen Segmenten
  - [ ] X-Marker bei Elimination
  - [ ] Hover-Highlighting funktioniert
  - [ ] Toggle in localStorage persistiert
  - [ ] Alle Tests grün (TDD)
- [ ] All "Must NOT Have" absent:
  - [ ] SVGConnectorLines.tsx unverändert
  - [ ] Keine neuen Farben außerhalb Synthwave
  - [ ] Keine Click-Handler auf Pfaden
  - [ ] Keine Animation-Libraries
- [ ] Performance:
  - [ ] 32-Piloten-Turnier rendert < 500ms
  - [ ] Hover-State-Wechsel < 100ms
