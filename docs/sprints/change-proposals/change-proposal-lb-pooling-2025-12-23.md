# Change Proposal: Loser Bracket Pooling

**Datum:** 2025-12-23
**Autor:** Jakob (Product Owner)
**Status:** Superseded
**Superseded by:** [Course Correction: Dynamic Brackets 2025-12-23](./course-correction-dynamic-brackets-2025-12-23.md)
**Severity:** Critical - Blocking Tournament Functionality
**Betrifft:** Loser Bracket Logik

---

> **🔄 SUPERSEDED BY COURSE CORRECTION 2025-12-23**
>
> Dieses Change Proposal wurde durch die Course Correction "Dynamic Brackets 2025-12-23" überschrieben.
>
> **Änderungen durch Course Correction:**
> - **FIFO statt Random:** Piloten werden in der Reihenfolge des Verlierens wieder eingesetzt (keine zufällige Auswahl)
> - **Warten auf Verlierer wenn noch WB aktiv:** Pool wird erst geleert wenn noch WB-Heats laufen
> - **4er Grand Finale statt 2er:** WB Finale (2) + LB Finale (2) = Grand Finale (4)
> - **LB reduziert nur bis 2 Piloten:** Nicht bis 1 Pilot, sondern bis 2 Piloten für das Grand Finale
>
> **Bitte:** Implementierung basierend auf der Course Correction "Dynamic Brackets 2025-12-23" durchführen.

---

## 1. Problem Statement

### 1.1 Aktuelles Verhalten (fehlerhaft)

Die aktuelle Bracket-Struktur generiert LB-Heats vorab basierend auf einer mathematischen Struktur, die für 1v1-Matches konzipiert ist. Bei 4er-Heats führt das zu:

- **LB-Heats mit nur 1-2 Piloten** (nicht spielbar)
- **Leere LB-Heats** die nie Piloten bekommen
- **Komplexe Verlinkungen** die nicht zur Realität passen

### 1.2 Beispiel: 9 Piloten Turnier

```
AKTUELL (fehlerhaft):
=====================
Quali Heat 1: 3 Piloten → 2 Winner, 1 Loser
Quali Heat 2: 3 Piloten → 2 Winner, 1 Loser  
Quali Heat 3: 3 Piloten → 2 Winner, 1 Loser

LB Heat 8: 2 Piloten (aus Quali 1+2)  ← Nur 2 Piloten!
LB Heat 9: 1 Pilot (aus Quali 3)      ← Nur 1 Pilot! Nicht spielbar!
LB Heat 10-15: Leer oder mit 0-2 Piloten
```

### 1.3 Screenshot-Analyse

Im getesteten Turnier mit 9 Piloten:
- LB Runde 1, Heat 9: Nur 1 Pilot (Julia Hoffmann) - Status "empty"
- LB Runde 2, Heat 11: Komplett leer (0 Piloten)
- LB Runde 3, Heat 13: Komplett leer

**Ein Heat mit weniger als 3 Piloten ist kein sinnvolles Rennen.**

---

## 2. Gewünschtes Verhalten

### 2.1 Kernprinzip: Pooling

> **"Verlierer werden in einem Pool gesammelt, bis genug für einen Heat vorhanden sind (3-4 Piloten)."**

### 2.2 Ablauf im Detail

```
GEWÜNSCHT (Pooling):
====================

1. WINNER BRACKET läuft normal:
   - Quali → WB Runde 1 → WB Runde 2 → ... → WB Finale
   - Gewinner (Platz 1+2) kommen weiter
   - Verlierer (Platz 3+4) gehen in den LOSER POOL

2. LOSER POOL:
   - Sammelt alle Verlierer aus dem Winner Bracket
   - Sobald 3-4 Piloten im Pool sind → LB Heat wird erstellt
   - Pool wird geleert, Heat wird gespielt

3. LOSER BRACKET HEAT:
   - 3-4 Piloten fliegen gegeneinander
   - Gewinner (Platz 1+2) → zurück in den LOSER POOL
   - Verlierer (Platz 3+4) → ELIMINIERT (raus aus Turnier)

4. WIEDERHOLUNG:
   - Solange noch WB-Heats laufen ODER Pool >= 3 Piloten hat
   - Pool wird immer wieder aufgefüllt und geleert

5. LB FINALE:
   - Wenn WB Finale abgeschlossen UND Pool hat letzte Piloten
   - Letzter LB Heat bestimmt den LB-Finalisten
   - LB-Finalist geht ins Grand Finale
```

