# Story 4.4: Platzierungsanzeige & Sortierung nach Heat-Abschluss

Status: done

## Story

**Als ein** Zuschauer, Pilot oder Organisator (Lisa, Familie Huber, Thomas),
**möchte ich** in der Heat-Übersicht, im Winner-Bracket und im Loser-Bracket sofort sehen, wer welchen Platz (1, 2, 3, 4) erreicht hat,
**so dass** ich mich ein Bild davon machen kann, wer wann und wo gewonnen hat, ohne in einzelne Heats klicken zu müssen.

## Acceptance Criteria

### AC 1: Platzierungsanzeige in Heat-Übersicht

**Given** ein Heat wurde abgeschlossen (status='completed')
**When** ich die Heat-Übersicht betrachte
**Then** zeigt jeder Pilot im Heat seine Platzierung als RankBadge (1, 2, 3, 4)
**And** die Piloten sind von oben nach unten nach Platzierung sortiert (Platz 1 ganz oben)
**And** die RankBadges haben die korrekten Farben:
  - Platz 1: Gold mit Glow
  - Platz 2: Silber/Cyan mit Glow
  - Platz 3: Bronze/Pink mit Glow
  - Platz 4: Cyan/Pink mit Glow

### AC 2: Platzierungsanzeige im Winner-Bracket

**Given** ein Heat im Winner-Bracket wurde abgeschlossen
**When** ich den Bracket-Tab betrachte
**Then** zeigt jeder Pilot in der BracketHeatBox seine Platzierung als RankBadge
**And** die Piloten sind von oben nach unten nach Platzierung sortiert (Platz 1 ganz oben)
**And** die Platzierung ist gut lesbar (mindestens 20px Schriftgröße)

### AC 3: Platzierungsanzeige im Loser-Bracket

**Given** ein Heat im Loser-Bracket wurde abgeschlossen
**When** ich den Bracket-Tab betrachte
**Then** zeigt jeder Pilot in der BracketHeatBox seine Platzierung als RankBadge
**And** die Piloten sind von oben nach unten nach Platzierung sortiert (Platz 1 ganz oben)
**And** die Platzierung ist gut lesbar (mindestens 20px Schriftgröße)

### AC 4: Keine Platzierungen bei pending/active Heats

**Given** ein Heat hat den Status 'pending' oder 'active'
**When** ich den Heat betrachte
**Then** werden keine Platzierungs-RankBadges angezeigt
**And** die Piloten werden in der ursprünglichen Reihenfolge angezeigt

### AC 5: Beamer-Optimierung

**Given** die Ansicht wird auf einem Beamer projiziert (1920x1080)
**When** ein Heat abgeschlossen ist
**Then** sind die Platzierungen aus 10m Entfernung gut lesbar
**And** die RankBadges haben ausreichend Kontrast zum Hintergrund
**And** die Sortierung ist visuell sofort erkennbar

## Tasks / Subtasks

- [x] Task 1: Heat-Übersicht Sortierung implementieren (AC: 1)
  - [x] PilotCard-Komponente erweitern: `showRank`-Prop hinzufügen
  - [x] HeatBox Komponente: Piloten nach Platzierung sortieren
  - [x] Sortierlogik: `results.rankings` Array nach Rang sortieren
  - [x] Fallback: Wenn keine Ergebnisse vorhanden, ursprüngliche Reihenfolge behalten

- [x] Task 2: Winner-Bracket Sortierung implementieren (AC: 2)
  - [x] BracketHeatBox Komponente: Piloten nach Platzierung sortieren
  - [x] RankBadges mit korrekter Größe und Position
  - [x] Heat-specific Styling für Winner-Bracket (Grün-Akzente)

- [x] Task 3: Loser-Bracket Sortierung implementieren (AC: 3)
  - [x] BracketHeatBox Komponente: Piloten nach Platzierung sortieren
  - [x] RankBadges mit korrekter Größe und Position
  - [x] Heat-specific Styling für Loser-Bracket (Rot/Pink-Akzente)

- [x] Task 4: Keine Platzierungen bei pending/active (AC: 4)
  - [x] Conditional Rendering: RankBadges nur bei status='completed'
  - [x] Ursprüngliche Reihenfolge für pending/active Heats

