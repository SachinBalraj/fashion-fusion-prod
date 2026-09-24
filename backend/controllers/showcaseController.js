const Settings = require('../models/Settings');
const Product = require('../models/Product');
const { toObjectId, isObjectId } = require('../utils/validate');
const {
  GRIDFS_PREFIX,
  isGridFSUrl,
  uploadImage,
  markActive,
  deleteFile,
  urlToFileId,
  findFile,
  collectReferencedGridFSIds,
  deleteFilesIfUnreferenced,
} = require('../services/gridfsService');

const SLOT_MAX = Settings.SHOWCASE_SLOT_MAX;
const SUB_SLOT_MAX = Settings.SHOWCASE_SUB_SLOT_MAX;
const SLUG_MAX = Settings.SHOWCASE_SLUG_MAX;
const DESCRIPTION_MAX = Settings.SHOWCASE_DESCRIPTION_MAX;
const PRODUCT_MAX = Settings.SHOWCASE_PRODUCT_MAX;
const TITLE_MAX = Settings.SHOWCASE_TITLE_MAX;

const SHOWCASE_PUBLIC_CACHE_CONTROL = 'public, no-cache';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const DEFAULT_SHOWCASE_IMAGES = [
  '/images/readymadekurthi1.jpeg',
  '/images/material1.jpeg',
  '/images/shawl1.jpeg',
  '/images/saree.jpeg',
  '/images/hairaccessories1.jpeg',
];

const DEFAULT_COLLECTIONS = [
  { slot: 1, slug: 'kurti-collection', title: 'Kurti Collection', description: 'Curated kurtis, effortless style', categorySlug: 'ready-made-kurtis' },
  { slot: 2, slug: 'material-collection', title: 'Material Collection', description: 'Premium fabrics, timeless craftsmanship', categorySlug: 'material' },
  { slot: 3, slug: 'shawl-collection', title: 'Shawl Collection', description: 'Elegant shawls, graceful drape', categorySlug: 'premium-shawls' },
  { slot: 4, slug: 'saree-collection', title: 'Saree Collection', description: 'Sarees with grace in every drape', categorySlug: 'sarees' },
  { slot: 5, slug: 'accessories-collection', title: 'Accessories Collection', description: 'Accessories to complete your look', categorySlug: 'hair-accessories' },
];

const DEFAULT_COLLECTION_SLUGS = DEFAULT_COLLECTIONS.map((collection) => collection.slug);
const DEFAULT_COLLECTION_CATEGORY_SLUGS = Object.fromEntries(
  DEFAULT_COLLECTIONS.map((collection) => [collection.slug, collection.categorySlug])
);
const DEFAULT_COLLECTION_DESCRIPTIONS = Object.fromEntries(
  DEFAULT_COLLECTIONS.map((collection) => [collection.slug, collection.description])
);
const DEFAULT_COLLECTION_TITLES = Object.fromEntries(
  DEFAULT_COLLECTIONS.map((collection) => [collection.slug, collection.title])
);

const COLLECTION_PUBLIC_SELECT =
  '_id slug name shortDescription description images price salePrice comparePrice stock sizes unit category';

const sanitizeDescription = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  let text = String(value);
  text = text.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  return text.slice(0, DESCRIPTION_MAX);
};

const sanitizeTitle = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return sanitizeDescription(value).slice(0, TITLE_MAX);
};

const sanitizeSlug = (value) => {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/^[./\\]+|[./\\]+$/g, '');
};

const humanizeSlug = (slug) =>
  String(slug || '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const parseSlot = (value) => {
  if (typeof value !== 'string') return null;
  const match = /^([1-9]\d*)$/.exec(value.trim());
  if (!match) return null;
  const num = Number(match[1]);
  if (!Number.isInteger(num) || num < 1 || num > SLOT_MAX) return null;
  return num;
};

