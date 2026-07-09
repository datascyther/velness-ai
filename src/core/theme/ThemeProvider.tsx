import React, { createContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ThemeMode, Theme } from '@/types';
import { colors } from './colors';
import { spacing, borderRadius, typography } from './tokens';

interface ThemeContextType {
  mode: ThemeMode;
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
}

const OLD_STORAGE_KEY = 'neeva-theme-mode';
const STORAGE_KEY = 'velness-theme-mode';

function getStoredMode(): ThemeMode {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  }
  return 'auto';
}

function getSystemTheme(): Theme {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'auto') return getSystemTheme();
  return mode;
}

function applyThemeToDocument(t: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', t);
  root.classList.toggle('dark', t === 'dark');
  root.style.colorScheme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', t === 'dark' ? '#0F0A1A' : '#F8FAFF');
  }
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getStoredMode);
  const theme = useMemo(() => resolveTheme(mode), [mode]);
  const mediaRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    localStorage.removeItem(OLD_STORAGE_KEY);
  }, [mode]);

  useEffect(() => {
    mediaRef.current = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = () => {
      if (mode === 'auto') {
        applyThemeToDocument(resolveTheme('auto'));
        setModeState('auto');
      }
    };

    mediaRef.current.addEventListener('change', handler);
    return () => mediaRef.current?.removeEventListener('change', handler);
  }, [mode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState(prev => {
      if (prev === 'auto') {
        const currentTheme = resolveTheme('auto');
        return currentTheme === 'dark' ? 'light' : 'dark';
      }
      return prev === 'light' ? 'dark' : 'light';
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, toggleTheme, spacing, borderRadius, typography }}>
      {children}
    </ThemeContext.Provider>
  );
}