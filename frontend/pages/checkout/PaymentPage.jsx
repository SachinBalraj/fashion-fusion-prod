import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CreditCard, Truck, Banknote, Lock, Loader2, Wallet, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { useAuth } from '@/context/AuthContext';
import { createRazorpayOrder, verifyRazorpayPayment, loadRazorpayScript } from '@/services/paymentService';
import StepIndicator from '@/components/checkout/StepIndicator';
import { toast } from 'sonner';
import api from '@/services/api';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { selectedAddress, paymentMethod, setPaymentMethod, buyNowItem, formatAddress } = useCheckout();
  const isMounted = useRef(true);

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!selectedAddress) {
      navigate('/checkout/address', { replace: true });
    }
  }, [selectedAddress, navigate]);

  const prevCartLenRef = useRef(cartItems.length);
  useEffect(() => {
    if (prevCartLenRef.current > 0 && cartItems.length === 0 && !buyNowItem && !processing) {
      navigate('/cart', { replace: true });
    }
    prevCartLenRef.current = cartItems.length;
  }, [cartItems.length, buyNowItem, processing, navigate]);

  const checkoutItems = useMemo(() => {
    if (buyNowItem) {
      return [{
        _id: buyNowItem._id,
        product: buyNowItem._id,
        name: buyNowItem.name,
        image: buyNowItem.image,
        price: buyNowItem.price,
        quantity: buyNowItem.quantity || 1,
        size: buyNowItem.size,
      }];
    }
    return cartItems.map((item) => ({
      _id: item._id,
      product: item._id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));
  }, [buyNowItem, cartItems]);

  const subtotal = buyNowItem ? buyNowItem.price * (buyNowItem.quantity || 1) : cartTotal;
  const shipping = 80;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + shipping + tax;

  if (!selectedAddress || checkoutItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">Redirecting to cart…</p>
      </div>
    );
  }

  const handleRazorpayPayment = async () => {
    setProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        setProcessing(false);
        return;
      }

      const orderData = await createRazorpayOrder({
        items: checkoutItems.map((item) => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        address: {
          street: formatAddress(selectedAddress),
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: selectedAddress.country,
        },
        phone: selectedAddress.phone || user?.phone || '',
        customerName: user?.name || `${selectedAddress.firstName || ''} ${selectedAddress.lastName || ''}`.trim(),
        customerEmail: user?.email || selectedAddress.email || '',
      });

      if (!orderData?.key || orderData.key.includes('your_razorpay') || orderData.key === 'test') {
        throw new Error('Razorpay is not configured for this environment. Add valid production or test keys before enabling checkout.');
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: BUSINESS_INFO.name,
        description: `Order - ${checkoutItems.length} item(s)`,
        order_id: orderData.id,
        prefill: {
          name: user?.name || `${selectedAddress.firstName || ''} ${selectedAddress.lastName || ''}`.trim(),
          email: user?.email || selectedAddress.email,
          contact: selectedAddress.phone || user?.phone,
        },
        theme: { color: '#C89B2D' },
        handler: async function (response) {
          try {
            const result = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            navigate('/payment-success', {
              state: {
                orderId: result.orderId,
                orderNumber: result.orderNumber,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                total,
                items: checkoutItems,
                date: new Date().toISOString(),
                isGuestCheckout: result.isGuestCheckout,
                claimToken: result.claimToken,
                guestEmail: result.guestEmail || selectedAddress.email || user?.email || '',
                guestPhone: result.guestPhone || selectedAddress.phone || user?.phone || '',
                guestName: result.guestName || user?.name || `${selectedAddress.firstName || ''} ${selectedAddress.lastName || ''}`.trim(),
              },
            });
          } catch {
            navigate('/payment-failed', {
              state: { reason: 'Payment verification failed. Your payment has been received and will be verified shortly.', total },
            });
          }
        },
        modal: {
          ondismiss: function () {
            if (isMounted.current) setProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        navigate('/payment-failed', {
          state: { reason: response.error?.description || 'Payment failed. Please try again.', total },
        });
      });
      rzp.open();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Something went wrong';

      if (status === 404 || status === 410) {
        clearCart();
        toast.error(msg || 'Some items are no longer available. Your cart has been updated — please add items again.');
      } else if (status === 409) {
        toast.error(msg || 'Some items have insufficient stock. Please update quantities and try again.');
      } else {
        toast.error(msg);
      }
    } finally {
      if (isMounted.current) setProcessing(false);
    }
  };

  const handleCODOrder = async () => {
    setProcessing(true);
    try {
      const { data } = await api.post('/orders', {
        items: checkoutItems.map((item) => ({
          product: item.product,
          name: item.name,
          image: item.image,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          street: formatAddress(selectedAddress),
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: selectedAddress.country,
        },
        phone: user?.phone,
        paymentMethod: 'cod',
        subtotal,
        shipping,
        tax,
        discount: 0,
        total,
      });

      clearCart();
      navigate('/payment-success', {
        state: {
          orderId: data._id,
          orderNumber: data.orderNumber,
          total,
          items: checkoutItems,
          date: new Date().toISOString(),
          paymentMethod: 'cod',
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      if (isMounted.current) setProcessing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else if (paymentMethod === 'cod') {
      if (!user) {
        toast.error('Please sign in to place a Cash on Delivery order');
        navigate('/login', {
          state: {
            from: '/checkout/payment',
            message: 'Sign in to use Cash on Delivery. Razorpay checkout is available without an account.',
          },
        });
        return;
      }
      handleCODOrder();
    }
  };

  return (
    <>
      <Helmet>
        <title>Payment — Fashion's Fusion</title>
      </Helmet>

      <div className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
          <Link to="/checkout/address" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-[gold]">
            <ArrowLeft className="h-4 w-4" /> Back to Address
          </Link>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-16 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-['Poppins'] text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="mt-1 text-sm text-gray-500">Select your payment method</p>
          </motion.div>

          <div className="mt-6">
            <StepIndicator currentStep="Payment" />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6 lg:col-span-2">
              {/* Delivery Address Summary */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-['Poppins'] text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[gold]" /> Delivery Address
                  </h3>
                  <Link to="/checkout/address" className="text-xs font-semibold text-[gold] hover:underline">Change</Link>
                </div>
                <div className="rounded-xl bg-[#FFFDF8] p-4 text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-gray-900">{user?.name || `${selectedAddress.firstName || ''} ${selectedAddress.lastName || ''}`.trim()}</p>
                  <p>{formatAddress(selectedAddress)}</p>
                  <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}</p>
                  <p className="text-gray-500">Phone: {selectedAddress.phone || user?.phone || '-'}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-['Poppins'] text-lg font-bold text-gray-900 mb-4">Payment Method</h3>

                <div className="space-y-3">
                  {/* Razorpay */}
                  <button
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-[gold] bg-[gold]/5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      paymentMethod === 'razorpay' ? 'bg-[gold]' : 'bg-gray-100'
                    }`}>
                      <CreditCard className={`h-6 w-6 ${paymentMethod === 'razorpay' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Razorpay Secure Payment</p>
                      <p className="text-xs text-gray-500">UPI, Credit Card, Debit Card, Net Banking, Wallets, EMI</p>
                    </div>
                    <div className={`h-5 w-5 rounded-full border-2 ${
                      paymentMethod === 'razorpay' ? 'border-[gold]' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'razorpay' && <div className="h-full w-full rounded-full bg-[gold] scale-50" />}
                    </div>
                  </button>

                  {/* COD */}
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[gold] bg-[gold]/5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      paymentMethod === 'cod' ? 'bg-[gold]' : 'bg-gray-100'
                    }`}>
                      <Banknote className={`h-6 w-6 ${paymentMethod === 'cod' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when your order arrives</p>
                    </div>
                    <div className={`h-5 w-5 rounded-full border-2 ${
                      paymentMethod === 'cod' ? 'border-[gold]' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'cod' && <div className="h-full w-full rounded-full bg-[gold] scale-50" />}
                    </div>
                  </button>

                  {/* Wallet - Coming Soon */}
                  <div className="flex w-full items-center gap-4 rounded-xl border-2 border-gray-100 bg-gray-50/50 p-4 text-left opacity-60 cursor-not-allowed">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                      <Wallet className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-500">Wallet</p>
                      <p className="text-xs text-gray-400">Coming soon</p>
                    </div>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500">Soon</span>
                  </div>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <p className="text-xs font-semibold text-amber-800">COD Policy</p>
                    <p className="mt-1 text-xs text-amber-700">
                      Please keep exact change ready at the time of delivery. A nominal verification may be required via phone.
                    </p>
                  </div>
                )}

                <div className="mt-5">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[gold] py-4 text-base font-bold text-white shadow-lg shadow-[gold]/20 transition-all hover:bg-[#B8921F] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        {paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Lock className="h-3 w-3" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </motion.div>

            {/* Order Summary Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="font-['Poppins'] text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}{item.size ? ` · ${item.size}` : ''}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">₹{((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium">₹{shipping.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax (18% GST)</span>
                    <span className="font-medium">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
                    <span>Total</span>
                    <span className="text-[gold]">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-[#FFFDF8] p-3">
                  <Truck className="h-5 w-5 shrink-0 text-[gold]" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Shipping: ₹{shipping}</p>
                    <p className="text-[10px] text-gray-400">Flat rate shipping</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
