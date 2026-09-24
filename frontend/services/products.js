import api from './api';
import { DEFAULT_COLLECTION_SLUGS } from '@/src/constants/showcaseDefaults';

const COLOR_HEX = {
  gold: '#C9A227',
  maroon: '#7A1F3D',
  navy: '#1B2A4A',
  pink: '#EC4899',
  purple: '#8B5CF6',
  red: '#EF4444',
  green: '#22C55E',
  blue: '#3B82F6',
  beige: '#F5F0E1',
  white: '#FFFFFF',
  black: '#111111',
};

export const colorHex = (name) => {
  const key = String(name || '').toLowerCase();
  return COLOR_HEX[key] || '#CCCCCC';
};

const normalizeArray = (value) => {
  if (value === undefined || value === null) return [];
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [value];
  return list
    .map((item) => (item && typeof item === 'object' ? item : String(item).trim()))
    .filter((item) => {
      if (item === null || item === undefined) return false;
      return typeof item === 'object' || item !== '';
    });
};

export const effectivePrice = (p) => {
  if (!p) return 0;
  const price = Number(p.price) || 0;
  const sale = Number(p.salePrice) || 0;
  return sale > 0 && sale < price ? sale : price;
};

export function normalizeProduct(p) {
  if (!p) return null;
  const images = normalizeArray(p.images);
  const category =
    typeof p.category === 'string' ? p.category : p.category?.name || '';
  const price = Number(p.price) || 0;
  const comparePrice = p.comparePrice ?? p.originalPrice ?? null;
  const ratingsNum = Number(p.ratings);
  const ratings = !Number.isNaN(ratingsNum) && p.ratings !== undefined && p.ratings !== null ? ratingsNum : !Number.isNaN(Number(p.rating)) && p.rating !== undefined && p.rating !== null ? Number(p.rating) : 0;
  const reviewsNum = Number(p.numReviews);
  const numReviews = !Number.isNaN(reviewsNum) && p.numReviews !== undefined && p.numReviews !== null ? reviewsNum : !Number.isNaN(Number(p.reviews)) && p.reviews !== undefined && p.reviews !== null ? Number(p.reviews) : 0;
  const stock = Number(p.stock) || 0;
  const id = p._id || p.id;

  return {
    ...p,
    _id: id,
    id,
    name: p.name || '',
    slug: p.slug || '',
    price,
    comparePrice,
    originalPrice: comparePrice,
    salePrice: Number(p.salePrice) || 0,
    effectivePrice: effectivePrice({ price: Number(p.price) || 0, salePrice: Number(p.salePrice) || 0 }),
    image: images[0] || p.image || '',
    images: images.length > 0 ? images : [p.image].filter(Boolean),
    thumbnail: p.thumbnail || images[0] || '',
    category,
    categoryId: p.category?._id || p.categoryId || '',
    categorySlug: p.category?.slug || p.categorySlug || '',
    stock,
    inStock: stock > 0,
    rating: ratings,
    ratings,
    reviews: numReviews,
    numReviews,
    sizes: normalizeArray(p.sizes),
    colors: normalizeArray(p.colors),
    tags: normalizeArray(p.tags),
    careInstructions: normalizeArray(p.careInstructions),
    washCare: normalizeArray(p.washCare),
    advantages: normalizeArray(p.advantages),
    benefits: normalizeArray(p.benefits),
    features: normalizeArray(p.features),
    keyFeatures: normalizeArray(p.keyFeatures),
    unit: p.unit || (category === 'Material' ? 'meter' : ''),
  };
}

export async function fetchCatalog(params = {}) {
  const { data } = await api.get('/products', { params });
  const list = Array.isArray(data) ? data : data.products || data.data || [];
  return {
    products: list.map(normalizeProduct).filter(Boolean),
    page: data.page || 1,
    pages: data.pages || data.totalPages || 1,
    total: data.total ?? list.length,
  };
}

export async function fetchProductById(id) {
  const { data } = await api.get(`/products/${id}`);
  return normalizeProduct(data);
}

export async function getProductBySlug(slug) {
  const { data } = await api.get(`/products/slug/${slug}`);
  return normalizeProduct(data);
}

export async function getProductById(id) {
  return fetchProductById(id);
}

export async function getProductsByCategory(category, limit = 50) {
  const { products } = await fetchCatalog({ category, limit });
  return products;
}

export async function getRelatedProducts(product, limit = 4) {
  if (!product || !product.categoryId) return { related: [] };
  const { products } = await fetchCatalog({
    category: product.categoryId,
    limit: Math.min(Number(limit) + 1 || 5, 25),
  });
  const excludeId = product._id || product.id;
  const related = products
    .filter((p) => p._id !== excludeId && p.id !== excludeId)
    .slice(0, limit);
  return { related };
}

export async function fetchCategoriesWithCounts() {
  const { data } = await api.get('/categories/counts');
  return Array.isArray(data) ? data : [];
}

export async function fetchProductShowcase() {
  const { data } = await api.get('/settings/product-showcase');
  const list = Array.isArray(data) ? data : data.images || [];
  return list
    .map((entry) => ({
      slot: Number(entry.slot),
      slug:
        typeof entry.slug === 'string' && entry.slug.trim()
          ? entry.slug.trim()
          : DEFAULT_COLLECTION_SLUGS[Number(entry.slot) - 1] || '',
      image: typeof entry.image === 'string' ? entry.image : '',
      description: typeof entry.description === 'string' ? entry.description : '',
    }))
    .filter((entry) => Number.isInteger(entry.slot))
    .sort((a, b) => a.slot - b.slot);
}

export async function fetchCollection(slug) {
  const { data } = await api.get(`/showcase/${encodeURIComponent(slug)}`);
  const products = Array.isArray(data?.products) ? data.products.map(normalizeProduct).filter(Boolean) : [];
  return {
    slug: data?.slug || slug,
    name: data?.title || data?.name || '',
    description: data?.description || '',
    products,
  };
}