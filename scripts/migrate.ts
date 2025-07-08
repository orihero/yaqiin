import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yaqiin';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  // TODO: Add migration logic here
  console.log('Migration script ready. Add your migration steps here.');
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Error during migration:', err);
  process.exit(1);
}); 