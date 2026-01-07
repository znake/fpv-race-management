# Change Proposal: MultiGP Bracket Format

**Datum:** 2025-12-21  
**Autor:** Dev (Amelia)  
**Status:** Proposed  
**Severity:** Critical - Blocking Tournament Functionality  
**Betrifft:** Komplette Bracket-Logik Refactoring

---

## 1. Executive Summary

Die aktuelle Bracket-Implementierung folgt einem klassischen Double-Elimination-Schema, das für 1v1-Matches konzipiert ist. Bei 4er-Heats führt das zu mathematischen Problemen (Heats mit nur 2 Piloten, leere LB-Heats).

Das **MultiGP-Format** hingegen ist speziell für 4er-Heats designt und stellt sicher, dass jeder Heat immer 4 Piloten hat (oder weniger bei ungeraden Zahlen).

**Empfehlung:** Komplettes Refactoring der Bracket-Logik auf das MultiGP-Format.

---

## 2. Problem Statement

### 2.1 Aktuelle Probleme

| Problem | Auswirkung |
|---------|-----------|
| LB-Heats haben nur 2 Piloten | Kein richtiges 4er-Rennen möglich |
| WB-Finale hat nur 2 Piloten | Halbleeres Heat |
| Mathematisch inkorrekte Halbierung | 8→4→2 statt konstant 4 |
| LB-Heats bekommen keine Piloten | `sourceHeats: []` bei manchen Heats |
| Keine klare Seeding-Logik | Piloten werden nicht nach Quali-Performance verteilt |

### 2.2 Screenshot-Analyse (Jakob's Test)

Im Loser Bracket wurden Heats wie Heat 12, 13, 14, 16 mit nur 2 Piloten angezeigt. Das passiert weil:
- Die Halbierungs-Logik 4→2→1 Piloten produziert
- WB-Loser nicht korrekt auf LB-Heats verteilt werden
- Keine "Re-Seeding" nach jeder Runde stattfindet

---

## 3. MultiGP Format Spezifikation

### 3.1 Grundprinzip

Bei MultiGP werden Piloten nach **jeder Runde neu auf Heats verteilt** basierend auf ihrer Performance. Es gibt keine festen "Brackets" im klassischen Sinn, sondern **Seeding-Tabellen**.

### 3.2 Format für 16 Piloten (Standard)

```
PHASE 1: QUALIFIKATION (Race 1-4)
================================
Race 1: Seed 3, 6, 11, 14
Race 2: Seed 2, 7, 10, 15
Race 3: Seed 4, 5, 12, 13
Race 4: Seed 1, 8, 9, 16

→ Ergebnis: Jeder Pilot hat einen Rang (1. bis 4. in seinem Heat)


PHASE 2: BRACKET ROUND 1 (Race 5-8)
===================================
Race 5: 3.R1, 4.R1, 1.R2, 3.R2    (Re-mix basierend auf Quali)
Race 6: 1.R1, 2.R1, 4.R2, 2.R2
Race 7: 1.R3, 2.R3, 1.R4, 2.R4
Race 8: 3.R3, 4.R3, 3.R4, 4.R4

→ Platz 1+2 jedes Heats → Winners Bracket
→ Platz 3+4 jedes Heats → Consolation Bracket


PHASE 3: CONSOLATION BRACKET (Race 9-10)
========================================
Race 9:  1.R5, 4.R6, 1.R7, 4.R8
Race 10: 3.R5, 2.R6, 3.R7, 2.R8

→ Platz 1+2 → Consolation Semifinal
→ Platz 3+4 → Eliminiert (Rang 9-12)


PHASE 4: WINNERS BRACKET SEMIFINAL (Race 11-12)
===============================================
Race 11: 1.R5, 2.R6, 1.R8, 2.R7
Race 12: 2.R5, 1.R6, 2.R8, 1.R7

→ Platz 1+2 → Winners Bracket Final
→ Platz 3+4 → Drop zu Consolation Semifinal


PHASE 5: CONSOLATION SEMIFINAL (Race 13)
========================================
Race 13: 1.R9, 2.R10, 3.R12, 4.R11
         (oder: 1.R10, 2.R9, 3.R11, 4.R12)

→ Platz 1+2 → Grand Final
→ Platz 3+4 → Eliminiert (Rang 5-6)


PHASE 6: WINNERS BRACKET FINAL (Race 14)
========================================
Race 14: 1.R11, 2.R12, 1.R12, 2.R11

→ Platz 1+2 → Grand Final
→ Platz 3+4 → Eliminiert (Rang 7-8)


PHASE 7: GRAND FINAL - "CHASE THE ACE" (Race 15+)
================================================
4 Piloten: Top 2 aus WB Final + Top 2 aus Consolation Semi

Format: Wer zuerst 2 Siege hat, gewinnt!
- Kann 2 bis 5 Rennen dauern
- Platz 2-4: Motocross-Punktesystem (kombinierte Platzierungen)
```

