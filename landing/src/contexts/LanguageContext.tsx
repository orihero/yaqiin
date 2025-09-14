'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'ru' | 'uz' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru'); // Default to Russian
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);
    
    // Check for saved language preference or default to Russian
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['ru', 'uz', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    // Save language preference
    localStorage.setItem('language', language);
  }, [language, isHydrated]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isHydrated }}>
      {children}
    </LanguageContext.Provider>
  );
};
