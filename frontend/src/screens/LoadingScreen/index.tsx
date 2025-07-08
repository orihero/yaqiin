import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Placeholder SVG logo
const Logo = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="36" fill="#232c43" />
    <path d="M36 18C27.1634 18 20 25.1634 20 34C20 42.8366 27.1634 50 36 50C44.8366 50 52 42.8366 52 34C52 25.1634 44.8366 18 36 18ZM36 46C29.3726 46 24 40.6274 24 34C24 27.3726 29.3726 22 36 22C42.6274 22 48 27.3726 48 34C48 40.6274 42.6274 46 36 46Z" fill="#38bdf8" />
    <circle cx="48" cy="24" r="6" fill="#38bdf8" />
  </svg>
);

const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
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
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'60\' width=\'1\' height=\'120\' fill=\'%23e5e7eb\'/%3E%3Crect y=\'60\' width=\'120\' height=\'1\' fill=\'%23e5e7eb\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat'}} />
      <div className="relative z-10 flex flex-col items-center">
        <Logo />
        <div className="mt-6 text-3xl font-bold text-[#232c43] tracking-wide">Gronur</div>
      </div>
    </div>
  );
};

export default LoadingScreen; 