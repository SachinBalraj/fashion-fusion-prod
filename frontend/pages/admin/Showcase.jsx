import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/services/admin';
import { toast } from 'sonner';
import {
  Upload,
  Trash2,
  Save,
  ChevronUp,
  ChevronDown,
  X,
  ExternalLink,
  Pencil,
  RefreshCw,
  Eye,
  Layers,
} from 'lucide-react';
import {
  DEFAULT_COLLECTION_SLUGS,
  DEFAULT_SHOWCASE_IMAGES,
} from '@/src/constants/showcaseDefaults';
import ProductPicker from '@/components/admin/ProductPicker';
import ProductShowcase from '@/components/ProductShowcase';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SLOT_MAX = 5;
const SUB_SLOT_MAX = 3;
const DESCRIPTION_MAX = 100;
const SLUG_MAX = 120;
const TITLE_MAX = 80;
const PRODUCT_MAX = 3;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const formatINR = (value) => (Number(value) || 0).toLocaleString('en-IN');

const slugifyName = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX);

function buildInitialDrafts(images) {
  const next = {};
  for (const slot of images || []) {
    const slotNum = Number(slot?.slot);
    if (!Number.isInteger(slotNum)) continue;
    const byId = new Map(
      (slot.products || []).map((p) => [String(p?._id), p])
    );
    const items = (slot.productIds || [])
      .map((id) => {
        const key = String(id);
        const p = byId.get(key);
        return p
          ? {
              productId: key,
              name: p.name || '',
              image: p.images?.[0] || p.image || '',
              price: p.price,
              stock: p.stock,
              category: p.category?.name || '',
              isActive: p.isActive !== false,
            }
          : { productId: key };
      })
      .filter((item) => item.productId);
    next[slotNum] = {
      title: slot.title || '',
      description: slot.description || '',
      slug: slot.slug || DEFAULT_COLLECTION_SLUGS[slotNum - 1] || '',
      slugTouched: false,
      items,
    };
  }
  return next;
}

