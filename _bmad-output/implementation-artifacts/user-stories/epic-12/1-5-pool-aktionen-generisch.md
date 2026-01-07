# Story 1.5: Pool-Aktionen generisch implementieren

**Epic:** Store Refactoring
**Aufwand:** S
**Priorität:** 5 (Sprint 5)
**Abhängigkeiten:** Keine

## Beschreibung

Als Entwickler möchte ich die nahezu identischen Pool-Aktionen (`addToLoserPool`/`addToWinnerPool` und `removeFromLoserPool`/`removeFromWinnerPool`) durch eine generische Factory-Funktion ersetzen, damit zukünftige Pool-Operationen konsistent sind und Code-Duplikation eliminiert wird.

## Akzeptanzkriterien

- [ ] AC1: Generische Helper-Funktion für Pool-Add implementiert
- [ ] AC2: `addToLoserPool` und `addToWinnerPool` verwenden dieselbe generische Implementierung
- [ ] AC3: `removeFromLoserPool` verwendet generische Implementierung
- [ ] AC4: Funktionalität unverändert - alle Tests bleiben grün
- [ ] AC5: Keine Breaking Changes an der öffentlichen Store-API

## Technische Details

### Betroffene Dateien
- `src/stores/tournamentStore.ts`

### Aktueller Zustand (Zeilen 598-647)

```typescript
// addToLoserPool (598-605)
addToLoserPool: (pilotIds) => {
  const { loserPool } = get()
  const existingIds = new Set(loserPool)
  const newPilots = pilotIds.filter(id => !existingIds.has(id))
  if (newPilots.length > 0) {
    set({ loserPool: [...loserPool, ...newPilots] })
  }
}

// addToWinnerPool (631-638) - IDENTISCH, nur anderer Key
addToWinnerPool: (pilotIds) => {
  const { winnerPool } = get()
  const existingIds = new Set(winnerPool)
  const newPilots = pilotIds.filter(id => !existingIds.has(id))
  if (newPilots.length > 0) {
    set({ winnerPool: [...winnerPool, ...newPilots] })
  }
}
```

### Ziel-Implementierung

```typescript
// Generische Helper (außerhalb des Stores oder als lokale Funktion)
type PoolKey = 'loserPool' | 'winnerPool' | 'grandFinalePool';

const addToPool = (
  currentPool: string[], 
  pilotIds: string[]
): string[] => {
  const existingIds = new Set(currentPool);
  const newPilots = pilotIds.filter(id => !existingIds.has(id));
  return newPilots.length > 0 ? [...currentPool, ...newPilots] : currentPool;
};

const removeFromPoolByIds = (
  currentPool: string[], 
  pilotIds: string[]
): string[] => {
  const idsToRemove = new Set(pilotIds);
  return currentPool.filter(id => !idsToRemove.has(id));
};

// Im Store:
addToLoserPool: (pilotIds) => {
  const newPool = addToPool(get().loserPool, pilotIds);
  if (newPool !== get().loserPool) {
    set({ loserPool: newPool });
  }
},

addToWinnerPool: (pilotIds) => {
  const newPool = addToPool(get().winnerPool, pilotIds);
  if (newPool !== get().winnerPool) {
    set({ winnerPool: newPool });
  }
},

removeFromLoserPool: (pilotIds) => {
  set({ loserPool: removeFromPoolByIds(get().loserPool, pilotIds) });
},
```

### Hinweis zu removeFromWinnerPool

`removeFromWinnerPool(count: number)` hat eine andere Signatur (entfernt N Piloten von vorne) - diese bleibt separat:

```typescript
removeFromWinnerPool: (count) => {
  set({ winnerPool: get().winnerPool.slice(count) });
},
```

## Testplan

1. `npm test -- loser-pool.test.ts` - Pool-spezifische Tests
2. `npm test` - alle Tests müssen grün bleiben
3. Manuelle Prüfung: Pool-Operationen im Turnier funktionieren korrekt
