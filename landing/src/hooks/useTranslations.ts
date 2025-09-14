'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useMemo } from 'react';

// Import all translation files
import ruTranslations from '@/locales/ru/common.json';
import uzTranslations from '@/locales/uz/common.json';
import enTranslations from '@/locales/en/common.json';

const translations = {
  ru: ruTranslations,
  uz: uzTranslations,
  en: enTranslations,
};

export const useTranslations = () => {
  const { language, isHydrated } = useLanguage();

  const t = useMemo(() => {
    return (key: string): string => {
      // Return key as fallback during SSR/hydration
      if (!isHydrated) {
        return key;
      }

      const keys = key.split('.');
      let value: unknown = translations[language];
      
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }
      
      return (typeof value === 'string' ? value : key);
    };
  }, [language, isHydrated]);

  return { t, language, isHydrated };
};
