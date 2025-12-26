import { useState } from 'react';
import { cn } from '../../lib/utils';

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
