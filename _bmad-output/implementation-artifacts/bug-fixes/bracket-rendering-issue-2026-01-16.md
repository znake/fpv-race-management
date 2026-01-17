# Bracket Rendering Problem - Epic 14 Vertikales Layout

**Datum:** 2026-01-16  
**Status:** 🔴 CRITICAL - Heats werden nicht vollständig gerendert  
**Kontext:** 8-Piloten Turnier (alle Heats completed), aber Bracket zeigt nur Teile

---

## 🎯 Problem-Symptome

### Was der User sieht:
1. ✅ **Quali-Heats (Heat 1-2):** Werden korrekt angezeigt
2. ⚠️ **WB/LB Heats (Heat 3-6):** Teilweise sichtbar, aber **überlappend** statt nebeneinander
3. ❌ **WB Finale (Heat 7):** NICHT sichtbar (3-Pilot Heat mit isFinale: true)
4. ❌ **LB Finale (Heat 8):** NICHT sichtbar (3-Pilot Heat mit isFinale: true)
5. ⚠️ **Bracket-Breite:** Brackets nutzen nicht die volle Bildschirmbreite, sind "zusammengepfercht"

### Screenshot-Evidenz:
![Screenshot](siehe angehängtes Bild)
- WB Header: ~300px breit (sollte breiter sein)
- LB Header: ~400px breit (sollte breiter sein)
- Heats überlappen sich vertikal
- Finales fehlen komplett

---

## 🔍 Root Cause Analyse

### 1. **State vs. Structure Mismatch**

**Aktueller State zeigt 8 Heats:**
```json
heats: [
  { id: "Heat 1", status: "completed" },  // Quali
  { id: "Heat 2", status: "completed" },  // Quali
  { id: "wb-heat-...", status: "completed", bracketType: "winner" },  // Heat 3 - KEIN roundNumber!
  { id: "lb-heat-...", status: "completed", bracketType: "loser" },   // Heat 4 - KEIN roundNumber!
  { id: "wb-heat-...", status: "completed", bracketType: "winner" },  // Heat 5 - KEIN roundNumber!
  { id: "lb-heat-...", status: "completed", bracketType: "loser" },   // Heat 6 - KEIN roundNumber!
  { id: "wb-finale-...", status: "completed", isFinale: true },       // Heat 7 - WB Finale
  { id: "lb-finale-...", status: "completed", isFinale: true }        // Heat 8 - LB Finale
]
```

**fullBracketStructure (für 8 Piloten generiert):**
```json
{
  "qualification": {
    "heats": [ Heat 1, Heat 2 ]  // ✅ OK
  },
  "winnerBracket": {
    "rounds": [
      { "roundNumber": 2, "roundName": "WB Semifinale", "heats": [LEER] },  // ❌ Round 1 fehlt!
      { "roundNumber": 3, "roundName": "WB Finale", "heats": [LEER] }
    ]
  },
  "loserBracket": {
    "rounds": [
      { "roundNumber": 1, "heats": [LEER] },  // ❌ Alle Heats LEER
      { "roundNumber": 2, "heats": [LEER] },
      { "roundNumber": 3, "heats": [LEER] }
    ]
  }
}
```

**⚠️ Problem:** 
- Die **dynamischen Heats (3-8)** haben **kein `roundNumber`** → können nicht in die Structure-Rounds eingefügt werden
- Die **Structure** enthält **nur leere Placeholder-Heats** (IDs wie `bracket-xyz...`)
- Die **Finales** (`isFinale: true`) fehlen in der Structure komplett

---

### 2. **Quick-Fix Implementierung (unvollständig)**

