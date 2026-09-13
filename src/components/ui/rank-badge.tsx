import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

type Rank = 1 | 2 | 3 | 4;

interface RankBadgeProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

/**
 * Canonical rank badge renderer (US-14.5 AC11).
 *
 * Single source of truth for rank styling across the app. Colors map to the
 * Synthwave rank tokens:
 * - 1st place: Gold (#f9c80e)
 * - 2nd place: Silver (#c0c0c0)
 * - 3rd place: Bronze (#cd7f32)
 * - 4th place: rank-4 dark red (#ac645e)
 *
 * Dimensions (sm/md/lg): 14px / 20px / 28px, border-radius 50%, Bebas Neue.
 */
const sizeClasses = {
  sm: 'w-3.5 h-3.5 text-[9px]', // 14px - mockup size
  md: 'w-5 h-5 text-xs', // 20px
  lg: 'w-7 h-7 text-sm', // 28px
};

const rankClasses: Record<Rank, string> = {
  1: 'bg-gold shadow-glow-gold',
  2: 'bg-silver shadow-glow-silver',
  3: 'bg-bronze shadow-glow-bronze',
  4: 'bg-rank-4 shadow-glow-rank-4',
};

export function RankBadge({
  rank,
  size = 'sm',
  animated = false,
  className,
  ...props
}: RankBadgeProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-display flex-shrink-0 text-void',
        rankClasses[rank],
        sizeClasses[size],
        animated && 'rank-badge-animate',
        className
      )}
      {...props}
    >
      {rank}
    </div>
  );
}
