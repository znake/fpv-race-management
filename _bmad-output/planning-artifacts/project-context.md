# FPV Racing Heats - Projekt-Kontext Dokumentation

**Datum:** 2026-01-22  
**Autor:** Paige (Technical Writer)  
**Projekt:** FPV Racing Heats - Turnier-Management-App  
**Status:** Feature-Complete MVP

---

## Executive Summary

**FPV Racing Heats** ist eine browserbasierte Single-Page-Application für die Verwaltung von FPV-Drohnen-Turnieren mit Double-Elimination-Format. Die App ist als "digitale Magnettafel" konzipiert und ermöglicht es Organisatoren, Piloten zu verwalten, Heats durchzuführen und Brackets zu visualisieren - alles ohne Server, Accounts oder Einarbeitung.

### Aktueller Status

Die App ist **Feature-Complete** und umfasst:
- Vollständige Pilotenverwaltung mit CSV-Import
- Double-Elimination-Bracket mit dynamischer Heat-Generierung
- Winner Bracket, Loser Bracket und Grand Finale
- Rematch-Logik für faire Finalrunden
- Drag & Drop Heat-Zuweisung
- Export/Import von Turnierdaten (JSON/CSV)
- Synthwave-Design optimiert für Beamer-Präsentation

---

## Projekt-Klassifikation

| Eigenschaft | Wert |
|-------------|------|
| **Projekt-Typ** | Web Application (SPA) |
| **Domain** | Community/Event-Tool |
| **Komplexität** | Medium |
| **Projekt-Kontext** | Greenfield (Feature-Complete) |
| **Zielgruppe** | FPV Oberösterreich (Orga-Team, Piloten, Zuschauer) |
| **Technologie-Stack** | React 18 + TypeScript + Vite + Tailwind CSS + Zustand |

---

## Technische Architektur

### Core Stack

| Kategorie | Technologie | Version |
|-----------|-------------|---------|
| **Frontend Framework** | React | 18.3.1 |
| **Sprache** | TypeScript | 5.5.4 |
| **Build Tool** | Vite | 5.4.8 |
| **Styling** | Tailwind CSS | 3.4.14 |
| **State Management** | Zustand | 4.5.5 |
| **Form Handling** | React Hook Form + Zod | 7.52.2 / 3.23.8 |
| **Drag & Drop** | @dnd-kit | 6.3.1 |
| **CSV Parsing** | PapaParse | 5.5.3 |
| **Testing** | Vitest + Testing Library | 2.1.4 |

### Architektur-Muster

- **SPA-Architektur:** Client-side Rendering ohne Backend
- **Offline-First:** localStorage für Datenpersistenz
- **Single Source of Truth:** `heats[]` Array als einzige Datenquelle
- **Pool-basierte Heat-Generierung:** Dynamische WB/LB-Heats on-demand
- **Component-Based:** Modulare React-Komponenten mit Custom Hooks

### Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
├─────────────────────────────────────────────────────────────┤
│  App.tsx                                                     │
│  ├── Header + AppFooter (Export/Import)                      │
│  ├── Piloten-Tab                                            │
│  │   ├── PilotCard[]                                        │
│  │   ├── AddPilotForm                                       │
│  │   └── CSVImport                                          │
│  └── Turnier-Tab                                            │
│      ├── HeatAssignmentView (Drag & Drop)                   │
│      └── BracketTree                                        │
│          ├── QualiSection                                   │
│          ├── WinnerBracketSection                           │
│          ├── LoserBracketSection                            │
│          ├── GrandFinaleSection                             │
│          ├── PlacementEntryModal                            │
│          └── VictoryCeremony                                │
├─────────────────────────────────────────────────────────────┤
│  tournamentStore (Zustand)                                   │
│  ├── pilots[]                                               │
│  ├── heats[] (Single Source of Truth)                       │
│  ├── winnerPilots[] / loserPool[]                           │
│  └── Phase Flags                                            │
├─────────────────────────────────────────────────────────────┤
│  localStorage (tournament-storage)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementierte Features

### Piloten-Verwaltung

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| Manuelles Hinzufügen | ✅ | Name, Bild-URL, Instagram (optional) |
| CSV-Import | ✅ | Drag & Drop, Vorlage downloadbar |
| Bearbeiten/Löschen | ✅ | Vor Turnierstart |
| Duplikaterkennung | ✅ | Case-insensitive Warnung |
| Dropped Out | ✅ | Piloten während Turnier markieren |
| 7-60 Piloten | ✅ | Validierte Grenzen |

### Turnier-Durchführung

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| Automatische Heat-Aufteilung | ✅ | 3er/4er Heats optimiert |
| Drag & Drop Zuweisung | ✅ | Piloten zwischen Heats verschieben |
| Shuffle-Funktion | ✅ | Zufällige Neuverteilung |
| Double-Elimination | ✅ | Winner + Loser Bracket |
| Pool-basierte Generierung | ✅ | Heats on-demand erstellt |
| WB/LB Synchronisation | ✅ | Faire Reihenfolge garantiert |

### Bracket-Visualisierung

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| Interaktives Bracket | ✅ | Zoom & Pan |
| Farbcodierung | ✅ | Cyan/Grün/Rot/Gold für Phasen |
| Animierter Rahmen | ✅ | Orange Border für aktiven Heat |
| SVG Connector Lines | ✅ | Visuelle Verbindungen |
| Inline-Platzierungseingabe | ✅ | Click-to-Rank im Modal |

### Finale

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| Grand Finale | ✅ | 4 Finalisten (WB Top 2 + LB Top 2) |
| Rematch-Logik | ✅ | Bei LB-Sieg gegen WB-Champion |
| Siegerehrung | ✅ | Podium mit Top 4 |
| CSV-Export | ✅ | Ergebnisse exportierbar |

