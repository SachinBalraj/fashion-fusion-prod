import { useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Minus,
  Plus,
  Heart,
  Star,
  Truck,
  ShieldCheck,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import SizeSelector from '@/components/SizeSelector';
import { allProducts, getRelatedProducts } from '@/services/products';

const MOCK_REVIEWS = [];

function RatingStars({ rating, size = 'h-4 w-4' }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.floor(rating)
              ? 'fill-gold text-gold'
              : i < rating
              ? 'fill-gold/50 text-gold'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

function RatingBreakdown({ reviews, totalReviews }) {
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const idx = Math.min(Math.max(Math.round(r.rating), 1), 5);
    counts[idx - 1]++;
  });

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = counts[star - 1];
        const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2.5">
            <span className="w-6 text-right text-sm text-muted-foreground">{star}</span>
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: (5 - star) * 0.05 }}
                className="h-full rounded-full bg-gold"
              />
            </div>
            <span className="w-8 text-right text-sm text-muted-foreground">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ImageZoom({ images, selectedIndex, onSelect, productName }) {
  const containerRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({});
  const [showZoom, setShowZoom] = useState(false);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ backgroundPosition: `${x}% ${y}%`, backgroundSize: '200%' });
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
      >
        <img
          src={images[selectedIndex] || '/placeholder.svg'}
          alt={productName || 'Product'}
          className="h-full w-full object-cover transition-opacity duration-300"
          style={
            showZoom
              ? {
                  opacity: 0,
                }
              : {}
          }
        />
        {showZoom && (
          <div
            className="absolute inset-0 bg-no-repeat"
            style={{
              backgroundImage: `url(${images[selectedIndex] || '/placeholder.svg'})`,
              ...zoomStyle,
            }}
          />
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
              i === selectedIndex
                ? 'border-foreground ring-1 ring-foreground'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <img
              src={img || '/placeholder.svg'}
              alt={`Thumbnail ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorSelector({ colors, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {colors.map((color) => (
        <button
          key={color.name}
          onClick={() => onSelect(color.name)}
          className={`group relative h-9 w-9 rounded-full transition-all ${
            selected === color.name
              ? 'scale-110 ring-2 ring-foreground ring-offset-2'
              : 'ring-1 ring-border ring-offset-1 hover:ring-muted-foreground'
          }`}
          style={{ backgroundColor: color.hex }}
          aria-label={color.name}
          title={color.name}
        >
          {selected === color.name && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Check className={`h-4 w-4 ${color.name === 'White' || color.name === 'Beige' ? 'text-foreground' : 'text-white'}`} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const initials = (review.name || '')
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {review.avatar ? (
              <AvatarImage src={review.avatar} alt={review.name} />
            ) : (
              <AvatarFallback className="bg-muted text-sm font-medium">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{review.name}</span>
              {review.verified && (
                <Badge variant="secondary" className="h-5 gap-0.5 px-1.5 text-[10px]">
                  <Check className="h-2.5 w-2.5" /> Verified
                </Badge>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <RatingStars rating={review.rating} size="h-3 w-3" />
              <span className="text-xs text-muted-foreground">
                {new Date(review.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  const product = allProducts.find((p) => p.slug === slug || p._id === slug);
  const reviews = MOCK_REVIEWS;
  const relatedProducts = product ? getRelatedProducts(product).slice(0, 4) : [];

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <h2 className="text-xl font-bold text-gray-900">Product not found</h2>
        <p className="mt-2 text-sm text-gray-500">The product you're looking for doesn't exist.</p>
        <Link to="/shop" className="mt-6 rounded-xl bg-[#C9A227] px-6 py-3 text-sm font-semibold text-white hover:bg-[#B8921F]">
          Browse Products
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id || product.id);

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success('Added to cart!', {
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    navigate('/checkout');
  };

  return (
    <>
      <Helmet>
        <title>{`${product.name} — Fashion's Fusion`}</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-32 lg:pb-12"
      >
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <ImageZoom
              images={product.images}
              selectedIndex={selectedImage}
              onSelect={setSelectedImage}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5">
            {product.brand && (
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {product.brand}
              </p>
            )}

            <h1 className="text-3xl font-bold font-heading leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <RatingStars rating={averageRating} size="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                ₹{(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {product.comparePrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.comparePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <Badge className="bg-sale text-white border-0 text-xs font-semibold">
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>

            <Separator />

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Color</span>
                  {selectedColor && (
                    <span className="text-xs text-muted-foreground capitalize">{selectedColor}</span>
                  )}
                </div>
                <ColorSelector
                  colors={product.colors}
                  selected={selectedColor}
                  onSelect={setSelectedColor}
                />
              </div>
            )}

            <SizeSelector selectedSize={selectedSize} onSelect={setSelectedSize} />

            {/* Quantity */}
            <div>
              <span className="mb-2 block text-sm font-medium text-foreground">Quantity</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-11 w-14 items-center justify-center text-base font-semibold tabular-nums border-x border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock > 0 ? (
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-success" />
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sale">
                      <span className="inline-block h-2 w-2 rounded-full bg-sale" />
                      Out of Stock
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex gap-3">
                <Button
                  variant="gold"
                  size="lg"
                  className="flex-1 gap-2 text-base"
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedColor}
                >
                  <ShoppingBag className="h-5 w-5" /> Add to Cart
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="flex-1 gap-2 text-base"
                  onClick={handleBuyNow}
                  disabled={!selectedSize || !selectedColor}
                >
                  Buy Now
                </Button>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => toggleWishlist(product)}
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? 'fill-sale text-sale' : ''}`}
                />
                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </Button>
            </div>

            {/* Free Shipping Badge */}
            <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-gold" />
                <span>Free shipping on orders over ₹1,000</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-gold" />
                <span>Secure checkout</span>
              </div>
            </div>

            <Separator />

            {/* Accordion Sections */}
            <Accordion className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider">
                  Description
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="specifications">
                <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider">
                  Specifications
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5">
                    {product.specifications?.map((spec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider">
                  Shipping & Returns
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {product.shippingReturns?.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* Left - Rating Overview */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold font-heading mb-4">Customer Reviews</h2>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold font-heading">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">out of 5</span>
              </div>
              <RatingStars rating={averageRating} size="h-5 w-5" />
              <p className="mt-1 text-sm text-muted-foreground">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
              <div className="mt-6">
                <RatingBreakdown reviews={reviews} totalReviews={reviews.length} />
              </div>
            </div>

            {/* Right - Review List */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-heading">You May Also Like</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete your look with these complementary pieces
                </p>
              </div>
              <Link
                to="/shop"
                className="hidden sm:inline-flex text-sm font-medium text-gold hover:text-gold-dark transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
              {relatedProducts.map((rp, index) => (
                <div key={rp._id} className="min-w-[260px] w-[260px] snap-start">
                  <ProductCard product={rp} index={index} />
                </div>
              ))}
            </div>
          </section>
        )}
      </motion.div>

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background p-3 shadow-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{product.name}</p>
            <p className="text-base font-bold">₹{(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-9 w-9 items-center justify-center text-muted-foreground disabled:opacity-40"
                aria-label="Decrease"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex h-9 w-10 items-center justify-center text-sm font-semibold border-x border-border">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
                className="flex h-9 w-9 items-center justify-center text-muted-foreground disabled:opacity-40"
                aria-label="Increase"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              variant="gold"
              size="default"
              className="gap-1.5"
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
