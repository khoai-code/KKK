'use client';

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Theme, THEMES, getSavedTheme, saveTheme, getNextTheme } from '@/lib/utils/themeUtils';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize with saved theme on client, or default on server
    if (typeof window !== 'undefined') {
      return getSavedTheme();
    }
    return THEMES.DARK;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getSavedTheme();
    if (saved !== theme) {
      setThemeState(saved);
    }
    saveTheme(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = getNextTheme(theme);
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
