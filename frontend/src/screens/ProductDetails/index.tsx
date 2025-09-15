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

    if (isLoading) return <div className="text-center py-12">{t('productDetails.loading')}</div>;
    if (isError || !product)
        return (
            <div className="text-center text-red-400 py-12">
                {error instanceof Error ? error.message : t('productDetails.notFound')}
            </div>
        );

    // Open sheet with product
    const handleAddClick = () => {
        setQuantity(1);
        setSheetOpen(true);
    };

    // Confirm add/update
    const handleConfirm = () => {
        try {
            addToCart(product, quantity);
            setSheetOpen(false);
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

    return (
        <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide safe-area" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            {/* Product Image */}
            <div
                className="bg-[#fff] rounded-[54px]"
                style={{
                    minHeight: "calc(100vh - 200px)",
                    maxHeight: "calc(100vh - 200px)",
                }}
            >
                <div className="w-full bg-[#F6F6F6] h-70 rounded-b-[60px] flex flex-col items-center overflow-hidden">
                    <button
                        className="absolute left-4 bg-white rounded-full p-2 z-20"
                        style={{ top: 'max(1.5rem, env(safe-area-inset-top, 0px))' }}
                        onClick={() => navigate(-1)}
                    >
                        <Icon
                            icon="mdi:arrow-left"
                            className="text-2xl text-[#232c43]"
                        />
                    </button>
                    <img
                        src={
                            product.images?.[0] ||
                            "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png"
                        }
                        alt={product.name.uz}
                        className="w-full h-70 object-cover"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                                "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png";
                        }}
                    />
                </div>
                {/* Product Info */}
                <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
                    <div className="bg-white px-4 pt-6 pb-8 flex-1 flex flex-col">
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
                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                    {relatedProducts.map((relatedProduct) => (
                                        <div
                                            key={relatedProduct._id}
                                            className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center relative min-w-[150px] cursor-pointer hover:shadow-lg transition"
                                            onClick={() => navigate(`/product/${relatedProduct._id}`)}
                                        >
                                            <img
                                                src={
                                                    relatedProduct.images?.[0] ||
                                                    "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png"
                                                }
                                                alt={relatedProduct.name?.uz || relatedProduct.name?.ru || t('productCard.product')}
                                                className="w-24 h-24 rounded-2xl object-cover mb-2 shadow-sm"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src =
                                                        "https://www.hydroscand.se/media/catalog/product/placeholder/default/image-placeholder-base.png";
                                                }}
                                            />
                                            <div className="font-bold text-base text-[#232c43] text-center mb-0.5">
                                                {relatedProduct.name?.uz || relatedProduct.name?.ru || t('productCard.product')}
                                            </div>
                                            <div className="text-xs text-gray-400 mb-1 text-center">
                                                {relatedProduct.nutritionalInfo?.calories
                                                    ? `${relatedProduct.nutritionalInfo.calories} cal`
                                                    : ""}
                                            </div>
                                            <div className="text-[#ff7a00] font-bold text-base mb-2 text-center">
                                                {formatProductPrice(relatedProduct).price}
                                                <span className="text-xs font-normal text-gray-400">
                                                    /{formatProductPrice(relatedProduct).unit}
                                                </span>
                                            </div>
                                            <button
                                                className="absolute -bottom-3 -right-3 bg-[#ff7a00] rounded-full w-9 h-9 flex items-center justify-center shadow-lg border-4 border-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        addToCart(relatedProduct, 1);
                                                    } catch (error: any) {
                                                        console.error('Failed to add to cart:', error);
                                                        alert(error.message || t('common.addToCartFailed'));
                                                    }
                                                }}
                                                aria-label={t('productCard.addToCart')}
                                            >
                                                <Icon icon="mdi:plus" className="text-white text-xl" />
                                            </button>
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
            </div>
            {/* Bottom Bar */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md h-20 py-3 px-6 flex justify-between items-center z-50 mx-auto ">
                <span className="text-white text-2xl font-bold">
                    {formatProductPrice(product).price}
                    <span className="text-sm font-normal text-gray-500">
                        /{formatProductPrice(product).unit}
                    </span>
                </span>
                
                {!isInCart ? (
                    <button
                        className="bg-[#ff7a00] text-white font-bold py-2 px-6 rounded-full text-sm shadow-md hover:bg-[#e66a00] transition-colors"
                        onClick={handleAddClick}
                    >
                        {t('productCard.addToCart')}
                    </button>
                ) : (
                    <button
                        className="bg-[#ff7a00] text-white font-bold py-4 px-6 rounded-full text-sm shadow-md hover:bg-[#e66a00] transition-colors"
                        onClick={handleGoToCart}
                    >
                        {t('productCard.goToCart')}
                    </button>
                )}
            </div>
            <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
                {product && (
                    <div className="flex flex-col items-center">
                        <img
                            src={
                                product.images?.[0] ||
                                "https://via.placeholder.com/80x80?text=No+Image"
                            }
                            alt={
                                product.name?.uz ||
                                product.name?.ru ||
                                t('productCard.product')
                            }
                            className="w-20 h-20 rounded-xl object-cover mb-2"
                        />
                        <div className="font-semibold text-lg text-[#232c43] mb-1">
                            {product.name?.uz ||
                                product.name?.ru ||
                                "Product"}
                        </div>
                        <div className="text-[#ff7a00] font-bold text-base mb-2">
                            {formatProductPrice(product).price}
                            <span className="text-xs font-normal text-gray-400">
                                /{formatProductPrice(product).unit}
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
        </div>
    );
};

export default ProductDetails;
