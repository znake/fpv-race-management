---
date: 2026-01-03
author: John (PM)
type: epic
context: Epic 13 - Runden-basiertes Bracket Redesign
status: draft
source: epic-12-rules.md, bracket-tree-dynamic-svg.html
---

# Epic 13: Runden-basiertes Bracket Redesign

## Zusammenfassung

Das aktuelle Pool-basierte dynamische Bracket-System wird durch ein **klassisches runden-basiertes Double-Elimination-System** ersetzt, wie in `epic-12-rules.md` beschrieben. Die Implementierung folgt dem visuellen Mockup `bracket-tree-dynamic-svg.html`.

**Kernproblem:** Das aktuelle System generiert Heats dynamisch aus Pools, wenn ≥4 Piloten vorhanden sind. Das neue Format erfordert:
1. **Feste Rundenstruktur** mit definierten Heats pro Runde
2. **WB-Verlierer fließen in spezifische LB-Runden** (nicht in einen Pool)
3. **Grand Finale mit 4 Piloten** (nicht 2)
4. **Rematch-Regel** für WB-Piloten im Grand Finale

---

## Aktueller Zustand (Pool-basiert)

### bracket-structure-generator.ts
- Generiert eine vorberechnete Bracket-Struktur (nur für Visualisierung)
- Komplexe LB-Berechnung mit Major/Minor Rounds
- `linkBracketHeats()` für Source/Target-Verknüpfungen

### tournamentStore.ts
- **winnerPool**: Sammelt WB-Gewinner dynamisch
- **loserPool**: Sammelt WB/LB-Verlierer dynamisch
- `submitHeatResults()`: Generiert Heats wenn Pool ≥4
- `generateWBHeatFromPool()`, `generateLBHeat()`: Pool-basierte Generierung
- Grand Finale: **2 Piloten** (WB Winner + LB Winner)

### bracket-logic.ts
- Minimale Helper (nach Refactoring 2026-01-03)
- `getPilotBracketOrigin()`: Für GF Tags
- `syncQualiHeatsToStructure()`: Nur für Visualisierung
- `rollbackBracketForHeat()`: Für Edit-Mode

---

## Neuer Zustand (Runden-basiert) - Epic 12 Rules

### 1. Qualifikation
- Alle Piloten in Heats à 4 (oder 3 bei ungeraden Zahlen)
- Platz 1+2 → **Winner Bracket Runde 1**
- Platz 3+4 → **Loser Bracket Runde 1** (mit 1. Leben verbraucht)

### 2. Winner Bracket
- **Runden-basiert**: WB R1 → WB R2 → ... → WB Finale
- Platz 1+2 → nächste WB Runde
- **Platz 3+4 → entsprechende LB Runde** (NICHT Pool!)

### 3. Loser Bracket (Pool-System für Neu-Mischung)
- **LB R1**: Quali-Verlierer (16) + WB R1-Verlierer (8) = 24 Piloten → 6 Heats
- **LB R2**: LB R1-Gewinner (12) + WB R2-Verlierer (4) = 16 Piloten → 4 Heats
- **Wichtig**: Nach jeder Runde werden Piloten **neu gemischt** (Pool-System im LB)
- Keine festen Heat-to-Heat Verbindungen im LB!

### 4. Reihenfolge
```
WB R1 (alle Heats) → LB R1 (alle Heats) → WB R2 (alle Heats) → LB R2 (alle Heats) → ...
```
WB-Heats einer Runde müssen abgeschlossen sein, bevor LB-Heats dieser Runde starten.

### 5. Grand Finale (4 Piloten!)
- **2 Piloten aus WB Finale** (Platz 1+2 - nie verloren)
- **2 Piloten aus LB Finale** (Platz 1+2 - 1x verloren)
- Alle 4 fliegen zusammen
- Ergebnis: Platz 1-4 des Turniers

### 6. Rematch-Regel
Nach dem Grand Finale Heat:
- **Prüfe Platz 1**: Ist LB-Pilot UND Platz 3 ist WB-Pilot? → Rematch 1v1
- **Prüfe Platz 2**: Ist LB-Pilot UND Platz 4 ist WB-Pilot? → Rematch 1v1
- Gewinner bekommt höheren Platz

