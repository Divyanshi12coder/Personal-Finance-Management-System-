'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type Theme = 'light' | 'dark';
interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within Providers');
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('finpilot-theme') as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('finpilot-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
    </QueryClientProvider>
  );
}
