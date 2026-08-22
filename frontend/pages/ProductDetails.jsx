import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Heart, Minus, Plus, ArrowLeft, ShieldCheck, Truck, RotateCcw, ChevronDown, Check, Sparkles, ListChecks, Ruler, Scissors } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCheckout } from '@/context/CheckoutContext';
import { toast } from 'sonner';
import { allProducts, getRelatedProducts } from '@/services/products';
import SizeSelector from '@/components/SizeSelector';

function AccordionSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[gold]" />
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 bg-gray-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RelatedProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} state={{ category: product.category }}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group rounded-xl bg-white shadow-sm transition-all hover:shadow-md"
      >
        <div className="aspect-3/4 rounded-t-xl bg-gray-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[gold]">{product.category}</p>
          <h4 className="mt-0.5 text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</h4>
          <p className="mt-1 text-sm font-bold text-gray-900">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </motion.div>
    </Link>
  );
}

function categoryToSlug(category) {
  return category?.toLowerCase().replace(/[&\s]+/g, '-') || '';
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { setBuyNowItem } = useCheckout();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');

  const backCategory = location.state?.category;
  const backSlug = categoryToSlug(backCategory);
  const backLink = backSlug ? `/products#${backSlug}` : '/products';

  const isWishlisted = isInWishlist(id);
  const product = allProducts.find((p) => p.id === id);
  const isMaterial = product?.category === 'Material' || product?.category === 'Raw Silk Fabric';
  const isKurti = product?.category === 'Ready-Made Kurtis' || product?.category === 'Kurthi' || product?.category === 'Kurti Set' || product?.category === 'Festive Wear';
  const isShawl = product?.category === 'Premium Shawls' || product?.category === 'Assam Silk Shawl';
  const isHairAccessories = product?.category === 'Hair Accessories';
  const isCordSet = product?.category === 'Cord Set' || product?.category === 'Cord Sets';

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <ShoppingBag className="h-20 w-20 text-gray-200" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Product Not Found</h2>
        <p className="mt-2 text-sm text-gray-500">The product you're looking for doesn't exist.</p>
        <Link
          to={backLink}
          className="mt-6 rounded-lg bg-[gold] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#B8921F]"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product, 4);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const incrementQty = () => setQuantity((q) => Math.min(q + 1, product.stock || 99));
  const decrementQty = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    if (isKurti && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, quantity, isKurti ? selectedSize : undefined);
    toast.success(`${product.name}${isKurti ? ` (${selectedSize})` : ''} added to cart`);
  };

  const handleBuyNow = () => {
    if (isKurti && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    setBuyNowItem({
      _id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
      size: isKurti ? selectedSize : undefined,
    });
    navigate('/checkout/address');
  };

  return (
    <>
      <Helmet>
        <title>{`${product.name} — Fashion's Fusion`}</title>
      </Helmet>

      <div className="bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Link
            to={backLink}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-[gold]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-3/4 overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-[gold]">
                {product.category}
              </span>
              <h1 className="mt-2 font-['Poppins'] text-2xl font-bold text-gray-900 md:text-3xl">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                {isMaterial && (
                  <span className="text-sm font-medium text-gray-500">per Meter</span>
                )}
                {!isMaterial && product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-500">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {product.suitableFor && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Suitable For</p>
                  <p className="text-sm text-amber-700">{product.suitableFor}</p>
                </div>
              )}

              {!isMaterial && product.stock !== undefined && (
                <div className="mt-4 flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Only Few Left' : 'Out of Stock'}
                  </span>
                  <span className="text-sm text-gray-400">| SKU: {product.sku}</span>
                </div>
              )}

              {isKurti && product.sizes && (
                <SizeSelector selectedSize={selectedSize} onSelect={setSelectedSize} />
              )}

              {!isMaterial && product.stock > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-medium text-gray-900">Quantity</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementQty}
                      disabled={quantity <= 1}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:border-[gold] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-lg font-semibold text-gray-900">{quantity}</span>
                    <button
                      onClick={incrementQty}
                      disabled={quantity >= (product.stock || 99)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:border-[gold] disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {isMaterial && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-medium text-gray-900">Quantity (Meters)</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementQty}
                      disabled={quantity <= 1}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:border-[gold] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-lg font-semibold text-gray-900">{quantity}</span>
                    <button
                      onClick={incrementQty}
                      disabled={quantity >= (product.stock || 99)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:border-[gold] disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[gold] py-3 text-sm font-semibold text-white transition-all hover:bg-[#B8921F]"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[gold] py-3 text-sm font-semibold text-[gold] transition-all hover:bg-[gold] hover:text-white"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-all ${
                    isWishlisted
                      ? 'border-[sale] bg-[sale]/10 text-[sale]'
                      : 'border-gray-200 text-gray-500 hover:border-[gold] hover:text-[gold]'
                  }`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-[sale]' : ''}`} />
                </button>
              </div>

              <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-['Poppins'] text-lg font-bold text-[gold]">Product Description</h3>
                <p className="mt-3 text-[16px] leading-[1.8] text-gray-700">
                  {product.description}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: 'Shipping Charge', desc: 'Flat ₹80 shipping' },
                  { icon: ShieldCheck, label: 'Secure Checkout', desc: 'SSL Encrypted' },
                  { icon: RotateCcw, label: 'Easy Returns', desc: '30-day return' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-white p-3 text-center shadow-sm">
                    <item.icon className="mx-auto h-5 w-5 text-[gold]" />
                    <p className="mt-1 text-xs font-semibold text-gray-900">{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {(isMaterial || isKurti || isShawl || isHairAccessories || isCordSet) && (
            <div className="mt-12">
              <h2 className="mb-6 font-['Poppins'] text-xl font-bold text-gray-900">Product Details</h2>
              
              <AccordionSection title="Product Details" icon={Ruler} defaultOpen={true}>
                <div className="grid grid-cols-2 gap-3">
                  {(isMaterial || isShawl || isCordSet || (isKurti && product.fabric)) && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Fabric</p>
                      <p className="text-sm font-semibold text-gray-900">{product.fabric}</p>
                    </div>
                  )}
                  {isMaterial && product.design && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Design</p>
                      <p className="text-sm font-semibold text-gray-900">{product.design}</p>
                    </div>
                  )}
                  {product.colour && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Colour</p>
                      <p className="text-sm font-semibold text-gray-900">{product.colour}</p>
                    </div>
                  )}
                  {(isKurti || isCordSet) && product.neckline && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Neckline</p>
                      <p className="text-sm font-semibold text-gray-900">{product.neckline}</p>
                    </div>
                  )}
                  {(isKurti || isCordSet) && product.sleeves && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Sleeves</p>
                      <p className="text-sm font-semibold text-gray-900">{product.sleeves}</p>
                    </div>
                  )}
                  {isKurti && product.fit && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Fit</p>
                      <p className="text-sm font-semibold text-gray-900">{product.fit}</p>
                    </div>
                  )}
                  {isKurti && product.kurtiStyle && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Kurti Style</p>
                      <p className="text-sm font-semibold text-gray-900">{product.kurtiStyle}</p>
                    </div>
                  )}
                  {isKurti && product.bottom && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Bottom</p>
                      <p className="text-sm font-semibold text-gray-900">{product.bottom}</p>
                    </div>
                  )}
                  {isCordSet && product.setIncludes && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Set Includes</p>
                      <p className="text-sm font-semibold text-gray-900">{product.setIncludes}</p>
                    </div>
                  )}
                  {isCordSet && product.fit && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Fit</p>
                      <p className="text-sm font-semibold text-gray-900">{product.fit}</p>
                    </div>
                  )}
                  {product.sizes && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Available Sizes</p>
                      <p className="text-sm font-semibold text-gray-900">{product.sizes?.join(', ')}</p>
                    </div>
                  )}
                  {isMaterial && product.width && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Width</p>
                      <p className="text-sm font-semibold text-gray-900">{product.width}</p>
                    </div>
                  )}
                  {isMaterial && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Price</p>
                      <p className="text-sm font-semibold text-gray-900">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/meter</p>
                    </div>
                  )}
                  {isShawl && product.size && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Size</p>
                      <p className="text-sm font-semibold text-gray-900">{product.size}</p>
                    </div>
                  )}
                  {isShawl && product.width && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Width</p>
                      <p className="text-sm font-semibold text-gray-900">{product.width}</p>
                    </div>
                  )}
                </div>
              </AccordionSection>

              {product.washCare && product.washCare.length > 0 && (
                <AccordionSection title="Wash & Care" icon={Scissors}>
                  <ul className="space-y-2">
                    {product.washCare.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[gold] mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionSection>
              )}

              {product.careInstructions && product.careInstructions.length > 0 && (
                <AccordionSection title="Care Instructions" icon={Scissors}>
                  <ul className="space-y-2">
                    {product.careInstructions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[gold] mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionSection>
              )}

              {product.advantages && product.advantages.length > 0 && (
                <AccordionSection title="Advantages" icon={Sparkles}>
                  <ul className="space-y-2">
                    {product.advantages.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionSection>
              )}

              {product.benefits && product.benefits.length > 0 && (
                <AccordionSection title="Benefits" icon={ListChecks}>
                  <ul className="space-y-2">
                    {product.benefits.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionSection>
              )}

              {product.features && product.features.length > 0 && (
                <AccordionSection title="Features" icon={ListChecks}>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </AccordionSection>
              )}

              {product.keyFeatures && product.keyFeatures.length > 0 && (
                <AccordionSection title="Key Features" icon={ListChecks}>
                  <div className="flex flex-wrap gap-2">
                    {product.keyFeatures.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </AccordionSection>
              )}
            </div>
          )}

          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 font-['Poppins'] text-xl font-bold text-gray-900">Related Products</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {relatedProducts.map((rp) => (
                  <RelatedProductCard key={rp.id} product={rp} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
