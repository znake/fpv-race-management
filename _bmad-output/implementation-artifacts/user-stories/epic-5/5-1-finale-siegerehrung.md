# Story 5.1: Finale & Siegerehrung

Status: done

## Story

**Als ein** Organisator (Thomas),  
**möchte ich** das Finale durchführen und die Top-4-Platzierungen vergeben,  
**so dass** das Turnier einen würdigen Abschluss hat und die Gewinner gefeiert werden können.

## Acceptance Criteria

### AC 1: Automatische Finale-Erkennung

**Given** WB Finale UND LB Finale sind abgeschlossen  
**When** das System die Bracket-Progression prüft  
**Then** wird `tournamentPhase` auf 'finale' gesetzt  
**And** das Grand Finale Heat wird automatisch generiert  
**And** die zwei Finalisten (WB-Winner + LB-Winner) sind im Grand Finale Heat

### AC 2: Grand Finale Heat-Ansicht

**Given** `tournamentPhase === 'finale'`  
**When** ich den TURNIER-Tab betrachte  
**Then** sehe ich das Grand Finale prominent angezeigt  
**And** die Überschrift zeigt "GRAND FINALE" mit Gold-Styling  
**And** beide Finalisten werden mit großen Piloten-Karten (120px) angezeigt  
**And** ein Hinweis zeigt "WB Champion" bzw. "LB Champion" unter den Namen

### AC 3: Finale-Ergebnis eingeben (Top 4)

**Given** das Grand Finale läuft  
**When** ich auf einen Piloten klicke  
**Then** erhält dieser die nächste Platzierung (1. Klick = Platz 1, 2. Klick = Platz 2)  
**And** da nur 2 Piloten im Finale sind: Platz 1 = Gold, Platz 2 = Silber  
**And** Platz 3 + 4 werden automatisch aus LB Semifinale/Finale ermittelt

### AC 4: Siegerehrung-Ansicht

**Given** das Grand Finale ist abgeschlossen (`tournamentPhase === 'completed'`)  
**When** ich den TURNIER-Tab betrachte  
**Then** sehe ich die Siegerehrung:
- Platz 1: Große Gold-Karte mit Glow (180px Foto)
- Platz 2: Silber-Karte (140px Foto)
- Platz 3: Bronze-Karte (120px Foto)
- Platz 4: Cyan-Karte (100px Foto)  
**And** alle Piloten-Karten zeigen Platzierungs-Badge  
**And** Konfetti-Animation oder verstärkter Glow-Effekt

### AC 5: Turnier als abgeschlossen markieren

**Given** das Finale-Ergebnis wurde eingegeben  
**When** ich auf "Turnier abschließen" klicke  
**Then** wird `tournamentPhase` auf 'completed' gesetzt  
**And** die Siegerehrung-Ansicht wird angezeigt  
**And** keine weiteren Heats können gespielt werden  
**And** ein "Neues Turnier" Button wird angezeigt

### AC 6: Neues Turnier starten

**Given** `tournamentPhase === 'completed'`  
**When** ich auf "Neues Turnier" klicke  
**Then** erscheint Bestätigungs-Dialog: "Ergebnisse behalten und neues Turnier starten?"  
**And** bei Bestätigung: `resetTournament()` wird aufgerufen (Piloten bleiben)  
**And** ich bin zurück im Setup-Modus

## Tasks / Subtasks

- [x] Task 1: Finale-Phase Styling (AC: 2)
  - [x] Gold-Styling für Grand Finale Section
  - [x] "WB Champion" / "LB Champion" Labels unter Piloten
  - [x] Größere Piloten-Karten (120px) im Finale

- [x] Task 2: Siegerehrung-Komponente erstellen (AC: 4)
  - [x] Neue `VictoryCeremony` Komponente
  - [x] Podium-Layout: Platz 1 (Mitte/oben), Platz 2 (links), Platz 3 (rechts), Platz 4 (unten)
  - [x] Größen-Abstufung: 180px → 140px → 120px → 100px
  - [x] Gold/Silber/Bronze/Cyan Farbcodierung mit Glow

- [x] Task 3: Top-4 Ermittlung (AC: 3)
  - [x] Platz 1: Grand Finale Gewinner
  - [x] Platz 2: Grand Finale Verlierer
  - [x] Platz 3 + 4: LB Finale Verlierer + WB Finale Verlierer
  - [x] `getTop4Pilots()` Funktion im Store

