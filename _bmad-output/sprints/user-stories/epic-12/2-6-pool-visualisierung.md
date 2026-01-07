# Story 2.6: Pool-Visualisierung konsolidieren

**Epic:** Komponenten Refactoring
**Aufwand:** M
**Priorität:** 4 (Sprint 4)
**Abhängigkeiten:** Story 2.3 (PilotAvatar), Story 2.4 (bracket/ Ordner)

## Beschreibung

Als Entwickler möchte ich die 3 Pool-Visualisierungs-Komponenten (`PoolVisualization`, `PoolDisplay`, `GrandFinalePoolVisualization`) zu einer einheitlichen Komponente zusammenführen, da sie 80% identische Struktur haben.

## Akzeptanzkriterien

- [ ] AC1: `src/components/bracket/PoolDisplay.tsx` existiert mit `variant` Prop: `standard` | `grandFinale`
- [ ] AC2: Komponente verwendet `PilotAvatar` für Piloten-Rendering
- [ ] AC3: Props unterstützen: `pilots`, `title`, `variant`, `emptyMessage`, `maxDisplay`
- [ ] AC4: `pool-display.tsx` (Wurzelverzeichnis) wird entfernt
- [ ] AC5: Alle Stellen die alte Pool-Komponenten nutzen, verwenden neue Komponente
- [ ] AC6: Alle bestehenden Tests bleiben grün

## Technische Details

### Betroffene Dateien
- `src/components/pool-display.tsx` → wird entfernt
- `src/components/bracket/pools/PoolVisualization.tsx` → wird zu `PoolDisplay.tsx`
- `src/components/bracket/pools/GrandFinalePoolVisualization.tsx` → wird entfernt (in PoolDisplay integriert)

### Aktuelle Komponenten-Analyse

| Komponente | Ort | Zeilen | Besonderheiten |
|------------|-----|--------|----------------|
| `PoolVisualization` | bracket-tree.tsx | ~80 | WB/LB Pool im Bracket |
| `PoolDisplay` | pool-display.tsx | ~70 | Standalone Pool-Anzeige |
| `GrandFinalePoolVisualization` | bracket-tree.tsx | ~60 | Grand Finale spezifisch |

### Gemeinsame Features

- Titel-Anzeige
- Piloten-Liste mit Avataren
- Leer-Zustand mit Message
- Status-Indikator (Anzahl Piloten)

### Unterschiede (zu parametrisieren)

| Feature | Standard | Grand Finale |
|---------|----------|--------------|
| Layout | Vertikal | Horizontal |
| Avatar-Größe | md | lg |
| Status-Anzeige | Anzahl | "Bereit für Finale" |

### Neue PoolDisplay Interface

```typescript
interface PoolDisplayProps {
  title: string;
  pilotIds: string[];
  pilots: Pilot[];
  variant?: 'standard' | 'grandFinale' | 'compact';
  emptyMessage?: string;
  maxDisplay?: number;
  showCount?: boolean;
  className?: string;
}
```

### Implementierung

```tsx
import { PilotAvatar } from '../ui/pilot-avatar';
import { cn } from '../../lib/utils';

export function PoolDisplay({
  title,
  pilotIds,
  pilots,
  variant = 'standard',
  emptyMessage = 'Pool ist leer',
  maxDisplay,
  showCount = true,
  className,
}: PoolDisplayProps) {
  const displayPilots = pilotIds
    .map(id => pilots.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, maxDisplay);
  
  const hasMore = maxDisplay && pilotIds.length > maxDisplay;
  
  const layoutClass = {
    standard: 'flex flex-col gap-2',
    grandFinale: 'flex flex-row gap-4 justify-center',
    compact: 'flex flex-wrap gap-1',
  }[variant];
  
  const avatarSize = variant === 'grandFinale' ? 'lg' : 'md';
  
  return (
    <div className={cn('p-4 rounded-xl border border-cyber-cyan/30', className)}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {showCount && (
          <span className="text-cyber-cyan text-sm">
            {pilotIds.length} Piloten
          </span>
        )}
      </div>
      
      {pilotIds.length === 0 ? (
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      ) : (
        <div className={layoutClass}>
          {displayPilots.map(pilot => (
            <div key={pilot.id} className="flex items-center gap-2">
              <PilotAvatar
                imageUrl={pilot.imageUrl}
                name={pilot.name}
                size={avatarSize}
              />
              {variant !== 'compact' && (
                <span className="text-white">{pilot.name}</span>
              )}
            </div>
          ))}
          {hasMore && (
            <span className="text-gray-400 text-sm">
              +{pilotIds.length - maxDisplay} weitere
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```

## Migrations-Schritte

1. **Neue `bracket/PoolDisplay.tsx` erstellen**
2. **Tests für neue Komponente schreiben**
3. **WinnerBracketSection migrieren**
4. **LoserBracketSection migrieren**
5. **GrandFinaleSection migrieren**
6. **Alte Komponenten entfernen**
7. **pool-display.tsx im Root entfernen** (falls nicht anderweitig verwendet)

## Testplan

1. Neue Tests: Erweitere `tests/pool-display.test.tsx`
2. `npm test -- pool-display` - Pool-Tests
3. `npm test -- bracket` - Bracket-Tests
4. `npm test` - alle Tests müssen grün bleiben
5. Visuelle Prüfung aller Pool-Anzeigen
