# FPV Racing Heats - Projekt-Kontext Dokumentation

**Datum:** 2025-12-13  
**Autor:** Mary (Business Analyst)  
**Projekt:** FPV Racing Heats - Turnier-Management-App  

---

## Executive Summary

**FPV Racing Heats** ist eine browserbasierte Single-Page-Application für die Verwaltung von FPV-Drohnen-Turnieren mit Double-Elimination-Format. Die App ist als "digitale Magnettafel" konzipiert und ermöglicht es Organisatoren, Piloten zu verwalten, Heats durchzuführen und Brackets zu visualisieren - alles ohne Server, Accounts oder Einarbeitung.

### Aktuelle Implementierungsphase
Die App befindet sich aktuell in der **MVP-Implementierungsphase** mit fokussierten Features für die Pilotenverwaltung und CSV-Import. Das Turnier-Management (Heats, Brackets) ist als nächstes Feature geplant.

---

## Projekt-Klassifikation

| Eigenschaft | Wert |
|-------------|------|
| **Projekt-Typ** | Web Application (SPA) |
| **Domain** | Community/Event-Tool |
| **Komplexität** | Low-Medium |
| **Projekt-Kontext** | Greenfield |
| **Zielgruppe** | FPV Oberösterreich (Orga-Team, Piloten, Zuschauer) |
| **Technologie-Stack** | React + TypeScript + Vite + Tailwind CSS + Zustand |

---

## Technische Architektur

### Core Stack
- **Frontend Framework:** React 18.3.1 mit TypeScript
- **Build Tool:** Vite 5.4.8
- **Styling:** Tailwind CSS 3.4.14 mit Custom Synthwave-Theme
- **State Management:** Zustand 4.5.5 mit localStorage Persistenz
- **Form Handling:** React Hook Form 7.52.2 mit Zod Validation
- **Testing:** Vitest 2.1.4 + React Testing Library

### Architektur-Muster
- **SPA-Architektur:** Client-side Rendering ohne Backend
- **Offline-First:** localStorage für Datenpersistenz
- **Component-Based:** Modulare React-Komponenten
- **State Management:** Zentralisiert mit Zustand Store

---

## Codebase-Analyse

### Projektstruktur
```
app/
├── src/
│   ├── components/          # React Komponenten
│   │   ├── ui/             # Basis UI Komponenten (Button, Input, Label)
│   │   ├── add-pilot-form.tsx
│   │   ├── bracket-tree.tsx
│   │   ├── csv-import.tsx
│   │   ├── header.tsx
│   │   ├── heat-box.tsx
│   │   └── pilot-card.tsx
│   ├── hooks/              # Custom React Hooks
│   │   └── usePilots.ts
│   ├── lib/                # Utility Bibliotheken
│   │   ├── schemas.ts      # Zod Validation Schemas
│   │   └── utils.ts        # Helper Funktionen
│   ├── stores/             # Zustand State Management
│   │   └── tournamentStore.ts
│   ├── types/              # TypeScript Type Definitions
│   │   └── csv.ts
│   ├── test/               # Test Setup
│   │   └── setup.ts
│   ├── App.tsx             # Hauptanwendung
│   ├── globals.css         # Global Styles + Synthwave Theme
│   └── main.tsx            # Entry Point
├── tests/                  # Komponententests
└── package.json
```

### Implementierte Features

#### ✅ Piloten-Verwaltung (US 1.1-1.3)
- **PilotCard Komponente:** Visuelle Darstellung mit Editier/Lösch-Funktionen
- **AddPilotForm:** Formular für manuelle Piloteneingabe mit Validation
- **usePilots Hook:** Zentrale Business-Logik für Piloten-CRUD-Operationen
- **TournamentStore:** Zustand-basiertes State Management mit Persistenz

#### ✅ CSV-Import (US 1.2)
- **CSVImport Komponente:** Drag-and-Drop Interface mit Fortschrittsanzeige
- **Validierung:** Zod-Schema Validierung mit Fehlerbehandlung
- **Duplikat-Management:** Erkennung und Auflösung von Duplikaten
- **Performance:** Optimiert für große Dateien mit debounced Updates

#### ✅ Synthwave Branding (US 2.1)
- **Farbschema:** Neon-Pink, Neon-Cyan, Gold mit Dark Theme
- **Animationen:** Glow-Effekte, Pulse-Animationen, Hover-States
- **Typography:** Space Grotesk Font mit Display/UI Varianten
- **Responsive Design:** Beamer-optimierte Darstellung

#### ✅ Pixel-Perfect Design (US 2.2)
- **120px Piloten-Fotos:** Runde Bilder mit Gradient-Fallback
- **Grid-Layout:** Responsive Grid für Piloten-Karten
- **Border Radius:** Konsistente 16px Ecken
- **Spacing:** Systematisches 4px Grid System

#### ✅ Animierte Auswahl (US 2.3)
- **Rank Badges:** Animierte Platzierungs-Anzeigen
- **Glow-Effekte:** Rang-spezifische Leuchteffekte
- **Hover-States:** Smooth Transitions und Transformations
- **Selected States:** Visuelle Feedback für Interaktionen

### Datenmodelle

