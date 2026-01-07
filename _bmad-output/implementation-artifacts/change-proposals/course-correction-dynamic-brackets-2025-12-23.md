# Course Correction: Vollständig Dynamisches Bracket-System

**Datum:** 2025-12-23
**Autor:** Jakob (Product Owner)
**Status:** Approved
**Severity:** Critical - Architecture Redesign
**Betrifft:** Komplettes Bracket-System (WB + LB)

---

## 1. Summary

Das aktuelle Bracket-System verwendet eine vorberechnete Struktur (`bracket-structure-generator.ts`), die alle Runden und Heats im Voraus berechnet. Gleichzeitig wurde ein Loser Bracket Pooling Change Proposal erstellt, das ein dynamisches Pooling-System für das Loser Bracket einführt.

**Entscheidung des Product Owners:** Das Bracket-System soll vollständig dynamisch sein – keine vorberechneten Strukturen, weder im Winner noch im Loser Bracket. Heats werden dynamisch basierend auf Ergebnissen erstellt. Alles ergibt sich aus dem Flow: Heat abgeschlossen → Gewinner/Verlierer verteilen → Neue Heats generieren.

---

## 2. Problem Statement

### 2.1 Konkurrierende Systeme

Das Projekt hat aktuell zwei parallele Bracket-Systeme:

| System | Beschreibung | Status |
|--------|--------------|--------|
| **Vorberechnetes Bracket** | `bracket-structure-generator.ts` berechnet alle Runden im Voraus | Implementiert, aber unflexibel |
| **Dynamisches Pooling** | `loserPool` im Store sammelt Verlierer dynamisch | In Proposal geplant |

**Problem:** Beide Systeme widersprechen sich und können nicht zusammen existieren.

### 2.2 Inkonsistente Heat-IDs

- Vorberechnete Heats: IDs wie `bracket-heat-N`
- Dynamische Pooling-Heats: IDs wie `lb-heat-${uuid}`
- Führt zu Verwirrung in der Datenstruktur

### 2.3 Fehlende Dynamik im Winner Bracket

- Winner Bracket ist noch vorberechnet
- Nur Loser Bracket hat dynamische Pooling-Logik
- Unvereinbare Architektur: WB = statisch, LB = dynamisch

### 2.4 Unklare Visualisierung

- Bracket-Baum zeigt vorberechnete Struktur
- Dynamische Heats passen nicht dazu
- Visuelle Diskrepanz zwischen Struktur und Realität

---

## 3. Root Cause Analysis

### 3.1 Ursache: Hybrider Ansatz

Das Projekt hat zwei unterschiedliche Ansätze parallel entwickelt:

1. **Bracket-Struktur-Generator:** Klassische Tournament-Baum-Logik, wie man sie von 1v1-Spielen kennt. Alle Matches vorberechnen.

2. **Loser Pooling:** Flexibler Pool-Ansatz für 4er-Heats, bei dem Heats dynamisch erstellt werden basierend auf Ergebnissen.

### 3.2 Falsche Annahmen

| Annahme | Realität |
|---------|----------|
| Vorbrechnete Struktur funktioniert für 4er-Heats | Falsch – führt zu leeren/unspielbaren Heats |
| Winner Bracket muss strukturiert sein | Falsch – kann wie Loser Bracket dynamisch sein |
| Bracket-Visualisierung braucht vorberechnete Struktur | Falsch – kann dynamisch aufgebaut werden |

### 3.3 Konzeptuelle Inkompatibilität

```
Vorbrechnetes System:
=====================
R1  R2  R3  R4  Finale
 ↓   ↓   ↓   ↓
[H1][H5][H8][H9] ← Alle im Voraus definiert
[H2]    |
[H3]    |
[H4]    ↓

Dynamisches System:
==================
Heat abgeschlossen → Piloten verteilen → Neue Heats generieren
         ↓                 ↓                    ↓
     [Heat 1]     Platz 1+2 → WB      [WB Heat neu]
                   Platz 3+4 → Pool   [LB Heat neu]
```

---

## 4. Proposed Solution

### 4.1 Grundprinzip

