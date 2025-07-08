import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@yaqiin/shared/types/user';
import React from 'react';
import { fetchCurrentUser } from '../../services/userService';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';
import { useNavigate } from 'react-router-dom';
import { useAuthCheck } from '../../hooks/useAuthCheck';

const options = [
  {
    icon: 'mdi:account-circle',
    label: 'Account Information',
    onClick: () => {},
  },
  {
    icon: 'mdi:map-marker',
    label: 'Delivery Address',
    onClick: () => {},
  },
  {
    icon: 'mdi:credit-card',
    label: 'Payment Method',
    onClick: () => {},
  },
  {
    icon: 'mdi:lock',
    label: 'Password',
    onClick: () => {},
  },
  {
    icon: 'mdi:account-multiple',
    label: 'Reference Friends',
    onClick: () => {},
  },
];

const ProfileScreen: React.FC = () => {
  const { authError } = useAuthCheck();
  const { data: user, isLoading, isError } = useQuery<User>({ queryKey: ['currentUser'], queryFn: fetchCurrentUser });
  const navigate = useNavigate();
  const handleHeaderSearchClick = () => {
    navigate('/search');
  };
  const handleTabChange = (tab: string) => {
    if (tab === 'Home') navigate('/');
    else if (tab === 'Search') navigate('/search');
    else if (tab === 'My Cart') navigate('/cart');
    else if (tab === 'Profile') navigate('/profile');
  };

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
        <span className="text-white text-lg">Loading...</span>
      </div>
    );
  }
  if (isError || !user) {
    return (
      <div className="min-h-screen bg-[#232c43] flex items-center justify-center">
        <span className="text-white text-lg">Failed to load profile</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#232c43] flex flex-col items-center pt-6 pb-0">
      {/* Header */}
      <div className="w-full max-w-md px-4">
        <Header
          title="Profile"
          rightIcon="mdi:magnify"
          onRightIconClick={handleHeaderSearchClick}
        />
      </div>
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6 flex flex-col items-center relative z-10 mx-4">
        <img
          src={'https://via.placeholder.com/96x96?text=Avatar'}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md -mt-16 mb-2"
        />
        <div className="text-xl font-bold text-[#232c43] text-center mt-2">{user.firstName || user.username || 'User'}</div>
        <div className="text-sm text-gray-400 text-center mb-6">{user.email || ''}</div>
        <div className="w-full flex flex-col gap-3 mb-8">
          {options.map((opt) => (
            <button
              key={opt.label}
              className="flex items-center w-full bg-[#f3f4f6] rounded-xl px-4 py-3 text-left focus:outline-none hover:bg-gray-100 transition"
              onClick={opt.onClick}
            >
              <Icon icon={opt.icon} className="text-[#232c43] text-xl mr-4" />
              <span className="flex-1 text-base font-semibold text-[#232c43]">{opt.label}</span>
              <Icon icon="mdi:chevron-right" className="text-gray-400 text-2xl" />
            </button>
          ))}
        </div>
        <button className="w-full bg-[#232c43] text-white rounded-full py-4 text-lg font-bold shadow-md mt-2">Log Out</button>
      </div>
      <TabBar current="Profile" onTabChange={handleTabChange} />
    </div>
  );
};

export default ProfileScreen; 