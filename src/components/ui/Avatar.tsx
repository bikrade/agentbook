import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
};

const sizePx = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const fallback = alt.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={sizePx[size]}
          height={sizePx[size]}
          className="aspect-square h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
          {fallback}
        </span>
      )}
    </div>
  );
}
