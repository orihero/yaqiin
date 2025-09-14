'use client';

import { useTranslations } from '@/hooks/useTranslations';

const AppDownloadSection = () => {
  const { t } = useTranslations();

  return (
    <section className="bg-gray-50 dark:bg-dark-800 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Phone Frame */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white dark:bg-gray-100 rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone Screen Content Placeholder */}
                  <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm font-supreme">
                        {t('appDownload.phonePlaceholder')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl"></div>
                  
                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-500 rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-accent-400 rounded-full opacity-10"></div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-8">
            {/* Tagline */}
            <div className="inline-flex items-center">
              <span className="text-primary-500 font-medium font-supreme text-sm uppercase tracking-wide">
                {t('appDownload.tagline')}
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white font-supreme leading-tight">
                {t('appDownload.title')}{' '}
                <span className="text-primary-500">{t('appDownload.titleHighlight')}</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-supreme max-w-lg leading-relaxed">
                {t('appDownload.description')}
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* App Store Button */}
              <button className="flex items-center space-x-4 bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 border border-gray-200 dark:border-dark-600 rounded-xl px-6 py-4 transition-all duration-200 hover:shadow-medium group">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-supreme">Download on the</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white font-supreme">App Store</div>
                </div>
              </button>

              {/* Google Play Button */}
              <button className="flex items-center space-x-4 bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 border border-gray-200 dark:border-dark-600 rounded-xl px-6 py-4 transition-all duration-200 hover:shadow-medium group">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.5 12l2.198-2.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-supreme">GET IT ON</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white font-supreme">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
