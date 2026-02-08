import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

/**
 * US-14.5 AC11: Rank-Badge
 * - 14px × 14px (sm), 18px (md), 24px (lg)
 * - Border-radius: 50% (rund)
 * - Font: Bebas Neue
 * - Colors: Gold (#f9c80e), Silver (#c0c0c0), Bronze (#cd7f32), Cyan (#05d9e8)
 */
const sizeClasses = {
  sm: 'w-3.5 h-3.5 text-[9px]',  // 14px - mockup size
  md: 'w-5 h-5 text-xs',         // 20px
  lg: 'w-7 h-7 text-sm',         // 28px
};

export function RankBadge({
  rank,
  size = 'sm',
  animated = false,
  className,
}: RankBadgeProps) {
  return (
    <div
      className={cn(
        'rank-badge',
        `r${rank}`,
        sizeClasses[size],
        animated && 'rank-badge-animate',
        className
      )}
    >
      {rank}
    </div>
  );
}
