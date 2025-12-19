# Sprint Change Proposal: Vollständige Bracket-Progression bis zum Finale

**Datum:** 2025-12-19  
**Autor:** John (Product Manager)  
**Status:** Proposed  
**Scope:** Major  
**Priorität:** MVP-Blocker  

---

## 1. Issue Summary

### Problem Statement

Das Turnier stoppt nach der ersten Bracket-Runde (WB/LB Runde 1). Die Bracket-Progression ist nur für den Übergang **Qualifikation → WB/LB Runde 1** implementiert, aber nicht für:

1. **WB Runde 1 → WB Runde 2 → ... → WB Finale**
2. **LB Runde 1 → LB Runde 2 → ... → LB Finale**
3. **WB Finale + LB Finale → Grand Finale**
4. **Cross-Bracket Progression:** WB-Verlierer müssen ins LB eingespeist werden

### Root Cause Analyse

| Komponente | Status | Problem |
|------------|--------|---------|
| `generateNextRoundHeats()` | ⚠️ Unvollständig | Generiert NUR WB/LB Runde 1 nach Quali |
| `updateBracketAfterHeatCompletion()` | ⚠️ Unvollständig | Behandelt NUR Quali-Heats, nicht WB/LB-Heats |
| `submitHeatResults()` | ⚠️ Unvollständig | Prüft nur `areAllQualiHeatsCompleted()` |
| WB → LB Einspeisung | ❌ Fehlt komplett | WB-Verlierer gehen nicht ins LB |

### Code-Evidence

**`bracket-logic.ts` Zeile 178-220:**
```typescript
export function generateNextRoundHeats(...): Heat[] {
  // Generiert NUR WB Round 1 und LB Round 1
  // KEINE Logik für weitere Runden!
}
```

**`tournamentStore.ts` Zeile 487-514:**
```typescript
if (areAllQualiHeatsCompleted(updatedBracketStructure)) {
  // Nur einmal aufgerufen, nach Quali
  // KEINE Rekursion für weitere Runden!
}
```

### Betroffene User Journeys

| Journey | Impact | Severity |
|---------|--------|----------|
| **Thomas (Orga)** | Kann Turnier nicht durchführen – stoppt nach ~30% | 🔴 Blocker |
| **Lisa (Pilot)** | Weiß nicht, gegen wen sie als nächstes fliegt | 🔴 Blocker |
| **Familie Huber (Zuschauer)** | Können Turnierverlauf nicht verfolgen | 🔴 Blocker |

---

## 2. PRD/Story Gap Analysis

### Was die PRD fordert vs. was implementiert wurde

| PRD Requirement | Status | Gap |
|-----------------|--------|-----|
| **FR17:** Double-Elimination verwalten | ⚠️ | Nur Quali → Round 1 |
| **FR18:** Bracket auto-update nach jedem Heat | ⚠️ | Nur für Quali-Heats |
| **FR21:** Nächste Heat-Paarungen ermitteln | ⚠️ | Nur erste Runde nach Quali |
| **FR22:** Finale erkennen | ❌ | Nicht implementiert |
| **FR14:** Winner-Bracket Zuordnung | ⚠️ | Nur von Quali, nicht von WB-Heats |
| **FR15:** Loser-Bracket Zuordnung | ⚠️ | Nur von Quali, nicht von WB-Heats |

### Story Coverage

| Story | Original Scope | Tatsächliche Implementierung | Gap |
|-------|---------------|------------------------------|-----|
| **4-2** | Bracket-Progression komplett | Nur Quali → Round 1 | ~60% fehlt |
| **4-3** | Bracket-Visualisierung | Struktur da, Daten fehlen | Abhängig von 4-2 |
| **5-1** | Finale & Siegerehrung | Backlog | Abhängig von 4-2 |

---

## 3. Technical Analysis

### Fehlende Funktionalität

#### A) WB/LB Heat-Completion Handler

Wenn ein WB- oder LB-Heat abgeschlossen wird:
- **Rang 1+2** → Nächste Runde im gleichen Bracket
- **Rang 3+4 aus WB** → Einspeisung ins Loser Bracket (!)
- **Rang 3+4 aus LB** → Elimination (raus aus Turnier)

```
WB Heat abgeschlossen:
  Rang 1+2 → targetHeat (nächste WB Runde)
  Rang 3+4 → targetLoserHeat (Einspeisung LB)  ← FEHLT KOMPLETT!

LB Heat abgeschlossen:
  Rang 1+2 → targetHeat (nächste LB Runde)
  Rang 3+4 → eliminatedPilots  ← Teilweise vorhanden
```

