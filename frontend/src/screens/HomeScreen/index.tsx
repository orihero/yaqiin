import React from "react";
import { Icon } from "@iconify/react";
import { useHomeScreen } from "./hooks/useHomeScreen";
import { useNavigate } from "react-router-dom";
import TabBar from "../../components/TabBar";
import { useCartStore } from "../../store/cartStore";
import { formatProductPrice } from "@yaqiin/shared/utils/formatProductPrice";
import BottomSheet from "./components/BottomSheet";
import { Product } from "@yaqiin/shared/types/product";
import { useTranslation } from 'react-i18next';

const HomeScreen = () => {
    const {
        activeCategory,
        setActiveCategory,
        activeSubcategory,
        setActiveSubcategory,
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
    } = useHomeScreen();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { addToCart } = useCartStore();

    // BottomSheet state
    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [selectedProduct, setSelectedProduct] =
        React.useState<Product | null>(null);
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

    // Infinite scroll logic
    const listRef = React.useRef<HTMLDivElement>(null);
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

    return (
        <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide safe-area" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            {/* Main Content Card */}
            <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
                <div
                    ref={listRef}
                    className="bg-white rounded-b-[52px] px-4  pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
                    style={{
                        minHeight: "calc(100vh - 140px)",
                        maxHeight: "calc(100vh - 140px)",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between " style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top, 0px))' }}>
                        <div>
                            <h1 className="text-xl font-bold text-[#232c43] leading-tight">
                                {t('home.title1')} {t('home.title2')}
                            </h1>
                        </div>
                    </div>
                    {/* Category Tabs */}
                    <div className="flex gap-3 overflow-x-auto pl-1 pr-4 mb-4 scrollbar-hide items-center min-h-14 sticky top-0 bg-[#fff] z-45">
                        {isLoadingCategories && (
                            <span className="text-gray-400 text-sm">
                                {t('home.loadingCategories')}
                            </span>
                        )}
                        {isCategoriesError && (
                            <span className="text-red-400 text-sm">
                                {categoriesError instanceof Error
                                    ? categoriesError.message
                                    : t('home.failedToLoadCategories')}
                            </span>
                        )}
                        {categories.map((cat) => {
                            // Support pseudo-category for 'All products'
                            const isAll = cat._id === "";
                            const key = isAll
                                ? "all-products"
                                : cat._id ||
                                cat.name?.uz ||
                                String(cat.name.uz) ||
                                "cat";
                            let label = t('home.allProducts');
                            if (!isAll) {
                                // Try to use the user's language, fallback to uz, ru, or any available
                                const lang = i18n.language;
                                const nameObj = cat.name as Record<string, string>;
                                label = nameObj[lang] || nameObj.uz || nameObj.ru || Object.values(nameObj)[0] || "";
                            }
                            return (
                                <button
                                    key={key}
                                    className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all ${(
                                        isAll
                                            ? activeCategory === ""
                                            : activeCategory === label
                                    )
                                        ? "bg-[#232c43] text-white shadow"
                                        : "bg-white text-[#232c43] border border-gray-200"
                                        }`}
                                    onClick={() => {
                                        setActiveCategory(isAll ? "" : label);
                                        setActiveSubcategory(""); // Reset subcategory when main category changes
                                    }}
                                    style={{ width: "fit-content" }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Subcategories Row - Only show when a main category is selected */}
                    {activeCategory && subcategories.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pl-1 pr-4 pb-2 scrollbar-hide items-center min-h-14">
                            <button
                                className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                                    activeSubcategory === ""
                                        ? "bg-[#232c43] text-white shadow"
                                        : "bg-white text-[#232c43] border border-gray-200"
                                }`}
                                onClick={() => setActiveSubcategory("")}
                                style={{ width: "fit-content" }}
                            >
                                {(() => {
                                    const lang = i18n.language;
                                    const nameObj = selectedCategory?.name as Record<string, string>;
                                    const parentName = nameObj?.[lang] || nameObj?.uz || nameObj?.ru || Object.values(nameObj || {})[0] || "";
                                    return `All ${parentName}`;
                                })()}
                            </button>
                            {subcategories.map((subcat) => {
                                const key = subcat._id || subcat.name?.uz || String(subcat.name.uz) || "subcat";
                                const lang = i18n.language;
                                const nameObj = subcat.name as Record<string, string>;
                                const label = nameObj[lang] || nameObj.uz || nameObj.ru || Object.values(nameObj)[0] || "";
                                
                                return (
                                    <button
                                        key={key}
                                        className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                                            activeSubcategory === label
                                                ? "bg-[#232c43] text-white shadow"
                                                : "bg-white text-[#232c43] border border-gray-200"
                                        }`}
                                        onClick={() => setActiveSubcategory(label)}
                                        style={{ width: "fit-content" }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Popular Fruits Section */}
                    {/*
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-[#232c43]">
                            {t('home.popularFruits')}
                        </h2>
                        See all button removed 
                    </div>*/}
                    {/* Loading/Error States */}
                    {isLoading && (
                        <div className="text-center text-gray-400 py-8">
                            {t('home.loadingProducts')}
                        </div>
                    )}
                    {isError && (
                        <div className="text-center text-red-400 py-8">
                            {error instanceof Error
                                ? error.message
                                : t('home.failedToLoadProducts')}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        {products.map((product) => {
                            const key =
                                product._id ||
                                product.name?.uz ||
                                String(product.name) ||
                                "product";
                            const nameObj = product.name as unknown as Record<string, string>;
                            const lang = i18n.language;
                            const displayName = nameObj[lang] || nameObj.uz || nameObj.ru || Object.values(nameObj)[0] || "Product";
                            return (
                                <div
                                    key={key}
                                    className="bg-[#f8f8f8] rounded-2xl pt-0 pb-2 flex flex-col border border-gray-100 cursor-pointer"
                                    onClick={() =>
                                        navigate(`/product/${product._id}`)
                                    }
                                >
                                    <div className="w-full h-36 rounded-t-2xl overflow-hidden mb-3 bg-transparent">
                                        <img
                                            src={
                                                product.images?.[0] ||
                                                "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png"
                                            }
                                            alt={displayName}
                                            className="w-full h-full object-cover rounded-t-2xl"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src =
                                                    "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png";
                                            }}
                                        />
                                    </div>
                                    <div className="p-2 flex flex-col">
                                        <div className="text-[#232c43] font-semibold text-base mb-1 text-left w-full h-10 overflow-hidden" style={{ lineHeight: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {displayName}
                                        </div>
                                        <div className="flex items-center w-full justify-between mt-auto">
                                            <span className="text-[#ff7a00] font-bold text-sm">
                                                {formatProductPrice(product).price}
                                                <span className="text-xs font-normal text-gray-400">
                                                    /{formatProductPrice(product).unit}
                                                </span>
                                            </span>
                                            <button
                                                className="bg-[#ff7a00] rounded-lg p-2 flex items-center justify-center ml-2"
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddClick(product);
                                                }}
                                            >
                                                <Icon
                                                    icon="mdi:plus"
                                                    className="text-white text-lg"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {isFetchingNextPage && (
                        <div className="flex justify-center items-center py-4">
                            <Icon icon="mdi:loading" className="animate-spin text-2xl text-[#232c43]" />
                        </div>
                    )}
                    {/* {!hasNextPage && products.length > 0 && (
                        <div className="text-center text-gray-400 py-4">{t('home.noMoreProducts')}</div>
                    )} */}
                </div>
            </div>
            {/* Bottom Navigation */}
            <TabBar current="Home" />
            <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
                {selectedProduct && (
                    <div className="flex flex-col items-center">
                        <img
                            src={
                                selectedProduct.images?.[0] ||
                                "https://via.placeholder.com/80x80?text=No+Image"
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
                                "Product"}
                        </div>
                        <div className="text-[#ff7a00] font-bold text-base mb-2">
                            {formatProductPrice(selectedProduct).price}
                            <span className="text-xs font-normal text-gray-400">
                                /{formatProductPrice(selectedProduct).unit}
                            </span>
                        </div>
                        {/* Quantity controls */}
                        <div className="flex flex-row items-center gap-4 my-4">
                            <button
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#232c43] text-white text-xl font-bold"
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                            >
                                <Icon icon="mdi:minus" />
                            </button>
                            {/* <span className="text-2xl font-bold w-8 text-center">
                                {quantity}
                            </span> */}
                            <input
                                type="text"
                                value={quantity}
                                className="min-w-4 max-w-20 outline-none text-right text-[#333]"
                                onChange={(e) =>
                                    setQuantity(() =>
                                        Number(e.target.value || 1)
                                    )
                                }
                            />
                            <button
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#232c43] text-white text-xl font-bold"
                                onClick={() => setQuantity((q) => q + 1)}
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
        </div>
    );
};

export default HomeScreen;
