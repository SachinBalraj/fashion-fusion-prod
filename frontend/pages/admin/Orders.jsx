import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/admin';
import { toast } from 'sonner';
import { Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';

const statusColors = {
  pending: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function Orders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { statusFilter, page }],
    queryFn: () => {
      const params = { page, limit: 15 };
      return adminAPI.getAllOrders(params).then((r) => r.data);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, orderStatus, trackingNumber, trackingUrl, shipmentId }) => {
      const payload = { orderStatus };
      if (orderStatus === 'delivered') payload.isDelivered = true;
      if (trackingNumber !== undefined) payload.trackingNumber = trackingNumber;
      if (trackingUrl !== undefined) payload.trackingUrl = trackingUrl;
      if (shipmentId !== undefined) payload.shipmentId = shipmentId;
      return adminAPI.updateOrderStatus(id, payload);
    },
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries(['admin-orders']);
      setViewOrder(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const orders = Array.isArray(data) ? data : (data?.orders || []);
  const totalPages = data?.pages || 1;
  const filteredOrders = statusFilter
    ? orders.filter((o) => o.orderStatus === statusFilter)
    : orders;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
        >
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />)}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Payment</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{order._id.slice(-8)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.user?.email || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">{order.orderItems?.length || 0}</td>
                    <td className="px-4 py-3 font-medium">₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewOrder(order)} className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-12 text-center text-gray-400">No orders found</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">Page {data?.page || page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold">Order #{viewOrder._id.slice(-8)}</h3>
              <button onClick={() => setViewOrder(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Customer</p>
                  <p className="font-medium">{viewOrder.user?.name || viewOrder.customerName || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{viewOrder.user?.email || viewOrder.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Shipping Address</p>
                  <p className="text-sm">{viewOrder.shippingAddress?.street}</p>
                  <p className="text-sm">{viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.state} {viewOrder.shippingAddress?.zip}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Payment Method</p>
                  <p className="font-medium capitalize">{viewOrder.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Payment Status</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${viewOrder.isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {viewOrder.paymentStatus || (viewOrder.isPaid ? 'paid' : 'pending')}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Razorpay Order ID</p>
                  <p className="font-mono text-[10px] break-all">{viewOrder.razorpayOrderId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Razorpay Payment ID</p>
                  <p className="font-mono text-[10px] break-all">{viewOrder.razorpayPaymentId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Captured At</p>
                  <p className="text-sm">{viewOrder.paidAt ? new Date(viewOrder.paidAt).toLocaleString('en-IN') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Refund</p>
                  <p className="text-sm">{viewOrder.refundAmount ? `₹${viewOrder.refundAmount.toLocaleString('en-IN')}` : 'Not refunded'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Items</p>
                <div className="space-y-2">
                  {viewOrder.orderItems?.map((item, i) => (
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

              <div className="grid grid-cols-4 gap-2 rounded-lg bg-gray-50 p-3 text-center text-sm">
                <div><p className="text-gray-500">Subtotal</p><p className="font-medium">₹{viewOrder.itemsPrice?.toLocaleString('en-IN')}</p></div>
                <div><p className="text-gray-500">Shipping</p><p className="font-medium">₹{viewOrder.shippingPrice?.toLocaleString('en-IN')}</p></div>
                <div><p className="text-gray-500">Tax</p><p className="font-medium">₹{viewOrder.taxPrice?.toLocaleString('en-IN')}</p></div>
                <div><p className="text-gray-500">Total</p><p className="font-bold text-gold">₹{viewOrder.totalPrice?.toLocaleString('en-IN')}</p></div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Update Status</p>
                <div className="flex items-center gap-3">
                  <select
                    value={viewOrder.orderStatus}
                    onChange={(e) => setViewOrder((p) => ({ ...p, orderStatus: e.target.value }))}
                    className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => updateStatusMutation.mutate({
                      id: viewOrder._id,
                      orderStatus: viewOrder.orderStatus,
                      trackingNumber: viewOrder.trackingNumber || viewOrder.shipmentId || '',
                      trackingUrl: viewOrder.trackingUrl || '',
                      shipmentId: viewOrder.shipmentId || viewOrder.trackingNumber || '',
                    })}
                    disabled={updateStatusMutation.isPending}
                    className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50"
                  >
                    {updateStatusMutation.isPending ? 'Updating...' : 'Update'}
                  </button>
                </div>

                {(viewOrder.orderStatus === 'shipped' || viewOrder.orderStatus === 'out_for_delivery') && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Shipment ID</label>
                      <input
                        type="text"
                        value={viewOrder.shipmentId || viewOrder.trackingNumber || ''}
                        onChange={(e) => setViewOrder((p) => ({ ...p, shipmentId: e.target.value, trackingNumber: e.target.value }))}
                        placeholder="e.g. BLUEDEX-2048"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Tracking URL</label>
                      <input
                        type="url"
                        value={viewOrder.trackingUrl || ''}
                        onChange={(e) => setViewOrder((p) => ({ ...p, trackingUrl: e.target.value }))}
                        placeholder="https://example.com/track/123"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
