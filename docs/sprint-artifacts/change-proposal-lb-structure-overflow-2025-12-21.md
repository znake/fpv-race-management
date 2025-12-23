# Change Proposal: Loser Bracket Structure Overflow

**Datum:** 2025-12-21  
**Autor:** PM  
**Status:** ✅ Implemented  
**Severity:** Critical  
**Betrifft:** `src/lib/bracket-structure-generator.ts`, `src/lib/bracket-logic.ts`

---

## ✅ Implementation Summary (2025-12-21)

**Problem gelöst:** LB-Heats erhalten nun garantiert maximal 4 Piloten aus allen Quellen.

**Implementierte Lösung:** Option A + B kombiniert:
1. **Dynamische LB-Struktur:** `calculateLBRoundStructure()` berechnet die exakte Anzahl der benötigten Heats pro Runde
2. **Major/Minor Round-Typen:** Korrekte Alternation für WB-Loser-Einspeisung
3. **Koordiniertes Linking:** LB→LB und WB→LB werden gemeinsam geplant, um max 4 Piloten pro Heat zu garantieren

**Neue/geänderte Funktionen:**
- `calculateLBRoundStructure()`: Neue exportierte Funktion für detaillierte LB-Planung
- `calculateBracketSize()`: Verwendet jetzt dynamische LB-Berechnung
- `generateFullBracketStructure()`: Nutzt die neue LB-Struktur
- `linkBracketHeats()`: Koordiniertes Linking mit Kapazitätsprüfung

**Tests:** 57 neue/erweiterte Tests für LB-Overflow-Szenarien (7-60 Piloten), alle 257 Tests bestehen.

---

## 1. Problem Statement

### Kernproblem: LB-Heats erhalten mehr als 4 Piloten

Bei einem Double-Elimination-Bracket mit 4er-Heats gibt es ein strukturelles Problem: Loser-Bracket-Heats können Piloten aus **zwei Quellen** gleichzeitig erhalten:

1. **LB-Progression (sourceHeats):** Gewinner aus vorherigen LB-Runden
2. **WB-Einspeisung (targetLoserFromWB):** Verlierer aus Winner-Bracket-Heats

**Das führt dazu, dass ein einzelner LB-Heat mehr als 4 Piloten erhält - was gegen die Turnier-Regeln verstößt.**

### Konkret: 16-Piloten-Turnier Beispiel

**Aktuelle Bracket-Struktur für 16 Piloten:**
- **Quali:** 4 Heats (bracket-heat-1 bis 4)
- **WB:** 2 Runden + Finale (bracket-heat-5 bis 8)
- **LB:** 3 Runden + Finale (bracket-heat-9 bis 12)
- **Grand Finale:** bracket-heat-13

**Das Problem bei LB Round 2 (bracket-heat-11):**

```
Piloten-ZUFLUSS zu bracket-heat-11:

┌─────────────────────────────────────────────────────────────────┐
│ SOURCE 1: LB-Progression (sourceHeats)                          │
│                                                                 │
│   bracket-heat-9 (LB Runde 1)  ──┬──> 2 Gewinner                │
│   bracket-heat-10 (LB Runde 1) ──┴──> 2 Gewinner                │
│                                                                 │
│   Subtotal: 4 Piloten                                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SOURCE 2: WB-Verlierer (targetLoserFromWB)                      │
│                                                                 │
│   bracket-heat-5 (WB Runde 1)  ──┬──> 2 Verlierer               │
│   bracket-heat-8 (WB Finale)   ──┴──> 2 Verlierer               │
│                                                                 │
│   Subtotal: 4 Piloten                                           │
└─────────────────────────────────────────────────────────────────┘

GESAMT: 8 Piloten in bracket-heat-11  ❌ MAX 4 ERLAUBT!
```

### Warum passiert das?

Im korrekten Double-Elimination-Format gibt es **zwei Arten von LB-Runden:**

| Typ | Beschreibung | Piloten-Quelle |
|-----|-------------|----------------|
| **"Minor" Round** | WB-Verlierer kommen hinzu | WB-Losers + LB-Winners → müssen SPLITTET werden |
| **"Major" Round** | Nur LB-intern | NUR LB-Winners spielen unter sich |

