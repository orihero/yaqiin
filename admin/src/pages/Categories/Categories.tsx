import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Category } from '@yaqiin/shared/types/category';
import { getCategories, createCategory, updateCategory, deleteCategory as deleteCategoryApi, bulkDeleteCategories, getCategoriesHierarchy, getCategoryProductCounts } from '../../services/categoryService';
import CategoryFormModal from './components/CategoryFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Icon } from '@iconify/react';

// Utility types for hierarchical structure
interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

// Utility functions for hierarchical organization
const organizeCategoriesHierarchy = (categories: Category[]): CategoryWithChildren[] => {
  const categoryMap = new Map<string, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // First pass: create map with children arrays
  categories.forEach(category => {
    categoryMap.set(category._id, { ...category, children: [] });
  });

  // Second pass: organize hierarchy
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category._id)!;
    
    if (category.parentId && categoryMap.has(category.parentId)) {
      // Has parent, add to parent's children
      const parent = categoryMap.get(category.parentId)!;
      parent.children.push(categoryWithChildren);
    } else {
      // No parent or parent not found, it's a root category
      rootCategories.push(categoryWithChildren);
    }
  });

  // Sort categories by sortOrder or name
  const sortCategories = (cats: CategoryWithChildren[]) => {
    return cats.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.uz.localeCompare(b.name.uz);
    });
  };

  // Recursively sort all levels
  const sortRecursively = (cats: CategoryWithChildren[]) => {
    sortCategories(cats);
    cats.forEach(cat => {
      if (cat.children.length > 0) {
        sortRecursively(cat.children);
      }
    });
  };

  sortRecursively(rootCategories);
  return rootCategories;
};

// Accordion component for category hierarchy
interface CategoryAccordionProps {
  categories: CategoryWithChildren[];
  selectedCategories: Set<string>;
  onSelectCategory: (categoryId: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  productCounts?: { [categoryId: string]: number };
  level?: number;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  categories,
  selectedCategories,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
  productCounts = {},
  level = 0
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Helper function to calculate total product count for a category (including children)
  const getTotalProductCount = (category: CategoryWithChildren): number => {
    let total = productCounts[category._id] || 0;
    
    // Add product counts from all children recursively
    const addChildrenCounts = (children: CategoryWithChildren[]) => {
      children.forEach(child => {
        total += productCounts[child._id] || 0;
        if (child.children.length > 0) {
          addChildrenCounts(child.children);
        }
      });
    };
    
    addChildrenCounts(category.children);
    return total;
  };

  const renderCategory = (category: CategoryWithChildren, index: number) => {
    const isExpanded = expandedCategories.has(category._id);
    const hasChildren = category.children.length > 0;
    const isSelected = selectedCategories.has(category._id);
    const indentLevel = level * 20;
    const directProductCount = productCounts[category._id] || 0;
    const totalProductCount = getTotalProductCount(category);

    return (
      <div key={category._id} className="border-b border-[#2e3650] last:border-b-0">
        <div 
          className={`flex items-center py-3 px-4 hover:bg-[#202840] transition ${
            isSelected ? 'bg-blue-900 bg-opacity-30' : ''
          }`}
          style={{ paddingLeft: `${16 + indentLevel}px` }}
        >
          {/* Checkbox */}
          <div className="flex items-center mr-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectCategory(category._id)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          {/* Expand/Collapse Button */}
          <div className="flex items-center mr-3">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(category._id)}
                className="text-gray-400 hover:text-white transition"
              >
                <Icon 
                  icon={isExpanded ? "mdi:chevron-down" : "mdi:chevron-right"} 
                  width={20} 
                  height={20} 
                />
              </button>
            ) : (
              <div className="w-5" /> // Spacer for alignment
            )}
          </div>

