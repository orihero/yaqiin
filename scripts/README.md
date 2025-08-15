# Database Migration Scripts

This directory contains database migration scripts for updating the schema.

## Product Schema Migration

The `migrateProductSchema.ts` script migrates the existing Product model to the new global product system.

### What it does:

1. **Updates existing products** to remove `shopId` and rename fields:
   - `price` → `basePrice`
   - `stock` → `baseStock`

2. **Creates ShopProduct entries** for existing product-shop relationships with:
   - Shop-specific pricing
   - Shop-specific stock
   - Shop-specific settings (refundable, order limits, etc.)

3. **Verifies the migration** by checking that all products have been updated correctly.

### How to run:

```bash
# From the backend directory
npm run migrate:products

# Or directly with ts-node
npx ts-node scripts/migrateProductSchema.ts
```

### Before running:

1. **Backup your database** - This is a destructive operation that modifies existing data
2. **Stop your application** - Ensure no other processes are writing to the database
3. **Test on a copy first** - Run the migration on a test database before production

### After running:

1. **Verify the migration** - Check the console output for any errors
2. **Test your application** - Ensure everything works with the new schema
3. **Update frontend** - Make sure your frontend is using the new API endpoints

### Rollback:

If you need to rollback, you'll need to:
1. Restore from your backup
2. Or write a reverse migration script

## New API Endpoints

After migration, the following new endpoints will be available:

- `GET /api/shop-products?shopId=xxx` - Get products assigned to a shop
- `POST /api/shop-products` - Assign a product to a shop
- `PUT /api/shop-products/:id` - Update shop product data
- `DELETE /api/shop-products/:id` - Remove a product from a shop
- `GET /api/shop-products/available?shopId=xxx` - Get available products for a shop

## Schema Changes

### Product Model (Global)
```typescript
interface Product {
  _id: string;
  name: ProductNameDesc;
  description?: ProductNameDesc;
  categoryId: string;
  images?: string[];
  basePrice: number; // Global base price
  unit: string;
  baseStock: ProductStock; // Global base stock
  // ... other fields
}
```

### ShopProduct Model (Shop-specific)
```typescript
interface ShopProduct {
  _id: string;
  shopId: string;
  productId: string;
  price: number; // Shop-specific price
  stock: ProductStock; // Shop-specific stock
  isActive: boolean;
  isRefundable?: boolean;
  maxOrderQuantity?: number;
  minOrderQuantity?: number;
  deliveryTime?: number;
  specialNotes?: string;
}
```