### 3.3 Seeding-Tabelle (MultiGP Standard)

Die initiale Verteilung für Race 1-4 basierend auf Seeding:

| Race | Pilot 1 | Pilot 2 | Pilot 3 | Pilot 4 |
|------|---------|---------|---------|---------|
| 1 | Seed 3 | Seed 6 | Seed 11 | Seed 14 |
| 2 | Seed 2 | Seed 7 | Seed 10 | Seed 15 |
| 3 | Seed 4 | Seed 5 | Seed 12 | Seed 13 |
| 4 | Seed 1 | Seed 8 | Seed 9 | Seed 16 |

**Ziel:** Gleiche Stärke-Verteilung pro Heat (ähnlich wie bei FIFA WM-Gruppen).

### 3.4 Final-Ranking

```
Rang 1:     Chase the Ace Winner
Rang 2-4:   CTA Points (Motocross scoring)
Rang 5-6:   3.+4. Platz Race 13 (Consolation Semi)
Rang 7-8:   3.+4. Platz Race 14 (WB Final)
Rang 9-10:  3. Platz Race 9+10
Rang 11-12: 4. Platz Race 9+10
Rang 13-14: 3. Platz Race 5+7
Rang 15-16: 4. Platz Race 5+7
```

---

## 4. Technische Änderungen

### 4.1 Neue Datenstrukturen

```typescript
// Neues Bracket-Format
interface MultiGPBracketStructure {
  // Initiales Seeding (kann aus Quali-Zeiten oder zufällig kommen)
  seeding: PilotSeed[]
  
  // Phasen des Turniers
  phases: TournamentPhase[]
  
  // Chase the Ace Finale
  chaseTheAce: ChaseTheAceState | null
  
  // Final Rankings
  finalRankings: FinalRanking[]
}

interface TournamentPhase {
  id: string
  name: string  // "Qualifikation", "Bracket R1", "WB Semi", etc.
  type: 'quali' | 'bracket' | 'consolation' | 'wb-semi' | 'wb-final' | 'consolation-semi' | 'finale'
  races: Race[]
  isComplete: boolean
}

interface Race {
  id: string
  raceNumber: number
  phase: string
  pilotIds: string[]  // Immer 4 (oder weniger bei ungeraden Zahlen)
  results?: RaceResult
  
  // Woher kommen die Piloten?
  sourceRules: SourceRule[]  // z.B. "1. von Race 5", "3. von Race 12"
  
  // Wohin gehen die Piloten nach diesem Race?
  destinationRules: DestinationRule[]
}

interface SourceRule {
  type: 'seed' | 'race-result'
  seed?: number  // Für Quali
  raceId?: string
  position?: 1 | 2 | 3 | 4
}

interface DestinationRule {
  position: 1 | 2 | 3 | 4
  targetPhase: string
  targetRaceIndex?: number
  eliminated?: boolean
  finalRank?: number
}

interface ChaseTheAceState {
  pilots: string[]  // 4 Piloten
  currentRaceNumber: number
  wins: Record<string, number>  // pilotId → Anzahl Siege
  races: Race[]
  winner?: string
  isComplete: boolean
}
```

### 4.2 Zu ändernde Dateien

| Datei | Änderung | Aufwand |
|-------|----------|---------|
| `src/lib/bracket-structure-generator.ts` | **Komplett neu** - MultiGP Seeding-Logik | Hoch |
| `src/lib/bracket-logic.ts` | **Komplett neu** - Phase-basierte Progression | Hoch |
| `src/stores/tournamentStore.ts` | Neue State-Struktur, CTA-Logik | Hoch |
| `src/components/bracket-tree.tsx` | Neue Visualisierung | Mittel |
| `src/components/active-heat-view.tsx` | CTA-Mode Support | Mittel |
| `src/components/victory-ceremony.tsx` | CTA-Ranking Display | Niedrig |
| `tests/*.test.ts` | Alle Bracket-Tests neu | Hoch |