### 2.3 Beispiel: 9 Piloten Turnier (korrigiert)

```
QUALI (3 Heats):
================
Heat 1: Max, Michael, Lisa → Max(1), Michael(2) → WB | Lisa(3) → Pool
Heat 2: Thomas, David, Lukas → Thomas(1), David(2) → WB | Lukas(3) → Pool
Heat 3: Sarah, Anna, Julia → Sarah(1), Anna(2) → WB | Julia(3) → Pool

Pool nach Quali: [Lisa, Lukas, Julia] = 3 Piloten ✓

WB RUNDE 1 (2 Heats):
=====================
WB Heat 4: Max, Michael, Thomas, David → Max(1), Michael(2) → WB | Thomas(3), David(4) → Pool
WB Heat 5: Sarah, Anna → Sarah(1), Anna(2) → WB

Pool nach WB R1: [Lisa, Lukas, Julia, Thomas, David] = 5 Piloten

LB HEAT 1 (aus Pool):
=====================
LB Heat 6: Lisa, Lukas, Julia, Thomas → Lisa(1), Lukas(2) → Pool | Julia(3), Thomas(4) → ELIMINIERT

Pool nach LB Heat 1: [David, Lisa, Lukas] = 3 Piloten

WB SEMIFINALE:
==============
WB Heat 7: Max, Michael, Sarah, Anna → Max(1), Sarah(2) → WB | Michael(3), Anna(4) → Pool

Pool: [David, Lisa, Lukas, Michael, Anna] = 5 Piloten

LB HEAT 2 (aus Pool):
=====================
LB Heat 8: David, Lisa, Lukas, Michael → David(1), Lisa(2) → Pool | Lukas(3), Michael(4) → ELIMINIERT

Pool: [Anna, David, Lisa] = 3 Piloten

WB FINALE:
==========
WB Heat 9: Max, Sarah → Max(1) → Grand Finale | Sarah(2) → Pool

Pool: [Anna, David, Lisa, Sarah] = 4 Piloten

LB FINALE:
==========
LB Heat 10: Anna, David, Lisa, Sarah → Anna(1), David(2) → "LB Finale" 
            → Anna(1) → Grand Finale | David(2), Lisa(3), Sarah(4) → ELIMINIERT

GRAND FINALE:
=============
Heat 11: Max (WB Winner), Anna (LB Winner) → TURNIER GEWINNER
```

---

## 3. Technische Spezifikation

### 3.1 Neue State-Variablen

```typescript
// In tournamentStore.ts
interface TournamentState {
  // ... existing state ...
  
  // NEU: Loser Pool
  loserPool: string[]  // Pilot IDs die auf LB-Heat warten
  
  // NEU: Eliminierte Piloten (endgültig raus)
  eliminatedPilots: string[]
}
```

### 3.2 Geänderte Logik

#### A) Nach jedem WB-Heat Abschluss:
```typescript
function onWBHeatComplete(heatId: string, rankings: Ranking[]) {
  // 1. Gewinner (Platz 1+2) → nächster WB Heat
  const winners = rankings.filter(r => r.rank <= 2)
  assignToNextWBHeat(winners)
  
  // 2. Verlierer (Platz 3+4) → Loser Pool
  const losers = rankings.filter(r => r.rank > 2)
  addToLoserPool(losers)
  
  // 3. Prüfen ob LB Heat generiert werden kann
  if (loserPool.length >= 3) {
    generateLBHeat()
  }
}
```

#### B) Nach jedem LB-Heat Abschluss:
```typescript
function onLBHeatComplete(heatId: string, rankings: Ranking[]) {
  // 1. Gewinner (Platz 1+2) → zurück in den Pool
  const winners = rankings.filter(r => r.rank <= 2)
  addToLoserPool(winners)
  
  // 2. Verlierer (Platz 3+4) → ELIMINIERT
  const losers = rankings.filter(r => r.rank > 2)
  eliminatePilots(losers)
  
  // 3. Prüfen ob weiterer LB Heat generiert werden kann
  if (loserPool.length >= 3) {
    generateLBHeat()
  }
}
```

#### C) LB Heat Generierung:
```typescript
function generateLBHeat() {
  // Nimm max 4 Piloten aus dem Pool
  const pilotsForHeat = loserPool.splice(0, 4)
  
  const newHeat: Heat = {
    id: generateId(),
    heatNumber: heats.length + 1,
    pilotIds: pilotsForHeat,
    bracketType: 'loser',
    status: 'pending'
  }
  
  heats.push(newHeat)
}
```

