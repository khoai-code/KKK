'use client';

import Image from 'next/image';
import { useTheme } from '@/lib/context/ThemeContext';
import { THEMES } from '@/lib/utils/themeUtils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'text-only';
}

export function Logo({ size = 'md', className = '', variant = 'default' }: LogoProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-14 w-14',
    xl: 'h-16 w-16',
  };

  const sizePx = {
    sm: 28,
    md: 36,
    lg: 56,
    xl: 64,
  };

  const getLogo = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return '/logo_light.svg';
      case THEMES.ASIAN:
        return '/logo_asian.svg';
      case THEMES.DARK:
      default:
        return '/logo_dark.svg';
    }
  };

  if (variant === 'text-only') {
    const textSizes = {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-2xl',
      xl: 'text-3xl',
    };

    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] text-white font-bold shadow-lg ${sizeClasses[size]} ${textSizes[size]} ${className}`}
      >
        <span>K</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <Image
        src={getLogo()}
        alt="Digitization Finder"
        width={sizePx[size]}
        height={sizePx[size]}
        priority
        className="rounded-xl transition-all duration-300"
      />
    </div>
  );
}