- [x] Task 4: Tournament Completion Flow (AC: 5, 6)
  - [x] "Turnier abschließen" Button im Grand Finale (via submitHeatResults auto-completion)
  - [x] Transition zu `tournamentPhase: 'completed'`
  - [x] "Neues Turnier" Button mit Confirmation Dialog
  - [x] Integration mit bestehendem `resetTournament()`

- [x] Task 5: Tests
  - [x] Unit-Test: Grand Finale wird korrekt generiert (isGrandFinaleReady already in bracket-progression.test.ts)
  - [x] Unit-Test: Top-4 Ermittlung
  - [x] Unit-Test: Tournament Completion Flow
  - [x] Unit-Test: VictoryCeremony Component (14 new tests)

## Dev Notes

### Bereits implementiert (aus Story 4-2)

Die folgenden Funktionen existieren bereits im Code:

```typescript
// bracket-logic.ts
isGrandFinaleReady(structure): boolean  // Prüft ob WB+LB Finals done
generateGrandFinaleHeat(structure, heats): Heat  // Erstellt Finale-Heat

// tournamentStore.ts  
tournamentPhase: 'finale' | 'completed'  // Phase-States vorhanden
// Grand Finale wird in submitHeatResults generiert (Zeile 565-578)
```

### Neue Funktion: getTop4Pilots

```typescript
// In tournamentStore.ts
getTop4Pilots: () => {
  const { fullBracketStructure, pilots, heats } = get()
  
  if (!fullBracketStructure?.grandFinale) return null
  
  const grandFinale = heats.find(h => 
    fullBracketStructure.grandFinale?.id === h.id
  )
  
  if (!grandFinale?.results) return null
  
  // Platz 1 + 2 aus Grand Finale
  const place1 = grandFinale.results.rankings.find(r => r.rank === 1)
  const place2 = grandFinale.results.rankings.find(r => r.rank === 2)
  
  // Platz 3: LB Finale Verlierer (Rang 2 im LB Finale)
  // Platz 4: WB Finale Verlierer (Rang 2 im WB Finale, der dann im LB weitergemacht hat)
  
  const wbFinalRound = fullBracketStructure.winnerBracket.rounds.at(-1)
  const lbFinalRound = fullBracketStructure.loserBracket.rounds.at(-1)
  
  // ... Logik für Platz 3+4
  
  return {
    place1: pilots.find(p => p.id === place1?.pilotId),
    place2: pilots.find(p => p.id === place2?.pilotId),
    place3: pilots.find(p => p.id === place3Id),
    place4: pilots.find(p => p.id === place4Id),
  }
}
```

### VictoryCeremony Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                     ★ SIEGEREHRUNG ★                            │
│                                                                 │
│                        ┌─────────┐                              │
│                        │   🥇    │                              │
│                        │ 180px   │                              │
│                        │ ANNA    │                              │
│                        │ Platz 1 │                              │
│                        └─────────┘                              │
│                                                                 │
│       ┌─────────┐                   ┌─────────┐                 │
│       │   🥈    │                   │   🥉    │                 │
│       │ 140px   │                   │ 120px   │                 │
│       │  BEN    │                   │ CHRIS   │                 │
│       │ Platz 2 │                   │ Platz 3 │                 │
│       └─────────┘                   └─────────┘                 │
│                                                                 │
│                        ┌─────────┐                              │
│                        │   4     │                              │
│                        │ 100px   │                              │
│                        │  DANA   │                              │
│                        │ Platz 4 │                              │
│                        └─────────┘                              │
│                                                                 │
│                   [Neues Turnier starten]                       │
└─────────────────────────────────────────────────────────────────┘
```

### Synthwave Podium Styling

```css
/* Platz 1 - Gold */
.podium-1 {
  @apply bg-gold/20 border-4 border-gold shadow-glow-gold;
}

/* Platz 2 - Silber */
.podium-2 {
  @apply bg-gray-400/20 border-4 border-gray-300 shadow-glow-silver;
}

/* Platz 3 - Bronze */
.podium-3 {
  @apply bg-amber-700/20 border-4 border-amber-600 shadow-glow-bronze;
}

