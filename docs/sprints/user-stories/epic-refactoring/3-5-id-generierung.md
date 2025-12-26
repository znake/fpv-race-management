# Story 3.5: ID-Generierung standardisieren

**Epic:** Utils & Types Refactoring
**Aufwand:** S
**Priorität:** 5 (Sprint 5)
**Abhängigkeiten:** Story 3.1 sollte abgeschlossen sein (utils.ts aufgeräumt)

## Beschreibung

Als Entwickler möchte ich eine einheitliche ID-Generierung für alle Entitäten (Heats, Piloten, etc.), damit Debugging einfacher ist, IDs konsistent formatiert sind und keine Inkonsistenzen bei ID-Formaten auftreten.

## Akzeptanzkriterien

- [ ] AC1: Utility-Funktion `generateId(prefix: string): string` in `utils.ts` erstellt
- [ ] AC2: Alle Heat-IDs nutzen Format `{prefix}-{uuid}` (z.B. `quali-heat-abc123...`, `wb-heat-abc123...`)
- [ ] AC3: `crypto.randomUUID()` Aufrufe in tournamentStore.ts nutzen `generateId()`
- [ ] AC4: `Date.now()` basierte IDs werden durch UUID ersetzt
- [ ] AC5: Bracket-Heats in `bracket-structure-generator.ts` nutzen `generateId('bracket')`
- [ ] AC6: Alle Tests laufen weiterhin erfolgreich

## Technische Details

### Betroffene Dateien
- `src/lib/utils.ts` → `generateId()` Funktion hinzufügen
- `src/stores/tournamentStore.ts` → ID-Generierung vereinheitlichen
- `src/lib/bracket-structure-generator.ts` → ID-Generierung vereinheitlichen

### Aktuelle Inkonsistenzen

```typescript
// tournamentStore.ts - verschiedene Patterns:
id: crypto.randomUUID()                           // Zeile 267, 387
id: `wb-heat-${crypto.randomUUID()}`              // createWBHeatFromPool
id: `lb-heat-${crypto.randomUUID()}`              // createLBHeatFromPool
id: `wb-finale-${Date.now()}`                     // generateWBFinale
id: `wb-heat-${Date.now()}-${Math.random()...}`   // generateWBHeatFromPool

// bracket-structure-generator.ts:
id: `bracket-heat-${heatCounter++}`               // Counter-basiert
```

### Neue generateId Funktion

```typescript
// src/lib/utils.ts

/**
 * Generates a unique ID with an optional prefix
 * Format: {prefix}-{uuid} or just {uuid}
 * 
 * @param prefix - Optional prefix for the ID (e.g., 'pilot', 'wb-heat', 'lb-heat')
 * @returns A unique identifier string
 * 
 * @example
 * generateId('pilot')     // 'pilot-a1b2c3d4-e5f6-...'
 * generateId('wb-heat')   // 'wb-heat-a1b2c3d4-e5f6-...'
 * generateId()            // 'a1b2c3d4-e5f6-...'
 */
export function generateId(prefix?: string): string {
  const uuid = crypto.randomUUID();
  return prefix ? `${prefix}-${uuid}` : uuid;
}
```

### ID-Präfix-Schema

| Entity | Präfix | Beispiel |
|--------|--------|----------|
| Pilot | `pilot` | `pilot-a1b2c3d4-...` |
| Quali-Heat | `quali` | `quali-a1b2c3d4-...` |
| WB-Heat | `wb` | `wb-a1b2c3d4-...` |
| LB-Heat | `lb` | `lb-a1b2c3d4-...` |
| WB-Finale | `wb-finale` | `wb-finale-a1b2c3d4-...` |
| LB-Finale | `lb-finale` | `lb-finale-a1b2c3d4-...` |
| Grand Finale | `gf` | `gf-a1b2c3d4-...` |
| Bracket-Heat | `bracket` | `bracket-a1b2c3d4-...` |

### Migration in tournamentStore.ts

```typescript
import { generateId } from '../lib/utils';

// Vorher:
addPilot: (pilot) => {
  const newPilot = { ...pilot, id: crypto.randomUUID(), ... }
}

// Nachher:
addPilot: (pilot) => {
  const newPilot = { ...pilot, id: generateId('pilot'), ... }
}

// Vorher:
id: `wb-heat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Nachher:
id: generateId('wb')
```

### Migration in bracket-structure-generator.ts

```typescript
import { generateId } from './utils';

// Vorher:
let heatCounter = 1;
// ...
id: `bracket-heat-${heatCounter++}`

// Nachher:
id: generateId('bracket')

// Hinweis: Counter ist nicht mehr nötig für Eindeutigkeit
```

### Optional: Short-IDs für bessere Lesbarkeit

Falls kürzere IDs gewünscht sind (8 Zeichen statt volle UUID):

```typescript
export function generateId(prefix?: string): string {
  const shortId = crypto.randomUUID().split('-')[0]; // Erste 8 Zeichen
  return prefix ? `${prefix}-${shortId}` : shortId;
}
```

**Entscheidung:** Volle UUID ist sicherer und wird empfohlen.

## Testplan

1. `npm test` - alle Tests müssen grün bleiben
2. Prüfe ID-Format in laufender App:
   - Neuen Piloten hinzufügen → ID prüfen
   - Turnier starten → Heat-IDs prüfen
3. Prüfe dass keine `Date.now()` IDs mehr generiert werden:
   ```bash
   grep -r "Date.now()" src/ | grep -v node_modules
   ```
