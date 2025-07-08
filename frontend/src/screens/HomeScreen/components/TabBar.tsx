import React from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export type TabBarTab = 'Home' | 'Order' | 'My Cart' | 'Profile';

interface TabBarProps {
  current: TabBarTab;
}

const TabBar: React.FC<TabBarProps> = ({ current }) => {
  const navigate = useNavigate();
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#232c43] rounded-t-[32px] py-3 px-4 flex justify-between items-center z-10 mx-auto"
      style={{ height: 72, boxShadow: '0 -2px 16px rgba(35,44,67,0.10)' }}
    >
      <button
        className="flex-1 flex flex-col items-center justify-center"
        onClick={() => navigate('/home')}
      >
        <span className={current === 'Home' ? 'bg-white rounded-full p-2 flex items-center justify-center mb-1' : ''}>
          <Icon
            icon={current === 'Home' ? 'mdi:home' : 'mdi:home-outline'}
            className={`text-2xl ${current === 'Home' ? 'text-[#232c43]' : 'text-gray-400'}`}
          />
        </span>
        <span className={`text-xs mt-1 font-bold ${current === 'Home' ? 'text-white' : 'text-gray-400'}`}>Home</span>
      </button>
      <button
        className="flex-1 flex flex-col items-center justify-center"
        onClick={() => navigate('/orders')}
      >
        <span className={current === 'Order' ? 'bg-white rounded-full p-2 flex items-center justify-center mb-1' : ''}>
          <Icon
            icon={current === 'Order' ? 'mdi:clipboard-list' : 'mdi:clipboard-list-outline'}
            className={`text-2xl ${current === 'Order' ? 'text-[#232c43]' : 'text-gray-400'}`}
          />
        </span>
        <span className={`text-xs mt-1 font-bold ${current === 'Order' ? 'text-white' : 'text-gray-400'}`}>Order</span>
      </button>
      <button
        className="flex-1 flex flex-col items-center justify-center"
        onClick={() => navigate('/cart')}
      >
        <span className={current === 'My Cart' ? 'bg-white rounded-full p-2 flex items-center justify-center mb-1' : ''}>
          <Icon
            icon={current === 'My Cart' ? 'mdi:cart' : 'mdi:cart-outline'}
            className={`text-2xl ${current === 'My Cart' ? 'text-[#232c43]' : 'text-gray-400'}`}
          />
        </span>
        <span className={`text-xs mt-1 font-bold ${current === 'My Cart' ? 'text-white' : 'text-gray-400'}`}>My Cart</span>
      </button>
      <button
        className="flex-1 flex flex-col items-center justify-center"
        onClick={() => navigate('/profile')}
      >
        <span className={current === 'Profile' ? 'bg-white rounded-full p-2 flex items-center justify-center mb-1' : ''}>
          <Icon
            icon={current === 'Profile' ? 'mdi:account' : 'mdi:account-outline'}
            className={`text-2xl ${current === 'Profile' ? 'text-[#232c43]' : 'text-gray-400'}`}
          />
        </span>
        <span className={`text-xs mt-1 font-bold ${current === 'Profile' ? 'text-white' : 'text-gray-400'}`}>Profile</span>
      </button>
    </nav>
  );
};

export default TabBar; 