const parseSubSlot = (value) => {
  if (typeof value !== 'string') return null;
  const match = /^([1-9]\d*)$/.exec(value.trim());
  if (!match) return null;
  const num = Number(match[1]);
  if (!Number.isInteger(num) || num < 1 || num > SUB_SLOT_MAX) return null;
  return num;
};

const buildDefaultSubMaterials = (slot, mainSlug) =>
  Array.from({ length: SUB_SLOT_MAX }, (_, i) => {
    const subSlot = i + 1;
    return {
      slot: subSlot,
      image: DEFAULT_SHOWCASE_IMAGES[slot - 1] || '',
      title: `Material ${slot}.${subSlot}`,
      slug: `${mainSlug}-${subSlot}`,
    };
  });

const normalizeSubMaterials = (slot, mainSlug, raw) => {
  const list = Array.isArray(raw) ? raw : [];
  const bySub = new Map();
  for (const sub of list) {
    if (!sub || !Number.isInteger(Number(sub.slot))) continue;
    const subSlot = Number(sub.slot);
    if (subSlot < 1 || subSlot > SUB_SLOT_MAX) continue;
    bySub.set(subSlot, {
      slot: subSlot,
      image: String((sub.image && String(sub.image)) || ''),
      title: sanitizeTitle(sub.title),
      slug: sanitizeSlug(sub.slug),
    });
  }
  const baseSlug = SLUG_RE.test(mainSlug) ? mainSlug : DEFAULT_COLLECTION_SLUGS[slot - 1];
  return Array.from({ length: SUB_SLOT_MAX }, (_, i) => {
    const subSlot = i + 1;
    const sub = bySub.get(subSlot) || {};
    return {
      slot: subSlot,
      image: sub.image || DEFAULT_SHOWCASE_IMAGES[slot - 1] || '',
      title: sub.title || `Material ${slot}.${subSlot}`,
      slug: SLUG_RE.test(sub.slug) ? sub.slug : `${baseSlug}-${subSlot}`,
    };
  });
};

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

const materializeSubMaterials = async (settings) => {
  const current = normalizeShowcase(settings);
  let needsWrite = false;
  for (const entry of current) {
    const raw = (settings.productShowcase || []).find(
      (item) => Number(item && item.slot) === entry.slot
    );
    const stored = Array.isArray(raw && raw.subMaterials) ? raw.subMaterials : [];
    const validSubSlots = new Set(
      stored
        .map((sub) => Number(sub && sub.slot))
        .filter((slot) => Number.isInteger(slot) && slot >= 1 && slot <= SUB_SLOT_MAX)
    );
    const complete =
      stored.length === SUB_SLOT_MAX &&
      validSubSlots.size === SUB_SLOT_MAX &&
      stored.every(
        (sub) =>
          typeof sub === 'object' &&
          sub !== null &&
          typeof sub.slug === 'string' &&
          SLUG_RE.test(sub.slug)
      );
    if (!complete) {
      needsWrite = true;
      break;
    }
  }
  if (needsWrite) {
    settings.productShowcase = current;
    await settings.save();
  }
};

const normalizeShowcase = (settings) => {
  const map = new Map(
    (settings.productShowcase || []).map((entry) => [
      Number(entry && entry.slot),
      {
        image: String((entry && entry.image) || ''),
        title: sanitizeTitle(entry && entry.title),
        description: String((entry && entry.description) || ''),
        slug: sanitizeSlug((entry && entry.slug) || ''),
        productIds: Array.isArray(entry && entry.productIds)
          ? entry.productIds.map((id) => String(id)).filter(Boolean)
          : [],
        subMaterials: Array.isArray(entry && entry.subMaterials)
          ? entry.subMaterials
          : [],
      },
    ])
  );
  return Array.from({ length: SLOT_MAX }, (_, i) => {
    const slot = i + 1;
    const entry = map.get(slot) || {
      image: '',
      title: '',
      description: '',
      slug: '',
      productIds: [],
      subMaterials: [],
    };
    const slug = SLUG_RE.test(entry.slug) ? entry.slug : DEFAULT_COLLECTION_SLUGS[i];
    return {
      slot,
      image: entry.image,
      title: entry.title || DEFAULT_COLLECTION_TITLES[slug] || humanizeSlug(slug),
      description: entry.description,
      slug,
      productIds: entry.productIds.slice(0, PRODUCT_MAX),
      subMaterials: normalizeSubMaterials(slot, slug, entry.subMaterials),
    };
  });
};