### 4.3 Neue Dateien

| Datei | Beschreibung |
|-------|--------------|
| `src/lib/multigp-seeding.ts` | Seeding-Tabellen Generator |
| `src/lib/multigp-bracket.ts` | MultiGP Bracket-Logik |
| `src/lib/chase-the-ace.ts` | CTA Finale Logik |
| `src/components/chase-the-ace-view.tsx` | CTA UI Komponente |

---

## 5. Acceptance Criteria

### AC1: Seeding nach Quali
**Given** 16 Piloten haben die Qualifikation abgeschlossen  
**When** Bracket Phase 1 generiert wird  
**Then** werden Piloten nach MultiGP Seeding-Tabelle auf Race 5-8 verteilt

### AC2: Konstante Heat-Größe
**Given** eine beliebige Turnier-Phase  
**When** Heats angezeigt werden  
**Then** hat jeder Heat genau 4 Piloten (oder weniger bei <16 Piloten)

### AC3: Winners/Consolation Split
**Given** Race 5-8 sind abgeschlossen  
**When** nächste Phase generiert wird  
**Then** gehen Platz 1+2 ins Winners Bracket, Platz 3+4 ins Consolation Bracket

### AC4: Drop-Down Mechanik
**Given** WB Semi (Race 11-12) ist abgeschlossen  
**When** Platz 3+4 eines WB Heats bestimmt werden  
**Then** fallen diese Piloten in Consolation Semifinal (Race 13)

### AC5: Chase the Ace Finale
**Given** WB Final und Consolation Semi sind abgeschlossen  
**When** Grand Final startet  
**Then** fahren 4 Piloten im CTA-Format (wer zuerst 2 Siege hat, gewinnt)

### AC6: Final Ranking
**Given** CTA ist abgeschlossen  
**When** Siegerehrung angezeigt wird  
**Then** werden alle 16 Plätze korrekt nach MultiGP-Schema angezeigt

### AC7: Variable Pilotenanzahl
**Given** 7-60 Piloten  
**When** Turnier generiert wird  
**Then** wird die passende MultiGP-Struktur verwendet (angepasste Seeding-Tabellen)

---

## 6. Skalierung für verschiedene Pilotenanzahlen

### 6.1 Struktur-Templates

| Piloten | Quali Heats | Bracket R1 | Weitere Runden | Finale |
|---------|-------------|------------|----------------|--------|
| 7-8 | 2 | 2 | 1 Semi | 4 CTA |
| 9-12 | 3 | 3 | 2 Semi | 4 CTA |
| 13-16 | 4 | 4 | 3 (WB+Cons) | 4 CTA |
| 17-24 | 6 | 6 | 4 | 4 CTA |
| 25-32 | 8 | 8 | 5 | 4 CTA |
| 33-48 | 12 | 12 | 6 | 4 CTA |
| 49-60 | 15 | 15 | 7 | 4 CTA |

### 6.2 Anpassungen bei ungeraden Zahlen

Bei z.B. 14 Piloten:
- 2 Heats mit 4 Piloten
- 2 Heats mit 3 Piloten
- Piloten aus 3er-Heats bekommen "virtuellen 4. Platz" für Seeding

---

## 7. Migration existierender Turniere

### 7.1 Breaking Changes

- `fullBracketStructure` Format ändert sich komplett
- `winnerPilots`/`loserPilots` Arrays werden durch Phase-basiertes Tracking ersetzt
- Heat-IDs werden anders generiert

### 7.2 Migration-Strategie

**Option A: Clean Break (Empfohlen)**
- Neue `tournamentPhase` Version einführen
- Alte Turniere können nicht fortgesetzt werden
- "Reset Tournament" für Neustart

**Option B: Migration Layer**
- Alte Struktur beim Laden konvertieren
- Komplex, fehleranfällig

**Empfehlung:** Option A - Clean Break mit klarer Kommunikation

---

## 8. Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Komplexität unterschätzt | Mittel | Hoch | Story aufteilen in kleinere Tasks |
| Seeding-Logik für alle Größen | Hoch | Mittel | MultiGP-Tabellen als Vorlage |
| CTA-Logik komplex | Mittel | Mittel | Separates Modul, gut testbar |
| Breaking Changes | Sicher | Mittel | Clear Communication, Reset-Option |

---

## 9. Aufwandsschätzung

