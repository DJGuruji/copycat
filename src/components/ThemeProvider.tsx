'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'copycat-theme';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const next: Theme = stored === 'dark' || stored === 'light' ? stored : 'light';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-surface border border-line text-mute hover:bg-surface-2 transition-colors"
    >
      {isDark ? (
        <SunIcon className="h-[17px] w-[17px] stroke-2" />
      ) : (
        <MoonIcon className="h-[17px] w-[17px] stroke-2" />
      )}
    </button>
  );
}