> **Keine vorberechneten Bracket-Strukturen. Heats werden dynamisch basierend auf Ergebnissen erstellt. WB und LB sind beide dynamisch. Alles ergibt sich aus dem Flow.**

### 4.2 Dynamisches Winner Bracket

#### Ablauf:

1. **Qualifikation:**
   - Alle Quali-Heats werden erstellt (basierend auf Pilotenanzahl)
   - Quali-Heats werden gespielt

2. **WB-Heat Generierung:**
   ```
   Wenn alle Quali-Heats fertig:
     → Sammle alle Gewinner (Platz 1+2)
     → Erstelle WB-Heat mit 4 Piloten
     → (oder 2-3 Piloten bei kleineren Zahlen)
   ```

3. **WB Progression:**
   ```
   Wenn WB-Heat fertig:
     → Gewinner (Platz 1+2) → Nächster WB-Heat
     → Verlierer (Platz 3+4) → Loser Pool
   ```

4. **WB Finale:**
   ```
   Wiederholen bis 2 Piloten übrig:
     → Erstelle WB Finale (2 Piloten)
     → Gewinner (1) → Grand Finale
     → Verlierer (2) → Loser Pool
   ```

### 4.3 Dynamisches Loser Bracket

#### Grundprinzip: FIFO (First In, First Out)

> **Wer zuerst verliert, fliegt auch zuerst wieder. Keine zufällige Auswahl!**

#### Ablauf:

1. **Verlierer sammeln:**
    ```
    Alle Verlierer (Platz 3+4) → Loser Pool (in der Reihenfolge des Verlierens)
    ```

2. **LB-Heat Generierung (während WB aktiv):**
    ```
    Wenn Pool >= 4 Piloten UND WB noch offene Heats hat:
      → Erstelle LB-Heat mit den ersten 4 Piloten aus dem Pool (FIFO)
      → Diese Piloten werden aus dem Pool entfernt
    ```

3. **Warten wenn noch Verlierer nachkommen:**
    ```
    Wenn Pool < 4 Piloten UND WB noch offene Heats hat:
      → Warten auf weitere Verlierer
      → Wenn Pool >= 4 Piloten: LB-Heat erstellen
    ```

4. **LB Progression:**
    ```
    Wenn LB-Heat fertig:
      → Gewinner (Platz 1+2) → Zurück in Pool (am Ende anfügen)
      → Verlierer (Platz 3+4) → Eliminiert
    ```

5. **LB Finale (wenn WB abgeschlossen):**
    ```
    Nach WB-Finale:
      → Alle verbleibenden Piloten aus Pool nehmen
      → Erstelle LB Finale mit allen Piloten (2-4 Piloten)
      → Gewinner (1-2) → Grand Finale Pool
    ```

### 4.4 Grand Finale

```
WB Finale: 2 Piloten
  → Gewinner (1) → Grand Finale Pool
  → Verlierer (2) → Loser Pool

LB Finale: 2-4 Piloten
  → Gewinner (1-2) → Grand Finale Pool

Wenn Grand Finale Pool 4 Piloten hat:
  → Erstelle Grand Finale (4-Piloten Heat)
  → Platz 1 = Turnier-Sieger
  → Platz 2-4 = Finalisten

Wenn Grand Finale Pool nur 2-3 Piloten hat (Worst Case):
  → Grand Finale mit allen Piloten
```

---

### 4.5 Konkretes Beispiel: 8 Piloten

**Piloten:** Jakob, Max, Markus, Niklas, Simon, Jürgen, Andi, Berni

**Qualifikationsrunden:**

```
HEAT 1 (Qualifikation):
========================
Piloten: Jakob, Max, Markus, Niklas
Ergebnis: Jakob(1), Niklas(2), Max(3), Markus(4)
→ Jakob, Niklas → WB Pool
→ Max, Markus → LB Pool [Max, Markus]

HEAT 2 (Qualifikation):
========================
Piloten: Simon, Jürgen, Andi, Berni
Ergebnis: Jürgen(1), Berni(2), Simon(3), Andi(4)
→ Jürgen, Berni → WB Pool
→ Simon, Andi → LB Pool [Max, Markus, Simon, Andi]

Pool Status:
- WB Pool: [Jakob, Niklas, Jürgen, Berni] = 4 Piloten ✓
- LB Pool: [Max, Markus, Simon, Andi] = 4 Piloten ✓
```