#### D) LB Finale Erkennung:
```typescript
function checkForLBFinale() {
  // LB Finale wenn:
  // 1. WB Finale ist abgeschlossen
  // 2. Pool hat noch Piloten (2-4)
  // 3. Kein weiterer LB Heat läuft
  
  if (isWBFinaleComplete() && loserPool.length >= 2 && loserPool.length <= 4) {
    generateLBFinaleHeat()
  }
}
```

### 3.3 Bracket Visualisierung

Die Bracket-Visualisierung muss angepasst werden:

**Winner Bracket:** Bleibt wie bisher (strukturiert, vorberechnet)

**Loser Bracket:** 
- Zeigt den aktuellen Pool an
- LB-Heats werden dynamisch hinzugefügt wenn sie erstellt werden
- Keine vorberechnete Struktur mehr

```
┌─────────────────┐
│   LOSER POOL    │
│                 │
│  [Lisa]         │
│  [Lukas]        │
│  [Thomas]       │
│  [David]        │
│                 │
│  → 4 Piloten    │
│  → Heat bereit! │
└─────────────────┘
       ↓
┌─────────────────┐
│   LB HEAT 6     │
│                 │
│  Lisa vs Lukas  │
│  vs Thomas vs   │
│  David          │
└─────────────────┘
```

### 3.4 Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | `loserPool` State, Pool-Logik |
| `src/lib/bracket-logic.ts` | LB Heat Generierung dynamisch |
| `src/lib/bracket-structure-generator.ts` | LB Struktur entfernen/vereinfachen |
| `src/components/bracket-tree.tsx` | Pool-Anzeige, dynamische LB-Heats |
| `tests/bracket-*.test.ts` | Tests anpassen |

---

## 4. Acceptance Criteria

### AC1: Pool wird gefüllt
**Given** ein WB-Heat wird abgeschlossen  
**When** die Rankings eingegeben werden  
**Then** landen Platz 3+4 im Loser Pool

### AC2: LB Heat wird generiert (während WB aktiv)
**Given** das WB hat noch ausstehende Heats  
**And** der Loser Pool hat 4 oder mehr Piloten  
**When** ein Heat abgeschlossen wird  
**Then** wird ein neuer LB-Heat mit 4 zufällig ausgewählten Piloten erstellt

### AC3: Zufällige Pool-Auswahl
**Given** der Pool hat mehr als 4 Piloten  
**When** ein LB-Heat erstellt wird  
**Then** werden 4 Piloten **zufällig** aus dem Pool ausgewählt  
**And** die Auswahl sorgt für Abwechslung (nicht immer dieselben Gegner)

### AC4: LB Gewinner bleiben im Pool
**Given** ein LB-Heat wird abgeschlossen  
**When** die Rankings eingegeben werden  
**Then** gehen Platz 1+2 zurück in den Pool  
**And** Platz 3+4 werden eliminiert

### AC5: Eliminierte sind raus
**Given** ein Pilot wurde im LB eliminiert (2x verloren)  
**When** das Turnier weiterläuft  
**Then** erscheint der Pilot in keinem weiteren Heat  
**And** der Pilot wird als "eliminiert" markiert

### AC6: LB Finale (3-4 Piloten)
**Given** WB Finale ist abgeschlossen  
**And** Loser Pool hat 3-4 Piloten  
**When** LB-Finale generiert wird  
**Then** enthält es alle verbleibenden Pool-Piloten  
**And** Platz 1 geht ins Grand Finale

### AC7: Duell-Heat (2 Piloten)
**Given** WB Finale ist abgeschlossen  
**And** Loser Pool hat genau 2 Piloten  
**When** LB-Finale generiert wird  
**Then** fliegen diese 2 Piloten ein Duell  
**And** der Gewinner geht ins Grand Finale

### AC8: Wildcard (1-2 Piloten warten)
**Given** der Pool hat nur 1-2 Piloten  
**And** noch LB-Heats laufen  
**When** der nächste LB-Heat Gewinner produziert  
**Then** werden die wartenden Piloten mit den Gewinnern gemischt  
**And** der nächste LB-Heat hat dann 3-4 Piloten

### AC9: Grand Finale
**Given** WB Finale und LB Finale sind abgeschlossen  
**When** Grand Finale generiert wird  
**Then** enthält es genau 2 Piloten: WB-Winner und LB-Winner (oder Wildcard)