### Export/Import

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| JSON-Export | ✅ | Kompletter Turnier-State |
| CSV-Export | ✅ | Piloten + Ergebnisse |
| JSON-Import | ✅ | Mit Bestätigungsdialog |

---

## Datenmodelle

### Pilot Interface

```typescript
interface Pilot {
  id: string
  name: string
  imageUrl: string
  instagramHandle?: string
  status?: 'active' | 'withdrawn'
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
  roundNumber?: number
  roundName?: string
  results?: {
    rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]
    completedAt: string
  }
  isRematch?: boolean
}
```

### Tournament State (Auszug)

```typescript
interface TournamentState {
  pilots: Pilot[]
  heats: Heat[]  // Single Source of Truth
  tournamentPhase: 'setup' | 'heat-assignment' | 'running' | 'finale' | 'completed'
  currentHeatIndex: number
  winnerPilots: string[]
  loserPilots: string[]
  loserPool: string[]
  eliminatedPilots: string[]
  // Phase Flags
  isQualificationComplete: boolean
  isWBFinaleComplete: boolean
  isLBFinaleComplete: boolean
  isGrandFinaleComplete: boolean
}
```

---

## Test-Abdeckung

Die Codebase enthält **16 Test-Dateien** mit Fokus auf:

| Kategorie | Tests | Fokus |
|-----------|-------|-------|
| Komponenten | 4 | PilotCard, CSVImport, PlacementModal, Finale |
| Integration | 3 | Tournament-Start, Heat-Assignment, Heat-Results |
| Business-Logik | 6 | Pool-Management, LB-Generierung, Grand Finale |
| Edge Cases | 3 | 8-Piloten-Flow, 32-Piloten-Sync, Rematch |

---

## Projektstruktur

```
heats/
├── src/
│   ├── components/        # React-Komponenten
│   │   ├── bracket/       # Bracket-Visualisierung
│   │   └── ui/            # Wiederverwendbare UI
│   ├── stores/            # Zustand State Management
│   ├── lib/               # Business-Logik & Utilities
│   ├── hooks/             # Custom React Hooks
│   ├── types/             # TypeScript-Definitionen
│   └── App.tsx            # Haupt-Komponente
├── tests/                 # Test-Dateien
├── docs/                  # Dokumentation
└── public/                # Statische Assets
```

---

## User Journeys

### Journey 1: Organisator (Thomas)

1. **CSV-Import:** Piloten aus Google Forms importieren
2. **Turnier starten:** Heat-Aufteilung bestätigen
3. **Heats durchführen:** Platzierungen per Click-to-Rank eingeben
4. **Bracket verfolgen:** Automatische WB/LB-Zuordnung
5. **Finale:** Grand Finale und Siegerehrung
6. **Export:** Ergebnisse als CSV speichern

### Journey 2: Pilot (Lisa)

1. **Registrierung:** Orga fügt Piloten hinzu
2. **Orientierung:** Eigenen Heat auf Beamer finden
3. **Rennen:** Ergebnis wird eingetragen
4. **Fortschritt:** Bracket-Position verfolgen
5. **Finale:** Bei Erfolg im Grand Finale

### Journey 3: Zuschauer (Familie Huber)

1. **Ankunft:** Bracket auf Beamer sehen
2. **Verständnis:** Farbcodierung erklärt WB/LB
3. **Mitfiebern:** Aktiver Heat hervorgehoben
4. **Finale:** Spannende Siegerehrung

---

## Quality Metrics

### Erfüllte Success Criteria

| Kriterium | Status | Messung |
|-----------|--------|---------|
| **Setup-Zeit** | ✅ | CSV-Import < 2 Minuten |
| **Heat-Eingabe** | ✅ | < 10 Sekunden (Click-to-Rank) |
| **Stabilität** | ✅ | Keine Abstürze in Tests |
| **Offline-Fähigkeit** | ✅ | localStorage persistent |
| **Bracket-Korrektheit** | ✅ | Pool-basierte Generierung validiert |
| **Beamer-Lesbarkeit** | ✅ | Synthwave Theme optimiert |

### Non-Functional Requirements

| NFR | Ziel | Status |
|-----|------|--------|
| Initial Load | < 3s | ✅ |
| Heat-Wechsel | < 500ms | ✅ |
| Bracket-Update | < 200ms | ✅ |
| Tab-Wechsel | < 300ms | ✅ |

---

## Mögliche Erweiterungen (Post-MVP)

| Feature | Priorität | Beschreibung |
|---------|-----------|--------------|
| Countdown-Timer | Mittel | Automatische Heat-Ansagen |
| Statistiken | Niedrig | Pilot-Statistiken über Events |
| Multi-Device Sync | Niedrig | WebSocket für Live-Updates |
| Docker Deployment | Niedrig | Einfaches Self-Hosting |
| QR-Code für Zuschauer | Niedrig | Mobile Bracket-Ansicht |

---

## Conclusion

**FPV Racing Heats** ist eine vollständig implementierte Turnier-Management-App, die alle ursprünglichen MVP-Anforderungen erfüllt. Die Codebase ist sauber strukturiert, gut getestet und folgt modernen React-Best Practices.

**Stärken:**
- Vollständiges Double-Elimination mit allen Edge Cases
- Intuitive Benutzerführung (Click-to-Rank, Drag & Drop)
- Robuste Pool-basierte Heat-Generierung
- Export/Import für Datensicherung
- Beamer-optimiertes Synthwave-Design

**Nächste Schritte:**
- Live-Testing bei FPV OÖ Events
- User-Feedback sammeln
- Optional: Post-MVP Features basierend auf Feedback

---

*Zuletzt aktualisiert: 2026-01-22*
