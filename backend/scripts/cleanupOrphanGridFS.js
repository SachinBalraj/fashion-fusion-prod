/**
 * GridFS orphan cleanup utility.
 *
 * DRY RUN by default. Pass --delete to permanently remove unreferenced files.
 *
 * Usage:
 *   node scripts/cleanupOrphanGridFS.js          # dry run (default)
 *   node scripts/cleanupOrphanGridFS.js --delete  # destructive
 *
 * "Referenced" means referenced by any of:
 *   - products.images / products.thumbnail
 *   - orders.orderItems[].image (order history snapshots)
 *   - carts.items[].image
 *   - settings.logo
 *
 * Never touches /images/* static files.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const { getGridFS, BUCKET_NAME } = require('../config/gridfs');
const { collectReferencedGridFSIds } = require('../services/gridfsService');

const DESTRUCTIVE = process.argv.includes('--delete');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI environment variable is required');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to MongoDB (db: ${mongoose.connection.db.databaseName})`);
  console.log(`Bucket: ${BUCKET_NAME} | Mode: ${DESTRUCTIVE ? 'DESTRUCTIVE (--delete)' : 'DRY RUN (no deletion)'}`);
  console.log('');

  const referenced = await collectReferencedGridFSIds();
  const bucket = getGridFS();

  const allFiles = await bucket.find({}).project({ filename: 1, length: 1, uploadDate: 1, contentType: 1, metadata: 1 }).toArray();

  const orphans = allFiles.filter((file) => !referenced.has(file._id.toHexString()));

  console.log(`GridFS files total:      ${allFiles.length}`);
  console.log(`Referenced files:        ${allFiles.length - orphans.length}`);
  console.log(`Orphan candidates:       ${orphans.length}`);

  if (orphans.length > 0) {
    console.log('');
    console.log('Orphan candidates:');
    for (const file of orphans) {
      const sizeKB = ((file.length || 0) / 1024).toFixed(1);
      console.log(
        `  - ${file._id}  ${sizeKB} KB  ${file.contentType || file.metadata?.contentType || 'unknown'}  ${file.filename || '(no name)'}`
      );
    }
  }

  if (DESTRUCTIVE && orphans.length > 0) {
    console.log('');
    console.log('Deleting orphaned files...');
    let deleted = 0;
    for (const file of orphans) {
      try {
        await bucket.delete(file._id);
        deleted += 1;
      } catch (error) {
        console.error(`  Failed to delete ${file._id}: ${error.message}`);
      }
    }
    console.log(`Deleted ${deleted}/${orphans.length} orphaned files.`);
  } else if (orphans.length > 0) {
    console.log('');
    console.log('Nothing deleted. Re-run with --delete to remove these files.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});