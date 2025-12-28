// Custom hook for theme management

import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  // Load theme from storage on mount
  useEffect(() => {
    const savedTheme = storage.getTheme();
    setThemeState(savedTheme);
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    storage.setTheme(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}
