# Story 10.1: Heat-Generierung in submitHeatResults konsolidieren

**Status:** ready
**Updated:** 2025-12-26
**Story Points:** 2
**Type:** Technical Refactoring

## Story

Als **Entwickler**,
möchte ich **die duplizierte Heat-Generierungs-Logik in submitHeatResults() durch Aufrufe der existierenden Methoden ersetzen**,
damit **der Code wartbarer wird und Änderungen an der Heat-Generierung nur an einer Stelle gemacht werden müssen**.

## Hintergrund

Die `submitHeatResults()` Funktion (~350 Zeilen) enthält inline Heat-Generierungs-Logik für WB und LB Heats (~40 Zeilen jeweils). Diese Logik existiert bereits als separate, getestete Methoden:

- `generateWBHeatFromPool()` (Zeilen 1395-1424)
- `generateLBHeat()` (Zeilen 1315-1343)

### Betroffene Code-Stellen

**Inline WB-Heat-Generierung in submitHeatResults():**
- Zeilen ~662-681: Erste WB-Heat-Generierung nach Quali-Abschluss
- Zeilen ~719-739: WB-Heat-Generierung nach WB-Heat-Abschluss

**Inline LB-Heat-Generierung in submitHeatResults():**
- Zeilen ~874-894: LB-Heat-Generierung nach WB/LB-Heat-Abschluss

### Identische Logik

```typescript
// INLINE in submitHeatResults (dupliziert)
const winnerPoolArray = Array.from(newWinnerPool)
while (winnerPoolArray.length >= 4) {
  const pilotsForWBHeat = winnerPoolArray.splice(0, 4) // FIFO
  const wbHeat: Heat = {
    id: `wb-heat-${crypto.randomUUID()}`,
    heatNumber: updatedHeats.length + 1,
    pilotIds: pilotsForWBHeat,
    status: 'pending',
    bracketType: 'winner'
  }
  updatedHeats = [...updatedHeats, wbHeat]
  for (const pilotId of pilotsForWBHeat) {
    newWinnerPool.delete(pilotId)
  }
}

// EXISTIERENDE METHODE generateWBHeatFromPool()
// Macht exakt dasselbe, ist aber getestet und zentral
```

## Acceptance Criteria

### AC1: WB-Heat-Generierung über Store-Methode

**Given** `submitHeatResults()` enthält inline WB-Heat-Generierungs-Logik
**When** ein Refactoring durchgeführt wird
**Then** wird die inline Logik durch Aufrufe von `generateWBHeatFromPool()` ersetzt
**And** das Verhalten bleibt identisch (bestehende Tests grün)

### AC2: LB-Heat-Generierung über Store-Methode

**Given** `submitHeatResults()` enthält inline LB-Heat-Generierungs-Logik
**When** ein Refactoring durchgeführt wird
**Then** wird die inline Logik durch Aufrufe von `generateLBHeat()` ersetzt
**And** das Verhalten bleibt identisch (bestehende Tests grün)

### AC3: Keine funktionalen Änderungen

**Given** das Refactoring ist abgeschlossen
**When** alle bestehenden Tests ausgeführt werden
**Then** sind alle Tests grün ohne Änderungen an den Test-Dateien
**And** das Turnier-Verhalten ist identisch zum Vorher-Zustand

### AC4: Code-Reduktion

**Given** das Refactoring ist abgeschlossen
**Then** sind mindestens 30 Zeilen duplizierter Code entfernt
**And** `submitHeatResults()` ist um mindestens 40 Zeilen kürzer

## Technische Anforderungen

### Refactoring-Ansatz

Die inline Logik muss durch einen internen Aufruf der Store-Methoden ersetzt werden. Da `submitHeatResults()` selbst eine Store-Action ist, muss der Aufruf über `get()` erfolgen:

```typescript
// VORHER (inline, dupliziert)
while (winnerPoolArray.length >= 4) {
  // ... 15 Zeilen Logik ...
}

// NACHHER (delegiert)
const { generateWBHeatFromPool } = get()
let generatedHeat = generateWBHeatFromPool()
while (generatedHeat) {
  generatedHeat = generateWBHeatFromPool()
}
```

