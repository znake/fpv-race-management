# Implementation Handoff: Dynamisches Bracket-System

**Datum:** 2025-12-23
**Autor:** Jakob (Product Owner)
**Status:** Ready for Development
**Source:** [Course Correction: Dynamic Brackets 2025-12-23](./course-correction-dynamic-brackets-2025-12-23.md)

---

## 🎯 Zusammenfassung

Das Bracket-System wird von einem vorbrechneten System zu einem **vollständig dynamischen System** überarbeitet. Keine vorbrechneten Strukturen mehr. Alle Heats werden on-the-fly basierend auf Ergebnissen erstellt.

**Wichtigste Änderungen:**

1. **Keine vorbrechneten Strukturen mehr** - `bracket-structure-generator.ts` wird entfernt
2. **FIFO statt Random** - Wer zuerst verliert, fliegt zuerst wieder
3. **Warten auf Verlierer wenn noch WB aktiv** - Pool wird erst geleert wenn 4 Piloten da sind
4. **4er Grand Finale statt 2er** - WB Finale (2) + LB Finale (2) = Grand Finale (4)
5. **LB reduziert nur bis 2 Piloten** - Nicht bis 1 Pilot

**Betroffene Epics:**
- Epic 4: Heat-Durchführung & Bracket (Stories 4-2, 4-3)
- Epic 9: Loser Bracket Pooling (Stories 9-1, 9-2, 9-3)

---

## 📋 Developer Instructions

### Epic 4 - Story 4.2: Heat abschliessen & Dynamische Bracket-Progression

#### Aufgabe 1: Store Erweiterung für Dynamisches Bracket

Füge folgende neue State-Variablen zu `tournamentStore.ts` hinzu:

```typescript
interface TournamentState {
  // ... existing state ...

  // NEU: Pools für dynamisches Bracket
  winnerPool: string[]       // Gewinner für nächsten WB-Heat (FIFO)
  loserPool: string[]        // Verlierer für nächsten LB-Heat (FIFO)
  grandFinalePool: string[]  // WB-Finale-Gewinner + LB-Finale-Gewinner

  // NEU: Eliminierte Piloten
  eliminatedPilots: string[]

  // NEU: Status-Flags
  isQualificationComplete: boolean
  isWBFinaleComplete: boolean
  isLBFinaleComplete: boolean
  isGrandFinaleComplete: boolean
}
```

#### Aufgabe 2: Pool Actions implementieren

```typescript
// FIFO: Piloten am Ende der Liste anfügen
addToWinnerPool: (pilotIds: string[]) => void
addToLoserPool: (pilotIds: string[]) => void

// FIFO: Die ersten N Piloten aus dem Pool nehmen
removeFromWinnerPool: (count: number) => void
removeFromLoserPool: (count: number) => void

// Piloten eliminieren (2. Niederlage im LB)
eliminatePilots: (pilotIds: string[]) => void
```

#### Aufgabe 3: Dynamische WB-Heat Generierung

```typescript
function generateWBHeat() {
  // FIFO: Die ersten 4 Piloten aus dem WB Pool nehmen
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
```

#### Aufgabe 4: Warten-Logik implementieren

```typescript
function checkForMoreWBHeats(): boolean {
  return heats.some(h =>
    h.bracketType === 'winner' &&
    (h.status === 'pending' || h.status === 'active')
  )
}

// LB Heat generieren nur wenn genug Piloten
if (loserPool.length >= 4 && checkForMoreWBHeats()) {
  generateLBHeat()
}
```

---

### Epic 4 - Story 4.3: Dynamische Bracket-Visualisierung mit Pools

#### Aufgabe 1: Pool-Visualisierung

Erstelle eine `PoolDisplay` Komponente, die die Pool-Piloten anzeigt:

```tsx
interface PoolDisplayProps {
  pilotIds: string[]     // IDs der Piloten im Pool
  poolName: string      // "WB Pool" oder "LB Pool"
  maxPilots: number    // 4 (für WB und LB)
  pilots: Pilot[]      // Alle Piloten für Foto/Namen
}

const PoolDisplay: React.FC<PoolDisplayProps> = ({
  pilotIds,
  poolName,
  maxPilots,
  pilots
}) => {
  const poolPilots = pilotIds
    .map(id => pilots.find(p => p.id === id))
    .filter(Boolean)

  const status = pilotIds.length >= maxPilots
    ? `${poolName} bereit! ✓`
    : `Warte auf Piloten... (${pilotIds.length}/${maxPilots})`

  return (
    <div className="pool-display">
      <h3>{poolName}</h3>
      <div className="pool-pilots">
        {poolPilots.map(pilot => (
          <div key={pilot.id} className="pool-pilot">
            <img src={pilot.image || FALLBACK_PILOT_IMAGE} alt={pilot.name} />
            <span>{pilot.name}</span>
          </div>
        ))}
      </div>
      <div className={`pool-status ${pilotIds.length >= maxPilots ? 'ready' : 'waiting'}`}>
        {status}
      </div>
    </div>
  )
}
```

#### Aufgabe 2: Bracket-Layout ohne vorbrechnete Struktur

```tsx
// BracketTree Komponente
const BracketTree: React.FC = () => {
  const { heats, winnerPool, loserPool, grandFinalePool, pilots } = useTournamentStore()

  const qualificationHeats = heats.filter(h => h.bracketType === 'qualification')
  const winnerHeats = heats.filter(h => h.bracketType === 'winner')
  const loserHeats = heats.filter(h => h.bracketType === 'loser')
  const grandFinale = heats.find(h => h.bracketType === 'grand')

  return (
    <div className="bracket-tree">
      {/* Qualifikation */}
      <section className="qualification-section">
        <h2>QUALIFIKATION</h2>
        {qualificationHeats.map(heat => (
          <HeatBox key={heat.id} heat={heat} pilots={pilots} />
        ))}
      </section>

      {/* Winner Bracket mit Pool */}
      <section className="winner-section">
        <h2>WINNER BRACKET</h2>
        {winnerPool.length > 0 && (
          <PoolDisplay
            pilotIds={winnerPool}
            poolName="WB Pool"
            maxPilots={4}
            pilots={pilots}
          />
        )}
        <div className="winner-heats">
          {winnerHeats.map(heat => (
            <HeatBox key={heat.id} heat={heat} pilots={pilots} />
          ))}
        </div>
      </section>

      {/* Loser Bracket mit Pool */}
      <section className="loser-section">
        <h2>LOSER BRACKET</h2>
        {loserPool.length > 0 && (
          <PoolDisplay
            pilotIds={loserPool}
            poolName="LB Pool"
            maxPilots={4}
            pilots={pilots}
          />
        )}
        <div className="loser-heats">
          {loserHeats.map(heat => (
            <HeatBox key={heat.id} heat={heat} pilots={pilots} />
          ))}
        </div>
      </section>

      {/* Grand Finale */}
      {grandFinale && (
        <section className="grand-finale-section">
          <h2>GRAND FINALE</h2>
          <HeatBox heat={grandFinale} pilots={pilots} />
        </section>
      )}
    </div>
  )
}
```

---

### Epic 9 - Story 9.1: Loser Pool State & FIFO Logik

#### Aufgabe 1: FIFO statt Random implementieren

```typescript
// FIFO: Am Ende der Liste anfügen
function addToLoserPool(pilotIds: string[]) {
  loserPool.push(...pilotIds)
  // Result: [...loserPool, ...newPilots]
}

// FIFO: Die ersten N Piloten aus dem Pool nehmen
function removeFromLoserPool(count: number) {
  return loserPool.splice(0, count)
  // Result: Entfernt die ersten N, der Rest bleibt
}
```

**WICHTIG:** Keine zufällige Auswahl! Piloten werden in der Reihenfolge des Verlierens wieder eingesetzt.

---

### Epic 9 - Story 9.2: Dynamische LB-Heat Generierung (FIFO)

#### Aufgabe 1: Warten auf Verlierer wenn noch WB aktiv