          {/* Category Icon */}
          <div className="flex items-center mr-3">
            {category.icon ? (
              <Icon icon={category.icon} width={20} height={20} className="text-blue-400" />
            ) : (
              <Icon icon="mdi:folder" width={20} height={20} className="text-gray-400" />
            )}
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-white truncate">
                  {category.name.uz}
                </h3>
                {category.description?.uz && (
                  <p className="text-sm text-gray-400 truncate">
                    {category.description.uz}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  category.isActive 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-red-900 text-red-300'
                }`}>
                  {category.isActive ? t('common.active') : t('common.inactive')}
                </span>
                {directProductCount > 0 && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                    {directProductCount} {t('categories.products', 'products')}
                  </span>
                )}
                {totalProductCount > directProductCount && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-300">
                    {totalProductCount} {t('categories.totalProducts', 'total')}
                  </span>
                )}
                {hasChildren && (
                  <span className="text-xs text-gray-400">
                    {category.children.length} {t('categories.subcategories', 'subcategories')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button 
              onClick={() => onEditCategory(category)} 
              className="p-1 hover:text-blue-400 transition" 
              title={t('common.edit')}
            >
              <Icon icon="mdi:pencil" width={18} height={18} />
            </button>
            <button 
              onClick={() => onDeleteCategory(category)} 
              className="p-1 hover:text-red-400 transition" 
              title={t('common.delete')}
            >
              <Icon icon="mdi:delete" width={18} height={18} />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="bg-[#1a1f2e]">
            <CategoryAccordion
              categories={category.children}
              selectedCategories={selectedCategories}
              onSelectCategory={onSelectCategory}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              productCounts={productCounts}
              level={level + 1}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {categories.map((category, index) => renderCategory(category, index))}
    </div>
  );
};

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all categories for hierarchical display
  const { data: allCategories, isLoading, error } = useQuery<Category[], Error>({
    queryKey: ['categories-hierarchy', search],
    queryFn: () => getCategoriesHierarchy(),
  });

  // Fetch product counts for categories
  const { data: productCounts } = useQuery<{ [categoryId: string]: number }, Error>({
    queryKey: ['category-product-counts'],
    queryFn: () => getCategoryProductCounts(),
  });

  // Organize categories into hierarchy
  const hierarchicalCategories = React.useMemo(() => {
    if (!allCategories) return [];
    
    let filteredCategories = allCategories;
    
    // Apply search filter
    if (search) {
      filteredCategories = allCategories.filter(category => 
        category.name.uz.toLowerCase().includes(search.toLowerCase()) ||
        category.name.ru.toLowerCase().includes(search.toLowerCase()) ||
        (category.description?.uz && category.description.uz.toLowerCase().includes(search.toLowerCase())) ||
        (category.description?.ru && category.description.ru.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    return organizeCategoriesHierarchy(filteredCategories);
  }, [allCategories, search]);

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (input: Partial<Category>) => {
      return createCategory(input);
    },
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['categories-hierarchy'] });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (input: Partial<Category> & { _id: string }) => {
      return updateCategory(input);
    },
    onSuccess: () => {
      setShowModal(false);
      setEditCategory(null);
      queryClient.invalidateQueries({ queryKey: ['categories-hierarchy'] });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (category: Category) => {
      if (!category || !category._id) throw new Error('Invalid category');
      return deleteCategoryApi(category._id);
    },
    onSuccess: () => {
      setDeleteCategory(null);
      queryClient.invalidateQueries({ queryKey: ['categories-hierarchy'] });
    },
  });

  // Bulk delete categories mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (categoryIds: string[]) => bulkDeleteCategories(categoryIds),
    onSuccess: () => {
      setSelectedCategories(new Set());
      setShowBulkDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ['categories-hierarchy'] });
    },
  });

  // Helper function to get all category IDs from hierarchy
  const getAllCategoryIds = (categories: CategoryWithChildren[]): string[] => {
    const ids: string[] = [];
    const traverse = (cats: CategoryWithChildren[]) => {
      cats.forEach(cat => {
        ids.push(cat._id);
        if (cat.children.length > 0) {
          traverse(cat.children);
        }
      });
    };
    traverse(categories);
    return ids;
  };

  const handleSelectAll = () => {
    const allIds = getAllCategoryIds(hierarchicalCategories);
    if (selectedCategories.size === allIds.length) {
      // If all are selected, deselect all
      setSelectedCategories(new Set());
    } else {
      // Select all
      setSelectedCategories(new Set(allIds));
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(true);
  };

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">📂 {t('categories.title')}</h1>
          {selectedCategories.size > 0 && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {selectedCategories.size} selected
            </span>
          )}
        </div>
        <div className="flex gap-3">
          {selectedCategories.size > 0 && (
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              <Icon icon="mdi:delete-sweep" className="inline-block mr-2" /> 
              🗑️ Delete Selected ({selectedCategories.size})
            </button>
          )}
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
            onClick={() => { setEditCategory(null); setShowModal(true); }}
          >
            <Icon icon="mdi:plus" className="inline-block mr-2" /> ➕ {t('categories.addCategory')}
          </button>
        </div>
      </div>
      <div className="mb-4 flex items-center">
        <input
          className="bg-[#232b42] text-white px-4 py-2 rounded-lg w-80 focus:outline-none focus:ring"
          placeholder={t('categories.searchCategory', 'Search Category')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="ml-4 text-gray-400">{t('navigation.dashboard')} • <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs ml-2">{t('categories.title')}</span></span>
      </div>
      <div className="bg-[#232b42] rounded-xl overflow-hidden">
        {/* Header with select all checkbox */}
        <div className="border-b border-[#2e3650] px-4 py-3 bg-[#1a2236]">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={hierarchicalCategories.length > 0 && selectedCategories.size === getAllCategoryIds(hierarchicalCategories).length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-300">
              {t('common.selectAll', 'Select All')}
            </span>
          </div>
        </div>

        {/* Accordion Content */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="text-2xl mb-4">⏳</div>
              <div className="text-lg font-medium text-gray-300">{t('common.loading')}</div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-2xl mb-4 text-red-400">❌</div>
              <div className="text-lg font-medium text-red-400">{String(error.message)}</div>
            </div>
          ) : !hierarchicalCategories.length ? (
            <div className="text-center py-16 text-gray-400">
              <div className="flex flex-col items-center">
                <Icon icon="mdi:folder-outline" className="text-5xl mb-4" />
                <div className="text-lg font-medium">📭 {t('categories.noCategoriesFound', 'No categories found.')}</div>
                <div className="text-sm">Click "Add Category" to create your first category</div>
              </div>
            </div>
          ) : (
            <CategoryAccordion
              categories={hierarchicalCategories}
              selectedCategories={selectedCategories}
              onSelectCategory={handleSelectCategory}
              onEditCategory={(category) => { setEditCategory(category); setShowModal(true); }}
              onDeleteCategory={setDeleteCategory}
              productCounts={productCounts}
            />
          )}
        </div>
      </div>
      {/* Category Modal (Add) */}
      <CategoryFormModal
        open={showModal && !editCategory}
        mode="add"
        loading={createCategoryMutation.status === 'pending'}
        error={createCategoryMutation.isError ? (createCategoryMutation.error as any)?.message : null}
        details={createCategoryMutation.isError ? (createCategoryMutation.error as any)?.details : null}
        onClose={() => setShowModal(false)}
        onSubmit={(values) => createCategoryMutation.mutate(values)}
      />
      {/* Category Modal (Edit) */}
      <CategoryFormModal
        open={showModal && !!editCategory}
        mode="edit"
        loading={updateCategoryMutation.status === 'pending'}
        error={updateCategoryMutation.isError ? (updateCategoryMutation.error as any)?.message : null}
        details={updateCategoryMutation.isError ? (updateCategoryMutation.error as any)?.details : null}
        initialValues={editCategory}
        onClose={() => {
          setShowModal(false);
          setEditCategory(null);
        }}
        onSubmit={(values) => updateCategoryMutation.mutate({ ...values, _id: editCategory?._id })}
      />
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteCategory}
        title={t('categories.deleteCategory')}
        description={t('categories.confirmDeleteCategory', 'Are you sure you want to delete this category? This action cannot be undone.')}
        loading={deleteCategoryMutation.status === 'pending'}
        onCancel={() => setDeleteCategory(null)}
        onConfirm={() => deleteCategory && deleteCategoryMutation.mutate(deleteCategory)}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showBulkDeleteDialog}
        title={`🗑️ Bulk Delete Categories`}
        description={`⚠️ Are you sure you want to delete ${selectedCategories.size} selected categories? This action cannot be undone.`}
        loading={bulkDeleteMutation.isPending}
        onCancel={() => setShowBulkDeleteDialog(false)}
        onConfirm={() => bulkDeleteMutation.mutate(Array.from(selectedCategories))}
      />
    </div>
  );
} 