### AC10: Pool-Visualisierung im LB
**Given** der Loser Pool enthält Piloten  
**When** die Bracket-Ansicht angezeigt wird  
**Then** werden die Pool-Piloten im Loser Bracket angezeigt  
**And** der nächste LB-Heat wird schrittweise aufgefüllt

### AC11: Keine leeren/zu kleinen LB-Heats während WB
**Given** das WB hat noch ausstehende Heats  
**When** LB-Heats angezeigt werden  
**Then** hat jeder spielbereite LB-Heat genau 4 Piloten

---

## 5. Nicht im Scope

Folgende Features aus dem MultiGP-Proposal werden **NICHT** implementiert:

- ❌ Re-Seeding nach Runden
- ❌ Chase the Ace Finale
- ❌ Motocross-Punktesystem
- ❌ Komplexe Seeding-Tabellen
- ❌ Phase-basierte Turnier-Struktur

---

## 6. Vorteile dieser Lösung

| Vorteil | Beschreibung |
|---------|--------------|
| **Einfach** | Keine komplexe Bracket-Mathematik |
| **Flexibel** | Funktioniert mit jeder Pilotenanzahl |
| **Fair** | Jeder Heat hat 3-4 Piloten |
| **Verständlich** | Piloten sehen: "Ich bin im Pool, warte auf meinen Heat" |
| **Minimal invasiv** | WB bleibt unverändert, nur LB wird angepasst |

---

## 7. Aufwandsschätzung

| Komponente | Story Points | Zeit |
|------------|--------------|------|
| Pool State & Logik | 3 | 0.5 Tage |
| LB Heat Generierung | 5 | 1 Tag |
| Bracket-Visualisierung | 5 | 1 Tag |
| Tests anpassen | 3 | 0.5 Tage |
| **Gesamt** | **16** | **3 Tage** |

---

## 8. Entschiedene Fragen

### 8.1 Pool-Reihenfolge: ZUFÄLLIG
> **Entscheidung:** Piloten werden **zufällig** aus dem Pool für den nächsten Heat ausgewählt.

**Begründung:** Sorgt für Abwechslung und verhindert, dass dieselben Piloten immer wieder gegeneinander fliegen. Wichtig ist, dass alle Piloten regelmäßig dran kommen.

### 8.2 Heat-Größe: DYNAMISCH (4 während WB, flexibel danach)
> **Entscheidung:** 
> - **Solange WB noch Heats hat:** Warten bis 4 Piloten im Pool sind
> - **Nach WB-Finale:** Heat mit verbleibenden Piloten erstellen (auch 2-3)

**Begründung:** Während das WB läuft, kommen noch Verlierer nach – also auf volle Heats warten. Nach dem WB-Finale muss der Pool "geleert" werden.

### 8.3 Pool-Anzeige: IM LOSER BRACKET INTEGRIERT
> **Entscheidung:** Der Pool wird **direkt im Loser Bracket** angezeigt. Neue Verlierer aus dem WB werden im LB sichtbar und füllen den nächsten Heat schrittweise auf.

**Visualisierung:**
```
LOSER BRACKET
─────────────────────────────────────────────────────
│ LB Heat 6          │ LB Heat 7          │ LB Finale │
│ [Lisa]      ✓      │ [noch leer]        │           │
│ [Thomas]    ✓      │   ↑                │           │
│ [Lukas]     ✓      │   │                │           │
│ [David]     ✓      │   │                │           │
│ Status: BEREIT     │   │                │           │
│                    │   Pool: [Anna]     │           │
│                    │   (wartet auf 3)   │           │
─────────────────────────────────────────────────────
```

---

## 9. Edge Case: Wenige Piloten im Pool (Wildcard-Regel)

### 9.1 Problem
Bei bestimmten Pilotenanzahlen kann es passieren, dass **nur 1-2 Piloten** im Pool übrig bleiben, während noch LB-Heats laufen oder das WB bereits abgeschlossen ist.

**Beispiel:** 7 Piloten Turnier
```
Nach LB Heat X: Pool hat 1 Pilot (z.B. Anna)
Nächster LB-Heat steht an mit 2 Piloten aus vorherigem LB-Heat
Anna kann nicht alleine fliegen!
```

### 9.2 Lösung: Wildcard ins nächste Heat

> **Regel:** Wenn der Pool nur 1-2 Piloten hat und ein LB-Heat ansteht, werden diese Piloten **zum nächsten LB-Heat dazugemischt**.

