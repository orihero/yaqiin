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
    set(state => {
      const idx = state.cart.findIndex(item => item.product._id === product._id);
      let newCart;
      if (idx !== -1) {
        newCart = [...state.cart];
        newCart[idx].quantity += quantity;
      } else {
        newCart = [...state.cart, { product, quantity }];
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
})); 