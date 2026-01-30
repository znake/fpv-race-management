# Draft: Lap Time Feature

## Requirements (confirmed)
- Zeiten für Heats optional hinzufügen (Zeit für 3 Runden pro Pilot)
- Typische Zeiten: 45 Sekunden bis 2 Minuten
- Zeiten sollen die Eingabe NICHT verzögern oder blockieren
- Unauffällig im UI, aber einfach hinzuzufügen

## User's Design Ideas
1. **Shortcut-basierte Eingabe im Placement Modal**:
   - Wenn ein Pilot fokussiert ist, Ziffern tippen = Zeit setzen
   - 2 Ziffern (z.B. "45") = 45 Sekunden
   - 3 Ziffern schnell (z.B. "130") = 1:30
   - Timing-basiert: wenn innerhalb 0.5-1 Sekunde 3 Ziffern

2. **Nachträgliche Zeiteingabe**:
   - Bei abgeschlossenen Heats: Uhr-Icon bei jeder Platzierung
   - Klick öffnet einfache Zeiteingabe

## Technical Findings (COMPLETE)

### Datenmodell
```typescript
// src/lib/schemas.ts
export interface Ranking {
  pilotId: string
  rank: 1 | 2 | 3 | 4
  // NEU HINZUFÜGEN:
  lapTimeMs?: number  // Zeit in Millisekunden (optional)
}

export interface HeatResults {
  rankings: Ranking[]
  completedAt?: string
}
```

### Betroffene Dateien
1. **Schema erweitern**: `src/lib/schemas.ts` - `Ranking` Interface
2. **Placement Modal**: `src/components/placement-entry-modal.tsx`
   - Aktuelle Shortcuts: 1-4 für Ränge, Escape für Reset
   - Fokus-Tracking via `data-pilot-id` auf Buttons
   - Hier Zeit-Eingabe-Logik hinzufügen
3. **Heat Detail Modal**: `src/components/heat-detail-modal.tsx`
   - Zeigt abgeschlossene Heats an
   - Hier Uhr-Icon + Zeit anzeigen + nachträgliche Eingabe
4. **Bracket Heat Box**: `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx`
   - Zeigt Pilot-Rows mit Rank-Badge
   - Optional: Mini-Zeit-Anzeige neben Rank

### Storage
- Zustand Store mit localStorage Persistence
- `tournament-storage` Key
- Keine DB-Migration nötig - localStorage akzeptiert neue Felder

### Test-Infrastruktur
- **Framework**: Vitest
- **Location**: `/tests/*.test.ts(x)`
- **Helpers**: `/tests/helpers/store-helpers.ts`
- **Relevante Tests**: `/tests/placement-entry-modal.test.tsx`

## Decisions Made (User Confirmed)

1. **Zeit-Eingabe-Modus**: Nach Rang-Vergabe
   - Wenn ein Pilot bereits einen Rang hat und fokussiert ist, werden Ziffern als Zeit interpretiert
   - Beispiel: Pilot anklicken (bekommt Rang 1), dann "130" tippen = 1:30 gesetzt

2. **Zeit-Anzeige im Bracket**: JA, dezent neben Platzierung
   - Kleine Zeitangabe (z.B. "1:30") neben dem Rank-Badge in der Heat-Box

3. **Nachträgliche Zeit-Eingabe**: Uhr-Icon im Detail-Modal
   - Im Heat-Detail-Modal bei jedem Piloten ein Uhr-Icon
   - Klick öffnet kleine Eingabe (Popover oder Inline-Input)

4. **Digit Timeout**: 2 Sekunden
   - Nach Klick (Rang-Vergabe) oeffnet sich 2s Fenster fuer Zeit-Eingabe
   - Jede Ziffer resettet das Fenster auf 2s
   - Nach Timeout wird Zeit geparst und gespeichert

5. **Zeit-Format**: Immer M:SS
   - Konsistent: `0:45`, `1:23`, `2:00`

6. **Zeit-Bearbeitung**: Vollständig (Add/Edit/Remove)
   - Uhr-Icon öffnet Input mit aktuellem Wert
   - Zusätzlicher X-Button zum Entfernen

7. **Mobile**: Gleich wie Desktop
   - Digit-Akkumulation funktioniert auf Mobile-Tastatur

8. **Validierung**: 20s - 5min
   - Minimum: 20 Sekunden
   - Maximum: 5 Minuten (300 Sekunden)
   - Außerhalb wird ignoriert (kein Error-UI)

## Zeit-Parsing-Logik

```typescript
// Eingabe-Interpretation:
// 2 Ziffern → Sekunden (z.B. "45" → 0:45)
// 3 Ziffern → M:SS (z.B. "130" → 1:30)
// 4 Ziffern → MM:SS (z.B. "0145" → 1:45) - optional für Grenzfälle

function parseTimeInput(digits: string): number | null {
  if (digits.length === 2) {
    // "45" → 45 Sekunden
    const seconds = parseInt(digits, 10)
    if (seconds >= 0 && seconds < 60) {
      return seconds * 1000
    }
  } else if (digits.length === 3) {
    // "130" → 1:30 (90 Sekunden)
    const minutes = parseInt(digits[0], 10)
    const seconds = parseInt(digits.slice(1), 10)
    if (minutes >= 0 && minutes < 10 && seconds >= 0 && seconds < 60) {
      return (minutes * 60 + seconds) * 1000
    }
  }
  return null // Ungültige Eingabe
}
```

## Icon-Library
- Projekt nutzt **Lucide React**
- Clock-Icon: `import { Clock } from 'lucide-react'`

## Scope Boundaries

### INCLUDE
- Schema-Erweiterung: `lapTimeMs?: number` in `Ranking` Interface
- Placement Modal: Zeit-Eingabe nach Rang-Vergabe (Ziffern-Akkumulator + Timeout)
- Heat-Box: Zeit-Anzeige neben Rank-Badge
- Heat-Detail-Modal: Uhr-Icon + nachträgliche Zeit-Eingabe
- Tests für Zeit-Parsing und UI-Interaktionen

### EXCLUDE
- Statistiken / Auswertungen über Zeiten
- Export der Zeiten (CSV, etc.)
- Sortierung nach Zeit
- Zeitnahme-Integration (Transponder, etc.)