---

## Notwendige Änderungen

### 1. Datenmodell-Erweiterungen (`tournament.ts`)

**Neue Felder:**
```typescript
interface Heat {
  // Bestehend
  id: string
  heatNumber: number
  pilotIds: string[]
  status: HeatStatus
  bracketType?: BracketType
  isFinale?: boolean
  roundName?: string
  results?: HeatResults
  
  // NEU
  roundNumber?: number           // Welche Runde im Bracket
  isRematch?: boolean            // Für Grand Finale Rematch
  rematchBetween?: [string, string]  // Pilot IDs für Rematch
}

// NEU: Pilot-Tracking erweitern
interface PilotBracketState {
  pilotId: string
  currentBracket: 'winner' | 'loser' | 'eliminated' | 'grandFinale'
  bracketOrigin: 'wb' | 'lb'  // Woher im Grand Finale
  wbRoundReached?: number     // Höchste WB-Runde
  lbRoundReached?: number     // Höchste LB-Runde
}
```

**Zu entfernende/veränderte Felder im Store:**
- `winnerPool: string[]` → **ENTFERNEN** (wird zu `currentWBRoundPilots`)
- `loserPool: string[]` → **UMBENENNEN zu `currentLBRoundPilots`** (Pool wird im LB beibehalten!)

### 2. Store-Änderungen (`tournamentStore.ts`)

#### 2.1 State-Änderungen
```typescript
// ENTFERNEN
winnerPool: string[]           // Pool-Konzept für WB nicht mehr nötig

// BEHALTEN (aber anpassen)
loserPool: string[]            // LB bleibt Pool-basiert für Neu-Mischung!

// NEU
currentWBRound: number         // Aktuelle WB-Runde
currentLBRound: number         // Aktuelle LB-Runde  
pilotBracketStates: Map<string, PilotBracketState>
grandFinaleRematchPending: boolean
```

#### 2.2 Funktion `submitHeatResults()` - KOMPLETTES REWRITE

**Aktuelle Logik (zu ersetzen):**
```typescript
// Pool-basiert: Piloten in Pools sammeln, Heats generieren wenn Pool voll
if (newWinnerPool.size >= 4) { generateWBHeat() }
```

**Neue Logik:**
```typescript
// Runden-basiert:
// 1. Speichere Heat-Ergebnisse
// 2. Update pilotBracketStates
// 3. Prüfe ob aktuelle Runde abgeschlossen
// 4. Wenn ja: Generiere ALLE Heats der nächsten Runde auf einmal
```

#### 2.3 Neue Funktionen

```typescript
// Generiert alle Heats einer WB-Runde auf einmal
generateWBRound(roundNumber: number): Heat[]

// Generiert alle Heats einer LB-Runde (aus Pool neu gemischt)
generateLBRound(roundNumber: number): Heat[]

// Prüft ob alle Heats einer Runde abgeschlossen sind
isRoundComplete(bracketType: 'winner' | 'loser', roundNumber: number): boolean

// Generiert Grand Finale mit 4 Piloten
generateGrandFinale(): Heat

// Prüft und generiert Rematches
checkAndGenerateRematches(grandFinaleResults: Rankings[]): Heat[]
```

#### 2.4 Zu entfernende/veränderte Funktionen

**ENTFERNEN (toter Code vermeiden):**
- `generateWBHeatFromPool()` - ersetzt durch `generateWBRound()`
- `canGenerateWBFinale()` - WB Finale ist letzte WB-Runde, nicht Pool-basiert
- `removeFromWinnerPool()` - kein WB Pool mehr
- `addToWinnerPool()` - kein WB Pool mehr

**ANPASSEN:**
- `generateLBHeat()` → `generateLBRound()` (Logik bleibt Pool-basiert, aber generiert alle Heats einer Runde)
- `addToLoserPool()` - bleibt, aber wird nur nach LB-Runden-Abschluss befüllt
- `getNextRecommendedHeat()` - Reihenfolge WB vor LB berücksichtigen

### 3. Bracket-Generator Anpassungen (`bracket-structure-generator.ts`)

