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