**Winner Bracket Runde 1:**

```
HEAT 3 (WB):
=============
Piloten: Jakob, Niklas, Jürgen, Berni
Ergebnis: Jakob(1), Jürgen(2), Niklas(3), Berni(4)
→ Jakob, Jürgen → WB Pool
→ Niklas, Berni → LB Pool [Max, Markus, Simon, Andi, Niklas, Berni]
```

**Loser Bracket Runde 1:**

```
HEAT 4 (LB):
=============
Piloten: Max, Markus, Simon, Andi (FIFO: erste 4 aus Pool)
Ergebnis: Max(1), Markus(2), Simon(3), Andi(4)
→ Max, Markus → LB Pool [Niklas, Berni, Max, Markus]
→ Simon, Andi → ELIMINIERT

Pool Status:
- WB Pool: [Jakob, Jürgen] = 2 Piloten (WB Finale kann erstellt werden)
- LB Pool: [Niklas, Berni, Max, Markus] = 4 Piloten ✓
```

**Winner Bracket Finale:**

```
HEAT 5 (WB Finale):
===================
Piloten: Jakob, Jürgen
Ergebnis: Jakob(1), Jürgen(2)
→ Jakob → Grand Finale Pool [Jakob]
→ Jürgen → LB Pool [Niklas, Berni, Max, Markus, Jürgen]

WB Finale abgeschlossen!
```

**Loser Bracket Finale:**

```
HEAT 6 (LB Finale):
===================
Piloten: Niklas, Berni, Max, Markus (FIFO: erste 4 aus Pool)
Hinweis: Jürgen wartet im Pool für den nächsten Heat
Ergebnis: Niklas(1), Max(2), Berni(3), Markus(4)
→ Niklas, Max → Grand Finale Pool [Jakob, Niklas, Max]
→ Berni, Markus → ELIMINIERT

Noch Jürgen im Pool! Prüfen ob noch LB-Heat nötig...
→ Pool hat nur Jürgen [Jürgen] = 1 Pilot
→ WB ist fertig, Pool leer machen mit Grand Finale Pool

Grand Finale Pool jetzt: [Jakob, Niklas, Max, Jürgen] = 4 Piloten ✓
```

**Grand Finale:**

```
HEAT 7 (GRAND FINALE):
=======================
Piloten: Jakob, Niklas, Max, Jürgen
Ergebnis: Jakob(1) = TURNIER-SIEGER
         Max(2), Jürgen(3), Niklas(4) = 2., 3., 4. Platz
```

**Platzierungen:**
1. Jakob 🏆
2. Max
3. Jürgen
4. Niklas
5. Berni
6. Markus
7. Simon
8. Andi
```

---

## 5. Technische Spezifikation

### 5.1 State-Struktur

```typescript
// In tournamentStore.ts
interface TournamentState {
  // ... existing state ...

  // Pool für Winner Bracket
  winnerPool: string[]  // Gewinner für nächsten WB-Heat

  // Pool für Loser Bracket (FIFO - First In, First Out)
  loserPool: string[]   // Verlierer für nächsten LB-Heat

  // Pool für Grand Finale
  grandFinalePool: string[]  // WB-Finale-Gewinner + LB-Finale-Gewinner

  // Eliminierte Piloten
  eliminatedPilots: string[]

