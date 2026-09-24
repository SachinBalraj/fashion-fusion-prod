import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/services/admin';
import { toast } from 'sonner';
import { Upload, Trash2, Save, ChevronUp, ChevronDown, X, ExternalLink } from 'lucide-react';
import { DEFAULT_COLLECTION_SLUGS } from '@/src/constants/showcaseDefaults';
import ProductPicker from '@/components/admin/ProductPicker';

const SLOT_MAX = 5;
const DESCRIPTION_MAX = 100;
const SLUG_MAX = 120;
const PRODUCT_MAX = 3;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const emptyItems = () => [];

function buildInitialDrafts(images) {
  const next = {};
  for (const slot of images || []) {
    const slotNum = Number(slot.slot);
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
              isActive: p.isActive !== false,
            }
          : { productId: key };
      })
      .filter((item) => item.productId);
    next[slotNum] = {
      description: slot.description || '',
      slug: slot.slug || DEFAULT_COLLECTION_SLUGS[slotNum - 1] || '',
      items,
    };
  }
  return next;
}

export default function Showcase() {
  const queryClient = useQueryClient();
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [drafts, setDrafts] = useState({});
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
      toast.success('Showcase image removed');
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Remove failed'),
  });

  const saveMutation = useMutation({
    mutationFn: ({ slot }) => {
      const d = drafts[slot] || {};
      return adminAPI.setShowcaseSlotDetails(slot, {
        description: d.description || '',
        slug: d.slug || '',
        productIds: (d.items || []).map((item) => item.productId),
      });
    },
    onSuccess: (resp, { slot }) => {
      const saved = resp.data;
      setDrafts((prev) => {
        const current = prev[slot] || { description: '', slug: '', items: [] };
        return {
          ...prev,
          [slot]: {
            ...current,
            description: saved?.description ?? current.description,
            slug: saved?.slug || current.slug,
          },
        };
      });
      toast.success(`Collection ${slot} saved`);
      invalidate();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Save failed');
    },
  });

  const handleDescChange = (slot, value) => {
    setDrafts((prev) => ({ ...prev, [slot]: { ...prev[slot], description: value } }));
  };

  const handleSlugChange = (slot, value) => {
    setDrafts((prev) => ({ ...prev, [slot]: { ...prev[slot], slug: value } }));
  };

  const handleAddProduct = (slot, product) => {
    const id = product._id || product.id;
    setDrafts((prev) => {
      const current = prev[slot] || { description: '', slug: '', items: [] };
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
              isActive: product.isActive !== false,
            },
          ],
        },
      };
    });
  };

  const handleRemoveProduct = (slot, productId) => {
    setDrafts((prev) => {
      const current = prev[slot] || { description: '', slug: '', items: [] };
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
      const current = prev[slot] || { description: '', slug: '', items: [] };
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
        <h1 className="font-heading text-2xl font-bold">Products Page Showcase</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: SLOT_MAX }).map((_, i) => (
            <div key={i} className="h-[36rem] animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold">Products Page Showcase</h1>
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Showcase settings could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  const slots = (data?.images || []).filter((entry) => Number.isInteger(Number(entry.slot)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Products Page Showcase</h1>
        <p className="mt-1 text-sm text-gray-500">
          Each of the 5 showcase cards links to a collection of up to {PRODUCT_MAX} products.
          Products are referenced from the main catalog — prices, images and stock always stay in sync.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {slots.map(({ slot, image }) => {
          const preview = image;
          const hasCustom = !!image;
          const draft = drafts[slot] || { description: '', slug: '', items: [] };
          const defaultSlug = DEFAULT_COLLECTION_SLUGS[slot - 1];
          const slugValue = draft.slug || '';
          const slugInvalid = slugValue.length > 0 && !SLUG_RE.test(slugValue);
          const previewSlug = slugValue || defaultSlug;
          const saving = saveMutation.isPending && saveMutation.variables?.slot === slot;

          return (
            <div key={slot} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold text-gray-900">Slot {slot}</h3>
                {hasCustom ? (
                  <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold">
                    Custom
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                    Default
                  </span>
                )}
              </div>

              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img
                  src={preview}
                  alt={`Showcase slot ${slot}`}
                  className="h-full w-full object-cover"
                />
                {uploadingSlot === slot && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <label
                  htmlFor={`showcase-upload-${slot}`}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gold py-2 text-xs font-semibold text-white transition-colors hover:bg-gold-dark"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {hasCustom ? 'Replace Image' : 'Upload Image'}
                </label>
                <input
                  id={`showcase-upload-${slot}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingSlot(slot);
                    uploadMutation.mutate({ slot, file });
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => removeMutation.mutate(slot)}
                  disabled={!hasCustom || removeMutation.isPending}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>

              <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                <div>
                  <label htmlFor={`showcase-desc-${slot}`} className="text-xs font-semibold text-gray-600">
                    Description
                  </label>
                  <input
                    id={`showcase-desc-${slot}`}
                    type="text"
                    maxLength={DESCRIPTION_MAX}
                    value={draft.description || ''}
                    onChange={(e) => handleDescChange(slot, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gold focus:outline-none"
                  />
                  <p className="mt-0.5 text-right text-[11px] text-gray-400">
                    {(draft.description || '').length}/{DESCRIPTION_MAX}
                  </p>
                </div>

                <div>
                  <label htmlFor={`showcase-slug-${slot}`} className="text-xs font-semibold text-gray-600">
                    Collection Slug
                  </label>
                  <input
                    id={`showcase-slug-${slot}`}
                    type="text"
                    maxLength={SLUG_MAX}
                    value={draft.slug || ''}
                    onChange={(e) => handleSlugChange(slot, e.target.value)}
                    placeholder={defaultSlug}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none ${
                      slugInvalid
                        ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300'
                        : 'border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold'
                    }`}
                  />
                  {slugInvalid ? (
                    <p className="mt-0.5 text-[11px] text-red-600">
                      Use lowercase letters, numbers and dashes (e.g. kurti-collection)
                    </p>
                  ) : (
                    <Link
                      to={`/products/${previewSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-gray-400 transition-colors hover:text-gold"
                    >
                      /products/{previewSlug} <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">Collection Products</span>
                    <span className="text-[11px] text-gray-400">
                      {(draft.items || []).length}/{PRODUCT_MAX}
                    </span>
                  </div>

                  {draft.items && draft.items.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {draft.items.map((item, idx) => (
                        <li
                          key={item.productId}
                          className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5"
                        >
                          <span className="w-5 shrink-0 text-center text-[11px] font-semibold text-gray-400">
                            {idx + 1}
                          </span>
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-white">
                            {item.image && (
                              <img src={item.image} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-xs font-medium text-gray-800">
                              {item.name || '(Product deleted)'}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {item.price != null ? `₹${Number(item.price).toLocaleString('en-IN')}` : '—'}
                              {item.isActive === false && <span className="ml-1 text-amber-600">Inactive</span>}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5">
                            <button
                              onClick={() => handleMoveProduct(slot, idx, -1)}
                              disabled={idx === 0}
                              className="rounded p-1 text-gray-400 transition-colors hover:bg-white hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Move up"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveProduct(slot, idx, 1)}
                              disabled={idx === (draft.items || []).length - 1}
                              className="rounded p-1 text-gray-400 transition-colors hover:bg-white hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Move down"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveProduct(slot, item.productId)}
                              className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove product"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {(draft.items || []).length < PRODUCT_MAX && (
                    <div className="mt-2">
                      <ProductPicker
                        excludeIds={(draft.items || []).map((item) => item.productId)}
                        onSelect={(product) => handleAddProduct(slot, product)}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => saveMutation.mutate({ slot })}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}