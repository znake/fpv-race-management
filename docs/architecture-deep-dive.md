# Architektur Deep-Dive

**Generiert:** 2026-01-19
**Version:** Phase 4 (Post-Refactoring)
**Projekt:** FPV Racing Heats Manager

---

## Executive Summary

FPV Racing Heats ist eine Client-only React-Applikation für Double-Elimination Turniere. Die Architektur basiert auf einem zentralen Zustand-Store mit `heats[]` als Single Source of Truth - alle Bracket-Strukturen werden dynamisch berechnet.

**Architektur-Stil:** Component-Based SPA mit zentralem State Management
**Daten-Persistenz:** localStorage (Browser-basiert)
**Deployment:** Static Files (kein Backend erforderlich)

---

## Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Browser                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                        App.tsx                                │   │
│  │  ┌──────────────┐  ┌──────────────────────────────────────┐  │   │
│  │  │  Piloten-Tab │  │           Turnier-Tab                 │  │   │
│  │  ├──────────────┤  ├──────────────────────────────────────┤  │   │
│  │  │ PilotCard[]  │  │  HeatAssignmentView (Phase 1)        │  │   │
│  │  │ AddPilotForm │  │  BracketTree (Phase 2+)              │  │   │
│  │  │ CSVImport    │  │    ├── QualiSection                  │  │   │
│  │  └──────────────┘  │    ├── WinnerBracketSection          │  │   │
│  │                    │    ├── LoserBracketSection           │  │   │
│  │                    │    ├── GrandFinaleSection            │  │   │
│  │                    │    └── ActiveHeatView                │  │   │
│  │                    └──────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                  │                                   │
│                                  ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Hooks & State Layer                        │   │
│  │  ┌─────────────┐  ┌─────────────────────────────────────┐   │   │
│  │  │ usePilots() │  │      useTournamentStore()           │   │   │
│  │  │  Validation │  │  ┌─────────────────────────────┐    │   │   │
│  │  │  Optimistic │  │  │     heats[] (SoT)           │    │   │   │
│  │  └─────────────┘  │  │  ┌────┐ ┌────┐ ┌────┐       │    │   │   │
│  │                   │  │  │ Q1 │ │ Q2 │ │ WB │ ...   │    │   │   │
│  │                   │  │  └────┘ └────┘ └────┘       │    │   │   │
│  │                   │  └─────────────────────────────┘    │   │   │
│  │                   └─────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                  │                                   │
│                                  ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     localStorage                              │   │
│  │               tournament-storage (JSON)                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Kern-Architekturentscheidungen

### ADR-001: heats[] als Single Source of Truth

**Status:** Implementiert (Phase 4)

**Kontext:** Ursprünglich wurde eine separate `fullBracketStructure` für die Bracket-Visualisierung verwendet. Dies führte zu Synchronisationsproblemen und erhöhter Komplexität.

**Entscheidung:** `heats[]` Array ist die einzige Datenquelle. Alle Bracket-Informationen (WB, LB, Quali, Finale) werden dynamisch aus `heat.bracketType` berechnet.

**Konsequenzen:**
- (+) Einfachere Datenstruktur
- (+) Keine Sync-Probleme zwischen heats[] und fullBracketStructure
- (+) Leichtere Testbarkeit
- (-) Jede Render-Berechnung muss heats[] filtern

### ADR-002: Pool-basierte Heat-Generierung

**Status:** Implementiert (Phase 4)

**Kontext:** Statt einer vordefinierten Bracket-Struktur werden Heats dynamisch basierend auf Pools generiert.

**Entscheidung:**
- `winnerPilots[]` - Piloten im Winner Bracket
- `loserPool[]` - Piloten im Loser Bracket Pool
- Heats werden on-demand generiert wenn >= 4 Piloten im Pool sind

**Konsequenzen:**
- (+) Flexibles System für variable Pilotenzahlen (7-60)
- (+) Natürliche FIFO-Reihenfolge
- (-) Komplexere `submitHeatResults()` Logik

### ADR-003: Zustand mit localStorage Persistenz

