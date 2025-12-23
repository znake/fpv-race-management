# Sprint Change Proposal: Heats & Bracket Tabs zusammenführen

**Datum:** 2025-12-19  
**Autor:** John (Product Manager)  
**Status:** Proposed  
**Scope:** Minor (UI Refactoring)  
**Priorität:** UX Improvement  

---

## 1. Issue Summary

### Problem Statement

Der aktuelle Tab-Wechsel zwischen "HEATS" und "BRACKET" ist unnötig und unterbricht den Workflow:

1. **Redundanz:** Die Qualifikations-Heats werden sowohl im Heats-Tab als auch im Bracket-Tab angezeigt
2. **Kontext-Verlust:** Nach Heat-Abschluss wird automatisch zum Bracket-Tab gewechselt, dann muss man wieder zurück
3. **Scroll statt Click:** Eine einzige scrollbare Seite wäre intuitiver als Tab-Wechsel

### User Feedback (Jakob)

> "Warum braucht es die Trennung? Man sieht die Heats schon in der Bracket-Qualifikationsdarstellung. Man könnte einfach runterscrollen."

### Layout-Kritik

Aktuelle Reihenfolge:
1. Qualifikation
2. Winner Bracket
3. **Grand Finale (DAZWISCHEN)**
4. Loser Bracket

**Problem:** Grand Finale zwischen Winner und Loser Bracket ist verwirrend. Es sollte am Ende stehen.

---

## 2. Proposed Solution

### A) Tabs zusammenführen

| Vorher | Nachher |
|--------|---------|
| 3 Tabs: PILOTEN / HEATS / BRACKET | 2 Tabs: PILOTEN / TURNIER |

Der neue "TURNIER"-Tab enthält:
- **Oben:** Aktiver Heat (wenn Turnier läuft) – große Piloten-Karten, Rang-Eingabe
- **Darunter:** Heats-Übersicht (alle Heats horizontal, ersetzt "Qualifikation")
- **Darunter:** Winner Bracket
- **Darunter:** Loser Bracket
- **Ganz unten:** Grand Finale

### B) Neue Sektions-Reihenfolge

```
┌─────────────────────────────────────────────────────────────────┐
│                     AKTIVER HEAT (wenn running)                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │  Pilot  │ │  Pilot  │ │  Pilot  │ │  Pilot  │  [FERTIG]    │
│  │   [1]   │ │   [2]   │ │         │ │         │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│                                                                 │
│  On-Deck: Nächster Heat – Bitte Drohnen vorbereiten            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        HEATS-ÜBERSICHT                          │
│                    (vorher "Qualifikation")                     │
│                                                                 │
│   [Heat 1]  [Heat 2]  [Heat 3]  [Heat 4]  [Heat 5]  ...        │
│                                                                 │
│  Platz 1+2 → Winner Bracket | Platz 3+4 → Loser Bracket        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      WINNER BRACKET                             │
│                                                                 │
│   WB R1        WB R2        WB Finale                           │
│   [    ]───┐                                                    │
│            ├──[    ]───┐                                        │
│   [    ]───┘           │                                        │
│                        ├──[WB Final]                            │
│   [    ]───┐           │                                        │
│            ├──[    ]───┘                                        │
│   [    ]───┘                                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      LOSER BRACKET                              │
│                                                                 │
│   LB R1        LB R2        LB R3        LB Finale              │
│   [    ]───┐                                                    │
│            ├──[    ]───┐                                        │
│   [    ]───┘           │                                        │
│                        ├──[    ]───┐                            │
│   [    ]───┐           │           │                            │
│            ├──[    ]───┘           ├──[LB Final]                │
│   [    ]───┘                       │                            │
│                        [    ]──────┘                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ★ GRAND FINALE ★                           │
│                                                                 │
│              WB Sieger vs LB Sieger                             │
│                    [FINALE]                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### C) Umbenennung

| Vorher | Nachher | Begründung |
|--------|---------|------------|
| "QUALIFIKATION" | "HEATS-ÜBERSICHT" oder "HEATS" | Nicht alle Heats sind Qualifikation (WB/LB Heats sind auch Heats) |
| Tab "BRACKET" | Tab "TURNIER" | Umfasst jetzt alles: Active Heat + Heats + Brackets |
| Tab "HEATS" | *entfernt* | In "TURNIER" integriert |

---

## 3. Changes Required

### A) App.tsx

**Änderungen:**
1. Tab-Typ von `'piloten' | 'heats' | 'bracket'` zu `'piloten' | 'turnier'`
2. Heats-Tab Content in Bracket-Tab integrieren
3. Auto-Tab-Wechsel nach Heat-Complete entfernen (nicht mehr nötig)
4. "Weiter zum nächsten Heat" Button entfernen (Scroll statt Tab-Wechsel)

```typescript
// Vorher
type Tab = 'piloten' | 'heats' | 'bracket'

