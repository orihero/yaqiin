import express from 'express';
import ShopProduct from '../models/ShopProduct';
import Product from '../models/Product';
import authMiddleware from '../utils/authMiddleware';

const router = express.Router();

// Get all products assigned to a specific shop
router.get('/', async (req, res): Promise<void> => {
  try {
    const { shopId, page = 1, limit = 10, search = '' } = req.query;
    
    if (!shopId) {
      res.status(400).json({ success: false, error: { message: 'Shop ID is required' } });
      return;
    }

    const query: any = { shopId };
    
    // Add search functionality
    if (search) {
      // Search in product names and descriptions
      const productIds = await Product.find({
        $or: [
          { 'name.uz': { $regex: search, $options: 'i' } },
          { 'name.ru': { $regex: search, $options: 'i' } },
          { 'description.uz': { $regex: search, $options: 'i' } },
          { 'description.ru': { $regex: search, $options: 'i' } },
        ]
      }).distinct('_id');
      
      query.productId = { $in: productIds };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [shopProducts, total] = await Promise.all([
      ShopProduct.find(query)
        .skip(skip)
        .limit(limitNum)
        .populate('productId', 'name description categoryId images basePrice unit baseStock isActive isFeatured'),
      ShopProduct.countDocuments(query)
    ]);

    // Transform the data to match the expected frontend structure
    const transformedData = shopProducts.map(shopProduct => ({
      _id: shopProduct._id,
      shopId: shopProduct.shopId,
      product: shopProduct.productId, // Rename productId to product
      price: shopProduct.price,
      stock: shopProduct.stock,
      isActive: shopProduct.isActive,
      isRefundable: shopProduct.isRefundable,
      maxOrderQuantity: shopProduct.maxOrderQuantity,
      minOrderQuantity: shopProduct.minOrderQuantity,
      deliveryTime: shopProduct.deliveryTime,
      specialNotes: shopProduct.specialNotes,
      createdAt: shopProduct.createdAt,
      updatedAt: shopProduct.updatedAt
    }));

    res.json({
      success: true,
      data: transformedData,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Get available products that can be assigned to a shop
router.get('/available', async (req, res): Promise<void> => {
  try {
    const { shopId, page = 1, limit = 10, search = '' } = req.query;
    
    if (!shopId) {
      res.status(400).json({ success: false, error: { message: 'Shop ID is required' } });
      return;
    }

    // Get products that are already assigned to this shop
    const assignedProductIds = await ShopProduct.find({ shopId }).distinct('productId');

    // Build query for available products
    const query: any = {
      _id: { $nin: assignedProductIds }, // Exclude already assigned products
      isActive: true
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { 'name.uz': { $regex: search, $options: 'i' } },
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'description.uz': { $regex: search, $options: 'i' } },
        { 'description.ru': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(limitNum)
        .select('name description categoryId images basePrice unit baseStock isActive'),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching available products:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Assign a product to a shop
router.post('/', async (req, res): Promise<void> => {
  try {
    const { shopId, productId, price, stock, isActive = true, isRefundable = false, maxOrderQuantity, minOrderQuantity = 1, deliveryTime, specialNotes } = req.body;

    console.log('Assign product request:', { shopId, productId, price, stock, isActive, isRefundable, maxOrderQuantity, minOrderQuantity, deliveryTime, specialNotes });

    if (!shopId || !productId) {
      res.status(400).json({ success: false, error: { message: 'Shop ID and Product ID are required' } });
      return;
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, error: { message: 'Product not found' } });
      return;
    }

    // Check if already assigned
    const existingAssignment = await ShopProduct.findOne({ shopId, productId });
    if (existingAssignment) {
      res.status(400).json({ success: false, error: { message: 'Product is already assigned to this shop' } });
      return;
    }

    // Create shop product with defaults if not provided
    const shopProductData = {
      shopId,
      productId,
      price: price || product.basePrice,
      stock: stock || product.baseStock,
      isActive,
      isRefundable,
      maxOrderQuantity,
      minOrderQuantity,
      deliveryTime,
      specialNotes
    };

    console.log('Creating shop product with data:', shopProductData);

    const shopProduct = new ShopProduct(shopProductData);
    await shopProduct.save();

    // Populate product data for response
    await shopProduct.populate('productId', 'name description categoryId images basePrice unit baseStock');

    // Transform the data to match the expected frontend structure
    const transformedData = {
      _id: shopProduct._id,
      shopId: shopProduct.shopId,
      product: shopProduct.productId, // Rename productId to product
      price: shopProduct.price,
      stock: shopProduct.stock,
      isActive: shopProduct.isActive,
      isRefundable: shopProduct.isRefundable,
      maxOrderQuantity: shopProduct.maxOrderQuantity,
      minOrderQuantity: shopProduct.minOrderQuantity,
      deliveryTime: shopProduct.deliveryTime,
      specialNotes: shopProduct.specialNotes,
      createdAt: shopProduct.createdAt,
      updatedAt: shopProduct.updatedAt
    };

    res.status(201).json({
      success: true,
      data: transformedData
    });
  } catch (error: any) {
    console.error('Error assigning product to shop:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    if (error.code === 11000) {
      res.status(400).json({ success: false, error: { message: 'Product is already assigned to this shop' } });
      return;
    }
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Get a specific shop product
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const shopProduct = await ShopProduct.findById(id).populate('productId', 'name description categoryId images basePrice unit baseStock isActive isFeatured');
    
    if (!shopProduct) {
      res.status(404).json({ success: false, error: { message: 'Shop product not found' } });
      return;
    }

    // Transform the data to match the expected frontend structure
    const transformedData = {
      _id: shopProduct._id,
      shopId: shopProduct.shopId,
      product: shopProduct.productId, // Rename productId to product
      price: shopProduct.price,
      stock: shopProduct.stock,
      isActive: shopProduct.isActive,
      isRefundable: shopProduct.isRefundable,
      maxOrderQuantity: shopProduct.maxOrderQuantity,
      minOrderQuantity: shopProduct.minOrderQuantity,
      deliveryTime: shopProduct.deliveryTime,
      specialNotes: shopProduct.specialNotes,
      createdAt: shopProduct.createdAt,
      updatedAt: shopProduct.updatedAt
    };

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching shop product:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Update shop product data
router.put('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.shopId;
    delete updateData.productId;
    delete updateData._id;

    const shopProduct = await ShopProduct.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('productId', 'name description categoryId images basePrice unit baseStock isActive isFeatured');

    if (!shopProduct) {
      res.status(404).json({ success: false, error: { message: 'Shop product not found' } });
      return;
    }

    // Transform the data to match the expected frontend structure
    const transformedData = {
      _id: shopProduct._id,
      shopId: shopProduct.shopId,
      product: shopProduct.productId, // Rename productId to product
      price: shopProduct.price,
      stock: shopProduct.stock,
      isActive: shopProduct.isActive,
      isRefundable: shopProduct.isRefundable,
      maxOrderQuantity: shopProduct.maxOrderQuantity,
      minOrderQuantity: shopProduct.minOrderQuantity,
      deliveryTime: shopProduct.deliveryTime,
      specialNotes: shopProduct.specialNotes,
      createdAt: shopProduct.createdAt,
      updatedAt: shopProduct.updatedAt
    };

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error updating shop product:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Remove a product from a shop
router.delete('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const shopProduct = await ShopProduct.findByIdAndDelete(id);
    
    if (!shopProduct) {
      res.status(404).json({ success: false, error: { message: 'Shop product not found' } });
      return;
    }

    res.json({
      success: true,
      data: { message: 'Product removed from shop successfully' }
    });
  } catch (error) {
    console.error('Error removing product from shop:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
