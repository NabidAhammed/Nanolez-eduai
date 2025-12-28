// Custom hook for language management

import { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { storage } from '../utils/storage';

export function useLanguage() {
  const [appLanguage, setAppLanguageState] = useState('English');

  // Load language from storage on mount
  useEffect(() => {
    const savedLanguage = storage.getLanguage();
    setAppLanguageState(savedLanguage);
  }, []);

  const setAppLanguage = (language: string) => {
    setAppLanguageState(language);
    storage.setLanguage(language);
  };

  return {
    appLanguage,
    setAppLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
