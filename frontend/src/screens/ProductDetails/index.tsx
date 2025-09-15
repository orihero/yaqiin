import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductDetails, useRelatedProducts } from "./hooks/useProductDetails";
import { useCartStore } from "../../store/cartStore";
import { Icon } from "@iconify/react";
import { useTranslation } from 'react-i18next';
import ProductCard from "../../components/ProductCard";
import { formatProductPrice } from "@yaqiin/shared/utils/formatProductPrice";
import BottomSheet from "../HomeScreen/components/BottomSheet";
import { toast } from 'react-toastify';

const ProductDetails: React.FC = () => {
    const { id: productId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        data: product,
        isLoading,
        isError,
        error,
    } = useProductDetails(productId || "");
    const {
        data: relatedProducts,
        isLoading: isLoadingRelated,
        isError: isRelatedError,
    } = useRelatedProducts(productId || "");
    const { cart, addToCart, updateQuantity, removeFromCart } = useCartStore();
    const { t } = useTranslation();

    // Check if product is in cart and get its quantity
    const cartItem = cart.find(item => item.product._id === productId);
    const isInCart = !!cartItem;
    const cartQuantity = cartItem?.quantity || 0;

    // BottomSheet state
    const [sheetOpen, setSheetOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    
    // Full-screen image state
    const [fullscreenImageOpen, setFullscreenImageOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (isLoading) return <div className="text-center py-12">{t('productDetails.loading')}</div>;
    if (isError || !product)
        return (
            <div className="text-center text-red-400 py-12">
                {error instanceof Error ? error.message : t('productDetails.notFound')}
            </div>
        );

    // Open sheet with product
    const handleAddClick = () => {
        setSelectedProduct(product);
        setQuantity(1);
        setSheetOpen(true);
    };

    // Confirm add/update
    const handleConfirm = () => {
        try {
            const productToAdd = selectedProduct || product;
            addToCart(productToAdd, quantity);
            setSheetOpen(false);
            setSelectedProduct(null);
            toast.success(t('productCard.addedToCartSuccess'), {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            toast.error(error.message || t('common.addToCartFailed'), {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const handleGoToCart = () => {
        navigate('/cart');
    };

    // Handle image click to open fullscreen
    const handleImageClick = (index: number = 0) => {
        setCurrentImageIndex(index);
        setFullscreenImageOpen(true);
    };

    // Navigate between images
    const handlePreviousImage = () => {
        if (product.images && product.images.length > 0) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? product.images!.length - 1 : prev - 1
            );
        }
    };

    const handleNextImage = () => {
        if (product.images && product.images.length > 0) {
            setCurrentImageIndex((prev) => 
                prev === product.images!.length - 1 ? 0 : prev + 1
            );
        }
    };

    return (
        <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide safe-area" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Product Image */}
                <div className="w-full bg-white h-70 rounded-b-[60px] flex flex-col items-center justify-center overflow-hidden">
                    <img
                        src={
                            product.images?.[0] ||
                            "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png"
                        }
                        alt={product.name.uz}
                        className="w-full h-70 object-contain cursor-pointer"
                        onClick={() => handleImageClick(0)}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                                "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png";
                        }}
                    />
                </div>
                {/* Product Info */}
                <div className="max-w-md mx-auto w-full bg-white  px-4 pt-6 pb-8 mb-20">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl font-bold text-[#232c43]">
                                {product.name.uz}
                            </h1>
                        </div>
                        <div className="text-sm text-gray-400 mb-4">
                            {product.isActive
                                ? t('productDetails.available')
                                : t('productDetails.outOfStock')}
                        </div>
                        <div className="mb-4">
                            <h2 className="font-bold text-[#232c43] mb-1">
                                {t('productDetails.description')}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {product.description?.uz || ""}
                            </p>
                        </div>
                        <div className="mb-4">
                            <h2 className="font-bold text-[#232c43] mb-2">
                                {t('productDetails.similar')}
                            </h2>
                            {isLoadingRelated && (
                                <div className="text-gray-400 text-sm">
                                    {t('productDetails.loading')}
                                </div>
                            )}
                            {isRelatedError && (
                                <div className="text-gray-400 text-sm">
                                    {t('productDetails.failedToLoad')}
                                </div>
                            )}
                            {relatedProducts && relatedProducts.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {relatedProducts.map((relatedProduct) => (
                                        <div
                                            key={relatedProduct._id}
                                            className="bg-[#f8f8f8] rounded-2xl pt-0 pb-2 flex flex-col border border-gray-100 cursor-pointer"
                                            onClick={() => navigate(`/product/${relatedProduct._id}`)}
                                        >
                                            <div className="w-full h-36 rounded-t-2xl overflow-hidden mb-3 bg-transparent">
                                                <img
                                                    src={
                                                        relatedProduct.images?.[0] ||
                                                        "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png"
                                                    }
                                                    alt={relatedProduct.name?.uz || relatedProduct.name?.ru || t('productCard.product')}
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
                                                    {relatedProduct.name?.uz || relatedProduct.name?.ru || t('productCard.product')}
                                                </div>
                                                <div className="flex items-center w-full justify-between mt-auto">
                                                    <span className="text-[#ff7a00] font-bold text-sm">
                                                        {formatProductPrice(relatedProduct).price}
                                                        <span className="text-xs font-normal text-gray-400">
                                                            /{formatProductPrice(relatedProduct).unit}
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
                                                            setSelectedProduct(relatedProduct);
                                                            setQuantity(1);
                                                            setSheetOpen(true);
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
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-400 text-sm">
                                    {t('productDetails.noSimilar')}
                                </div>
                            )}
                        </div>
                </div>
            </div>
            {/* Bottom Bar */}
            <div className="bg-[#232c43] fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-25 py-3 pb-6 px-6 flex justify-between items-center z-50 mx-auto ">
                <div className="flex items-center gap-4">
                    <button
                        className="bg-white rounded-full p-2"
                        onClick={() => navigate(-1)}
                    >
                        <Icon
                            icon="mdi:arrow-left"
                            className="text-xl text-[#232c43]"
                        />
                    </button>
                    <span className="text-white text-xl font-bold">
                        {formatProductPrice(product).price}
                        <span className="text-sm font-normal text-gray-500">
                            /{formatProductPrice(product).unit}
                        </span>
                    </span>
                </div>
                
                {!isInCart ? (
                    <button
                        className="bg-[#ff7a00] text-white font-bold py-2 px-2 rounded-full text-sm shadow-md hover:bg-[#e66a00] transition-colors"
                        onClick={handleAddClick}
                    >
                        {t('productCard.addToCart')}
                    </button>
                ) : (
                    <button
                        className="bg-[#ff7a00] text-white font-bold py-2 px-2 rounded-full text-sm shadow-md hover:bg-[#e66a00] transition-colors"
                        onClick={handleGoToCart}
                    >
                        {t('productCard.goToCart')}
                    </button>
                )}
            </div>
            <BottomSheet open={sheetOpen} onClose={() => {
                setSheetOpen(false);
                setSelectedProduct(null);
            }}>
                {(selectedProduct || product) && (
                    <div className="flex flex-col items-center">
                        <img
                            src={
                                (selectedProduct || product).images?.[0] ||
                                "https://via.placeholder.com/80x80?text=No+Image"
                            }
                            alt={
                                (selectedProduct || product).name?.uz ||
                                (selectedProduct || product).name?.ru ||
                                t('productCard.product')
                            }
                            className="w-20 h-20 rounded-xl object-cover mb-2"
                        />
                        <div className="font-semibold text-lg text-[#232c43] mb-1">
                            {(selectedProduct || product).name?.uz ||
                                (selectedProduct || product).name?.ru ||
                                "Product"}
                        </div>
                        <div className="text-[#ff7a00] font-bold text-base mb-2">
                            {formatProductPrice(selectedProduct || product).price}
                            <span className="text-xs font-normal text-gray-400">
                                /{formatProductPrice(selectedProduct || product).unit}
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

            {/* Full-screen Image Modal */}
            {fullscreenImageOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
                    {/* Close button */}
                    <button
                        className="absolute top-30 right-4 bg-white bg-opacity-20 rounded-full p-2 z-10"
                        onClick={() => setFullscreenImageOpen(false)}
                    >
                        <Icon icon="mdi:close" className="text-black text-2xl" />
                    </button>

                    {/* Previous button */}
                    {product.images && product.images.length > 1 && (
                        <button
                            className="absolute left-4 bg-white bg-opacity-20 rounded-full p-2 z-10"
                            onClick={handlePreviousImage}
                        >
                            <Icon icon="mdi:chevron-left" className="text-white text-2xl" />
                        </button>
                    )}

                    {/* Next button */}
                    {product.images && product.images.length > 1 && (
                        <button
                            className="absolute right-4 bg-white bg-opacity-20 rounded-full p-2 z-10"
                            onClick={handleNextImage}
                        >
                            <Icon icon="mdi:chevron-right" className="text-white text-2xl" />
                        </button>
                    )}

                    {/* Image */}
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <img
                            src={
                                product.images?.[currentImageIndex] ||
                                "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png"
                            }
                            alt={product.name.uz}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                    "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png";
                            }}
                        />
                    </div>

                    {/* Image counter */}
                    {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 rounded-full px-3 py-1">
                            <span className="text-white text-sm">
                                {currentImageIndex + 1} / {product.images.length}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
