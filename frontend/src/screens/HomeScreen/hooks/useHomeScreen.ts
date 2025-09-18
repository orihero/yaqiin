import { useState, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getProducts } from '../../../services/productService';
import { getAllCategories } from '../../../services/categoryService';
import { Product } from '@yaqiin/shared/types/product';
import type { ProductListResponse } from '../../../services/productService';
import { useUserStore } from '../../../store/userStore';

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_KEY = 'yaqiin_cart';

function loadCart(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(loadCart());

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product._id === product._id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const clearCart = () => setCart([]);

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
  };
}

export function useHomeScreen() {
  // Use empty string for 'All products' (default)
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [activeNav, setActiveNav] = useState('Home');

  // Get user from store
  const user = useUserStore(state => state.user);
  const shopId = user?.shopId;

  // Fetch categories from backend (only active categories)
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories', 'all', 'active'],
    queryFn: () => getAllCategories(true), // Only get active categories
  });
  // Prepend 'All products' pseudo-category
  const allProductsCategory = {
    _id: '',
    name: { uz: 'Barcha mahsulotlar', ru: 'Все продукты' },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Filter to show only active main categories (parentId is null or undefined and isActive is true)
  const mainCategories = categoriesData?.filter(cat => !cat.parentId && cat.isActive) || [];
  const categories = [allProductsCategory, ...mainCategories];

  // Find the selected category object (except for 'All products')
  const selectedCategory = mainCategories.find(cat => cat.name.uz === activeCategory || cat.name.ru === activeCategory);
  const selectedCategoryId = activeCategory && selectedCategory ? selectedCategory._id : undefined;

  // Get active subcategories for the selected main category
  const subcategories = categoriesData?.filter(cat => 
    cat.parentId && selectedCategory && cat.parentId === selectedCategory._id && cat.isActive
  ) || [];

  // Find the selected subcategory object
  const selectedSubcategory = subcategories.find(cat => cat.name.uz === activeSubcategory || cat.name.ru === activeSubcategory);
  const selectedSubcategoryId = activeSubcategory && selectedSubcategory ? selectedSubcategory._id : undefined;

  // Infinite query for products
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['products', selectedCategoryId, selectedSubcategoryId, shopId],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) => getProducts(pageParam, 8, '', selectedSubcategoryId || selectedCategoryId, shopId),
    getNextPageParam: (lastPage: ProductListResponse) => {
      if (!lastPage.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!shopId, // Only fetch if shopId is available
  });
  // Flatten products
  const products = data?.pages?.flatMap(page => page.data) ?? [];

  return {
    activeCategory,
    setActiveCategory,
    activeSubcategory,
    setActiveSubcategory,
    activeNav,
    setActiveNav,
    products,
    isLoading,
    isError,
    error,
    categories,
    subcategories,
    selectedCategory,
    isLoadingCategories,
    isCategoriesError,
    categoriesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
} 