**Status:** Implementiert

**Kontext:** Kein Backend vorhanden. Turnier-Daten müssen Browser-Sessions überleben.

**Entscheidung:** Zustand Store mit `persist` Middleware für localStorage.

**Konsequenzen:**
- (+) Zero-Backend-Architektur
- (+) Offline-fähig
- (+) Schnelle Persistenz
- (-) Daten nur im Browser verfügbar
- (-) localStorage-Limit (~5MB)

---

## Datenmodell

### Tournament State

```typescript
interface TournamentState {
  // Piloten
  pilots: Pilot[]

  // Tournament Status
  tournamentStarted: boolean
  tournamentPhase: 'setup' | 'heat-assignment' | 'running' | 'finale' | 'completed'

  // Heats (Single Source of Truth)
  heats: Heat[]
  currentHeatIndex: number

  // Bracket Tracking
  winnerPilots: string[]      // Im WB aktive Piloten
  loserPilots: string[]       // Im LB aktive Piloten
  eliminatedPilots: string[]  // Ausgeschiedene Piloten
  loserPool: string[]         // Pool für LB-Heat-Generierung

  // Phase Flags
  isQualificationComplete: boolean
  isWBFinaleComplete: boolean
  isLBFinaleComplete: boolean
  isGrandFinaleComplete: boolean

  // Synchronisation (Story 13-2)
  currentWBRound: number
  currentLBRound: number
  lbRoundWaitingForWB: boolean
}
```

### Heat Interface

```typescript
interface Heat {
  id: string
  heatNumber: number
  pilotIds: string[]
  status: 'pending' | 'active' | 'completed'
  bracketType?: 'qualification' | 'winner' | 'loser' | 'grand_finale' | 'finale'
  isFinale?: boolean
  roundName?: string
  results?: {
    rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]
    completedAt: string
  }
  roundNumber?: number
}
```

---

## Komponenten-Architektur

### Schichten

```
┌─────────────────────────────────────────────────────────┐
│                    Page Components                       │
│  App.tsx (Tab-Navigation, Dialoge)                      │
├─────────────────────────────────────────────────────────┤
│                   Feature Components                     │
│  BracketTree, HeatAssignmentView, VictoryCeremony       │
├─────────────────────────────────────────────────────────┤
│                   Section Components                     │
│  QualiSection, WinnerBracketSection, LoserBracketSection │
├─────────────────────────────────────────────────────────┤
│                      UI Components                       │
│  HeatCard, PilotCard, Button, Dialog, Input, Card       │
└─────────────────────────────────────────────────────────┘
```

### Komponenten-Verantwortlichkeiten

| Komponente | Verantwortlichkeit |
|------------|-------------------|
| `BracketTree` | Haupt-Bracket-Container, Zoom/Pan, Heat-Modal-Koordination |
| `QualiSection` | Rendering der Qualifikations-Heats |
| `WinnerBracketSection` | WB-Heats + WB-Finale |
| `LoserBracketSection` | LB-Heats + LB-Finale |
| `GrandFinaleSection` | Grand Finale + WB/LB Tags |
| `ActiveHeatView` | Ergebniseingabe für aktiven Heat |
| `HeatCard` | Einzelner Heat mit Piloten und Status |

---

## Business-Logik

### Double-Elimination Flow

```
                    ┌─────────────┐
                    │ Quali Heats │
                    │  (N Heats)  │
                    └─────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
      ┌───────────┐              ┌───────────┐
      │ Platz 1+2 │              │ Platz 3+4 │
      │  → WB     │              │  → LB     │
      └───────────┘              └───────────┘
            │                           │
            ▼                           ▼
      ┌───────────┐              ┌───────────┐
      │ WB Heats  │              │ LB Heats  │
      │ (4er)     │──Verlierer──▶│ (4er)     │
      └───────────┘              └───────────┘
            │                           │
            ▼                           ▼
      ┌───────────┐              ┌───────────┐
      │ WB Finale │              │ LB Finale │
      │ (2-3 P.)  │──Verlierer──▶│ (2-3 P.)  │
      └───────────┘              └───────────┘
            │                           │
            └───────────┬───────────────┘
                        ▼
                 ┌─────────────┐
                 │ Grand Finale│
                 │ (4 Piloten) │
                 └─────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ Siegerehrung│
                 │ (Top 4)     │
                 └─────────────┘
```