// Nachher
type Tab = 'piloten' | 'turnier'
```

### B) bracket-tree.tsx

**Änderungen:**
1. `ActiveHeatView` am Anfang der Komponente einbinden (wenn `tournamentPhase === 'running'`)
2. "QUALIFIKATION" in "HEATS-ÜBERSICHT" umbenennen
3. Reihenfolge ändern: Heats → Winner → Loser → Finale
4. `GrandFinaleSection` ans Ende verschieben

```tsx
// Neue Reihenfolge in BracketTree
<div>
  {/* 0. AKTIVER HEAT (wenn Turnier läuft) */}
  {tournamentPhase === 'running' && activeHeat && (
    <ActiveHeatSection ... />
  )}
  
  {/* 1. HEATS-ÜBERSICHT (vorher Qualifikation) */}
  <HeatsOverviewSection ... />
  
  {/* 2. WINNER BRACKET */}
  <WinnerBracketSection ... />
  
  {/* 3. LOSER BRACKET */}
  <LoserBracketSection ... />
  
  {/* 4. GRAND FINALE (ganz unten) */}
  <GrandFinaleSection ... />
</div>
```

### C) Entfernen/Anpassen

| Komponente | Aktion |
|------------|--------|
| `HeatOverview` | Eventuell in BracketTree integrieren oder entfernen |
| `handleHeatComplete` Callback | Entfernen (kein Tab-Wechsel mehr nötig) |
| `showContinueToHeats` State | Entfernen |
| "Weiter zum nächsten Heat" Button | Entfernen |

---

## 4. Story Definition

### Story: Heats & Bracket Tabs zusammenführen

**Als ein** Organisator (Thomas),  
**möchte ich** alle Turnier-Informationen auf einer scrollbaren Seite sehen,  
**so dass** ich nicht zwischen Tabs wechseln muss und den Überblick behalte.

### Acceptance Criteria

#### AC 1: Zwei Tabs statt drei

**Given** die App ist geladen  
**When** ich die Navigation betrachte  
**Then** sehe ich nur zwei Tabs: "PILOTEN" und "TURNIER"

#### AC 2: Turnier-Tab Layout

**Given** ein Turnier läuft  
**When** ich den TURNIER-Tab öffne  
**Then** sehe ich von oben nach unten:
1. Aktiver Heat (große Piloten-Karten mit Rang-Eingabe)
2. On-Deck Vorschau (nächster Heat)
3. Heats-Übersicht (alle Heats horizontal)
4. Winner Bracket
5. Loser Bracket
6. Grand Finale (ganz unten)

#### AC 3: Heats-Übersicht statt Qualifikation

**Given** ich bin im TURNIER-Tab  
**When** ich die Heats-Sektion betrachte  
**Then** heißt sie "HEATS-ÜBERSICHT" (nicht "QUALIFIKATION")  
**And** enthält ALLE Heats (Quali + WB + LB), nicht nur die Qualifikations-Heats

**Alternativ:** "HEATS" als Sektion enthält nur die initialen Heats, WB/LB Heats sind in deren Sektionen

#### AC 4: Grand Finale am Ende

**Given** ich bin im TURNIER-Tab  
**When** ich nach unten scrolle  
**Then** ist das Grand Finale die letzte Sektion (nicht zwischen Winner und Loser)

#### AC 5: Kein Auto-Tab-Wechsel mehr

**Given** ich schließe einen Heat ab  
**When** ich auf "Fertig" klicke  
**Then** bleibe ich im TURNIER-Tab  
**And** die Seite scrollt automatisch zum nächsten relevanten Bereich (optional)

#### AC 6: Responsive Scrolling

**Given** das Bracket ist größer als der Viewport  
**When** ich scrolle  
**Then** kann ich vertikal durch alle Sektionen scrollen  
**And** horizontal innerhalb der Bracket-Sektionen (wenn nötig)

---

## 5. Tasks

- [ ] Task 1: Tab-Struktur anpassen (App.tsx)
  - [ ] Tab-Typ auf `'piloten' | 'turnier'` ändern
  - [ ] Heats-Tab Content entfernen
  - [ ] Tab-Label von "BRACKET" zu "TURNIER" ändern

- [ ] Task 2: BracketTree erweitern (bracket-tree.tsx)
  - [ ] `ActiveHeatView` am Anfang integrieren
  - [ ] Props erweitern: `onSubmitResults`, `tournamentPhase`
  - [ ] On-Deck Preview unterhalb ActiveHeatView einbinden

- [ ] Task 3: Sektions-Reihenfolge anpassen
  - [ ] "QUALIFIKATION" in "HEATS-ÜBERSICHT" umbenennen
  - [ ] `GrandFinaleSection` ans Ende verschieben (nach LoserBracket)

- [ ] Task 4: Auto-Tab-Wechsel entfernen
  - [ ] `handleHeatComplete` Callback entfernen/anpassen
  - [ ] `showContinueToHeats` State entfernen
  - [ ] "Weiter zum nächsten Heat" Button entfernen

- [ ] Task 5: Tests anpassen
  - [ ] Tab-Navigation Tests aktualisieren
  - [ ] Heat-Completion Flow Tests aktualisieren

---

## 6. Effort Estimate

| Task | Aufwand |
|------|---------|
| Task 1: Tab-Struktur | 1h |
| Task 2: BracketTree erweitern | 2h |
| Task 3: Reihenfolge anpassen | 30min |
| Task 4: Auto-Tab-Wechsel entfernen | 30min |
| Task 5: Tests anpassen | 1h |
| **Gesamt** | **~5h (halber Tag)** |

---

## 7. Impact Analysis

### Positive Auswirkungen

| Aspekt | Verbesserung |
|--------|-------------|
| **Thomas (Orga)** | Weniger Klicks, besserer Überblick |
| **Beamer-Projektion** | Eine Seite zeigt alles |
| **Lernkurve** | Einfachere Navigation |
| **Code** | Weniger State-Management für Tab-Wechsel |

### Breaking Changes

| Bereich | Impact | Mitigation |
|---------|--------|------------|
| Tab-Namen | "BRACKET" → "TURNIER" | Minimaler UX Impact |
| Auto-Navigation | Entfernt | Scroll statt Tab-Wechsel |
| Tests | Einige Tests müssen angepasst werden | Teil der Story |

### Keine Änderungen an

- Bracket-Logik (`bracket-logic.ts`)
- Bracket-Struktur (`bracket-structure-generator.ts`)
- Store (`tournamentStore.ts`)
- Heat-Completion Flow (nur UI-Trigger ändert sich)

---

## 8. Mockup

```
┌──────────────────────────────────────────────────────────────────────────┐
│  🏁 FPV RACING HEATS                                    [Alles löschen] │
├──────────────────────────────────────────────────────────────────────────┤
│                         TURNIER LÄUFT                                    │
├──────────────────────────────────────────────────────────────────────────┤
│   [ PILOTEN ]     [ TURNIER ]                                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ╔══════════════════════════════════════════════════════════════════╗   │
│  ║                         HEAT 5                                    ║   │
│  ║                                                                   ║   │
│  ║   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            ║   │
│  ║   │   [1]   │  │   [2]   │  │         │  │         │            ║   │
│  ║   │  🖼️ Anna │  │  🖼️ Ben  │  │ 🖼️ Chris│  │ 🖼️ Dana │            ║   │
│  ║   └─────────┘  └─────────┘  └─────────┘  └─────────┘            ║   │
│  ║                                                                   ║   │
│  ║                        [ FERTIG ✓ ]                              ║   │
│  ║                                                                   ║   │
│  ║   ─────────────────────────────────────────────────────────────  ║   │
│  ║   NÄCHSTER HEAT: Erik, Flo, Gina, Hans – Bitte Drohnen vorbereiten║   │
│  ╚══════════════════════════════════════════════════════════════════╝   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      HEATS-ÜBERSICHT                              │   │
│  │                                                                    │   │
│  │  [Heat 1 ✓] [Heat 2 ✓] [Heat 3 ✓] [Heat 4 ✓] [Heat 5 ●] [Heat 6] │   │
│  │                                                                    │   │
│  │  Platz 1+2 → Winner Bracket | Platz 3+4 → Loser Bracket          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      WINNER BRACKET                               │   │
│  │  ...                                                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      LOSER BRACKET                                │   │
│  │  ...                                                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     ★ GRAND FINALE ★                              │   │
│  │                                                                    │   │
│  │                      [Wartet...]                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Approval

- [ ] **Jakob** - Product Owner Approval
- [ ] **Story erstellen** - In `docs/sprint-artifacts/` als neue Story
- [ ] **Dev Handoff** - Implementierung starten

---

## 10. Open Questions

1. **Heats-Übersicht Scope:** Soll die Heats-Übersicht NUR die initialen Heats zeigen, oder ALLE Heats (inkl. WB/LB Heats)?
   - **Empfehlung:** Nur initiale Heats (WB/LB Heats sind ja in deren Sektionen)

2. **Auto-Scroll nach Heat-Completion:** Soll nach "Fertig" automatisch zum nächsten aktiven Heat gescrollt werden?
   - **Empfehlung:** Ja, sanfter Scroll zum ActiveHeatView

3. **Mobile Breakpoint:** Wie verhält sich das Layout auf kleineren Screens?
   - **Empfehlung:** Post-MVP, da Beamer-Fokus (1920x1080)
