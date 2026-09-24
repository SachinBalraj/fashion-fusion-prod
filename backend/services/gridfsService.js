const mongoose = require('mongoose');
const { getGridFS, BUCKET_NAME } = require('../config/gridfs');

const GRIDFS_PREFIX = '/api/images/';
const GRIDFS_FILES_COLLECTION = `${BUCKET_NAME}.files`;

const isGridFSUrl = (value) =>
  typeof value === 'string' &&
  (value.startsWith(GRIDFS_PREFIX) || value === GRIDFS_PREFIX.slice(0, -1));

const urlToFileId = (value) => {
  if (typeof value !== 'string' || !value.startsWith(GRIDFS_PREFIX)) return null;
  const raw = value.slice(GRIDFS_PREFIX.length);
  return raw && mongoose.Types.ObjectId.isValid(raw) ? new mongoose.Types.ObjectId(raw) : null;
};

const toObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null;

const detectImageType = (buffer) => {
  if (!buffer || buffer.length < 12) return null;
  const b = buffer;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  return null;
};

const uploadImage = ({ buffer, originalname, contentType, productId = null, purpose = null }) =>
  new Promise((resolve, reject) => {
    const bucket = getGridFS();
    const safeName = String(originalname || 'image')
      .replace(/[^a-z0-9._-]/gi, '_')
      .slice(0, 200) || 'image';
    const filename = `${Date.now()}-${safeName}`;
    const metadata = {
      purpose: purpose || 'product',
      source: 'admin-upload',
      status: 'pending',
      originalname: String(originalname || '').slice(0, 255),
      contentType: contentType || 'application/octet-stream',
      productId: productId ? new mongoose.Types.ObjectId(productId) : null,
    };
    const stream = bucket.openUploadStream(filename, { contentType, metadata });
    stream.on('error', (err) => reject(err));
    stream.on('finish', () => resolve(stream.id));
    stream.end(buffer);
  });

const findFile = (id) => {
  const bucket = getGridFS();
  return bucket.find({ _id: id }).limit(1).next();
};

const openDownloadStream = (id, opts = {}) => getGridFS().openDownloadStream(toObjectId(id), opts);

const deleteFile = (id) => getGridFS().delete(toObjectId(id));

const getGridFSFilesCollection = () => mongoose.connection.db.collection(GRIDFS_FILES_COLLECTION);

const markActive = async (ids) => {
  const valid = (ids || []).map(toObjectId).filter(Boolean);
  if (valid.length === 0) return;
  await getGridFSFilesCollection().updateMany(
    { _id: { $in: valid } },
    { $set: { 'metadata.status': 'active' } }
  );
};

const gridfsIdsFromUrls = (urls) => {
  const seen = new Set();
  const ids = [];
  for (const url of urls || []) {
    const id = urlToFileId(url);
    if (id && !seen.has(id.toHexString())) {
      seen.add(id.toHexString());
      ids.push(id);
    }
  }
  return ids;
};

const collectReferencedGridFSIds = async () => {
  const db = mongoose.connection.db;
  const referenced = new Set();

  const products = await db
    .collection('products')
    .find({}, { images: 1, thumbnail: 1 })
    .toArray();
  for (const doc of products) {
    for (const id of gridfsIdsFromUrls([...(doc.images || []), doc.thumbnail])) {
      referenced.add(id.toHexString());
    }
  }

  const orders = await db
    .collection('orders')
    .find({}, { orderItems: 1 })
    .toArray();
  for (const doc of orders) {
    for (const item of doc.orderItems || []) {
      const id = urlToFileId(item.image);
      if (id) referenced.add(id.toHexString());
    }
  }

  const carts = await db
    .collection('carts')
    .find({}, { items: 1 })
    .toArray();
  for (const doc of carts) {
    for (const item of doc.items || []) {
      const id = urlToFileId(item.image);
      if (id) referenced.add(id.toHexString());
    }
  }

  const settings = await db.collection('settings').findOne({}, { logo: 1, productShowcase: 1 });
  if (settings) {
    const id = urlToFileId(settings.logo);
    if (id) referenced.add(id.toHexString());

    for (const slot of settings.productShowcase || []) {
      const showcaseId = urlToFileId(slot && slot.image);
      if (showcaseId) referenced.add(showcaseId.toHexString());
    }
  }

  return referenced;
};

const deleteFilesIfUnreferenced = async (ids, referencedSet) => {
  const bucket = getGridFS();
  for (const id of ids) {
    const hex = id.toHexString();
    if (referencedSet.has(hex)) continue;
    try {
      await bucket.delete(id);
    } catch (error) {
      if (!error.message.includes('not found') && !error.message.includes('does not exist')) {
        throw error;
      }
    }
  }
};

module.exports = {
  GRIDFS_PREFIX,
  isGridFSUrl,
  urlToFileId,
  toObjectId,
  detectImageType,
  uploadImage,
  findFile,
  openDownloadStream,
  deleteFile,
  markActive,
  gridfsIdsFromUrls,
  collectReferencedGridFSIds,
  deleteFilesIfUnreferenced,
};