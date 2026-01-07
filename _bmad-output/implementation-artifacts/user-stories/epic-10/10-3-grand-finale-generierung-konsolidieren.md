# Story 10.3: Grand-Finale-Generierung konsolidieren

**Status:** ready
**Updated:** 2025-12-26
**Story Points:** 3
**Type:** Technical Refactoring

## Story

Als **Entwickler**,
möchte ich **die zwei verschiedenen Grand-Finale-Generierungs-Implementierungen auf eine einzige konsolidieren**,
damit **das Verhalten konsistent ist und Änderungen nur an einer Stelle gemacht werden müssen**.

## Hintergrund

Die Grand-Finale-Generierung ist aktuell an 2 Stellen implementiert:

### Implementierung 1: bracket-logic.ts (Zeilen ~405-422)
```typescript
export function generateGrandFinaleHeat(
  bracketStructure: FullBracketStructure,
  existingHeats: Heat[]
): Heat | null {
  if (!bracketStructure.grandFinale) return null
  if (!isGrandFinaleReady(bracketStructure)) return null
  
  // Check if already generated
  const alreadyExists = existingHeats.some(h => h.id === bracketStructure.grandFinale!.id)
  if (alreadyExists) return null
  
  return {
    id: bracketStructure.grandFinale.id,
    heatNumber: existingHeats.length + 1,
    pilotIds: [...bracketStructure.grandFinale.pilotIds],
    status: 'active',
  }
}
```

### Implementierung 2: tournamentStore.ts generateGrandFinale() (Zeilen ~1254-1293)
```typescript
generateGrandFinale: () => {
  const { heats, fullBracketStructure } = get()

  if (!fullBracketStructure?.grandFinale) {
    return null
  }

  // Check if Grand Finale is already generated
  const alreadyExists = heats.find(h => h.bracketType === 'grand_finale' || h.bracketType === 'finale')
  if (alreadyExists) {
    return null
  }

  // WB Winner is in grandFinale.pilotIds (from bracket structure)
  const wbWinnerId = fullBracketStructure.grandFinale.pilotIds[0]
  const lbWinnerId = fullBracketStructure.grandFinale.pilotIds[1]

  if (!wbWinnerId || !lbWinnerId) {
    return null
  }

  // Create Grand Finale heat
  const grandFinale: Heat = {
    id: crypto.randomUUID(),  // UNTERSCHIED: Neue ID statt bracketStructure.grandFinale.id
    heatNumber: heats.length + 1,
    pilotIds: [wbWinnerId, lbWinnerId],
    status: 'active',
    bracketType: 'grand_finale',  // UNTERSCHIED: Zusätzliche Properties
    isFinale: true,
    roundName: 'Grand Finale'
  }

  // Add to heats array and set phase to finale
  set({
    heats: [...heats, grandFinale],
    tournamentPhase: 'finale'
  })

  return grandFinale
}
```

### Unterschiede zwischen den Implementierungen

| Aspekt | bracket-logic.ts | tournamentStore.ts |
|--------|------------------|-------------------|
| Heat-ID | Aus bracketStructure.grandFinale.id | Neue UUID via crypto.randomUUID() |
| bracketType | Nicht gesetzt | `'grand_finale'` |
| isFinale | Nicht gesetzt | `true` |
| roundName | Nicht gesetzt | `'Grand Finale'` |
| Ready-Check | `isGrandFinaleReady()` | Manuell (pilotIds vorhanden) |
| Already-Exists Check | ID-basiert | bracketType-basiert |
| State-Mutation | Keine (pure function) | Ja (set()) |

### Problem

- **Inkonsistente Heat-Struktur:** Je nachdem welcher Codepfad das Grand Finale erstellt, hat der Heat unterschiedliche Properties
- **ID-Inkonsistenz:** Unterschiedliche ID-Generierung kann zu Problemen bei der Heat-Suche führen
- **Doppelte Wartung:** Änderungen müssen an 2 Stellen gemacht werden

### Wo werden die Funktionen aufgerufen?

