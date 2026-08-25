import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Lock, ArrowLeft, CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import OrderSummary from '@/components/OrderSummary';
import BillingForm from '@/components/BillingForm';
import PaymentButton from '@/components/PaymentButton';
import { createRazorpayOrder, verifyRazorpayPayment, loadRazorpayScript } from '@/services/paymentService';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [billing, setBilling] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <CheckCircle2 className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-sm text-gray-500">Add some items before checking out.</p>
        <Link to="/products" className="mt-6 rounded-xl bg-[gold] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B8921F]">
          Browse Products
        </Link>
      </div>
    );
  }

  const shipping = 80;
  const tax = Math.round(cartTotal * 0.18 * 100) / 100;
  const total = cartTotal + shipping + tax;

  const validate = () => {
    const newErrors = {};
    const phoneDigits = billing.phone.replace(/\D/g, '');
    const normalizedPhone = phoneDigits.startsWith('91') && phoneDigits.length === 12
      ? phoneDigits.slice(2)
      : phoneDigits;
    if (!billing.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!billing.phone.trim()) newErrors.phone = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(normalizedPhone)) newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!billing.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)) newErrors.email = 'Enter a valid email address';
    if (!billing.address.trim()) newErrors.address = 'Address is required';
    if (!billing.city.trim()) newErrors.city = 'City is required';
    if (!billing.state.trim()) newErrors.state = 'State is required';
    if (!billing.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(billing.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        setProcessing(false);
        return;
      }

      const orderData = await createRazorpayOrder({
        items: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        address: {
          street: billing.address,
          city: billing.city,
          state: billing.state,
          zip: billing.pincode,
          country: billing.country,
        },
        phone: billing.phone,
        customerName: billing.fullName,
        customerEmail: billing.email,
      });

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: BUSINESS_INFO.name,
        description: `Order - ${cartItems.length} item(s)`,
        order_id: orderData.id,
        prefill: {
          name: billing.fullName,
          email: billing.email,
          contact: billing.phone,
        },
        theme: {
          color: '#C89B2D',
        },
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
                items: cartItems,
                date: new Date().toISOString(),
                isGuestCheckout: result.isGuestCheckout,
                claimToken: result.claimToken,
                guestEmail: result.guestEmail || billing.email,
                guestPhone: result.guestPhone || billing.phone,
                guestName: result.guestName || billing.fullName,
              },
            });
          } catch (err) {
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
          state: {
            reason: response.error?.description || 'Payment failed. Please try again.',
            total,
          },
        });
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      if (isMounted.current) setProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout — Fashion&apos;s Fusion</title>
      </Helmet>

      <div className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-[gold]">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-['Poppins'] text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="mt-1 text-sm text-gray-500">Complete your order details and proceed to payment</p>
          </motion.div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6 lg:col-span-2"
            >
              <BillingForm billing={billing} setBilling={setBilling} errors={errors} />

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-['Poppins'] text-lg font-bold text-gray-900">Payment Method</h3>
                <div className="mt-4 flex items-center gap-4 rounded-xl border-2 border-[gold]/30 bg-[gold]/5 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[gold]">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Razorpay Secure Payment</p>
                    <p className="text-xs text-gray-500">UPI, Credit Card, Debit Card, Net Banking, Wallets, EMI</p>
                  </div>
                  <Lock className="ml-auto h-4 w-4 text-[gold]" />
                </div>
              </div>

              <PaymentButton onClick={handlePayment} loading={processing} disabled={processing} />

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Lock className="h-3 w-3" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <OrderSummary cartItems={cartItems} subtotal={cartTotal} shipping={shipping} tax={tax} total={total} />

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
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
