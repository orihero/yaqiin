import React from 'react';
import { Icon } from '@iconify/react';

interface TabBarProps {
  current: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { key: 'Home', label: 'Home', icon: 'mdi:home' },
  { key: 'Search', label: 'Search', icon: 'mdi:magnify' },
  { key: 'My Cart', label: 'Cart', icon: 'mdi:cart' },
  { key: 'Profile', label: 'Profile', icon: 'mdi:account' },
];

const TabBar: React.FC<TabBarProps> = ({ current, onTabChange }) => (
  <div className="fixed bottom-0 left-0 w-full max-w-md mx-auto bg-white rounded-t-3xl shadow-lg flex justify-between items-center px-6 py-3 z-40">
    {tabs.map(tab => (
      <button
        key={tab.key}
        className={`flex flex-col items-center flex-1 ${current === tab.key ? 'text-[#ff7a00]' : 'text-[#232c43]'}`}
        onClick={() => onTabChange?.(tab.key)}
      >
        <Icon icon={tab.icon} className="text-2xl mb-1" />
        <span className="text-xs font-semibold">{tab.label}</span>
      </button>
    ))}
  </div>
);

export default TabBar; 