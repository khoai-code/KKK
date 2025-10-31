export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  ASIAN: 'asian',
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];

const THEME_KEY = 'digitization_finder_theme';

export function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return THEMES.DARK;
  const saved = localStorage.getItem(THEME_KEY);
  return (saved as Theme) || THEMES.DARK;
}

export function saveTheme(theme: Theme): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_KEY, theme);
    applyThemeToDOM(theme);
  }
}

export function applyThemeToDOM(theme: Theme): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // Remove all theme classes
  Object.values(THEMES).forEach(t => root.classList.remove(t));

  // Add new theme class
  root.classList.add(theme);
}

export function getNextTheme(currentTheme: Theme): Theme {
  switch (currentTheme) {
    case THEMES.LIGHT:
      return THEMES.DARK;
    case THEMES.DARK:
      return THEMES.ASIAN;
    case THEMES.ASIAN:
      return THEMES.LIGHT;
    default:
      return THEMES.DARK;
  }
}

export function getThemeLabel(theme: Theme): string {
  switch (theme) {
    case THEMES.LIGHT:
      return 'Light Mode';
    case THEMES.DARK:
      return 'Dark Mode';
    case THEMES.ASIAN:
      return 'Asian Mode';
    default:
      return 'Unknown';
  }
}