**Die aktuelle Implementierung unterscheidet diese Runden-Typen nicht.** Sie generiert zu wenige LB-Heats in den mittleren Runden.

---

## 2. Impact Analysis: Betroffene Turniergrössen

### Analyse-Methodik

Für jede Turniergrösse berechne ich:
1. Anzahl Quali-Heats und Winner/Loser-Einspeisung
2. Maximale Piloten-Zuflüsse pro LB-Heat
3. Ob das 4-Piloten-Limit überschritten wird

### Detaillierte Analyse (7-60 Piloten)

| Piloten | Quali | WB-Heats | LB-Heats (aktuell) | Problem? | Betroffene Heats |
|---------|-------|----------|-------------------|----------|------------------|
| 7-8 | 2 | 1 WB-Final | 1 LB-Final | **JA** | LB erhält 4 Quali-Loser + evtl. WB-Loser |
| 9-12 | 3 | 2 (1 Runde + Finale) | 2 (1 Runde + Finale) | **JA** | LB Runde 2 |
| 13-16 | 4 | 3 (2 Runden + Finale) | 4 (3 Runden + Finale) | **JA** | LB Runde 2+3 |
| 17-20 | 5 | 4 (3 Runden + Finale) | 5 (4 Runden + Finale) | **JA** | LB Runde 2+3+4 |
| 21-24 | 6 | 4-5 | 5-6 | **JA** | Mehrere LB-Runden |
| 25-32 | 7-8 | 5-6 | 6-7 | **JA** | Mehrere LB-Runden |
| 33-48 | 9-12 | 7-8 | 8-9 | **JA** | Mehrere LB-Runden |
| 49-60 | 13-15 | 9-10 | 10-11 | **JA** | Mehrere LB-Runden |

### Ergebnis: **ALLE Turniergrössen über 6 Piloten sind betroffen**

Das Problem skaliert mit der Turniergrösse - je mehr Piloten, desto mehr LB-Heats sind vom Overflow betroffen.

---

## 3. Root Cause Analysis

### 3.1 calculateBracketSize() - Unzureichende LB-Runden-Berechnung

```typescript
// src/lib/bracket-structure-generator.ts (Zeilen 90-105)

let lbRounds: number
if (winnersFromQuali <= 4) {
  lbRounds = 1
} else if (winnersFromQuali <= 6) {
  lbRounds = 2
} else if (winnersFromQuali <= 8) {
  lbRounds = 3  // ❌ ZU WENIG für 16 Piloten!
} else if (winnersFromQuali <= 12) {
  lbRounds = 4
} // ...
```

**Problem:** Die Berechnung berücksichtigt nur die Anzahl der Piloten, nicht die Struktur der WB-Einspeisung.

**Korrekte Formel für Double-Elim mit 4er-Heats:**
```
LB Runden = 2 × (WB Runden) - 1

Grund: Für jede WB-Runde gibt es:
- Eine "Minor" LB-Runde (WB-Losers kommen rein)
- Eine "Major" LB-Runde (nur LB-intern)
```

### 3.2 linkBracketHeats() - Keine Validierung des Piloten-Limits

```typescript
// src/lib/bracket-structure-generator.ts (Zeilen 410-425)

wbRound.heats.forEach((wbHeat) => {
  if (lbHeatsForWBLosers.length > 0) {
    const lbTargetIdx = wbHeatCounter % lbHeatsForWBLosers.length
    wbHeat.targetLoserFromWB = lbHeatsForWBLosers[lbTargetIdx].id
    wbHeatCounter++
  }
})
```

**Problem:** Die Zuweisung verwendet eine einfache Modulo-Operation ohne zu prüfen:
1. Wie viele Piloten der LB-Heat bereits aus sourceHeats erhält
2. Ob der resultierende Piloten-Count ≤ 4 ist

### 3.3 generateFullBracketStructure() - Keine Minor/Major Round Unterscheidung

Die Funktion generiert LB-Runden ohne zu unterscheiden, welche Runden:
- Nur LB-Gewinner aufnehmen (Major)
- Zusätzlich WB-Verlierer aufnehmen (Minor)

---

## 4. Proposed Solutions

### Option A: Erhöhte LB-Runden-Anzahl (Empfohlen)

