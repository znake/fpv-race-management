# Story 2.3: PilotAvatar und RankBadge UI-Komponenten erstellen

**Epic:** Komponenten Refactoring
**Aufwand:** S
**Priorität:** 3 (Sprint 3)
**Abhängigkeiten:** Keine

## Beschreibung

Als Entwickler möchte ich wiederverwendbare `PilotAvatar` und `RankBadge` Komponenten in `ui/` haben, damit das identische Rendering von Piloten-Bildern (8+ Stellen) und Rang-Badges (6+ Stellen) konsolidiert wird.

## Akzeptanzkriterien

- [ ] AC1: `src/components/ui/pilot-avatar.tsx` existiert mit Props: `imageUrl`, `name`, `size` (sm/md/lg/xl), `showGlow`
- [ ] AC2: PilotAvatar hat Gradient-Fallback wenn kein Bild vorhanden oder Bild-Fehler
- [ ] AC3: `src/components/ui/rank-badge.tsx` existiert mit Props: `rank` (1-4), `size` (sm/md/lg), `animated`
- [ ] AC4: RankBadge zeigt korrekte Farben: Gold(1), Silber(2), Bronze(3), Neon-Pink(4)
- [ ] AC5: RankBadge unterstützt Glow-Animation (prop `animated`)
- [ ] AC6: Beide Komponenten haben Unit-Tests

## Technische Details

### Betroffene Dateien
- Neue Datei: `src/components/ui/pilot-avatar.tsx`
- Neue Datei: `src/components/ui/rank-badge.tsx`

### PilotAvatar Implementierung

```tsx
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { FALLBACK_PILOT_IMAGE } from '../../lib/ui-helpers'; // nach Story 3.1

interface PilotAvatarProps {
  imageUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export function PilotAvatar({
  imageUrl,
  name,
  size = 'md',
  showGlow = false,
  className,
}: PilotAvatarProps) {
  const [imgError, setImgError] = useState(false);
  
  const showFallback = !imageUrl || imgError;
  
  return (
    <div
      className={cn(
        sizeClasses[size],
        'rounded-full overflow-hidden border-2 border-cyber-cyan/50',
        showGlow && 'shadow-glow-cyan',
        className
      )}
    >
      {showFallback ? (
        <div className="w-full h-full bg-gradient-to-br from-neon-pink to-cyber-cyan flex items-center justify-center">
          <span className="text-white font-bold">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}
```

### RankBadge Implementierung

```tsx
import { cn } from '../../lib/utils';

interface RankBadgeProps {
  rank: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const rankColors = {
  1: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black', // Gold
  2: 'bg-gradient-to-r from-gray-300 to-gray-500 text-black',     // Silber
  3: 'bg-gradient-to-r from-amber-600 to-amber-800 text-white',   // Bronze
  4: 'bg-gradient-to-r from-neon-pink to-purple-600 text-white',  // Pink
};

const rankGlow = {
  1: 'shadow-[0_0_10px_rgba(250,204,21,0.5)]',
  2: 'shadow-[0_0_10px_rgba(156,163,175,0.5)]',
  3: 'shadow-[0_0_10px_rgba(217,119,6,0.5)]',
  4: 'shadow-[0_0_10px_rgba(236,72,153,0.5)]',
};

const sizeClasses = {
  sm: 'w-5 h-5 text-xs',
  md: 'w-7 h-7 text-sm',
  lg: 'w-9 h-9 text-base',
};

export function RankBadge({
  rank,
  size = 'md',
  animated = false,
  className,
}: RankBadgeProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold',
        sizeClasses[size],
        rankColors[rank],
        animated && rankGlow[rank],
        animated && 'animate-pulse',
        className
      )}
    >
      {rank}
    </div>
  );
}
```

### Stellen zur späteren Migration (in Story 2.5)

Pilot-Avatar wird verwendet in:
- `pilot-card.tsx`
- `active-heat-view.tsx`
- `heat-box.tsx`
- `heat-card.tsx`
- `bracket-tree.tsx` (mehrfach)
- `pool-display.tsx`
- `victory-ceremony.tsx`

RankBadge wird verwendet in:
- `active-heat-view.tsx`
- `heat-box.tsx`
- `heat-card.tsx`
- `bracket-tree.tsx` (mehrfach)
- `pool-display.tsx`

## Testplan

1. Neue Tests: `tests/pilot-avatar.test.tsx`, `tests/rank-badge.test.tsx`
2. Teste Fallback-Verhalten bei fehlendem Bild
3. Teste alle Größen und Rank-Farben
4. `npm test` - alle Tests müssen grün bleiben
