import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

function Header() {
  const { t } = useTranslation();

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logout clicked');
    // You can redirect to login page or clear auth tokens
    // window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-[#232c43] flex items-center justify-between px-8 border-b border-gray-800 text-gray-100 font-semibold text-lg sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-cyan-400 text-xl">🏢</span>
        <span className="text-gray-100 text-lg font-semibold">{t('navigation.admin')} {t('common.panel')}</span>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSelector />

        <div className="flex items-center gap-2">
          <span className="text-gray-100 text-sm font-medium">👤 {t('common.adminUser')}</span>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-gray-100 hover:text-cyan-400 transition-colors rounded-lg hover:bg-[#2a3441] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
          aria-label={t('common.logout')}
        >
          <span className="text-sm">🚪</span>
          <span className="hidden md:block text-sm font-medium">{t('common.logout')}</span>
        </button>
      </div>
    </header>
  );
}

export default Header; 