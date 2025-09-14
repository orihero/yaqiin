'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

const HeroSection = () => {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<'clients' | 'business'>('clients');

  return (
    <section className="bg-white dark:bg-dark-900 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Switch Component */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-dark-800 rounded-full p-1 shadow-medium dark:shadow-none border border-gray-200 dark:border-dark-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-6 py-3 rounded-full font-medium font-supreme transition-all duration-200 ${
                  activeTab === 'clients'
                    ? 'bg-primary-500 text-white shadow-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-500'
                }`}
              >
                {t('hero.switch.forClients')}
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`px-6 py-3 rounded-full font-medium font-supreme transition-all duration-200 ${
                  activeTab === 'business'
                    ? 'bg-primary-500 text-white shadow-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-500'
                }`}
              >
                {t('hero.switch.forBusiness')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Tagline */}
            <div className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-full">
              <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-primary-500 font-medium font-supreme">{t('hero.tagline')}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white font-supreme leading-tight">
                {t('hero.title')}{' '}
                <span className="text-primary-500">{t('hero.titleHighlight')}</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-supreme max-w-lg leading-relaxed">
                {t('hero.description')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-6">
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-full font-medium font-supreme transition-all duration-200 transform hover:scale-105 shadow-medium hover:shadow-large">
                {t('hero.cta.orderNow')}
              </button>
              <button className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors duration-200 group">
                <div className="w-12 h-12 bg-white dark:bg-dark-800 border-2 border-gray-200 dark:border-dark-700 rounded-full flex items-center justify-center hover:border-primary-500 transition-colors duration-200 group-hover:shadow-medium">
                  <svg className="w-5 h-5 text-accent-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z" />
                  </svg>
                </div>
                <span className="font-medium font-supreme">{t('hero.cta.orderProcess')}</span>
              </button>
            </div>
          </div>

          {/* Right Visual Area */}
          <div className="relative">
            {/* Background Shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-200 to-accent-300 dark:from-accent-800/20 dark:to-accent-700/20 rounded-3xl transform rotate-3 scale-105 opacity-20"></div>
            
            {/* Main Image Container */}
            <div className="relative z-10 bg-white dark:bg-dark-800 rounded-3xl p-8 shadow-large dark:shadow-none border border-gray-200 dark:border-dark-700">
              <div className="relative">
                {/* Hero Image */}
                <Image
                  src="/assets/images/hero.jpg"
                  alt="Chef with fresh groceries"
                  width={500}
                  height={600}
                  className="w-full h-auto rounded-2xl"
                  priority
                />

                {/* Product Card Overlay */}
                <div className="absolute left-4 bottom-4 bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-medium dark:shadow-none border border-gray-200 dark:border-dark-700 max-w-48">
                  <div className="space-y-3">
                    <Image
                      src="/assets/images/hero.jpg"
                      alt={t('hero.product.freshOrange')}
                      width={100}
                      height={80}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white font-supreme">{t('hero.product.freshOrange')}</h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white font-supreme">{t('hero.product.price')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-supreme">{t('hero.product.freeShipping')}</p>
                    </div>
                    <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium font-supreme transition-all duration-200 transform hover:scale-105">
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Delivery Info Overlay */}
                <div className="absolute top-4 right-4 bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-medium dark:shadow-none border border-gray-200 dark:border-dark-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white font-supreme">{t('hero.delivery.title')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-supreme">{t('hero.delivery.time')}</p>
                    </div>
                  </div>
                </div>

                {/* Dashed Line */}
                <svg className="absolute top-16 right-8 w-32 h-32 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="5,5">
                  <path d="M0 0 Q50 30 100 60 Q150 90 200 120" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
