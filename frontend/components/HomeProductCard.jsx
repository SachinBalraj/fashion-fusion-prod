import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';

export default function HomeProductCard({ product, badge, index = 0 }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const productId = product.id;
  const isWishlisted = isInWishlist(productId);

  const handleAddToCart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product, 1);
      toast.success('Added to cart');
    },
    [addToCart, product]
  );

  const handleToggleWishlist = useCallback(
    (e) => {
      e.preventDefault();
      toggleWishlist(product);
    },
    [toggleWishlist, product]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${productId}`} state={{ category: product.category }} className="relative block aspect-[3/4] overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-transform duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {badge && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#C9A227] px-3 py-1 text-xs font-semibold text-white shadow-md">
            {badge === 'Best Seller' ? '\u2B50' : '\u2728'} {badge}
          </span>
        )}

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <motion.button
            initial={{ opacity: 0, x: 16 }}
            animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            onClick={handleToggleWishlist}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-shadow hover:shadow-lg"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-primary'
              }`}
            />
          </motion.button>
        </div>

        {isHovered && (
          <div className="absolute inset-0 bg-black/5 transition-opacity duration-300" />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>
        <Link to={`/products/${productId}`} state={{ category: product.category }}>
          <h3 className="mt-1 font-heading text-base font-bold text-primary line-clamp-1 transition-colors hover:text-[#C9A227]">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-lg font-bold text-primary">
          ₹{(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {(product.category === 'Material' || product.category === 'Raw Silk Fabric') && (
            <span className="text-sm font-normal text-muted-foreground ml-1">/meter</span>
          )}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Button
            variant="gold"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 border-border hover:border-[#C9A227] hover:text-[#C9A227]"
          >
            <Link to={`/products/${productId}`} state={{ category: product.category }}>
              <Eye className="h-3.5 w-3.5" /> View Details
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