#### B) Runden-Completion Detection

Nach jeder Runde prüfen:
1. Sind alle Heats dieser Runde completed?
2. Wenn ja: Nächste Runde generieren

Aktuell: Nur `areAllQualiHeatsCompleted()` existiert.

#### C) Finale Detection

Wenn WB Finale UND LB Finale completed → Grand Finale generieren

---

## 4. Recommended Approach

### Option A: Story 4-2 erweitern ✅ EMPFOHLEN

Tasks zur bestehenden Story 4-2 hinzufügen, da die Bracket-Progression zu deren Scope gehört (AC 2, 3, 4).

**Vorteile:**
- Logisch zusammenhängend
- Keine neue Story nötig
- Schnellerer Start

**Aufwand:** ~3-4 Tage

### Option B: Neue Story 4-4 erstellen

Separate Story für "Full Tournament Progression"

**Nachteile:**
- Overhead für Story-Erstellung
- Gleicher Code-Scope wie Option A

---

## 5. Detailed Change Proposals

### 5.1 Story 4-2: Neue Tasks hinzufügen

**File:** `docs/sprint-artifacts/4-2-heat-abschliessen.md`  
**Section:** Tasks

**NEUE TASKS hinzufügen:**

```markdown
### Phase 2: Vollständige Bracket-Progression (Course Correction 2025-12-19)

- [ ] Task 13: WB/LB Heat-Completion Handler erweitern
  - [ ] `updateBracketAfterHeatCompletion()` für bracketType 'winner' und 'loser' erweitern
  - [ ] WB-Verlierer (Rang 3+4) ins LB einspeisen via neuer `targetLoserFromWB` Referenz
  - [ ] LB-Verlierer (Rang 3+4) zu `eliminatedPilots` hinzufügen
  - [ ] Piloten zum targetHeat der nächsten Runde hinzufügen

- [ ] Task 14: Runden-Completion Detection
  - [ ] Neue Funktion `areAllHeatsInRoundCompleted(roundNumber, bracketType)`
  - [ ] Nach jedem Heat prüfen: Ist die aktuelle Runde komplett?
  - [ ] Wenn ja: Nächste Runde aktivieren

- [ ] Task 15: Generische `generateNextRoundHeats()` Funktion
  - [ ] Refactor: Nicht nur nach Quali, sondern nach JEDER Runde
  - [ ] Parameter: `roundNumber`, `bracketType`
  - [ ] WB Runde N → WB Runde N+1 Heats erstellen
  - [ ] LB Runde N → LB Runde N+1 Heats erstellen

- [ ] Task 16: WB → LB Einspeisung (Cross-Bracket)
  - [ ] Neue Referenz in BracketHeat: `targetLoserFromWB?: string`
  - [ ] Bei WB-Heat Completion: Rang 3+4 → targetLoserFromWB Heat
  - [ ] LB Heats können Piloten von WB UND LB erhalten

- [ ] Task 17: Finale Detection & Generation
  - [ ] Neue Funktion `isFinaleReady()`: WB Finale + LB Finale completed?
  - [ ] Grand Finale Heat generieren und zu `heats[]` hinzufügen
  - [ ] `tournamentPhase` auf 'finale' setzen

- [ ] Task 18: Bracket-Progression Tests erweitern
  - [ ] Test: WB Runde 1 → WB Runde 2 Progression
  - [ ] Test: LB Runde 1 → LB Runde 2 Progression
  - [ ] Test: WB-Verlierer werden ins LB eingespeist
  - [ ] Test: LB-Verlierer werden eliminiert
  - [ ] Test: Finale wird erkannt und generiert
  - [ ] Test: Volles 16-Piloten-Turnier durchspielen
```

### 5.2 Architecture Update: bracket-structure-generator.ts

**Änderung:** `targetLoserFromWB` Referenz hinzufügen

```typescript
export interface BracketHeat {
  // ... existing fields
  targetWinnerHeat?: string    // Quali → WB
  targetLoserHeat?: string     // Quali → LB
  targetLoserFromWB?: string   // WB → LB (NEU!)
  targetHeat?: string          // Next round in same bracket
}
```

**Änderung:** `linkBracketHeats()` erweitern für WB → LB Verknüpfung

### 5.3 bracket-logic.ts: Funktionen erweitern

**Neue Funktionen:**