export default function Showcase({ heading = 'Products Page Showcase', subheading }) {
  const queryClient = useQueryClient();
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [editingSlot, setEditingSlot] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);
  const [managingSlot, setManagingSlot] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [subDraft, setSubDraft] = useState(null);
  const [subImageSource, setSubImageSource] = useState(null);
  const initializedRef = useRef(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-showcase'],
    queryFn: () => adminAPI.getShowcase().then((r) => r.data),
  });

  useEffect(() => {
    if (initializedRef.current || !data?.images) return;
    initializedRef.current = true;
    setDrafts((prev) => ({ ...prev, ...buildInitialDrafts(data.images) }));
  }, [data]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-showcase'] });

  const uploadMutation = useMutation({
    mutationFn: ({ slot, file }) => {
      const formData = new FormData();
      formData.append('image', file);
      return adminAPI.setShowcaseSlotImage(slot, formData);
    },
    onSuccess: () => {
      toast.success('Showcase image updated');
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
    onSettled: () => setUploadingSlot(null),
  });

  const removeMutation = useMutation({
    mutationFn: (slot) => adminAPI.removeShowcaseSlotImage(slot),
    onSuccess: () => {
      toast.success('Custom image removed — default restored');
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Remove failed'),
  });

  const saveMutation = useMutation({
    mutationFn: ({ slot }) => {
      const d = drafts[slot] || {};
      return adminAPI.setShowcaseSlotDetails(slot, {
        title: d.title || '',
        description: d.description || '',
        slug: d.slug || '',
        productIds: (d.items || []).map((item) => item.productId),
      });
    },
    onSuccess: (resp) => {
      const saved = resp.data;
      setDrafts((prev) => {
        const current = prev[saved.slot] || { title: '', description: '', slug: '', slugTouched: false, items: [] };
        return {
          ...prev,
          [saved.slot]: {
            ...current,
            title: saved?.title ?? current.title,
            description: saved?.description ?? current.description,
            slug: saved?.slug || current.slug,
          },
        };
      });
      toast.success('Collection updated successfully');
      invalidate();
      setPickerFor(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Save failed');
    },
  });

  const getFreeSlug = (title) => slugifyName(title);

  const subImageMutation = useMutation({
    mutationFn: ({ slot, sub, file }) => {
      const formData = new FormData();
      formData.append('image', file);
      return adminAPI.setSubMaterialImage(slot, sub, formData);
    },
    onSuccess: () => {
      toast.success('Sub-material image updated');
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
    onSettled: () => setSubImageSource(null),
  });

  const subSaveMutation = useMutation({
    mutationFn: ({ slot, sub, data }) => adminAPI.setSubMaterialDetails(slot, sub, data),
    onSuccess: (resp) => {
      const saved = resp.data;
      setSubDraft((prev) =>
        prev
          ? {
              title: saved?.title ?? prev.title,
              slug: saved?.slug || prev.slug,
            }
          : prev
      );
      toast.success('Sub-material updated');
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const handleTitleChange = (slot, value) => {
    setDrafts((prev) => {
      const current = prev[slot] || { title: '', description: '', slug: '', slugTouched: false, items: [] };
      return { ...prev, [slot]: { ...current, title: value } };
    });
  };

  const handleDescChange = (slot, value) => {
    setDrafts((prev) => ({ ...prev, [slot]: { ...prev[slot], description: value } }));
  };

  const handleSlugChange = (slot, value) => {
    setDrafts((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], slug: value, slugTouched: true },
    }));
  };

  const regenerateSlug = (slot) => {
    setDrafts((prev) => {
      const current = prev[slot] || { title: '', description: '', slug: '', slugTouched: false, items: [] };
      return { ...prev, [slot]: { ...current, slug: getFreeSlug(current.title), slugTouched: true } };
    });
  };

  const handleAddProduct = (slot, product) => {
    const id = product._id || product.id;
    setDrafts((prev) => {
      const current = prev[slot] || { title: '', description: '', slug: '', slugTouched: false, items: [] };
      if ((current.items || []).length >= PRODUCT_MAX) {
        toast.error(`A collection supports at most ${PRODUCT_MAX} products`);
        return prev;
      }
      if ((current.items || []).some((item) => item.productId === id)) {
        toast.info('That product is already in this collection');
        return prev;
      }
      return {
        ...prev,
        [slot]: {
          ...current,
          items: [
            ...(current.items || []),
            {
              productId: id,
              name: product.name || '',
              image: product.images?.[0] || product.image || '',
              price: product.price,
              stock: product.stock,
              category: product.category?.name || '',
              isActive: product.isActive !== false,
            },
          ],
        },
      };
    });
  };

  const handleReplaceProduct = (slot, index, product) => {
    const id = product._id || product.id;
    setDrafts((prev) => {
      const current = prev[slot] || { title: '', description: '', slug: '', slugTouched: false, items: [] };
      const items = [...(current.items || [])];
      if (items.some((item, i) => i !== index && item.productId === id)) {
        toast.info('That product is already in this collection');
        return prev;
      }
      items[index] = {
        productId: id,
        name: product.name || '',
        image: product.images?.[0] || product.image || '',
        price: product.price,
        stock: product.stock,
        category: product.category?.name || '',
        isActive: product.isActive !== false,
      };
      return { ...prev, [slot]: { ...current, items } };
    });
    setPickerFor(null);
  };

  const handleRemoveProduct = (slot, productId) => {
    setDrafts((prev) => {
      const current = prev[slot] || { title: '', description: '', slug: '', slugTouched: false, items: [] };
      return {
        ...prev,
        [slot]: {
          ...current,
          items: (current.items || []).filter((item) => item.productId !== productId),
        },
      };
    });
  };

  const handleMoveProduct = (slot, index, direction) => {
    setDrafts((prev) => {
      const current = prev[slot] || { title: '', description: '', slug: '', slugTouched: false, items: [] };
      const items = [...(current.items || [])];
      const target = index + direction;
      if (target < 0 || target >= items.length) return prev;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...prev, [slot]: { ...current, items } };
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold">{heading}</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: SLOT_MAX }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold">{heading}</h1>
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Showcase settings could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  const slots = (data?.images || []).filter((entry) => Number.isInteger(Number(entry.slot)));

  const previewImages = slots.map(({ slot, image, description, slug }) => ({
    slot,
    image,
    description,
    slug,
  }));

  const draftFor = (slot) =>
    drafts[slot] || { title: '', description: '', slug: '', slugTouched: false, items: [] };

  const slugTaken = (slot, value) => {
    const clean = String(value || '').trim().toLowerCase();
    if (!clean) return false;
    return slots.some(
      (entry) => Number(entry.slot) !== Number(slot) && String(entry.slug).toLowerCase() === clean
    );
  };

  const editingDraft = editingSlot != null ? draftFor(editingSlot) : null;
  const saving = saveMutation.isPending && saveMutation.variables?.slot === editingSlot;

  const managingEntry =
    managingSlot != null
      ? (data?.images || []).find((s) => Number(s.slot) === managingSlot)
      : null;
  const managingSubs = (managingEntry?.subMaterials || []).slice(0, SUB_SLOT_MAX);
  const subSlotAt = editingSub
    ? (data?.images || [])
        .find((s) => Number(s.slot) === editingSub.slot)
        ?.subMaterials?.find((s) => s.slot === editingSub.sub)
    : null;
  const subUploadBusy =
    !!editingSub && subImageSource === `${editingSub.slot}.${editingSub.sub}`;
  const subSaving =
    subSaveMutation.isPending &&
    subSaveMutation.variables?.slot === editingSub?.slot &&
    subSaveMutation.variables?.sub === editingSub?.sub;
  const subSlugTaken = (value) => {
    const clean = String(value || '').trim().toLowerCase();
    if (!clean || !editingSub) return false;
    return (data?.images || []).some(
      (entry) =>
        (entry.subMaterials || []).some(
          (sub) =>
            !(
              Number(entry.slot) === editingSub.slot &&
              sub.slot === editingSub.sub
            ) && sub.slug === clean
        )
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">{heading}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {subheading ||
            'Manage the five collection cards displayed on your website. Admin slots 1–5 map to website cards 1–5 in the same left-to-right order. Cards, Homepage and Products page all share this single configuration.'}
        </p>
      </div>

      <section className="rounded-xl border bg-white p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-gold" />
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-gray-700">
            Website Preview
          </h2>
        </div>
        <ProductShowcase images={previewImages} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-gray-700">
            Collection Cards
          </h2>
          <span className="text-xs text-gray-400">
            {slots.length}/{SLOT_MAX} slots
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {slots.map(({ slot, image, title, description, slug }) => {
            const preview = image || DEFAULT_SHOWCASE_IMAGES[slot - 1] || '';
            const hasCustom = !!image;
            const draft = draftFor(slot);
            const cardName = draft.title || title || '';
            const cardDesc = draft.description || description || '';
            const cardSlug = draft.slug || slug || DEFAULT_COLLECTION_SLUGS[slot - 1];
            return (
              <div
                key={slot}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F0EDE7]">
                  <img
                    src={preview}
                    alt={`Collection slot ${slot}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-bold text-white">
                    SLOT {slot}
                  </span>
                  {hasCustom && (
                    <span className="absolute right-2 top-2 rounded-full bg-gold/95 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="line-clamp-1 font-heading text-sm font-bold text-gray-900">
                    {cardName}
                  </p>
                  <p className="mt-0.5 line-clamp-2 min-h-8 text-xs text-gray-500">{cardDesc}</p>
                  <p className="mt-1 truncate text-[11px] text-gray-400">
                    /products/<span className="text-gray-500">{cardSlug}</span>
                  </p>
                  <button
                    onClick={() => {
                      setEditingSlot(slot);
                      setPickerFor(null);
                    }}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-900"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setManagingSlot(slot);
                      setEditingSlot(null);
                      setEditingSub(null);
                      setPickerFor(null);
                    }}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-gold hover:text-gold"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Manage Sub-Materials
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Dialog open={editingSlot != null} onOpenChange={(open) => { if (!open) setEditingSlot(null); }}>
        {editingSlot != null && editingDraft && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Collection — Slot {editingSlot}</DialogTitle>
            </DialogHeader>

            <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
              {/* Image */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Collection Image
                </span>
                <div className="mt-2 flex flex-wrap items-start gap-4">
                  <div className="relative h-40 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <img
                      src={
                        data.images.find((s) => Number(s.slot) === editingSlot)?.image ||
                        DEFAULT_SHOWCASE_IMAGES[editingSlot - 1] ||
                        ''
                      }
                      alt={`Slot ${editingSlot} preview`}
                      className="h-full w-full object-cover"
                    />
                    {uploadingSlot === editingSlot && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <label
                      htmlFor={`showcase-upload-${editingSlot}`}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gold-dark"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {data.images.find((s) => Number(s.slot) === editingSlot)?.image
                        ? 'Upload New Image'
                        : 'Upload Image'}
                    </label>
                    <input
                      id={`showcase-upload-${editingSlot}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingSlot(editingSlot);
                        uploadMutation.mutate({ slot: editingSlot, file });
                        e.target.value = '';
                      }}
                    />
                    <button
                      onClick={() => removeMutation.mutate(editingSlot)}
                      disabled={!data.images.find((s) => Number(s.slot) === editingSlot)?.image || removeMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Custom Image / Restore Default
                    </button>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor={`showcase-title-${editingSlot}`} className="text-xs font-semibold text-gray-600">
                  Material Name
                </label>
                <input
                  id={`showcase-title-${editingSlot}`}
                  type="text"
                  maxLength={TITLE_MAX}
                  value={editingDraft.title || ''}
                  onChange={(e) => handleTitleChange(editingSlot, e.target.value)}
                  placeholder="e.g. Ready-Made Kurtis"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <p className="mt-0.5 text-right text-[11px] text-gray-400">
                  {(editingDraft.title || '').length}/{TITLE_MAX}
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor={`showcase-desc-${editingSlot}`} className="text-xs font-semibold text-gray-600">
                  Short Description
                </label>
                <input
                  id={`showcase-desc-${editingSlot}`}
                  type="text"
                  maxLength={DESCRIPTION_MAX}
                  value={editingDraft.description || ''}
                  onChange={(e) => handleDescChange(editingSlot, e.target.value)}
                  placeholder="e.g. Curated kurtis, effortless style"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <p className="mt-0.5 text-right text-[11px] text-gray-400">
                  {(editingDraft.description || '').length}/{DESCRIPTION_MAX}
                </p>
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor={`showcase-slug-${editingSlot}`} className="text-xs font-semibold text-gray-600">
                    Slug
                  </label>
                  <button
                    onClick={() => regenerateSlug(editingSlot)}
                    className="inline-flex items-center gap-1 text-[11px] text-gray-400 transition-colors hover:text-gold"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Generate from name
                  </button>
                </div>
                <input
                  id={`showcase-slug-${editingSlot}`}
                  type="text"
                  maxLength={SLUG_MAX}
                  value={editingDraft.slug || ''}
                  onChange={(e) => handleSlugChange(editingSlot, e.target.value)}
                  placeholder={DEFAULT_COLLECTION_SLUGS[editingSlot - 1]}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none ${
                    (editingDraft.slug && !SLUG_RE.test(editingDraft.slug)) ||
                    slugTaken(editingSlot, editingDraft.slug)
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300'
                      : 'border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold'
                  }`}
                />
                {editingDraft.slug && !SLUG_RE.test(editingDraft.slug) ? (
                  <p className="mt-0.5 text-[11px] text-red-600">
                    Use lowercase letters, numbers and dashes (e.g. ready-made-kurtis)
                  </p>
                ) : slugTaken(editingSlot, editingDraft.slug) ? (
                  <p className="mt-0.5 text-[11px] text-red-600">This slug is already used by another slot</p>
                ) : (
                  <Link
                    to={`/products/${editingDraft.slug || DEFAULT_COLLECTION_SLUGS[editingSlot - 1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-gray-400 transition-colors hover:text-gold"
                  >
                    /products/{editingDraft.slug || DEFAULT_COLLECTION_SLUGS[editingSlot - 1]}{' '}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>

              {/* Products inside collection */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">
                    Products Inside This Collection
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {(editingDraft.items || []).length}/{PRODUCT_MAX}
                  </span>
                </div>

                {(editingDraft.items || []).length === 0 && (
                  <p className="mt-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-xs text-gray-400">
                    No products selected. The collection will use the default products from its
                    category, or pick products below.
                  </p>
                )}

                {(editingDraft.items || []).map((item, idx) => (
                  <div
                    key={item.productId}
                    className="mt-2 flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2 py-2"
                  >
                    <span className="w-5 shrink-0 text-center text-[11px] font-bold text-gray-400">
                      {idx + 1}
                    </span>
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-white">
                      {item.image && (
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-medium text-gray-800">
                        {item.name || '(Product deleted)'}
                      </p>
                      <p className="line-clamp-1 text-[10px] text-gray-400">
                        {item.price != null ? `₹${formatINR(item.price)}` : '—'}
                        {item.category ? ` · ${item.category}` : ''}
                        {item.isActive === false && <span className="ml-1 text-amber-600">Inactive</span>}
                      </p>
                    </div>
                    {pickerFor?.slot === editingSlot && pickerFor.index === idx ? (
                      <button
                        onClick={() => setPickerFor(null)}
                        className="rounded bg-gray-800 px-2 py-1 text-[10px] font-semibold text-white hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => setPickerFor({ slot: editingSlot, index: idx })}
                        className="rounded bg-gray-800 px-2 py-1 text-[10px] font-semibold text-white hover:bg-gray-700"
                      >
                        Change
                      </button>
                    )}
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        onClick={() => handleMoveProduct(editingSlot, idx, -1)}
                        disabled={idx === 0}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-white hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveProduct(editingSlot, idx, 1)}
                        disabled={idx === (editingDraft.items || []).length - 1}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-white hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveProduct(editingSlot, item.productId)}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove product"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {pickerFor &&
                  pickerFor.slot === editingSlot &&
                  pickerFor.index !== undefined &&
                  pickerFor.index < PRODUCT_MAX && (
                    <div className="mt-2">
                      <div className="mb-1 text-[11px] font-semibold text-gray-400">
                        Replace product {pickerFor.index + 1}
                      </div>
                      <ProductPicker
                        excludeIds={(editingDraft.items || []).map((item) => item.productId)}
                        onSelect={(product) => handleReplaceProduct(editingSlot, pickerFor.index, product)}
                      />
                    </div>
                  )}

                {(editingDraft.items || []).length < PRODUCT_MAX && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <div className="mb-1 text-[11px] font-semibold text-gray-400">
                      Add product {(editingDraft.items || []).length + 1}
                    </div>
                    <ProductPicker
                      excludeIds={(editingDraft.items || []).map((item) => item.productId)}
                      onSelect={(product) => handleAddProduct(editingSlot, product)}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <button
                onClick={() => setEditingSlot(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate({ slot: editingSlot })}
                disabled={saving || uploadMutation.isPending}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C9A227] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#B8921F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog
        open={managingSlot != null && editingSub == null}
        onOpenChange={(open) => {
          if (!open) setManagingSlot(null);
        }}
      >
        {managingSlot != null && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Sub-Materials — Slot {managingSlot}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              <p className="text-xs text-gray-500">
                Each main material has {SUB_SLOT_MAX} sub-materials. They appear as the cards
                between the heading and the products on this material's website page.
              </p>
              {managingSubs.map((sub) => {
                const subName = sub.title || `Material ${managingSlot}.${sub.slot}`;
                return (
                  <div
                    key={sub.slot}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
                  >
                    <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <img
                        src={sub.image || DEFAULT_SHOWCASE_IMAGES[managingSlot - 1] || ''}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-800">
                        <span className="mr-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                          {managingSlot}.{sub.slot}
                        </span>
                        {subName}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-gray-400">
                        /{sub.slug || `material-${managingSlot}-${sub.slot}`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingSub({ slot: managingSlot, sub: sub.slot });
                        setSubDraft({ title: sub.title || '', slug: sub.slug || '' });
                      }}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-gray-800 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-gray-900"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <button
                onClick={() => setManagingSlot(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog
        open={editingSub != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSub(null);
            setSubDraft(null);
          }
        }}
      >
        {editingSub != null && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Edit Sub-Material — {editingSub.slot}.{editingSub.sub}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Sub-Material Image
                </span>
                <div className="mt-2 flex flex-wrap items-start gap-4">
                  <div className="relative h-48 w-36 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <img
                      src={
                        subSlotAt?.image || DEFAULT_SHOWCASE_IMAGES[editingSub.slot - 1] || ''
                      }
                      alt={`Sub-material ${editingSub.slot}.${editingSub.sub} preview`}
                      className="h-full w-full object-cover"
                    />
                    {subUploadBusy && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <label
                      htmlFor={`sub-upload-${editingSub.slot}-${editingSub.sub}`}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gold-dark"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {subSlotAt?.image ? 'Upload New Image' : 'Upload Image'}
                    </label>
                    <input
                      id={`sub-upload-${editingSub.slot}-${editingSub.sub}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setSubImageSource(`${editingSub.slot}.${editingSub.sub}`);
                        subImageMutation.mutate({
                          slot: editingSub.slot,
                          sub: editingSub.sub,
                          file,
                        });
                        e.target.value = '';
                      }}
                    />
                    {subSlotAt?.image &&
                      subSlotAt.image.startsWith('/api/images/') && (
                        <button
                          onClick={() =>
                            subSaveMutation.mutate({
                              slot: editingSub.slot,
                              sub: editingSub.sub,
                              data: {
                                title: subDraft?.title || '',
                                slug: subDraft?.slug || '',
                                image: '',
                              },
                            })
                          }
                          disabled={subSaving || subUploadBusy}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Restore Default Image
                        </button>
                      )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Material Name</label>
                <input
                  type="text"
                  maxLength={TITLE_MAX}
                  value={subDraft?.title || ''}
                  onChange={(e) =>
                    setSubDraft((prev) => ({
                      title: e.target.value,
                      slug: prev?.slug || '',
                    }))
                  }
                  placeholder={`e.g. Material ${editingSub.slot}.${editingSub.sub}`}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <p className="mt-0.5 text-right text-[11px] text-gray-400">
                  {(subDraft?.title || '').length}/{TITLE_MAX}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-600">Slug</label>
                  <button
                    onClick={() =>
                      setSubDraft((prev) => ({
                        title: prev?.title || '',
                        slug: slugifyName(prev?.title || ''),
                      }))
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-gray-400 transition-colors hover:text-gold"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Generate from name
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={SLUG_MAX}
                  value={subDraft?.slug || ''}
                  onChange={(e) =>
                    setSubDraft((prev) => ({
                      title: prev?.title || '',
                      slug: e.target.value,
                    }))
                  }
                  placeholder={`material-${editingSub.slot}-${editingSub.sub}`}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none ${
                    (subDraft?.slug && !SLUG_RE.test(subDraft.slug)) ||
                    subSlugTaken(subDraft?.slug)
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300'
                      : 'border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold'
                  }`}
                />
                {subDraft?.slug && !SLUG_RE.test(subDraft.slug) ? (
                  <p className="mt-0.5 text-[11px] text-red-600">
                    Use lowercase letters, numbers and dashes (e.g. material-1-1)
                  </p>
                ) : subSlugTaken(subDraft?.slug) ? (
                  <p className="mt-0.5 text-[11px] text-red-600">
                    This slug is already used by another sub-material
                  </p>
                ) : (
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Changing the name does not change the slug until you save a new one.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => {
                  setEditingSub(null);
                  setSubDraft(null);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!editingSub || !subDraft) return;
                  subSaveMutation.mutate({
                    slot: editingSub.slot,
                    sub: editingSub.sub,
                    data: { title: subDraft.title, slug: subDraft.slug },
                  });
                }}
                disabled={
                  !subDraft?.title.trim() ||
                  (subDraft.slug && !SLUG_RE.test(subDraft.slug)) ||
                  subSlugTaken(subDraft.slug) ||
                  subSaving ||
                  subUploadBusy
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C9A227] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#B8921F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {subSaving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}