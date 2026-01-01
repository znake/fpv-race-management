# Story 1.2: Reset-Funktionen konsolidieren

**Epic:** Store Refactoring
**Aufwand:** S
**Priorität:** 2 (Sprint 2)
**Abhängigkeiten:** Story 1.1 muss zuerst abgeschlossen sein

## Beschreibung

Als Entwickler möchte ich die 4 nahezu identischen Reset-Funktionen (`resetTournament`, `deleteAllPilots`, `resetAll`, `clearAllPilots`) zu einer generischen `reset(options)` Funktion konsolidieren, damit Code-Duplikation eliminiert wird und zukünftige Änderungen am State nur an einer Stelle erfolgen müssen.

## Akzeptanzkriterien

- [ ] AC1: Neue interne Funktion `reset(options: { keepPilots?: boolean, clearLocalStorage?: boolean })` implementiert
- [ ] AC2: `resetTournament()` ruft `reset({ keepPilots: true })` auf
- [ ] AC3: `deleteAllPilots()` ruft `reset({ keepPilots: false })` auf
- [ ] AC4: `resetAll()` ruft `reset({ keepPilots: false, clearLocalStorage: true })` auf
- [ ] AC5: `clearAllPilots()` ist ein Alias für `deleteAllPilots()` oder deprecated
- [ ] AC6: Reset verwendet `INITIAL_TOURNAMENT_STATE` aus Story 1.1
- [ ] AC7: Alle bestehenden Tests in `reset-functions.test.ts` bleiben grün

## Technische Details

### Betroffene Dateien
- `src/stores/tournamentStore.ts`

### Aktueller Zustand (zu refaktorieren)

Zeilen 418-488, 576-595 enthalten 4 fast identische Funktionen:

```typescript
// Zeile 418-438: resetTournament
// Zeile 441-461: deleteAllPilots  
// Zeile 464-488: resetAll
// Zeile 576-595: clearAllPilots
```

### Ziel-Implementierung

```typescript
// Interne Helper-Funktion
const performReset = (options: { 
  keepPilots?: boolean; 
  clearLocalStorage?: boolean 
} = {}) => {
  const { keepPilots = false, clearLocalStorage = false } = options;
  
  set({
    ...INITIAL_TOURNAMENT_STATE,
    pilots: keepPilots ? get().pilots : [],
  });
  
  if (clearLocalStorage) {
    localStorage.removeItem('tournament-storage');
  }
};

// Öffentliche Actions (bleiben für API-Kompatibilität)
resetTournament: () => performReset({ keepPilots: true }),
deleteAllPilots: () => performReset({ keepPilots: false }),
resetAll: () => performReset({ keepPilots: false, clearLocalStorage: true }),
clearAllPilots: () => performReset({ keepPilots: false }), // Alias oder deprecated
```

## Testplan

1. `npm test -- reset-functions.test.ts` - spezifische Reset-Tests
2. `npm test` - alle Tests müssen grün bleiben
3. Manuelle Prüfung:
   - "Turnier zurücksetzen" behält Piloten
   - "Alles zurücksetzen" löscht alles inkl. localStorage
   - "Alle Piloten löschen" löscht nur Piloten
