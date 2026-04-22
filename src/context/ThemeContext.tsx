import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  toggleTheme: () => {},
});

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('peptiplan-theme');
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  return 'system';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.add('theme-transitioning');
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  window.setTimeout(() => root.classList.remove('theme-transitioning'), 500);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('peptiplan-theme', t);
    applyTheme(resolveTheme(t));
  }, []);

  const toggleTheme = useCallback(() => {
    const resolved = resolveTheme(theme);
    setTheme(resolved === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  useEffect(() => {
    applyTheme(resolveTheme(theme));
  }, [theme]);

  // Listen for OS preference changes when in system mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        applyTheme(resolveTheme('system'));
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
