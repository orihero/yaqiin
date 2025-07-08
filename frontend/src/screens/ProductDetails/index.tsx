import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetails } from './hooks/useProductDetails';
import { useCartStore } from '../../store/cartStore';
import { Icon } from '@iconify/react';

const ProductDetails: React.FC = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading, isError, error } = useProductDetails(productId || '');
  const addToCart = useCartStore(state => state.addToCart);

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (isError || !product) return <div className="text-center text-red-400 py-12">{error instanceof Error ? error.message : 'Product not found.'}</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col relative">
      {/* Product Image */}
      <div className="w-full bg-white rounded-b-[48px] flex flex-col items-center pt-8 pb-4 shadow-md">
        <button className="absolute top-6 left-4 bg-white rounded-full p-2 shadow" onClick={() => navigate(-1)}>
          <Icon icon="mdi:arrow-left" className="text-2xl text-[#232c43]" />
        </button>
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/200x200?text=No+Image'}
          alt={product.name.uz}
          className="w-48 h-48 object-contain mb-2"
        />
      </div>
      {/* Product Info */}
      <div className="max-w-md mx-auto w-full px-6 flex-1 flex flex-col -mt-8 z-10">
        <div className="bg-white rounded-3xl shadow-lg px-4 pt-6 pb-8 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-[#232c43]">{product.name.uz}</h1>
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-xl font-bold text-[#232c43]"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                –
              </button>
              <span className="font-semibold text-lg text-[#232c43]">{quantity} <span className="text-base font-normal">{product.unit}</span></span>
              <button
                className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-xl font-bold text-[#232c43]"
                onClick={() => setQuantity(q => q + 1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-400 mb-4">{product.isActive ? 'Available in stock' : 'Out of stock'}</div>
          <div className="mb-4">
            <h2 className="font-bold text-[#232c43] mb-1">Product Description</h2>
            <p className="text-gray-500 text-sm">{product.description?.uz || ''}</p>
          </div>
          <div className="mb-4">
            <h2 className="font-bold text-[#232c43] mb-2">Product Reviews</h2>
            {/* Placeholder for reviews */}
            <div className="text-gray-400 text-sm">No reviews yet.</div>
          </div>
          <div>
            <h2 className="font-bold text-[#232c43] mb-2">Similar Products</h2>
            {/* Placeholder for similar products */}
            <div className="text-gray-400 text-sm">No similar products yet.</div>
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#232c43] rounded-t-[32px] py-5 px-6 flex justify-between items-center z-10 mx-auto">
        <span className="text-white text-2xl font-bold">{product.price} <span className="text-base font-normal">/{product.unit}</span></span>
        <button className="bg-white text-[#232c43] font-bold py-3 px-8 rounded-full text-base shadow" onClick={() => addToCart(product, quantity)}>
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetails; 