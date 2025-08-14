import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../../assets/images/logo.png';


const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localStorage.getItem('onboardingCompleted')) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative">
      {/* Subtle pattern background (optional) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'60\' width=\'1\' height=\'120\' fill=\'%23e5e7eb\'/%3E%3Crect y=\'60\' width=\'120\' height=\'1\' fill=\'%23e5e7eb\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />
      <div className="relative z-10 flex flex-col items-center">
        <img src={Logo} alt="Logo" className="w-60 h-60" />
        <div className="mt-6 text-3xl font-bold text-[#232c43] tracking-wide">{t('loading.appName')}</div>
      </div>
    </div>
  );
};

export default LoadingScreen; 