import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Download, ShoppingBag, Package } from 'lucide-react';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

function buildInvoicePdf(orderData) {
  const lines = [
    'INVOICE',
    BUSINESS_INFO.name,
    BUSINESS_INFO.addressLine1,
    BUSINESS_INFO.addressLine2,
    '',
    `Order Number: ${orderData.orderNumber || orderData.orderId}`,
    `Payment ID: ${orderData.razorpayPaymentId || 'N/A'}`,
    `Razorpay Order ID: ${orderData.razorpayOrderId || 'N/A'}`,
    '',
    'Items:',
    ...(orderData.items?.length
      ? orderData.items.map((item) => `- ${item.name} (x${item.quantity}) - ₹${((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}`)
      : ['N/A']),
    '',
    `Total Paid: ₹${(orderData.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Date: ${orderData.date ? new Date(orderData.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}`,
    '',
    'Thank you for shopping with Fashion\'s Fusion!',
  ];

  const escapedLines = lines.map((line) =>
    String(line).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  );

  const content = escapedLines
    .map((line, index) => {
      const y = 760 - index * 18;
      return `BT /F1 10 Tf 50 ${y} Td (${line}) Tj ET`;
    })
    .join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefPosition = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export default function PaymentSuccess() {
  const { state } = useLocation();
  const claimState = state?.isGuestCheckout
    ? {
        claimOrder: {
          orderId: state.orderId,
          claimToken: state.claimToken,
          guestEmail: state.guestEmail,
          guestPhone: state.guestPhone,
          guestName: state.guestName,
        },
      }
    : null;

  if (!state?.orderId) {
    return <Navigate to="/products" replace />;
  }

  const orderDate = state.date
    ? new Date(state.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const handleDownloadInvoice = () => {
    const blob = buildInvoicePdf({
      orderId: state.orderId,
      orderNumber: state.orderNumber,
      razorpayPaymentId: state.razorpayPaymentId,
      razorpayOrderId: state.razorpayOrderId,
      items: state.items,
      total: state.total,
      date: state.date,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${state.orderNumber || state.orderId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Payment Successful — Fashion&apos;s Fusion</title>
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
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50"
            >
              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 font-['Poppins'] text-2xl font-bold text-gray-900 md:text-3xl"
            >
              Payment Successful!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-gray-500"
            >
              Your order has been placed successfully. Thank you for shopping with us!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 space-y-3 rounded-2xl bg-[#FFFDF8] p-6"
            >
              {state.orderNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order Number</span>
                  <span className="font-semibold text-gray-900">{state.orderNumber}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment ID</span>
                <span className="font-semibold text-gray-900 break-all">{state.razorpayPaymentId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{orderDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-bold text-[gold]">₹{state.total?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <button
                onClick={handleDownloadInvoice}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[gold] py-3.5 text-sm font-semibold text-[gold] transition-all hover:bg-[gold] hover:text-white"
              >
                <Download className="h-4 w-4" /> Download Invoice
              </button>
              {state.isGuestCheckout ? (
                <Link to="/register" state={claimState} className="flex-1">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-[gold] hover:text-[gold]">
                    <Package className="h-4 w-4" /> Create Account to Track Order
                  </button>
                </Link>
              ) : (
                <Link to="/orders" className="flex-1">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-[gold] hover:text-[gold]">
                    <Package className="h-4 w-4" /> View Orders
                  </button>
                </Link>
              )}
              <Link to="/products" className="flex-1">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[gold] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[gold]/20 transition-all hover:bg-[#B8921F]">
                  <ShoppingBag className="h-4 w-4" /> Continue Shopping
                </button>
              </Link>
            </motion.div>

            {state.isGuestCheckout && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-4 rounded-xl border border-[gold]/20 bg-[gold]/5 p-4 text-left"
              >
                <p className="text-sm font-semibold text-gray-900">Track this order anytime</p>
                <p className="mt-1 text-xs text-gray-600">
                  Create an account with {state.guestEmail || 'the same email used at checkout'} and we will link this order automatically.
                </p>
                <div className="mt-3 flex gap-2">
                  <Link to="/register" state={claimState}>
                    <button className="rounded-lg bg-[gold] px-3 py-2 text-xs font-semibold text-white hover:bg-[#B8921F]">
                      Create Account
                    </button>
                  </Link>
                  <Link to="/login" state={claimState}>
                    <button className="rounded-lg border border-[gold] px-3 py-2 text-xs font-semibold text-[gold] hover:bg-[gold] hover:text-white">
                      Already have account? Sign in
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
