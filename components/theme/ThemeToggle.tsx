'use client';

import { Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '@/lib/context/ThemeContext';
import { THEMES } from '@/lib/utils/themeUtils';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case THEMES.ASIAN:
        return <Globe className="h-4 w-4 text-emerald-500" />;
      case THEMES.DARK:
      default:
        return <Moon className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-xl transition-all duration-300 hover:bg-[hsl(var(--color-muted))] hover:scale-110"
      aria-label="Toggle theme"
    >
      {getIcon()}
    </Button>
  );
}