**Ansatz:** Verdopple die Anzahl der LB-Runden und alterniere zwischen Major/Minor Rounds.

```
16-Piloten-Turnier mit korrekter Struktur:

LB Runde 1 (Minor): 
  - Quali-Losers (8 Piloten) → 2 Heats à 4
  
LB Runde 2 (Major):
  - Nur LB R1 Winners (4 Piloten) → 1 Heat

LB Runde 3 (Minor):
  - LB R2 Winners (2) + WB R1 Losers (4) → 2 Heats
  
LB Runde 4 (Major):
  - Nur LB R3 Winners (4 Piloten) → 1 Heat
  
LB Runde 5 (Minor):
  - LB R4 Winners (2) + WB Final Losers (2) → 1 Heat
  
LB Finale:
  - LB R5 Winners (2) + ??? → 1 Heat
```

**Vorteile:**
- Folgt dem Standard Double-Elimination Format
- Keine Heat kann mehr als 4 Piloten haben
- Mathematisch korrekt

**Nachteile:**
- Mehr Heats = längere Turniere
- Komplexere Implementierung

### Option B: Dynamische Heat-Anzahl pro Runde

**Ansatz:** Berechne für jede LB-Runde, wie viele Heats basierend auf dem tatsächlichen Piloten-Zufluss benötigt werden.

```typescript
function calculateLBHeatsForRound(
  lbProgressionPilots: number,
  wbLosersPilots: number
): number {
  const totalPilots = lbProgressionPilots + wbLosersPilots
  return Math.ceil(totalPilots / 4)
}
```

**Vorteile:**
- Flexibler
- Optimiert für verschiedene Szenarien

**Nachteile:**
- Kann zu ungleichmässigen Brackets führen
- Schwieriger zu visualisieren

### Option C: WB-Loser-Pufferung

**Ansatz:** WB-Verlierer gehen zunächst in einen "Puffer-Pool" und werden erst in der nächsten Major-Runde eingespeist.

**Vorteile:**
- Minimale Änderung an bestehender Logik

**Nachteile:**
- Verzögert WB-Loser-Spiele → längere Wartezeiten

### Empfehlung: **Option A + B kombiniert**

1. Implementiere das Major/Minor-Runden-Konzept (Option A)
2. Validiere pro Heat, dass max 4 Piloten ankommen (Option B als Safety-Check)

---

## 5. Acceptance Criteria

### AC1: Kein LB-Heat überschreitet 4 Piloten
**Given** ein Turnier mit beliebiger Pilotenanzahl (7-60)  
**When** die Bracket-Struktur generiert wird  
**Then** hat KEIN LB-Heat mehr als 4 Piloten aus allen Quellen kombiniert

### AC2: Major/Minor Runden sind korrekt implementiert
**Given** ein LB-Heat in einer "Minor"-Runde  
**When** Piloten zugewiesen werden  
**Then** erhält er NUR WB-Verlierer ODER LB-Gewinner (nicht beides voll)

### AC3: WB-Verlierer werden korrekt verteilt
**Given** WB-Heats derselben Runde werden abgeschlossen  
**When** die Verlierer dem LB zugewiesen werden  
**Then** gehen sie in UNTERSCHIEDLICHE LB-Heats (nicht alle in denselben)

### AC4: Bracket-Visualisierung zeigt korrekte Struktur
**Given** die neue LB-Struktur  
**When** das Bracket angezeigt wird  
**Then** sind alle Verbindungen korrekt und keine Überlappungen

### AC5: Alle Turniergrössen werden unterstützt
**Given** Pilotenzahlen von 7 bis 60  
**When** Turniere simuliert werden  
**Then** erreichen alle korrekt das Grand Finale ohne Overflow-Fehler

---

## 6. Risk Assessment

### Was passiert, wenn wir das Problem NICHT beheben?

| Szenario | Konsequenz | Schweregrad |
|----------|------------|-------------|
| **Turnier mit 16+ Piloten** | LB-Heats haben 8+ Piloten - unmöglich zu spielen | **Kritisch** |
| **Bracket-Visualisierung** | Überlappende Piloten-Anzeigen, verwirrende UI | **Hoch** |
| **Turnier-Logik** | Falsche Weiterleitungen, Piloten "verschwinden" | **Kritisch** |
| **Erstes echtes Event** | App ist unbrauchbar, Fallback auf manuell | **Kritisch** |