```typescript
/**
 * Check if all heats in a specific round are completed
 */
export function areAllHeatsInRoundCompleted(
  bracketStructure: FullBracketStructure,
  roundNumber: number,
  bracketType: BracketType
): boolean

/**
 * Update bracket after WB or LB heat completion
 * - Winners → next round in same bracket
 * - WB Losers → feed into LB
 * - LB Losers → eliminated
 */
export function updateBracketAfterWBLBHeatCompletion(
  heatId: string,
  rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[],
  bracketStructure: FullBracketStructure
): FullBracketStructure

/**
 * Generate heats for the next round (generic, not just post-quali)
 */
export function generateHeatsForNextRound(
  bracketStructure: FullBracketStructure,
  completedRoundNumber: number,
  bracketType: BracketType,
  existingHeats: Heat[]
): Heat[]

/**
 * Check if Grand Finale is ready (WB + LB Finals completed)
 */
export function isGrandFinaleReady(
  bracketStructure: FullBracketStructure
): boolean
```

### 5.4 tournamentStore.ts: submitHeatResults erweitern

**Aktuelle Logik (Zeile 461-514):**
```typescript
// TASK 11: Nur nach Quali
if (areAllQualiHeatsCompleted(updatedBracketStructure)) {
  // Generate WB/LB Round 1
}
```

**Neue Logik:**
```typescript
// Determine which bracket/round this heat belongs to
const completedHeat = findBracketHeatById(updatedBracketStructure, heatId)

if (completedHeat) {
  const { bracketType, roundNumber } = completedHeat
  
  // Update bracket based on heat type
  if (bracketType === 'qualification') {
    updatedBracketStructure = updateBracketAfterHeatCompletion(...)
    
    if (areAllQualiHeatsCompleted(updatedBracketStructure)) {
      // Generate WB/LB Round 1
    }
  } 
  else if (bracketType === 'winner' || bracketType === 'loser') {
    updatedBracketStructure = updateBracketAfterWBLBHeatCompletion(...)
    
    if (areAllHeatsInRoundCompleted(updatedBracketStructure, roundNumber, bracketType)) {
      // Generate next round heats
      newHeats = generateHeatsForNextRound(...)
    }
  }
  
  // Check for finale
  if (isGrandFinaleReady(updatedBracketStructure)) {
    // Generate Grand Finale heat
    tournamentPhase = 'finale'
  }
}
```

---

## 6. Test Strategy

### Unit Tests (bracket-progression.test.ts erweitern)

```typescript
describe('Full Bracket Progression', () => {
  describe('WB Progression', () => {
    it('advances rank 1+2 to next WB round')
    it('feeds rank 3+4 from WB into LB')
    it('generates WB Round 2 when WB Round 1 complete')
  })
  
  describe('LB Progression', () => {
    it('advances rank 1+2 to next LB round')
    it('eliminates rank 3+4 from LB')
    it('receives pilots from WB losses')
    it('generates LB Round 2 when LB Round 1 complete')
  })
  
  describe('Finale', () => {
    it('detects when WB Finale is complete')
    it('detects when LB Finale is complete')
    it('generates Grand Finale when both finals complete')
    it('sets tournamentPhase to finale')
  })
  
  describe('Full Tournament Simulation', () => {
    it('runs complete 8-pilot tournament to finale')
    it('runs complete 16-pilot tournament to finale')
    it('runs complete 24-pilot tournament to finale')
  })
})
```

### Integration Tests

- Manueller Durchlauf: 12-Piloten-Turnier komplett durchspielen
- Bracket-Visualisierung zeigt korrekte Piloten in jeder Runde

---

## 7. Effort Estimate

| Task | Aufwand | Abhängigkeit |
|------|---------|--------------|
| Task 13: WB/LB Handler | 4h | - |
| Task 14: Round Completion | 2h | Task 13 |
| Task 15: Generic generateNextRound | 4h | Task 14 |
| Task 16: WB → LB Einspeisung | 3h | Task 13, 15 |
| Task 17: Finale Detection | 2h | Task 15 |
| Task 18: Tests | 4h | Alle |
| Integration & Bugfix | 4h | Alle |
| **Gesamt** | **~23h (3-4 Tage)** | |

---

## 8. Risk Assessment

| Risiko | Level | Mitigation |
|--------|-------|------------|
| Komplexe State-Synchronisation | Hoch | Single Source of Truth in fullBracketStructure |
| Edge Cases (ungleiche Pilotenanzahlen) | Mittel | Umfassende Tests für 7, 12, 16, 24 Piloten |
| Regression in bestehenden Tests | Niedrig | Tests laufen nach jedem Task |
| UI zeigt falsche Daten | Mittel | Bracket-Tree nutzt fullBracketStructure direkt |

---

## 9. Implementation Order

