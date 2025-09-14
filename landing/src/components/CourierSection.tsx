'use client';

import Image from 'next/image';
import { useTranslations } from '@/hooks/useTranslations';

const CourierSection = () => {
  const { t } = useTranslations();

  return (
    <section className="bg-gray-50 dark:bg-dark-800 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Tagline */}
            <div className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-full">
              <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
              </svg>
              <span className="text-primary-500 font-medium font-supreme">{t('courier.tagline')}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white font-supreme leading-tight">
                {t('courier.title')}{' '}
                <span className="text-primary-500">{t('courier.titleHighlight')}</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-supreme max-w-lg leading-relaxed">
                {t('courier.description')}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium font-supreme">{t('courier.features.fastDelivery')}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium font-supreme">{t('courier.features.reliable')}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium font-supreme">{t('courier.features.tracking')}</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-full font-medium font-supreme transition-all duration-200 transform hover:scale-105 shadow-medium hover:shadow-large">
                {t('courier.cta.exploreNow')}
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
                {/* Courier Image */}
                <Image
                  src="/assets/images/courier.jpg"
                  alt="Professional courier with delivery bike"
                  width={500}
                  height={600}
                  className="w-full h-auto rounded-2xl"
                />

                {/* Delivery Stats Card */}
                <div className="absolute left-4 bottom-4 bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-medium dark:shadow-none border border-gray-200 dark:border-dark-700 max-w-48">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-900/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white font-supreme">{t('courier.stats.deliveryTime')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-supreme">{t('courier.stats.averageTime')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bike Delivery Info Card */}
                <div className="absolute top-4 right-4 bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-medium dark:shadow-none border border-gray-200 dark:border-dark-700">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white font-supreme">{t('courier.bikeDelivery.title')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-supreme">{t('courier.bikeDelivery.description')}</p>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-200 dark:bg-primary-800/20 rounded-full opacity-60"></div>
                <div className="absolute -top-2 -left-2 w-16 h-16 bg-accent-200 dark:bg-accent-800/20 rounded-full opacity-40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourierSection;