  // Status-Flags
  isQualificationComplete: boolean
  isWBFinaleComplete: boolean
  isLBFinaleComplete: boolean
  isGrandFinaleComplete: boolean
}
```

### 5.2 Heat-Logik

#### A) Nach Quali-Heat Abschluss:
```typescript
function onQualiHeatComplete(heatId: string, rankings: Ranking[]) {
  // 1. Gewinner (Platz 1+2) → Winner Pool
  const winners = rankings.filter(r => r.rank <= 2)
  winnerPool.push(...winners.map(r => r.pilotId))

  // 2. Verlierer (Platz 3+4) → Loser Pool
  const losers = rankings.filter(r => r.rank > 2)
  loserPool.push(...losers.map(r => r.pilotId))

  // 3. Prüfen ob alle Quali-Heats fertig
  if (allQualiHeatsComplete()) {
    generateWBHeat()
  }
}
```

#### B) Nach WB-Heat Abschluss:
```typescript
function onWBHeatComplete(heatId: string, rankings: Ranking[]) {
  // 1. Gewinner (Platz 1+2) → Nächster WB-Heat oder WB Finale
  const winners = rankings.filter(r => r.rank <= 2)
  if (winnerPool.length + winners.length <= 2) {
    // WB Finale kann erstellt werden
    generateWBFinale(winners)
  } else {
    // Weiter im Winner Bracket
    winnerPool.push(...winners.map(r => r.pilotId))
    if (winnerPool.length >= 4) {
      generateWBHeat()
    }
  }

  // 2. Verlierer (Platz 3+4) → Loser Pool (FIFO - am Ende anfügen)
  const losers = rankings.filter(r => r.rank > 2)
  loserPool.push(...losers.map(r => r.pilotId))

  // 3. Prüfen ob noch WB-Heats offen sind
  const hasMoreWBHeats = checkForMoreWBHeats()

  // 4. LB Heat generieren wenn genug Piloten
  if (loserPool.length >= 4 && hasMoreWBHeats) {
    generateLBHeat()
  } else if (!hasMoreWBHeats && loserPool.length >= 3) {
    // WB fertig: Sofort LB-Heat erstellen wenn möglich
    generateLBHeat()
  }
}
```

#### C) Nach LB-Heat Abschluss:
```typescript
function onLBHeatComplete(heatId: string, rankings: Ranking[]) {
  // 1. Gewinner (Platz 1+2) → zurück in den Loser Pool
  const winners = rankings.filter(r => r.rank <= 2)
  loserPool.push(...winners.map(r => r.pilotId))

  // 2. Verlierer (Platz 3+4) → ELIMINIERT
  const losers = rankings.filter(r => r.rank > 2)
  eliminatedPilots.push(...losers.map(r => r.pilotId))

  // 3. Prüfen ob weiterer LB Heat generiert werden kann
  if (loserPool.length >= 4 && !isWBFinaleComplete) {
    generateLBHeat()
  }

  // 4. Prüfen ob LB Finale erstellt werden kann
  if (isWBFinaleComplete) {
    checkForLBFinale()
  }
}
```

#### D) Heat-Generierung:
```typescript
function generateWBHeat() {
  const pilotsForHeat = winnerPool.splice(0, 4)

  const newHeat: Heat = {
    id: `wb-heat-${Date.now()}`,
    heatNumber: heats.length + 1,
    pilotIds: pilotsForHeat,
    bracketType: 'winner',
    status: 'pending'
  }

  heats.push(newHeat)
}

function generateLBHeat() {
  // FIFO: Die ersten 4 Piloten aus dem Pool nehmen
  const pilotsForHeat = loserPool.splice(0, 4)

  const newHeat: Heat = {
    id: `lb-heat-${Date.now()}`,
    heatNumber: heats.length + 1,
    pilotIds: pilotsForHeat,
    bracketType: 'loser',
    status: 'pending'
  }

  heats.push(newHeat)
}

function generateWBFinale(winners: Ranking[]) {
  const pilotsForHeat = [
    ...winnerPool.splice(0, 2),
    ...winners.map(r => r.pilotId)
  ].slice(0, 2)

  const newHeat: Heat = {
    id: `wb-finale-${Date.now()}`,
    heatNumber: heats.length + 1,
    pilotIds: pilotsForHeat,
    bracketType: 'winner',
    status: 'pending',
    isFinale: true
  }

  heats.push(newHeat)
}

function generateLBFinale() {
  // Alle verbleibenden Piloten aus dem Pool
  const pilotsForHeat = [...loserPool]
  loserPool = []

  const newHeat: Heat = {
    id: `lb-finale-${Date.now()}`,
    heatNumber: heats.length + 1,
    pilotIds: pilotsForHeat,
    bracketType: 'loser',
    status: 'pending',
    isFinale: true
  }

  heats.push(newHeat)
}

