"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ShopProduct_1 = __importDefault(require("../models/ShopProduct"));
const Product_1 = __importDefault(require("../models/Product"));
const router = express_1.default.Router();
// Get all products assigned to a specific shop
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId, page = 1, limit = 10, search = '' } = req.query;
        if (!shopId) {
            res.status(400).json({ success: false, error: { message: 'Shop ID is required' } });
            return;
        }
        const query = { shopId };
        // Add search functionality
        if (search) {
            // Search in product names and descriptions
            const productIds = yield Product_1.default.find({
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
        const [shopProducts, total] = yield Promise.all([
            ShopProduct_1.default.find(query)
                .skip(skip)
                .limit(limitNum)
                .populate('productId', 'name description categoryId images basePrice unit baseStock isActive isFeatured'),
            ShopProduct_1.default.countDocuments(query)
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
    }
    catch (error) {
        console.error('Error fetching shop products:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
}));
// Get available products that can be assigned to a shop
router.get('/available', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId, page = 1, limit = 10, search = '' } = req.query;
        if (!shopId) {
            res.status(400).json({ success: false, error: { message: 'Shop ID is required' } });
            return;
        }
        // Get products that are already assigned to this shop
        const assignedProductIds = yield ShopProduct_1.default.find({ shopId }).distinct('productId');
        // Build query for available products
        const query = {
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
        const [products, total] = yield Promise.all([
            Product_1.default.find(query)
                .skip(skip)
                .limit(limitNum)
                .select('name description categoryId images basePrice unit baseStock isActive'),
            Product_1.default.countDocuments(query)
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
    }
    catch (error) {
        console.error('Error fetching available products:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
}));
// Assign a product to a shop
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId, productId, price, stock, isActive = true, isRefundable = false, maxOrderQuantity, minOrderQuantity = 1, deliveryTime, specialNotes } = req.body;
        console.log('Assign product request:', { shopId, productId, price, stock, isActive, isRefundable, maxOrderQuantity, minOrderQuantity, deliveryTime, specialNotes });
        if (!shopId || !productId) {
            res.status(400).json({ success: false, error: { message: 'Shop ID and Product ID are required' } });
            return;
        }
        // Check if product exists
        const product = yield Product_1.default.findById(productId);
        if (!product) {
            res.status(404).json({ success: false, error: { message: 'Product not found' } });
            return;
        }
        // Check if already assigned
        const existingAssignment = yield ShopProduct_1.default.findOne({ shopId, productId });
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
        const shopProduct = new ShopProduct_1.default(shopProductData);
        yield shopProduct.save();
        // Populate product data for response
        yield shopProduct.populate('productId', 'name description categoryId images basePrice unit baseStock');
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
    }
    catch (error) {
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
}));
// Get a specific shop product
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const shopProduct = yield ShopProduct_1.default.findById(id).populate('productId', 'name description categoryId images basePrice unit baseStock isActive isFeatured');
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
    }
    catch (error) {
        console.error('Error fetching shop product:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
}));
// Update shop product data
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Remove fields that shouldn't be updated
        delete updateData.shopId;
        delete updateData.productId;
        delete updateData._id;
        const shopProduct = yield ShopProduct_1.default.findByIdAndUpdate(id, Object.assign(Object.assign({}, updateData), { updatedAt: new Date() }), { new: true, runValidators: true }).populate('productId', 'name description categoryId images basePrice unit baseStock isActive isFeatured');
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
    }
    catch (error) {
        console.error('Error updating shop product:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
}));
// Remove a product from a shop
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const shopProduct = yield ShopProduct_1.default.findByIdAndDelete(id);
        if (!shopProduct) {
            res.status(404).json({ success: false, error: { message: 'Shop product not found' } });
            return;
        }
        res.json({
            success: true,
            data: { message: 'Product removed from shop successfully' }
        });
    }
    catch (error) {
        console.error('Error removing product from shop:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
}));
exports.default = router;