**Ablauf:**
1. Pool hat 1-2 Piloten
2. Ein LB-Heat wird vorbereitet (z.B. mit 2 Gewinnern aus vorherigem LB-Heat)
3. Die Pool-Piloten werden diesem Heat hinzugefügt
4. Heat hat dann 3-4 Piloten → kann normal gespielt werden

**Beispiel:**
```
LB Heat 6 abgeschlossen:
  → Gewinner: Lisa, Thomas → Pool
  → Verlierer: Anna, David → ELIMINIERT

Pool: [Lisa, Thomas] = 2 Piloten

LB Heat 7 vorbereitet mit Pool-Piloten:
  → [Lisa, Thomas] 

Aber Pool hat nur 2! Was nun?

→ Warte auf nächste WB-Verlierer ODER
→ Wenn WB fertig: Das IST das LB-Finale (2er-Duell)
```

### 9.3 Entschiedene Regel

| Situation | Aktion |
|-----------|--------|
| Pool < 4, WB noch aktiv | Warten auf weitere WB-Verlierer |
| Pool = 1-2, WB fertig, noch LB-Heat aktiv | Pilot(en) zum laufenden LB-Heat dazumischen |
| Pool = 1-2, WB fertig, kein LB-Heat mehr | LB-Finale mit 2 Piloten (Duell) oder 1 Pilot gewinnt automatisch |
| Pool = 3-4, WB fertig | Normales LB-Finale |

### 9.4 Praktisches Beispiel: Wildcard-Mischen

```
Situation:
- WB-Finale abgeschlossen
- Pool hat 1 Pilot (Max)
- LB Heat 8 läuft gerade mit [Lisa, Thomas, Anna, David]

LB Heat 8 wird abgeschlossen:
  → Gewinner: Lisa, Thomas → Pool
  → Verlierer: Anna, David → ELIMINIERT

Pool JETZT: [Max, Lisa, Thomas] = 3 Piloten

→ LB-Finale mit 3 Piloten: Max vs Lisa vs Thomas
→ Platz 1 (z.B. Lisa) → Grand Finale
```

**Der einzelne Pilot wird also NICHT übersprungen, sondern wartet bis genug andere Piloten dazukommen (durch LB-Heat Gewinner).**

---

## 10. Nächste Schritte

1. [x] Change Proposal erstellen
2. [x] Entscheidung zu offenen Fragen (Jakob, 2025-12-23)
3. [x] Review & Freigabe durch Jakob
4. [x] User Stories erstellen (Epic 9: US-9.1, US-9.2, US-9.3)
5. [ ] Implementierung starten

### 10.1 Zusätzliche Entscheidung: Heat-Scheduling (2025-12-23)

> **Entscheidung:** Automatische Abwechslung zwischen WB und LB Heats

**Regel:** Wenn beide Brackets spielbereite Heats haben, wird automatisch das andere Bracket priorisiert:
- Nach WB-Heat → LB-Heat empfohlen
- Nach LB-Heat → WB-Heat empfohlen
- Organisator kann jederzeit manuell anderen Heat wählen

**Begründung:** Faire Verteilung der Wartezeit, Piloten warten nicht zu lange im Pool.

---

## 11. Zusammenfassung der Regeln

### LB-Heat Erstellung:
```
WENN WB noch aktiv:
  → Warte bis Pool >= 4 Piloten
  → Erstelle Heat mit 4 zufälligen Piloten aus Pool

WENN WB-Finale abgeschlossen:
  → Pool >= 3: Erstelle LB-Finale mit allen Pool-Piloten (3-4)
  → Pool == 2: Erstelle Duell-Heat (2 Piloten)
  → Pool == 1: Warte auf LB-Heat Gewinner, dann zusammenmischen
```

### Nach LB-Heat:
```
Platz 1+2 → zurück in Pool (zufällig gemischt)
Platz 3+4 → ELIMINIERT (raus aus Turnier)
```

### Grand Finale:
```
WB-Winner (Platz 1 aus WB-Finale)
  +
LB-Winner (Platz 1 aus LB-Finale ODER Wildcard)
  =
Grand Finale (2 Piloten)
```

### Heat-Scheduling (Abwechslung):
```
Nach WB-Heat → Empfehle LB-Heat (falls verfügbar)
Nach LB-Heat → Empfehle WB-Heat (falls verfügbar)
Organisator kann manuell übersteuern
```

---

*Dieses Proposal beschreibt eine einfache, pragmatische Lösung für das Loser Bracket Problem, ohne die Komplexität des vollen MultiGP-Formats einzuführen.*
