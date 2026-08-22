import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/admin';
import { toast } from 'sonner';
import { Eye, Search, X, RotateCcw } from 'lucide-react';

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

export default function Payments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewPayment, setViewPayment] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', { search, statusFilter, page }],
    queryFn: () => {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.paymentStatus = statusFilter;
      return adminAPI.getPayments(params).then((r) => r.data);
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ orderId, amount, reason }) => {
      return adminAPI.refundPayment(orderId, { amount: parseFloat(amount), reason });
    },
    onSuccess: () => {
      toast.success('Refund initiated successfully');
      queryClient.invalidateQueries(['admin-payments']);
      setShowRefundModal(null);
      setRefundAmount('');
      setRefundReason('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Refund failed'),
  });

  const orders = data?.orders || [];
  const stats = data?.stats || [];
  const statsMap = {};
  stats.forEach((s) => { statsMap[s._id] = s; });

  const handleRefund = (order) => {
    const maxRefund = order.totalPrice - (order.refundAmount || 0);
    setRefundAmount(maxRefund.toString());
    setRefundReason('');
    setShowRefundModal(order);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Payments</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Payment ID, Order #..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-gold focus:outline-none w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
          >
            <option value="">All Status</option>
            {paymentStatuses.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-100 bg-white p-3">
          <p className="text-xs text-gray-500">Total Payments</p>
          <p className="text-lg font-bold">{data?.total || 0}</p>
        </div>
        <div className="rounded-lg border border-green-100 bg-green-50 p-3">
          <p className="text-xs text-green-600">Paid</p>
          <p className="text-lg font-bold text-green-700">{statsMap.paid?.count || 0}</p>
          <p className="text-xs text-green-600">₹{(statsMap.paid?.totalAmount || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3">
          <p className="text-xs text-yellow-600">Pending</p>
          <p className="text-lg font-bold text-yellow-700">{statsMap.pending?.count || 0}</p>
        </div>
        <div className="rounded-lg border border-purple-100 bg-purple-50 p-3">
          <p className="text-xs text-purple-600">Refunded</p>
          <p className="text-lg font-bold text-purple-700">{statsMap.refunded?.count || 0}</p>
          <p className="text-xs text-purple-600">₹{(statsMap.refunded?.totalAmount || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />)}
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Order #</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Payment ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-medium">
                      {order.orderNumber || order._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user?.name || order.customerName || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.user?.email || order.customerEmail || ''}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">₹{order.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {order.razorpayPaymentId ? order.razorpayPaymentId.slice(0, 20) + '...' : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
                        {order.paymentStatus || (order.isPaid ? 'paid' : 'pending')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewPayment(order)}
                          className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.paymentStatus === 'paid' && order.razorpayPaymentId && (
                          <button
                            onClick={() => handleRefund(order)}
                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Refund"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-12 text-center text-gray-400">No payments found</p>
        )}

        {data?.pages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">Page {data.page} of {data.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {viewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold">Payment Details</h3>
              <button onClick={() => setViewPayment(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Order Number</p>
                  <p className="font-medium">{viewPayment.orderNumber || viewPayment._id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Customer</p>
                  <p className="font-medium">{viewPayment.user?.name || viewPayment.customerName || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{viewPayment.user?.email || viewPayment.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Razorpay Order ID</p>
                  <p className="font-mono text-xs break-all">{viewPayment.razorpayOrderId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Razorpay Payment ID</p>
                  <p className="font-mono text-xs break-all">{viewPayment.razorpayPaymentId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Payment Status</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusColors[viewPayment.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
                    {viewPayment.paymentStatus || (viewPayment.isPaid ? 'paid' : 'pending')}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Payment Method</p>
                  <p className="font-medium capitalize">{viewPayment.paymentMethod}</p>
                </div>
                {viewPayment.refundId && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Refund ID</p>
                      <p className="font-mono text-xs break-all">{viewPayment.refundId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Refund Amount</p>
                      <p className="font-medium">₹{(viewPayment.refundAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 rounded-lg bg-gray-50 p-3 text-center text-sm">
                <div><p className="text-gray-500">Subtotal</p><p className="font-medium">₹{viewPayment.itemsPrice?.toLocaleString('en-IN')}</p></div>
                <div><p className="text-gray-500">Shipping</p><p className="font-medium">₹{viewPayment.shippingPrice?.toLocaleString('en-IN')}</p></div>
                <div><p className="text-gray-500">Tax</p><p className="font-medium">₹{viewPayment.taxPrice?.toLocaleString('en-IN')}</p></div>
                <div><p className="text-gray-500">Total</p><p className="font-bold text-gold">₹{viewPayment.totalPrice?.toLocaleString('en-IN')}</p></div>
              </div>

              {viewPayment.orderItems && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Items</p>
                  <div className="space-y-2">
                    {viewPayment.orderItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                          {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold">Process Refund</h3>
              <button onClick={() => setShowRefundModal(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <p><span className="text-gray-500">Order:</span> #{showRefundModal.orderNumber || showRefundModal._id.slice(-8)}</p>
                <p><span className="text-gray-500">Total:</span> ₹{showRefundModal.totalPrice?.toLocaleString('en-IN')}</p>
                <p><span className="text-gray-500">Already Refunded:</span> ₹{(showRefundModal.refundAmount || 0).toLocaleString('en-IN')}</p>
                <p><span className="text-gray-500">Refundable:</span> ₹{(showRefundModal.totalPrice - (showRefundModal.refundAmount || 0)).toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={showRefundModal.totalPrice - (showRefundModal.refundAmount || 0)}
                  min="1"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  placeholder="Enter refund reason..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRefundModal(null)}
                  className="flex-1 rounded-lg border-2 border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:border-gold hover:text-gold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!refundAmount || parseFloat(refundAmount) <= 0) {
                      toast.error('Enter a valid refund amount');
                      return;
                    }
                    refundMutation.mutate({
                      orderId: showRefundModal._id,
                      amount: refundAmount,
                      reason: refundReason,
                    });
                  }}
                  disabled={refundMutation.isPending}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {refundMutation.isPending ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