**Aktueller Code in `WinnerBracketSection.tsx`:**
```tsx
// QUICK-FIX: Filtert dynamische Heats
const dynamicWBHeats = heats.filter(h => 
  h.bracketType === 'winner' && 
  !h.isFinale &&  // ❌ Finales werden ausgefiltert!
  !getStructureHeatIds().has(h.id)
)

// Rendert dynamische Heats als "RUNDE 1"
{dynamicWBHeats.length > 0 && (
  <div className="round-section">
    <div className="round-label">RUNDE 1 ({dynamicWBHeats.length * 4} Piloten)</div>
    {/* Heats hier */}
  </div>
)}

// Dann rendert Structure-based Rounds (die LEER sind)
{structure.rounds.map((round, idx) => {
  // Round 2, Round 3 etc. - ALLE LEER
})}
```

**⚠️ Probleme:**
1. **Finales fehlen:** `!h.isFinale` filtert WB/LB Finales aus → werden nicht gerendert
2. **Keine Round-Zuordnung:** Alle dynamischen Heats landen in "RUNDE 1", auch wenn sie zu späteren Runden gehören
3. **Structure-Rounds sind leer:** Die Placeholder-Heats existieren nicht im `heats[]` Array

---

### 3. **Bracket-Breite Problem**

**Berechnung für 8 Piloten:**
```javascript
// WB: 8 Piloten / 8 = 1 Heat R1
const wbR1Heats = Math.ceil(8 / 8) = 1
const wbColumnWidth = 1 * 140px + 0 * 10px = 140px  // ❌ Zu schmal!

// LB: (4 Quali losers + 2 WB R1 losers) / 4 = 2 Heats
const lbR1Heats = Math.ceil(6 / 4) = 2
const lbColumnWidth = 2 * 140px + 1 * 10px = 290px  // ❌ Zu schmal!
```

**Min-Width Fix (bereits implementiert):**
```css
.bracket-column.wb { min-width: 300px; }
.bracket-column.lb { min-width: 400px; }
```
→ Das sollte helfen, aber die Heats überlappen sich trotzdem

---

## 📂 Betroffene Dateien

### Geändert (Quick-Fix Session):
1. ✅ `src/components/bracket/sections/WinnerBracketSection.tsx`
   - Rendert dynamische Heats als RUNDE 1
   - **Problem:** Filtert Finales aus

2. ✅ `src/components/bracket/sections/LoserBracketSection.tsx`
   - Rendert dynamische Heats als RUNDE 1
   - **Problem:** Filtert Finales aus

3. ✅ `src/globals.css`
   - `min-width` für `.bracket-column.wb` (300px) und `.lb` (400px)
   - `flex-shrink: 0` für `.bracket-column`

### Noch NICHT geändert:
4. ❌ `src/stores/tournamentStore.ts`
   - Generiert Heats OHNE `roundNumber` zu setzen
   - **Lösung:** `roundNumber` bei Heat-Erstellung setzen

5. ❌ `src/lib/bracket-structure-generator.ts`
   - Generiert Structure die bei Round 2+ beginnt (für kleine Turniere)
   - **Lösung:** Round 1 immer generieren ODER dynamische Heats korrekt zuordnen

6. ❌ `src/components/bracket/sections/GrandFinaleSection.tsx`
   - Rendert nur Grand Finale, nicht WB/LB Finales
   - **Lösung:** WB/LB Finales in den Sections rendern

---

## 🔧 Vorgeschlagene Lösungen

### Option A: **Store-Fix (Clean Solution)** ⭐ EMPFOHLEN
**Idee:** Epic 13 Heat-Generierung soll `roundNumber` setzen

**Änderungen:**
1. **`tournamentStore.ts`**: WB/LB Heat-Generierung ergänzen:
   ```typescript
   const newWBHeat: Heat = {
     id: `wb-heat-${uuid}`,
     bracketType: 'winner',
     roundNumber: <BERECHNEN>, // ← NEU!
     pilotIds: [...],
     // ...
   }
   ```

2. **Round-Nummer Logik:**
   - WB: Zähle wie viele WB-Heats schon completed sind → Round-Nummer ableiten
   - LB: Ähnlich für LB-Heats

**Vorteile:**
- ✅ Saubere Lösung
- ✅ Heats können korrekt in Structure-Rounds einsortiert werden
- ✅ Quick-Fix kann entfernt werden

