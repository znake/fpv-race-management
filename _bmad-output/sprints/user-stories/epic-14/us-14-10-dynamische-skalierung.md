# US-14.10: Dynamische Skalierung 8-60 Piloten

| Feld | Wert |
|------|------|
| **Story ID** | US-14.10 |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | HIGH |
| **Geschätzter Aufwand** | 5 Story Points (1-1.5 Tage) |
| **Abhängigkeiten** | US-14.1 (Container), benötigt vor US-14.3, US-14.4 |

---

## User Story

**Als** Turnierleiter  
**möchte ich** dass das Layout für 8-60 Piloten funktioniert  
**sodass** ich beliebig große Turniere veranstalten kann

---

## Akzeptanzkriterien

### AC1: Container-Breite Berechnung
- [ ] Formel: max(WB-Breite, LB-Breite) × 2 + Gap(40px) + Padding(50px)
- [ ] Alternativ: WB-Breite + Gap + LB-Breite + Padding
- [ ] Mindestbreite: ~600px (für 8 Piloten)
- [ ] Maximale Breite: ~2500px (für 60 Piloten)

### AC2: WB-Breiten Berechnung
- [ ] Formel: (Heats in R1) × Heat-Width + (Heats-1) × Gap
- [ ] Heat-Width: 140px (Standard), 120px (3er-Heat)
- [ ] Gap: 10px
- [ ] Beispiel 32 Piloten: 4 × 140 + 3 × 10 = 590px

### AC3: LB-Breiten Berechnung
- [ ] Formel: (max Heats in einer Runde) × Heat-Width + (Heats-1) × Gap
- [ ] LB hat oft mehr Heats pro Runde als WB
- [ ] Beispiel 32 Piloten LB R1: 6 × 140 + 5 × 10 = 890px

### AC4: Runden-Anzahl Berechnung
- [ ] WB-Runden: log2(Piloten in WB R1 / 4) + 1
- [ ] LB-Runden: Abhängig von eingehenden WB-Verlierern
- [ ] Dynamisch basierend auf Pilotenzahl

### AC5: Heat-Anzahl pro Runde
- [ ] WB R1: (Quali-Gewinner) / 4 = Piloten / 2 / 4 = Piloten / 8
- [ ] WB RN: Heats der Vorrunde / 2
- [ ] LB: Pool-basiert (aus Epic 13)

### AC6: 3er-Heat Erkennung
- [ ] Wenn Pilotenzahl nicht glatt durch 4 teilbar
- [ ] Breite: 120px statt 140px
- [ ] CSS-Klasse: `.three-pilot`

### AC7: SVG-Linien DOM-Berechnung
- [ ] Positionen werden aus DOM-Elementen gelesen
- [ ] Kein Hardcoding von Koordinaten
- [ ] Dynamische Neuberechnung bei Layout-Änderungen

### AC8: Test-Abdeckung
- [ ] Getestet mit: 8, 12, 15, 16, 24, 27, 32, 48, 60 Piloten
- [ ] Edge Cases: ungerade Zahlen, Primzahlen
- [ ] Kein Layout-Bruch bei extremen Werten

---

## Technische Hinweise

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/lib/bracket-layout-calculator.ts` | NEU erstellen |
| `src/components/bracket/BracketTree.tsx` | Layout-Logik integrieren |

### BracketDimensions Interface

```typescript
// src/lib/bracket-layout-calculator.ts

interface BracketDimensions {
  containerWidth: number
  wbColumnWidth: number
  lbColumnWidth: number
  qualiWidth: number
  heatsPerRound: {
    wb: number[]  // z.B. [4, 2, 1] für 32 Piloten
    lb: number[]  // z.B. [6, 4, 3, 2, 1] für 32 Piloten
  }
  roundLabels: {
    wb: string[]  // z.B. ["RUNDE 1 (16 Piloten)", "RUNDE 2 (8 Piloten)", "FINALE (4 Piloten)"]
    lb: string[]  // z.B. ["RUNDE 1 (24 Piloten: 16 Quali + 8 WB R1)", ...]
  }
  roundPilotCounts: {
    wb: number[]
    lb: number[]
  }
}

