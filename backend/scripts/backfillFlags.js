require('dotenv').config({ override: true });

const Product = require('../models/Product');

const BEST_SLUGS = ['shw-01', 'shw-02', 'mat-01', 'mat-02', 'kur-01', 'mat-03'];
const NEW_SLUGS = ['newlaunch-1', 'newlaunch-2', 'newlaunch-3', 'newlaunch-4', 'newlaunch-5', 'newlaunch-6', 'newlaunch-7', 'newlaunch-8'];

async function run() {
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 });
  const best = await Product.updateMany({ slug: { $in: BEST_SLUGS } }, { $set: { isBestSeller: true } });
  const newest = await Product.updateMany({ slug: { $in: NEW_SLUGS } }, { $set: { isNewArrival: true } });
  console.log('isBestSeller matched:', best.modifiedCount);
  console.log('isNewArrival matched:', newest.modifiedCount);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (e) => {
  console.error('backfill failed:', e.message);
  process.exit(1);
});