function onLBFinaleComplete(heatId: string, rankings: Ranking[]) {
  // Gewinner (Platz 1-2) → Grand Finale Pool
  const winners = rankings.filter(r => r.rank <= 2)
  grandFinalePool.push(...winners.map(r => r.pilotId))

  // Verlierer (Platz 3-4) → Eliminiert
  const losers = rankings.filter(r => r.rank > 2)
  eliminatedPilots.push(...losers.map(r => r.pilotId))

  // Prüfen ob Grand Finale erstellt werden kann
  checkForGrandFinale()
}

function onWBFinaleComplete(heatId: string, rankings: Ranking[]) {
  // Gewinner (Platz 1) → Grand Finale Pool
  const winner = rankings.find(r => r.rank === 1)
  if (winner) {
    grandFinalePool.push(winner.pilotId)
  }

  // Verlierer (Platz 2) → Loser Pool
  const loser = rankings.find(r => r.rank === 2)
  if (loser) {
    loserPool.push(loser.pilotId)
    // LB Finale erstellen wenn noch Piloten im Pool
    if (loserPool.length >= 2) {
      generateLBFinale()
    }
  }

  // Prüfen ob Grand Finale erstellt werden kann
  checkForGrandFinale()
}

function checkForGrandFinale() {
  // Grand Finale erstellen wenn:
  // 1. WB Finale abgeschlossen UND
  // 2. LB Finale abgeschlossen (oder nicht benötigt) UND
  // 3. Grand Finale Pool hat 2-4 Piloten

  if (isWBFinaleComplete && grandFinalePool.length >= 2) {
    generateGrandFinale()
  }
}

function generateGrandFinale() {
  const newHeat: Heat = {
    id: `grand-finale-${Date.now()}`,
    heatNumber: heats.length + 1,
    pilotIds: [...grandFinalePool],  // Alle Piloten aus dem Pool (2-4 Piloten)
    bracketType: 'grand',
    status: 'pending',
    isFinale: true
  }

  heats.push(newHeat)
}
```

### 5.3 Bracket-Visualisierung

Die Bracket-Visualisierung muss dynamisch aufgebaut werden mit Pool-Anzeigen:

```
┌─────────────────────────────────────────────────────────────┐
│                    QUALIFIKATION                             │
│                                                              │
│   [Heat 1]     [Heat 2]                                     │
│   Status: ✓     Status: ✓                                    │
│                                                              │
│   → Platz 1+2 → WB Pool                                      │
│   → Platz 3+4 → LB Pool                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     WINNER BRACKET                          │
│                                                              │
│   WB POOL: [Jakob, Niklas, Jürgen, Berni]                   │
│                                                              │
│   WB HEAT 3                                                  │
│   ┌─────┐                                                    │
│   │Jakob│                                                    │
│   │Niklas│                                                   │
│   │Jürgen│                                                   │
│   │Berni │                                                   │
│   └─────┘                                                    │
│   Status: Wartet                                             │
│                                                              │
│                              ↓                               │
│                     ┌───────────────┐                        │
│                     │ WB FINALE     │                        │
│                     │ Jakob, Jürgen │                        │
│                     └───────────────┘                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     LOSER BRACKET                            │
│                                                              │
│   LB POOL: [Max, Markus, Simon, Andi]                       │
│            ↑                                                 │
│            First In, First Out!                              │
│                                                              │
│   LB HEAT 4                                                  │
│   ┌─────┐                                                    │
│   │Max  │ ← Nächste 4 aus Pool                             │
│   │Markus│                                                   │
│   │Simon │                                                   │
│   │Andi  │                                                   │
│   └─────┘                                                    │
│   Status: Wartet                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    GRAND FINALE                             │
│                                                              │
│   GF POOL: [Jakob, Niklas, Max, Jürgen]                      │
│            (WB Finale Winner + LB Finale Winner)            │
│                                                              │
│   GRAND FINALE                                               │
│   ┌─────┐                                                    │
│   │Jakob│                                                    │
│   │Niklas│                                                   │
│   │Max  │                                                    │
│   │Jürgen│                                                   │
│   └─────┘                                                    │
│   Status: Wartet                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Zu löschende Dateien