**Minimale Änderungen:**
- Struktur passt bereits größtenteils
- `LBRoundType` major/minor kann vereinfacht werden
- Die Komplexität der WB→LB Verknüpfung bleibt, da WB-Verlierer in spezifische LB-Runden fließen

**WICHTIG:** Die bestehende Berechnung von LB-Heats ist korrekt für die Visualisierung. Die Änderung betrifft primär die **Runtime-Logik** im Store.

### 4. UI-Änderungen

#### 4.1 Grand Finale Heat Box
- Zeigt **4 Piloten** statt 2
- WB/LB Tags bleiben
- Neue Section für Rematch-Heats

#### 4.2 Bracket Tree
- Das Mockup `bracket-tree-dynamic-svg.html` zeigt bereits das korrekte Layout
- **LB ohne SVG-Linien** (Pool-basiert, wird neu gemischt)
- **WB mit SVG-Linien** (feste Heat-to-Heat Verbindungen)

#### 4.3 Neue Rematch-UI
- Nach Grand Finale: Anzeige der möglichen Rematches
- 1v1 Heat-Box für Rematch
- Finale Platzierungsanzeige nach Rematches

### 5. Test-Anpassungen

**Zu aktualisierende Tests:**
- `heat-completion.test.tsx` - Pool-Logik → Runden-Logik
- `lb-heat-generation.test.ts` - bleibt ähnlich (Pool im LB)
- `dynamic-brackets-phase1.test.ts` - WB-Pool Tests entfernen
- `dynamic-brackets-phase2.test.ts` - WB-Pool Tests entfernen
- `grand-finale-tags.test.tsx` - 4 Piloten statt 2
- `finale-ceremony.test.tsx` - 4 Piloten, Rematch-Logik

**Neue Tests:**
- `round-progression.test.ts` - WB/LB Rundenfortschritt
- `rematch-logic.test.ts` - Grand Finale Rematch-Regel

---

## User Stories

### US-13.1: Runden-basierte WB-Progression (HIGH)
**Als** Turnierleiter  
**möchte ich** dass WB-Heats rundenweise generiert werden  
**sodass** ich einen klaren Überblick über den Turnierfortschritt habe

**Akzeptanzkriterien:**
1. Nach Quali-Abschluss werden ALLE WB R1 Heats generiert
2. WB R1-Gewinner (Platz 1+2) werden für WB R2 vorgemerkt
3. WB R1-Verlierer (Platz 3+4) werden für LB R1 vorgemerkt
4. WB R2 wird erst generiert wenn ALLE WB R1 Heats completed sind
5. `winnerPool` wird entfernt (kein Pool-basierter WB mehr)

### US-13.2: LB-Pooling mit Runden-Synchronisation (HIGH)
**Als** Turnierleiter  
**möchte ich** dass LB-Piloten pro Runde neu gemischt werden  
**sodass** WB-Verlierer fair in laufende LB-Runden integriert werden

**Akzeptanzkriterien:**
1. LB R1 startet nach WB R1 (alle Heats)
2. LB R1 enthält: Quali-Verlierer + WB R1-Verlierer (neu gemischt)
3. LB R2 startet nach WB R2 + LB R1 abgeschlossen
4. LB R2 enthält: LB R1-Gewinner + WB R2-Verlierer (neu gemischt)
5. Pool-Indikator zeigt Zusammensetzung an

### US-13.3: Grand Finale mit 4 Piloten (HIGH)
**Als** Turnierleiter  
**möchte ich** ein Grand Finale mit 4 Piloten  
**sodass** der Turniersieg in einem epischen Finale entschieden wird

**Akzeptanzkriterien:**
1. Grand Finale enthält 2 WB-Finale-Piloten (Platz 1+2)
2. Grand Finale enthält 2 LB-Finale-Piloten (Platz 1+2)
3. Alle 4 Piloten fliegen zusammen in einem Heat
4. Ergebnis bestimmt Platz 1-4 des Turniers
5. WB/LB Tags zeigen Herkunft jedes Piloten

### US-13.4: Grand Finale Rematch-Regel (MEDIUM)
**Als** Turnierleiter  
**möchte ich** die Rematch-Regel nach dem Grand Finale anwenden  
**sodass** WB-Piloten ihre faire zweite Chance bekommen

