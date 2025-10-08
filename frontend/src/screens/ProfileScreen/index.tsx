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
    <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide safe-area" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Main Content Card */}
      <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
        <div className="bg-white rounded-b-[52px] px-6 pt-8 pb-8 mb-[52px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide">
          {/* Header */}
          <div className="mb-4" style={{ paddingTop: 'max(0rem, env(safe-area-inset-top, 0px))' }}>
            <Header
              title={t('profile.title')}
              // rightIcon="mdi:magnify"
              onRightIconClick={handleHeaderSearchClick}
            />
          </div>
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <Avatar
              src=""
              alt="Profile"
              name={user.firstName || user.username || 'User'}
              size="xl"
              className="shadow-md"
            />
            <div className="text-xl font-bold text-[#232c43] text-center mt-4">{user.firstName || user.username || 'User'}</div>
            <div className="text-sm text-gray-400 text-center mt-1">{user.email || ''}</div>
          </div>

          {/* Options List */}
          <div className="w-full flex flex-col gap-3">
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
      </div>
      {/* Bottom Navigation */}
      <TabBar current="Profile" />
    </div>
  );
};

export default ProfileScreen; 