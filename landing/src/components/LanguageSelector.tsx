'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Icon } from '@iconify/react';

const LanguageSelector = () => {
  const { language, setLanguage, isHydrated } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'ru', name: 'Русский', flag: 'flag:ru-4x3' },
    { code: 'uz', name: 'O\'zbekcha', flag: 'flag:uz-4x3' },
    { code: 'en', name: 'English', flag: 'flag:us-4x3' }
  ] as const;

  const currentLanguage = languages.find(lang => lang.code === language);

  // Show loading state until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-dark-800">
        <div className="w-5 h-5 animate-pulse bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-16 h-4 animate-pulse bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-4 h-4 animate-pulse bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors duration-200"
        aria-label="Select language"
      >
        <Icon icon={currentLanguage?.flag} className="w-5 h-4" />
        <span className="text-sm font-medium font-supreme">{currentLanguage?.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-large border border-gray-200 dark:border-dark-700 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                language === lang.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon icon={lang.flag} className="w-5 h-4" />
              <span className="font-medium font-supreme">{lang.name}</span>
              {language === lang.code && (
                <svg className="w-4 h-4 ml-auto text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;
