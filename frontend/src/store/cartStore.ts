import { create } from 'zustand';
import { Product } from '@yaqiin/shared/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getShopId: () => string | null;
  hasMultipleShops: () => boolean;
}

const CART_KEY = 'yaqiin_cart';

function loadCart(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: loadCart(),
  addToCart: (product, quantity = 1) => {
    // Validate that product has shopId
    if (!product.shopId) {
      console.error('Product must have shopId to be added to cart:', product);
      throw new Error('Product must have shopId to be added to cart');
    }
    
    set(state => {
      const idx = state.cart.findIndex(item => item.product._id === product._id);
      let newCart;
      if (idx !== -1) {
        newCart = [...state.cart];
        newCart[idx].quantity += quantity;
      } else {
        // Check if adding this product would create multiple shops
        if (state.cart.length > 0 && state.cart[0].product.shopId !== product.shopId) {
          // Clear cart and add new product from different shop
          newCart = [{ product, quantity }];
        } else {
          newCart = [...state.cart, { product, quantity }];
        }
      }
      saveCart(newCart);
      return { cart: newCart };
    });
  },
  removeFromCart: (productId) => {
    set(state => {
      const newCart = state.cart.filter(item => item.product._id !== productId);
      saveCart(newCart);
      return { cart: newCart };
    });
  },
  updateQuantity: (productId, quantity) => {
    set(state => {
      const newCart = state.cart.map(item =>
        item.product._id === productId ? { ...item, quantity } : item
      );
      saveCart(newCart);
      return { cart: newCart };
    });
  },
  clearCart: () => {
    saveCart([]);
    set({ cart: [] });
  },
  getShopId: () => {
    const state = get();
    if (state.cart.length === 0) return null;
    return state.cart[0].product.shopId || null;
  },
  hasMultipleShops: () => {
    const state = get();
    if (state.cart.length <= 1) return false;
    const firstShopId = state.cart[0].product.shopId;
    return state.cart.some(item => item.product.shopId !== firstShopId);
  },
})); 