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
const express_1 = require("express");
const Product_1 = __importDefault(require("../models/Product"));
const ShopProduct_1 = __importDefault(require("../models/ShopProduct"));
const Category_1 = __importDefault(require("../models/Category"));
const queryHelper_1 = require("../utils/queryHelper");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Multer setup
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage });
// List all products with pagination, filtering, and search
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId } = req.query;
        // If shopId is provided, return shop-specific products
        if (shopId) {
            const { page = 1, limit = 10, search = '', categoryId } = req.query;
            const pageNum = Number(page);
            const limitNum = Number(limit);
            const skip = (pageNum - 1) * limitNum;
            // Build query for shop products
            const query = { shopId, isActive: true };
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
            // Add category filter
            if (categoryId) {
                // First, find all subcategories of the selected category
                const subcategories = yield Category_1.default.find({ parentId: categoryId }).distinct('_id');
                // Include both the main category and all its subcategories
                const allCategoryIds = [categoryId, ...subcategories];
                const categoryProductIds = yield Product_1.default.find({ categoryId: { $in: allCategoryIds } }).distinct('_id');
                if (query.productId) {
                    // Intersect the existing productIds with category productIds
                    const existingProductIds = query.productId.$in;
                    query.productId = { $in: existingProductIds.filter((id) => categoryProductIds.includes(id)) };
                }
                else {
                    query.productId = { $in: categoryProductIds };
                }
            }
            const [shopProducts, total] = yield Promise.all([
                ShopProduct_1.default.find(query)
                    .skip(skip)
                    .limit(limitNum)
                    .populate('productId', 'name description categoryId images basePrice unit unitMeasure baseStock isActive isFeatured'),
                ShopProduct_1.default.countDocuments(query)
            ]);
            // Transform the data to match the expected frontend structure
            const transformedData = shopProducts.map(shopProduct => {
                const product = shopProduct.productId;
                return {
                    _id: product._id,
                    shopId: shopProduct.shopId, // Add shopId to the product object
                    name: product.name,
                    description: product.description,
                    categoryId: product.categoryId,
                    images: product.images,
                    price: shopProduct.price, // Use shop-specific price
                    unit: product.unit,
                    unitMeasure: product.unitMeasure,
                    stock: shopProduct.stock, // Use shop-specific stock
                    attributes: product.attributes,
                    tags: product.tags,
                    nutritionalInfo: product.nutritionalInfo,
                    rating: product.rating,
                    isActive: shopProduct.isActive, // Use shop-specific active status
                    isFeatured: product.isFeatured,
                    isRefundable: shopProduct.isRefundable,
                    maxOrderQuantity: shopProduct.maxOrderQuantity,
                    minOrderQuantity: shopProduct.minOrderQuantity,
                    deliveryTime: shopProduct.deliveryTime,
                    specialNotes: shopProduct.specialNotes,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                };
            });
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
        else {
            // Original logic for getting all products (no shopId)
            const { filter, page, limit, skip } = (0, queryHelper_1.parseQuery)(req, ['name.uz', 'name.ru', 'description.uz', 'description.ru', 'tags']);
            const [products, total] = yield Promise.all([
                Product_1.default.find(filter).skip(skip).limit(limit),
                Product_1.default.countDocuments(filter)
            ]);
            res.json({
                success: true,
                data: products,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }
    }
    catch (err) {
        next(err);
    }
}));
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId } = req.query;
        if (shopId) {
            // Return shop-specific product data
            const shopProduct = yield ShopProduct_1.default.findOne({
                productId: req.params.id,
                shopId,
                isActive: true
            }).populate('productId');
            if (!shopProduct) {
                return next({ status: 404, message: 'Product not found in this shop' });
            }
            const product = shopProduct.productId;
            const transformedData = {
                _id: product._id,
                shopId: shopProduct.shopId, // Add shopId to the product object
                name: product.name,
                description: product.description,
                categoryId: product.categoryId,
                images: product.images,
                price: shopProduct.price, // Use shop-specific price
                unit: product.unit,
                unitMeasure: product.unitMeasure,
                stock: shopProduct.stock, // Use shop-specific stock
                attributes: product.attributes,
                tags: product.tags,
                nutritionalInfo: product.nutritionalInfo,
                rating: product.rating,
                isActive: shopProduct.isActive, // Use shop-specific active status
                isFeatured: product.isFeatured,
                isRefundable: shopProduct.isRefundable,
                maxOrderQuantity: shopProduct.maxOrderQuantity,
                minOrderQuantity: shopProduct.minOrderQuantity,
                deliveryTime: shopProduct.deliveryTime,
                specialNotes: shopProduct.specialNotes,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            };
            res.json({ success: true, data: transformedData });
        }
        else {
            // Return base product data (no shop-specific info)
            const product = yield Product_1.default.findById(req.params.id);
            if (!product)
                return next({ status: 404, message: 'Product not found' });
            res.json({ success: true, data: product });
        }
    }
    catch (err) {
        next(err);
    }
}));
// Get related products (same category, excluding current product)
router.get('/:id/related', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId } = req.query;
        const product = yield Product_1.default.findById(req.params.id);
        if (!product)
            return next({ status: 404, message: 'Product not found' });
        if (shopId) {
            // Return shop-specific related products
            const relatedShopProducts = yield ShopProduct_1.default.find({
                shopId,
                isActive: true,
                productId: {
                    $in: yield Product_1.default.find({
                        categoryId: product.categoryId,
                        _id: { $ne: product._id },
                        isActive: true
                    }).distinct('_id')
                }
            })
                .populate('productId', '_id name images basePrice unit unitMeasure isActive')
                .limit(10);
            const transformedData = relatedShopProducts.map(shopProduct => {
                const product = shopProduct.productId;
                return {
                    _id: product._id,
                    shopId: shopProduct.shopId, // Add shopId to the product object
                    name: product.name,
                    images: product.images,
                    price: shopProduct.price, // Use shop-specific price
                    basePrice: product.basePrice,
                    unit: product.unit,
                    unitMeasure: product.unitMeasure,
                    isActive: shopProduct.isActive, // Use shop-specific active status
                };
            });
            res.json({ success: true, data: transformedData });
        }
        else {
            // Return base related products (no shop-specific info)
            const relatedProducts = yield Product_1.default.find({
                categoryId: product.categoryId,
                _id: { $ne: product._id },
                isActive: true
            })
                .limit(10)
                .select('_id name images basePrice unit isActive');
            res.json({ success: true, data: relatedProducts });
        }
    }
    catch (err) {
        next(err);
    }
}));
// Bulk fetch products by IDs
router.get('/by-ids', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids, shopId } = req.query;
        if (!ids) {
            return next({ status: 400, message: 'Product IDs are required' });
        }
        const productIds = ids.split(',').map(id => id.trim());
        if (shopId) {
            // Return shop-specific products
            const shopProducts = yield ShopProduct_1.default.find({
                shopId,
                isActive: true,
                productId: { $in: productIds }
            }).populate('productId');
            const transformedData = shopProducts.map(shopProduct => {
                const product = shopProduct.productId;
                return {
                    _id: product._id,
                    shopId: shopProduct.shopId, // Add shopId to the product object
                    name: product.name,
                    description: product.description,
                    categoryId: product.categoryId,
                    images: product.images,
                    price: shopProduct.price, // Use shop-specific price
                    unit: product.unit,
                    unitMeasure: product.unitMeasure,
                    stock: shopProduct.stock, // Use shop-specific stock
                    attributes: product.attributes,
                    tags: product.tags,
                    nutritionalInfo: product.nutritionalInfo,
                    rating: product.rating,
                    isActive: shopProduct.isActive, // Use shop-specific active status
                    isFeatured: product.isFeatured,
                    isRefundable: shopProduct.isRefundable,
                    maxOrderQuantity: shopProduct.maxOrderQuantity,
                    minOrderQuantity: shopProduct.minOrderQuantity,
                    deliveryTime: shopProduct.deliveryTime,
                    specialNotes: shopProduct.specialNotes,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                };
            });
            res.json({ success: true, data: transformedData });
        }
        else {
            // Return base products (no shop-specific info)
            const products = yield Product_1.default.find({ _id: { $in: productIds } });
            res.json({ success: true, data: products });
        }
    }
    catch (err) {
        next(err);
    }
}));
router.post('/', upload.array('images', 10), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        // Parse JSON fields if sent as strings
        if (typeof body.name === 'string')
            body.name = JSON.parse(body.name);
        if (typeof body.description === 'string')
            body.description = JSON.parse(body.description);
        if (typeof body.baseStock === 'string')
            body.baseStock = JSON.parse(body.baseStock);
        if (typeof body.unitMeasure === 'string')
            body.unitMeasure = JSON.parse(body.unitMeasure);
        // Handle images
        const baseUrl = req.protocol + '://' + req.get('host');
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(f => baseUrl + '/uploads/' + f.filename);
        }
        // Accept imageUrls from body (external URLs)
        let urlImages = [];
        if (body.imageUrls) {
            if (typeof body.imageUrls === 'string') {
                try {
                    urlImages = JSON.parse(body.imageUrls);
                }
                catch (_a) {
                    urlImages = [body.imageUrls];
                }
            }
            else if (Array.isArray(body.imageUrls)) {
                urlImages = body.imageUrls;
            }
            urlImages = urlImages.filter((img) => img.startsWith('http://') || img.startsWith('https://'));
        }
        // Also accept images from body.images (for legacy/external support)
        if (body.images) {
            let legacyImages = [];
            if (typeof body.images === 'string') {
                try {
                    legacyImages = JSON.parse(body.images);
                }
                catch (_b) {
                    legacyImages = [body.images];
                }
            }
            else if (Array.isArray(body.images)) {
                legacyImages = body.images;
            }
            legacyImages = legacyImages.filter((img) => img.startsWith('http://') || img.startsWith('https://'));
            urlImages = [...urlImages, ...legacyImages];
        }
        const allImages = [...imageUrls, ...urlImages];
        if (allImages.length)
            body.images = allImages;
        const product = new Product_1.default(body);
        yield product.save();
        res.status(201).json({ success: true, data: product, message: 'Product created' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to create product', details: err });
    }
}));
router.put('/:id', upload.array('images', 10), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        if (typeof body.name === 'string')
            body.name = JSON.parse(body.name);
        if (typeof body.description === 'string')
            body.description = JSON.parse(body.description);
        if (typeof body.baseStock === 'string')
            body.baseStock = JSON.parse(body.baseStock);
        if (typeof body.unitMeasure === 'string')
            body.unitMeasure = JSON.parse(body.unitMeasure);
        const baseUrl = req.protocol + '://' + req.get('host');
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(f => baseUrl + '/uploads/' + f.filename);
        }
        let urlImages = [];
        if (body.imageUrls) {
            if (typeof body.imageUrls === 'string') {
                try {
                    urlImages = JSON.parse(body.imageUrls);
                }
                catch (_a) {
                    urlImages = [body.imageUrls];
                }
            }
            else if (Array.isArray(body.imageUrls)) {
                urlImages = body.imageUrls;
            }
            urlImages = urlImages.filter((img) => img.startsWith('http://') || img.startsWith('https://'));
        }
        if (body.images) {
            let legacyImages = [];
            if (typeof body.images === 'string') {
                try {
                    legacyImages = JSON.parse(body.images);
                }
                catch (_b) {
                    legacyImages = [body.images];
                }
            }
            else if (Array.isArray(body.images)) {
                legacyImages = body.images;
            }
            legacyImages = legacyImages.filter((img) => img.startsWith('http://') || img.startsWith('https://'));
            urlImages = [...urlImages, ...legacyImages];
        }
        const allImages = [...imageUrls, ...urlImages];
        if (allImages.length)
            body.images = allImages;
        const product = yield Product_1.default.findByIdAndUpdate(req.params.id, body, { new: true });
        if (!product)
            return next({ status: 404, message: 'Product not found' });
        res.json({ success: true, data: product, message: 'Product updated' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to update product', details: err });
    }
}));
// Bulk delete products
router.delete('/bulk', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productIds } = req.body;
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return next({ status: 400, message: 'Product IDs array is required' });
        }
        const result = yield Product_1.default.deleteMany({ _id: { $in: productIds } });
        res.json({
            success: true,
            data: { deletedCount: result.deletedCount },
            message: `Successfully deleted ${result.deletedCount} products`
        });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to delete products', details: err });
    }
}));
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.default.findByIdAndDelete(req.params.id);
        if (!product)
            return next({ status: 404, message: 'Product not found' });
        res.json({ success: true, data: null, message: 'Product deleted' });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
