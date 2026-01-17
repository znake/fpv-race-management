# Epic 14: Bracket Visualization Fix - Referenzdokumentation

**Status:** 🟡 In Progress (Finales Fix implementiert, Testing ausstehend)  
**Datum:** 16. Januar 2026  
**Entwickler:** Jakob Lehner

---

## 📋 Übersicht

### Problem
Nach Implementierung von **Epic 13 (Tournament Rules System)** waren dynamisch generierte Heats (WB/LB regular + Finales) **nicht sichtbar** im Bracket UI, obwohl sie korrekt im State existierten.

### Root Cause
- Epic 13 generiert Heats **dynamisch** zur Runtime → `state.heats[]` ✅
- Aber: UI-Components (`WinnerBracketSection`, `LoserBracketSection`) rendern nur Heats aus `state.fullBracketStructure` ❌
- `fullBracketStructure` enthält nur leere **Placeholder-Heats** (generiert bei Tournament-Start)
- Dynamische Heats haben **kein `roundNumber`** → können nicht zu Structure-Rounds gemappt werden
- **Finales** (`isFinale: true`) wurden zusätzlich ausgefiltert

### Lösung (Quick-Fix)
UI-Components so modifiziert, dass sie:
1. Dynamische Heats **separat** von Structure-Heats rendern
2. Regular Heats als "RUNDE 1" vor Structure-Rounds anzeigen
3. **Finales nach Structure-Rounds separat rendern** (neu implementiert)

---

## 🔧 Implementierte Fixes

### **Phase 1: Regular Heats sichtbar machen** ✅
**Datum:** 16. Januar 2026 (früher am Tag)

#### Geänderte Dateien:
1. **`src/components/bracket/sections/WinnerBracketSection.tsx`**
2. **`src/components/bracket/sections/LoserBracketSection.tsx`**
3. **`src/globals.css`**

#### Änderungen:
```typescript
// VORHER: Heats wurden nach roundNumber gruppiert (undefined für dynamische Heats)
// NACHHER: Dynamische Heats separat filtern und als "RUNDE 1" rendern

const getStructureHeatIds = () => {
  const ids = new Set<string>()
  structure.rounds.forEach(round => {
    round.heats.forEach(h => ids.add(h.id))
  })
  return ids
}

const dynamicWBHeats = heats.filter(h => 
  h.bracketType === 'winner' && 
  !getStructureHeatIds().has(h.id)
)

// Rendering:
// 1. Dynamische Heats als "RUNDE 1"
// 2. Connector Space
// 3. Structure Rounds (aus fullBracketStructure)
```

**Resultat:**
- ✅ WB Heats 3, 5 sichtbar
- ✅ LB Heats 4, 6 sichtbar
- ❌ WB Finale (Heat 7) noch unsichtbar
- ❌ LB Finale (Heat 8) noch unsichtbar

---

### **Phase 2: Finales sichtbar machen** ✅
**Datum:** 16. Januar 2026 (aktueller Stand)

#### Problem:
Finales wurden durch `!h.isFinale` Filter ausgefiltert und nie gerendert.

#### Lösung:

**`WinnerBracketSection.tsx` (Zeilen 65-72, 181-213):**
```typescript
// ÄNDERUNG 1: Filter ohne !h.isFinale
const dynamicWBHeats = heats.filter(h => 
  h.bracketType === 'winner' && 
  !getStructureHeatIds().has(h.id)
)

// ÄNDERUNG 2: Heats separieren
const regularWBHeats = dynamicWBHeats.filter(h => !h.isFinale)
const finaleHeat = dynamicWBHeats.find(h => h.isFinale)

// ÄNDERUNG 3: Rendering-Logik
// - regularWBHeats als "RUNDE 1"
// - Structure rounds (unchanged)
// - finaleHeat NACH Structure rounds mit "FINALE (3 Piloten)" Label
```

**`LoserBracketSection.tsx` (Zeilen 49-56, 257-294):**
```typescript
// Identische Änderungen wie WinnerBracketSection
// Unterschied: Pool-Indicator statt Connector-Space vor Finale

{finaleHeat && (
  <>
    <div className="pool-indicator">
      <span className="arrow">↓</span>
      {' '}Top Piloten{' '}
      <span className="arrow">→</span>
      {' '}Finale
    </div>
    
    <div className="round-section">
      <div className="round-label">
        FINALE ({finaleHeat.pilotIds.length} Piloten)
      </div>
      {/* Heat rendering */}
    </div>
  </>
)}
```

**Resultat:**
- ✅ Alle 8 Heats sollten jetzt sichtbar sein
- ✅ TypeScript Build erfolgreich
- 🔄 User Testing ausstehend

