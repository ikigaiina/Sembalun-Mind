import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'sembalun-theme'
}) => {
  const [theme, setThemeState] = useState<ThemeMode>('light'); // Always start with light
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // System theme detection
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Initialize theme from localStorage or default to light
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as ThemeMode;
    
    // Always ensure we start with light theme as default
    const initialTheme = savedTheme && ['light', 'dark', 'auto'].includes(savedTheme) ? savedTheme : 'light';
    
    setThemeState(initialTheme);
    localStorage.setItem(storageKey, initialTheme);
    
    // Ensure DOM reflects the initial theme
    const root = document.documentElement;
    const body = document.body;
    
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    const resolvedInitialTheme = initialTheme === 'auto' ? getSystemTheme() : initialTheme;
    root.classList.add(resolvedInitialTheme);
    body.classList.add(resolvedInitialTheme);
    
    console.log('🎨 Initial theme set:', { initialTheme, resolvedInitialTheme });
  }, [storageKey]);

  // Update resolved theme when theme or system preference changes
  useEffect(() => {
    const updateResolvedTheme = () => {
      const newResolvedTheme = theme === 'auto' ? getSystemTheme() : theme;
      setResolvedTheme(newResolvedTheme);

      // Apply theme to document
      const root = window.document.documentElement;
      const body = window.document.body;
      
      root.classList.remove('light', 'dark');
      root.classList.add(newResolvedTheme);
      
      body.classList.remove('light', 'dark');
      body.classList.add(newResolvedTheme);
      
      // Debug: Log theme changes
      console.log(`🎨 Theme changed to: ${newResolvedTheme}`, {
        theme,
        resolvedTheme: newResolvedTheme,
        htmlClass: root.className,
        bodyClass: body.className
      });
      
      // Update theme-color meta tag for mobile browsers
      const themeColor = newResolvedTheme === 'dark' ? '#1a1a1a' : '#E1E8F0';
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute('content', themeColor);
    };

    updateResolvedTheme();

    // Listen for system theme changes
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateResolvedTheme);
      return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'auto') {
      const systemTheme = getSystemTheme();
      setTheme(systemTheme === 'light' ? 'dark' : 'light');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};