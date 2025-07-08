import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yaqiin';
const SEEDS_DIR = path.join(__dirname, 'seeds');

const seedOrder = [
  'adminAndSettingSeed.ts',
  'userSeed.ts',
  'categorySeed.ts',
  'shopSeed.ts',
  'productSeed.ts',
  'orderSeed.ts',
];

async function runSeeds() {
  await mongoose.connect(MONGO_URI);

  for (const file of seedOrder) {
    const seedModule = await import(path.join(SEEDS_DIR, file));
    if (typeof seedModule.default === 'function') {
      console.log(`Running seed: ${file}`);
      await seedModule.default();
    }
  }

  await mongoose.disconnect();
  console.log('All seeds complete.');
}

runSeeds().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
}); 