- [x] Task 5: Beamer-Optimierung (AC: 5)
  - [x] RankBadge Größe: Mindestens 24px für Beamer-Lesbarkeit (implementiert: 32px)
  - [x] Kontrast-Check: Gold/Silber/Bronze auf dunklem Hintergrund
  - [x] Visueller Test auf 1920x1080 Auflösung

- [x] Task 6: Unit-Tests (AC: 1-5)
  - [x] Test: Piloten in Heat-Übersicht nach Platzierung sortiert
  - [x] Test: RankBadges werden nur bei completed Heats angezeigt
  - [x] Test: Winner-Bracket zeigt korrekte Platzierungen
  - [x] Test: Loser-Bracket zeigt korrekte Platzierungen
  - [x] Test: Pending/Active Heats zeigen keine Platzierungen

## Dev Notes

### Datenmodell-Erweiterung

```typescript
// Heat Interface bereits in US-4.1/4.2 erweitert
interface Heat {
  id: string
  heatNumber: number
  pilotIds: string[]
  status: 'pending' | 'active' | 'completed'

  // Wird bei Heat-Abschluss befüllt (US-4.2)
  results?: {
    rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]
    completedAt?: string
  }
}
```

### Sortier-Logik

```typescript
// Sortiert Piloten nach Platzierung (1, 2, 3, 4)
const sortPilotsByRank = (
  pilotIds: string[],
  results?: Heat['results']
): string[] => {
  if (!results || !results.rankings) {
    return pilotIds // Ursprüngliche Reihenfolge
  }

  const rankingMap = new Map<string, number>()
  results.rankings.forEach(r => rankingMap.set(r.pilotId, r.rank))

  // Sortieren: Piloten mit Rang zuerst (1, 2, 3, 4), dann Piloten ohne Rang
  return [...pilotIds].sort((a, b) => {
    const rankA = rankingMap.get(a) ?? 99
    const rankB = rankingMap.get(b) ?? 99
    return rankA - rankB
  })
}
```

### PilotCard-Erweiterung

```typescript
// src/components/pilot-card.tsx
interface PilotCardProps {
  pilot: Pilot
  rank?: number | null  // Bereits vorhanden aus US-4.1
  showRank?: boolean    // NEU: Optional anzeigen
  size?: 'small' | 'medium' | 'large'  // NEU: Für Bracket vs Heat-Übersicht
}

// RankBadge Anzeige (bereits implementiert in US-4.1)
{showRank && rank && (
  <div className={`
    absolute -top-2 -right-2
    ${size === 'large' ? 'w-12 h-12' : 'w-8 h-8'}
    rounded-full flex items-center justify-center
    font-display font-bold text-void
    rank-badge-animate
    ${rank === 1 ? 'bg-gold shadow-glow-gold' : ''}
    ${rank === 2 ? 'bg-silver/90' : ''}
    ${rank === 3 ? 'bg-bronze/90' : ''}
    ${rank === 4 ? 'bg-neon-cyan' : ''}
  `}>
    {rank}
  </div>
)}
```

### HeatBox-Sortierung

```typescript
// src/components/heat-box.tsx oder heat-card.tsx
const sortedPilotIds = useMemo(() => {
  if (heat.status !== 'completed' || !heat.results?.rankings) {
    return heat.pilotIds // Ursprüngliche Reihenfolge
  }

  return sortPilotsByRank(heat.pilotIds, heat.results)
}, [heat.status, heat.results, heat.pilotIds])

// Render Piloten
{sortedPilotIds.map(pilotId => (
  <PilotCard
    key={pilotId}
    pilot={pilots.find(p => p.id === pilotId)!}
    rank={getPilotRank(pilotId, heat)}
    showRank={heat.status === 'completed'}
    size={size}
  />
))}
```

### BracketHeatBox-Anpassung

```typescript
// src/components/bracket-tree.tsx - BracketHeatBox
// Bereits implementiert: Piloten anzeigen mit pilotIds
// NEU: Sortierung und RankBadge-Anzeige

const { pilots } = useTournamentStore()
const heat = heats.find(h => h.id === bracketHeat.id)

const sortedPilotIds = useMemo(() => {
  if (!heat || heat.status !== 'completed' || !heat.results?.rankings) {
    return bracketHeat.pilotIds // Ursprüngliche Reihenfolge
  }

  return sortPilotsByRank(bracketHeat.pilotIds, heat.results)
}, [heat, bracketHeat.pilotIds])
```

