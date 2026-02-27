import { useEffect } from 'react';
import { useSettings } from './useSettings';
import type { ThemeMode } from '../types';

export function useTheme() {
  const { theme, setSetting } = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    function apply(mode: ThemeMode) {
      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.remove('dark');
      } else {
        // system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      }
    }

    apply(theme);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches);
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  function setTheme(mode: ThemeMode) {
    setSetting('theme', mode);
  }

  return { theme, setTheme };
}
