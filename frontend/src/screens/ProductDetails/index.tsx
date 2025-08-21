import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductDetails, useRelatedProducts } from "./hooks/useProductDetails";
import { useCartStore } from "../../store/cartStore";
import { Icon } from "@iconify/react";
import { useTranslation } from 'react-i18next';
import ProductCard from "../../components/ProductCard";
import { formatPrice } from "@yaqiin/shared/utils/formatPrice";

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

    if (isLoading) return <div className="text-center py-12">{t('productDetails.loading')}</div>;
    if (isError || !product)
        return (
            <div className="text-center text-red-400 py-12">
                {error instanceof Error ? error.message : t('productDetails.notFound')}
            </div>
        );

    const handleAddToCart = () => {
        try {
            addToCart(product, 1);
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            alert(error.message || t('common.addToCartFailed'));
        }
    };

    const handleUpdateQuantity = (newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId!);
        } else {
            updateQuantity(productId!, newQuantity);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative pb-20">
            {/* Product Image */}
            <div
                className="bg-[#fff] rounded-[54px]"
                style={{
                    minHeight: "calc(100vh - 100px)",
                    maxHeight: "calc(100vh - 100px)",
                }}
            >
                <div className="w-full bg-[#F6F6F6] h-70 rounded-b-[60px] flex flex-col items-center overflow-hidden">
                    <button
                        className="absolute top-6 left-4 bg-white rounded-full p-2 z-20"
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
                                                {formatPrice(relatedProduct.price || relatedProduct.basePrice)}
                                                <span className="text-xs font-normal text-gray-400">/{relatedProduct.unit}</span>
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
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 h-20 py-3 px-6 flex justify-between items-center z-50 mx-auto shadow-lg">
                <span className="text-[#232c43] text-xl font-bold">
                    {formatPrice(product.price || product.basePrice)}{" "}
                    <span className="text-sm font-normal text-gray-500">
                        /{product.unit}
                    </span>
                </span>
                
                {!isInCart ? (
                    <button
                        className="bg-[#ff7a00] text-white font-bold py-2 px-6 rounded-full text-sm shadow-md hover:bg-[#e66a00] transition-colors"
                        onClick={handleAddToCart}
                    >
                        {t('productCard.addToCart')}
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            className="w-7 h-7 rounded-full bg-[#ff7a00] flex items-center justify-center text-lg font-bold text-white hover:bg-[#e66a00] transition-colors"
                            onClick={() => handleUpdateQuantity(cartQuantity - 1)}
                        >
                            –
                        </button>
                        <span className="font-semibold text-base text-[#232c43] min-w-6 text-center">
                            {cartQuantity}
                        </span>
                        <button
                            className="w-7 h-7 rounded-full bg-[#ff7a00] flex items-center justify-center text-lg font-bold text-white hover:bg-[#e66a00] transition-colors"
                            onClick={() => handleUpdateQuantity(cartQuantity + 1)}
                        >
                            +
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
