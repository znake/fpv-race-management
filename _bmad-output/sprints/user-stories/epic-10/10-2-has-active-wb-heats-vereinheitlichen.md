# Story 10.2: hasActiveWBHeats-Prüfung vereinheitlichen

**Status:** ready
**Updated:** 2025-12-26
**Story Points:** 2
**Type:** Technical Refactoring

## Story

Als **Entwickler**,
möchte ich **die dreifach implementierte hasActiveWBHeats-Prüfung auf eine einzige Store-Methode reduzieren**,
damit **die Logik konsistent ist und Änderungen nur an einer Stelle gemacht werden müssen**.

## Hintergrund

Die Prüfung "Gibt es noch aktive/pending WB-Heats?" ist aktuell an 3 Stellen implementiert:

### Implementierung 1: Store-Methode (Zeilen ~1144-1166)
```typescript
hasActiveWBHeats: () => {
  const { fullBracketStructure, heats } = get()
  if (!fullBracketStructure) return false
  for (const round of fullBracketStructure.winnerBracket.rounds) {
    for (const bracketHeat of round.heats) {
      const actualHeat = heats.find(h => h.id === bracketHeat.id)
      if (actualHeat) {
        if (actualHeat.status === 'pending' || actualHeat.status === 'active') {
          return true
        }
      } else if (bracketHeat.pilotIds.length > 0 && bracketHeat.status !== 'completed') {
        return true
      }
    }
  }
  return false
}
```

### Implementierung 2: Inline in submitHeatResults() (Zeilen ~848-865)
```typescript
let hasActiveWB = false
if (updatedBracketStructure) {
  for (const round of updatedBracketStructure.winnerBracket.rounds) {
    for (const wbHeat of round.heats) {
      const actualHeat = updatedHeats.find(h => h.id === wbHeat.id)
      if (actualHeat) {
        if (actualHeat.status === 'pending' || actualHeat.status === 'active') {
          hasActiveWB = true
          break
        }
      } else if (wbHeat.pilotIds.length > 0 && wbHeat.status !== 'completed') {
        hasActiveWB = true
        break
      }
    }
    if (hasActiveWB) break
  }
}
```

### Implementierung 3: useMemo in bracket-tree.tsx (Zeilen ~951-966)
```typescript
const hasActiveWBHeats = useMemo(() => {
  if (!fullBracketStructure) return false
  for (const round of fullBracketStructure.winnerBracket.rounds) {
    for (const bracketHeat of round.heats) {
      const actualHeat = heats.find(h => h.id === bracketHeat.id)
      if (actualHeat) {
        if (actualHeat.status === 'pending' || actualHeat.status === 'active') {
          return true
        }
      } else if (bracketHeat.pilotIds.length > 0 && bracketHeat.status !== 'completed') {
        return true
      }
    }
  }
  return false
}, [fullBracketStructure, heats])
```

### Problem

- **Wartbarkeit:** Änderungen müssen an 3 Stellen gemacht werden
- **Konsistenz-Risiko:** Die Implementierungen könnten divergieren
- **Code-Duplikation:** ~60 Zeilen identischer Logik

## Acceptance Criteria

### AC1: bracket-tree.tsx nutzt Store-Methode

**Given** bracket-tree.tsx hat eine eigene useMemo-Implementierung von hasActiveWBHeats
**When** das Refactoring durchgeführt wird
**Then** wird die useMemo-Berechnung durch einen Aufruf von `useTournamentStore(state => state.hasActiveWBHeats())` ersetzt
**And** das Verhalten ist identisch

### AC2: submitHeatResults() nutzt Store-Methode oder Pure Function

**Given** submitHeatResults() hat eine inline hasActiveWB Berechnung
**When** das Refactoring durchgeführt wird
**Then** wird die inline Logik durch einen Aufruf einer zentralen Funktion ersetzt
**And** das Verhalten ist identisch (bestehende Tests grün)

### AC3: Nur eine kanonische Implementierung

**Given** das Refactoring ist abgeschlossen
**Then** existiert die hasActiveWBHeats-Logik nur noch an einer Stelle
**And** alle Aufrufer nutzen diese eine Stelle

### AC4: Keine funktionalen Änderungen

**Given** das Refactoring ist abgeschlossen
**When** alle bestehenden Tests ausgeführt werden
**Then** sind alle Tests grün ohne Änderungen an den Test-Dateien

## Technische Anforderungen

### Herausforderung: submitHeatResults() State

Die Inline-Berechnung in `submitHeatResults()` arbeitet mit lokalem State (`updatedBracketStructure`, `updatedHeats`), der noch nicht im Store ist. Die Store-Methode `hasActiveWBHeats()` liest aus `get()`.

**Lösungsansätze:**