| Komponente | Story Points | Tage |
|------------|--------------|------|
| MultiGP Seeding Generator | 5 | 1 |
| Bracket-Logik Refactoring | 13 | 2-3 |
| Phase Progression | 8 | 1.5 |
| Chase the Ace Finale | 5 | 1 |
| UI Anpassungen | 8 | 1.5 |
| Tests | 8 | 1.5 |
| **Gesamt** | **47** | **8-10 Tage** |

---

## 10. Implementierungs-Roadmap

### Phase 1: Foundation (2-3 Tage)
- [ ] Neue Datenstrukturen definieren
- [ ] `multigp-seeding.ts` implementieren
- [ ] `multigp-bracket.ts` Grundstruktur
- [ ] Unit Tests für Seeding

### Phase 2: Bracket Logic (2-3 Tage)
- [ ] Phase-basierte Progression
- [ ] Winners/Consolation Split
- [ ] Drop-Down Mechanik
- [ ] Integration mit Store

### Phase 3: Chase the Ace (1-2 Tage)
- [ ] CTA State Management
- [ ] Win-Counter Logik
- [ ] Motocross-Punktesystem für Platz 2-4

### Phase 4: UI Updates (2 Tage)
- [ ] Bracket-Tree für MultiGP Format
- [ ] CTA View Komponente
- [ ] Victory Ceremony Update
- [ ] Heat Assignment View Update

### Phase 5: Testing & Polish (1-2 Tage)
- [ ] Integrationstests
- [ ] Edge Cases (7, 13, 27 Piloten etc.)
- [ ] Performance Testing
- [ ] Bug Fixes

---

## 11. Nächste Schritte

1. [ ] Jakob: Review und Feedback zu diesem Proposal
2. [ ] Entscheidung: Full MultiGP oder vereinfachte Variante?
3. [ ] Story-Breakdown in Sprint Backlog
4. [ ] Implementierung starten

---

## Anhang A: MultiGP Seeding-Tabelle (16 Piloten)

```
QUALI (Race 1-4):
=================
Race 1: Seed 3, 6, 11, 14
Race 2: Seed 2, 7, 10, 15
Race 3: Seed 4, 5, 12, 13
Race 4: Seed 1, 8, 9, 16

BRACKET R1 (Race 5-8):
======================
Race 5: 3rd.R1, 4th.R1, 1st.R2, 3rd.R2
Race 6: 1st.R1, 2nd.R1, 4th.R2, 2nd.R2
Race 7: 1st.R3, 2nd.R3, 1st.R4, 2nd.R4
Race 8: 3rd.R3, 4th.R3, 3rd.R4, 4th.R4

CONSOLATION R1 (Race 9-10):
===========================
Race 9:  1st.R5, 4th.R6, 1st.R7, 4th.R8
Race 10: 3rd.R5, 2nd.R6, 3rd.R7, 2nd.R8

WB SEMIFINAL (Race 11-12):
==========================
Race 11: 1st.R5, 2nd.R6, 1st.R8, 2nd.R7
Race 12: 2nd.R5, 1st.R6, 2nd.R8, 1st.R7

CONSOLATION SEMI (Race 13):
===========================
Race 13: 1st.R9, 2nd.R10, 3rd.R12, 4th.R11
         (alternativ: 1st.R10, 2nd.R9, 3rd.R11, 4th.R12)

WB FINAL (Race 14):
===================
Race 14: 1st.R11, 2nd.R12, 1st.R12, 2nd.R11

GRAND FINAL - CTA:
==================
Pilots: 1st.R14, 2nd.R14, 1st.R13, 2nd.R13
Format: First to 2 wins
```

---

## Anhang B: Chase the Ace Regeln

1. **Start:** 4 Piloten, "clean slate" (keine Vorteile)
2. **Ziel:** Erster Pilot mit 2 Siegen gewinnt
3. **Dauer:** Minimum 2 Rennen, Maximum 5 Rennen
4. **Platz 2-4:** Motocross-Punktesystem
   - Punkte = Summe aller Platzierungen
   - Niedrigste Punktzahl = besserer Rang
   - Beispiel: 1, 2, 3 (6 Punkte) schlägt 2, 2, 3 (7 Punkte)
5. **Tiebreaker:** Platzierung im letzten Rennen
   - 3, 1, 2 (6 Punkte) schlägt 1, 2, 3 (6 Punkte)

---

*Dieses Dokument beschreibt das vollständige MultiGP Double Elimination Format und die notwendigen Änderungen zur Implementierung.*
