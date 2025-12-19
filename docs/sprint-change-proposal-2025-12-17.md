# Sprint Change Proposal: Bracket-Progression Implementierung

**Datum:** 2025-12-17  
**Autor:** Bob (Scrum Master)  
**Status:** Proposed  
**Scope:** Moderate  

---

## 1. Issue Summary

### Problem Statement

Die Bracket-Progression nach Heat-Abschluss funktioniert nicht wie spezifiziert. Nach Abschluss von Qualifikations-Heats werden die Piloten zwar korrekt in `winnerPilots[]` und `loserPilots[]` Arrays kategorisiert, aber:

1. **Die `fullBracketStructure` wird nie aktualisiert** - alle Bracket-Heats bleiben auf `status: "empty"` mit leeren `pilotIds[]`
2. **Keine Synchronisation** zwischen echten `heats[]` und der Bracket-Visualisierung
3. **Keine nachfolgenden Heats werden generiert** - nach Quali-Abschluss gibt es keine WB/LB Runde 1 Heats

### Entdeckungskontext

- **Wann:** 2025-12-17, während manuellem Testing
- **Wie:** 3 Quali-Heats abgeschlossen, Bracket-Tab zeigt nur leere Platzhalter
- **Evidence:** LocalStorage State zeigt `fullBracketStructure.qualification.heats[*].pilotIds = []`

### Betroffene User Journeys

| Journey | Impact |
|---------|--------|
| **Thomas (Orga)** | ❌ Kann Turnier nicht über Quali hinaus führen |
| **Lisa (Pilot)** | ❌ Sieht nicht, wo sie im Bracket steht |
| **Familie Huber (Zuschauer)** | ❌ Können Turnierverlauf nicht verfolgen |

---

## 2. Impact Analysis

### Epic Impact

**Epic 4: Heat-Durchführung & Bracket** - Kernfunktionalität unvollständig

| Story | Aktueller Status | Tatsächlicher Status | Action |
|-------|------------------|---------------------|--------|
| US-4.1 | Done | ✅ Korrekt | Keine |
| US-4.2 | Done | ⚠️ Unvollständig | Status zurücksetzen, Tasks ergänzen |
| US-4.3 | In Progress | 🔄 Korrekt | Tasks ergänzen |

### Artifact Conflicts

| Artifact | Konflikt | Änderung |
|----------|----------|----------|
| **PRD** | Keiner | Keine Änderung |
| **Architecture** | `useBracketLogic.ts` spezifiziert aber nicht implementiert | Hook erstellen |
| **UI/UX Spec** | Keiner | Keine Änderung |
| **Stories 4-2, 4-3** | Tasks fehlen | Ergänzen |

### Technical Impact

| Bereich | Impact |
|---------|--------|
| `tournamentStore.ts` | Bracket-Sync Logik extrahieren → neuer Hook |
| `bracket-tree.tsx` | Mit echten Heats verbinden |
| `useBracketLogic.ts` | **NEU** - Bracket-Progression Logik |
| Tests | Neue Tests für Bracket-Progression |

---

## 3. Recommended Approach

### Gewählter Path: Direct Adjustment

**Begründung:**
- Grundstruktur existiert und funktioniert
- Klare Tasks identifiziert
- Kein MVP-Scope-Verlust
- Überschaubarer Aufwand

### Effort Estimate

| Komponente | Aufwand |
|------------|---------|
| `useBracketLogic.ts` Hook | ~4h |
| Store-Refactoring | ~2h |
| Bracket-Tree Anpassungen | ~3h |
| Tests | ~3h |
| Integration & Testing | ~2h |
| **Gesamt** | **~14h (2-3 Tage)** |

### Risk Assessment

| Risiko | Level | Mitigation |
|--------|-------|------------|
| Bracket-Logik Komplexität | Medium | Schrittweise, Tests first |
| State-Synchronisation | Medium | Single Source of Truth |
| Regression | Low | Bestehende Tests erweitern |

---

## 4. Detailed Change Proposals

### 4.1 Story 4-2: Status zurücksetzen + Tasks ergänzen

**Story:** US-4.2 Heat abschließen & Bracket-Progression  
**Section:** Tasks / Status

**OLD:**
```
Status: done
```

**NEW:**
```
Status: in_progress
```

**NEUE TASKS hinzufügen:**

```markdown
### Neue Tasks (Bracket-Progression)

- [ ] Task 4-2.A: Bracket-Struktur mit Quali-Heats synchronisieren
  - [ ] Bei Turnier-Start: Quali-Heats in fullBracketStructure eintragen
  - [ ] pilotIds und status synchron halten
  
- [ ] Task 4-2.B: Winner-Bracket Heats mit Piloten befüllen
  - [ ] Nach Quali-Heat Abschluss: Rang 1+2 → targetWinnerHeat
  - [ ] Wenn Heat voll (4 Piloten): status = 'pending'
  
- [ ] Task 4-2.C: Loser-Bracket Heats mit Piloten befüllen
  - [ ] Nach Quali-Heat Abschluss: Rang 3+4 → targetLoserHeat
  - [ ] Wenn Heat voll (4 Piloten): status = 'pending'
  
- [ ] Task 4-2.D: Spielbare Heats aus Bracket-Struktur generieren
  - [ ] Wenn alle Quali-Heats completed: WB Runde 1 Heats erstellen
  - [ ] heats[] Array erweitern mit neuen spielbaren Heats
```

**Rationale:** Die ursprünglichen ACs (2, 3) spezifizieren Bracket-Zuordnung, aber die Tasks decken nur die Array-Befüllung ab, nicht die Visualisierungs-Integration.

---

