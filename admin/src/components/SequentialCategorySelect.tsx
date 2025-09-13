import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@yaqiin/shared/types/category';
import { getCategoriesByParent, searchCategoriesByParent, getInitialCategories, getAllCategories } from '../services/categoryService';
import SearchableSelectAsync from './SearchableSelectAsync';

interface SequentialCategorySelectProps {
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  open?: boolean;
  excludeId?: string; // For preventing circular references in category forms
}

interface CategoryOption {
  value: string;
  label: string;
}

const SequentialCategorySelect: React.FC<SequentialCategorySelectProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  open = true,
  excludeId
}) => {
  const { t } = useTranslation();
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);

  // Fetch initial main categories (root categories)
  const { data: initialMainCategories = [] } = useQuery<Category[]>({
    queryKey: ['initial-main-categories', excludeId],
    queryFn: () => getCategoriesByParent(null, excludeId), // Get root categories (parentId is null/empty)
    enabled: open,
  });

  // Fetch all categories to help with initialization
  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['all-categories'],
    queryFn: getAllCategories,
    enabled: open,
  });

  // Fetch subcategories when main category is selected
  const { data: subCategories = [] } = useQuery<Category[]>({
    queryKey: ['subcategories', selectedMainCategory],
    queryFn: () => getCategoriesByParent(selectedMainCategory),
    enabled: open && !!selectedMainCategory,
  });

  // Initialize the component with the current value (only once and not during user interaction)
  useEffect(() => {
    if (!isInitialized && !isUserInteracting && initialMainCategories.length > 0 && allCategories.length > 0) {
      if (value && value !== '') {
        // Check if it's a main category (root category with parentId null/empty)
        const mainCategory = initialMainCategories.find(cat => cat._id === value);
        if (mainCategory) {
          setSelectedMainCategory(value);
          setSelectedSubCategory('');
        } else {
          // The value might be a subcategory, find its parent
          const subcategory = allCategories.find(cat => cat._id === value);
          if (subcategory && subcategory.parentId) {
            // It's a subcategory, set the parent as main category and this as subcategory
            setSelectedMainCategory(subcategory.parentId);
            setSelectedSubCategory(value);
          } else {
            // Unknown category, treat as main category
            setSelectedMainCategory(value);
            setSelectedSubCategory('');
          }
        }
      } else {
        // Empty value means no selection
        setSelectedMainCategory('');
        setSelectedSubCategory('');
      }
      setIsInitialized(true);
    }
  }, [value, initialMainCategories, allCategories, isInitialized, isUserInteracting]);

  // Prevent re-initialization when value changes due to user interaction
  useEffect(() => {
    // If we already have selections and the value matches our current subcategory or main category,
    // don't re-initialize
    if (isInitialized && value) {
      if (selectedSubCategory && value === selectedSubCategory) {
        // Value matches our subcategory selection, don't re-initialize
        return;
      }
      if (selectedMainCategory && value === selectedMainCategory && !selectedSubCategory) {
        // Value matches our main category selection and we have no subcategory, don't re-initialize
        return;
      }
    }
  }, [value, isInitialized, selectedMainCategory, selectedSubCategory]);

  // Handle main category selection
  const handleMainCategoryChange = (mainCategoryId: string) => {
    setIsUserInteracting(true);
    setSelectedMainCategory(mainCategoryId);
    setSelectedSubCategory('');
    // Always set the main category as the selected value
    // If user later selects a subcategory, it will override this
    onChange(mainCategoryId);
    // Reset user interaction flag after a short delay
    setTimeout(() => setIsUserInteracting(false), 100);
  };

  // Handle subcategory selection
  const handleSubCategoryChange = (subCategoryId: string) => {
    setIsUserInteracting(true);
    setSelectedSubCategory(subCategoryId);
    // Set the subcategory as the final selected value
    onChange(subCategoryId);
    // Reset user interaction flag after a short delay
    setTimeout(() => setIsUserInteracting(false), 100);
  };

  // Search function for main categories
  const handleMainCategorySearch = async (searchTerm: string): Promise<CategoryOption[]> => {
    try {
      const searchResults = await searchCategoriesByParent(searchTerm, null, excludeId); // null means root categories (parentId is null/empty)
      
      const options: CategoryOption[] = [];
      
      // Add "No Parent" option if searching for it and excludeId is provided (editing categories)
      if (excludeId && t('categories.noParent', 'No Parent (Root Category)').toLowerCase().includes(searchTerm.toLowerCase())) {
        options.push({ 
          value: '', 
          label: t('categories.noParent', 'No Parent (Root Category)') 
        });
      }
      
      // Add main categories (those with parentId null/empty)
      options.push(...searchResults.map(category => ({
        value: category._id,
        label: category.name.uz,
      })));
      
      return options;
    } catch (error) {
      console.error('Main category search error:', error);
      return [];
    }
  };

  // Search function for subcategories
  const handleSubCategorySearch = async (searchTerm: string): Promise<CategoryOption[]> => {
    try {
      const searchResults = await searchCategoriesByParent(searchTerm, selectedMainCategory);
      return searchResults.map(category => ({
        value: category._id,
        label: category.name.uz,
      }));
    } catch (error) {
      console.error('Subcategory search error:', error);
      return [];
    }
  };

  // Format initial main categories
  const initialMainOptions: CategoryOption[] = React.useMemo(() => {
    const options: CategoryOption[] = [];
    
    // Add "No Parent" option for creating root categories (only when excludeId is provided - i.e., when editing categories)
    if (excludeId) {
      options.push({ 
        value: '', 
        label: t('categories.noParent', 'No Parent (Root Category)') 
      });
    }
    
    // Add main categories (those with parentId null/empty)
    options.push(...initialMainCategories
      .filter(category => category._id !== excludeId)
      .map(category => ({
        value: category._id,
        label: category.name.uz,
      }))
    );
    
    return options;
  }, [initialMainCategories, excludeId, t]);

  // Format subcategories
  const subCategoryOptions: CategoryOption[] = React.useMemo(() => {
    return subCategories.map(category => ({
      value: category._id,
      label: category.name.uz,
    }));
  }, [subCategories]);

  // Reset subcategory when main category changes
  useEffect(() => {
    // Only reset subcategory if the main category actually changed
    // This prevents clearing when the same main category is selected
    setSelectedSubCategory('');
  }, [selectedMainCategory]);

  // Reset initialization and user interaction when modal is closed
  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      setIsUserInteracting(false);
    }
  }, [open]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Category Selection */}
      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          {t('categories.mainCategory', 'Main Category')} *
        </label>
        <SearchableSelectAsync
          value={selectedMainCategory}
          onChange={handleMainCategoryChange}
          onSearch={handleMainCategorySearch}
          initialOptions={initialMainOptions}
          placeholder={t('categories.selectMainCategory', 'Select main category')}
          className="w-full"
          debounceMs={1000}
          disabled={disabled}
        />
      </div>

      {/* Subcategory Selection */}
      {selectedMainCategory && (
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            {t('categories.subCategory', 'Sub Category')}
            <span className="text-gray-400 text-xs ml-1">
              ({t('categories.optional', 'optional')})
            </span>
          </label>
          <SearchableSelectAsync
            value={selectedSubCategory}
            onChange={handleSubCategoryChange}
            onSearch={handleSubCategorySearch}
            initialOptions={subCategoryOptions}
            placeholder={t('categories.selectSubCategory', 'Select subcategory (optional)')}
            className="w-full"
            debounceMs={1000}
            disabled={disabled}
          />
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-1">
              Debug: Main: {selectedMainCategory}, Sub: {selectedSubCategory}, Value: {value}
            </div>
          )}
        </div>
      )}

      {/* Clear Selection Button */}
      {(selectedMainCategory || selectedSubCategory) && (
        <div>
          <button
            type="button"
            onClick={() => {
              setIsUserInteracting(true);
              setSelectedMainCategory('');
              setSelectedSubCategory('');
              onChange(''); // Clear the selected value
              // Reset user interaction flag after a short delay
              setTimeout(() => setIsUserInteracting(false), 100);
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
            disabled={disabled}
          >
            {t('categories.clearSelection', 'Clear selection')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SequentialCategorySelect;