### Herausforderung: State-Synchronisation

Die aktuelle inline Logik arbeitet mit lokalen Variablen (`newWinnerPool`, `newLoserPool`, `updatedHeats`), die am Ende gesammelt via `set()` gespeichert werden.

Die existierenden Methoden (`generateWBHeatFromPool`, `generateLBHeat`) rufen selbst `set()` auf.

**Lösungsansatz:**
1. Die Methoden so refactoren, dass sie nur den Heat zurückgeben ohne `set()` zu rufen (breaking change für andere Aufrufer)
2. ODER: Die Methoden am Ende von `submitHeatResults()` aufrufen, nachdem der State aktualisiert wurde
3. ODER: Interne Helper-Funktionen extrahieren, die keinen State setzen

**Empfehlung:** Ansatz 3 - Interne pure functions extrahieren:
```typescript
// Neue interne Helper (keine Store-Actions)
function createWBHeatFromPilots(pilotIds: string[], heatNumber: number): Heat { ... }
function createLBHeatFromPilots(pilotIds: string[], heatNumber: number): Heat { ... }
```

## Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Regression in Heat-Generierung | Mittel | Hoch | Alle bestehenden Tests vor/nach Refactoring ausführen |
| State-Synchronisations-Probleme | Mittel | Hoch | Sorgfältige Analyse des State-Flows |
| FIFO-Reihenfolge bricht | Niedrig | Hoch | Dedizierte FIFO-Tests existieren bereits |

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | Inline-Logik durch Methodenaufrufe/Helper ersetzen |

## Tasks

- [ ] **Task 1:** Analyse der State-Synchronisation zwischen inline Logik und Store-Methoden (AC: 1, 2)
- [ ] **Task 2:** Entscheidung für Refactoring-Ansatz (Helper vs. Methoden-Anpassung) (AC: 1, 2)
- [ ] **Task 3:** WB-Heat-Generierung refactoren (AC: 1)
  - [ ] Inline Logik in submitHeatResults() identifizieren (2 Stellen)
  - [ ] Durch Helper/Methodenaufruf ersetzen
  - [ ] Tests ausführen
- [ ] **Task 4:** LB-Heat-Generierung refactoren (AC: 2)
  - [ ] Inline Logik in submitHeatResults() identifizieren (1 Stelle)
  - [ ] Durch Helper/Methodenaufruf ersetzen
  - [ ] Tests ausführen
- [ ] **Task 5:** Vollständiger Testlauf aller bestehenden Tests (AC: 3)
- [ ] **Task 6:** Code-Review: Zeilen gezählt, Duplikate eliminiert (AC: 4)

## Dev Notes

### Abhängigkeiten
- Keine Abhängigkeiten zu anderen Stories
- Muss VOR Story 10-3 (Grand-Finale-Konsolidierung) abgeschlossen werden, da submitHeatResults() ebenfalls Grand-Finale-Logik enthält

### Bestehende Tests

Die folgenden Tests müssen weiterhin grün sein:
- `tests/dynamic-brackets-phase1.test.ts`
- `tests/dynamic-brackets-phase2.test.ts`
- `tests/lb-heat-generation.test.ts`
- `tests/bracket-progression.test.ts`

### Testing-Strategie

1. **Vor Refactoring:** Alle Tests ausführen, Baseline dokumentieren
2. **Nach jedem Task:** Tests ausführen
3. **Nach Abschluss:** Vollständiger Testlauf + manueller Smoke-Test

## Definition of Done

### Funktional
- [ ] Inline WB-Heat-Generierung durch zentrale Logik ersetzt
- [ ] Inline LB-Heat-Generierung durch zentrale Logik ersetzt
- [ ] Alle bestehenden Tests grün ohne Testcode-Änderungen

### Code-Qualität
- [ ] Keine neuen TypeScript-Fehler
- [ ] submitHeatResults() um mindestens 40 Zeilen kürzer
- [ ] Keine duplizierten Heat-Generierungs-Logik mehr

### Tests
- [ ] Alle 150+ bestehenden Tests grün
- [ ] Keine neuen Tests notwendig (reine Refactoring-Story)