### Risiko-Einschätzung der Lösung

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| Komplexe Mathematik | Mittel | Unit-Tests für alle Turniergrössen |
| Breaking Changes | Hoch | Migration-Strategie für bestehende Brackets |
| Performance | Niedrig | Lazy-Berechnung, max 60 Piloten |
| Timeline | Mittel | Kann priorisiert vor nächstem Event |

---

## 7. Implementation Roadmap

### Phase 1: Analyse & Design (0.5 Tage)
- [ ] Exakte Formel für Major/Minor-Runden ableiten
- [ ] Test-Cases für alle Turniergrössen definieren
- [ ] Mathematisches Modell validieren

### Phase 2: Struktur-Generator (1 Tag)
- [ ] `calculateBracketSize()` komplett überarbeiten
- [ ] Neues Interface für Major/Minor Round Typen
- [ ] `generateFullBracketStructure()` anpassen

### Phase 3: Linking-Logik (1 Tag)
- [ ] `linkBracketHeats()` mit Piloten-Limit-Validierung
- [ ] WB→LB Zuweisung mit Round-Type-Awareness
- [ ] Safety-Check: Max 4 Piloten pro Heat

### Phase 4: Integration & Tests (1 Tag)
- [ ] `bracket-logic.ts` Anpassungen
- [ ] Bestehende Tests erweitern
- [ ] Neue Tests für Overflow-Szenarien

### Phase 5: Visualisierung (0.5 Tage)
- [ ] `bracket-tree.tsx` für neue Struktur
- [ ] SVG-Verbindungen validieren

**Geschätzter Gesamtaufwand:** 4 Tage

---

## 8. Betroffene Dateien

| Datei | Änderungsart | Priorität |
|-------|-------------|----------|
| `src/lib/bracket-structure-generator.ts` | Major Refactor | P0 |
| `src/lib/bracket-logic.ts` | Anpassungen | P0 |
| `tests/bracket-structure.test.ts` | Erweitern | P0 |
| `tests/full-bracket-structure.test.ts` | Erweitern | P0 |
| `tests/bracket-progression.test.ts` | Erweitern | P1 |
| `src/components/bracket-tree.tsx` | Anpassungen | P1 |

---

## 9. Nächste Schritte

1. [ ] Jakob Review dieses Proposals
2. [ ] Entscheidung: Option A, B, oder Kombination
3. [ ] Sprint-Planung: Als eigene Story oder Teil von bestehendem Epic?
4. [ ] Implementierung starten
5. [ ] QA mit verschiedenen Turniergrössen

---

## Anhang: Korrekte Double-Elimination Struktur (16 Piloten)

```
WINNER BRACKET                          LOSER BRACKET
=============                           =============

Quali (4 Heats)
    ↓ Winners (8)                       ↓ Losers (8)
    
WB R1 (2 Heats)                        LB R1 Minor (2 Heats) ← Quali Losers
    ↓ Win (4)     ↘ Lose (4)           ↓ Win (4)
    
WB Semi (1 Heat)                       LB R2 Major (1 Heat) ← nur LB R1 Winners
    ↓ Win (2)     ↘ Lose (2)           ↓ Win (2)
                                       
WB Final (1 Heat)                      LB R3 Minor (2 Heats) ← WB R1 Losers + LB R2 Win
    ↓ Win (2)     ↘ Lose (2)           ↓ Win (4)
                                       
                                       LB R4 Major (1 Heat) ← nur LB R3 Winners
                                       ↓ Win (2)
                                       
                                       LB R5 Minor (1 Heat) ← WB Semi Losers + LB R4 Win
                                       ↓ Win (2)
                                       
                                       LB Final (1 Heat) ← WB Final Losers + LB R5 Win
                                       ↓ Win (2)

            GRAND FINALE
            WB Winner vs LB Winner
            
Heats insgesamt: 4 + 2 + 1 + 1 + 2 + 1 + 2 + 1 + 1 + 1 + 1 = 17 Heats
(statt aktuell 12-13)
```

---

*Dieses Dokument beschreibt ein kritisches strukturelles Problem, das vor dem ersten Live-Event behoben werden muss.*
