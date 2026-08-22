import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/admin';
import { toast } from 'sonner';
import { X, Upload, Trash2 } from 'lucide-react';

const defaultForm = {
  name: '', category: '', price: '', comparePrice: '', description: '',
  subcategory: '', material: '', brand: '', gender: 'women', stock: '',
  colors: '', sizes: '', tags: '', ratings: '', isFeatured: false,
  isBestSeller: false, isNewArrival: false, isActive: true, images: [],
};

export default function ProductForm({ product, onSave, onCancel }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => {
    if (!product) return defaultForm;
    return {
      ...defaultForm,
      ...product,
      category: product.category?._id || product.category || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      stock: product.stock ?? '',
      ratings: product.ratings || '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
      images: product.images || [],
    };
  });
  const [uploading, setUploading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAPI.getCategories().then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        price: Number(data.price),
        comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
        stock: Number(data.stock),
        ratings: data.ratings ? Number(data.ratings) : 0,
        colors: data.colors ? data.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
        sizes: data.sizes ? data.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        tags: data.tags ? data.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (product) {
        return adminAPI.updateProduct(product._id, payload);
      }
      return adminAPI.createProduct(payload);
    },
    onSuccess: () => {
      toast.success(product ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries(['admin-products']);
      onSave();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await adminAPI.uploadImage(formData);
      setForm((prev) => ({ ...prev, images: [...prev.images, data.path] }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price || !form.description) {
      toast.error('Please fill required fields');
      return;
    }
    mutation.mutate(form);
  };

  const input = (label, key, type = 'text', required = false) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        required={required}
      />
    </div>
  );

  const textarea = (label, key, required = false) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
      <textarea
        value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        rows={3}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-none"
        required={required}
      />
    </div>
  );

  const toggle = (label, key) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.checked }))}
        className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="rounded-xl bg-white shadow-xl max-h-[85vh] overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
        <h2 className="font-heading text-xl font-semibold">{product ? 'Edit Product' : 'Add Product'}</h2>
        <button onClick={onCancel} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {input('Product Name', 'name', 'text', true)}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none" required>
              <option value="">Select category</option>
              {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          {input('Price', 'price', 'number', true)}
          {input('Compare Price', 'comparePrice', 'number')}
        </div>

        {textarea('Description', 'description', true)}
        {input('Short Description / Subcategory', 'subcategory')}
        {input('Product Details', 'subcategory')}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {input('Fabric / Material', 'material')}
          {input('Brand', 'brand')}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
            <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none">
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
              <option value="kids">Kids</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {input('Colour', 'colors')}
          {input('Sizes (comma-separated)', 'sizes')}
          {input('Tags (comma-separated)', 'tags')}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {input('Stock Quantity', 'stock', 'number', true)}
          {input('Rating (0-5)', 'ratings', 'number')}
        </div>

        <div className="flex flex-wrap gap-6">
          {toggle('Featured Product', 'isFeatured')}
          {toggle('Best Seller', 'isBestSeller')}
          {toggle('New Arrival', 'isNewArrival')}
          {toggle('Active', 'isActive')}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Images</label>
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border">
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gold transition-colors">
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="mt-1 text-xs text-gray-400">{uploading ? 'Uploading...' : 'Upload'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-gold px-6 py-2 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
