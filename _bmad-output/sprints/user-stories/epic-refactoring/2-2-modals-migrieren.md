# Story 2.2: Bestehende Modals auf generisches Modal migrieren

**Epic:** Komponenten Refactoring
**Aufwand:** M
**Priorität:** 4 (Sprint 4)
**Abhängigkeiten:** Story 2.1 muss zuerst abgeschlossen sein

## Beschreibung

Als Entwickler möchte ich alle 6 Modal-Implementierungen auf die neue generische Modal-Komponente migrieren, damit duplizierter Code eliminiert wird und Styling-Konsistenz gewährleistet ist.

## Akzeptanzkriterien

- [ ] AC1: `HeatDetailModal` verwendet `<Modal>`
- [ ] AC2: `ResetConfirmationDialog` verwendet `<Modal>`
- [ ] AC3: `TournamentStartDialog` verwendet `<Modal>`
- [ ] AC4: `CSVImport` Modal-Overlay verwendet `<Modal>`
- [ ] AC5: `PilotCard` Delete-Dialog verwendet `<Modal>`
- [ ] AC6: `HeatAssignmentView` Cancel-Dialog verwendet `<Modal>`
- [ ] AC7: Alle bestehenden Tests bleiben grün
- [ ] AC8: Visuelles Verhalten bleibt identisch (keine UI-Regressions)

## Technische Details

### Betroffene Dateien
- `src/components/heat-detail-modal.tsx`
- `src/components/reset-confirmation-dialog.tsx`
- `src/components/tournament-start-dialog.tsx`
- `src/components/csv-import.tsx`
- `src/components/pilot-card.tsx`
- `src/components/heat-assignment-view.tsx`

### Migration-Pattern

**Vorher (typisches Pattern):**
```tsx
{showDialog && (
  <div className="fixed inset-0 bg-void/80 flex items-center justify-center z-50">
    <div className="bg-void-light border border-cyber-cyan/30 rounded-2xl p-6">
      <h2>Titel</h2>
      <p>Inhalt</p>
      <div className="flex gap-4">
        <button onClick={onCancel}>Abbrechen</button>
        <button onClick={onConfirm}>Bestätigen</button>
      </div>
    </div>
  </div>
)}
```

**Nachher:**
```tsx
import { Modal } from './ui/modal';

<Modal isOpen={showDialog} onClose={onCancel} title="Titel">
  <p>Inhalt</p>
  <Modal.Footer>
    <button onClick={onCancel}>Abbrechen</button>
    <button onClick={onConfirm}>Bestätigen</button>
  </Modal.Footer>
</Modal>
```

### Migrations-Checkliste

1. **HeatDetailModal** (`heat-detail-modal.tsx`)
   - Ersetze Wrapper-Div durch `<Modal>`
   - Behalte Heat-spezifischen Inhalt

2. **ResetConfirmationDialog** (`reset-confirmation-dialog.tsx`)
   - Ersetze Wrapper-Div durch `<Modal>`
   - Nutze `Modal.Footer` für Buttons

3. **TournamentStartDialog** (`tournament-start-dialog.tsx`)
   - Ersetze Wrapper-Div durch `<Modal>`
   - Nutze `Modal.Footer` für Buttons

4. **CSVImport** (`csv-import.tsx`)
   - Modal für Import-Vorschau ersetzen
   - Behalte Drag&Drop-Logik außerhalb

5. **PilotCard Delete-Dialog** (`pilot-card.tsx`)
   - Inline-Dialog durch `<Modal>` ersetzen
   - State `showDeleteConfirm` bleibt

6. **HeatAssignmentView Cancel-Dialog** (`heat-assignment-view.tsx`)
   - Inline-Dialog durch `<Modal>` ersetzen

## Testplan

1. `npm test -- heat-detail-modal.test.tsx`
2. `npm test -- csv-import.test.tsx`
3. `npm test -- pilot-card.test.tsx`
4. `npm test` - alle Tests müssen grün bleiben
5. Manuelle UI-Prüfung: Alle Dialoge öffnen/schließen korrekt
