import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setThemePreference: (pref: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate actual theme based on preference
  const actualTheme: 'light' | 'dark' = theme === 'system' 
    ? (systemPrefersDark ? 'dark' : 'light')
    : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [actualTheme, theme]);

  const toggleTheme = () => {
    // If currently on system, switch to opposite of system
    // If on light, switch to dark
    // If on dark, switch to light
    if (theme === 'system') {
      setTheme(systemPrefersDark ? 'light' : 'dark');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'system');
    }
  };

  const setThemePreference = (pref: Theme) => {
    setTheme(pref);
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
