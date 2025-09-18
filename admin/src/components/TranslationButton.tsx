import React from 'react';
import { Icon } from '@iconify/react';

interface TranslationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  title?: string;
  autoTranslating?: boolean;
}

const TranslationButton: React.FC<TranslationButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  className = '',
  title = 'Translate',
  autoTranslating = false
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center p-2 rounded-md ${
        autoTranslating 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-blue-600 hover:bg-blue-700'
      } disabled:bg-gray-600 disabled:cursor-not-allowed text-white transition-colors ${className}`}
      title={autoTranslating ? 'Auto-translating...' : title}
    >
      {loading ? (
        <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />
      ) : autoTranslating ? (
        <Icon icon="material-symbols:auto-awesome" className="w-4 h-4 animate-pulse" />
      ) : (
        <Icon icon="material-symbols:translate" className="w-4 h-4" />
      )}
    </button>
  );
};

export default TranslationButton;
