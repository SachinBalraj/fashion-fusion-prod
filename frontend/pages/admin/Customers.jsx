import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/services/admin';
import { Search, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewCustomer, setViewCustomer] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', { search, page }],
    queryFn: () => adminAPI.getCustomers({ page, limit: 20 }).then((r) => r.data),
  });

  const customers = data?.customers || [];
  const filtered = search
    ? customers.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Customers</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                          {customer.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.phone || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(customer.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewCustomer(customer)} className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-12 text-center text-gray-400">No customers found</p>
        )}

        {data?.pages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">Page {data.page} of {data.pages} ({data.total} customers)</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold">Customer Details</h3>
              <button onClick={() => setViewCustomer(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gold/20 flex items-center justify-center text-lg font-bold text-gold">
                  {viewCustomer.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{viewCustomer.name}</p>
                  <p className="text-sm text-gray-500">{viewCustomer.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                <div><p className="text-gray-500">Phone</p><p className="font-medium">{viewCustomer.phone || 'Not provided'}</p></div>
                <div><p className="text-gray-500">Joined</p><p className="font-medium">{new Date(viewCustomer.createdAt).toLocaleDateString('en-IN')}</p></div>
                <div><p className="text-gray-500">Role</p><p className="font-medium capitalize">{viewCustomer.role}</p></div>
                <div><p className="text-gray-500">Status</p><p className="font-medium">{viewCustomer.isActive ? 'Active' : 'Inactive'}</p></div>
              </div>
              {viewCustomer.addresses?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Addresses</p>
                  {viewCustomer.addresses.map((addr, i) => (
                    <p key={i} className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
