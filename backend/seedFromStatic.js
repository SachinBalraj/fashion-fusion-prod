/**
 * Seeds MongoDB with products from the frontend static data file,
 * using each product's static `id` as the DB slug so the payment
 * resolver can look them up when cart items arrive with those IDs.
 */

require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

// --- Load the frontend static products as CommonJS ---
const staticFilePath = path.resolve(
  __dirname,
  '../frontend/services/products.js'
);
const raw = fs.readFileSync(staticFilePath, 'utf8');
// Strip ES module export declarations so we can eval as CJS
const cjs = raw
  .replace(/^export const /gm, 'const ')
  .replace(/^export default /gm, 'module.exports = ');
// eslint-disable-next-line no-new-func
const mod = new Function('module', 'exports', cjs + '\nmodule.exports={allProducts,categories};');
const fakeModule = { exports: {} };
mod(fakeModule, fakeModule.exports);
const { allProducts } = fakeModule.exports;

if (!allProducts || allProducts.length === 0) {
  console.error('Failed to load allProducts from static file');
  process.exit(1);
}
console.log(`Loaded ${allProducts.length} static products`);

// Map frontend category names to DB category slugs
const CATEGORY_MAP = {
  'Material': 'material',
  'Raw Silk Fabric': 'material',
  'Ready-Made Kurtis': 'ready-made-kurtis',
  'Kurthi': 'ready-made-kurtis',
  'Kurti Set': 'ready-made-kurtis',
  'Premium Shawls': 'premium-shawls',
  'Assam Silk Shawl': 'premium-shawls',
  'Hair Accessories': 'hair-accessories',
  'Sarees': 'sarees',
  'Festive Wear': 'festive-wear',
  'Cord Sets': 'cord-sets',
  'Cord Set': 'cord-sets',
};

const CATEGORY_DEFINITIONS = [
  { name: 'Material', slug: 'material', description: 'Premium fabrics and raw materials', order: 1 },
  { name: 'Ready-Made Kurtis', slug: 'ready-made-kurtis', description: 'Stylish ready-to-wear kurtis', order: 2 },
  { name: 'Premium Shawls', slug: 'premium-shawls', description: 'Luxurious shawls crafted with premium materials', order: 3 },
  { name: 'Hair Accessories', slug: 'hair-accessories', description: 'Elegant hair accessories', order: 4 },
  { name: 'Sarees', slug: 'sarees', description: 'Exquisite sarees for every occasion', order: 5 },
  { name: 'Festive Wear', slug: 'festive-wear', description: 'Stunning festive collections', order: 6 },
  { name: 'Cord Sets', slug: 'cord-sets', description: 'Trendy co-ord sets', order: 7 },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Upsert categories
  const categoryDocs = {};
  for (const cat of CATEGORY_DEFINITIONS) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: cat },
      { upsert: true, new: true }
    );
    categoryDocs[cat.slug] = doc._id;
  }
  console.log(`Upserted ${Object.keys(categoryDocs).length} categories`);

  // Upsert products
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of allProducts) {
    const catSlug = CATEGORY_MAP[p.category];
    if (!catSlug || !categoryDocs[catSlug]) {
      console.warn(`  Skipping ${p.id}: unknown category "${p.category}"`);
      skipped++;
      continue;
    }

    const productData = {
      name: p.name,
      slug: p.id,                          // ← static id becomes the slug
      description: p.description || p.name,
      price: p.price || 0,
      comparePrice: p.originalPrice || p.comparePrice || null,
      category: categoryDocs[catSlug],
      images: p.image ? [p.image] : (p.images || []),
      sizes: p.sizes || [],
      colors: p.colors || [],
      tags: [catSlug],
      material: p.fabric || p.material || '',
      gender: p.gender || 'women',
      stock: p.stock != null ? p.stock : 50,
      isFeatured: !!p.isFeatured,
      isBestSeller: !!p.isBestSeller,
      isNewArrival: !!p.isNewArrival,
      isActive: true,
    };

    const existing = await Product.findOne({ slug: p.id });
    if (existing) {
      await Product.updateOne({ slug: p.id }, { $set: productData });
      updated++;
    } else {
      await Product.create(productData);
      created++;
    }
  }

  console.log(`Done: ${created} created, ${updated} updated, ${skipped} skipped`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