**Nachteile:**
- ⚠️ Epic 13 Code anfassen (Risiko für Regression)
- ⚠️ Erfordert ausführliches Testing

---

### Option B: **UI-Fix (Pragmatic Workaround)** ⚡ SCHNELL
**Idee:** Sections rendern ALLE Heats (dynamisch + Structure), inkl. Finales

**Änderungen in `WinnerBracketSection.tsx`:**
```tsx
// 1. Filtere dynamische Heats INKL. Finales
const dynamicWBHeats = heats.filter(h => 
  h.bracketType === 'winner' && 
  // !h.isFinale ENTFERNEN!  ← Finales mitnehmen
  !getStructureHeatIds().has(h.id)
)

// 2. Gruppiere nach isFinale
const nonFinaleHeats = dynamicWBHeats.filter(h => !h.isFinale)
const finaleHeat = dynamicWBHeats.find(h => h.isFinale)

// 3. Rendere non-Finales als "RUNDE 1"
{nonFinaleHeats.length > 0 && (
  <div className="round-section">
    <div className="round-label">RUNDE 1 (...)</div>
    {/* Heats */}
  </div>
)}

// 4. Rendere Structure-Rounds (falls vorhanden)
{structure.rounds.map(...)}

// 5. Rendere Finale NACH allen Runden
{finaleHeat && (
  <div className="round-section">
    <div className="round-label">FINALE (3 Piloten)</div>
    <BracketHeatBox heat={finaleHeat} ... />
  </div>
)}
```

**Analog für `LoserBracketSection.tsx`**

**Vorteile:**
- ✅ Schnell umsetzbar (30 Min)
- ✅ Kein Epic 13 Code anfassen
- ✅ Alle Heats werden gerendert

**Nachteile:**
- ⚠️ Hack/Workaround, nicht die saubere Lösung
- ⚠️ Funktioniert nur für kleine Turniere (bei großen Turnieren könnte Round-Zuordnung falsch sein)

---

### Option C: **Structure-Sync Fix (Hybrid)**
**Idee:** `fullBracketStructure` nach Heat-Completion aktualisieren

**Änderungen in `tournamentStore.ts`:**
```typescript
// In submitHeatResults():
set(state => {
  const updatedHeats = [...state.heats]
  const heatIndex = updatedHeats.findIndex(h => h.id === heatId)
  updatedHeats[heatIndex] = { ...heat, results, status: 'completed' }
  
  // NEU: Sync to fullBracketStructure
  const updatedStructure = syncHeatToStructure(
    state.fullBracketStructure,
    updatedHeats[heatIndex]
  )
  
  return {
    heats: updatedHeats,
    fullBracketStructure: updatedStructure  // ← Aktualisiert
  }
})
```

**Vorteile:**
- ✅ Structure bleibt immer sync
- ✅ UI muss nur Structure rendern

**Nachteile:**
- ⚠️ Komplexer zu implementieren
- ⚠️ Erfordert neue `syncHeatToStructure` Logik

---

## 🚀 Empfohlene Nächste Schritte

### Sofort (Quick Win):
1. **Option B implementieren** (UI-Fix für Finales)
   - `WinnerBracketSection.tsx`: Finale separat rendern
   - `LoserBracketSection.tsx`: Finale separat rendern
   - **Zeiteinsatz:** 30-60 Min
   - **Ergebnis:** Alle Heats sichtbar

### Kurzfristig:
2. **Bracket-Breite überprüfen**
   - DevTools öffnen, gemessene Breiten loggen
   - CSS `.bracket-columns-wrapper` justify-content prüfen
   - Evtl. `width: 100%` auf `.bracket-columns-wrapper` setzen

### Mittelfristig (saubere Lösung):
3. **Option A implementieren** (Store-Fix mit roundNumber)
   - Epic 13 Heat-Generierung erweitern
   - `roundNumber` bei jedem Heat setzen
   - Quick-Fix Code entfernen
   - **Zeiteinsatz:** 2-3 Stunden inkl. Testing

