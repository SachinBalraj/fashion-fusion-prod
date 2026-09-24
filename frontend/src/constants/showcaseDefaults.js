export const DEFAULT_COLLECTIONS = [
  {
    slot: 1,
    slug: 'kurti-collection',
    title: 'Kurti Collection',
    description: 'Curated kurtis, effortless style',
    category: 'ready-made-kurtis',
  },
  {
    slot: 2,
    slug: 'material-collection',
    title: 'Material Collection',
    description: 'Premium fabrics, timeless craftsmanship',
    category: 'material',
  },
  {
    slot: 3,
    slug: 'shawl-collection',
    title: 'Shawl Collection',
    description: 'Elegant shawls, graceful drape',
    category: 'premium-shawls',
  },
  {
    slot: 4,
    slug: 'saree-collection',
    title: 'Saree Collection',
    description: 'Sarees with grace in every drape',
    category: 'sarees',
  },
  {
    slot: 5,
    slug: 'accessories-collection',
    title: 'Accessories Collection',
    description: 'Accessories to complete your look',
    category: 'hair-accessories',
  },
];

export const DEFAULT_COLLECTION_SLUGS = DEFAULT_COLLECTIONS.map((collection) => collection.slug);

export const DEFAULT_SHOWCASE_DESCRIPTIONS = DEFAULT_COLLECTIONS.map(
  (collection) => collection.description
);

export const DEFAULT_SHOWCASE_IMAGES = [
  '/images/readymadekurthi1.jpeg',
  '/images/material1.jpeg',
  '/images/shawl1.jpeg',
  '/images/saree.jpeg',
  '/images/hairaccessories1.jpeg',
];