#### Core Types
```typescript
interface Pilot {
  id: string
  name: string
  imageUrl: string
  instagramHandle?: string
  status?: 'active' | 'withdrawn'
  droppedOut?: boolean // @deprecated
}

interface TournamentState {
  pilots: Pilot[]
  tournamentStarted: boolean
}
```

#### Validation Schemas
- **pilotSchema:** Name (min 3 Zeichen), Bild-URL, Instagram-Handle (optional)
- **csvImportSchema:** Unicode-Normalisierung, automatische @-Ergänzung
- **Performance NFRs:** <3s für Piloten-Add, <5s für CSV-Import (35 Piloten)

---

## User Journey Implementierung

### Journey 1: Thomas (Orga-Team) ✅
- **CSV-Import:** Implementiert mit Drag-and-Drop
- **Piloten-Verwaltung:** Vollständige CRUD-Operationen
- **Turnier-Start:** Button erscheint bei ≥7 Piloten
- **Status:** Grundfunktionen implementiert, Heat-Management ausstehend

### Journey 2: Lisa (Pilot) 🔄
- **Piloten-Übersicht:** Visuelle Karten mit Fotos
- **Status-Tracking:** DroppedOut Status implementiert
- **Bracket-Visualisierung:** Noch nicht implementiert
- **Status:** Basisfunktionen vorhanden, Turnier-Flow ausstehend

### Journey 3: Familie Huber (Zuschauer) 🔄
- **Beamer-Optimierung:** Große Elemente, hoher Kontrast
- **Visuelle Hierarchie:** Klare Farbcodierung
- **Turnier-Verlauf:** Noch nicht implementiert
- **Status:** Design-Grundlage vorhanden, Content ausstehend

---

## Quality Assurance

### Test-Abdeckung
- **Komponententests:** PilotCard, CSVImport, usePilots Hook
- **Integrationstests:** CSV-Import Workflow, Piloten-CRUD
- **Performance-Tests:** NFR-Validierung mit Performance-Monitoring

### Code-Qualität
- **TypeScript:** Strikte Typisierung mit Zod Validation
- **ESLint:** Konfigurierte Linting-Regeln
- **React Best Practices:** Hooks, Component Lifecycle, State Management
- **Error Handling:** Graceful Degradation und User Feedback

---

## Nächste Entwicklungsschritte

### Phase 2: Turnier-Management (Geplant)
1. **Heat-Management:** Heat-Erstellung, Gewinner-Auswahl, Bracket-Zuordnung
2. **Double-Elimination Algorithmus:** Winner/Loser Bracket Logik
3. **Bracket-Visualisierung:** Baum-Darstellung mit Farbcodierung
4. **On-Deck Vorschau:** Nächster Heat Anzeige

### Phase 3: Finale & Platzierungen (Geplant)
1. **Finale-Flow:** Spezielle UI für Finalrunden
2. **Platzierungs-Anzeige:** Visualisierung der Top 4
3. **Turnier-Abschluss:** Status-Management und Export

---

## Risiken und Mitigation

### Technische Risiken
| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| **Bracket-Algorithmus Komplexität** | Mittel | Frühzeitiger Prototyp, schrittweise Implementierung |
| **localStorage Limit** | Niedrig | 35 Piloten ≈ 1MB, Limit 5-10MB ausreichend |
| **Performance bei großen Events** | Mittel | Optimierung mit debouncing, lazy loading |

### Business Risiken
| Risiko | Mitigation |
|--------|------------|
| **User Adoption** | Early Testing mit FPV OÖ, schnelle Iteration |
| **Feature Scope Creep** | Fokus auf MVP, Post-MVP Features planen |
| **Event-Day Reliability** | Extensives Testing, Fallback-Strategien |

---

## Success Metrics

### Technical Success
- ✅ **Stabilität:** Keine Abstürze in aktuellen Tests
- ✅ **Datenintegrität:** localStorage Persistenz funktioniert
- ✅ **Performance:** NFRs für Piloten-Management erfüllt
- 🔄 **Bracket-Korrektheit:** Noch nicht validiert

### User Success
- ✅ **Setup-Zeit:** CSV-Import < 2 Minuten für 20+ Piloten
- ✅ **Piloten-Management:** Intuitive CRUD-Operationen
- 🔄 **Heat-Eingabe:** Noch nicht implementiert
- 🔄 **Turnier-Flow:** Noch nicht validiert

---

## Conclusion

**FPV Racing Heats** zeigt eine solide technische Grundlage mit gut implementierten Piloten-Management-Funktionen. Die Codebase ist sauber strukturiert, folgt modernen React-Best Practices und erfüllt die definierten Non-Functional Requirements für die implementierten Features.

**Stärken:**
- Moderne Tech-Stack mit TypeScript und Zod Validation
- Saubere Component-Architektur mit Custom Hooks
- Umfassendes Testing und Error Handling
- Performance-optimierte Implementierung

**Nächste Prioritäten:**
1. Turnier-Management (Heat-Flow, Bracket-Algorithmus)
2. Double-Elimination Visualisierung
3. Finale-Flow und Platzierungs-Anzeige
4. User-Testing mit FPV OÖ

Das Projekt ist auf einem guten Weg, die definierten MVP-Ziele zu erreichen und bietet eine solide Basis für die weiteren Entwicklungsphasen.