---

## 📊 Debug-Informationen

### State Snapshot (8 Piloten, alle Heats completed):
```json
{
  "pilots": 8,
  "heats": [
    { "id": "Heat 1", "status": "completed", "bracketType": null },
    { "id": "Heat 2", "status": "completed", "bracketType": null },
    { "id": "wb-heat-...", "status": "completed", "bracketType": "winner", "roundNumber": undefined },
    { "id": "lb-heat-...", "status": "completed", "bracketType": "loser", "roundNumber": undefined },
    { "id": "wb-heat-...", "status": "completed", "bracketType": "winner", "roundNumber": undefined },
    { "id": "lb-heat-...", "status": "completed", "bracketType": "loser", "roundNumber": undefined },
    { "id": "wb-finale-...", "status": "completed", "bracketType": "winner", "isFinale": true },
    { "id": "lb-finale-...", "status": "completed", "bracketType": "loser", "isFinale": true }
  ],
  "fullBracketStructure": {
    "winnerBracket": {
      "rounds": [
        { "roundNumber": 2, "heats": [{ "id": "bracket-...", "pilotIds": [] }] },
        { "roundNumber": 3, "heats": [{ "id": "bracket-...", "pilotIds": [] }] }
      ]
    },
    "loserBracket": {
      "rounds": [
        { "roundNumber": 1, "heats": [{ "id": "bracket-...", "pilotIds": [] }] },
        { "roundNumber": 2, "heats": [{ "id": "bracket-...", "pilotIds": [] }] },
        { "roundNumber": 3, "heats": [{ "id": "bracket-...", "pilotIds": [] }] }
      ]
    }
  }
}
```

### Erwartetes Verhalten:
- **WB:** RUNDE 1 (Heat 3, Heat 5), FINALE (Heat 7 - 3 Piloten)
- **LB:** RUNDE 1 (Heat 4, Heat 6), FINALE (Heat 8 - 3 Piloten)

### Aktuelles Verhalten:
- **WB:** RUNDE 1 (Heat 3, Heat 5), RUNDE 2 (leer), RUNDE 3 (leer) ❌ Finale fehlt
- **LB:** RUNDE 1 (Heat 4, Heat 6), Structure-Rounds (leer) ❌ Finale fehlt

---

## 📝 Testing Checklist

Nach dem Fix:
- [ ] **8 Piloten:** Alle 8 Heats sichtbar (Quali 2, WB 3, LB 3)
- [ ] **16 Piloten:** Test mit mehr Heats/Runden
- [ ] **32 Piloten:** Volle Breite wird genutzt (wie Mockup)
- [ ] **Bracket-Breite:** WB + LB nebeneinander, nicht überlappt
- [ ] **Finales:** WB Finale und LB Finale werden korrekt angezeigt
- [ ] **Grand Finale:** Wird ausgelöst nach WB + LB Finale completion

---

## 🔗 Relevante Dateien

**Zu prüfen/ändern:**
- `src/components/bracket/sections/WinnerBracketSection.tsx` (Quick-Fix vorhanden)
- `src/components/bracket/sections/LoserBracketSection.tsx` (Quick-Fix vorhanden)
- `src/stores/tournamentStore.ts` (Heat-Generierung - kein roundNumber)
- `src/lib/bracket-structure-generator.ts` (Structure beginnt bei Round 2)
- `src/globals.css` (min-width bereits gesetzt)

**Referenz:**
- Mockup: `_bmad-output/planning-artifacts/design/bracket-tree-dynamic-svg.html`
- Tech Spec: `_bmad-output/implementation-artifacts/tech-spec-vertikales-bracket-layout.md`
- Epic 14 Story: `_bmad-output/implementation-artifacts/user-stories/epic-14/us-14-rewrite-mockup-conformance.md`

---

**Letzter Stand:** 2026-01-16, Quick-Fix implementiert aber unvollständig (Finales fehlen)