### Heat-Generierung (submitHeatResults)

Die `submitHeatResults()` Funktion ist das Herzstück der Business-Logik (~340 Zeilen):

1. **Heat als completed markieren**
2. **Piloten klassifizieren** basierend auf bracketType:
   - Quali: Platz 1+2 → winnerPool, Platz 3+4 → loserPool
   - WB: Platz 1+2 → bleiben in winnerPool, Platz 3+4 → loserPool
   - LB: Platz 1+2 → bleiben in loserPool, Platz 3+4 → eliminiert
3. **Dynamische Heat-Generierung**:
   - WB-Heat wenn winnerPool >= 4
   - WB-Finale wenn winnerPool 2-3 und keine pending WB-Heats
   - LB-Heat wenn loserPool >= 4
   - LB-Finale wenn WB-Finale completed und loserPool 2-3
   - Grand Finale wenn WB+LB Finale completed
4. **Nächsten Heat aktivieren**

---

## Performance-Überlegungen

### Optimierungen

| Bereich | Technik |
|---------|---------|
| **Rendering** | React.memo auf HeatCard, useMemo für gefilterte Heats |
| **Store** | Zustand Selector-Pattern verhindert unnötige Re-Renders |
| **Layout** | CSS Grid für Bracket-Layout (kein JS-Layout) |
| **SVG** | Connector-Lines werden nur bei Änderungen neu berechnet |

### Bekannte Limitierungen

- localStorage-Limit: ~5MB (ausreichend für 60 Piloten + alle Heats)
- Keine Server-Sync (Daten nur lokal)
- Kein Undo/Redo (nur Heat-Reopen)

---

## Test-Strategie

### Test-Pyramide

```
         ┌─────────┐
         │   E2E   │  (geplant: Playwright)
         │ (manual)│
        ┌┴─────────┴┐
        │Integration│  Vitest + Testing Library
        │   Tests   │  (17 Test-Dateien)
       ┌┴───────────┴┐
       │  Unit Tests │  Business-Logic Tests
       │             │  (bracket-logic, heat-completion)
       └─────────────┘
```

### Test-Kategorien

| Kategorie | Dateien | Fokus |
|-----------|---------|-------|
| **Komponenten** | pilot-card, csv-import, heat-results | UI-Verhalten |
| **Integration** | tournament-start, heat-assignment | User Flows |
| **Business-Logik** | loser-pool, lb-heat-generation, grand-finale | Bracket-Algorithmen |
| **Edge Cases** | eight-pilots-flow | Spezialfälle |

---

## Erweiterbarkeit

### Geplante Erweiterungen

1. **Server-Sync** - StorageAdapter für API-Backend
2. **Multi-Device** - Real-time Sync via WebSocket
3. **Export** - Turnier-Ergebnisse als PDF/CSV

### Extension Points

| Punkt | Beschreibung |
|-------|--------------|
| `StorageAdapter` | Interface für alternative Persistenz |
| `bracketType` | Erweiterbar für andere Turnier-Modi |
| `HeatCard` | Slot-Pattern für Custom-Rendering |

---

## Sicherheit

### Client-Side Considerations

- **Keine sensiblen Daten** - Nur Piloten-Namen und Bild-URLs
- **localStorage** - Benutzer-kontrolliert, kein Server-Zugriff
- **Zod Validation** - Input-Sanitierung für alle User-Eingaben
- **CSP** - Standard Vite-CSP für Inline-Styles

### Daten-Integrität

- Store-Reset-Funktionen mit Confirmation-Dialogen
- Heat-Reopen statt Delete (Audit-Trail)
- localStorage-Key: `tournament-storage` (überschreibbar bei Reset)