---

## 📊 Aktueller Status (8-Piloten-Turnier)

### Heat-Übersicht Jakob's Tournament:

| Heat # | Type       | Bracket | Pilots | Status    | Sichtbar? |
|--------|------------|---------|--------|-----------|-----------|
| 1      | Quali      | -       | 4      | Completed | ✅ Ja     |
| 2      | Quali      | -       | 4      | Completed | ✅ Ja     |
| 3      | WB Round 1 | Winner  | 4      | Completed | ✅ Ja     |
| 4      | LB Round 1 | Loser   | 4      | Completed | ✅ Ja     |
| 5      | WB Round 2 | Winner  | 4      | Completed | ✅ Ja     |
| 6      | LB Round 2 | Loser   | 4      | Completed | ✅ Ja     |
| 7      | WB Finale  | Winner  | 3      | Completed | ✅ **Sollte jetzt sichtbar sein** |
| 8      | LB Finale  | Loser   | 3      | Completed | ✅ **Sollte jetzt sichtbar sein** |
| 9      | Grand Finale | Finale | 4     | Pending   | 🔄 Sollte nach Heat 7+8 triggern |

### Erwartetes Visual Layout:

```
┌──────────────────────────────────────────────────┐
│            QUALIFIKATION                         │
│  [Heat 1: 4 Pilots] [Heat 2: 4 Pilots]          │
└──────────────────────────────────────────────────┘
         ↓ Top 2 → WB       ↓ Rank 3-4 → LB

┌─────────────────┬────────────────────────────────┐
│ WINNER BRACKET  │      LOSER BRACKET             │
├─────────────────┼────────────────────────────────┤
│ RUNDE 1         │ RUNDE 1                        │
│ (4 Piloten)     │ (4 Piloten)                    │
│ ┌─────────────┐ │ ┌─────────────┐                │
│ │  Heat 3     │ │ │  Heat 4     │                │
│ │  4 Pilots   │ │ │  4 Pilots   │                │
│ └─────────────┘ │ └─────────────┘                │
│       ↓         │       ↓                         │
│ RUNDE 2         │ RUNDE 2                        │
│ (4 Piloten)     │ (4 Piloten)                    │
│ ┌─────────────┐ │ ┌─────────────┐                │
│ │  Heat 5     │ │ │  Heat 6     │                │
│ │  4 Pilots   │ │ │  4 Pilots   │                │
│ └─────────────┘ │ └─────────────┘                │
│       ↓         │       ↓                         │
│ FINALE          │ FINALE                         │
│ (3 Piloten)     │ (3 Piloten)                    │
│ ┌─────────────┐ │ ┌─────────────┐                │
│ │  Heat 7 ⭐  │ │ │  Heat 8 ⭐  │                │
│ │  3 Pilots   │ │ │  3 Pilots   │                │
│ └─────────────┘ │ └─────────────┘                │
│    Top 2 ↓      │    Top 2 ↓                      │
└─────────────────┴────────────────────────────────┘
                    ↓
         ┌──────────────────────┐
         │   ★ GRAND FINALE ★   │
         │      Heat 9          │
         │      4 Pilots        │
         │  WB#1, WB#2          │
         │  LB#1, LB#2          │
         └──────────────────────┘
```

---

## 🧪 Testing Checklist

### Phase 2 Testing (AKTUELL):
- [ ] **Reload App** und navigiere zum laufenden Turnier
- [ ] **Überprüfe alle 8 Heats sichtbar:**
  - [ ] Quali: Heat 1-2 ✅
  - [ ] WB Regular: Heat 3, 5 ✅
  - [ ] WB Finale: Heat 7 (3 Pilots) ⭐
  - [ ] LB Regular: Heat 4, 6 ✅
  - [ ] LB Finale: Heat 8 (3 Pilots) ⭐
- [ ] **WB Finale Layout:**
  - [ ] Erscheint nach WB Regular Rounds
  - [ ] Label: "FINALE (3 Piloten)"
  - [ ] 3-Pilot-Heat korrekt dargestellt
  - [ ] Connector Space davor vorhanden
- [ ] **LB Finale Layout:**
  - [ ] Erscheint nach LB Regular Rounds
  - [ ] Label: "FINALE (3 Piloten)"
  - [ ] 3-Pilot-Heat korrekt dargestellt
  - [ ] Pool-Indicator davor: "Top Piloten → Finale"
- [ ] **Grand Finale Trigger:**
  - [ ] Wenn beide Finales completed: Grand Finale erscheint automatisch
  - [ ] Grand Finale zeigt 4 Piloten (Top 2 WB + Top 2 LB)

