---
title: 'Inline Placement Entry via Bracket Modal'
slug: 'inline-bracket-placement-modal'
created: '2026-01-19'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['React 18', 'TypeScript', 'Zustand', 'Tailwind CSS', 'Vite']
files_to_modify:
  - 'src/components/bracket/heat-boxes/BracketHeatBox.tsx'
  - 'src/components/bracket/BracketTree.tsx'
  - 'src/components/placement-entry-modal.tsx (NEU)'
code_patterns:
  - 'Zustand Store mit persist middleware'
  - 'Modal Komponente mit Escape/Backdrop-Close'
  - 'Click-to-Rank Logik in ActiveHeatView'
  - 'Bracket-spezifische Styling via bracketType'
test_patterns:
  - 'Vitest + React Testing Library'
  - 'data-testid Attribute für Testing'
---

# Tech-Spec: Inline Placement Entry via Bracket Modal

**Created:** 2026-01-19

## Overview

### Problem Statement

Während des Turniers (WB/LB/Finale) muss man ständig zwischen dem oberen Eingabe-Bereich (`ActiveHeatView`) und der Bracket-Ansicht hin- und herscrollen. Das unterbricht den Flow beim Turnier-Management.

### Solution

1. **Modal für Live-Heats:** Klick auf eine Live-Heat im Bracket-Tree öffnet ein Modal/Overlay mit der gleichen Platzierungs-Eingabe-UI wie in der `ActiveHeatView`
2. **ActiveHeatView ausblenden nach Quali:** Die obere Eingabe-Komponente wird nach Abschluss der Qualifikation ausgeblendet, da ab dann das Modal im Bracket genutzt wird

### Scope

**In Scope:**
- Klickbare Live-Heat-Boxen im Bracket (WB, LB, Grand Finale)
- Modal mit Pilot-Cards + Click-to-Rank Logik (wiederverwendet von ActiveHeatView)
- Wiederverwenden der bestehenden Ranking-Logik aus `ActiveHeatView`
- ActiveHeatView Conditional Rendering (nur während Qualifikations-Phase)

**Out of Scope:**
- Automatischer Zoom/Scroll zur Live-Heat
- Beamer-spezifische Optimierungen
- Änderungen am Quali-Flow (bleibt wie bisher mit oberer Eingabe)

## Context for Development

### Codebase Patterns

1. **State Management:** Zustand Store (`tournamentStore.ts`) mit `submitHeatResults(heatId, rankings)` - EINZIGER Einsprungpunkt für Platzierungs-Submission
2. **Modal Pattern:** Existierende `Modal` Komponente in `src/components/ui/modal.tsx` mit:
   - Escape-Key Handler
   - Backdrop Click Handler
   - Focus Trap
   - Size Variants (sm, md, lg)
3. **Ranking Logik:** `ActiveHeatView` enthält komplette Click-to-Rank Logik:
   - `toggleRank(pilotId)` - Toggle/Remove Rang
   - `assignDirectRank(pilotId, rank)` - Direkter Rang via Keyboard
   - `resetRankings()` - Zurücksetzen
   - Mindestens 2 Rankings für Submit
