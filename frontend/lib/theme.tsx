'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export const ACCENT_COLORS = {
  blue: '#3b82f6',
  amber: '#f59e0b',
  pink: '#ec4899',
  rose: '#f43f5e',
  emerald: '#10b981',
  black: '#1f2937',
} as const;

export type Accent = keyof typeof ACCENT_COLORS;

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
  toggleTheme: () => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const noFlashThemeScript = `(function(){try{var t=localStorage.getItem('theme');var a=localStorage.getItem('accent')||'blue';if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}document.documentElement.setAttribute('data-accent',a);}catch(e){}})();`;

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialAccent(): Accent {
  if (typeof window === 'undefined') return 'blue';
  return (localStorage.getItem('accent') as Accent | null) || 'blue';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [accent, setAccent] = useState<Accent>(getInitialAccent);

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
