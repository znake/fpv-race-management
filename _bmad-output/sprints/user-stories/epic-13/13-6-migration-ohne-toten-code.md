# Story 13.6: Migration bestehender Logik ohne toten Code

Status: ready-for-dev

## Story

As a Entwickler,
I want die Pool-basierte WB-Logik sauber entfernen,
so that kein toter Code entsteht.

## Akzeptanzkriterien

1. **AC1:** `generateWBHeatFromPool()` wird entfernt
2. **AC2:** `canGenerateWBFinale()` wird entfernt (redundant)
3. **AC3:** `removeFromWinnerPool()` wird entfernt
4. **AC4:** `addToWinnerPool()` wird entfernt
5. **AC5:** `winnerPool` State wird entfernt
6. **AC6:** Alle Tests die diese Funktionen nutzen werden aktualisiert
7. **AC7:** Keine `// deprecated` Kommentare - Code wird gelöscht

## Tasks / Subtasks

- [ ] Task 1: Funktionen aus tournamentStore.ts entfernen (AC: #1-4)
  - [ ] 1.1: `generateWBHeatFromPool()` löschen (Zeilen ~1238-1267)
  - [ ] 1.2: `canGenerateWBFinale()` löschen (Zeilen ~1271-1278)
  - [ ] 1.3: `removeFromWinnerPool()` löschen (Zeilen ~501-508)
  - [ ] 1.4: `addToWinnerPool()` löschen (Zeilen ~493-499)

- [ ] Task 2: State aus tournamentStore.ts entfernen (AC: #5)
  - [ ] 2.1: `winnerPool: string[]` aus INITIAL_TOURNAMENT_STATE löschen
  - [ ] 2.2: `winnerPool` aus TournamentState Interface löschen
  - [ ] 2.3: Alle Referenzen auf `winnerPool` in submitHeatResults() ersetzen durch neue Runden-Logik

- [ ] Task 3: Interface-Bereinigung (AC: #1-4)
  - [ ] 3.1: Action-Signaturen aus TournamentState Interface entfernen
  - [ ] 3.2: Prüfen ob Types in tournament.ts betroffen sind
  - [ ] 3.3: Export-Statements bereinigen

- [ ] Task 4: Test-Dateien aktualisieren (AC: #6)
  - [ ] 4.1: `dynamic-brackets-phase1.test.ts` - WB-Pool Tests entfernen/ersetzen
  - [ ] 4.2: `dynamic-brackets-phase2.test.ts` - WB-Pool Tests entfernen/ersetzen
  - [ ] 4.3: `pool-helper-functions.test.ts` - WB-Pool Tests entfernen (ACHTUNG: existiert bereits mit Fehlern!)
  - [ ] 4.4: Alle Pool-spezifischen Assertions auf Runden-Assertions umstellen

- [ ] Task 5: UI-Bereinigung (optional)
  - [ ] 5.1: Prüfen ob Pool-Visualisierung für WB in UI verwendet wird
  - [ ] 5.2: Falls ja: Entfernen oder auf Runden-basiert umstellen

- [ ] Task 6: Regressionstests (AC: #6)
  - [ ] 6.1: Alle bestehenden Tests ausführen
  - [ ] 6.2: Sicherstellen dass Turnier-Flow weiterhin funktioniert
  - [ ] 6.3: Build erfolgreich (keine TypeScript-Fehler)

## Dev Notes

### WICHTIG: Bestehende Fehler

Die Projekt-Diagnose zeigt bereits **bestehende Fehler**:

```
/Users/jakoblehner/coding/heats/src/lib/heat-completion.ts
ERROR: Module '"./bracket-logic"' has no exported member 'createLBHeatFromPool'

/Users/jakoblehner/coding/heats/tests/pool-helper-functions.test.ts
ERROR: Module '"../src/lib/bracket-logic"' has no exported member 'createWBHeatFromPool'
ERROR: Module '"../src/lib/bracket-logic"' has no exported member 'createLBHeatFromPool'
```

Diese Dateien müssen im Rahmen dieser Story ebenfalls bereinigt werden!

### Zu entfernende Code-Bereiche

| Datei | Zeilen | Zu entfernen |
|-------|--------|--------------|
| `tournamentStore.ts` | ~31 | `winnerPool: [] as string[]` |
| `tournamentStore.ts` | ~75-76 | `winnerPool: string[]` (State Definition) |
| `tournamentStore.ts` | ~129-133 | Action Signaturen |
| `tournamentStore.ts` | ~493-508 | `addToWinnerPool`, `removeFromWinnerPool` |
| `tournamentStore.ts` | ~1238-1278 | `generateWBHeatFromPool`, `canGenerateWBFinale` |

### Migration-Strategie

1. **Erst neue Logik implementieren** (US-13.1, US-13.2)
2. **Dann alten Code entfernen** (diese Story)
3. **Tests parallel aktualisieren**

### Code-Ersetzungen in submitHeatResults()

**ALT:**
```typescript
newWinnerPool.add(ranking.pilotId)
// ...
if (newWinnerPool.size >= 4) { generateWBHeatFromPool() }
```

**NEU:**
```typescript
// Piloten für nächste Runde vormerken (in pilotBracketStates)
pilotBracketStates.get(ranking.pilotId).wbRoundReached = currentWBRound
// ...
if (isRoundComplete('winner', currentWBRound)) {
  generateWBRound(currentWBRound + 1)
}
```

### Betroffene Dateien - Vollständige Liste

| Datei | Änderungsart | Priorität |
|-------|--------------|-----------|
| `src/stores/tournamentStore.ts` | Funktionen + State entfernen | HIGH |
| `src/lib/heat-completion.ts` | Bereinigen (bereits fehlerhaft) | HIGH |
| `tests/pool-helper-functions.test.ts` | Entfernen oder aktualisieren | HIGH |
| `tests/dynamic-brackets-phase1.test.ts` | Anpassen | MEDIUM |
| `tests/dynamic-brackets-phase2.test.ts` | Anpassen | MEDIUM |

### Testing-Strategie

1. **Build-Test**: `npm run build` muss erfolgreich sein
2. **Type-Check**: `npm run typecheck` muss erfolgreich sein
3. **Unit Tests**: `npm test` muss erfolgreich sein
4. **Manuelle Prüfung**: Turnier mit 8 Piloten durchspielen

### Keine deprecated Kommentare (AC #7)

Statt:
```typescript
// @deprecated - use generateWBRound instead
generateWBHeatFromPool: () => { ... }
```

Einfach löschen:
```typescript
// Funktion komplett entfernen
```

### Abhängigkeiten

Diese Story sollte **NACH** US-13.1 und US-13.2 implementiert werden, da die neue Logik zuerst existieren muss bevor die alte entfernt werden kann.

### References

- [Source: _bmad-output/planning-artifacts/epic-13-runden-basiertes-bracket-redesign.md#US-13.6]
- [Source: _bmad-output/planning-artifacts/epic-13-runden-basiertes-bracket-redesign.md#Code-Entfernungs-Checkliste]
- [Source: src/stores/tournamentStore.ts#generateWBHeatFromPool]
- [Source: src/stores/tournamentStore.ts#winnerPool]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
