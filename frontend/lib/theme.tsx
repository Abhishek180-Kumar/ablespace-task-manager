'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Accent = 'blue' | 'amber' | 'pink' | 'rose' | 'emerald' | 'black';

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
  toggleTheme: () => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const noFlashThemeScript = `(function(){try{var t=localStorage.getItem('theme');var a=localStorage.getItem('accent')||'blue';if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}document.documentElement.setAttribute('data-accent',a);}catch(e){}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [accent, setAccent] = useState<Accent>('blue');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedAccent = localStorage.getItem('accent') as Accent | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
    setAccent(storedAccent || 'blue');
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('accent', accent);
  }, [accent]);

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light'), setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
