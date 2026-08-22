import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ShoppingBag, Download, CreditCard } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/services/api';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

function StatusBadge({ status }) {
  const variants = {
    pending: 'bg-orange-50 text-orange-700 border-orange-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    packed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    out_for_delivery: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  const label = status?.replace(/_/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {label}
    </span>
  );
}

function PaymentStatusBadge({ status }) {
  const variants = {
    paid: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {label}
    </span>
  );
}

function buildInvoicePdf(order) {
  const lines = [
    'INVOICE',
    BUSINESS_INFO.name,
    BUSINESS_INFO.addressLine1,
    BUSINESS_INFO.addressLine2,
    '',
    `Order Number: ${order.orderNumber || order._id}`,
    `Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`,
    `Payment Method: ${order.paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}`,
    `Payment Status: ${order.paymentStatus || (order.isPaid ? 'Paid' : 'Unpaid')}`,
    ...(order.razorpayPaymentId ? [`Payment ID: ${order.razorpayPaymentId}`] : []),
    '',
    'Items:',
    ...(order.orderItems?.length
      ? order.orderItems.map((item) => `- ${item.name}${item.size ? ` (Size: ${item.size})` : ''} (x${item.quantity}) - ₹${((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}`)
      : ['N/A']),
    '',
    `Subtotal: ₹${(order.itemsPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Shipping: ${order.shippingPrice === 0 ? 'Free' : `₹${(order.shippingPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}`,
    `Tax: ₹${(order.taxPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Total: ₹${(order.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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

function OrderTimeline({ order }) {
  const statuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
  const currentIndex = Math.max(
    0,
    statuses.indexOf(order?.orderStatus || 'pending') >= 0
      ? statuses.indexOf(order.orderStatus)
      : statuses.length - 1
  );

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-gray-500">Shipment Timeline</p>
      <div className="space-y-3">
        {statuses.map((status, index) => {
          const isDone = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const label = status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

          return (
            <div key={status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`h-3.5 w-3.5 rounded-full border-2 ${isDone ? 'border-gold bg-gold' : 'border-gray-300 bg-white'}`} />
                {index < statuses.length - 1 && (
                  <div className={`mt-1 h-8 w-px ${isDone ? 'bg-gold' : 'bg-gray-200'}`} />
                )}
              </div>
              <div className="flex-1 pb-2">
                <p className={`text-sm font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>{label}</p>
                {(index >= 3 && index <= 5 && isDone) && (
                  <div className="mt-1 space-y-1 text-xs text-gray-500">
                    {order?.shipmentId || order?.trackingNumber ? (
                      <p>Shipment ID: <span className="font-medium text-gray-700">{order.shipmentId || order.trackingNumber}</span></p>
                    ) : null}
                    {order?.trackingUrl ? (
                      <p>
                        Tracking URL:{' '}
                        <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="font-medium text-gold underline">
                          Open tracking
                        </a>
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/myorders')
      .then(({ data }) => setOrders(data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadInvoice = (order) => {
    const blob = buildInvoicePdf(order);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderNumber || order._id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>My Orders — Fashion&apos;s Fusion</title>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-['Poppins'] text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-500">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="mb-2 font-['Poppins'] text-lg font-semibold text-gray-900">No orders yet</h2>
            <p className="mb-6 text-sm text-gray-500">When you place an order, it will appear here.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B8921F]"
            >
              <ShoppingBag className="h-4 w-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 px-5 py-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                        <Package className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.orderNumber ? `#${order.orderNumber}` : `Order #${order._id.slice(-8).toUpperCase()}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>·</span>
                          <span>{order.orderItems?.length || 0} {(order.orderItems?.length || 0) === 1 ? 'item' : 'items'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{(order.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <StatusBadge status={order.orderStatus} />
                          <PaymentStatusBadge status={order.paymentStatus || (order.isPaid ? 'paid' : 'pending')} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 flex flex-wrap items-center gap-3 border-b border-gray-50 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {order.paymentMethod === 'razorpay' ? 'Razorpay' : 'COD'}
                    </span>
                    {order.razorpayPaymentId && (
                      <span className="text-gray-400">Payment ID: {order.razorpayPaymentId}</span>
                    )}
                  </div>

                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="px-5 py-4">
                      <div className="flex flex-wrap gap-3">
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}{item.color ? ` · ${item.color}` : ''}
                              </p>
                              <p className="text-xs font-medium text-gray-700">₹{item.price?.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus) && (
                        <OrderTimeline order={order} />
                      )}

                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gold transition-colors hover:text-[#B8921F]"
                      >
                        <Download className="h-3.5 w-3.5" /> Download Invoice
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