```typescript
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

// Nach WB-Heat Abschluss
function onWBHeatComplete(heatId: string, rankings: Ranking[]) {
  // Gewinner (Platz 1+2) → WB Pool
  const winners = rankings.filter(r => r.rank <= 2)
  addToWinnerPool(winners.map(r => r.pilotId))

  // Verlierer (Platz 3+4) → Loser Pool
  const losers = rankings.filter(r => r.rank > 2)
  addToLoserPool(losers.map(r => r.pilotId))

  // Nur LB-Heat erstellen wenn Pool >= 4 UND noch WB aktiv
  if (loserPool.length >= 4 && checkForMoreWBHeats()) {
    generateLBHeat()
  }
}
```

#### Aufgabe 2: Warten-Logik

```
Situation:
- WB Heat 3 abgeschlossen: Verlierer = [Max, Markus]
- Pool jetzt: [Max, Markus] = 2 Piloten
- Noch WB Heat 4 ausstehend

Aktion:
- Prüfen: Pool < 4 UND noch WB aktiv
- Ergebnis: NICHTS TUN (warten auf mehr Verlierer)

Nächster Schritt:
- WB Heat 4 abgeschlossen: Verlierer = [Simon, Andi]
- Pool jetzt: [Max, Markus, Simon, Andi] = 4 Piloten
- Prüfen: Pool >= 4
- Ergebnis: LB Heat erstellen mit [Max, Markus, Simon, Andi] (FIFO)
```

---

### Epic 9 - Story 9.3: LB-Finale & Grand Finale (4er)

#### Aufgabe 1: Grand Finale Pool Sammlung

```typescript
// WB Finale Abschluss
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

  checkForGrandFinale()
}

// LB Finale Abschluss
function onLBFinaleComplete(heatId: string, rankings: Ranking[]) {
  // Gewinner (Platz 1-2) → Grand Finale Pool
  const winners = rankings.filter(r => r.rank <= 2)
  grandFinalePool.push(...winners.map(w => w.pilotId))

  // Verlierer (Platz 3-4) → ELIMINIERT
  const losers = rankings.filter(r => r.rank > 2)
  eliminatePilots(losers.map(l => l.pilotId))

  checkForGrandFinale()
}
```

#### Aufgabe 2: 4er Grand Finale statt 2er

```typescript
function generateGrandFinale(): Heat {
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

// Grand Finale Größen:
// - Ideal: 4 Piloten (WB-Finale Winner 1 + LB-Finale Winner 1 = 2)
// - Worst Case: 2 Piloten
// - Zwischen: 3 Piloten
```

**Grand Finale Beispiel (Ideal Case):**

```
WB FINALE:
-----------
Jakob vs Jürgen
→ Jakob gewinnt → Grand Finale Pool: [Jakob]
→ Jürgen verliert → Loser Pool

LB FINALE:
-----------
Niklas vs Max vs Markus vs Andi
→ Niklas & Max gewinnen → Grand Finale Pool: [Jakob, Niklas, Max]
→ Markus & Andi eliminiert

GRAND FINALE:
--------------
Jakob vs Niklas vs Max vs (1 Wildcard)
→ Jakob gewinnt = Turnier-Sieger
→ Niklas & Max = 2. & 3. Platz
→ Wildcard = 4. Platz
```

---

## 🔧 Zu löschende Dateien

| Datei | Grund |
|-------|-------|
| `src/lib/bracket-structure-generator.ts` | Vorberechnete Struktur nicht mehr benötigt |
| `src/lib/bracket-calculator.ts` | Wird durch dynamische Logik ersetzt |

---

## ✅ Success Criteria

### Epic 4

1. ✅ **Pool-State implementiert:** `winnerPool`, `loserPool`, `grandFinalePool` im Store
2. ✅ **FIFO implementiert:** Wer zuerst verliert, fliegt zuerst wieder
3. ✅ **Dynamische WB-Heats:** WB-Heats werden on-the-fly erstellt
4. ✅ **Dynamische LB-Heats:** LB-Heats werden on-the-fly erstellt (FIFO)
5. ✅ **Warten auf Verlierer:** Pool wird erst geleert wenn noch WB aktiv und 4 Piloten da sind
6. ✅ **Pool-Visualisierung:** Pools werden im Bracket angezeigt mit Piloten
7. ✅ **Keine vorbrechneten Strukturen:** Bracket wächst dynamisch mit echten Daten

