import { useState, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getProducts } from '../../../services/productService';
import { getAllCategories } from '../../../services/categoryService';
import { Product } from '@yaqiin/shared/types/product';
import type { ProductListResponse } from '../../../services/productService';

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
  const [activeNav, setActiveNav] = useState('Home');

  // Fetch categories from backend
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => getAllCategories(),
  });
  // Prepend 'All products' pseudo-category
  const allProductsCategory = {
    _id: '',
    name: { uz: 'Barcha mahsulotlar', ru: 'Все продукты' },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const categories = categoriesData ? [allProductsCategory, ...categoriesData] : [allProductsCategory];

  // Find the selected category object (except for 'All products')
  const selectedCategory = categoriesData?.find(cat => cat.name.uz === activeCategory || cat.name.ru === activeCategory);
  const selectedCategoryId = activeCategory && selectedCategory ? selectedCategory._id : undefined;

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
    queryKey: ['products', selectedCategoryId],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) => getProducts(pageParam, 8, '', selectedCategoryId),
    getNextPageParam: (lastPage: ProductListResponse) => {
      if (!lastPage.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: true,
  });
  // Flatten products
  const products = data?.pages?.flatMap(page => page.data) ?? [];

  return {
    activeCategory,
    setActiveCategory,
    activeNav,
    setActiveNav,
    products,
    isLoading,
    isError,
    error,
    categories,
    isLoadingCategories,
    isCategoriesError,
    categoriesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
} 