'use client';

import Image from 'next/image';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { Icon } from '@iconify/react';

const Header = () => {
  const [cartItems] = useState(2); // Mock cart items count
  const { t } = useTranslations();

  return (
    <header className="w-full bg-white dark:bg-dark-900 shadow-soft dark:shadow-none border-b border-gray-200 dark:border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <Image
                src="/assets/images/logo.png"
                alt={t('header.logo')}
                width={120}
                height={120}
                className="w-12 h-12"
              />
              <span className="text-xl font-black text-gray-900 dark:text-white font-supreme">{t('header.logo')}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-primary-500 font-medium font-supreme">{t('header.navigation.home')}</a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors duration-200 font-supreme">{t('header.navigation.menu')}</a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors duration-200 font-supreme">{t('header.navigation.service')}</a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors duration-200 font-supreme">{t('header.navigation.shop')}</a>
          </nav>

          {/* Search, Language Selector, Theme Toggle, and Cart */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t('header.search.placeholder')}
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white rounded-xl text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-supreme transition-all duration-200"
              />
            </div>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