const resolveProductsForIds = async (productIds) => {
  const uniqueHex = Array.from(new Set(productIds.map((id) => String(id)))).slice(0, PRODUCT_MAX);
  const oids = uniqueHex.map((id) => toObjectId(id)).filter(Boolean);
  if (oids.length === 0) return [];
  const docs = await Product.find({ _id: { $in: oids }, isActive: { $ne: false } })
    .select(COLLECTION_PUBLIC_SELECT)
    .populate('category', 'name slug')
    .lean();
  const byId = new Map(docs.map((doc) => [doc._id.toHexString(), doc]));
  return oids.map((oid) => byId.get(oid.toHexString()) || null).filter(Boolean);
};

const findDefaultCategoryId = async (collectionSlug) => {
  const categorySlug = DEFAULT_COLLECTION_CATEGORY_SLUGS[collectionSlug];
  if (!categorySlug) return null;
  const Category = require('../models/Category');
  const category = await Category.findOne({ slug: categorySlug }).select('_id').lean();
  return category ? category._id : null;
};

const resolveDefaultProductsForCollection = async (collectionSlug) => {
  const categoryId = await findDefaultCategoryId(collectionSlug);
  if (!categoryId) return [];

  const baseMatch = { category: categoryId, isActive: { $ne: false } };
  let docs = await Product.find({
    ...baseMatch,
    images: { $not: { $size: 0 } },
  })
    .select(COLLECTION_PUBLIC_SELECT)
    .populate('category', 'name slug')
    .lean()
    .limit(PRODUCT_MAX);

  if (docs.length < PRODUCT_MAX) {
    const takenIds = docs.map((doc) => doc._id);
    const backfill = await Product.find({
      ...baseMatch,
      _id: { $nin: takenIds },
    })
      .select(COLLECTION_PUBLIC_SELECT)
      .populate('category', 'name slug')
      .lean()
      .limit(PRODUCT_MAX - docs.length);
    docs = docs.concat(backfill);
  }
  return docs.slice(0, PRODUCT_MAX);
};

const getPublicShowcase = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    const images = normalizeShowcase(settings).map(({ slot, slug, image, title, description }) => ({
      slot,
      slug,
      image,
      title,
      description,
    }));
    res.set('Cache-Control', SHOWCASE_PUBLIC_CACHE_CONTROL);
    res.json({ images });
  } catch (error) {
    next(error);
  }
};