**Akzeptanzkriterien:**
1. Nach GF: Prüfe ob Platz 1 = LB und Platz 3 = WB → Rematch
2. Nach GF: Prüfe ob Platz 2 = LB und Platz 4 = WB → Rematch
3. Rematch ist 1v1 Heat
4. Rematch-Gewinner bekommt höheren Platz
5. UI zeigt Rematch-Status und -Ergebnis

### US-13.5: WB-vor-LB Reihenfolge (MEDIUM)
**Als** Turnierleiter  
**möchte ich** dass WB-Heats vor LB-Heats der gleichen Runde gespielt werden  
**sodass** LB-Heats alle WB-Verlierer enthalten können

**Akzeptanzkriterien:**
1. `getNextRecommendedHeat()` priorisiert WB vor LB
2. LB-Heats einer Runde werden erst empfohlen wenn alle WB-Heats der Runde abgeschlossen sind
3. Visueller Indikator zeigt "WB R1 läuft" / "LB R1 wartet auf WB"

### US-13.6: Migration bestehender Logik ohne toten Code (HIGH)
**Als** Entwickler  
**möchte ich** die Pool-basierte WB-Logik sauber entfernen  
**sodass** kein toter Code entsteht

**Akzeptanzkriterien:**
1. `generateWBHeatFromPool()` wird entfernt
2. `canGenerateWBFinale()` wird entfernt (redundant)
3. `removeFromWinnerPool()` wird entfernt
4. `addToWinnerPool()` wird entfernt
5. `winnerPool` State wird entfernt
6. Alle Tests die diese Funktionen nutzen werden aktualisiert
7. Keine `// deprecated` Kommentare - Code wird gelöscht

---

## Implementierungsreihenfolge

1. **Phase 1: Datenmodell** (US-13.6 vorbereiten)
   - Neue Felder zu Heat-Interface hinzufügen
   - PilotBracketState Interface definieren
   - State-Felder im Store anpassen

2. **Phase 2: WB-Logik** (US-13.1, US-13.5)
   - `generateWBRound()` implementieren
   - `isRoundComplete()` implementieren
   - WB-Pool-Funktionen entfernen (US-13.6)
   - Tests anpassen

3. **Phase 3: LB-Synchronisation** (US-13.2)
   - LB-Pool-Befüllung nach WB-Runden-Abschluss
   - `generateLBRound()` mit WB-Verlierer-Integration
   - Tests anpassen

4. **Phase 4: Grand Finale** (US-13.3, US-13.4)
   - 4-Piloten Grand Finale
   - Rematch-Logik
   - UI-Anpassungen
   - Tests schreiben

5. **Phase 5: Cleanup** (US-13.6 abschließen)
   - Toter Code entfernen
   - Alle Tests grün
   - Dokumentation aktualisieren

---

## Risiken und Mitigationen

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| Bestehende Tests brechen | Hoch | Inkrementelle Migration, Feature-Flag erwägen |
| Edge Cases bei ungeraden Pilotenzahlen | Mittel | Extensive Tests mit 7, 9, 11, 15, 27 Piloten |
| Rematch-Regel-Komplexität | Niedrig | Isolierte Implementierung, Unit Tests |
| LB-WB-Synchronisation | Mittel | State-Machine für Rundenfortschritt |

---

## Abhängigkeiten

- **Epic 11 (Unified Bracket Tree)**: Kann parallel erfolgen - UI-Änderungen
- **Epic 10 (Code-Konsolidierung)**: Sollte vorher abgeschlossen sein
- **Mockup `bracket-tree-dynamic-svg.html`**: Referenz für UI-Layout

---

## Geschätzter Aufwand

| Phase | Aufwand |
|-------|---------|
| Phase 1: Datenmodell | 0.5-1 Tag |
| Phase 2: WB-Logik | 2-3 Tage |
| Phase 3: LB-Synchronisation | 1-2 Tage |
| Phase 4: Grand Finale + Rematch | 2-3 Tage |
| Phase 5: Cleanup + Tests | 1-2 Tage |
| **GESAMT** | **7-11 Tage** |

---

## Code-Entfernungs-Checkliste (toter Code vermeiden)