### Epic 9

1. ✅ **FIFO statt Random:** Keine zufällige Auswahl im Loser Bracket
2. ✅ **Warten auf Verlierer:** Pool wird gewartet wenn noch WB aktiv
3. ✅ **LB reduziert nur bis 2:** Nicht bis 1 Pilot, sondern bis 2 Piloten
4. ✅ **4er Grand Finale:** WB Finale (2) + LB Finale (2) = Grand Finale (4)
5. ✅ **Grand Finale Pool:** Sammelt WB-Finale-Gewinner + LB-Finale-Gewinner
6. ✅ **Turnier-Abschluss:** Grand Finale Completion → Turnier-Ende

### Allgemein

1. ✅ **Keine vorbrechneten Strukturen:** Alle Heats werden dynamisch erstellt
2. ✅ **Heats sind immer spielbar:** Jeder Heat hat 2-4 Piloten, keine leeren Heats
3. ✅ **Visualisierung stimmt:** Bracket-Baum zeigt tatsächlich existierende Heats
4. ✅ **Alle Tests grün:** Neue Tests decken alle Szenarien ab
5. ✅ **Turnier-Flow komplett:** Von Quali bis Grand Finale funktioniert alles
6. ✅ **Konsistente IDs:** Alle Heats haben einheitliche ID-Struktur
7. ✅ **4er Grand Finale (Ideal):** WB Finale (2) + LB Finale (2) = Grand Finale (4)

---

## 📚 Referenzmaterial

### Course Correction
- [Course Correction: Dynamic Brackets 2025-12-23](./course-correction-dynamic-brackets-2025-12-23.md)

### User Stories
- [Story 4-2: Heat abschliessen & Dynamische Bracket-Progression](../user-stories/epic-4/4-2-heat-abschliessen.md)
- [Story 4-3: Dynamische Bracket-Visualisierung mit Pools](../user-stories/epic-4/4-3-bracket-visualisierung.md)
- [Story 9-1: Loser Pool State & FIFO Logik](../user-stories/epic-9/9-1-loser-pool-state.md)
- [Story 9-2: Dynamische LB-Heat Generierung (FIFO)](../user-stories/epic-9/9-2-dynamische-lb-heat-generierung.md)
- [Story 9-3: LB-Finale & Grand Finale (4er)](../user-stories/epic-9/9-3-lb-finale-grand-finale.md)

### Architektur
- [Architecture: TournamentStore](../../architecture.md#TournamentStore)

---

## 🚀 Nächste Schritte für Development Team

1. **Review Handoff:** Dieses Dokument vollständig lesen
2. **Questions stellen:** Wenn etwas unklar ist, an Product Owner wenden
3. **Implementation starten:**
   - Epic 4 Story 4-2: Pool-State und WB-Logik
   - Epic 4 Story 4-3: Pool-Visualisierung
   - Epic 9 Story 9-1: FIFO Logik
   - Epic 9 Story 9-2: LB-Heat Generierung mit Warten-Logik
   - Epic 9 Story 9-3: LB-Finale und 4er Grand Finale
4. **Tests schreiben:** Alle neuen Funktionen mit Tests abdecken
5. **Integration testen:** Volles Turnier durchspielen (z.B. 8 Piloten)
6. **Validation:** Product Owner prüft gegen Success Criteria

---

## 📞 Support

**Questions?** Contact Product Owner (Jakob) via Slack/E-Mail.

**Important Notes:**
- **FIFO ist kritisch:** Wer zuerst verliert, fliegt zuerst wieder. Keine zufällige Auswahl!
- **Warten auf Verlierer:** Pool wird erst geleert wenn noch WB aktiv und 4 Piloten da sind
- **4er Grand Finale:** WB Finale (2) + LB Finale (2) = Grand Finale (4)
- **LB reduziert nur bis 2:** Nicht bis 1 Pilot, sondern bis 2 Piloten
- **Keine vorbrechneten Strukturen:** Alle Heats werden on-the-fly erstellt

---

**Implementation Handoff erstellt:** 2025-12-23
**Handoff Recipients:** Development Team
**Status:** Ready for Development