### RankBadge-Farben (aus US-4.1 übernehmen)

```css
/* src/globals.css */
.rank-badge-animate {
  animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.bg-gold { background-color: #f9c80e; }
.bg-silver { background-color: #c0c0c0; }
.bg-bronze { background-color: #cd7f32; }

.shadow-glow-gold { box-shadow: 0 0 20px rgba(249, 200, 14, 0.6); }
.shadow-glow-cyan { box-shadow: 0 0 20px rgba(5, 217, 232, 0.6); }
.shadow-glow-pink { box-shadow: 0 0 20px rgba(226, 13, 131, 0.6); }
```

### NFR-Compliance

| NFR | Anforderung | Umsetzung |
|-----|-------------|-----------|
| NFR14 | Beamer-Lesbarkeit aus 10m | RankBadges ≥ 24px, hoher Kontrast |
| NFR3 | Sortierung < 100ms | useMemo für Sortierung |
| NFR10 | Daten-Korrektheit | Unit-Tests für alle Sortier-Szenarien |

### Edge Cases

| Case | Handling |
|------|----------|
| 3er-Heat (nur Rang 1-3) | Nur Platz 1-3 angezeigt, Platz 4 nicht |
| Pilot ohne Ranking | Ganz unten in der Liste (rank=99) |
| Edit nach Heat-Abschluss | Sortierung aktualisiert sich sofort |
| Browser-Refresh | Platzierungen aus localStorage geladen |

### Bestehende Komponenten

| Komponente | Status | Anpassung für US-4.4 |
|------------|--------|---------------------|
| `PilotCard` | ✅ Existiert | `showRank`-Prop optional |
| `HeatBox` | ✅ Existiert | Sortierung nach Rang |
| `HeatCard` | ✅ Existiert | Sortierung nach Rang |
| `BracketHeatBox` | ✅ Existiert | Sortierung nach Rang |
| `bracket-tree.tsx` | ✅ Existiert | BracketHeatBox erweitern |

### UI-Layout Konzept

```
HEAT-ÜBERSICHT (Nach Abschluss):
┌─────────────────────────────────┐
│           HEAT 5 ✓              │
├─────────────────────────────────┤
│  [1]  ANNA   @anna_fpv          │  ← Platz 1 (Gold)
│  [2]  BEN    @ben_fpv           │  ← Platz 2 (Silber)
│  [3]  CHRIS  @chris_fpv         │  ← Platz 3 (Bronze)
│  [4]  DANA   @dana_fpv          │  ← Platz 4 (Cyan)
└─────────────────────────────────┘

WINNER BRACKET:
┌─────────────────────────────────┐
│         WB-3 (Runde 2)          │
├─────────────────────────────────┤
│  [1]  ERIK   @erik_fpv          │  ← Platz 1 (Gold)
│  [2]  FLO    @flo_fpv           │  ← Platz 2 (Silber)
│  [3]  GINA   @gina_fpv          │  ← Platz 3 (Bronze)
│  [4]  HANS   @hans_fpv          │  ← Platz 4 (Cyan)
└─────────────────────────────────┘
```

### References

