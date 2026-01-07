# Story 13.5: WB-vor-LB Reihenfolge

Status: ready-for-dev

## Story

As a Turnierleiter,
I want dass WB-Heats vor LB-Heats der gleichen Runde gespielt werden,
so that LB-Heats alle WB-Verlierer enthalten können.

## Akzeptanzkriterien

1. **AC1:** `getNextRecommendedHeat()` priorisiert WB vor LB innerhalb derselben Runde
2. **AC2:** LB-Heats einer Runde werden erst empfohlen wenn alle WB-Heats der Runde abgeschlossen sind
3. **AC3:** Visueller Indikator zeigt "WB R1 läuft" / "LB R1 wartet auf WB"

## Tasks / Subtasks

- [ ] Task 1: `getNextRecommendedHeat()` überarbeiten (AC: #1, #2)
  - [ ] 1.1: Prüfe aktuelle Runde (currentWBRound vs currentLBRound)
  - [ ] 1.2: Wenn WB-Runde nicht abgeschlossen: Empfehle WB-Heat
  - [ ] 1.3: Wenn WB-Runde abgeschlossen: Empfehle LB-Heat der entsprechenden Runde
  - [ ] 1.4: Berücksichtige Grand Finale (keine WB/LB-Logik mehr)

- [ ] Task 2: Heat-Status-Indikator State (AC: #3)
  - [ ] 2.1: Neuer computed State `currentPhaseDescription: string`
  - [ ] 2.2: Mögliche Werte: "Quali läuft", "WB Runde 1 läuft", "LB Runde 1 wartet auf WB", etc.

- [ ] Task 3: UI für Phase-Indikator (AC: #3)
  - [ ] 3.1: Komponente PhaseIndicator erstellen
  - [ ] 3.2: Zeigt currentPhaseDescription
  - [ ] 3.3: Visuell: Badge mit Farbe (WB=grün, LB=orange, Warten=grau)

- [ ] Task 4: Heat-Übersicht anpassen
  - [ ] 4.1: Heats nach Runde gruppieren
  - [ ] 4.2: WB-Heats vor LB-Heats innerhalb Runde sortieren
  - [ ] 4.3: "Wartet auf WB" Badge bei blockierten LB-Heats

- [ ] Task 5: Unit Tests
  - [ ] 5.1: Test: WB wird vor LB empfohlen
  - [ ] 5.2: Test: LB blockiert bis WB abgeschlossen
  - [ ] 5.3: Test: Nach WB-Abschluss wird LB empfohlen

## Dev Notes

### Reihenfolge-Logik

**Turnier-Flow:**
```
Quali (alle) → WB R1 (alle) → LB R1 (alle) → WB R2 (alle) → LB R2 (alle) → ... → Finale
```

**Entscheidungsbaum für `getNextRecommendedHeat()`:**
```
1. Gibt es pending Quali-Heats? → Empfehle Quali
2. Ist currentWBRound > currentLBRound?
   - Ja: LB muss aufholen → Empfehle LB (wenn WB-Runde für LB abgeschlossen)
   - Nein: WB ist dran → Empfehle WB
3. WB-Runde abgeschlossen?
   - Ja: LB kann starten → Empfehle LB
   - Nein: WB muss erst fertig → Empfehle WB
4. Beide Runden abgeschlossen? → Nächste WB-Runde generieren
```

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/stores/tournamentStore.ts` | getNextRecommendedHeat() überarbeiten |
| `src/components/PhaseIndicator.tsx` | NEU |
| `src/components/bracket/BracketTree.tsx` | PhaseIndicator einbinden |
| `tests/heat-order-priority.test.ts` | NEU |

### Code-Pattern für `getNextRecommendedHeat`

```typescript
getNextRecommendedHeat: () => {
  const { heats, currentWBRound, currentLBRound, isQualificationComplete } = get()
  
  // 1. Quali Phase
  if (!isQualificationComplete) {
    const pendingQuali = heats.find(h => 
      (!h.bracketType || h.bracketType === 'qualification') && 
      h.status === 'pending'
    )
    if (pendingQuali) return pendingQuali
  }
  
  // 2. WB vor LB innerhalb Runde
  const wbRoundComplete = isRoundComplete('winner', currentWBRound)
  const lbRoundComplete = isRoundComplete('loser', currentLBRound)
  
  // WB-Heat verfügbar und Runde nicht abgeschlossen?
  if (!wbRoundComplete) {
    const pendingWB = heats.find(h => 
      h.bracketType === 'winner' && 
      h.roundNumber === currentWBRound &&
      h.status === 'pending'
    )
    if (pendingWB) return pendingWB
  }
  
  // WB-Runde abgeschlossen → LB kann laufen
  if (wbRoundComplete && !lbRoundComplete) {
    const pendingLB = heats.find(h => 
      h.bracketType === 'loser' && 
      h.roundNumber === currentLBRound &&
      h.status === 'pending'
    )
    if (pendingLB) return pendingLB
  }
  
  // Beide Runden abgeschlossen → Finale oder nächste Runde
  const pendingFinale = heats.find(h => 
    h.bracketType === 'grand_finale' && 
    h.status === 'pending'
  )
  if (pendingFinale) return pendingFinale
  
  return null
}
```

### Phase-Beschreibungen

| Phase | Beschreibung |
|-------|--------------|
| Quali läuft | Qualifikations-Heats werden gespielt |
| WB Runde X läuft | Winner Bracket Runde X aktiv |
| LB Runde X wartet | Loser Bracket wartet auf WB-Abschluss |
| LB Runde X läuft | Loser Bracket Runde X aktiv |
| Finale | Grand Finale steht an |
| Turnier beendet | Alle Heats abgeschlossen |

### Testing-Strategie

1. **Unit Tests** für getNextRecommendedHeat() mit verschiedenen Szenarien
2. **State Tests** für Phase-Beschreibungen
3. **UI Tests** für PhaseIndicator Komponente

### References

- [Source: _bmad-output/planning-artifacts/epic-13-runden-basiertes-bracket-redesign.md#US-13.5]
- [Source: _bmad-output/planning-artifacts/epic-12-rules.md#Reihenfolge]
- [Source: src/stores/tournamentStore.ts#getNextRecommendedHeat]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
