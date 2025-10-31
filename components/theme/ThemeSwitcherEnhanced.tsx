'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/context/ThemeContext';
import { THEMES, getThemeLabel } from '@/lib/utils/themeUtils';
import { Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Render a placeholder until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl"
        aria-label="Toggle theme"
        disabled
      >
        <Moon className="h-4 w-4 text-blue-400" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-xl transition-all duration-300 hover:bg-[hsl(var(--color-muted))] hover:scale-110"
      title={`Current: ${getThemeLabel(theme)} - Click to switch`}
      aria-label="Toggle theme"
    >
      {getIcon()}
    </Button>
  );
}
