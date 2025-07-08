import React from 'react';
import { Icon } from '@iconify/react';
import type { Product } from '@yaqiin/shared/types/product';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onClick }) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center relative min-w-[150px] cursor-pointer hover:shadow-lg transition"
      onClick={() => onClick?.(product)}
    >
      <img
        src={product.images?.[0] || 'https://via.placeholder.com/100x100?text=No+Image'}
        alt={product.name?.uz || product.name?.ru || 'Product'}
        className="w-20 h-20 rounded-xl object-cover mb-2"
        onError={e => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'https://via.placeholder.com/100x100?text=No+Image';
        }}
      />
      <div className="font-semibold text-base text-[#232c43] text-center mb-1">
        {product.name?.uz || product.name?.ru || 'Product'}
      </div>
      <div className="text-xs text-gray-400 mb-1">
        {product.nutritionalInfo?.calories ? `${product.nutritionalInfo.calories} cal` : ''}
      </div>
      <div className="text-[#ff7a00] font-bold text-base mb-2">
        ${product.price?.toFixed ? product.price.toFixed(2) : product.price}
        <span className="text-xs font-normal text-gray-400">/kg</span>
      </div>
      <button
        className="absolute bottom-4 right-4 bg-[#ff7a00] rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
        onClick={e => {
          e.stopPropagation();
          onAdd(product);
        }}
        aria-label="Add to cart"
      >
        <Icon icon="mdi:plus" className="text-white text-lg" />
      </button>
    </div>
  );
};

export default ProductCard; 