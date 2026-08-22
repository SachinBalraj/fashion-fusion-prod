import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const CartContext = createContext();

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

function isValidProductId(id) {
  return typeof id === 'string' && OBJECT_ID_REGEX.test(id);
}

function getProductId(product) {
  return product._id || product.id;
}

function loadStoredCart() {
  const stored = localStorage.getItem('cart');
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // Drop any items with stale/non-ObjectId IDs (e.g. old slug-based IDs like "cset-01")
    const valid = parsed.filter((item) => isValidProductId(getProductId(item)));
    if (valid.length !== parsed.length) {
      // Stale items found — persist the cleaned cart immediately
      localStorage.setItem('cart', JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(loadStoredCart);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (!user) {
      setSynced(false);
      return;
    }
    api.get('/cart')
      .then(({ data }) => {
        if (data.items && data.items.length > 0) {
          setCartItems((prev) => {
            if (prev.length === 0) return data.items;
            const merged = [...prev];
            for (const serverItem of data.items) {
              const localIdx = merged.findIndex(
                (li) =>
                  getProductId(li) === serverItem.product &&
                  (li.size || '') === (serverItem.size || '') &&
                  (li.color || '') === (serverItem.color || '')
              );
              if (localIdx >= 0) {
                merged[localIdx] = {
                  ...merged[localIdx],
                  quantity: Math.max(merged[localIdx].quantity, serverItem.quantity),
                };
              } else {
                merged.push({
                  _id: serverItem.product,
                  name: serverItem.name,
                  price: serverItem.price,
                  image: serverItem.image || '',
                  quantity: serverItem.quantity,
                  size: serverItem.size || '',
                  color: serverItem.color || '',
                });
              }
            }
            return merged;
          });
        } else if (cartItems.length > 0) {
          const payload = cartItems.map((item) => ({
            product: getProductId(item),
            name: item.name,
            image: item.image || '',
            price: item.price,
            size: item.size || '',
            color: item.color || '',
            quantity: item.quantity,
          }));
          api.put('/cart', { items: payload });
        }
        setSynced(true);
      })
      .catch(() => setSynced(true));
  }, [user]);

  useEffect(() => {
    if (!user || !synced) return;
    const timeout = setTimeout(() => {
      const payload = cartItems.map((item) => ({
        product: getProductId(item),
        name: item.name,
        image: item.image || '',
        price: item.price,
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity,
      }));
      api.put('/cart', { items: payload }).catch(() => {});
    }, 1000);
    return () => clearTimeout(timeout);
  }, [cartItems, user, synced]);

  const addToCart = useCallback((product, quantity = 1, size = '', color = '') => {
    setCartItems((prev) => {
      const pid = getProductId(product);
      const existing = prev.find(
        (item) =>
          getProductId(item) === pid && item.size === size && item.color === color
      );
      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          _id: pid,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image || '',
          quantity,
          size,
          color,
          stock: product.stock,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((id, size = '', color = '') => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(getProductId(item) === id && item.size === size && item.color === color)
      )
    );
  }, []);

  const updateQuantity = useCallback((id, quantity, size = '', color = '') => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        getProductId(item) === id && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );
  const cartCount = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
    }),
    [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
