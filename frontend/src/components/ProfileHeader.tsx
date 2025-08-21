import React from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  title, 
  showBackButton = true, 
  onBackClick 
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="flex items-center mb-6 pt-6 px-0">
      {showBackButton && (
        <button
          className="bg-white rounded-full p-2 mr-3 flex-shrink-0 shadow"
          onClick={handleBackClick}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Icon icon="mdi:arrow-left" className="text-xl text-[#232c43]" />
        </button>
      )}
      <h1 className="text-2xl font-bold text-[#232c43] leading-tight">
        {title}
      </h1>
    </div>
  );
};

export default ProfileHeader;
