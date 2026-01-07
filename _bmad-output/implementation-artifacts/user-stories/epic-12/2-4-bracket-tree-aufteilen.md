# Story 2.4: bracket-tree.tsx in Ordnerstruktur aufteilen

**Epic:** Komponenten Refactoring
**Aufwand:** L
**Priorität:** 3 (Sprint 3)
**Abhängigkeiten:** Keine (kann parallel zu Story 2.1-2.3 entwickelt werden)

## Beschreibung

Als Entwickler möchte ich die Mega-Komponente `bracket-tree.tsx` (1.163 Zeilen) in einen `components/bracket/` Ordner mit separaten Dateien aufteilen, damit die Wartbarkeit verbessert und Single-Responsibility-Principle eingehalten wird.

## Akzeptanzkriterien

- [ ] AC1: Ordner `src/components/bracket/` existiert mit `index.ts` für Exports
- [ ] AC2: `EmptyBracketHeatBox.tsx`, `BracketHeatBox.tsx`, `FilledBracketHeatBox.tsx` sind separate Dateien
- [ ] AC3: `HeatsSection.tsx`, `BracketRoundColumn.tsx` sind separate Dateien
- [ ] AC4: `WinnerBracketSection.tsx`, `LoserBracketSection.tsx`, `GrandFinaleSection.tsx` sind separate Dateien
- [ ] AC5: `PoolVisualization.tsx`, `GrandFinalePoolVisualization.tsx`, `DynamicLBHeatsSection.tsx` sind separate Dateien
- [ ] AC6: Ursprüngliche `bracket-tree.tsx` importiert aus `bracket/` und re-exportiert für Abwärtskompatibilität
- [ ] AC7: Alle bestehenden Tests bleiben grün
- [ ] AC8: Keine zirkulären Imports vorhanden

## Technische Details

### Betroffene Dateien
- `src/components/bracket-tree.tsx` → wird aufgeteilt
- Neuer Ordner: `src/components/bracket/`

### Neue Ordnerstruktur

```
src/components/bracket/
├── index.ts                        # Re-exports
├── BracketTree.tsx                 # Haupt-Komponente (orchestriert)
├── heat-boxes/
│   ├── EmptyBracketHeatBox.tsx
│   ├── BracketHeatBox.tsx
│   └── FilledBracketHeatBox.tsx
├── sections/
│   ├── WinnerBracketSection.tsx
│   ├── LoserBracketSection.tsx
│   ├── GrandFinaleSection.tsx
│   └── DynamicLBHeatsSection.tsx
├── layout/
│   ├── HeatsSection.tsx
│   └── BracketRoundColumn.tsx
└── pools/
    ├── PoolVisualization.tsx
    └── GrandFinalePoolVisualization.tsx
```

### Abhängigkeiten zwischen Komponenten

```
BracketTree
├── WinnerBracketSection
│   ├── BracketRoundColumn
│   │   └── FilledBracketHeatBox / EmptyBracketHeatBox
│   └── PoolVisualization
├── LoserBracketSection
│   ├── DynamicLBHeatsSection
│   │   └── BracketHeatBox
│   └── PoolVisualization
└── GrandFinaleSection
    ├── GrandFinalePoolVisualization
    └── BracketHeatBox
```

### index.ts

```typescript
// src/components/bracket/index.ts
export { BracketTree } from './BracketTree';

// Optional: Einzelne Komponenten für Tests exportieren
export { BracketHeatBox } from './heat-boxes/BracketHeatBox';
export { PoolVisualization } from './pools/PoolVisualization';
// etc.
```

### Abwärtskompatibilität

Die ursprüngliche `bracket-tree.tsx` wird zu einem Re-Export:

```typescript
// src/components/bracket-tree.tsx
export { BracketTree } from './bracket';
export { BracketTree as default } from './bracket';
```

### Shared Types/Props extrahieren

Erstelle `src/components/bracket/types.ts` für gemeinsame Props:

```typescript
import type { Heat, Pilot } from '../../stores/tournamentStore';
import type { FullBracketStructure, BracketHeat } from '../../lib/bracket-structure-generator';

export interface BracketHeatBoxProps {
  heat: BracketHeat;
  actualHeat?: Heat;
  pilots: Pilot[];
  onClick?: () => void;
  isActive?: boolean;
  isOnDeck?: boolean;
}

export interface PoolVisualizationProps {
  title: string;
  pilotIds: string[];
  pilots: Pilot[];
  emptyMessage?: string;
}

// etc.
```

## Migrations-Schritte

1. **Ordner erstellen** und `types.ts` anlegen
2. **Heat-Boxes extrahieren** (unabhängig)
3. **Pool-Komponenten extrahieren** (unabhängig)
4. **Layout-Komponenten extrahieren** (brauchen Heat-Boxes)
5. **Sections extrahieren** (brauchen Layout + Pools)
6. **BracketTree vereinfachen** (nutzt Sections)
7. **index.ts erstellen** und alte Datei als Re-Export
8. **Tests prüfen**

## Testplan

1. `npm test -- bracket` - alle Bracket-Tests
2. `npm test -- dynamic-bracket-viz.test.tsx`
3. `npm test -- bracket-responsive.test.tsx`
4. `npm test` - alle Tests müssen grün bleiben
5. Prüfe auf zirkuläre Imports: `npx madge --circular src/components/bracket/`
6. Manuelle UI-Prüfung: Bracket-Visualisierung funktioniert

## Risiken

- **Mittel:** Viele interne Abhängigkeiten - sorgfältig extrahieren
- **Niedrig:** Props-Durchreichung könnte komplexer werden
- **Empfehlung:** Nach jeder extrahierten Komponente Tests laufen lassen