### Edge Cases:
- [ ] **16 Piloten Turnier:** Mehr Rounds werden korrekt angezeigt
- [ ] **Unvollständige Turniere:** Pending Heats zeigen "TBD" Piloten
- [ ] **Bracket Width:** Keine Überlappungen bei verschiedenen Pilot-Counts
- [ ] **Responsive:** Horizontal Scroll funktioniert wenn nötig

---

## 🐛 Bekannte Limitationen

### 1. **Round Numbers ungenau**
**Problem:** Alle dynamischen Heats werden als "RUNDE 1" gelabelt, auch wenn es logisch Round 2+ sein sollte.

**Grund:** Dynamische Heats haben kein `roundNumber` Property (undefined).

**Impact:** 🟡 Medium - Verwirrend für User, aber funktional korrekt.

**Fix benötigt:**
- Option A: `roundNumber` in Heat-Generation (Epic 13) hinzufügen
- Option B: Round-Number aus Tournament-Progression berechnen

---

### 2. **Structure vs. Dynamic Heats Mismatch**
**Problem:** `fullBracketStructure` wird bei Tournament-Start generiert mit Placeholder-Heats, aber Epic 13 generiert zur Runtime neue Heat-IDs.

**Grund:** Zwei separate Systeme ohne Sync:
- Epic 12/14: Structure-Generator
- Epic 13: Tournament Rules Engine

**Impact:** 🔴 High - Quick-Fix masking deeper architectural issue.

**Langfristige Lösung:**
1. Structure-Generator sollte **nur Structure** ohne Heat-IDs generieren
2. Epic 13 sollte Heats **in** die Structure einhängen (populate)
3. UI rendert dann unified Structure (keine separate dynamic heats logic)

---

### 3. **Bracket Width zu schmal**
**Problem:** Bei kleinen Turnieren (8 Piloten) ist Bracket gesamt nur ~700px breit.

**Aktuell:** 
- WB Column: 300px min-width
- LB Column: 400px min-width
- Total: 700px (+ Gaps)

**Mockup Referenz:** 
- WB: 590px
- LB: 890px
- Total: ~1480px

**Impact:** 🟡 Medium - Funktional OK, aber visuell nicht ideal.

**Fix benötigt:**
- Dynamic width scaling basierend auf Pilot-Count
- Oder: Fixed wider min-widths closer to mockup

---

## 📁 Relevante Dateien

### Geänderte Dateien (Phase 1+2):
```
src/components/bracket/sections/
├── WinnerBracketSection.tsx   ✅ MODIFIED (Phase 1 + 2)
├── LoserBracketSection.tsx    ✅ MODIFIED (Phase 1 + 2)
└── GrandFinaleSection.tsx     ⚪ NOT MODIFIED (relevant for next phase)

src/globals.css                  ✅ MODIFIED (Phase 1)
```

### Relevante Dateien (nicht geändert):
```
src/stores/
└── tournamentStore.ts           📄 Epic 13 - Heat Generation Logic
    - submitHeatResults()
    - generateWBHeat()
    - generateLBHeat()
    - generateWBFinale()        ⭐ Generiert Heat 7
    - generateLBFinale()        ⭐ Generiert Heat 8
    - generateGrandFinale()     🔄 Sollte triggern nach Finales

src/lib/
└── bracket-structure-generator.ts  📄 Epic 12/14 - Structure Generation
    - generateFullBracketStructure()
    - Returns: { winnerBracket, loserBracket, grandFinale }

src/components/bracket/
└── BracketTree.tsx              📄 Main Container
    - Rendert: Quali → WB+LB → Grand Finale
```

---

## 🎯 Nächste Schritte

### **SOFORT (Critical):**
1. **User Testing mit Jakob** 🔴
   - Alle 8 Heats sichtbar?
   - Grand Finale triggered?
   - Screenshots sammeln

2. **Bugfixes falls nötig** 🔴
   - Falls Finales noch unsichtbar: Debug warum
   - Console Errors überprüfen
   - State inspection

---

### **KURZFRISTIG (High Priority):**

#### **3. Grand Finale Trigger verifizieren** 🟡
**Wenn:** Beide Finales completed  
**Erwartet:** Grand Finale (Heat 9) wird automatisch generiert und angezeigt  
**Zu prüfen:**
- `tournamentStore.ts` → `submitHeatResults()` triggert `generateGrandFinale()`?
- `GrandFinaleSection.tsx` rendert Heat 9 korrekt?
- State: `state.grandFinale` populated?

