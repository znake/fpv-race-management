# Story 1.3: HeatForHelper Type durch Pick ersetzen

**Epic:** Store Refactoring
**Aufwand:** XS
**Priorität:** 1 (Sprint 1)
**Abhängigkeiten:** Keine

## Beschreibung

Als Entwickler möchte ich das duplizierte `HeatForHelper` Interface (Zeile 22-34) durch `Pick<Heat, ...>` ersetzen, damit Type-Änderungen am `Heat` Interface automatisch propagiert werden und keine Inkonsistenzen entstehen.

## Akzeptanzkriterien

- [ ] AC1: `HeatForHelper` Interface entfernt
- [ ] AC2: Neuer Type `type HeatInput = Pick<Heat, 'id' | 'heatNumber' | 'pilotIds' | 'status' | 'bracketType' | 'isFinale' | 'roundName' | 'results'>` definiert
- [ ] AC3: Helper-Funktionen `createWBHeatFromPool` und `createLBHeatFromPool` verwenden den neuen Type
- [ ] AC4: TypeScript-Kompilierung erfolgreich
- [ ] AC5: Alle bestehenden Tests bleiben grün

## Technische Details

### Betroffene Dateien
- `src/stores/tournamentStore.ts`

### Aktueller Zustand

```typescript
// Zeile 22-34: Lokale Hilfstyp-Definition
interface HeatForHelper {
  id: string
  heatNumber: number
  pilotIds: string[]
  status: 'pending' | 'active' | 'completed'
  bracketType?: 'loser' | 'grand_finale' | 'qualification' | 'winner' | 'finale'
  isFinale?: boolean
  roundName?: string
  results?: { rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[] ... }
}

// Zeile 125-138: Heat Interface (fast identisch!)
export interface Heat {
  // ...
}
```

### Ziel-Implementierung

```typescript
// HeatForHelper Interface ENTFERNEN

// Neuen Type definieren (nach Heat Interface):
type HeatInput = Pick<Heat, 
  | 'id' 
  | 'heatNumber' 
  | 'pilotIds' 
  | 'status' 
  | 'bracketType' 
  | 'isFinale' 
  | 'roundName' 
  | 'results'
>;

// Helper-Funktionen anpassen:
function createWBHeatFromPool(
  winnerPool: Set<string>,
  currentHeats: HeatInput[]  // statt HeatForHelper[]
): { heat: HeatInput | null; updatedPool: Set<string> }
```

## Testplan

1. `npx tsc --noEmit` - TypeScript-Kompilierung prüfen
2. `npm test` - alle Tests müssen grün bleiben
3. IDE: Keine Type-Fehler in tournamentStore.ts