4. **Heat Status:** `heat.status === 'active'` identifiziert Live-Heats
5. **Tournament Phase:** `tournamentPhase` unterscheidet zwischen 'running' (Quali) und 'finale' (WB/LB/GF)
6. **Qualification Complete:** `isQualificationComplete` Flag zeigt an, wann Quali abgeschlossen ist

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/components/active-heat-view.tsx` | Source für Ranking-Logik + UI Pattern |
| `src/components/bracket/heat-boxes/BracketHeatBox.tsx` | Heat-Box im Bracket - erhält onClick Handler |
| `src/components/bracket/BracketTree.tsx` | Parent-Komponente - steuert Modal + ActiveHeatView Visibility |
| `src/components/heat-detail-modal.tsx` | Existierendes Modal für Heat-Details (Read-Only) |
| `src/components/ui/modal.tsx` | Basis Modal-Komponente |
| `src/stores/tournamentStore.ts` | Store mit `submitHeatResults()` |
| `src/lib/ui-helpers.ts` | `getRankBadgeClasses()`, `getRankBorderClasses()` |

### Technical Decisions

1. **Neue Komponente erstellen:** `PlacementEntryModal` - extrahiert Ranking-Logik aus `ActiveHeatView` in eine wiederverwendbare Komponente
2. **Keine Änderung an Store:** `submitHeatResults()` bleibt unverändert - Modal ruft dieselbe Funktion auf
3. **Modal Größe:** `lg` (max-w-lg) für ausreichend Platz für 4 Pilot-Cards
4. **BracketHeatBox onClick:** Nur bei `status === 'active'` den Placement-Modal öffnen (sonst Detail-Modal wie bisher)
5. **ActiveHeatView Conditional:** Nur rendern wenn `!isQualificationComplete` (also nur während Quali-Phase)
6. **Mutual Exclusivity:** `placementHeat` und `selectedHeat` dürfen nicht gleichzeitig gesetzt sein (beim Öffnen des einen wird das andere geschlossen)
7. **Modal-Lifecycle:** Wenn `heat.status` sich von `active` weg bewegt während Modal offen ist, Modal schließen und keine automatische Submission durchführen
8. **Initial Rankings:** Wenn `heat.results` bereits existieren (z.B. Reopen/Edit), Rankings im Modal vorbefüllen
9. **3er-Heat Layout:** `grid-cols-3` bei 3 Piloten, sonst `grid-cols-2`
10. **Min-Rankings:** Submit erlaubt bei `Math.min(2, heat.pilotIds.length)` vergebenen Rängen
11. **Keyboard Fokus:** Beim Öffnen wird der erste Pilot-Button fokussiert; Tab-Reihenfolge folgt DOM-Order, damit 1–4 Shortcuts funktionieren
12. **Styling (Glow):** Für aktive Heats `animate-pulse` + `shadow-[0_0_20px_rgba(5,217,232,0.5)]`, respektiert `motion-reduce:animate-none`
13. **Labeling:** Verwende die bestehende Heat-Namenslogik aus `BracketHeatBox` (WB/LB/QUALI/GRAND FINALE) um Strings konsistent zu halten

## Implementation Plan

### Tasks

- [x] **Task 1:** Erstelle `PlacementEntryModal` Komponente
  - File: `src/components/placement-entry-modal.tsx` (NEU)
  - Action: Erstelle neue Komponente die Ranking-Eingabe-UI aus `ActiveHeatView` extrahiert
  - Details:
    - Props: `heat: Heat`, `pilots: Pilot[]`, `isOpen: boolean`, `onClose: () => void`, `onSubmitResults: (heatId, rankings) => void`
    - Filtere `heatPilots` über `heat.pilotIds` (wie in `ActiveHeatView`)
    - Kopiere Ranking-State-Logik aus `ActiveHeatView` (useState für rankings, toggleRank, assignDirectRank, resetRankings)
    - Initialisiere Rankings aus `heat.results?.rankings` wenn vorhanden
    - Verwende `Modal` Komponente als Wrapper mit `size="lg"`
    - Zeige Header mit Heat-Nummer + bracketType Label (verwende gleiche Logik wie `BracketHeatBox`)
    - Rendere Pilot-Cards Grid: `grid-cols-3` bei 3 Piloten, sonst `grid-cols-2`
    - "Fertig" Button + "Zurücksetzen" Link
    - Keyboard-Shortcuts (1-4, Escape), Fokus beim Öffnen auf erstem Pilot-Button
    - Submit enabled bei `rankings.size >= Math.min(2, heat.pilotIds.length)`
    - Nach Submit: `onSubmitResults()` aufrufen + `onClose()`
  - Notes: UI-Styling aus `ActiveHeatView` übernehmen, aber kompakter für Modal-Kontext; keine On-Deck Preview im Modal


- [x] **Task 2:** Erweitere `BracketHeatBox` für Live-Heat Klick
  - File: `src/components/bracket/heat-boxes/BracketHeatBox.tsx`
  - Action: Füge visuelles Feedback hinzu für klickbare Live-Heats
  - Details:
    - Wenn `heat.status === 'active'`: 
      - Füge `cursor-pointer` Klasse hinzu
      - Füge `animate-pulse` + `shadow-[0_0_20px_rgba(5,217,232,0.5)]` hinzu
      - Respektiere `motion-reduce:animate-none`
      - Bestehender `onClick` Handler wird bereits durchgereicht
    - Wenn `heat.status !== 'active'`: Verhalten bleibt unverändert (öffnet Detail-Modal)
  - Notes: Der `onClick` Prop existiert bereits - wird in `BracketTree` je nach Status unterschiedlich gehandled

- [x] **Task 3:** Integriere Modal in `BracketTree`
  - File: `src/components/bracket/BracketTree.tsx`
  - Action: Füge State + Logik für Placement-Modal hinzu
  - Details:
    - Neuer State: `const [placementHeat, setPlacementHeat] = useState<Heat | null>(null)`
    - Modifiziere `handleHeatClick(heatId)` (mutual exclusivity):
      ```typescript
      const handleHeatClick = (heatId: string) => {
        const heat = heats.find(h => h.id === heatId)
        if (heat?.status === 'active') {
          setSelectedHeat(null)
          setPlacementHeat(heat) // Öffne Placement-Modal
        } else {
          setPlacementHeat(null)
          setSelectedHeat(heatId) // Bestehendes Detail-Modal
        }
      }
      ```
    - Close-Behavior: `onClose` schließt nur `placementHeat`
    - Lifecycle: Wenn `placementHeat` nicht mehr `active` ist (Statusänderung), Modal schließen
    - Rendere `PlacementEntryModal` am Ende der Komponente:
      ```tsx
      {placementHeat && (
        <PlacementEntryModal
          heat={placementHeat}
          pilots={pilots}
          isOpen={!!placementHeat}
          onClose={() => setPlacementHeat(null)}
          onSubmitResults={(heatId, rankings) => {
            onSubmitResults(heatId, rankings)
            setPlacementHeat(null)
          }}
        />
      )}
      ```
  - Notes: Import der neuen Komponente nicht vergessen

- [x] **Task 4:** ActiveHeatView nur während Quali anzeigen
  - File: `src/components/bracket/BracketTree.tsx`
  - Action: Ändere Conditional Rendering der `ActiveHeatView`
  - Details:
    - Aktuell (Zeile ~357-367):
      ```tsx
      {(tournamentPhase === 'running' || tournamentPhase === 'finale') && activeHeat && (
        <ActiveHeatView ... />
      )}
      ```
    - Ändern zu:
      ```tsx
      {tournamentPhase === 'running' && !isQualificationComplete && activeHeat && (
        <ActiveHeatView ... />
      )}
      ```
    - Hole `isQualificationComplete` aus dem Store:
      ```tsx
      const isQualificationComplete = useTournamentStore(state => state.isQualificationComplete)
      ```
    - Hinweis: Falls `tournamentPhase` nach Quali noch `running` bleibt, ist `isQualificationComplete` das entscheidende Flag
  - Notes: Nach Quali-Abschluss wird nur noch das Modal im Bracket für Eingabe genutzt

- [x] **Task 5:** Schreibe Tests für `PlacementEntryModal`
  - File: `tests/placement-entry-modal.test.tsx` (NEU)
  - Action: Erstelle Unit-Tests für die neue Komponente
  - Details:
    - Setup: Nutze React Testing Library; rendere Modal mit Beispiel-Heat + Pilotenliste
    - Test: Modal rendert korrekt mit Heat-Infos
    - Test: Klick auf Pilot vergibt Rang
    - Test: Fertig-Button nur aktiv bei `Math.min(2, heat.pilotIds.length)` Rankings
    - Test: Submit ruft onSubmitResults mit korrekten Daten auf
    - Test: Escape schließt Modal
    - Test: Keyboard-Shortcuts 1-4 funktionieren (fokussierter Pilot-Button)
  - Notes: Patterns aus `tests/active-heat-view.test.tsx` übernehmen (falls vorhanden)

### Acceptance Criteria

- [x] **AC 1:** Given eine Live-Heat im Bracket (WB/LB/GF), when User auf die Heat-Box klickt, then öffnet sich das Placement-Entry-Modal mit den Piloten dieser Heat

- [x] **AC 2:** Given das Placement-Entry-Modal ist offen, when User auf Piloten klickt um Ränge zu vergeben und "Fertig" drückt (bei mindestens `Math.min(2, heat.pilotIds.length)` Rankings), then werden die Platzierungen gespeichert und das Modal schließt sich

- [x] **AC 3:** Given das Placement-Entry-Modal ist offen, when User Escape drückt oder außerhalb klickt, then schließt sich das Modal ohne zu speichern

- [x] **AC 4:** Given das Placement-Entry-Modal ist offen, when User Tasten 1-4 drückt während ein Pilot fokussiert ist, then wird diesem Pilot der entsprechende Rang zugewiesen

- [x] **AC 5:** Given die Qualifikation ist abgeschlossen (`isQualificationComplete === true`), when User die Bracket-Seite betrachtet, then ist die obere `ActiveHeatView` nicht mehr sichtbar

- [x] **AC 6:** Given eine nicht-aktive Heat im Bracket (pending oder completed), when User auf die Heat-Box klickt, then öffnet sich das bestehende Detail-Modal (nicht das Placement-Modal)

- [x] **AC 7:** Given eine Live-Heat im Bracket, when User diese betrachtet, then ist die Heat-Box visuell hervorgehoben (pulsierender Glow) und zeigt Klickbarkeit an (cursor-pointer)

- [x] **AC 8:** Given ein aktiver Heat wird während eines offenen Placement-Modals auf `completed` gesetzt, when der Statuswechsel passiert, then schließt sich das Modal automatisch ohne erneute Submission

- [x] **AC 9:** Given ein aktiver Heat hat bereits `results`, when das Placement-Modal geöffnet wird, then sind die bisherigen Rankings vorausgefüllt sichtbar

## Additional Context

### Dependencies

- Keine neuen Dependencies erforderlich
- Wiederverwendung bestehender UI-Komponenten (`Modal`, Rank-Badge-Styling)
- Abhängig von: `isQualificationComplete` Flag im Store (bereits implementiert)

### Testing Strategy

**Unit Tests:**
- `PlacementEntryModal` Komponente isoliert testen (inkl. Fokus-Handling)
- Ranking-Logik (toggleRank, assignDirectRank) testen
- Modal-Interaktionen (open/close, keyboard shortcuts)
- Pre-Fill aus `heat.results` testen

**Integration Tests:**
- Klick auf Live-Heat → Modal öffnet
- Submit im Modal → Store wird aktualisiert → Modal schließt
- ActiveHeatView Visibility basierend auf `isQualificationComplete`
- Statuswechsel `active -> completed` während Modal offen → Modal schließt automatisch

**Manual Testing:**
- Durchlauf eines kompletten Turniers ab Quali bis Grand Finale
- Verifizieren dass nach Quali die obere Eingabe verschwindet
- Verifizieren dass Bracket-Modal korrekt funktioniert in allen Bracket-Typen (WB, LB, GF)
- 3er-Heat Layout im Modal prüfen

### Notes

**Risiken:**
- Keyboard-Shortcuts könnten mit Browser-Shortcuts kollidieren (1-4 sind aber safe)
- Modal muss responsive genug sein für verschiedene Pilot-Anzahlen (3 oder 4)

**Limitierungen:**
- On-Deck Preview wird im Modal NICHT angezeigt (nur im oberen ActiveHeatView während Quali)
- Keyboard-Navigation zwischen Piloten (Arrow Keys) wird initial nicht implementiert im Modal

**Zukunft (Out of Scope):**
- Könnte später erweitert werden um auch Quali-Heats inline im Bracket einzugeben
- Touch-optimierte Version für Tablet-Nutzung
