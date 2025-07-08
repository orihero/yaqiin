import React from 'react';
import { Icon } from '@iconify/react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightIconClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, rightIcon, onRightIconClick }) => (
  <div className="flex items-center mb-4 w-full">
    {onBack ? (
      <button className="mr-2 p-2 rounded-full bg-white shadow" onClick={onBack}>
        <Icon icon="mdi:arrow-left" className="text-2xl text-[#232c43]" />
      </button>
    ) : (
      <div className="w-10" />
    )}
    <h1 className="text-xl font-bold text-[#232c43] flex-1 text-center">{title}</h1>
    {rightIcon ? (
      <button className="ml-2 p-2 rounded-full bg-white shadow" onClick={onRightIconClick}>
        <Icon icon={rightIcon} className="text-2xl text-[#232c43]" />
      </button>
    ) : (
      <div className="w-10" />
    )}
  </div>
);

export default Header; 