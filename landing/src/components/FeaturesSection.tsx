'use client';

import { useTranslations } from '@/hooks/useTranslations';

const FeaturesSection = () => {
  const { t } = useTranslations();

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
          <text x="8" y="16" fontSize="8" fill="white" fontWeight="bold">FREE</text>
        </svg>
      ),
      title: t('features.freeShipping.title'),
      description: t('features.freeShipping.description'),
      isMiddle: false
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          <text x="12" y="16" fontSize="10" fill="white" fontWeight="bold">$</text>
        </svg>
      ),
      title: t('features.returns.title'),
      description: t('features.returns.description'),
      isMiddle: true
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          <circle cx="12" cy="14" r="2" fill="white"/>
        </svg>
      ),
      title: t('features.secureCheckout.title'),
      description: t('features.secureCheckout.description'),
      isMiddle: false
    }
  ];

  return (
    <section className="bg-orange-50 dark:bg-orange-900/20 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary-500 font-medium font-supreme mb-4">{t('features.tagline')}</p>
          <h2 className="text-3xl lg:text-5xl font-black text-gray-900 dark:text-white font-supreme leading-tight">
            {t('features.title')}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
            >
              {/* Rotating orange background */}
              <div className="absolute inset-0 bg-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12 scale-105"></div>
              
              {/* Card content */}
              <div className="relative bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-medium dark:shadow-none border border-gray-200 dark:border-dark-700 transition-all duration-300 group-hover:shadow-large z-10">
                {/* Icon */}
                <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-supreme">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-supreme leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