1. **bracket-logic.ts `generateGrandFinaleHeat()`:**
   - Wird in `submitHeatResults()` aufgerufen (Zeile ~759)
   - Verwendet wenn `isGrandFinaleReady()` true zurückgibt

2. **tournamentStore.ts `generateGrandFinale()`:**
   - Store-Action, kann von Components aufgerufen werden
   - Aktuell nicht aktiv genutzt in Components (nach Code-Suche)

## Acceptance Criteria

### AC1: Eine kanonische Implementierung

**Given** zwei verschiedene Grand-Finale-Generierungs-Implementierungen existieren
**When** das Refactoring durchgeführt wird
**Then** existiert nur noch eine Implementierung
**And** alle Aufrufer nutzen diese eine Implementierung

### AC2: Konsistente Heat-Struktur

**Given** ein Grand Finale wird generiert
**Then** hat der Heat immer die gleiche Struktur:
  - `bracketType: 'grand_finale'`
  - `isFinale: true`
  - `roundName: 'Grand Finale'`
**And** das gilt unabhängig vom Codepfad

### AC3: Konsistente ID-Generierung

**Given** ein Grand Finale wird generiert
**When** eine bracketStructure.grandFinale.id existiert
**Then** wird diese ID verwendet
**And** keine neue UUID generiert

### AC4: Keine funktionalen Änderungen

**Given** das Refactoring ist abgeschlossen
**When** alle bestehenden Tests ausgeführt werden
**Then** sind alle Tests grün
**And** das Turnier-Finale-Verhalten ist identisch

### AC5: submitHeatResults() nutzt konsolidierte Funktion

**Given** submitHeatResults() ruft aktuell bracket-logic.ts Funktion auf
**When** das Refactoring durchgeführt wird
**Then** ruft submitHeatResults() die konsolidierte Funktion auf
**And** der Heat hat alle erwarteten Properties

## Technische Anforderungen

### Empfohlener Ansatz: bracket-logic.ts erweitern

Die pure function in bracket-logic.ts sollte um die fehlenden Properties erweitert werden:

```typescript
// bracket-logic.ts - ERWEITERT
export function generateGrandFinaleHeat(
  bracketStructure: FullBracketStructure,
  existingHeats: Heat[]
): Heat | null {
  if (!bracketStructure.grandFinale) return null
  if (!isGrandFinaleReady(bracketStructure)) return null
  
  // Check if already generated (beide Checks für Kompatibilität)
  const alreadyExists = existingHeats.some(h => 
    h.id === bracketStructure.grandFinale!.id ||
    h.bracketType === 'grand_finale' ||
    h.bracketType === 'finale'
  )
  if (alreadyExists) return null
  
  return {
    id: bracketStructure.grandFinale.id,  // Bestehende ID nutzen
    heatNumber: existingHeats.length + 1,
    pilotIds: [...bracketStructure.grandFinale.pilotIds],
    status: 'active',
    bracketType: 'grand_finale',  // NEU
    isFinale: true,               // NEU
    roundName: 'Grand Finale'     // NEU
  }
}
```

### Store-Methode vereinfachen

```typescript
// tournamentStore.ts - VEREINFACHT
generateGrandFinale: () => {
  const { heats, fullBracketStructure } = get()
  
  // Delegiere an pure function
  const finaleHeat = generateGrandFinaleHeat(fullBracketStructure, heats)
  
  if (!finaleHeat) return null
  
  // Nur State-Mutation bleibt hier
  set({
    heats: [...heats, finaleHeat],
    tournamentPhase: 'finale'
  })
  
  return finaleHeat
}
```

### submitHeatResults() Anpassung

Der Aufruf in submitHeatResults() (Zeile ~759) bleibt gleich, da er bereits die bracket-logic.ts Funktion nutzt. Durch die Erweiterung der Funktion bekommt der Heat nun automatisch die zusätzlichen Properties.

## Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| ID-Konflikte bei bestehenden Turnieren | Niedrig | Mittel | Already-Exists-Check erweitert |
| getTop4Pilots() findet Grand Finale nicht | Mittel | Hoch | Test für Top4 nach Refactoring |
| Victory Ceremony bricht | Mittel | Hoch | finale-ceremony.test.tsx ausführen |

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/lib/bracket-logic.ts` | `generateGrandFinaleHeat()` erweitern (bracketType, isFinale, roundName) |
| `src/stores/tournamentStore.ts` | `generateGrandFinale()` auf bracket-logic.ts Funktion delegieren |

## Tasks

- [ ] **Task 1:** bracket-logic.ts `generateGrandFinaleHeat()` erweitern (AC: 1, 2, 3)
  - [ ] bracketType: 'grand_finale' hinzufügen
  - [ ] isFinale: true hinzufügen
  - [ ] roundName: 'Grand Finale' hinzufügen
  - [ ] Already-Exists-Check erweitern (ID + bracketType)
- [ ] **Task 2:** Tests für erweiterte Funktion anpassen/hinzufügen (AC: 2)
  - [ ] Test: generierter Heat hat alle Properties
  - [ ] Test: keine doppelte Generierung bei verschiedenen Checks
- [ ] **Task 3:** tournamentStore.ts `generateGrandFinale()` refactoren (AC: 1)
  - [ ] Import der bracket-logic.ts Funktion hinzufügen (falls nicht vorhanden)
  - [ ] Logik durch Funktionsaufruf ersetzen
  - [ ] Nur State-Mutation beibehalten
- [ ] **Task 4:** Vollständiger Testlauf (AC: 4, 5)
  - [ ] Besonders: finale-ceremony.test.tsx
  - [ ] Besonders: lb-finale.test.ts
  - [ ] Besonders: bracket-progression.test.ts
- [ ] **Task 5:** Manueller Test: Turnier bis Grand Finale durchspielen
- [ ] **Task 6:** Code-Review: Keine doppelte Logik mehr vorhanden

## Dev Notes

### Abhängigkeiten
- **Hängt ab von:** Story 10-1 sollte vorher abgeschlossen sein (submitHeatResults() wird in 10-1 refactored)
- Kann parallel zu 10-2 bearbeitet werden

### Bestehende Tests

Kritische Tests für Grand-Finale-Verhalten:
- `tests/finale-ceremony.test.tsx` - Victory Ceremony nach Grand Finale
- `tests/lb-finale.test.ts` - LB Finale führt zu Grand Finale
- `tests/bracket-progression.test.ts` - Bracket-Progression bis Finale

### Impact-Analyse

Die Änderung der Heat-Struktur (zusätzliche Properties) hat potenziell Impact auf:
- `getTop4Pilots()` - sucht nach Grand Finale Results
- `completeTournament()` - setzt grandFinale.status
- Victory Ceremony Component - zeigt Top 4 an

Alle diese Stellen sollten weiterhin funktionieren, da sie nach heat.results und bracketStructure.grandFinale suchen, nicht nach den neuen Properties.

### Backward Compatibility

Bestehende Turniere (in localStorage) könnten Grand Finale Heats ohne die neuen Properties haben. Dies ist kein Problem, da:
1. Die neuen Properties optional sind (TypeScript `?`)
2. Die Logik nach ID oder bracketType sucht (beide funktionieren)

## Definition of Done

### Funktional
- [ ] Nur eine Grand-Finale-Generierungs-Logik existiert (in bracket-logic.ts)
- [ ] Store-Methode delegiert an bracket-logic.ts
- [ ] Generierte Heats haben konsistente Struktur

### Code-Qualität
- [ ] ~30 Zeilen duplizierter Code entfernt
- [ ] Keine TypeScript-Fehler
- [ ] Clear separation: Pure function vs. State-Mutation

### Tests
- [ ] Alle bestehenden Tests grün
- [ ] finale-ceremony.test.tsx grün
- [ ] lb-finale.test.ts grün
- [ ] Manueller Smoke-Test: Turnier bis Ende durchspielbar