- [Source: docs/prd.md#FR12] - Gewinner durch sequentielles Anklicken auswählen (Basis für Rankings)
- [Source: docs/sprints/user-stories/epic-4/4-1-heat-ergebnis-eingeben.md] - RankBadge Implementierung
- [Source: docs/sprints/user-stories/epic-4/4-2-heat-abschliessen.md] - Heat.results Struktur
- [Source: docs/ux-design-specification.md#PilotCard] - RankBadge Anatomie
- [Source: src/components/pilot-card.tsx] - Bestehende PilotCard mit Rank-Prop

## Definition of Done

### Funktional
- [x] Platzierungen (1, 2, 3, 4) werden in Heat-Übersicht angezeigt
- [x] Platzierungen werden in Winner-Bracket angezeigt
- [x] Platzierungen werden in Loser-Bracket angezeigt
- [x] Piloten sind nach Platzierung sortiert (1 oben, 4 unten)
- [x] Keine Platzierungen bei pending/active Heats
- [x] Sortierung aktualisiert sich nach Edit/Resubmit

### UI/Design
- [x] RankBadges haben korrekte Farben (Gold/Silber/Bronze/Cyan)
- [x] RankBadges haben Glow-Effekt
- [x] RankBadges sind aus 10m lesbar (≥ 24px, implementiert: 32px)
- [x] Synthwave-Styling durchgängig

### Tests
- [x] Unit-Test: Piloten in Heat-Übersicht nach Platzierung sortiert
- [x] Unit-Test: RankBadges werden nur bei completed Heats angezeigt
- [x] Unit-Test: Winner-Bracket zeigt korrekte Platzierungen
- [x] Unit-Test: Loser-Bracket zeigt korrekte Platzierungen
- [x] Unit-Test: Pending/Active Heats zeigen keine Platzierungen
- [x] Edge Case: 3er-Heat (nur Platz 1-3)

### Qualität
- [x] Keine TypeScript-Fehler
- [x] Keine Console-Errors
- [x] Beamer-tauglich (1920x1080, 10m Lesbarkeit)
- [x] NFR3 erfüllt (< 100ms Sortierung mit useMemo)
- [x] Code-Review bestanden

## Dependencies

- [ ] US-4.1: Heat-Ergebnis eingeben (DONE) - RankBadge Implementierung
- [ ] US-4.2: Heat abschließen & Bracket-Progression (DONE) - Heat.results Struktur
- [ ] US-4.3: Bracket-Visualisierung (DONE) - BracketHeatBox Struktur

## Dev Agent Record

### Context Reference
- Story 4-4 done
- Vierte Story im Epic 4 (Heat-Durchführung & Bracket)
- Erweitert bestehende US-4.1/4.2/4.3 Funktionalität

### Agent Model Used
Claude Sonnet 4 (Dev Agent)

### Implementation Summary
- Implementiert: 2025-12-23
- Epic: Epic 4 - Heat-Durchführung & Bracket
- Status: done
- Dependencies: US-4.1, US-4.2, US-4.3 (alle DONE)
- Story-Nummer: US-4.4

### Files Modified
1. `src/lib/utils.ts`:
   - Added `sortPilotsByRank()` function for sorting pilots by rank
   - Added `getPilotRank()` function for getting pilot rank from heat results

2. `src/components/pilot-card.tsx`:
   - Added `showRank` prop (optional, default true for backward compatibility)
   - Added `size` prop (small/medium/large) for different badge sizes
   - Updated RankBadge rendering to use `showRank` conditional

3. `src/components/heat-box.tsx`:
   - Implemented pilot sorting by rank using `useMemo` for performance
   - Uses `sortPilotsByRank()` for completed heats
   - Fallback to original order for pending/active heats
   - Updated position display to show "Platz X" for completed heats

4. `src/components/bracket-tree.tsx`:
   - Updated `BracketHeatBox` to sort pilots by rank for completed heats
   - Updated `FilledBracketHeatBox` to sort pilots by rank and show rank badges
   - Pass `actualHeat` to `FilledBracketHeatBox` for results access
   - Show rank badges in Winner-Bracket and Loser-Bracket heats

5. `tests/platzierungsanzeige-sortierung.test.ts`:
   - Created 15 comprehensive unit tests covering all ACs
   - Tests for sorting logic, rank display, conditional rendering, edge cases

### Tests Created
- `tests/platzierungsanzeige-sortierung.test.ts` (15 tests):
  - Task 1: Heat-Übersicht Sortierung (6 tests)
  - Task 2 & 3: Winner/Loser Bracket Sortierung (1 test)
  - Task 4: Keine Platzierungen bei pending/active (3 tests)
  - Edge Cases (3 tests)
  - Beamer-Optimierung (1 test)

### Decisions Made
1. RankBadges always use `text-beamer-rank` (32px) for Beamer readability (AC5)
2. Badge sizes: `w-14 h-14` (large) for finale, `w-12 h-12` (default) for brackets
3. Sorting implemented with `useMemo` for performance (NFR3 < 100ms)
4. Backward compatible: `showRank` defaults to `true` to not break existing usage
