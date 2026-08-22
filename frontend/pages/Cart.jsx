import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  Tag,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import SectionHeading from '@/components/SectionHeading';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { allProducts } from '@/services/products';
import { toast } from 'sonner';

const RECOMMENDED_CATEGORIES = ['Ready-Made Kurtis', 'Material', 'Premium Shawls', 'Hair Accessories'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const [coupon, setCoupon] = useState('');

  const recommendedProducts = useMemo(() => {
    return RECOMMENDED_CATEGORIES.map((cat) => {
      const products = allProducts.filter((p) => p.category === cat);
      return products[0];
    }).filter(Boolean);
  }, []);

  const shipping = 80;
  const tax = Math.round(cartTotal * 0.18 * 100) / 100;
  const total = cartTotal + shipping + tax;

  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    toast.success('Coupon applied successfully!');
    setCoupon('');
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart — Fashion's Fusion</title>
        </Helmet>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            >
              <ShoppingBag className="h-24 w-24 text-muted-foreground/40" strokeWidth={1} />
            </motion.div>
            <h2 className="text-2xl font-bold font-heading">Your cart is empty</h2>
            <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
            <Link to="/shop">
              <Button variant="gold" size="lg" className="mt-2">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${cartCount}) — Fashion's Fusion`}</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-heading">Shopping Cart</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link to="/shop">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={`${item._id}-${item.size}-${item.color}-${index}`}
                    layoutId={`${item._id}-${item.size}-${item.color}`}
                    variants={itemVariants}
                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="flex gap-4 p-4 sm:gap-6">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate font-medium">{item.name}</h3>
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {item.size && <span>Size: {item.size}</span>}
                                {item.size && item.color && <span> | </span>}
                                {item.color && <span>Color: {item.color}</span>}
                              </p>
                            </div>
                            <p className="shrink-0 font-semibold">
                              ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center rounded-lg border border-border">
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity - 1, item.size, item.color)}
                                  disabled={item.quantity <= 1}
                                  className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="flex h-9 w-10 items-center justify-center text-sm font-semibold border-x border-border tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1, item.size, item.color)}
                                  disabled={item.quantity >= (item.stock || 99)}
                                  className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                removeFromCart(item._id, item.size, item.color);
                                toast.success('Item removed from cart');
                              }}
                              className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Coupon Code */}
            <Card className="mt-6">
              <CardContent className="flex items-center gap-3 p-4">
                <Tag className="h-5 w-5 shrink-0 text-muted-foreground" />
                <Input
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <Button variant="gold" onClick={handleApplyCoupon}>
                  Apply
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold font-heading">Order Summary</h3>
                <div className="mt-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">₹{shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Flat shipping charge</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (18% GST)</span>
                    <span className="font-medium">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <Link to="/checkout/address">
                  <Button variant="gold" size="lg" className="mt-6 w-full text-base">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link to="/shop">
                  <Button variant="ghost" className="mt-3 w-full gap-2">
                    <ArrowLeft className="h-4 w-4" /> Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommended Products */}
        <section className="mt-16">
          <SectionHeading
            title="You May Also Like"
            subtitle="Recommended for you"
            center={false}
          />
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
            {recommendedProducts.map((product, index) => (
              <div key={product._id || product.id} className="min-w-65 w-65 snap-start">
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </section>
      </motion.div>
    </>
  );
}
