import React from 'react';
import { Icon } from '@iconify/react';
import { useCartStore } from '../../store/cartStore';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';
import { useSwipeable } from 'react-swipeable';
import type { CartItem as CartItemType } from '../../store/cartStore';
import { createOrder } from '../../services/orderService';
import { toast } from 'react-toastify';

type CartItemProps = {
  item: CartItemType;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
};

function CartItem({ item, updateQuantity, removeFromCart }: CartItemProps) {
  const [showDelete, setShowDelete] = React.useState(false);
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setShowDelete(true),
    onSwipedRight: () => setShowDelete(false),
    delta: 50,
    trackMouse: true,
  });
  const handleMinus = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product._id, item.quantity - 1);
    } else {
      setShowDelete(true);
    }
  };
  return (
    <div className="relative">
      <div
        {...swipeHandlers}
        className={`flex items-center bg-white rounded-2xl p-4 shadow-sm transition-transform duration-300 ${showDelete ? 'translate-x-[-80px]' : ''}`}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <img
          src={item.product.images?.[0] || 'https://via.placeholder.com/80x80?text=No+Image'}
          alt={item.product.name?.uz || item.product.name?.ru || 'Product'}
          className="w-20 h-20 rounded-xl object-cover mr-4"
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
          }}
        />
        <div className="flex-1 flex flex-col justify-between">
          <div className="font-semibold text-base text-[#232c43]">{item.product.name?.uz || item.product.name?.ru || 'Product'}</div>
          <div className="text-xs text-gray-400 mb-1">{item.product.nutritionalInfo?.calories ? `${item.product.nutritionalInfo.calories} cal` : ''}</div>
          <div className="text-[#ff7a00] font-bold text-base">
            ${item.product.price?.toFixed ? item.product.price.toFixed(2) : item.product.price}
            <span className="text-xs font-normal text-gray-400">/kg</span>
          </div>
        </div>
        {/* Controls: plus, count, minus in a single column */}
        <div className="flex flex-col items-center ml-4 gap-1">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold text-lg"
            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
          >
            <Icon icon="mdi:plus" className="text-[#232c43] text-base" />
          </button>
          <div className="w-8 h-8 flex items-center justify-center bg-[#232c43] rounded-lg text-white font-bold text-base">
            {item.quantity}
          </div>
          <button
            className="w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold text-lg"
            onClick={handleMinus}
          >
            <Icon icon="mdi:minus" className="text-[#232c43] text-base" />
          </button>
        </div>
      </div>
      {/* Delete button slides in from the right, tall rounded-rectangle, orange */}
      <div
        className={`absolute top-0 right-0 h-full flex items-center pr-2 transition-all duration-300 ${showDelete ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        style={{ zIndex: 2 }}
      >
        <button
          className="bg-[#ff7a00] rounded-xl px-4 py-3 flex items-center justify-center shadow-lg h-16"
          onClick={() => removeFromCart(item.product._id)}
        >
          <Icon icon="mdi:delete" className="text-white text-xl" />
        </button>
      </div>
    </div>
  );
}

const MyCartScreen = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const getTotal = () => cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleHeaderSearchClick = () => {
    navigate('/search');
  };
  const handleTabChange = (tab: string) => {
    if (tab === 'Home') navigate('/');
    else if (tab === 'Search') navigate('/search');
    else if (tab === 'My Cart') navigate('/cart');
    else if (tab === 'Profile') navigate('/profile');
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await createOrder({
        items: cart.map(item => ({ productId: item.product._id, quantity: item.quantity })),
      });
      toast.success('Order placed successfully!');
      clearCart();
      setCheckoutOpen(false);
      // Optionally navigate to order history or confirmation page
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col relative">
      <Header
        title="My Cart"
        rightIcon="mdi:magnify"
        onRightIconClick={handleHeaderSearchClick}
      />
      <div className="max-w-md mx-auto w-full px-0 pt-6 pb-0 flex-1 flex flex-col">
        <div className="bg-white rounded-3xl shadow-lg px-4 pt-6 pb-8 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#232c43] leading-tight">Daily<br />Grocery Food</h1>
            <div className="bg-white rounded-full p-3 shadow flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Icon icon="mdi:magnify" className="text-2xl text-[#232c43]" />
            </div>
          </div>
          {/* Cart Items */}
          <div className="flex flex-col gap-4 mb-6">
            {cart.length === 0 && (
              <div className="text-center text-gray-400 py-8">Your cart is empty.</div>
            )}
            {cart.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>
          {/* Total and Checkout */}
          <div className="mt-auto pt-4 pb-24">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base text-gray-500 font-semibold">Total amount</span>
              <span className="text-lg font-bold text-[#232c43]">${getTotal().toFixed(2)}</span>
            </div>
            <button
              className="w-full bg-[#232c43] text-white rounded-full py-4 text-lg font-bold shadow-md disabled:opacity-60"
              disabled={cart.length === 0}
              onClick={() => setCheckoutOpen(true)}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
      {/* Checkout Confirmation Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-[#232c43]">Confirm Checkout</h2>
            <p className="mb-4 text-gray-600">Are you sure you want to place this order for <span className="font-bold">${getTotal().toFixed(2)}</span>?</p>
            <div className="flex gap-4 w-full">
              <button
                className="flex-1 bg-gray-200 text-[#232c43] rounded-full py-2 font-semibold"
                onClick={() => setCheckoutOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-[#232c43] text-white rounded-full py-2 font-semibold"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Placing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bottom Navigation (reuse from HomeScreen if needed) */}
      <TabBar current="My Cart" onTabChange={handleTabChange} />
    </div>
  );
};

export default MyCartScreen; 