import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Shop from './models/Shop';
import Product from './models/Product';
import Category from './models/Category';
import Order from './models/Order';
import OrderFlow from './models/OrderFlow';
import Setting from './models/Setting';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yaqiin';

async function clearSeeds() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear all seeded data
    console.log('Clearing seeded data...');

    // Clear orders
    const ordersResult = await Order.deleteMany({});
    console.log(`Deleted ${ordersResult.deletedCount} orders`);

    // Clear products
    const productsResult = await Product.deleteMany({});
    console.log(`Deleted ${productsResult.deletedCount} products`);

    // Clear shops
    const shopsResult = await Shop.deleteMany({});
    console.log(`Deleted ${shopsResult.deletedCount} shops`);

    // Clear categories
    const categoriesResult = await Category.deleteMany({});
    console.log(`Deleted ${categoriesResult.deletedCount} categories`);

    // Clear order flows (except default)
    const orderFlowsResult = await OrderFlow.deleteMany({ isDefault: false });
    console.log(`Deleted ${orderFlowsResult.deletedCount} non-default order flows`);

    // Clear users (except admin users)
    const usersResult = await User.deleteMany({ 
      role: { $in: ['client', 'courier', 'shop_owner'] } 
    });
    console.log(`Deleted ${usersResult.deletedCount} non-admin users`);

    // Clear settings (except default settings)
    const settingsResult = await Setting.deleteMany({ key: { $ne: 'default' } });
    console.log(`Deleted ${settingsResult.deletedCount} non-default settings`);

    console.log('✅ All seeded data cleared successfully!');
    console.log('\nNote:');
    console.log('- Admin users are preserved');
    console.log('- Default order flow is preserved');
    console.log('- Default settings are preserved');
    console.log('\nTo restore seed data, run: npm run seed');

  } catch (error) {
    console.error('❌ Error clearing seeded data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

clearSeeds(); 