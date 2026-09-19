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

function clampQuantity(qty, stock) {
  let quantity = Number(qty);
  if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;
  quantity = Math.floor(quantity);
  return stock > 0 ? Math.min(quantity, stock) : quantity;
}

function normalizeCartItem(item = {}) {
  const stock = Number(item.stock);
  const safeStock = Number.isFinite(stock) && stock > 0 ? stock : 0;
  return {
    _id: item._id || item.product?._id || item.product,
    name: item.name || item.product?.name || '',
    price: Number(item.price) || Number(item.product?.price) || 0,
    image: item.images?.[0] || item.image || item.product?.images?.[0] || item.product?.image || '',
    stock: safeStock,
    quantity: clampQuantity(item.quantity, safeStock),
    size: item.size || '',
    color: item.color || '',
  };
}

function loadStoredCart() {
  const stored = localStorage.getItem('cart');
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // Drop any items with stale/non-ObjectId IDs (e.g. old slug-based IDs like "cset-01")
    const valid = parsed
      .filter((item) => isValidProductId(getProductId(item)))
      .map((item) => normalizeCartItem(item));
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
            if (prev.length === 0) return data.items.map((item) => normalizeCartItem(item));
            const merged = [...prev];
            for (const serverItem of data.items) {
              const normalized = normalizeCartItem(serverItem);
              const localIdx = merged.findIndex(
                (li) =>
                  getProductId(li) === normalized._id &&
                  (li.size || '') === (normalized.size || '') &&
                  (li.color || '') === (normalized.color || '')
              );
              if (localIdx >= 0) {
                const stock = normalized.stock > 0 ? normalized.stock : merged[localIdx].stock;
                merged[localIdx] = {
                  ...merged[localIdx],
                  stock,
                  quantity: clampQuantity(Math.max(merged[localIdx].quantity, normalized.quantity), stock),
                };
              } else {
                merged.push(normalized);
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
      const stock = Number(product.stock);
      const safeStock = Number.isFinite(stock) && stock > 0 ? stock : 0;
      const existing = prev.find(
        (item) =>
          getProductId(item) === pid && item.size === size && item.color === color
      );
      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: clampQuantity(item.quantity + quantity, safeStock > 0 ? safeStock : item.stock) }
            : item
        );
      }
      return [
        ...prev,
        normalizeCartItem({
          _id: pid,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image || '',
          quantity,
          size,
          color,
          stock: product.stock,
        }),
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
          ? { ...item, quantity: clampQuantity(quantity, item.stock) }
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
