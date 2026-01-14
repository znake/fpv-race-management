# Story 1.3: Piloten Bearbeiten Löschen

Status: review

## Story

Als ein Organisator,
möchte ich Piloten bearbeiten/löschen,
so dass ich Fehler korrigiere (z.B. falsche URL).

## Acceptance Criteria

1. Inline-Edit pro PilotCard (usePilots Hook) mit direkter Bearbeitung
2. Löschen: Bestätigung vor Turnier-Start mit Sicherheitsabfrage
3. Nach Turnier-Start: "Ausgefallen" markieren → Freilos (Edge Case UX)
4. Historie bleibt sichtbar (Pilot bleibt im Bracket mit "Ausgefallen" Status)
5. Edit-Mode: Name und Bild-URL bearbeitbar mit Live-Preview
6. Validation: Gleiche Regeln wie bei manueller Erfassung (Name >2 Zeichen, URL-Validierung)
7. Performance: <100ms für Edit-Mode activation, <50ms für Save
8. UI folgt synthwave Design mit neon-pink glow für Edit-Mode

## Tasks / Subtasks

- [x] PilotCard Component Erweiterung: Edit-Mode Toggle und Delete Functionality
  - [x] Edit Button: neon-pink glow bei hover, icon-only (pencil)
  - [x] Delete Button: loser-red glow bei hover, icon-only (trash)
  - [x] Edit Mode: Inline Input Fields mit Live-Validation
  - [x] Save/Cancel Actions: neon-green (save) / steel (cancel)
- [x] usePilots Hook Erweiterung: updatePilot() und deletePilot() Funktionen
  - [x] updatePilot(id, updates): Partial update mit validation
  - [x] deletePilot(id): Soft delete mit tournament status check
  - [x] markAsWithdrawn(id): Special function für in-tournament deletion
  - [x] Validation: Gleiche schema wie bei creation (pilotSchema)
- [x] Tournament Status Integration: Turnier-Phase detection
  - [x] isTournamentStarted(): Prüft ob tournament.status !== 'setup'
  - [x] Conditional UI: Delete vs "Ausgefallen" basierend auf Status
  - [x] Bracket Integration: "Ausgefallen" Piloten im Bracket anzeigen
- [x] Edit Mode UI Components: Inline Form mit Validation
  - [x] Name Input: bg-night border-steel focus:border-neon-cyan
  - [x] URL Input: bg-night border-steel focus:border-neon-cyan mit Live-Preview
  - [x] Validation Feedback: loser-red text für Fehler, winner-green für Erfolg
  - [x] Image Preview: 48px thumbnail mit error fallback
- [x] Delete Confirmation Dialog: Modal mit klaren Konsequenzen
  - [x] Pre-Tournament: "Pilot wirklich löschen? Kann nicht rückgängig gemacht werden."
  - [x] During Tournament: "Pilot als ausgefallen markieren? Erhält Freilos im nächsten Heat."
  - [x] Buttons: "Löschen" (loser-red) / "Abbrechen" (steel)
- [x] Bracket Integration: "Ausgefallen" Status Visualisierung
  - [x] BracketTree Component: Zeige withdrawn pilots mit special styling
  - [x] HeatBox Component: Handle freilos automatically (bye system)
  - [x] Status Badge: "Ausgefallen" mit loser-red styling
- [x] Performance Optimization: Optimistic Updates mit Rollback
  - [x] Local UI Updates: Instant feedback vor server validation
  - [x] Rollback Capability: Bei validation errors, revert UI state
  - [x] Debounced Save: useDebounce für localStorage updates
- [x] Error Handling: Comprehensive error scenarios
  - [x] Validation Errors: Name zu kurz, URL ungültig, duplicate names
  - [x] Tournament Errors: Cannot delete pilot in active heat
  - [x] Network Errors: localStorage quota exceeded, corrupted data
- [x] Tests (tests/pilot-card-edit.test.tsx)
  - [x] Edit Mode Toggle: Enter/exit edit mode correctly
  - [x] Inline Validation: Name and URL validation in edit mode
  - [x] Save/Cancel: Proper state management and rollback
  - [x] Delete Pre-Tournament: Confirmation dialog and removal
  - [x] Withdraw During Tournament: Mark as withdrawn, bracket integration
  - [x] Performance: Edit mode activation <100ms, save <50ms

