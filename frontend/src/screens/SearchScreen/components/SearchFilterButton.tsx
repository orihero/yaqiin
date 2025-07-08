import React from 'react';
import { Icon } from '@iconify/react';

interface SearchFilterButtonProps {
  onClick?: () => void;
}

const SearchFilterButton: React.FC<SearchFilterButtonProps> = ({ onClick }) => (
  <button type="button" className="ml-2" onClick={onClick} aria-label="Filter">
    <Icon icon="mdi:tune-variant" className="text-xl text-gray-400" />
  </button>
);

export default SearchFilterButton; 