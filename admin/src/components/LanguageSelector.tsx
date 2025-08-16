import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: t('languages.en'), flag: '🇺🇸' },
    { code: 'uz', name: t('languages.uz'), flag: '🇺🇿' },
    { code: 'ru', name: t('languages.ru'), flag: '🇷🇺' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 text-gray-100 hover:text-cyan-400 transition-colors rounded-lg hover:bg-[#2a3441] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
        aria-label={t('common.language')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">
          {currentLanguage.flag}
        </span>
        <span className="hidden md:block text-sm font-medium">
          {currentLanguage.name}
        </span>
        <Icon 
          icon="mdi:chevron-down" 
          className={`text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[#232c43] border border-gray-700 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[#2a3441] transition-colors focus:outline-none focus:bg-[#2a3441] ${
                  i18n.language === language.code
                    ? 'text-cyan-400 bg-[#2a3441]'
                    : 'text-gray-300 hover:text-cyan-400'
                }`}
                role="menuitem"
              >
                <span className="text-lg">{language.flag}</span>
                <span className="text-sm font-medium">{language.name}</span>
                {i18n.language === language.code && (
                  <Icon icon="mdi:check" className="text-cyan-400 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