1. **Phase 1:** Task 13 + 14 (WB/LB Handler + Round Detection)
2. **Phase 2:** Task 15 + 16 (Generic Generation + Cross-Bracket)
3. **Phase 3:** Task 17 (Finale)
4. **Phase 4:** Task 18 (Tests + Full Simulation)

**Empfehlung:** Nach jeder Phase manuell testen!

---

## 10. Success Criteria

| Kriterium | Messung |
|-----------|---------|
| WB-Progression funktioniert | Piloten wandern von WB R1 → R2 → Finale |
| LB-Progression funktioniert | Piloten wandern von LB R1 → R2 → ... → Finale |
| WB → LB Einspeisung | WB-Verlierer erscheinen in korrektem LB-Heat |
| Finale wird erreicht | `tournamentPhase === 'finale'` nach WB+LB Finals |
| Keine Duplikate | Piloten erscheinen nie doppelt im Bracket |
| Alle Tests grün | 200+ Tests passing |
| 16-Piloten-Turnier komplett | Manueller Test: Start bis Finale möglich |

---

## 11. Approval

- [ ] **Jakob** - Product Owner Approval
- [ ] **Story 4-2 aktualisiert** - Neue Tasks hinzugefügt, Status auf `in-progress`
- [ ] **Dev Handoff** - Implementierung gestartet

---

## Anhang A: Double Elimination Flow Visualisierung

```
                    QUALIFIKATION (4 Heats, 16 Piloten)
                    ┌────┐ ┌────┐ ┌────┐ ┌────┐
                    │ Q1 │ │ Q2 │ │ Q3 │ │ Q4 │
                    └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
                      │      │      │      │
        Rang 1+2 ─────┼──────┼──────┼──────┼────→ WINNER BRACKET
                      │      │      │      │
        Rang 3+4 ─────┼──────┼──────┼──────┼────→ LOSER BRACKET
                      │      │      │      │
                    
    WINNER BRACKET                          LOSER BRACKET
    ==============                          ==============
    
    WB Runde 1        WB Finale             LB Runde 1        LB Runde 2       LB Finale
    ┌────┐                                  ┌────┐            ┌────┐
    │WB1 │───┐                              │LB1 │───┐        │    │
    └────┘   │      ┌────┐                  └────┘   │        │    │
             ├─────→│ WB │                           ├───────→│LB3 │───┐
    ┌────┐   │      │Final│                 ┌────┐   │        │    │   │      ┌────┐
    │WB2 │───┘      └──┬─┘                  │LB2 │───┘        └────┘   │      │ LB │
    └─┬──┘             │                    └─┬──┘                     ├─────→│Final│
      │                │                      │                        │      └──┬─┘
      │ Verlierer      │                      │ Verlierer              │         │
      └────────────────┼──────────────────────┼────────────────────────┘         │
                       │                      │                                   │
                       │                      └─────→ ELIMINATED                  │
                       │                                                          │
                       │                    ┌─────────────────────────────────────┘
                       │                    │
                       │   GRAND FINALE     │
                       │   ┌───────────┐    │
                       └──→│  FINALE   │←───┘
                           │ WB vs LB  │
                           └───────────┘
```

## Anhang B: State-Fluss nach Heat-Completion

```
Heat abgeschlossen
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. Welcher bracketType?                                       │
├────────────────┬────────────────┬────────────────────────────┤
│ qualification  │     winner     │           loser            │
├────────────────┼────────────────┼────────────────────────────┤
│ Rang 1+2 →     │ Rang 1+2 →     │ Rang 1+2 →                 │
│   targetWinner │   targetHeat   │   targetHeat               │
│   (WB R1)      │   (next WB)    │   (next LB)                │
├────────────────┼────────────────┼────────────────────────────┤
│ Rang 3+4 →     │ Rang 3+4 →     │ Rang 3+4 →                 │
│   targetLoser  │   targetLoser  │   eliminatedPilots         │
│   (LB R1)      │   FromWB (LB!) │                            │
└────────────────┴────────────────┴────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Ist die Runde komplett?                                    │
│    areAllHeatsInRoundCompleted(roundNumber, bracketType)      │
├──────────────────────────────────────────────────────────────┤
│ Ja → generateHeatsForNextRound()                              │
│      Neue Heats zu heats[] hinzufügen                         │
│      Ersten neuen Heat aktivieren                             │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Grand Finale bereit?                                       │
│    isGrandFinaleReady() - WB + LB Finals completed?           │
├──────────────────────────────────────────────────────────────┤
│ Ja → Grand Finale Heat generieren                             │
│      tournamentPhase = 'finale'                               │
└──────────────────────────────────────────────────────────────┘
```
