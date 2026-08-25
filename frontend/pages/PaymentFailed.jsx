import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { XCircle, RefreshCw, ShoppingCart } from 'lucide-react';

export default function PaymentFailed() {
  const { state } = useLocation();

  if (!state) {
    return <Navigate to="/products" replace />;
  }

  const reason = state.reason || 'An unexpected error occurred. Please try again.';

  return (
    <>
      <Helmet>
        <title>Payment Failed — Fashion&apos;s Fusion</title>
      </Helmet>

      <div className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl md:p-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 150, delay: 0.2 }}
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50"
            >
              <XCircle className="h-14 w-14 text-red-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 font-['Poppins'] text-2xl font-bold text-gray-900 md:text-3xl"
            >
              Payment Failed
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-gray-500"
            >
              We couldn&apos;t process your payment. Please try again.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 rounded-2xl bg-red-50 p-6"
            >
              <p className="text-sm font-medium text-red-700">Reason</p>
              <p className="mt-1 text-sm text-red-600">{reason}</p>
              {state.razorpayPaymentId && (
                <p className="mt-3 text-xs text-gray-600">
                  Razorpay Payment ID: <span className="font-mono font-semibold text-gray-800">{state.razorpayPaymentId}</span>
                </p>
              )}
              {state.total != null && (
                <p className="mt-3 text-sm font-semibold text-gray-900">
                  Amount: ₹{state.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/checkout/payment" className="flex-1">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A227] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#C9A227]/20 transition-all hover:bg-[#B8921F]">
                  <RefreshCw className="h-4 w-4" /> Retry Payment
                </button>
              </Link>
              <Link to="/cart" className="flex-1">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-[#C9A227] hover:text-[#C9A227]">
                  <ShoppingCart className="h-4 w-4" /> Back to Cart
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