const HEAT_WIDTH = 140
const HEAT_WIDTH_3 = 120
const GAP = 10
const COLUMN_GAP = 40
const CONTAINER_PADDING = 50

export function calculateBracketDimensions(pilotCount: number): BracketDimensions {
  // Qualifikation
  const qualiHeats = Math.ceil(pilotCount / 4)
  const qualiWidth = qualiHeats * HEAT_WIDTH + (qualiHeats - 1) * GAP
  
  // WB R1: Gewinner aus Quali (Platz 1+2)
  const wbR1Pilots = Math.floor(pilotCount / 2)
  const wbR1Heats = Math.ceil(wbR1Pilots / 4)
  
  // WB Runden berechnen
  const wbHeatsPerRound: number[] = []
  const wbPilotCounts: number[] = []
  let currentWBHeats = wbR1Heats
  let currentWBPilots = wbR1Pilots
  
  while (currentWBHeats >= 1) {
    wbHeatsPerRound.push(currentWBHeats)
    wbPilotCounts.push(currentWBPilots)
    currentWBPilots = Math.ceil(currentWBPilots / 2) // Top 2 pro Heat
    currentWBHeats = Math.ceil(currentWBPilots / 4)
    if (currentWBHeats === 0 && currentWBPilots > 0) {
      wbHeatsPerRound.push(1) // Finale
      wbPilotCounts.push(currentWBPilots)
      break
    }
  }
  
  // WB Breite: Max Heats in einer Runde × Heat-Width
  const maxWBHeats = Math.max(...wbHeatsPerRound)
  const wbColumnWidth = maxWBHeats * HEAT_WIDTH + (maxWBHeats - 1) * GAP
  
  // LB Berechnung (vereinfacht - Details aus Epic 13)
  const lbHeatsPerRound = calculateLBHeatsPerRound(pilotCount, wbHeatsPerRound)
  const lbPilotCounts = calculateLBPilotCounts(pilotCount, wbHeatsPerRound)
  
  // LB Breite: Max Heats in einer Runde
  const maxLBHeats = Math.max(...lbHeatsPerRound)
  const lbColumnWidth = maxLBHeats * HEAT_WIDTH + (maxLBHeats - 1) * GAP
  
  // Container Breite
  const containerWidth = wbColumnWidth + COLUMN_GAP + lbColumnWidth + CONTAINER_PADDING
  
  // Round Labels
  const wbLabels = wbPilotCounts.map((count, idx) => 
    idx === wbHeatsPerRound.length - 1 
      ? `FINALE (${count} Piloten)` 
      : `RUNDE ${idx + 1} (${count} Piloten)`
  )
  
  const lbLabels = generateLBRoundLabels(lbPilotCounts, wbHeatsPerRound)
  
  return {
    containerWidth,
    wbColumnWidth,
    lbColumnWidth,
    qualiWidth,
    heatsPerRound: { wb: wbHeatsPerRound, lb: lbHeatsPerRound },
    roundLabels: { wb: wbLabels, lb: lbLabels },
    roundPilotCounts: { wb: wbPilotCounts, lb: lbPilotCounts }
  }
}

export function calculateHeatWidth(pilotCount: 3 | 4): number {
  return pilotCount === 3 ? HEAT_WIDTH_3 : HEAT_WIDTH
}

// Helper für LB-Berechnung
function calculateLBHeatsPerRound(pilotCount: number, wbHeatsPerRound: number[]): number[] {
  // LB R1: Quali-Verlierer + WB R1 Verlierer
  // LB RN: LB R(N-1) Gewinner + WB RN Verlierer
  // ... komplexe Logik aus Epic 13
  
  // Vereinfachte Approximation für Layout
  const lbRounds: number[] = []
  let currentLBPilots = Math.ceil(pilotCount / 2) // Quali-Verlierer
  
  for (let i = 0; i < wbHeatsPerRound.length; i++) {
    // WB-Verlierer dazuaddieren
    const wbLosers = wbHeatsPerRound[i] * 2 // Platz 3+4
    currentLBPilots += wbLosers
    
    const heats = Math.ceil(currentLBPilots / 4)
    lbRounds.push(heats)
    
    // Gewinner gehen weiter (Platz 1+2)
    currentLBPilots = heats * 2
  }
  
  // LB Finale
  if (lbRounds.length > 0 && lbRounds[lbRounds.length - 1] > 1) {
    lbRounds.push(1)
  }
  
  return lbRounds
}