| Datei | Grund |
|-------|-------|
| `src/lib/bracket-structure-generator.ts` | Vorberechnete Struktur nicht mehr benötigt |
| `src/lib/bracket-calculator.ts` | Wird durch dynamische Logik ersetzt |

### 5.5 Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | Pool-State, dynamische Heat-Generierung |
| `src/lib/bracket-logic.ts` | Komplett neu: Dynamische Bracket-Logik |
| `src/components/bracket-tree.tsx` | Dynamische Bracket-Visualisierung |
| `src/components/heat-assignment-view.tsx` | Pool-Anzeige integrieren |
| `tests/bracket-*.test.ts` | Alle Tests anpassen/löschen |

### 5.6 Neu zu erstellende Dateien

| Datei | Beschreibung |
|-------|--------------|
| `src/lib/dynamic-bracket.ts` | Dynamische Bracket-Logik (WB + LB) |
| `src/lib/heat-generator.ts` | Heat-Generierung basierend auf Pools |

---

## 6. Implementation Plan

### Phase 1: Vorbereitung (0.5 Tage)
1. Alle bestehenden Bracket-Tests löschen oder kommentieren
2. `bracket-structure-generator.ts` und `bracket-calculator.ts` deaktivieren
3. Neue Dateistruktur erstellen

### Phase 2: Store-Änderungen (0.5 Tage)
1. Pool-State hinzufügen (`winnerPool`, `loserPool`, `eliminatedPilots`)
2. Status-Flags hinzufügen
3. Actions definieren: `addToWinnerPool`, `addToLoserPool`, `eliminatePilot`

### Phase 3: Dynamische Bracket-Logik (1.5 Tage)
1. Quali-Heat Abschluss-Logik implementieren
2. WB-Heat Generierung implementieren
3. WB-Heat Abschluss-Logik implementieren
4. LB-Heat Generierung implementieren
5. LB-Heat Abschluss-Logik implementieren
6. Finale-Generierung implementieren

### Phase 4: UI-Anpassungen (1 Tag)
1. Bracket-Visualisierung auf dynamisches System umstellen
2. Pool-Anzeige im Bracket integrieren
3. Heat-Statusanzeigen anpassen

### Phase 5: Tests (1 Tag)
1. Unit-Tests für alle neuen Funktionen
2. Integrationstests für kompletten Turnier-Ablauf
3. Edge Cases testen (kleine Pilotenanzahlen)

### Phase 6: Validation (0.5 Tage)
1. Manual Testing mit verschiedenen Pilotenanzahlen
2. Visual Validation der Bracket-Visualisierung
3. Bug Fixes

**Gesamtaufwand:** ~5 Tage

---

## 7. Risk Assessment

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|--------|-------------------|------------|------------|
| Breaking Changes in Tests | Hoch | Alle Tests müssen neu geschrieben werden | Early test deletion, incremental testing |
| UI-Probleme bei dynamischer Visualisierung | Mittel | Bracket sieht verwirrend aus | Schrittweise UI-Updates, iterative Validierung |
| Edge Cases bei kleinen Pilotenanzahlen | Mittel | Turnier-Flow bricht ab | Systematische Edge-Case-Tests |
| Datenmigration | Niedrig | Alte Daten passen nicht | Kompletter Reset beim Turnier-Start |
| Performance bei vielen Piloten | Niedrig | System wird langsam | Lazy Rendering der Bracket-Visualisierung |

---

## 8. Success Criteria

