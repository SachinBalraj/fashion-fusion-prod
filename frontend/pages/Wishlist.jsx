import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import SizeSelector from '@/components/SizeSelector';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

function WishlistCard({ item, index }) {
  const { removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const productId = item._id || item.id;
  const itemName = item.name || '';
  const itemCategory = item.category || item.brand || '';
  const itemPrice = item.price != null ? item.price : 0;
  const itemOriginalPrice = item.originalPrice || item.comparePrice || null;
  const itemRating = item.rating || item.ratings || 0;
  const itemReviews = item.reviews || item.numReviews || 0;
  const itemStock = item.stock != null ? item.stock : 0;
  const itemSizes = item.sizes || [];
  const itemImage = item.images?.[0] || null;

  const discount = itemOriginalPrice
    ? Math.round((1 - itemPrice / itemOriginalPrice) * 100)
    : 0;

  const discountClasses = [
    'from-amber-200 to-yellow-100',
    'from-rose-200 to-pink-100',
    'from-purple-200 to-indigo-100',
    'from-emerald-200 to-teal-100',
  ];

  const detailLink = item.slug
    ? `/shop/${item.slug}`
    : `/products/${item.id || item._id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 12) * 0.04 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#C9A227]/5 border border-transparent hover:border-[#C9A227]/20"
    >
      <Link to={detailLink} state={{ category: itemCategory }} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
          {itemImage ? (
            <img
              src={itemImage}
              alt={itemName}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${discountClasses[index % 4]} flex items-center justify-center`}>
              <ShoppingBag className="h-12 w-12 text-white/40" />
            </div>
          )}

          {discount > 0 && (
            <span className="absolute top-3 left-3 z-10 rounded-full bg-[#EF4444] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}

          {isHovered && (
            <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 z-10" />
          )}
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          removeFromWishlist(productId);
        }}
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:shadow-xl"
        aria-label="Remove from wishlist"
      >
        <Heart className="h-4 w-4 fill-[#EF4444] text-[#EF4444]" />
      </button>

      <div className="p-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A227]">
          {itemCategory}
        </span>
        <Link to={detailLink} state={{ category: itemCategory }}>
          <h3 className="mt-1 font-['Poppins'] text-sm font-semibold text-gray-900 line-clamp-1 transition-colors hover:text-[#C9A227]">
            {itemName}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(itemRating)
                    ? 'fill-[#C9A227] text-[#C9A227]'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">({itemReviews})</span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">₹{itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          {itemOriginalPrice && (
            <span className="text-xs text-gray-400 line-through">₹{itemOriginalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${itemStock > 10 ? 'bg-green-500' : itemStock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className={`text-[10px] font-medium ${itemStock > 10 ? 'text-green-600' : itemStock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
            {itemStock > 10 ? 'In Stock' : itemStock > 0 ? 'Only Few Left' : 'Out of Stock'}
          </span>
        </div>

        {itemSizes.length > 0 && (
          <SizeSelector selectedSize={selectedSize} onSelect={setSelectedSize} showSizeGuide={false} />
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (itemSizes.length > 0 && !selectedSize) {
                toast.error('Please select a size.');
                return;
              }
              addToCart(item, 1, selectedSize);
              toast.success(`${itemName} added to cart`);
            }}
            disabled={itemStock === 0}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#C9A227] py-2 text-xs font-semibold text-white transition-all hover:bg-[#B8921F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
          </button>
          <Link to={detailLink} state={{ category: itemCategory }} className="flex-1">
            <button className="w-full rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-[#C9A227] hover:text-[#C9A227]">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Wishlist() {
  const { wishlistItems, clearWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Helmet><title>Wishlist - Fashion's Fusion</title></Helmet>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <Heart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold font-heading">Your wishlist is empty</h2>
        <p className="text-muted-foreground">Save your favorite products here.</p>
        <Link to="/products">
          <Button variant="gold" className="gap-2">
            <ShoppingBag className="h-4 w-4" /> Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Helmet><title>Wishlist - Fashion's Fusion</title></Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">My Wishlist</h1>
          <p className="text-muted-foreground">{wishlistItems.length} items</p>
        </div>
        <div className="flex gap-3">
          <Link to="/products">
            <Button variant="outline" size="sm" className="gap-2">
              Continue Shopping
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2 text-sale" onClick={clearWishlist}>
            <Trash2 className="h-4 w-4" /> Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlistItems.map((item, i) => (
          <WishlistCard key={item._id || item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
