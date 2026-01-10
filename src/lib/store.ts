import { create } from 'zustand';
import { persist, PersistStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore, [["zustand/persist", CartStore]]>(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem: CartItem) => {
        set((state: CartStore) => {
          const existingItem = state.items.find(
            (item: CartItem) => item.productId === newItem.productId && item.size === newItem.size
          );

          if (existingItem) {
            return {
              items: state.items.map((item: CartItem) =>
                item.productId === newItem.productId && item.size === newItem.size
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, newItem],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state: CartStore) => ({
          items: state.items.filter((item: CartItem) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state: CartStore) => ({
          items: state.items.map((item: CartItem) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