1. ✅ **Keine vorberechneten Strukturen:** Alle Heats werden dynamisch erstellt
2. ✅ **WB ist dynamisch:** Winner Bracket folgt dem gleichen Flow wie LB
3. ✅ **Heats sind immer spielbar:** Jeder Heat hat 2-4 Piloten, keine leeren Heats
4. ✅ **Visualisierung stimmt:** Bracket-Baum zeigt tatsächlich existierende Heats
5. ✅ **Alle Tests grün:** Neue Tests decken alle Szenarien ab
6. ✅ **Turnier-Flow komplett:** Von Quali bis Grand Finale funktioniert alles
7. ✅ **Konsistente IDs:** Alle Heats haben einheitliche ID-Struktur
8. ✅ **FIFO im Loser Bracket:** Piloten werden in der Reihenfolge des Verlierens wieder eingesetzt
9. ✅ **Warten auf Verlierer wenn noch WB aktiv:** Pool wird erst geleert wenn 4 Piloten da sind
10. ✅ **Grand Finale idealerweise 4er Heat:** WB Finale (2) + LB Finale (2) = Grand Finale (4)

---

## 9. Backwards Compatibility

**Breaking Changes:**

- Alle Bracket-Tests müssen gelöscht oder komplett neu geschrieben werden
- Vorhandene Turniere können nicht migriert werden (User muss neu starten)
- Bracket-Struktur-Generator wird komplett entfernt

---

## 10. Next Steps

1. [x] Change Proposal erstellt
2. [ ] Review durch Development Team
3. [ ] Entscheidung finalisieren (Jakob)
4. [ ] User Stories aktualisieren (Epic 4, Epic 9)
5. [ ] Implementation starten (Phase 1)

### 10.1 Offene Fragen

| Frage | Entscheidung |
|-------|--------------|
| Wie wird mit bestehenden Turnieren umgegangen? | → Reset erforderlich, kein Migration-Weg |
| Wie wird der Pool visualisiert? | → Integriert in Bracket-Visualisierung mit FIFO-Anzeige |
| Wie wird WB-Finale erkannt? | → Wenn WB Pool + Gewinner <= 2 Piloten |
| Wie wird LB-Finale erkannt? | → Nach WB-Finale, wenn Pool noch Piloten hat |
| Grand Finale - 2er oder 4er Heat? | → 4er Heat (ideal), 2-3er Heat (worst case) |
| Pool-Auswahl im LB: Zufällig oder FIFO? | → FIFO (First In, First Out) |
| Warten auf Verlierer wenn noch WB aktiv? | → Ja, warten bis 4 Piloten im Pool |

---

## 11. Zusammenfassung

Diese Course Correction ersetzt das hybride Bracket-System durch ein vollständig dynamisches System. Alle Heats werden on-the-fly basierend auf Ergebnissen erstellt. Das Winner Bracket folgt dem gleichen Flow wie das Loser Bracket. Keine vorberechneten Strukturen mehr.

**Wichtige Änderungen gegenüber dem Loser Bracket Pooling Proposal:**

1. **Keine Zufälligkeit:** FIFO (First In, First Out) statt zufälliger Auswahl im Loser Bracket
2. **Warten auf Verlierer:** Wenn noch WB-Heats offen sind, wird gewartet bis 4 Piloten im Pool sind
3. **4er Grand Finale:** Ideal WB Finale (2) + LB Finale (2) = Grand Finale (4), nicht nur 2er
4. **LB reduziert nur bis 2:** Nicht bis 1 Pilot, sondern bis 2 Piloten für das Grand Finale

**Vorteile:**

- **Flexibilität:** Funktioniert mit jeder Pilotenanzahl
- **Einfachheit:** Eine Logik für beide Brackets
- **Fairness:** Jeder Heat ist spielbar (2-4 Piloten)
- **Fairer Turnier-Verlauf:** FIFO sorgt dafür, dass Piloten nicht unnötig lange warten
- **Konsistenz:** UI und Datenstruktur sind synchron

---

*Dieses Course Correction Dokument beschreibt den Übergang von einem vorbrechneten zu einem vollständig dynamischen Bracket-System.*

---

## 12. Verwandte Dokumente

- **Change Proposal - Loser Bracket Pooling (2025-12-23):** Ursprüngliches Proposal für LB Pooling mit zufälliger Auswahl
- **Diese Course Correction:** Erweitert das Konzept auf das komplette Bracket-System und korrigiert FIFO-Logik

**Hinweis:** Das Loser Bracket Pooling Proposal sollte nach Implementation dieser Course Correction als "Superseded" markiert werden.
