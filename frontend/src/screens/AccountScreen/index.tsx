import React from 'react';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AccountScreen: React.FC = () => {
  const navigate = useNavigate();
  const handleTabChange = (tab: string) => {
    if (tab === 'Home') navigate('/home');
    else if (tab === 'Search') navigate('/search');
    else if (tab === 'My Cart') navigate('/cart');
    else if (tab === 'Profile') navigate('/profile');
  };
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#232c43] flex flex-col items-center pt-6 pb-0">
      <div className="w-full max-w-md px-4">
        <Header title={t('account.title')} />
      </div>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col items-center relative z-10 mx-4">
        <div className="text-xl font-bold text-[#232c43] text-center mt-2 mb-4">{t('account.info')}</div>
        <div className="text-gray-400 text-center">{t('account.placeholder')}</div>
      </div>
      <TabBar current="Profile" onTabChange={handleTabChange} />
    </div>
  );
};

export default AccountScreen; 