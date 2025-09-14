'use client';

import Image from 'next/image';
import { useTranslations } from '@/hooks/useTranslations';

const WhyChooseUsSection = () => {
  const { t } = useTranslations();

  return (
    <section className="bg-white dark:bg-dark-900 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Visual */}
          <div className="relative order-2 lg:order-1">
            {/* Background Circle */}
            <div className="relative w-full max-w-lg mx-auto">
              {/* Pink Circle Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-pink-300 dark:from-pink-800/30 dark:to-pink-700/30 rounded-full transform scale-110"></div>
              
              {/* Orange Yellow Curve */}
              <div className="absolute -left-8 -top-8 w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M20 20 Q50 40 80 60 Q100 80 120 100"
                    stroke="url(#orangeGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FB923C" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Main Image */}
              <div className="relative z-10 pt-8 pl-8">
                <Image
                  src="/assets/images/orange.avif"
                  alt="Girl holding oranges"
                  width={400}
                  height={500}
                  className="w-full h-auto rounded-full object-cover"
                  priority
                />
              </div>

              {/* Product Card Overlay */}
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-large dark:shadow-none border border-gray-200 dark:border-dark-700 max-w-48 z-20">
                <div className="space-y-3">
                  {/* Strawberries Image */}
                  <div className="w-full h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-lg flex items-center justify-center">
                    <div className="w-16 h-16 relative">
                      {/* Simple strawberry representation */}
                      <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-500 rounded-full relative">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full"></div>
                        <div className="absolute top-1 left-1/4 w-1 h-1 bg-green-400 rounded-full"></div>
                        <div className="absolute top-1 right-1/4 w-1 h-1 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white font-supreme text-sm">{t('whyChooseUs.product.title')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-supreme">{t('whyChooseUs.product.subtitle')}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white font-supreme">{t('whyChooseUs.product.rating')}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white font-supreme">{t('whyChooseUs.product.price')}</span>
                  </div>
                  
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium font-supreme transition-all duration-200 transform hover:scale-105 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Tagline */}
            <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
              <span className="text-green-500 font-medium font-supreme text-sm uppercase tracking-wide">{t('whyChooseUs.tagline')}</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white font-supreme leading-tight">
                {t('whyChooseUs.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-supreme max-w-lg leading-relaxed">
                {t('whyChooseUs.description')}
              </p>
            </div>

            {/* CTA Button */}
            <div>
              <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-medium font-supreme transition-all duration-200 transform hover:scale-105 shadow-medium hover:shadow-large">
                {t('whyChooseUs.cta.exploreNow')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
