import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminAPI } from '@/services/admin';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

export default function Settings() {
  const [form, setForm] = useState({
    businessName: '', email: '', phone: '', address: '', logo: '',
    socialLinks: { facebook: '', instagram: '', twitter: '', youtube: '' },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminAPI.getSettings().then((r) => r.data),
  });

  useEffect(() => {
    if (settings) {
      setForm({
        businessName: settings.businessName || BUSINESS_INFO.name,
        email: settings.email || BUSINESS_INFO.email,
        phone: settings.phone || BUSINESS_INFO.phone,
        address: settings.address || BUSINESS_INFO.fullAddress,
        logo: settings.logo || '',
        socialLinks: {
          facebook: settings.socialLinks?.facebook || '',
          instagram: settings.socialLinks?.instagram || '',
          twitter: settings.socialLinks?.twitter || '',
          youtube: settings.socialLinks?.youtube || '',
        },
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data) => adminAPI.updateSettings(data),
    onSuccess: () => toast.success('Settings saved'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await adminAPI.uploadImage(formData);
      setForm((p) => ({ ...p, logo: data.path }));
      toast.success('Logo uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  const input = (label, key) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
    </div>
  );

  const socialInput = (label, key) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        value={form.socialLinks[key]}
        onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))}
        placeholder={`https://${key}.com/...`}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-heading text-lg font-semibold">Store Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {input('Business Name', 'businessName')}
            {input('Email', 'email')}
            {input('Phone', 'phone')}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Logo</label>
            <div className="flex items-center gap-4">
              {form.logo && <img src={form.logo} alt="Logo" className="h-16 w-16 rounded-lg object-cover border" />}
              <label className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-gold transition-colors">
                Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-heading text-lg font-semibold">Social Links</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {socialInput('Facebook URL', 'facebook')}
            {socialInput('Instagram URL', 'instagram')}
            {socialInput('Twitter URL', 'twitter')}
            {socialInput('YouTube URL', 'youtube')}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
