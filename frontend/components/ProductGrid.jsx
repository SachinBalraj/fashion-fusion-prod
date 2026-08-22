import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';
import SizeSelector from '@/components/SizeSelector';

const gradients = {
  Material: 'from-amber-200 to-yellow-100',
  'Ready-Made Kurtis': 'from-rose-200 to-pink-100',
  'Premium Shawls': 'from-purple-200 to-indigo-100',
  'Hair Accessories': 'from-emerald-200 to-teal-100',
};

function ProductCard({ product, index }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [imgError, setImgError] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isMaterial = product.category === 'Material';

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating || 0);
    const hasHalf = (product.rating || 0) - fullStars >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-3 w-3 fill-[#C9A227] text-[#C9A227]" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <span key={i} className="relative">
            <Star className="h-3 w-3 text-gray-200" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="h-3 w-3 fill-[#C9A227] text-[#C9A227]" />
            </span>
          </span>
        );
      } else {
        stars.push(<Star key={i} className="h-3 w-3 text-gray-200" />);
      }
    }
    return stars;
  };

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
      <Link to={`/products/${product.id}`} state={{ category: product.category }} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
          {product.image && !imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={() => { setImgError(true); }}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[product.category] || 'from-gray-200 to-gray-100'} flex items-center justify-center`}>
              <ShoppingBag className="h-12 w-12 text-white/40" />
            </div>
          )}

          {discount > 0 && !isMaterial && (
            <span className="absolute top-3 left-3 z-10 rounded-full bg-[#EF4444] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}

          {isHovered && (
            <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 z-10" />
          )}
        </div>
      </Link>

      {isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.2 }}
          className="absolute right-3 top-3 flex flex-col gap-2 z-20"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:shadow-xl"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'fill-[#EF4444] text-[#EF4444]' : 'text-gray-700'
              }`}
            />
          </button>
        </motion.div>
      )}

      <div className="p-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A227]">
          {product.category}
        </span>
        <Link to={`/products/${product.id}`} state={{ category: product.category }}>
          <h3 className="mt-1 font-['Poppins'] text-sm font-semibold text-gray-900 line-clamp-1 transition-colors hover:text-[#C9A227]">
            <span className="font-semibold text-[#111111]">{index + 1}. </span>
            {product.name}
          </h3>
        </Link>
        {!isMaterial && (
          <div className="mt-2 flex items-center gap-1">
            <div className="flex">{renderStars()}</div>
            <span className="text-[10px] text-gray-400">({product.reviews})</span>
          </div>
        )}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">
            ₹{(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {isMaterial && <span className="text-xs font-normal text-gray-500 ml-1">/meter</span>}
          </span>
          {!isMaterial && product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          )}
        </div>

        {!isMaterial && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <span className={`text-[10px] font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Only Few Left' : 'Out of Stock'}
            </span>
          </div>
        )}

        {!isMaterial && product.category !== 'Premium Shawls' && product.category !== 'Hair Accessories' && (
          <SizeSelector selectedSize={selectedSize} onSelect={setSelectedSize} showSizeGuide={false} />
        )}

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isMaterial && product.category !== 'Premium Shawls' && product.category !== 'Hair Accessories' && !selectedSize) {
                toast.error('Please select a size.');
                return;
              }
              addToCart(product, 1, isMaterial || product.category === 'Premium Shawls' || product.category === 'Hair Accessories' ? undefined : selectedSize);
              toast.success(isMaterial || product.category === 'Premium Shawls' || product.category === 'Hair Accessories' ? `${product.name} added to cart` : `${product.name} (${selectedSize}) added to cart`);
            }}
            disabled={product.stock === 0}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#C9A227] py-2 text-xs font-semibold text-white transition-all hover:bg-[#B8921F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
          </button>
          <Link to={`/products/${product.id}`} state={{ category: product.category }} className="flex-1">
            <button className="w-full rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-[#C9A227] hover:text-[#C9A227]">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductGrid({ products = [], visibleCount, emptyMessage }) {
  const visibleProducts = products.slice(0, visibleCount);

  if (visibleProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingBag className="h-16 w-16 text-gray-200" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {emptyMessage || 'No products found'}
        </h3>
        {!emptyMessage && (
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visibleProducts.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
