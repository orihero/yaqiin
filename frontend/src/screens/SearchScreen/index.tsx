import React, { useState, useRef } from 'react';
import debounce from 'lodash.debounce';
import { Icon } from '@iconify/react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { formatPrice } from '@yaqiin/shared/utils/formatPrice';
import { getProducts } from '../../services/productService';
import type { Product } from '@yaqiin/shared/types/product';
import SearchFilterButton from './components/SearchFilterButton';
import { useCartStore } from '../../store/cartStore';
import FilterBottomSheet from './components/FilterBottomSheet';
import { getAllCategories } from '../../services/categoryService';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BottomSheet from '../HomeScreen/components/BottomSheet';
import TabBar from '../../components/TabBar';
import { useUserStore } from '../../store/userStore';

const SearchScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [queryFilters, setQueryFilters] = useState({ search: '', categoryId: null as string | null, priceRange: [10, 50] as [number, number] });
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useUserStore(state => state.user);
  const shopId = user?.shopId;

  // Infinite query for products
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', queryFilters, shopId],
    queryFn: ({ pageParam = 1 }) => getProducts(pageParam, 20, queryFilters.search, queryFilters.categoryId || undefined, shopId),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!shopId,
  });
  const products = data?.pages?.flatMap(page => page.data) ?? [];

  // Infinite scroll logic
  const listRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleScroll = () => {
      const el = listRef.current;
      if (!el || isLoading || isFetchingNextPage || !hasNextPage) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < 200) {
        fetchNextPage();
      }
    };
    const el = listRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Cart and BottomSheet logic
  const addToCart = useCartStore(state => state.addToCart);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const handleAddClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSheetOpen(true);
  };
  const handleConfirm = () => {
    if (selectedProduct) {
      try {
        addToCart(selectedProduct, quantity);
        setSheetOpen(false);
        setSelectedProduct(null);
      } catch (error: any) {
        console.error('Failed to add to cart:', error);
        alert(error.message || t('common.addToCartFailed'));
      }
    }
  };

  // Filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 50]);
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories,
  });
  const categories = categoriesData || [];

  // Debounced search handler
  const debouncedSetSearch = useRef(
    debounce((value: string) => {
      setQueryFilters(f => ({ ...f, search: value }));
    }, 400)
  ).current;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSetSearch(e.target.value);
  };
  const handleApplyFilters = () => {
    setQueryFilters(f => ({ ...f, categoryId: selectedCategory, priceRange }));
    setFilterOpen(false);
  };

  return (
    <div className="h-screen flex flex-col scrollbar-hide">
      <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col scrollbar-hide">
        {/* Compact Navy Header with inline search bar */}
        <div className="w-full flex items-center px-4 pt-6 pb-4" style={{ background: '#232c43', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px' }}>
          <button
            className="bg-white bg-opacity-100 rounded-full p-2 mr-3 flex-shrink-0"
            onClick={() => window.history.back()}
            style={{ height: 40, width: 40 }}
          >
            <Icon icon="mdi:arrow-left" className="text-[#232c43] text-2xl" />
          </button>
          <div className="flex items-center bg-white rounded-full shadow-lg px-4 py-2 flex-1">
            <Icon icon="mdi:magnify" className="text-xl text-gray-400 mr-2" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 outline-none bg-transparent text-base text-[#232c43]"
              placeholder={t('search.placeholder')}
              value={search}
              onChange={handleInputChange}
            />
            {/* <SearchFilterButton onClick={() => setFilterOpen(true)} /> */}
          </div>
        </div>
        <div
          ref={listRef}
          className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col overflow-auto scrollbar-hide"
          style={{ minHeight: 'calc(100vh - 70px)', maxHeight: 'calc(100vh - 70px)' }}
        >
          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-2 text-center text-gray-400 py-8">{t('search.loading')}</div>
            ) : products.length ? (
              products.map((product: Product) => {
                const key = product._id || product.name?.uz || String(product.name) || 'product';
                const nameObj = product.name as unknown as Record<string, string>;
                const lang = i18n.language;
                const displayName = nameObj[lang] || nameObj.uz || nameObj.ru || Object.values(nameObj)[0] || 'Product';
                return (
                  <div
                    key={key}
                    className="bg-[#f8f8f8] rounded-2xl pt-0 pb-2 flex flex-col border border-gray-100 cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div className="w-full h-36 rounded-t-2xl overflow-hidden mb-3 bg-transparent">
                      <img
                        src={
                          product.images?.[0] ||
                          'https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png'
                        }
                        alt={displayName}
                        className="w-full h-full object-cover rounded-t-2xl"
                        onError={e => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            'https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png';
                        }}
                      />
                    </div>
                    <div className="p-2 flex flex-col">
                      <div className="text-[#232c43] font-semibold text-base mb-1 text-left w-full">
                        {displayName}
                      </div>
                      <div className="flex items-center w-full justify-between mt-auto">
                        <span className="text-[#ff7a00] font-bold text-base">
                          {formatPrice(product.price || product.basePrice)}
                          <span className="text-xs font-normal text-gray-400">
                            /{product.unit}
                          </span>
                        </span>
                        <button
                          className="bg-[#ff7a00] rounded-lg p-2 flex items-center justify-center ml-2"
                          style={{ width: 32, height: 32 }}
                          onClick={e => {
                            e.stopPropagation();
                            handleAddClick(product);
                          }}
                        >
                          <Icon icon="mdi:plus" className="text-white text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center text-gray-400 py-8">{t('search.noProducts')}</div>
            )}
          </div>
          {isFetchingNextPage && (
            <div className="flex justify-center items-center py-4">
              <Icon icon="mdi:loading" className="animate-spin text-2xl text-[#232c43]" />
            </div>
          )}
          {!hasNextPage && products.length > 0 && (
            <div className="text-center text-gray-400 py-4">{t('home.noMoreProducts')}</div>
          )}
        </div>
      </div>
      <FilterBottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        onApply={handleApplyFilters}
      />
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {selectedProduct && (
          <div className="flex flex-col items-center">
            <img
              src={
                selectedProduct.images?.[0] ||
                'https://via.placeholder.com/80x80?text=No+Image'
              }
              alt={
                selectedProduct.name?.uz ||
                selectedProduct.name?.ru ||
                t('productCard.product')
              }
              className="w-20 h-20 rounded-xl object-cover mb-2"
            />
            <div className="font-semibold text-lg text-[#232c43] mb-1">
              {selectedProduct.name?.uz ||
                selectedProduct.name?.ru ||
                t('productCard.product')}
            </div>
            <div className="text-[#ff7a00] font-bold text-base mb-2">
              ${
                selectedProduct.price?.toFixed
                  ? selectedProduct.price.toFixed(2)
                  : selectedProduct.price
              }
              <span className="text-xs font-normal text-gray-400">
                /{t('productCard.kg')}
              </span>
            </div>
            {/* Quantity controls */}
            <div className="flex flex-row items-center gap-4 my-4">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#232c43] text-white text-xl font-bold"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Icon icon="mdi:minus" />
              </button>
              <input
                type="text"
                value={quantity}
                className="min-w-4 max-w-20 outline-none text-right text-[#333]"
                onChange={e => setQuantity(Number(e.target.value || 1))}
              />
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#232c43] text-white text-xl font-bold"
                onClick={() => setQuantity(q => q + 1)}
              >
                <Icon icon="mdi:plus" />
              </button>
            </div>
            <button
              className="w-full bg-[#ff7a00] text-white rounded-full py-3 text-lg font-bold mt-2"
              onClick={handleConfirm}
            >
              {t('productCard.addToCart')}
            </button>
          </div>
        )}
      </BottomSheet>
      <TabBar current="Search" />
    </div>
  );
};

export default SearchScreen; 