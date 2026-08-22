import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const WishlistContext = createContext();

function getProductId(product) {
  return product._id || product.id;
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem('fashionFusionWishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    localStorage.setItem('fashionFusionWishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    if (!user) {
      setSynced(false);
      return;
    }
    api.get('/wishlist')
      .then(({ data }) => {
        if (data.items && data.items.length > 0) {
          setWishlistItems((prev) => {
            if (prev.length === 0) return data.items;
            const merged = [...prev];
            for (const serverItem of data.items) {
              if (!merged.some((mi) => getProductId(mi) === serverItem.product)) {
                merged.push({
                  _id: serverItem.product,
                  name: serverItem.name,
                  price: serverItem.price,
                  images: serverItem.image ? [serverItem.image] : [],
                  category: serverItem.category,
                  brand: serverItem.brand,
                  slug: serverItem.slug,
                });
              }
            }
            return merged;
          });
        } else if (wishlistItems.length > 0) {
          const payload = wishlistItems.map((item) => ({
            product: getProductId(item),
            name: item.name,
            image: item.images?.[0] || item.image || '',
            price: item.price,
            category: item.category || '',
            brand: item.brand || '',
            slug: item.slug || '',
          }));
          api.put('/wishlist', { items: payload });
        }
        setSynced(true);
      })
      .catch(() => setSynced(true));
  }, [user]);

  useEffect(() => {
    if (!user || !synced) return;
    const timeout = setTimeout(() => {
      const payload = wishlistItems.map((item) => ({
        product: getProductId(item),
        name: item.name,
        image: item.images?.[0] || item.image || '',
        price: item.price,
        category: item.category || '',
        brand: item.brand || '',
        slug: item.slug || '',
      }));
      api.put('/wishlist', { items: payload }).catch(() => {});
    }, 1000);
    return () => clearTimeout(timeout);
  }, [wishlistItems, user, synced]);

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      const id = getProductId(product);
      if (prev.some((item) => getProductId(item) === id)) {
        toast.success('Already in wishlist');
        return prev;
      }
      toast.success('Added to Wishlist');
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => {
      const filtered = prev.filter((item) => getProductId(item) !== id);
      toast.success('Removed from Wishlist');
      return filtered;
    });
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    toast.success('Wishlist cleared');
  };

  const isInWishlist = (id) => wishlistItems.some((item) => getProductId(item) === id);

  const toggleWishlist = (product) => {
    const id = getProductId(product);
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        toggleWishlist,
        wishlistCount: wishlistItems.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
