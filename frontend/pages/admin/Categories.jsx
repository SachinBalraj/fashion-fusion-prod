import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/admin';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';

export default function Categories() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', order: 0, isActive: true });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAPI.getCategories().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createCategory(data),
    onSuccess: () => { toast.success('Category created'); queryClient.invalidateQueries(['admin-categories']); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateCategory(id, data),
    onSuccess: () => { toast.success('Category updated'); queryClient.invalidateQueries(['admin-categories']); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteCategory(id),
    onSuccess: () => { toast.success('Category deleted'); queryClient.invalidateQueries(['admin-categories']); setDeleteId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resetForm = () => {
    setForm({ name: '', description: '', image: '', order: 0, isActive: true });
    setEditCat(null);
    setShowForm(false);
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', image: cat.image || '', order: cat.order || 0, isActive: cat.isActive });
    setEditCat(cat);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (editCat) {
      updateMutation.mutate({ id: editCat._id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await adminAPI.uploadImage(formData);
      setForm((p) => ({ ...p, image: data.path }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Categories</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white hover:bg-gold-dark transition-colors">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />)}
          </div>
        ) : categories?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Order</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Image</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Slug</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><GripVertical className="h-4 w-4 text-gray-300" /> {cat.order}</td>
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                        {cat.image ? <img src={cat.image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-gray-400">-</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(cat)} className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteId(cat._id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-12 text-center text-gray-400">No categories found</p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-heading text-lg font-semibold mb-4">{editCat ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Display Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gold/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gold" />
                </div>
              </div>
              {form.image && <img src={form.image} alt="" className="h-16 w-16 rounded-lg object-cover" />}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50">
                  {editCat ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-heading text-lg font-semibold">Delete Category?</h3>
            <p className="mt-2 text-sm text-gray-500">Products in this category will become uncategorized.</p>
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