**Files zu checken:**
```typescript
// src/stores/tournamentStore.ts
const checkForGrandFinale = () => {
  const wbFinale = heats.find(h => h.bracketType === 'winner' && h.isFinale)
  const lbFinale = heats.find(h => h.bracketType === 'loser' && h.isFinale)
  
  if (wbFinale?.status === 'completed' && lbFinale?.status === 'completed') {
    generateGrandFinale(wbFinale, lbFinale)
  }
}
```

---

#### **4. Round Number Fix** 🟡
**Options:**

**Option A: Add roundNumber in Epic 13 (Recommended)**
```typescript
// In tournamentStore.ts - generateWBHeat()
const newWBHeat: Heat = {
  id: generateId(),
  heatNumber: nextHeatNumber,
  pilotIds: [...advancingPilots],
  bracketType: 'winner',
  roundNumber: calculateWBRoundNumber(), // ← ADD THIS
  status: 'pending'
}

const calculateWBRoundNumber = (): number => {
  // Count existing WB heats groups to determine current round
  const wbHeats = state.heats.filter(h => h.bracketType === 'winner' && !h.isFinale)
  // Logic to calculate current round based on tournament progression
  // ...
}
```

**Option B: Calculate in UI (Quick but less clean)**
```typescript
// In WinnerBracketSection.tsx
const dynamicRoundNumber = calculateDynamicRound(heat, heats, structure)
```

---

#### **5. Bracket Width Optimization** 🟢
**Problem:** 700px total zu schmal für gute UX

**Solutions:**
- **Easy:** Increase min-widths in `globals.css`
  ```css
  .bracket-column.wb { min-width: 450px; }  /* Was: 300px */
  .bracket-column.lb { min-width: 600px; }  /* Was: 400px */
  ```
  
- **Better:** Dynamic scaling
  ```typescript
  const columnWidth = calculateColumnWidth({
    pilotCount,
    viewportWidth: window.innerWidth,
    minWidth: 300,
    maxWidth: 590
  })
  ```

---

### **MITTELFRISTIG (Medium Priority):**

#### **6. Structure Refactoring** 🔵
**Goal:** Einheitliches System statt Quick-Fix

**Current (Quick-Fix Architecture):**
```
Tournament Start:
  → generateFullBracketStructure()
    → Creates structure with placeholder heats (IDs: bracket-xyz...)

During Tournament:
  → submitHeatResults()
    → generateWBHeat() / generateLBHeat()
      → Creates NEW heats with different IDs
      → Heats NOT in structure

UI:
  → Renders structure heats (empty placeholders)
  → SEPARATELY renders dynamic heats (real data)
  ❌ Disconnect!
```

**Target (Unified Architecture):**
```
Tournament Start:
  → generateBracketStructure()
    → Creates structure WITHOUT heat IDs
    → Only defines: rounds, positions, connections

During Tournament:
  → submitHeatResults()
    → generateWBHeat()
      → Places heat INTO structure at correct position
      → Structure.rounds[x].heats[y] = newHeat

UI:
  → Renders structure with populated heats
  ✅ Single source of truth
```

**Affected Files:**
- `src/lib/bracket-structure-generator.ts` - Remove heat ID generation
- `src/stores/tournamentStore.ts` - Add heat → structure mapping
- `src/components/bracket/sections/*` - Remove dynamic heats logic

**Estimated Effort:** 4-6 hours

---

### **LANGFRISTIG (Low Priority):**

#### **7. 3-Pilot Heat Spacing** 🔵
Finales haben 3 Piloten statt 4 - visuelle Optimierung?

#### **8. SVG Connector Lines** 🔵
Epic 14 spec includes connector lines between heats (mockup vorhanden)

#### **9. Responsive Design** 🔵
Mobile view, tablet optimization

---

## 🔍 Debug Helpers

### **State Inspection:**
```javascript
// Browser Console
const state = JSON.parse(localStorage.getItem('fpv-racing-heats-tournament'))

// Check heats
console.table(state.heats.map(h => ({
  id: h.id,
  number: h.heatNumber,
  type: h.bracketType,
  round: h.roundNumber,
  finale: h.isFinale,
  status: h.status,
  pilots: h.pilotIds.length
})))

// Check structure
console.log('Structure WB rounds:', state.fullBracketStructure.winnerBracket.rounds.length)
console.log('Structure LB rounds:', state.fullBracketStructure.loserBracket.rounds.length)

// Check Grand Finale
console.log('Grand Finale heat:', state.heats.find(h => h.bracketType === 'finale'))
```

### **Common Issues:**

