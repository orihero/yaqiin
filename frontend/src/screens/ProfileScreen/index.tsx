import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@yaqiin/shared/types/user';
import React from 'react';
import { fetchCurrentUser } from '../../services/userService';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';
import { useNavigate } from 'react-router-dom';
import { useAuthCheck } from '../../hooks/useAuthCheck';
import { useCartStore } from '../../store/cartStore';
import { useTranslation } from 'react-i18next';
import Avatar from './components/Avatar';

const ProfileScreen: React.FC = () => {
  const { authError } = useAuthCheck();
  const { data: user, isLoading, isError } = useQuery<User>({ queryKey: ['currentUser'], queryFn: fetchCurrentUser });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleHeaderSearchClick = () => {
    navigate('/search');
  };
  const handleTabChange = (tab: string) => {
    if (tab === 'Home') navigate('/');
    else if (tab === 'Search') navigate('/search');
    else if (tab === 'My Cart') navigate('/cart');
    else if (tab === 'Profile') navigate('/profile');
  };
  const cart = useCartStore(state => state.cart);

  if (authError) {
    return (
      <div className="min-h-screen bg-[#232c43] flex items-center justify-center">
        <span className="text-white text-lg text-center px-4">{authError}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#232c43] flex items-center justify-center">
        <span className="text-white text-lg">{t('profile.loading')}</span>
      </div>
    );
  }
  if (isError || !user) {
    return (
      <div className="min-h-screen bg-[#232c43] flex items-center justify-center">
        <span className="text-white text-lg">{t('profile.failedToLoad')}</span>
      </div>
    );
  }

  const options = [
    {
      icon: 'mdi:account-circle',
      label: t('profile.account'),
      onClick: (navigate: (path: string) => void) => navigate('/account'),
    },
    {
      icon: 'mdi:store',
      label: t('profile.myShop'),
      onClick: (navigate: (path: string) => void) => navigate('/my-shop'),
    },
    {
      icon: 'mdi:clipboard-list',
      label: t('profile.orders'),
      onClick: (navigate: (path: string) => void) => navigate('/orders'),
    },
    {
      icon: 'mdi:cog',
      label: t('profile.settings'),
      onClick: (navigate: (path: string) => void) => navigate('/settings'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#232c43] flex flex-col items-center pt-6 pb-0">
      {/* Header */}
      <div className="w-full max-w-md px-4">
        <Header
          title={t('profile.title')}
          // rightIcon="mdi:magnify"
          onRightIconClick={handleHeaderSearchClick}
        />
      </div>
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col items-center relative z-10 mx-4">
        <div className="-mt-16 mb-2">
          <Avatar
            src=""
            alt="Profile"
            name={user.firstName || user.username || 'User'}
            size="xl"
            className="border-4 border-white shadow-md"
          />
        </div>
        <div className="text-xl font-bold text-[#232c43] text-center mt-2">{user.firstName || user.username || 'User'}</div>
        <div className="text-sm text-gray-400 text-center mb-6">{user.email || ''}</div>
        <div className="w-full flex flex-col gap-3 mb-8">
          {options.map((opt) => (
            <button
              key={opt.label}
              className="flex items-center w-full bg-[#f3f4f6] rounded-xl px-4 py-3 text-left focus:outline-none hover:bg-gray-100 transition"
              onClick={() => opt.onClick(navigate)}
            >
              <Icon icon={opt.icon} className="text-[#232c43] text-xl mr-4" />
              <span className="flex-1 text-base font-semibold text-[#232c43]">{opt.label}</span>
              <Icon icon="mdi:chevron-right" className="text-gray-400 text-2xl" />
            </button>
          ))}
        </div>
        {/* Logout button moved to settings page */}
      </div>
      <TabBar current="Profile" />
    </div>
  );
};

export default ProfileScreen; 