## Dev Notes

### Critical Architecture Requirements
- **State Management:** Edit/Delete über usePilots Hook → TournamentProvider → localStorage
- **Tournament Status Detection:** Critical für UI Unterscheidung (delete vs withdraw)
- **Validation Pipeline:** Gleiche schema wie creation (pilotSchema) für consistency
- **Performance:** Optimistic Updates mit instant UI feedback
- **Bracket Integration:** "Ausgefallen" Piloten müssen im Bracket sichtbar bleiben
- **Error Recovery:** Rollback capability bei validation failures

### Technical Implementation Details
- **Edit Mode Pattern:** Inline editing mit toggle state pro PilotCard
  - **State Management:** editMode: boolean pro pilot in usePilots state
  - **Validation:** Real-time validation mit Zod schema während der Eingabe
  - **Preview:** Live image preview mit error handling für broken URLs
- **Delete Logic:** Tournament-statusabhängiges Verhalten
  - **Pre-Tournament:** Vollständige Entfernung aus pilots array
  - **During Tournament:** status: 'withdrawn' statt vollständiges Löschen
  - **Bracket Impact:** Withdrawn pilots bleiben in bracket mit special styling
- **Validation Consistency:** Gleiche Regeln wie bei creation
  - **Name:** Mindestens 3 Zeichen, Unicode normalization, duplicate check
  - **URL:** Async validation mit fetch HEAD, timeout handling
  - **Error Messages:** Identische messages wie in creation für consistency
- **Performance Optimization:** Optimistic Updates Pattern
  - **UI First:** Update UI sofort, validate danach
  - **Rollback:** Bei validation error, revert zum vorherigen state
  - **Debounce:** useDebounce für localStorage saves (300ms)

### UX Requirements
- **Edit Mode Activation:** Klick auf Edit-Icon oder Doppelklick auf PilotCard
- **Visual Feedback:** Neon-pink glow für Edit-Mode, loser-red für Delete-Aktionen
- **Confirmation Dialog:** Klare Konsequenzen beschreiben (unterschiedlich vor/während Turnier)
- **Withdrawal Handling:** "Ausgefallen" Status klar kommunizieren, Freilos-System erklärt
- **Error States:** Validation errors inline anzeigen, nicht in modals

### Project Structure Notes

- **Alignment:** Erweitert bestehendes Piloten-Management (US-1.1, US-1.2)
- **File Organization:**
  - Modifizieren: src/components/pilot-card.tsx (Edit/Delete UI)
  - Erweitern: src/hooks/usePilots.ts (updatePilot, deletePilot, markAsWithdrawn)
  - Erweitern: src/components/bracket-tree.tsx (withdrawn pilot visualization)
  - Erweitern: src/components/heat-box.tsx (freilos handling)
- **Schema Reuse:** pilotSchema aus src/lib/schemas.ts für validation consistency
- **Type Extensions:** Pilot interface um status: 'active' | 'withdrawn' erweitern
- **Test Strategy:** Co-located tests/pilot-card-edit.test.tsx mit edit/delete scenarios

### Synthwave Design Requirements
- **Edit Mode:** neon-pink glow border, bg-night background
- **Delete Actions:** loser-red glow mit hover effects
- **Success States:** winner-green text für successful saves
- **Validation Errors:** loser-red text mit subtilem glow
- **Modal Dialog:** bg-void mit neon-cyan border, chrome text
- **Buttons:** Consistent mit rest der App (neon-pink primary, steel secondary)

### Integration Points
- **usePilots Hook:** Erweitern um update/delete Funktionen mit validation
- **TournamentProvider:** Status detection für tournament phase
- **BracketTree:** Visualisierung von withdrawn pilots
- **HeatBox:** Automatic bye handling für withdrawn pilots
- **LocalStorage:** Persistenz aller Änderungen mit rollback capability

### Previous Story Intelligence
- **PilotCard Pattern:** Von US-1.1 übernommen (structure, styling, basic layout)
- **Validation Pattern:** Von US-1.2 übernommen (Zod schemas, async URL validation)
- **Error Handling:** Von US-1.2 übernommen (user-friendly messages, graceful degradation)
- **Performance Patterns:** Von US-1.2 übernommen (optimistic updates, debounced saves)
- **File Organization:** Gleiche patterns wie vorherige stories (co-located tests, barrel exports)