**Problem: Finales noch unsichtbar**
```javascript
// Check if finales exist
const wbFinale = state.heats.find(h => h.bracketType === 'winner' && h.isFinale)
const lbFinale = state.heats.find(h => h.bracketType === 'loser' && h.isFinale)

console.log('WB Finale:', wbFinale)
console.log('LB Finale:', lbFinale)

// Check if in structure
const structureIds = new Set()
state.fullBracketStructure.winnerBracket.rounds.forEach(r => 
  r.heats.forEach(h => structureIds.add(h.id))
)

console.log('WB Finale in structure?', structureIds.has(wbFinale.id))
```

**Problem: Grand Finale nicht triggered**
```javascript
// Check conditions
const wbFinale = state.heats.find(h => h.bracketType === 'winner' && h.isFinale)
const lbFinale = state.heats.find(h => h.bracketType === 'loser' && h.isFinale)

console.log('WB Finale completed?', wbFinale?.status === 'completed')
console.log('LB Finale completed?', lbFinale?.status === 'completed')

// Check if Grand Finale exists
const grandFinale = state.heats.find(h => h.bracketType === 'finale')
console.log('Grand Finale exists?', !!grandFinale)
```

---

## 📚 Referenzen

### **Epic Documents:**
- `_bmad-output/planning-artifacts/epic-14-bracket-visualization.md` - Original Epic spec
- `BRACKET_RENDERING_ISSUE.md` - Detailed problem analysis
- `_bmad-output/planning-artifacts/design/bracket-tree-dynamic-svg.html` - Visual mockup

### **Related Epics:**
- **Epic 12:** Initial Bracket Structure (Structure Generator)
- **Epic 13:** Tournament Rules System (Heat Generation Logic)
- **Epic 14:** Vertical Bracket Visualization (Current - UI Rendering)

### **Key Concepts:**
- **Structure Heats:** Placeholder heats in `fullBracketStructure` (generated at start)
- **Dynamic Heats:** Real heats in `state.heats[]` (generated during tournament)
- **Quick-Fix:** UI renders both separately (temporary solution)
- **Target:** Unified system where dynamic heats populate structure

---

## ✅ Definition of Done

Epic 14 ist abgeschlossen wenn:

- [x] **Phase 1:** Regular WB/LB Heats sichtbar (Heat 3-6)
- [ ] **Phase 2:** WB/LB Finales sichtbar (Heat 7-8) - IMPLEMENTIERT, TESTING AUSSTEHEND
- [ ] **Phase 3:** Grand Finale auto-trigger funktioniert
- [ ] **Testing:** Vollständiger Turnier-Durchlauf (8, 16, 32 Piloten)
- [ ] **Visual:** Brackets haben adäquate Breite (keine Überlappungen)
- [ ] **UX:** Round Labels sind korrekt und nachvollziehbar
- [ ] **Code:** TypeScript build ohne Errors
- [ ] **Docs:** Diese Referenz-Datei aktuell und vollständig

---

## 📝 Change Log

| Datum          | Phase   | Änderung                                    | Status |
|----------------|---------|---------------------------------------------|--------|
| 16.01.2026 AM  | Phase 1 | Regular Heats Rendering Fix                 | ✅ Done |
| 16.01.2026 AM  | Phase 1 | CSS Min-Width & Layout Fixes                | ✅ Done |
| 16.01.2026 PM  | Phase 2 | Finales Rendering Fix                       | ✅ Done |
| 16.01.2026 PM  | Phase 2 | Dokumentation erstellt                      | ✅ Done |
| TBD            | Phase 2 | User Testing & Verification                 | 🔄 Pending |
| TBD            | Phase 3 | Grand Finale Trigger Testing                | 🔄 Pending |

---

## 💬 Kommunikation mit User

### Letzter Stand (User Quote):
> "Ich sehe eigentlich nur die ersten vier Heats und die letzten (Finales) sehe ich eigentlich nicht mehr."

### Nächste Frage an User:
> "Hey Jakob, ich habe den Finales-Fix implementiert. Kannst du bitte:
> 1. Die App reloaden
> 2. Zum laufenden Turnier navigieren
> 3. Überprüfen ob du jetzt alle 8 Heats siehst (inkl. WB/LB Finales mit 3 Piloten)
> 4. Screenshot schicken vom Bracket
> 
> Falls Heat 7+8 completed sind: Wird das Grand Finale angezeigt?"

---

**Letzte Aktualisierung:** 16. Januar 2026, 14:30 Uhr  
**Nächster Milestone:** User Testing Phase 2 Fix  
**Verantwortlich:** Jakob Lehner