#### Ansatz A: Pure Function extrahieren (Empfohlen)
```typescript
// Neue pure function in bracket-logic.ts oder utils
export function checkHasActiveWBHeats(
  bracketStructure: FullBracketStructure | null,
  heats: Heat[]
): boolean {
  if (!bracketStructure) return false
  // ... Logik ...
}

// Store-Methode nutzt pure function
hasActiveWBHeats: () => {
  const { fullBracketStructure, heats } = get()
  return checkHasActiveWBHeats(fullBracketStructure, heats)
}

// submitHeatResults nutzt pure function mit lokalem State
const hasActiveWB = checkHasActiveWBHeats(updatedBracketStructure, updatedHeats)

// bracket-tree.tsx nutzt Store-Methode
const hasActiveWBHeats = useTournamentStore(state => state.hasActiveWBHeats())
```

#### Ansatz B: Store-Methode mit Parameter (Alternative)
```typescript
hasActiveWBHeats: (
  overrideStructure?: FullBracketStructure,
  overrideHeats?: Heat[]
) => {
  const { fullBracketStructure, heats } = get()
  const structure = overrideStructure ?? fullBracketStructure
  const heatList = overrideHeats ?? heats
  // ... Logik ...
}
```

**Empfehlung:** Ansatz A ist sauberer und testbarer.

### Neue Datei/Export

```typescript
// src/lib/bracket-logic.ts (oder neuer utils-file)
export function checkHasActiveWBHeats(
  bracketStructure: FullBracketStructure | null,
  heats: Heat[]
): boolean
```

## Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Regression bei LB-Heat-Generierung | Mittel | Hoch | hasActiveWB steuert Pool-Threshold (4 vs 3) |
| Performance-Regression in bracket-tree | Niedrig | Niedrig | Store-Methode ist genauso effizient |
| Falsche Abhängigkeiten in useMemo | Niedrig | Mittel | Store subscription ist automatisch reaktiv |

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/lib/bracket-logic.ts` | Neue pure function `checkHasActiveWBHeats` exportieren |
| `src/stores/tournamentStore.ts` | Store-Methode refactoren, inline Logik ersetzen |
| `src/components/bracket-tree.tsx` | useMemo durch Store-Aufruf ersetzen |

## Tasks

- [ ] **Task 1:** Pure function `checkHasActiveWBHeats()` in bracket-logic.ts erstellen (AC: 3)
  - [ ] Logik aus Store-Methode extrahieren
  - [ ] Exportieren
  - [ ] Unit-Test schreiben
- [ ] **Task 2:** Store-Methode `hasActiveWBHeats()` refactoren (AC: 2, 3)
  - [ ] Pure function aufrufen statt inline Logik
  - [ ] Tests ausführen
- [ ] **Task 3:** submitHeatResults() inline Logik ersetzen (AC: 2)
  - [ ] Pure function mit lokalem State aufrufen
  - [ ] Tests ausführen (besonders lb-heat-generation.test.ts)
- [ ] **Task 4:** bracket-tree.tsx useMemo ersetzen (AC: 1)
  - [ ] useMemo entfernen
  - [ ] Store-Aufruf nutzen: `useTournamentStore(state => state.hasActiveWBHeats())`
  - [ ] Prop-Durchreichung prüfen (PoolDisplay etc.)
- [ ] **Task 5:** Vollständiger Testlauf (AC: 4)
- [ ] **Task 6:** Alte inline Logik-Kommentare entfernen

## Dev Notes

### Abhängigkeiten
- Keine Abhängigkeiten zu anderen Stories
- Kann parallel zu 10-1 und 10-3 bearbeitet werden

### Bestehende Tests

Kritische Tests für hasActiveWBHeats-Verhalten:
- `tests/lb-heat-generation.test.ts` - Pool-Threshold basiert auf hasActiveWB
- `tests/dynamic-brackets-phase2.test.ts` - LB-Generierung nach WB-Ende

### Performance-Betrachtung

Die bracket-tree.tsx useMemo-Optimierung ist nicht kritisch:
- Store-Methode wird bei State-Änderung neu evaluiert (Zustand subscription)
- Die Berechnung ist O(Anzahl WB-Heats) - maximal ~20 Iterationen
- Keine merkbare Performance-Differenz

## Definition of Done

### Funktional
- [ ] Pure function `checkHasActiveWBHeats()` existiert und ist exportiert
- [ ] Store-Methode `hasActiveWBHeats()` nutzt pure function
- [ ] submitHeatResults() nutzt pure function
- [ ] bracket-tree.tsx nutzt Store-Methode

### Code-Qualität
- [ ] Keine duplizierten hasActiveWBHeats-Implementierungen mehr
- [ ] ~40 Zeilen Code entfernt
- [ ] Keine TypeScript-Fehler

### Tests
- [ ] Neuer Unit-Test für pure function
- [ ] Alle bestehenden Tests grün
- [ ] Besonders: lb-heat-generation.test.ts grün
