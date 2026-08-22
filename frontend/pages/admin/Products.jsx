import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/admin';
import { toast } from 'sonner';
import { Plus, Search, Pencil, Trash2, Copy, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductForm from './ProductForm';

export default function Products() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAPI.getCategories().then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { search, categoryFilter, statusFilter, page }],
    queryFn: () => {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.isActive = statusFilter;
      return adminAPI.getProducts(params).then((r) => r.data);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => adminAPI.duplicateProduct(id),
    onSuccess: () => {
      toast.success('Product duplicated');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => adminAPI.updateProduct(id, { isActive }),
    onSuccess: () => {
      toast.success('Product updated');
      queryClient.invalidateQueries(['admin-products']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteProduct(id),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries(['admin-products']);
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditProduct(null);
    queryClient.invalidateQueries(['admin-products']);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Products</h1>
        <button onClick={handleAdd} className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white hover:bg-gold-dark transition-colors">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : data?.products?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.material || product.brand || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category?.name || '-'}</td>
                    <td className="px-4 py-3 font-medium">₹{product.price?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${product.stock < 10 ? 'text-orange-600' : product.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(product)} className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => duplicateMutation.mutate(product._id)} className="rounded p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors" title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button onClick={() => toggleActiveMutation.mutate({ id: product._id, isActive: !product.isActive })} className="rounded p-1.5 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 transition-colors" title={product.isActive ? 'Deactivate' : 'Activate'}>
                          {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button onClick={() => setDeleteId(product._id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-12 text-center text-gray-400">No products found</p>
        )}

        {data?.pages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">
              Page {data.page} of {data.pages} ({data.total} products)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-10 pb-10">
          <div className="relative w-full max-w-3xl mx-4">
            <ProductForm product={editProduct} onSave={handleFormSave} onCancel={() => { setShowForm(false); setEditProduct(null); }} />
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-heading text-lg font-semibold">Delete Product?</h3>
            <p className="mt-2 text-sm text-gray-500">This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
