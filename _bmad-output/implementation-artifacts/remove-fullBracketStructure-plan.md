# Refactoring Plan: Entfernung von `fullBracketStructure`

**Datum**: 2026-01-18  
**Status**: Geplant  
**Priorität**: Medium  

---

## Zusammenfassung

Die `fullBracketStructure` ist ein Überbleibsel aus einem älteren Architektur-Ansatz, wo das Bracket vorberechnet und dann mit Piloten gefüllt wurde. Die aktuelle Architektur verwendet `heats[]` als Single Source of Truth für alle Heats (Quali, WB, LB, Finale).

**Ziel**: `fullBracketStructure` komplett entfernen und den Code vereinfachen.

---

## Aktuelle Verwendung von `fullBracketStructure`

### 1. Quali-Heats identifizieren (`BracketTree.tsx`)
```typescript
const getQualiHeats = () => {
  const qualiHeatIds = new Set(fullBracketStructure.qualification.heats.map(h => h.id))
  return heats.filter(h => qualiHeatIds.has(h.id))
}
```
**Alternative**: `heats.filter(h => !h.bracketType || h.bracketType === 'qualification')`

### 2. Loading State (`BracketTree.tsx`)
```typescript
if (!fullBracketStructure) {
  return <div>Bracket-Struktur wird generiert...</div>
}
```
**Alternative**: `if (!tournamentStarted || heats.length === 0)`

### 3. Props für WB/LB Sections
```typescript
<WinnerBracketSection structure={fullBracketStructure.winnerBracket} ... />
<LoserBracketSection structure={fullBracketStructure.loserBracket} ... />
```
**Status**: Nach dem Fix vom 2026-01-18 werden diese nur noch für Empty-State Placeholder verwendet.

### 4. Store-Funktionen
- `confirmTournamentStart()` - generiert und speichert die Struktur
- `reopenHeat()` - ruft `rollbackBracketForHeat()` auf
- `checkWBFinaleComplete()` - prüft WB Finale Status
- `getFullBracketStructure()` - Getter für die Struktur

---

## Vorteile der Entfernung

1. **Einfacherer Code**: Weniger State zu verwalten
2. **Single Source of Truth**: Nur noch `heats[]` für alle Heat-Daten
3. **Weniger Bugs**: Keine Synchronisationsprobleme zwischen `heats[]` und `fullBracketStructure`
4. **Kleinerer Storage**: Weniger Daten im localStorage
5. **Bessere Wartbarkeit**: Weniger Dateien und Funktionen zu pflegen

---

## Betroffene Dateien

### Zu ändern:

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | State-Property entfernen, Funktionen anpassen |
| `src/components/bracket/BracketTree.tsx` | Quali-Heat-Logik und Loading-State anpassen |
| `src/components/bracket/sections/WinnerBracketSection.tsx` | `structure` Prop entfernen |
| `src/components/bracket/sections/LoserBracketSection.tsx` | `structure` Prop entfernen |
| `src/components/bracket/types.ts` | Type-Definitionen anpassen |
| `src/types/tournament.ts` | `TournamentState` Interface anpassen |

### Zu entfernen (oder stark reduzieren):

| Datei | Status |
|-------|--------|
| `src/lib/bracket-structure-generator.ts` | Kann komplett entfernt werden |
| `src/lib/bracket-logic.ts` | `syncQualiHeatsToStructure`, `rollbackBracketForHeat` entfernen |
| `src/lib/heat-completion.ts` | Struktur-Updates entfernen |

### Tests anzupassen:

| Datei | Änderung |
|-------|----------|
| `tests/lb-heat-generation.test.ts` | `fullBracketStructure` aus Mocks entfernen |
| `tests/heat-completion.test.ts` | Struktur-bezogene Tests entfernen/anpassen |
| `tests/finale-ceremony.test.tsx` | Mocks anpassen |
| `tests/loser-pool.test.ts` | Mocks anpassen |
| `tests/reset-functions.test.ts` | Assertions anpassen |
| `tests/helpers/store-helpers.ts` | Helper-Funktion anpassen |

---

## Migrations-Schritte

### Phase 1: Vorbereitung (keine Breaking Changes)

- [ ] **1.1** Quali-Heats mit `bracketType: 'qualification'` generieren (in `generateHeats`)
- [ ] **1.2** `getQualiHeats()` in `BracketTree.tsx` auf `bracketType`-Filter umstellen
- [ ] **1.3** Loading-State auf `tournamentStarted` umstellen

### Phase 2: WB/LB Sections vereinfachen

- [ ] **2.1** `structure` Prop aus `WinnerBracketSection` entfernen
- [ ] **2.2** `structure` Prop aus `LoserBracketSection` entfernen
- [ ] **2.3** Type-Definitionen in `types.ts` anpassen

### Phase 3: Store bereinigen

- [ ] **3.1** `fullBracketStructure` aus State entfernen
- [ ] **3.2** `confirmTournamentStart()` vereinfachen (keine Struktur-Generierung)
- [ ] **3.3** `reopenHeat()` vereinfachen (kein `rollbackBracketForHeat`)
- [ ] **3.4** `getFullBracketStructure()` entfernen
- [ ] **3.5** `checkWBFinaleComplete()` auf `heats[]` umstellen

### Phase 4: Nicht mehr benötigte Dateien entfernen

- [ ] **4.1** `bracket-structure-generator.ts` entfernen
- [ ] **4.2** Struktur-bezogene Funktionen aus `bracket-logic.ts` entfernen
- [ ] **4.3** Struktur-bezogene Funktionen aus `heat-completion.ts` entfernen

### Phase 5: Tests anpassen

- [ ] **5.1** `fullBracketStructure` aus allen Test-Mocks entfernen
- [ ] **5.2** Struktur-bezogene Test-Cases entfernen oder anpassen
- [ ] **5.3** Alle Tests durchlaufen lassen

---

## Risiken und Mitigationen

| Risiko | Mitigation |
|--------|------------|
| Regression bei Quali-Heat-Anzeige | Unit-Tests für `getQualiHeats()` schreiben |
| Regression bei WB/LB-Anzeige | E2E-Test für komplettes Turnier durchführen |
| localStorage-Migration für bestehende User | Alte `fullBracketStructure` im State ignorieren (wird nicht mehr gelesen) |

---

## Geschätzter Aufwand

| Phase | Aufwand |
|-------|---------|
| Phase 1 | ~30 min |
| Phase 2 | ~20 min |
| Phase 3 | ~45 min |
| Phase 4 | ~15 min |
| Phase 5 | ~30 min |
| **Gesamt** | **~2-3 Stunden** |

---

## Akzeptanzkriterien

- [ ] Turnier läuft komplett durch (Quali -> WB -> LB -> Grand Finale)
- [ ] Keine Duplikate bei der Heat-Anzeige
- [ ] Alle bestehenden Tests laufen (oder sind bewusst angepasst)
- [ ] `fullBracketStructure` kommt nicht mehr im Code vor
- [ ] localStorage enthält keine `fullBracketStructure` mehr

---

## Referenzen

- Ursprüngliches Problem: Doppelte Heats im Bracket (Screenshot vom 2026-01-18)
- Erster Fix: `WinnerBracketSection` und `LoserBracketSection` rendern nur noch dynamische Heats
- Tournament Rules: `_bmad-output/planning-artifacts/analysis/tournament-rules.md`
