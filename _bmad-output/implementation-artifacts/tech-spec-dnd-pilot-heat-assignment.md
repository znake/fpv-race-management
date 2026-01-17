---
title: 'Drag & Drop Piloten-Zuweisung in Heat-Assignment-View'
slug: 'dnd-pilot-heat-assignment'
created: '2026-01-16'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['React 18.3', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand', '@dnd-kit/core@6']
files_to_modify: ['src/components/heat-assignment-view.tsx', 'src/components/ui/heat-card.tsx', 'src/stores/tournamentStore.ts', 'tests/heat-assignment.test.ts', 'tests/dnd-pilot-move.test.tsx']
code_patterns: ['Zustand Store mit persist middleware', 'Tailwind Synthwave Theme', 'HeatCard variant-basiertes Rendering']
test_patterns: ['Vitest + React Testing Library', 'renderHook für Store-Tests', '.test.tsx für Komponenten-Tests']
---

# Tech-Spec: Drag & Drop Piloten-Zuweisung in Heat-Assignment-View

**Created:** 2026-01-16

## Overview

### Problem Statement

Aktuell muss der User in der Heat-Assignment-View erst auf "Piloten tauschen" klicken, um in einen Swap-Modus zu gelangen. Dann müssen zwei Piloten nacheinander angeklickt werden, um sie zu tauschen. Das ist umständlich und unintuiv - besonders wenn man mehrere Piloten umverteilen möchte.

### Solution

Drag & Drop direkt aktivieren (immer an, kein Button-Klick nötig). Piloten können zwischen Heats gezogen werden - sie werden immer zum Ziel-Heat hinzugefügt (kein automatischer Swap). Wenn ein Heat mehr als 4 Piloten hat, wird er rot markiert und eine Warnung erscheint. Der "Aufteilung bestätigen"-Button ist disabled, solange ein Heat > 4 Piloten hat.

### Scope

**In Scope:**
- Drag & Drop für Piloten zwischen Heats (immer aktiv)
- Pilot wird immer zum Ziel-Heat hinzugefügt (Transfer, kein Swap)
- Heat rot einfärben bei > 4 Piloten
- Warnung oben anzeigen bei > 4 Piloten in irgendeinem Heat
- "Aufteilung bestätigen"-Button disabled bei > 4 Piloten ODER bei Heats mit 0 Piloten
- Entfernen: `swapMode` State, "Piloten tauschen"-Button, Click-basierter Swap-Mechanismus
- Entfernen: `swapPilots()` Action aus dem Store

**Out of Scope:**
- Sortierung/Reihenfolge innerhalb eines Heats
- Drag & Drop nach Turnier-Start
- Automatischer Pilot-Swap
- Undo/Rollback (akzeptiertes Technical Debt)

## Context for Development

### Codebase Patterns

**Tech Stack:**
- React 18.3.1 mit TypeScript
- Vite 5.4.8 als Build Tool
- Tailwind CSS 3.4.14 mit Custom Synthwave-Theme
- Zustand 4.5.5 für State Management (mit localStorage persist)
- Vitest 2.1.4 + React Testing Library für Tests

**Komponenten-Architektur:**
- `HeatAssignmentView` ist eine eigenständige Komponente für die `heat-assignment` Phase
- Nutzt `HeatCard` mit `variant="overview"` für Heat-Darstellung
- `HeatCard` ist eine Multi-Variant-Komponente (bracket, filled, empty, overview, detail)
- Pilots werden über `PilotAvatar` Komponente gerendert

**State Management:**
- `useTournamentStore` ist der zentrale Zustand Store
- Relevante Actions: `shuffleHeats()`, `swapPilots()`, `confirmHeatAssignment()`, `cancelHeatAssignment()`
- `heats` ist ein Array von `Heat` Objekten mit `pilotIds: string[]`

**Styling:**
- Synthwave Theme mit Farben: `neon-pink`, `neon-cyan`, `loser-red`, `winner-green`, `gold`
- Glow-Effekte: `shadow-glow-pink`, `shadow-glow-cyan`, `shadow-glow-red`
- Border-Klassen für Status-Indikation

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/components/heat-assignment-view.tsx` | **Hauptkomponente** - DnD Context wrappen, swapMode entfernen, Validierungslogik |
| `src/components/ui/heat-card.tsx` | **OverviewVariant** - Drag-Source für Piloten, Drop-Target für Heat |
| `src/stores/tournamentStore.ts` | **Store** - `movePilotToHeat()` hinzufügen, `swapPilots()` entfernen |
| `src/types/tournament.ts` | **Types** - `Heat` Interface mit `pilotIds: string[]` |
| `tests/heat-assignment.test.ts` | **Tests** - `swapPilots()` Tests entfernen |

### Technical Decisions

**DnD Library:** `@dnd-kit/core@6`
- React-first, TypeScript-native
- Accessible (keyboard support mit KeyboardSensor)
- Lightweight (~10kb gzipped)
- **Version 6.x pinnen** für API-Stabilität

**Drag Activation:**
- `PointerSensor` mit `activationConstraint: { distance: 8 }` (Drag startet nach 8px Bewegung)
- NICHT "click and hold" - sondern "click and move"

**Store-Änderung:**
- `movePilotToHeat(pilotId, targetHeatId)` mit Error-Handling
- `swapPilots()` wird entfernt (nicht deprecated)

**Validierung:**
- `hasInvalidHeats`: `heats.some(h => h.pilotIds.length > 4 || h.pilotIds.length === 0)`
- Warnung als Banner oben in der View
- Button disabled via `disabled={hasInvalidHeats}`

**Empty Heats:**
- Leere Heats bleiben sichtbar (werden nicht entfernt)
- Leere Heats werden als "invalid" markiert (orange Border)
- Turnier kann nicht starten mit leeren Heats

## Implementation Plan

### Tasks

- [x] **Task 1: @dnd-kit/core installieren**
  - File: `package.json`
  - Action: `npm install @dnd-kit/core@^6.0.0`
  - Notes: Version 6.x explizit pinnen

- [x] **Task 2: Store-Action `movePilotToHeat()` hinzufügen**
  - File: `src/stores/tournamentStore.ts`
  - Action: Neue Action im Interface und Implementation:
    ```typescript
    movePilotToHeat: (pilotId: string, targetHeatId: string) => void
    ```
  - Logic:
    1. `const sourceHeat = heats.find(h => h.pilotIds.includes(pilotId))`
    2. `const targetHeat = heats.find(h => h.id === targetHeatId)`
    3. **Guard:** `if (!sourceHeat || !targetHeat) return` (ungültige IDs → silent return)
    4. **Guard:** `if (sourceHeat.id === targetHeat.id) return` (gleicher Heat → keine Aktion)
    5. Entferne `pilotId` aus `sourceHeat.pilotIds`
    6. Füge `pilotId` zu `targetHeat.pilotIds` hinzu
    7. `set({ heats: [...newHeats] })`
  - Notes: Keine Validierung auf > 4 Piloten (wird in UI gemacht). Silent return bei ungültigen IDs.

- [x] **Task 3: `swapPilots()` Action entfernen**
  - File: `src/stores/tournamentStore.ts`
  - Action: 
    1. Entferne `swapPilots` aus dem Interface `TournamentState`
    2. Entferne `swapPilots` Implementation aus dem Store
  - Notes: Breaking Change - Tests müssen angepasst werden

- [x] **Task 4: SwapMode-Logik aus HeatAssignmentView entfernen**
  - File: `src/components/heat-assignment-view.tsx`
  - Action: Entferne folgende Code-Blöcke (nach Funktion/Komponente, nicht Zeilennummer):
    - **State:** `useState` für `swapMode` und `selectedPilotId`
    - **Store-Import:** `swapPilots` aus `useTournamentStore`
    - **Handler:** `handlePilotClick` Funktion
    - **Handler:** `handleCancelSwapMode` Funktion
    - **UI:** "Piloten tauschen" Button (`!swapMode ? ... : ...` Block)
    - **UI:** Swap Mode Hint Box (`{swapMode && ...}` Block)
    - **Props:** `swapMode`, `selectedPilotId`, `onPilotClick` von allen `HeatCard` Komponenten

- [x] **Task 5: DnD Context in HeatAssignmentView einrichten**
  - File: `src/components/heat-assignment-view.tsx`
  - Action:
    1. Import hinzufügen:
       ```typescript
       import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
       ```
    2. Store-Import für neue Action:
       ```typescript
       const movePilotToHeat = useTournamentStore((state) => state.movePilotToHeat)
       ```
    3. Sensors konfigurieren:
       ```typescript
       const sensors = useSensors(
         useSensor(PointerSensor, {
           activationConstraint: { distance: 8 }
         })
       )
       ```
    4. Handler implementieren:
       ```typescript
       const handleDragEnd = (event: DragEndEvent) => {
         const { active, over } = event
         if (!over) return
         const pilotId = active.id as string
         const targetHeatId = over.id as string
         movePilotToHeat(pilotId, targetHeatId)
       }
       ```
    5. `DndContext` um Heat-Grid wrappen:
       ```tsx
       <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           {heats.map(...)}
         </div>
       </DndContext>
       ```

- [x] **Task 6: Validierungslogik hinzufügen**
  - File: `src/components/heat-assignment-view.tsx`
  - Action:
    1. Computed values (nach den Store-Selektoren):
       ```typescript
       const hasOverfilledHeats = heats.some(h => h.pilotIds.length > 4)
       const hasEmptyHeats = heats.some(h => h.pilotIds.length === 0)
       const hasInvalidHeats = hasOverfilledHeats || hasEmptyHeats
       const overfilledHeatNumbers = heats.filter(h => h.pilotIds.length > 4).map(h => h.heatNumber)
       const emptyHeatNumbers = heats.filter(h => h.pilotIds.length === 0).map(h => h.heatNumber)
       ```
    2. Warnung-Banner oberhalb des DndContext einfügen:
       ```tsx
       {hasOverfilledHeats && (
         <div className="mb-6 p-4 rounded-xl border-2 bg-loser-red/10 border-loser-red text-loser-red">
           <p className="font-ui text-lg font-semibold">
             Heat {overfilledHeatNumbers.join(', ')} hat mehr als 4 Piloten. 
             Bitte Piloten verschieben, um das Turnier zu starten.
           </p>
         </div>
       )}
       {hasEmptyHeats && (
         <div className="mb-6 p-4 rounded-xl border-2 bg-orange-500/10 border-orange-500 text-orange-500">
           <p className="font-ui text-lg font-semibold">
             Heat {emptyHeatNumbers.join(', ')} hat keine Piloten. 
             Bitte Piloten hinzufügen oder neu mischen.
           </p>
         </div>
       )}
       ```
    3. Button `disabled` Attribut anpassen:
       ```tsx
       disabled={hasInvalidHeats}
       ```

- [x] **Task 7: HeatCard Props Interface aufräumen**
  - File: `src/components/ui/heat-card.tsx`
  - Action:
    1. Props entfernen aus `HeatCardProps` Interface:
       - `swapMode?: boolean`
       - `selectedPilotId?: string | null`
       - `onPilotClick?: (pilotId: string, heatId: string) => void`
    2. Neue Props hinzufügen zu `HeatCardProps`:
       ```typescript
       heatId?: string  // für DnD Drop-Target
       isInvalid?: boolean  // für > 4 oder 0 Piloten
       ```
    3. In `HeatCard` Hauptfunktion: Destrukturierung anpassen

- [x] **Task 8: HeatCard OverviewVariant als Drop-Target**
  - File: `src/components/ui/heat-card.tsx`
  - Action:
    1. Import hinzufügen:
       ```typescript
       import { useDroppable } from '@dnd-kit/core'
       ```
    2. In `OverviewVariant` Funktion, am Anfang:
       ```typescript
       const { setNodeRef, isOver } = useDroppable({ 
         id: heatId ?? `heat-${heatNumber}` 
       })
       ```
    3. Container-div anpassen:
       ```tsx
       <div 
         ref={setNodeRef}
         className={cn('bg-night border-2', borderClass, 'rounded-2xl p-5 relative', className)}
       >
       ```
    4. Border-Class-Logik anpassen:
       ```typescript
       const borderClass = isInvalid 
         ? 'border-loser-red shadow-glow-red'
         : isOver 
           ? 'border-neon-cyan shadow-glow-cyan' 
           : 'border-steel'
       ```
    5. Props entfernen: `swapMode`, `selectedPilotId`, `onPilotClick`, `isSelectedHeat`
    6. Props hinzufügen: `heatId`, `isInvalid`

- [x] **Task 9: Draggable Pilot-Items in OverviewVariant**
  - File: `src/components/ui/heat-card.tsx`
  - Action:
    1. Import hinzufügen:
       ```typescript
       import { useDraggable } from '@dnd-kit/core'
       ```
    2. Neue interne Komponente oberhalb von `OverviewVariant`:
       ```typescript
       function DraggablePilotRow({ 
         pilot, 
         heatId 
       }: { 
         pilot: Pilot
         heatId: string 
       }) {
         const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
           id: pilot.id,
           data: { sourceHeatId: heatId }
         })
         
         return (
           <div
             ref={setNodeRef}
             {...listeners}
             {...attributes}
             className={cn(
               "flex items-center gap-3 rounded-xl p-3 transition-all cursor-grab active:cursor-grabbing",
               isDragging ? "opacity-50 scale-105" : "bg-void border-2 border-steel",
               "hover:border-neon-cyan/50"
             )}
           >
             <PilotAvatar
               imageUrl={pilot.imageUrl}
               name={pilot.name}
               size="md"
             />
             <div className="font-ui text-base text-chrome font-semibold">
               {pilot.name}
             </div>
           </div>
         )
       }
       ```
    3. In `OverviewVariant`, Pilot-Rows ersetzen:
       ```tsx
       <div className="space-y-3">
         {sortedPilots.map((pilot) => (
           <DraggablePilotRow 
             key={pilot.id} 
             pilot={pilot} 
             heatId={heatId ?? `heat-${heatNumber}`} 
           />
         ))}
       </div>
       ```
    4. Entferne: `onClick` Handler, `isClickable`/`isSelected`/`canSwapWith` Logik, `RankBadge` in OverviewVariant (nicht relevant für Assignment-Phase)

- [x] **Task 10: Parent-Komponente Props-Update**
  - File: `src/components/heat-assignment-view.tsx`
  - Action: `HeatCard` Props aktualisieren:
    ```tsx
    <HeatCard
      key={heat.id}
      variant="overview"
      heatId={heat.id}
      heatNumber={heat.heatNumber}
      pilots={pilots}
      pilotIds={heat.pilotIds}
      results={heat.results}
      status={heat.status}
      isInvalid={heat.pilotIds.length > 4 || heat.pilotIds.length === 0}
    />
    ```

- [x] **Task 11: Tests für `swapPilots()` entfernen**
  - File: `tests/heat-assignment.test.ts`
  - Action:
    1. Entferne die gesamte `describe('swapPilots()', ...)` Test-Suite
    2. Entferne alle Referenzen auf `swapPilots` in anderen Tests

- [x] **Task 12: Tests für `movePilotToHeat()` hinzufügen**
  - File: `tests/heat-assignment.test.ts` (oder neue Datei `tests/move-pilot-to-heat.test.ts`)
  - Action: Neue Test-Suite:
    ```typescript
    describe('movePilotToHeat()', () => {
      it('moves pilot from source heat to target heat', () => {
        // Setup: 2 heats with pilots
        // Act: movePilotToHeat(pilotFromHeat1, heat2.id)
        // Assert: pilot is in heat2.pilotIds, not in heat1.pilotIds
      })
      
      it('removes pilot from source heat pilotIds', () => {
        // Assert: source heat's pilotIds array is shorter by 1
      })
      
      it('adds pilot to target heat pilotIds', () => {
        // Assert: target heat's pilotIds array is longer by 1
      })
      
      it('does nothing when source and target are the same heat', () => {
        // Act: movePilotToHeat(pilot, sameHeat.id)
        // Assert: heats unchanged
      })
      
      it('does nothing when pilotId does not exist', () => {
        // Act: movePilotToHeat('invalid-id', heat.id)
        // Assert: heats unchanged
      })
      
      it('does nothing when targetHeatId does not exist', () => {
        // Act: movePilotToHeat(pilot.id, 'invalid-heat-id')
        // Assert: heats unchanged
      })
      
      it('allows more than 4 pilots in target heat', () => {
        // Setup: heat with 4 pilots
        // Act: move 5th pilot to that heat
        // Assert: heat now has 5 pilots (no error)
      })
      
      it('allows source heat to become empty', () => {
        // Setup: heat with 1 pilot
        // Act: move that pilot away
        // Assert: source heat has 0 pilots, still exists
      })
    })
    ```

### Acceptance Criteria

- [x] **AC 1:** Given die Heat-Assignment-View ist geöffnet, when ich einen Piloten anklicke und 8+ Pixel bewege, then kann ich ihn zu einem anderen Heat ziehen (Drag startet)

- [x] **AC 2:** Given ich ziehe einen Piloten, when ich ihn über einem anderen Heat loslasse, then wird der Pilot zu diesem Heat hinzugefügt und aus dem ursprünglichen Heat entfernt

- [x] **AC 3:** Given ein Heat hat nach dem Drop mehr als 4 Piloten, when der Drop abgeschlossen ist, then wird der Heat rot eingefärbt (Border + leichter Background)

- [x] **AC 4:** Given ein oder mehrere Heats haben > 4 Piloten, when ich die View betrachte, then sehe ich eine rote Warnung oberhalb des Heat-Grids mit den betroffenen Heat-Nummern

- [x] **AC 5:** Given ein Heat hat 0 Piloten, when ich die View betrachte, then sehe ich eine orange Warnung und der Heat ist orange markiert

- [x] **AC 6:** Given ein oder mehrere Heats haben > 4 oder 0 Piloten, when ich auf "Aufteilung bestätigen" schaue, then ist der Button disabled (ausgegraut, nicht klickbar)

- [x] **AC 7:** Given alle Heats haben 1-4 Piloten, when ich die View betrachte, then ist keine Warnung sichtbar und der Button ist aktiv

- [x] **AC 8:** Given die Heat-Assignment-View ist geöffnet, when ich nach dem "Piloten tauschen" Button suche, then existiert dieser Button nicht mehr

- [x] **AC 9:** Given ich ziehe einen Piloten, when ich ihn im gleichen Heat loslasse (oder außerhalb eines Heats), then passiert keine Änderung

- [x] **AC 10:** Given ich bin in der Heat-Assignment-View, when ich "Neu mischen" klicke, then werden alle Piloten neu auf die Heats verteilt (wie bisher)

## Additional Context

### Dependencies

**NPM Package:**
```bash
npm install @dnd-kit/core@^6.0.0
```

**Interne Dependencies:**
- Zustand Store (`useTournamentStore`)
- `HeatCard` Komponente
- `PilotAvatar` Komponente
- Tailwind CSS Theme (loser-red, neon-cyan, orange-500)

### Testing Strategy

**Unit Tests (Store):**
- 8 Tests für `movePilotToHeat()` (siehe Task 12)
- Bestehende `shuffleHeats()` Tests bleiben unverändert
- `swapPilots()` Tests werden entfernt

**Integration/Component Tests:**
- DnD-Events sind schwer zu simulieren mit RTL
- Store-Action Tests decken die Kernlogik ab
- Manuelle Tests für DnD-Interaktion

**Manuelle Tests:**
1. Pilot ziehen von Heat 1 zu Heat 2 → Pilot erscheint in Heat 2
2. Pilot zu Heat mit 4 Piloten ziehen → Heat wird rot, Warnung erscheint, Button disabled
3. Alle Piloten aus einem Heat ziehen → Heat wird orange, Warnung erscheint
4. Pilot zurück verschieben → Alles grün, Button aktiv
5. "Neu mischen" → Piloten werden neu verteilt
6. Button "Piloten tauschen" existiert nicht mehr

### Notes

**Risiken:**
- DnD-Performance bei vielen Piloten (unwahrscheinlich bei max 60 Piloten / 15 Heats)
- Touch-Support auf Mobile (dnd-kit hat guten Touch-Support)

**Bekannte Limitierungen:**
- Kein automatischer Swap (by design)
- Keine Sortierung innerhalb eines Heats (out of scope)
- Kein Undo/Rollback - User muss manuell korrigieren oder "Neu mischen" nutzen

**Zukunftsüberlegungen:**
- Keyboard-Accessibility: `KeyboardSensor` könnte für bessere a11y hinzugefügt werden
- Undo-Funktion: Einfach mit Store-History erweiterbar (nicht in Scope)
- DragOverlay: Könnte für besseres visuelles Feedback hinzugefügt werden (nice-to-have)

**Cleanup:**
- `swapPilots()` Action wird komplett entfernt (nicht deprecated)
- SwapMode-bezogene Props werden aus HeatCard entfernt
