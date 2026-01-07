# Story 2.5: HeatCard-Komponenten zu einheitlicher Komponente konsolidieren

**Epic:** Komponenten Refactoring
**Aufwand:** M
**Priorität:** 4 (Sprint 4)
**Abhängigkeiten:** Story 2.3 (PilotAvatar, RankBadge), Story 2.4 (bracket/ Ordner)

## Beschreibung

Als Entwickler möchte ich die 4 verschiedenen Heat-Box-Komponenten zu einer einzigen `HeatCard` mit `variant` Prop konsolidieren, damit duplizierter Code für Pilot-Rendering, Rank-Badge und Border-Styling eliminiert wird.

## Akzeptanzkriterien

- [ ] AC1: `src/components/ui/heat-card.tsx` existiert mit `variant` Prop: `bracket` | `filled` | `empty` | `overview`
- [ ] AC2: HeatCard verwendet `PilotAvatar` und `RankBadge` Komponenten
- [ ] AC3: Props unterstützen alle bisherigen Use-Cases: `pilots`, `results`, `heatNumber`, `onClick`, `isActive`, `isOnDeck`
- [ ] AC4: Alte Komponenten `heat-box.tsx` und originale `heat-card.tsx` werden entfernt
- [ ] AC5: `BracketHeatBox`, `FilledBracketHeatBox`, `EmptyBracketHeatBox` in `bracket/` verwenden neue `HeatCard`
- [ ] AC6: Alle bestehenden Tests bleiben grün
- [ ] AC7: Konsistentes Border-Styling über alle Varianten

## Technische Details

### Betroffene Dateien
- `src/components/heat-box.tsx` → wird entfernt
- `src/components/heat-card.tsx` → wird zu `ui/heat-card.tsx` migriert
- `src/components/bracket/heat-boxes/BracketHeatBox.tsx` → verwendet HeatCard
- `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx` → verwendet HeatCard
- `src/components/bracket/heat-boxes/EmptyBracketHeatBox.tsx` → verwendet HeatCard

### Aktuelle Komponenten-Analyse

| Komponente | Zeilen | Besonderheiten |
|------------|--------|----------------|
| `BracketHeatBox` | ~100 | Im Bracket, zeigt 4 Piloten, Click-Handler |
| `FilledBracketHeatBox` | ~100 | Mit Ergebnissen, farbige Ranks |
| `EmptyBracketHeatBox` | ~50 | Platzhalter für zukünftige Heats |
| `HeatBox` | ~200 | Detailansicht, Bye-Handling |
| `HeatCard` | ~120 | Kompakte Übersicht |

### Gemeinsame Features (zu konsolidieren)

- Pilot-Avatar mit Fallback
- Rank-Badge mit Farben
- Border nach Status (pending/active/completed)
- Heat-Nummer-Anzeige
- Click-Handler

### Neue HeatCard Interface

```typescript
interface HeatCardProps {
  // Variante bestimmt Layout
  variant: 'bracket' | 'filled' | 'empty' | 'overview' | 'detail';
  
  // Daten
  heatNumber: number;
  pilots: Pilot[];
  pilotIds: string[];
  results?: HeatResults;
  
  // Status
  status: 'pending' | 'active' | 'completed';
  isOnDeck?: boolean;
  isBye?: boolean;
  
  // Interaktion
  onClick?: () => void;
  
  // Styling
  className?: string;
}
```

### Implementierungsstruktur

```tsx
export function HeatCard({
  variant,
  heatNumber,
  pilots,
  pilotIds,
  results,
  status,
  isOnDeck,
  isBye,
  onClick,
  className,
}: HeatCardProps) {
  // Gemeinsame Logik
  const borderClass = getBorderClass(status, isOnDeck);
  const sortedPilots = results 
    ? sortPilotsByRank(pilotIds, pilots, results.rankings)
    : pilotIds.map(id => pilots.find(p => p.id === id));

  // Variant-spezifisches Rendering
  switch (variant) {
    case 'empty':
      return <EmptyVariant heatNumber={heatNumber} />;
    case 'bracket':
      return <BracketVariant {...} />;
    case 'filled':
      return <FilledVariant {...} />;
    case 'overview':
      return <OverviewVariant {...} />;
    case 'detail':
      return <DetailVariant {...} />;
  }
}

// Interne Subkomponenten für jede Variante
function EmptyVariant({ heatNumber }: { heatNumber: number }) { ... }
function BracketVariant({ ... }) { ... }
// etc.
```

## Migrations-Schritte

1. **Neue `ui/heat-card.tsx` erstellen** mit allen Variants
2. **Tests für neue HeatCard schreiben**
3. **Bracket-Komponenten migrieren** (eine nach der anderen)
4. **heat-box.tsx migrieren** oder entfernen
5. **Alte heat-card.tsx entfernen**
6. **Imports in allen nutzenden Dateien aktualisieren**

## Testplan

1. Neue Tests: `tests/ui-heat-card.test.tsx`
2. `npm test -- heat` - alle Heat-Tests
3. `npm test -- bracket` - alle Bracket-Tests
4. `npm test` - alle Tests müssen grün bleiben
5. Visuelle Prüfung aller Heat-Darstellungen