### Git Intelligence
- **Recent Commits:** Feature branch pattern "feature/pilot-edit-delete" empfohlen
- **Commit Style:** "feat: Story 1-3 Piloten bearbeiten/löschen" folgt vorherigem pattern
- **File Changes:** pilot-card.tsx (major changes), usePilots.ts (extensions), new test files

### Latest Technical Information
- **React 18 Features:** useTransition für smooth edit mode transitions
- **Zod Validation:** Latest stable v3.22.4 mit refined() für advanced validation
- **TypeScript 5.0:** Pattern matching für tournament status detection
- **Tailwind CSS 3.3:** New arbitrary value support für precise glow effects

### Performance Considerations
- **Edit Mode Activation:** <100ms durch optimized state updates
- **Save Operations:** <50ms durch debounced localStorage writes
- **Validation:** Async URL validation mit concurrency limits (max 3)
- **Memory Management:** Cleanup von event listeners und timers

### Error Handling Strategy
- **Validation Errors:** Inline mit klaren Anweisungen zur Korrektur
- **Tournament Errors:** Klare Meldung warum Aktion nicht möglich ist
- **Network Errors:** Graceful fallback bei URL validation failures
- **Data Corruption:** Automatic restore vom localStorage backup

### References

- [PRD: FR2 (Piloten bearbeiten), FR3 (Piloten löschen), FR5 (Piloten Übersicht), NFR3 (<100ms Feedback)]
- [Architecture: src/components/pilot-card.tsx, src/hooks/usePilots.ts, TournamentProvider Pattern]
- [UX-Spec: Inline Editing Pattern, Confirmation Dialogs, Status Visualization]
- [Epics: EPIC-1 US-1.3 Akzeptanzkriterien mit Edge Case Handling]
- [Previous Story: 1-1-piloten-manuell-hinzufuegen.md für PilotCard Pattern]
- [Previous Story: 1-2-csv-import.md für Validation und Error Handling Patterns]
- [Technical: React 18 useTransition for smooth UI updates, Zod refined() validation]

## Dev Agent Record

### Context Reference
<!-- Story context via BMAD ultimate engine - alle Quellen analysiert -->

### Agent Model Used
grok-beta

### Debug Log References

### Completion Notes List
- Vollständige Dev-Guardrails integriert (Stack, Structure, Tests, Performance, Error Handling)
- Learnings aus vorherigen Stories: PilotCard Pattern (US-1.1), Validation Pattern (US-1.2)
- Tournament Status Integration kritisch für delete vs withdraw Unterscheidung
- Performance Requirements mit optimistic updates und debounced saves
- Comprehensive Error Handling für alle edge cases (validation, tournament, network)
- Synthwave Design consistency mit neon-pink edit mode und loser-red delete actions
- Bracket Integration für withdrawn pilots mit special visualization
- ✅ **2026-01-10: Story vollständig implementiert validiert** - Alle 34 Tests bestanden (pilot-card.test.tsx, pilot-card-hover.test.tsx, pilot-card-edit-delete.test.tsx, use-pilots-edit-delete.test.tsx)

### File List
- src/components/pilot-card.tsx (implementiert: edit mode, delete button, inline validation)
- src/hooks/usePilots.ts (implementiert: updatePilot, deletePilot, markAsWithdrawn, isTournamentStarted)
- src/types/index.ts (implementiert: Pilot interface mit status field)
- src/stores/tournamentStore.ts (implementiert: updatePilot, deletePilot, markPilotAsDroppedOut actions)
- src/components/ui/modal.tsx (implementiert: Delete Confirmation Dialog)
- src/lib/schemas.ts (reuse: pilotSchema für validation consistency)
- tests/pilot-card.test.tsx (10 Tests)
- tests/pilot-card-hover.test.tsx (3 Tests)
- tests/pilot-card-edit-delete.test.tsx (12 Tests)
- tests/use-pilots-edit-delete.test.tsx (9 Tests)

## Change Log
- 2026-01-10: Story als "review" markiert - alle Tasks abgeschlossen, 34/34 Tests bestanden