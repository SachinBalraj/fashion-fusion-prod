import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/services/admin';
import { Package, FolderOpen, ShoppingCart, Users, IndianRupee, AlertTriangle } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboardStats().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-blue-500' },
    { label: 'Categories', value: stats?.totalCategories || 0, icon: FolderOpen, color: 'bg-green-500' },
    { label: 'Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'bg-orange-500' },
    { label: 'Revenue', value: `₹${(stats?.revenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-gold' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <h2 className="mb-4 font-heading text-lg font-semibold">Recent Orders</h2>
          {stats?.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Order ID</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b last:border-0">
                      <td className="py-2.5 font-mono text-xs">{order._id.slice(-8)}</td>
                      <td className="py-2.5">{order.user?.name || 'N/A'}</td>
                      <td className="py-2.5 font-medium">₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                      <td className="py-2.5">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-gray-400">No orders yet</p>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Products
          </h2>
          {stats?.lowStockProducts?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Stock</th>
                    <th className="pb-2 font-medium">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockProducts.map((product) => (
                    <tr key={product._id} className="border-b last:border-0">
                      <td className="py-2.5">{product.name}</td>
                      <td className="py-2.5">
                        <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-500">{product.category?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-gray-400">All products are well stocked</p>
          )}
        </div>
      </div>
    </div>
  );
}
