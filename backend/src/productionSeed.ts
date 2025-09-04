import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yaqiin';

async function runProductionSeed() {
  console.log('🚀 Starting production seed process...');
  console.log('📊 Database:', MONGO_URI);
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database');

    // Import and run production seed
    const productionSeedModule = await import('./seeds/productionSeed');
    if (typeof productionSeedModule.default === 'function') {
      console.log('🌱 Running production seed...');
      await productionSeedModule.default();
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
    console.log('🎉 Production seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during production seeding:', error);
    process.exit(1);
  }
}

// Check if this is being run directly
if (require.main === module) {
  runProductionSeed();
}

export default runProductionSeed; 