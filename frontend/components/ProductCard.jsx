import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';

function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId);

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product, 1, selectedSize);
      toast.success(selectedSize ? `Added size ${selectedSize} to cart` : 'Added to cart');
    },
    [addToCart, product, selectedSize]
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
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={product.slug ? `/shop/${product.slug}` : product._id ? `/shop/${product._id}` : `/products/${product.id}`} state={{ category: product.category }}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted mb-3">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={product.images?.[0] || '/placeholder.svg'}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {product.images?.[1] && (
            <img
              src={product.images[1]}
              alt={product.name}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
              }`}
            />
          )}

          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-sale text-white border-0 text-xs font-semibold px-2 py-1">
              -{discount}%
            </Badge>
          )}

          {isHovered && (
            <div className="absolute inset-0 bg-black/5 transition-opacity duration-300" />
          )}
        </div>
      </Link>

      {isHovered && (
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleToggleWishlist}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'fill-sale text-sale' : 'text-primary'
              }`}
            />
          </motion.button>
      <Link to={product.slug ? `/shop/${product.slug}` : product._id ? `/shop/${product._id}` : `/products/${product.id}`} state={{ category: product.category }}>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </motion.button>
          </Link>
        </div>
      )}

      <div className="px-1">
        {product.brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5 font-medium">
            {product.brand}
          </p>
        )}
        <Link to={product.slug ? `/shop/${product.slug}` : product._id ? `/shop/${product._id}` : `/products/${product.id}`} state={{ category: product.category }}>
          <h3 className="font-medium text-sm md:text-base text-primary line-clamp-1 hover:text-gold transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(product.ratings || 0)
                    ? 'fill-gold text-gold'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.numReviews || 0})
          </span>
        </div>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-bold text-primary">
            ₹{(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{(product.comparePrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {product.fabric && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {product.fabric}
          </p>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(selectedSize === size ? '' : size);
                }}
                className={`text-[10px] px-1.5 py-0.5 rounded border font-medium transition-all ${
                  selectedSize === size
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {product.colors && product.colors.length > 0 && (
          <div className="mt-1.5 flex gap-1">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="inline-block h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: color.toLowerCase() === 'gold' ? '#C9A227' : color.toLowerCase() === 'maroon' ? '#7A1F3D' : color.toLowerCase() === 'navy' ? '#1B2A4A' : color.toLowerCase() === 'pink' ? '#EC4899' : color.toLowerCase() === 'purple' ? '#8B5CF6' : color.toLowerCase() === 'red' ? '#EF4444' : color.toLowerCase() === 'green' ? '#22C55E' : color.toLowerCase() === 'blue' ? '#3B82F6' : color.toLowerCase() === 'beige' ? '#F5F0E1' : color.toLowerCase() === 'white' ? '#FFFFFF' : color.toLowerCase() === 'black' ? '#111111' : '#CCCCCC' }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{product.colors.length - 4}</span>
            )}
          </div>
        )}

        <Button
          variant="gold"
          size="sm"
          className="mt-3 w-full gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}

export default ProductCard;
