import React from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

interface SearchFilterButtonProps {
  onClick?: () => void;
}

const SearchFilterButton: React.FC<SearchFilterButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button type="button" className="ml-2 flex items-center" onClick={onClick} aria-label={t('common.filter')}>
      <Icon icon="mdi:tune-variant" className="text-xl text-gray-400" />
    </button>
  );
};

export default SearchFilterButton; 