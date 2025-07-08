import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useQuery as useRQ } from '@tanstack/react-query';
import ProductCard from '../../components/ProductCard';
import { getProducts } from '../../services/productService';
import type { Product } from '@yaqiin/shared/types/product';
import SearchFilterButton from './components/SearchFilterButton';
import { useCartStore } from '../../store/cartStore';
import FilterBottomSheet from './components/FilterBottomSheet';
import { getAllCategories } from '../../services/categoryService';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';

const SearchScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [queryFilters, setQueryFilters] = useState({ search: '', categoryId: null as string | null, priceRange: [10, 50] as [number, number] });
  const { data, isLoading } = useRQ({
    queryKey: ['products', queryFilters],
    queryFn: () => getProducts(1, 20, queryFilters.search, queryFilters.categoryId || undefined),
    enabled: true,
  });

  const addToCart = useCartStore(state => state.addToCart);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 50]);
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch categories
  const { data: categoriesData } = useRQ({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories,
  });
  const categories = categoriesData || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryFilters(f => ({ ...f, search }));
  };

  const handleAdd = (product: Product) => {
    addToCart(product);
  };

  const handleApplyFilters = () => {
    setQueryFilters(f => ({ ...f, categoryId: selectedCategory, priceRange }));
    setFilterOpen(false);
  };

  const handleHeaderSearchClick = () => {
    inputRef.current?.focus();
  };
  const handleTabChange = (tab: string) => {
    if (tab === 'Home') navigate('/');
    else if (tab === 'Search') navigate('/search');
    else if (tab === 'My Cart') navigate('/cart');
    else if (tab === 'Profile') navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-md px-4 pt-6 pb-2 flex flex-col">
        <Header
          title="Search"
          onBack={() => window.history.back()}
          rightIcon="mdi:magnify"
          onRightIconClick={handleHeaderSearchClick}
        />
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full px-4 py-2 shadow mb-2">
          <Icon icon="mdi:magnify" className="text-xl text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 outline-none bg-transparent text-base"
            placeholder="Fresh lemon"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <SearchFilterButton onClick={() => setFilterOpen(true)} />
        </form>
      </div>
      {/* Product Grid */}
      <div className="w-full max-w-md px-4 pb-24">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {data?.data?.length ? (
              data.data.map((product: Product) => (
                <ProductCard key={product._id} product={product} onAdd={handleAdd} onClick={() => navigate(`/product/${product._id}`)} />
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-400 py-8">No products found.</div>
            )}
          </div>
        )}
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
      <TabBar current="Search" onTabChange={handleTabChange} />
    </div>
  );
};

export default SearchScreen; 