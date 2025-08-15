import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../backend/src/models/Product';
import ShopProduct from '../backend/src/models/ShopProduct';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yaqiin";

async function migrateProductSchema() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Step 1: Update existing products to new schema
    console.log('Step 1: Updating existing products...');
    
    // Get all existing products
    const existingProducts = await Product.find({});
    console.log(`Found ${existingProducts.length} existing products`);

    for (const product of existingProducts) {
      try {
        // Create ShopProduct entries for existing product-shop relationships
        if (product.shopId) {
          const shopProductData = {
            shopId: product.shopId,
            productId: product._id,
            price: product.price, // Use existing price as shop price
            stock: product.stock, // Use existing stock as shop stock
            isActive: product.isActive,
            isRefundable: false,
            minOrderQuantity: 1,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
          };

          // Check if ShopProduct already exists
          const existingShopProduct = await ShopProduct.findOne({
            shopId: product.shopId,
            productId: product._id
          });

          if (!existingShopProduct) {
            await ShopProduct.create(shopProductData);
            console.log(`Created ShopProduct for product ${product._id} and shop ${product.shopId}`);
          }
        }

        // Update product to new schema
        const updateData: any = {
          basePrice: product.price,
          baseStock: product.stock,
          updatedAt: new Date()
        };

        // Remove old fields
        updateData.$unset = {
          shopId: 1,
          price: 1,
          stock: 1
        };

        await Product.findByIdAndUpdate(product._id, updateData);
        console.log(`Updated product ${product._id} to new schema`);

      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error);
      }
    }

    console.log('Step 1 completed successfully');

    // Step 2: Verify migration
    console.log('Step 2: Verifying migration...');
    
    const updatedProducts = await Product.find({});
    const shopProducts = await ShopProduct.find({});
    
    console.log(`Updated products: ${updatedProducts.length}`);
    console.log(`Created shop products: ${shopProducts.length}`);
    
    // Check for any products that still have old fields
    const productsWithOldFields = await Product.find({
      $or: [
        { shopId: { $exists: true } },
        { price: { $exists: true } },
        { stock: { $exists: true } }
      ]
    });
    
    if (productsWithOldFields.length > 0) {
      console.warn(`Warning: ${productsWithOldFields.length} products still have old fields`);
    } else {
      console.log('All products successfully migrated to new schema');
    }

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateProductSchema();
}

export default migrateProductSchema;
