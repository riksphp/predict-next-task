import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readTheme, writeTheme, type ThemeName } from '../data-layer/themeStorage';

type ThemeCtx = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [theme, setThemeState] = useState<ThemeName>('light');

  useEffect(() => {
    (async () => {
      const stored = await readTheme();
      if (stored) setThemeState(stored);
    })();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    writeTheme(theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);
  const value = useMemo<ThemeCtx>(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(ThemeContext);
  if (!v) throw new Error('useTheme must be used within ThemeProvider');
  return v;
}
