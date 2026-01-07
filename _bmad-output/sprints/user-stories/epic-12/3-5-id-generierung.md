# Story 3.5: ID-Generierung standardisieren

**Epic:** Utils & Types Refactoring
**Aufwand:** S
**Priorität:** 5 (Sprint 5)
**Abhängigkeiten:** Story 3.1 sollte abgeschlossen sein (utils.ts aufgeräumt)

## Beschreibung

Als Entwickler möchte ich eine einheitliche ID-Generierung für alle Entitäten (Heats, Piloten, etc.), damit Debugging einfacher ist, IDs konsistent formatiert sind und keine Inkonsistenzen bei ID-Formaten auftreten.

## Akzeptanzkriterien

- [x] AC1: Utility-Funktion `generateId(prefix: string): string` in `utils.ts` erstellt
- [x] AC2: Alle Heat-IDs nutzen Format `{prefix}-{uuid}` (z.B. `quali-heat-abc123...`, `wb-heat-abc123...`)
- [x] AC3: `crypto.randomUUID()` Aufrufe in tournamentStore.ts nutzen `generateId()`
- [x] AC4: `Date.now()` basierte IDs werden durch UUID ersetzt
- [x] AC5: Bracket-Heats in `bracket-structure-generator.ts` nutzen `generateId('bracket')`
- [x] AC6: Alle Tests laufen weiterhin erfolgreich

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

---

## Dev Agent Record

### Implementation Plan

1. **RED Phase:** Created comprehensive tests for `generateId()` function
2. **GREEN Phase:** Implemented `generateId(prefix?: string): string` in `utils.ts`
3. **REFACTOR Phase:** Migrated all ID generation sites to use `generateId()`

### Completion Notes

✅ **AC1:** `generateId()` Funktion in `src/lib/utils.ts` erstellt
- Funktion generiert UUID mit optionalem Prefix
- Format: `{prefix}-{uuid}` oder nur `{uuid}` bei leerem Prefix
- Volle UUID (36 Zeichen) verwendet für bessere Sicherheit

✅ **AC2:** Alle Heat-IDs nutzen `{prefix}-{uuid}` Format
- Quali-Heats: `quali-{uuid}`
- WB-Heats: `wb-{uuid}`
- LB-Heats: `lb-{uuid}`
- WB-Finale: `wb-finale-{uuid}`
- LB-Finale: `lb-finale-{uuid}`
- Bracket-Heats: `bracket-{uuid}`

✅ **AC3:** `crypto.randomUUID()` Aufrufe in tournamentStore.ts ersetzt
- `addPilot()`: `generateId('pilot')` statt `crypto.randomUUID()`
- `generateHeats()`: `generateId('quali')` für Quali-Heats
- `generateLBFinale()`: `generateId('lb-finale')` statt `crypto.randomUUID()`
- `generateLBHeat()`: `generateId('lb')` statt Template String
- `generateWBHeatFromPool()`: `generateId('wb')` statt Template String
- `generateWBFinale()`: `generateId('wb-finale')` statt Template String

✅ **AC4:** `Date.now()` basierte IDs durch UUID ersetzt
- `generateWBHeatFromPool()`: War `wb-heat-${Date.now()}-${Math.random()...}`
- `generateWBFinale()`: War `wb-finale-${Date.now()}`
- Alle `Date.now()` Aufrufe entfernt, verifiziert via `grep -r "Date.now()" src/`

✅ **AC5:** Bracket-Heats in `bracket-structure-generator.ts` nutzen `generateId('bracket')`
- War: `const generateHeatId = () => \`bracket-heat-${heatCounter++}\``
- Jetzt: `const generateHeatId = () => generateId('bracket')`
- Counter `heatCounter` weiterhin für `heatNumber` Feld beibehalten

✅ **AC6:** Alle Tests laufen weiterhin erfolgreich
- Neue Tests: `tests/generate-id.test.ts` (6 Tests, alle grün)
- Bestehende Tests: Keine Regressions festgestellt
- Build: TypeScript-Kompilierung erfolgreich

### Technical Decisions

1. **Volle UUID statt Short-ID**: Story bietet Short-ID Option, aber volle UUID gewählt für:
   - Bessere Kollisionssicherheit
   - Industry Standard (RFC 4122)
   - Einfache Implementierung ohne zusätzliche Logik

2. **Prefix-Schema konsistent mit Story-Spezifikation**:
   - Pilot: `pilot-{uuid}`
   - Quali: `quali-{uuid}` (nicht `quali-heat-{uuid}` - verkürzt für Lesbarkeit)
   - WB: `wb-{uuid}`
   - LB: `lb-{uuid}`
   - Finale: `{bracket}-finale-{uuid}`
   - Bracket: `bracket-{uuid}`

3. **Counter weiterhin für heatNumber**: bracket-structure-generator.ts nutzt weiterhin Counter für `heatNumber` Feld, da dies für Heat-Reihenfolge in UI relevant ist, nicht für ID-Eindeutigkeit.

### Test Coverage

- ✅ Unit Tests für `generateId()`: 6 Tests
  - UUID ohne Prefix
  - UUID mit Prefix
  - Eindeutigkeit (1000 IDs ohne Kollision)
  - Verschiedene Entity-Präfixe
  - Hyphenated Prefixes
  - Leerer Prefix

---

## File List

### Geänderte Dateien

- `src/lib/utils.ts` - `generateId()` Funktion hinzugefügt
- `src/stores/tournamentStore.ts` - Alle ID-Generierung zu `generateId()` migriert
- `src/lib/bracket-structure-generator.ts` - Bracket-Heat-ID-Generierung zu `generateId('bracket')` migriert

### Neue Dateien

- `tests/generate-id.test.ts` - Tests für `generateId()` Funktion

---

## Status: Ready for Review

**Datum:** 2025-12-26
**Implementierung:** Abgeschlossen
**Tests:** Alle bestanden
**Build:** Erfolgreich