function calculateLBPilotCounts(pilotCount: number, wbHeatsPerRound: number[]): number[] {
  // Ähnliche Logik wie oben, aber Pilotenzahlen
  // ...
  return []
}

function generateLBRoundLabels(pilotCounts: number[], wbHeatsPerRound: number[]): string[] {
  // z.B. "RUNDE 1 (24 Piloten: 16 Quali + 8 WB R1)"
  // ...
  return pilotCounts.map((count, idx) => 
    idx === pilotCounts.length - 1 
      ? `FINALE (${count} Piloten)` 
      : `RUNDE ${idx + 1} (${count} Piloten)`
  )
}
```

### Beispiel-Berechnungen

| Piloten | Quali Heats | WB R1 Heats | WB Breite | LB Max Heats | LB Breite | Container |
|---------|-------------|-------------|-----------|--------------|-----------|-----------|
| 8 | 2 | 1 | 140px | 1-2 | 280px | ~510px |
| 16 | 4 | 2 | 290px | 3 | 440px | ~820px |
| 32 | 8 | 4 | 590px | 6 | 890px | ~1570px |
| 48 | 12 | 6 | 890px | 9 | 1340px | ~2320px |
| 60 | 15 | 7-8 | ~1040px | 11 | 1640px | ~2770px |

### Integration in BracketTree

```tsx
// BracketTree.tsx
import { calculateBracketDimensions } from '../../lib/bracket-layout-calculator'

export function BracketTree({ pilots, ... }) {
  const dimensions = useMemo(() => 
    calculateBracketDimensions(pilots.length),
    [pilots.length]
  )
  
  return (
    <div 
      className="bracket-container"
      style={{ width: dimensions.containerWidth }}
    >
      <QualiSection heats={qualiHeats} ... />
      
      <div className="bracket-layout" style={{ gap: '40px' }}>
        <WinnerBracketSection 
          columnWidth={dimensions.wbColumnWidth}
          heatsPerRound={dimensions.heatsPerRound.wb}
          roundLabels={dimensions.roundLabels.wb}
          ...
        />
        <LoserBracketSection 
          columnWidth={dimensions.lbColumnWidth}
          heatsPerRound={dimensions.heatsPerRound.lb}
          roundLabels={dimensions.roundLabels.lb}
          ...
        />
      </div>
      
      <GrandFinaleSection ... />
    </div>
  )
}
```

---

## Test-Szenarien

| Piloten | Erwartetes Verhalten |
|---------|---------------------|
| 8 | 2 Quali, 1 WB R1, 1 WB Finale, ~2 LB Runden |
| 12 | 3 Quali, 1-2 WB Runden, LB mit 3er-Heats |
| 15 | Ungerade - 3er-Heats in Quali und LB |
| 16 | 4 Quali, 2 WB Runden + Finale |
| 24 | 6 Quali, 3 WB Heats R1 |
| 27 | Primzahl - 3er-Heats erforderlich |
| 32 | Standard-Test wie Mockup |
| 48 | Große Turniere |
| 60 | Maximum - alle Dimensionen testen |

---

## Definition of Done

- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] bracket-layout-calculator.ts implementiert
- [ ] Breiten-Berechnung für WB und LB korrekt
- [ ] Container-Breite dynamisch
- [ ] Runden-Anzahl dynamisch
- [ ] Heat-Anzahl pro Runde dynamisch
- [ ] 3er-Heat Support
- [ ] SVG-Linien aus DOM berechnet
- [ ] Tests mit allen Pilotenzahlen (8-60)
- [ ] Kein Layout-Bruch bei Edge Cases
- [ ] Performance bei 60 Piloten akzeptabel
- [ ] Code Review durchgeführt