/* Platz 4 - Cyan */
.podium-4 {
  @apply bg-neon-cyan/20 border-4 border-neon-cyan shadow-glow-cyan;
}
```

### Edge Cases

| Case | Handling |
|------|----------|
| Nur 2 Piloten im Turnier | Kein Double Elim nötig, direkt Finale |
| Pilot fällt im Finale aus | Gegner gewinnt automatisch |
| Grand Finale nicht erreicht | tournamentPhase bleibt 'running' |
| Browser-Refresh im Finale | localStorage hat Finale-State, Siegerehrung wird wieder angezeigt |

### Bestehende Komponenten wiederverwenden

| Komponente | Aktion |
|------------|--------|
| `PilotCard` | Mit `rank` prop für Platzierungs-Badge |
| `ActiveHeatView` | Für Grand Finale Eingabe (2 Piloten statt 4) |
| `ResetConfirmationDialog` | Für "Neues Turnier" Bestätigung |
| `BracketTree` | Grand Finale Section bereits vorhanden |

### NFR-Compliance

| NFR | Anforderung | Umsetzung |
|-----|-------------|-----------|
| NFR14 | Beamer-Lesbarkeit aus 10m | Große Piloten-Fotos (180px), Gold-Glow |
| NFR8 | Auto-Save nach Aktion | Finale-Ergebnis wird sofort persistiert |
| NFR10 | Bracket 100% korrekt | Top-4 Ermittlung basiert auf Bracket-Daten |

### References

- [Source: docs/prd.md#FR22] - Finale erkennen
- [Source: docs/prd.md#FR23] - 4 Platzierungen eingeben
- [Source: docs/prd.md#FR24] - Platzierung auf Foto anzeigen
- [Source: docs/prd.md#FR25] - Turnier abschließen
- [Source: src/lib/bracket-logic.ts] - isGrandFinaleReady, generateGrandFinaleHeat
- [Source: src/stores/tournamentStore.ts] - submitHeatResults Finale-Handling

## Definition of Done

### Funktional
- [x] Grand Finale wird automatisch erkannt und generiert
- [x] Finale-Ansicht zeigt beide Finalisten prominent
- [x] Ergebnis-Eingabe funktioniert für 2 Piloten
- [x] Top-4 werden korrekt ermittelt (inkl. Platz 3+4)
- [x] Siegerehrung-Ansicht zeigt Podium mit allen 4 Platzierungen
- [x] "Turnier abschließen" setzt Phase auf 'completed'
- [x] "Neues Turnier" ruft resetTournament() auf

### UI/Design
- [x] Gold-Styling für Grand Finale
- [x] Größen-Abstufung im Podium (180px → 100px)
- [x] Gold/Silber/Bronze/Cyan Farbcodierung
- [x] Verstärkter Glow-Effekt für Siegerehrung
- [x] "WB Champion" / "LB Champion" Labels sichtbar

### Tests
- [x] Unit-Test: isGrandFinaleReady() (bereits in bracket-progression.test.ts)
- [x] Unit-Test: getTop4Pilots() Funktion
- [x] Unit-Test: Tournament Completion Flow
- [x] Unit-Test: VictoryCeremony Component (14 tests)

### Qualität
- [x] Keine TypeScript-Fehler
- [x] Keine Console-Errors
- [x] Beamer-tauglich (1920x1080)
- [ ] Code-Review bestanden

## Dev Agent Record

### Context Reference
- Story 5-1 ist die einzige Story in Epic 5 (Finale & Siegerehrung)
- Abhängigkeit von Epic 4 (vollständig abgeschlossen)
- Grand Finale Generation ist bereits in Story 4-2 implementiert
- tournamentPhase 'finale' und 'completed' existieren bereits

### Agent Model Used
Claude (Anthropic) - claude-sonnet-4-20250514

### Completion Notes List
- Created `VictoryCeremony` component with podium layout (4 places)
- Implemented `getTop4Pilots()` store function to determine final standings
- Implemented `completeTournament()` store action
- Extended `GrandFinaleSection` with `GrandFinaleHeatBox` showing WB/LB Champion labels
- BracketTree now shows VictoryCeremony when `tournamentPhase === 'completed'`
- Finale phase shows ActiveHeatView for Grand Finale heat input
- Auto-transition to 'completed' when Grand Finale results are submitted
- "Neues Turnier" button integrated with existing `resetTournament()` via dialog
- 14 new tests in `finale-ceremony.test.tsx`
- All 207 tests passing, build successful

### File List
- `src/components/victory-ceremony.tsx` (NEW) - Podium component with Top 4
- `src/components/bracket-tree.tsx` (MODIFIED) - VictoryCeremony integration, GrandFinaleHeatBox
- `src/stores/tournamentStore.ts` (MODIFIED) - getTop4Pilots(), completeTournament() actions
- `src/App.tsx` (MODIFIED) - handleNewTournament callback
- `tests/finale-ceremony.test.tsx` (NEW) - 14 unit tests