const getCollectionBySlug = async (req, res, next) => {
  try {
    const raw = req.params.slug;
    if (typeof raw !== 'string' || raw.length === 0 || raw.length > SLUG_MAX) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    const slug = raw.trim().toLowerCase();
    if (!SLUG_RE.test(slug)) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const settings = await getOrCreateSettings();
    const slot = normalizeShowcase(settings).find((entry) => entry.slug === slug);
    if (!slot) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    let products = await resolveProductsForIds(slot.productIds || []);
    if (products.length === 0) {
      products = await resolveDefaultProductsForCollection(slug);
    }

    res.set('Cache-Control', SHOWCASE_PUBLIC_CACHE_CONTROL);
    const title = slot.title || DEFAULT_COLLECTION_TITLES[slug] || humanizeSlug(slug);
    const name = title;
    res.json({
      slug,
      name,
      title,
      description: slot.description || DEFAULT_COLLECTION_DESCRIPTIONS[slug] || '',
      subMaterials: slot.subMaterials,
      products,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminShowcase = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    await materializeSubMaterials(settings);
    const slots = normalizeShowcase(settings);
    const allProductIds = Array.from(new Set(slots.flatMap((entry) => entry.productIds || [])))
      .map((id) => toObjectId(id))
      .filter(Boolean);

    let productMap = new Map();
    if (allProductIds.length > 0) {
      const docs = await Product.find({ _id: { $in: allProductIds } })
        .select('_id name price salePrice comparePrice stock images isActive slug shortDescription description sku unit category')
        .populate('category', 'name slug')
        .lean();
      productMap = new Map(docs.map((doc) => [doc._id.toHexString(), doc]));
    }

    const images = slots.map((entry) => ({
      slot: entry.slot,
      image: entry.image,
      title: entry.title,
      description: entry.description,
      slug: entry.slug,
      subMaterials: entry.subMaterials,
      productIds: entry.productIds,
      products: (entry.productIds || []).map((id) => productMap.get(String(id)) || null),
    }));

    res.json({ images });
  } catch (error) {
    next(error);
  }
};

const setShowcaseSlotImage = async (req, res, next) => {
  try {
    const slot = parseSlot(req.params.slot);
    if (!slot) {
      return res
        .status(400)
        .json({ message: `Invalid slot. Provide a slot between 1 and ${SLOT_MAX}.` });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    if (!req.file.imageType) {
      return res.status(400).json({
        message: 'Invalid image file. Only JPEG, PNG or WEBP images are allowed.',
      });
    }

    const settings = await getOrCreateSettings();
    const current = normalizeShowcase(settings);
    const previousImage = current.find((entry) => entry.slot === slot)?.image || '';

    let newFileId = null;
    let nextImage = '';
    try {
      newFileId = await uploadImage({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        contentType: req.file.imageType.mime,
        purpose: 'showcase',
      });
      nextImage = `${GRIDFS_PREFIX}${newFileId}`;

      settings.productShowcase = current.map((entry) =>
        entry.slot === slot ? { ...entry, image: nextImage } : entry
      );
      await settings.save();
      await markActive([newFileId]);
    } catch (saveError) {
      if (newFileId) {
        try {
          await deleteFile(newFileId);
        } catch (cleanupError) {
          console.error('[SHOWCASE] Orphan upload cleanup failed:', cleanupError.message);
        }
      }
      throw saveError;
    }

    const previousFileId = urlToFileId(previousImage);
    if (previousFileId && previousImage !== nextImage) {
      try {
        const referenced = await collectReferencedGridFSIds();
        await deleteFilesIfUnreferenced([previousFileId], referenced);
      } catch (cleanupError) {
        console.error('[SHOWCASE] Superseded image cleanup skipped:', cleanupError.message);
      }
    }

    res.json({ message: 'Showcase image updated', slot, image: nextImage });
  } catch (error) {
    next(error);
  }
};

const removeShowcaseSlotImage = async (req, res, next) => {
  try {
    const slot = parseSlot(req.params.slot);
    if (!slot) {
      return res
        .status(400)
        .json({ message: `Invalid slot. Provide a slot between 1 and ${SLOT_MAX}.` });
    }

    const settings = await getOrCreateSettings();
    const current = normalizeShowcase(settings);
    const currentImage = current.find((entry) => entry.slot === slot)?.image || '';
    if (!currentImage) {
      return res.json({ message: 'Slot is already empty', slot, image: '' });
    }

    settings.productShowcase = current.map((entry) =>
      entry.slot === slot ? { ...entry, image: '' } : entry
    );
    await settings.save();

    const fileId = urlToFileId(currentImage);
    if (fileId) {
      try {
        const referenced = await collectReferencedGridFSIds();
        await deleteFilesIfUnreferenced([fileId], referenced);
      } catch (cleanupError) {
        console.error('[SHOWCASE] Removed image cleanup skipped:', cleanupError.message);
      }
    }

    res.json({ message: 'Showcase image removed', slot, image: '' });
  } catch (error) {
    next(error);
  }
};

const setShowcaseSlotDescription = async (req, res, next) => {
  try {
    const slot = parseSlot(req.params.slot);
    if (!slot) {
      return res
        .status(400)
        .json({ message: `Invalid slot. Provide a slot between 1 and ${SLOT_MAX}.` });
    }

    const description = sanitizeDescription(req.body && req.body.description);

    const settings = await getOrCreateSettings();
    const current = normalizeShowcase(settings);
    settings.productShowcase = current.map((entry) =>
      entry.slot === slot ? { ...entry, description } : entry
    );
    await settings.save();

    res.json({ message: 'Showcase description updated', slot, description });
  } catch (error) {
    next(error);
  }
};

const setShowcaseSlotDetails = async (req, res, next) => {
  try {
    const slot = parseSlot(req.params.slot);
    if (!slot) {
      return res
        .status(400)
        .json({ message: `Invalid slot. Provide a slot between 1 and ${SLOT_MAX}.` });
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    const description = sanitizeDescription(req.body.description);
    const title = sanitizeTitle(req.body.title);

    let slug = sanitizeSlug(req.body.slug);
    if (!slug) {
      slug = DEFAULT_COLLECTION_SLUGS[slot - 1];
    }
    if (slug.length > SLUG_MAX) {
      return res.status(400).json({ message: 'Collection slug is too long' });
    }
    if (!SLUG_RE.test(slug)) {
      return res.status(400).json({
        message: 'Collection slug must be a URL-safe word like "kurti-collection"',
      });
    }

    let productIds = req.body.productIds;
    if (productIds === undefined || productIds === null) {
      productIds = [];
    }
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ message: 'productIds must be an array' });
    }
    if (productIds.length > PRODUCT_MAX) {
      return res.status(400).json({
        message: `A showcase collection supports at most ${PRODUCT_MAX} products`,
      });
    }

    const ids = [];
    const seen = new Set();
    for (const raw of productIds) {
      if (raw === null || raw === undefined) continue;
      const str = String(raw).trim();
      if (!isObjectId(str)) {
        return res.status(400).json({ message: `"${str}" is not a valid product id` });
      }
      const oid = toObjectId(str);
      const hex = oid.toHexString();
      if (seen.has(hex)) {
        return res.status(400).json({ message: 'A product cannot be selected more than once in the same collection' });
      }
      seen.add(hex);
      ids.push(oid);
    }

    if (ids.length > 0) {
      const found = await Product.find({ _id: { $in: ids } }).select('_id').lean();
      if (found.length !== ids.length) {
        return res.status(400).json({ message: 'One or more selected products do not exist' });
      }
    }

    const settings = await getOrCreateSettings();
    const current = normalizeShowcase(settings);
    const slugTaken = current.some(
      (entry) => entry.slot !== slot && entry.slug === slug
    );
    if (slugTaken) {
      return res.status(400).json({
        message: `Collection slug "${slug}" is already used by another slot`,
      });
    }

    const existing = settings.productShowcase || [];
    const idx = existing.findIndex((entry) => Number(entry.slot) === slot);
    const existingEntry = current.find((entry) => entry.slot === slot);
    const nextSlot = {
      slot,
      ...(idx >= 0 && existing[idx]
        ? {
            image: String(existing[idx].image || ''),
          }
        : { image: '' }),
      title,
      description,
      slug,
      productIds: ids,
      subMaterials: existingEntry
        ? existingEntry.subMaterials
        : buildDefaultSubMaterials(slot, slug),
    };
    if (idx >= 0) {
      existing[idx] = nextSlot;
    } else {
      existing.push(nextSlot);
    }
    settings.productShowcase = existing;
    await settings.save();

    res.json({
      message: 'Showcase slot updated',
      slot,
      title,
      slug,
      description,
      productIds: ids.map((id) => id.toHexString()),
    });
  } catch (error) {
    next(error);
  }
};

const getSlotSubMaterials = async (req, res, next) => {
  try {
    const slot = parseSlot(req.params.slot);
    if (!slot) {
      return res
        .status(400)
        .json({ message: `Invalid slot. Provide a slot between 1 and ${SLOT_MAX}.` });
    }
    const settings = await getOrCreateSettings();
    const entry = normalizeShowcase(settings).find((item) => item.slot === slot);
    res.json({ slot, subMaterials: entry ? entry.subMaterials : [] });
  } catch (error) {
    next(error);
  }
};

const sanitizeSubImage = async (value, currentImage) => {
  if (value === undefined || value === null) return currentImage;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (isGridFSUrl(trimmed)) {
    const fileId = urlToFileId(trimmed);
    if (!fileId) return null;
    const file = await findFile(fileId);
    if (!file) return null;
    return trimmed;
  }
  if (trimmed.startsWith('//')) return null;
  if (trimmed.startsWith('/')) return trimmed;
  if (/^https?:\/\//.test(trimmed)) return trimmed;
  return null;
};

const setSubMaterialDetails = async (req, res, next) => {
  try {
    const slot = parseSlot(req.params.slot);
    if (!slot) {
      return res
        .status(400)
        .json({ message: `Invalid slot. Provide a slot between 1 and ${SLOT_MAX}.` });
    }
    const subSlot = parseSubSlot(req.params.sub);
    if (!subSlot) {
      return res
        .status(400)
        .json({
          message: `Invalid sub-material slot. Provide a sub-material between 1 and ${SUB_SLOT_MAX}.`,
        });
    }
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    const title = sanitizeTitle(req.body.title);
    if (!title) {
      return res.status(400).json({ message: 'Sub-material name is required' });
    }

    let slug = sanitizeSlug(req.body.slug);
    if (slug && (!SLUG_RE.test(slug) || slug.length > SLUG_MAX)) {
      return res.status(400).json({
        message: 'Sub-material slug must be a URL-safe word like "material-1-1"',
      });
    }

    const settings = await getOrCreateSettings();
    const current = normalizeShowcase(settings);
    const mainEntry = current.find((item) => item.slot === slot);
    if (!mainEntry || !mainEntry.subMaterials[subSlot - 1]) {
      return res.status(400).json({ message: 'Sub-material slot not found' });
    }
    const previous = mainEntry.subMaterials[subSlot - 1];

    if (!slug) {
      slug = previous.slug;
    }
    if (!SLUG_RE.test(slug)) {
      return res.status(400).json({
        message: 'Sub-material slug must be a URL-safe word like "material-1-1"',
      });
    }

    const subSlugOwners = new Map();
    for (const entry of current) {
      for (const sub of entry.subMaterials) {
        subSlugOwners.set(`${entry.slot}:${sub.slot}`, sub.slug);
      }
    }
    const duplicateOwner = [...subSlugOwners].find(
      ([key, subSlug]) => key !== `${slot}:${subSlot}` && subSlug === slug
    );
    if (duplicateOwner) {
      return res.status(400).json({
        message: `Sub-material slug "${slug}" is already used by another sub-material`,
      });
    }

    const image = await sanitizeSubImage(req.body.image, previous.image);
    if (image === null) {
      return res.status(400).json({ message: 'Sub-material image is invalid' });
    }

    const nextSubMaterials = mainEntry.subMaterials.map((sub, i) =>
      i === subSlot - 1
        ? { slot: subSlot, title, slug, image }
        : sub
    );

    settings.productShowcase = current.map((entry) =>
      entry.slot === slot ? { ...entry, subMaterials: nextSubMaterials } : entry
    );
    await settings.save();

    if (previous.image !== image) {
      const previousFileId = urlToFileId(previous.image);
      if (previousFileId) {
        try {
          const referenced = await collectReferencedGridFSIds();
          await deleteFilesIfUnreferenced([previousFileId], referenced);
        } catch (cleanupError) {
          console.error('[SHOWCASE] Superseded sub-material image cleanup skipped:', cleanupError.message);
        }
      }
    }

    res.json({ message: 'Sub-material updated', slot, subSlot, title, slug, image });
  } catch (error) {
    next(error);
  }
};

const setSubMaterialImage = async (req, res, next) => {
  try {
    const slot = parseSlot(req.params.slot);
    if (!slot) {
      return res
        .status(400)
        .json({ message: `Invalid slot. Provide a slot between 1 and ${SLOT_MAX}.` });
    }
    const subSlot = parseSubSlot(req.params.sub);
    if (!subSlot) {
      return res
        .status(400)
        .json({
          message: `Invalid sub-material slot. Provide a sub-material between 1 and ${SUB_SLOT_MAX}.`,
        });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    if (!req.file.imageType) {
      return res.status(400).json({
        message: 'Invalid image file. Only JPEG, PNG or WEBP images are allowed.',
      });
    }

    const settings = await getOrCreateSettings();
    const current = normalizeShowcase(settings);
    const mainEntry = current.find((entry) => entry.slot === slot);
    if (!mainEntry || !mainEntry.subMaterials[subSlot - 1]) {
      return res.status(400).json({ message: 'Sub-material slot not found' });
    }
    const previousImage = mainEntry.subMaterials[subSlot - 1].image || '';

    let newFileId = null;
    let nextImage = '';
    try {
      newFileId = await uploadImage({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        contentType: req.file.imageType.mime,
        purpose: 'showcase-sub',
      });
      nextImage = `${GRIDFS_PREFIX}${newFileId}`;

      settings.productShowcase = current.map((entry) =>
        entry.slot === slot
          ? {
              ...entry,
              subMaterials: entry.subMaterials.map((sub, i) =>
                i === subSlot - 1 ? { ...sub, image: nextImage } : sub
              ),
            }
          : entry
      );
      await settings.save();
      await markActive([newFileId]);
    } catch (saveError) {
      if (newFileId) {
        try {
          await deleteFile(newFileId);
        } catch (cleanupError) {
          console.error('[SHOWCASE] Orphan sub-material upload cleanup failed:', cleanupError.message);
        }
      }
      throw saveError;
    }

    const previousFileId = urlToFileId(previousImage);
    if (previousFileId && previousImage !== nextImage) {
      try {
        const referenced = await collectReferencedGridFSIds();
        await deleteFilesIfUnreferenced([previousFileId], referenced);
      } catch (cleanupError) {
        console.error('[SHOWCASE] Superseded sub-material image cleanup skipped:', cleanupError.message);
      }
    }

    res.json({ message: 'Sub-material image updated', slot, subSlot, image: nextImage });
  } catch (error) {
    next(error);
  }
};

const initShowcaseSubMaterials = async () => {
  const settings = await getOrCreateSettings();
  await materializeSubMaterials(settings);
  return true;
};

module.exports = {
  parseSlot,
  parseSubSlot,
  sanitizeDescription,
  getPublicShowcase,
  getCollectionBySlug,
  getAdminShowcase,
  setShowcaseSlotImage,
  removeShowcaseSlotImage,
  setShowcaseSlotDescription,
  setShowcaseSlotDetails,
  getSlotSubMaterials,
  setSubMaterialDetails,
  setSubMaterialImage,
  materializeSubMaterials,
  initShowcaseSubMaterials,
};

module.exports.SHOWCASE_SLOT_MAX = SLOT_MAX;
module.exports.SHOWCASE_SUB_SLOT_MAX = SUB_SLOT_MAX;
module.exports.SHOWCASE_DESCRIPTION_MAX = DESCRIPTION_MAX;
module.exports.SHOWCASE_PRODUCT_MAX = PRODUCT_MAX;
module.exports.DEFAULT_COLLECTION_SLUGS = DEFAULT_COLLECTION_SLUGS;