### 4.2 Story 4-3: Tasks ergänzen

**Story:** US-4.3 Bracket-Visualisierung  
**Section:** Tasks

**NEUE TASKS hinzufügen:**

```markdown
### Neue Tasks (Visualization Connection)

- [ ] Task 4-3.A: QualificationSection mit echten Heats verbinden
  - [ ] Matching zwischen heats[] und fullBracketStructure.qualification
  - [ ] Echte Heat-Daten anzeigen statt leerer Platzhalter
  
- [ ] Task 4-3.B: Winner/Loser Bracket mit befüllten Heats anzeigen
  - [ ] BracketRoundColumn: Prüfe ob Bracket-Heat Piloten hat
  - [ ] Zeige BracketHeatBox wenn pilotIds.length > 0
  
- [ ] Task 4-3.C: SVG-Verbindungslinien einbinden
  - [ ] svg-connections.ts in BracketTree integrieren
  - [ ] Linien zwischen verbundenen Heats zeichnen
```

**Rationale:** Die Visualisierung ist implementiert, aber nicht mit den echten Daten verbunden.

---

### 4.3 Architecture: Neuer Hook erstellen

**File:** `src/hooks/useBracketLogic.ts` (NEU)

**Beschreibung:**
```typescript
/**
 * useBracketLogic - Double Elimination Bracket Management
 * 
 * Responsibilities:
 * - Synchronize heats[] with fullBracketStructure
 * - Calculate pilot progression (Winner/Loser Bracket)
 * - Generate next round heats when current round complete
 * - Provide bracket state for visualization
 */

export function useBracketLogic() {
  // Extracted from tournamentStore:
  // - syncQualiHeatsToStructure()
  // - assignPilotsToWinnerBracket()
  // - assignPilotsToLoserBracket()
  // - generateNextRoundHeats()
  // - checkRoundCompletion()
}
```

**Rationale:** Architecture spezifiziert diesen Hook für FR17-21. Saubere Trennung von State (Store) und Business Logic (Hook).

---

### 4.4 Tests: Neue Test-Datei

**File:** `tests/bracket-progression.test.ts` (NEU)

**Test Cases:**
```typescript
describe('Bracket Progression', () => {
  // Quali → WB/LB Zuordnung
  it('assigns rank 1+2 to winner bracket after quali heat')
  it('assigns rank 3+4 to loser bracket after quali heat')
  
  // Bracket-Struktur Sync
  it('syncs quali heats to fullBracketStructure on tournament start')
  it('updates bracket heat status when real heat completes')
  
  // Next Round Generation
  it('generates WB round 1 heats when all quali heats complete')
  it('generates LB round 1 heats when all quali heats complete')
  
  // Edge Cases
  it('handles 3-pilot heats correctly (only rank 1-3)')
  it('handles odd number of pilots in bracket round')
})
```

---

## 5. Implementation Handoff

### Scope Classification: **Moderate**

Die Änderungen erfordern:
- Story-Status Updates (SM)
- Code-Implementierung (Dev)
- Keine PRD/Architecture fundamentale Änderungen

### Handoff Recipients

| Rolle | Verantwortung |
|-------|---------------|
| **Scrum Master (Bob)** | Story-Status aktualisieren, Tasks ergänzen |
| **Dev Agent** | Implementierung der neuen Tasks |
| **QA/Testing** | Neue Tests schreiben, Regression prüfen |

### Implementation Order

1. **Phase 1:** `useBracketLogic.ts` Hook erstellen (Logik extrahieren)
2. **Phase 2:** Story 4-2 Tasks implementieren (Bracket-Progression)
3. **Phase 3:** Story 4-3 Tasks implementieren (Visualization)
4. **Phase 4:** Tests + Integration

### Success Criteria

| Kriterium | Messung |
|-----------|---------|
| Quali-Heats in Bracket sichtbar | fullBracketStructure.qualification.heats[*].pilotIds gefüllt |
| Piloten wandern ins WB/LB | Nach Heat-Abschluss: pilotIds in targetWinnerHeat/targetLoserHeat |
| Nächste Runde spielbar | Nach Quali: WB Runde 1 Heats in heats[] Array |
| Visualisierung korrekt | Bracket-Tab zeigt echte Piloten, nicht nur Platzhalter |
| Alle Tests grün | Bestehende + neue Tests passing |

---

## 6. Approval

- [ ] **Jakob** - Product Owner Approval
- [ ] **Story Updates** - Status und Tasks aktualisiert
- [ ] **Dev Handoff** - Implementierung gestartet

---

## Anhang: State-Analyse

### Aktueller State (Problem)

```
heats[0-2]: completed mit results ✅
winnerPilots: [6 IDs] ✅
loserPilots: [4 IDs] ✅

fullBracketStructure.qualification.heats[*]:
  - pilotIds: [] ❌ (sollte gefüllt sein)
  - status: "empty" ❌ (sollte "completed" sein)

fullBracketStructure.winnerBracket.rounds[0].heats[*]:
  - pilotIds: [] ❌ (sollte Winner enthalten)
  - status: "empty" ❌
```

### Erwarteter State (Ziel)

```
heats[0-6]: Quali-Heats (IDs matchen fullBracketStructure)
heats[7+]: WB/LB Heats (generiert nach Quali)

fullBracketStructure.qualification.heats[0]:
  - pilotIds: ["id1", "id2", "id3", "id4"] ✅
  - status: "completed" ✅
  - results: { rankings: [...] } ✅

fullBracketStructure.winnerBracket.rounds[0].heats[0]:
  - pilotIds: ["winner1", "winner2", "winner3", "winner4"] ✅
  - status: "pending" ✅
```
