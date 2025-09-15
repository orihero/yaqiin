import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectAsyncProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (searchTerm: string) => Promise<Option[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  debounceMs?: number;
  initialOptions?: Option[];
}

const SearchableSelectAsync: React.FC<SearchableSelectAsyncProps> = ({
  value,
  onChange,
  onSearch,
  placeholder,
  className = '',
  disabled = false,
  debounceMs = 1000,
  initialOptions = []
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('common.select');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const debouncedSearch = useCallback(
    (term: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        if (term.trim()) {
          setIsLoading(true);
          try {
            const searchResults = await onSearch(term);
            setOptions(searchResults);
            setHasSearched(true);
          } catch (error) {
            console.error('Search error:', error);
            setOptions([]);
          } finally {
            setIsLoading(false);
          }
        } else {
          // If search term is empty, show initial options
          setOptions(initialOptions);
          setHasSearched(false);
        }
      }, debounceMs);
    },
    [onSearch, debounceMs, initialOptions]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  // Handle dropdown open
  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      // If we haven't searched yet and there are initial options, show them
      if (!hasSearched && initialOptions.length > 0) {
        setOptions(initialOptions);
      }
    }
  };

  // Handle dropdown close
  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    // Don't reset options to initialOptions if we have a selected value
    // This prevents the selected option from disappearing
    if (!value) {
      setOptions(initialOptions);
      setHasSearched(false);
    }
  };

  // Handle option selection
  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
    // Keep the selected option in the options array for display
    setOptions([option]);
    setHasSearched(false);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Ensure selected option is always available for display
  useEffect(() => {
    if (value && !options.find(option => option.value === value)) {
      // If we have a value but it's not in current options, try to find it in initial options
      const selectedOption = initialOptions.find(option => option.value === value);
      if (selectedOption) {
        setOptions([selectedOption]);
      }
    }
  }, [value, options, initialOptions]);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full bg-[#1a2236] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring flex items-center justify-between"
        disabled={disabled}
      >
        <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : defaultPlaceholder}
        </span>
        <Icon 
          icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} 
          className="ml-2" 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#232b42] border border-[#2e3650] rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-[#2e3650]">
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-[#1a2236] text-white px-3 py-2 rounded focus:outline-none focus:ring text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-3 text-center text-gray-400 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="mdi:loading" className="animate-spin" width={16} height={16} />
                  {t('common.searching', 'Searching...')}
                </div>
              </div>
            ) : options.length === 0 ? (
              <div className="px-4 py-2 text-gray-400 text-sm">
                {hasSearched ? t('common.noOptionsFound') : t('common.typeToSearch', 'Type to search...')}
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-2 hover:bg-[#2e3650] transition-colors ${
                    option.value === value ? 'bg-blue-600 text-white' : 'text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelectAsync;
