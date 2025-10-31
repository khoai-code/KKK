'use client';

import { useTheme } from '@/lib/context/ThemeContext';
import { THEMES } from '@/lib/utils/themeUtils';
import Image from 'next/image';

interface LogoSwitcherProps {
  className?: string;
  size?: number;
}

export function LogoSwitcher({ className = 'h-8 w-auto', size = 32 }: LogoSwitcherProps) {
  const { theme } = useTheme();

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

  return (
    <div className={className}>
      <Image
        src={getLogo()}
        alt="Digitization Finder Logo"
        width={size}
        height={size}
        priority
        className="transition-all duration-300"
      />
    </div>
  );
}
