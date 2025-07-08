import React from 'react';
import { Icon } from '@iconify/react';
import { useHomeScreen } from './hooks/useHomeScreen';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '@yaqiin/shared/utils/formatPrice';
import BottomSheet from './components/BottomSheet';
import { Product } from '@yaqiin/shared/types/product';

const HomeScreen = () => {
  const {
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
  } = useHomeScreen();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  // BottomSheet state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  // Open sheet with product
  const handleAddClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSheetOpen(true);
  };
  // Confirm add/update
  const handleConfirm = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity);
      setSheetOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleHeaderSearchClick = () => {
    navigate('/search');
  };
  const handleTabChange = (tab: string) => {
    if (tab === 'Home') navigate('/');
    else if (tab === 'Search') navigate('/search');
    else if (tab === 'My Cart') navigate('/cart');
    else if (tab === 'Profile') navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col relative">
      {/* Header */}
      <Header
        title="Daily Grocery Food"
        rightIcon="mdi:magnify"
        onRightIconClick={handleHeaderSearchClick}
      />
      {/* Main Content Card */}
      <div className="max-w-md mx-auto w-full px-0 pt-6 pb-0 flex-1 flex flex-col">
        <div
          className="bg-white rounded-3xl shadow-lg px-4 pt-6 pb-8 mb-[88px] flex-1 flex flex-col"
          style={{ minHeight: 'calc(100vh - 110px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#232c43] leading-tight">
                Daily<br />Grocery Food
              </h1>
            </div>
            <div
              className="bg-white rounded-full p-3 shadow flex items-center justify-center"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <Icon icon="mdi:magnify" className="text-2xl text-[#232c43]" />
            </div>
          </div>
          {/* Category Tabs */}
          <div className="flex gap-3 mb-6 overflow-x-auto pl-1 pr-4 scrollbar-hide">
            {isLoadingCategories && (
              <span className="text-gray-400 text-sm">Loading categories...</span>
            )}
            {isCategoriesError && (
              <span className="text-red-400 text-sm">{categoriesError instanceof Error ? categoriesError.message : 'Failed to load categories.'}</span>
            )}
            {categories.map((cat) => {
              // Support pseudo-category for 'All products'
              const isAll = cat._id === '';
              const key = isAll ? 'all-products' : cat._id || cat.name?.uz || String(cat.name) || 'cat';
              const label = isAll ? (cat.name?.uz || 'Barcha mahsulotlar') : (cat.name?.uz || String(cat.name) || '');
              return (
                <button
                  key={key}
                  className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                    (isAll ? activeCategory === '' : activeCategory === label)
                      ? 'bg-[#232c43] text-white shadow'
                      : 'bg-white text-[#232c43] border border-gray-200'
                  }`}
                  onClick={() => setActiveCategory(isAll ? '' : label)}
                  style={{ width: 'fit-content' }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {/* Popular Fruits Section */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#232c43]">Popular Fruits</h2>
            <button className="text-sm text-[#232c43] opacity-60 font-semibold">
              See all
            </button>
          </div>
          {/* Loading/Error States */}
          {isLoading && (
            <div className="text-center text-gray-400 py-8">Loading products...</div>
          )}
          {isError && (
            <div className="text-center text-red-400 py-8">{error instanceof Error ? error.message : 'Failed to load products.'}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => {
              const key = product._id || product.name?.uz || String(product.name) || 'product';
              const displayName = product.name?.uz || product.name?.ru || (typeof product.name === 'string' ? product.name : '') || 'Product';
              return (
                <div
                  key={key}
                  className="bg-[#f8f8f8] bg-gray-100 rounded-2xl pt-0 pb-4 flex flex-col min-h-[260px] border border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="w-full h-36 rounded-t-2xl overflow-hidden mb-3 bg-transparent">
                    <img
                      src={product.images?.[0] || 'https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png'}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-t-2xl"
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png';
                      }}
                    />
                  </div>
                  <div className="p-2 flex flex-col">
                    <div className="text-[#232c43] font-semibold text-base mb-1 text-left w-full">
                      {displayName}
                    </div>
                    <div className="flex items-center w-full justify-between mt-auto">
                      <span className="text-[#ff7a00] font-bold text-base">
                        {formatPrice(product.price)}
                        <span className="text-xs font-normal text-gray-400">/{product.unit}</span>
                      </span>
                      <button
                        className="bg-[#ff7a00] rounded-full p-2 flex items-center justify-center ml-2"
                        style={{ width: 36, height: 36 }}
                        onClick={e => { e.stopPropagation(); handleAddClick(product); }}
                      >
                        <Icon icon="mdi:plus" className="text-white text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Bottom Navigation */}
      <TabBar current="Home" onTabChange={handleTabChange} />
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {selectedProduct && (
          <div className="flex flex-col items-center">
            <img
              src={selectedProduct.images?.[0] || 'https://via.placeholder.com/80x80?text=No+Image'}
              alt={selectedProduct.name?.uz || selectedProduct.name?.ru || 'Product'}
              className="w-20 h-20 rounded-xl object-cover mb-2"
            />
            <div className="font-semibold text-lg text-[#232c43] mb-1">{selectedProduct.name?.uz || selectedProduct.name?.ru || 'Product'}</div>
            <div className="text-[#ff7a00] font-bold text-base mb-2">
              ${selectedProduct.price?.toFixed ? selectedProduct.price.toFixed(2) : selectedProduct.price}
              <span className="text-xs font-normal text-gray-400">/kg</span>
            </div>
            {/* Quantity controls */}
            <div className="flex flex-row items-center gap-4 my-4">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#232c43] text-white text-xl font-bold"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Icon icon="mdi:minus" />
              </button>
              <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
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
              Add to Cart
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default HomeScreen;