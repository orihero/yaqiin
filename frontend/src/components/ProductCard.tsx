import React from "react";
import { Icon } from "@iconify/react";
import type { Product } from "@yaqiin/shared/types/product";
import { useTranslation } from 'react-i18next';
import { formatProductPrice } from "@yaqiin/shared/utils/formatProductPrice";

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAdd,
    onClick,
}) => {
    const { t } = useTranslation();
    return (
        <div
            className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center relative min-w-[150px] cursor-pointer hover:shadow-lg transition"
            onClick={() => onClick?.(product)}
        >
            <img
                src={
                    product.images?.[0] ||
                    "https://via.placeholder.com/100x100?text=No+Image"
                }
                alt={product.name?.uz || product.name?.ru || t('productCard.product')}
                className="w-24 h-24 rounded-2xl object-cover mb-2 shadow-sm"
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                        "https://via.placeholder.com/100x100?text=No+Image";
                }}
            />
            <div className="font-bold text-base text-[#232c43] text-center mb-0.5 h-10 overflow-hidden" style={{ lineHeight: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {product.name?.uz || product.name?.ru || t('productCard.product')}
            </div>
            <div className="text-xs text-gray-400 mb-1 text-center">
                {product.nutritionalInfo?.calories
                    ? `${product.nutritionalInfo.calories} cal`
                    : ""}
            </div>
            <div className="text-[#ff7a00] font-bold text-sm mb-2 text-center">
                {formatProductPrice(product).price}
                <span className="text-xs font-normal text-gray-400">
                    /{formatProductPrice(product).unit}
                </span>
            </div>
            <button
                className="absolute -bottom-3 -right-3 bg-[#ff7a00] rounded-full w-9 h-9 flex items-center justify-center shadow-lg border-4 border-white"
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd(product);
                }}
                aria-label={t('productCard.addToCart')}
            >
                <Icon icon="mdi:plus" className="text-white text-xl" />
            </button>
        </div>
    );
};

export default ProductCard;