### tournamentStore.ts
- [ ] `winnerPool: string[]` entfernen
- [ ] `addToWinnerPool()` entfernen
- [ ] `removeFromWinnerPool()` entfernen
- [ ] `generateWBHeatFromPool()` entfernen
- [ ] `canGenerateWBFinale()` entfernen

### Tests
- [ ] `dynamic-brackets-phase1.test.ts` - WB-Pool Tests entfernen/ersetzen
- [ ] `dynamic-brackets-phase2.test.ts` - WB-Pool Tests entfernen/ersetzen
- [ ] Pool-spezifische Assertions auf Runden-Assertions umstellen

### UI-Komponenten
- [ ] Prüfen ob Pool-Visualisierung für WB noch benötigt wird → entfernen
- [ ] Grand Finale Box für 4 Piloten erweitern

---

## Abgrenzung zu Epic 12

**Epic 12** (bereits dokumentiert in `epics.md`) beschreibt ebenfalls ein "Klassisches Turnierbaum-System" mit ähnlichen Zielen. Die Unterschiede:

| Aspekt | Epic 12 | Epic 13 (dieses Epic) |
|--------|---------|----------------------|
| **Fokus** | Vertikales Layout + Logik-Redesign | Reine Logik-Änderungen basierend auf `epic-12-rules.md` |
| **Grand Finale** | Nicht explizit spezifiziert | **4 Piloten + Rematch-Regel** |
| **LB-System** | Pool als Fallback | **Pool bleibt primär im LB** (Neu-Mischung) |
| **WB-System** | Runden-basiert | **Runden-basiert (kein Pool)** |
| **Mockup** | `bracket-tree-vertical-mockup.html` | `bracket-tree-dynamic-svg.html` |

**Empfehlung:** Epic 13 sollte Epic 12 **ersetzen oder ergänzen**, da `epic-12-rules.md` die definitive Regel-Dokumentation ist.

---

## Fazit

Dieses Epic transformiert das Turniersystem von einem Pool-basierten zu einem runden-basierten Double-Elimination-Format. Die wichtigsten Änderungen sind:

1. **WB wird runden-basiert** (kein Pool mehr)
2. **LB bleibt Pool-basiert** aber mit Runden-Synchronisation
3. **Grand Finale mit 4 Piloten** statt 2
4. **Rematch-Regel** für faire zweite Chance
5. **Saubere Code-Migration** ohne toten Code

---

## Betroffene Dateien - Vollständige Liste

### Zu ändernde Dateien:

| Datei | Änderungsart | Priorität |
|-------|--------------|-----------|
| `src/types/tournament.ts` | Erweitern (neue Felder) | HIGH |
| `src/stores/tournamentStore.ts` | Signifikante Änderungen | HIGH |
| `src/lib/bracket-structure-generator.ts` | Minimale Anpassungen | MEDIUM |
| `src/lib/bracket-logic.ts` | Minimale Anpassungen | LOW |
| `src/components/bracket/sections/GrandFinaleSection.tsx` | 4 Piloten UI | HIGH |
| `tests/dynamic-brackets-phase1.test.ts` | WB-Pool Tests ersetzen | HIGH |
| `tests/dynamic-brackets-phase2.test.ts` | WB-Pool Tests ersetzen | HIGH |
| `tests/lb-heat-generation.test.ts` | Anpassen | MEDIUM |
| `tests/grand-finale-tags.test.tsx` | 4 Piloten | HIGH |

### Zu entfernende Funktionen aus `tournamentStore.ts`:

1. `winnerPool: string[]` (State)
2. `addToWinnerPool(pilotIds: string[])`
3. `removeFromWinnerPool(count: number)`
4. `generateWBHeatFromPool(): Heat | null`
5. `canGenerateWBFinale(): boolean`

### Neue Funktionen für `tournamentStore.ts`:

1. `currentWBRound: number` (State)
2. `currentLBRound: number` (State)
3. `generateWBRound(roundNumber: number): Heat[]`
4. `generateLBRound(roundNumber: number): Heat[]`
5. `isRoundComplete(bracketType, roundNumber): boolean`
6. `checkAndGenerateRematches(rankings): Heat[]`
