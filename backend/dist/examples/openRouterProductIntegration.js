"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const openRouterImageService_1 = __importStar(require("../services/openRouterImageService"));
const authMiddleware_1 = require("../utils/authMiddleware");
// Mock implementation
const imageScraperService = {
    getProductImages(name, maxImages, enableGeneration) {
        return __awaiter(this, void 0, void 0, function* () {
            // Mock implementation - returns empty array
            console.log(`Mock: Attempting to scrape images for "${name}" (max: ${maxImages}, generation: ${enableGeneration})`);
            return [];
        });
    }
};
const router = express_1.default.Router();
/**
 * Example: Enhanced product creation with AI-generated images
 * This shows how to integrate OpenRouter image generation into product workflows
 */
router.post('/create-with-ai-images', authMiddleware_1.telegramAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, categoryId, categoryName, useAIGeneration = true, maxImages = 3 } = req.body;
        if (!name) {
            res.status(400).json({
                success: false,
                error: { code: 400, message: 'Product name is required' }
            });
            return;
        }
        console.log(`🛍️ Creating product with AI images: ${name}`);
        // Step 1: Try to get images from scraping first
        let images = [];
        try {
            console.log('🔍 Attempting to scrape existing product images...');
            const scrapedImages = yield imageScraperService.getProductImages(name, maxImages, false); // Disable generation initially
            if (scrapedImages.length > 0) {
                images = scrapedImages.map((img) => ({
                    url: img.url,
                    alt: img.alt,
                    title: img.title,
                    source: 'scraped'
                }));
                console.log(`✅ Found ${images.length} scraped images`);
            }
        }
        catch (scrapeError) {
            console.warn('⚠️ Image scraping failed:', scrapeError);
        }
        // Step 2: If we don't have enough images and AI generation is enabled, generate some
        if (images.length < maxImages && useAIGeneration && openRouterImageService_1.default.isConfigured()) {
            try {
                console.log('🎨 Generating AI images to supplement scraped images...');
                const remainingCount = maxImages - images.length;
                const generatedImages = yield openRouterImageService_1.default.generateProductImages(name, categoryName, remainingCount);
                // Save generated images to file system
                const savedImages = [];
                for (let i = 0; i < generatedImages.length; i++) {
                    const image = generatedImages[i];
                    try {
                        const filename = `${name.toLowerCase().replace(/\s+/g, '-')}-ai-${i + 1}`;
                        const filePath = yield openRouterImageService_1.OpenRouterImageService.saveGeneratedImage(image, filename, 'uploads');
                        savedImages.push({
                            url: filePath.replace('uploads/', '/uploads/'), // Make it accessible via HTTP
                            alt: `AI Generated: ${name}`,
                            title: `AI Generated Product Image: ${name}`,
                            source: 'generated'
                        });
                    }
                    catch (saveError) {
                        console.warn(`⚠️ Failed to save generated image ${i + 1}:`, saveError);
                    }
                }
                images = [...images, ...savedImages];
                console.log(`✨ Added ${savedImages.length} AI-generated images`);
            }
            catch (generationError) {
                console.warn('⚠️ AI image generation failed:', generationError);
            }
        }
        // Step 3: If we still don't have images, try scraping with generation fallback
        if (images.length === 0) {
            try {
                console.log('🔄 Trying scraping with AI generation fallback...');
                const fallbackImages = yield imageScraperService.getProductImages(name, maxImages, true);
                images = fallbackImages.map((img) => ({
                    url: img.url,
                    alt: img.alt,
                    title: img.title,
                    source: img.source || 'fallback'
                }));
                console.log(`🔄 Got ${images.length} images from fallback method`);
            }
            catch (fallbackError) {
                console.warn('⚠️ Fallback image method failed:', fallbackError);
            }
        }
        // Step 4: Create the product with the collected images
        const productData = {
            name,
            description,
            categoryId,
            images: images.map(img => ({
                url: img.url,
                alt: img.alt,
                title: img.title
            })),
            // ... other product fields
        };
        console.log(`📦 Product data prepared with ${images.length} images`);
        console.log(`📊 Image sources: ${images.filter(img => img.source === 'scraped').length} scraped, ${images.filter(img => img.source === 'generated').length} generated`);
        // Here you would typically save the product to your database
        // const product = await Product.create(productData);
        res.json({
            success: true,
            data: {
                product: productData,
                images: {
                    total: images.length,
                    scraped: images.filter(img => img.source === 'scraped').length,
                    generated: images.filter(img => img.source === 'generated').length
                },
                message: 'Product created successfully with AI-enhanced images'
            }
        });
    }
    catch (error) {
        console.error('❌ Error creating product with AI images:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        });
    }
}));
/**
 * Example: Generate images for existing products
 */
router.post('/generate-images/:productId', authMiddleware_1.telegramAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const { maxImages = 3, categoryName } = req.body;
        // Here you would typically fetch the product from your database
        // const product = await Product.findById(productId);
        // if (!product) {
        //   return res.status(404).json({
        //     success: false,
        //     error: { code: 404, message: 'Product not found' }
        //   });
        // }
        // For this example, we'll use a mock product
        const product = {
            name: 'Sample Product',
            categoryName: categoryName || 'General'
        };
        console.log(`🎨 Generating images for existing product: ${product.name}`);
        if (!openRouterImageService_1.default.isConfigured()) {
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: 'OpenRouter API is not configured'
                }
            });
            return;
        }
        // Generate images
        const generatedImages = yield openRouterImageService_1.default.generateProductImages(product.name, product.categoryName, maxImages);
        // Save generated images
        const savedImages = [];
        for (let i = 0; i < generatedImages.length; i++) {
            const image = generatedImages[i];
            try {
                const filename = `${product.name.toLowerCase().replace(/\s+/g, '-')}-generated-${Date.now()}-${i + 1}`;
                const filePath = yield openRouterImageService_1.OpenRouterImageService.saveGeneratedImage(image, filename, 'uploads');
                savedImages.push({
                    url: filePath.replace('uploads/', '/uploads/'),
                    alt: `Generated: ${product.name}`,
                    title: `AI Generated: ${product.name}`,
                    source: 'generated'
                });
            }
            catch (saveError) {
                console.warn(`⚠️ Failed to save generated image ${i + 1}:`, saveError);
            }
        }
        // Here you would typically update the product with new images
        // await Product.findByIdAndUpdate(productId, {
        //   $push: { images: { $each: savedImages } }
        // });
        res.json({
            success: true,
            data: {
                productId,
                generatedImages: savedImages,
                count: savedImages.length,
                message: 'Images generated and saved successfully'
            }
        });
    }
    catch (error) {
        console.error('❌ Error generating images for product:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        });
    }
}));
/**
 * Example: Batch generate images for multiple products
 */
router.post('/batch-generate-images', authMiddleware_1.telegramAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { products, maxImagesPerProduct = 2 } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            res.status(400).json({
                success: false,
                error: { code: 400, message: 'Products array is required' }
            });
            return;
        }
        if (!openRouterImageService_1.default.isConfigured()) {
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: 'OpenRouter API is not configured'
                }
            });
            return;
        }
        console.log(`🎨 Batch generating images for ${products.length} products`);
        const results = [];
        for (const product of products) {
            try {
                console.log(`🎨 Generating images for: ${product.name}`);
                const generatedImages = yield openRouterImageService_1.default.generateProductImages(product.name, product.categoryName, maxImagesPerProduct);
                const savedImages = [];
                for (let i = 0; i < generatedImages.length; i++) {
                    const image = generatedImages[i];
                    try {
                        const filename = `${product.name.toLowerCase().replace(/\s+/g, '-')}-batch-${Date.now()}-${i + 1}`;
                        const filePath = yield openRouterImageService_1.OpenRouterImageService.saveGeneratedImage(image, filename, 'uploads');
                        savedImages.push({
                            url: filePath.replace('uploads/', '/uploads/'),
                            alt: `Generated: ${product.name}`,
                            title: `AI Generated: ${product.name}`,
                            source: 'generated'
                        });
                    }
                    catch (saveError) {
                        console.warn(`⚠️ Failed to save image for ${product.name}:`, saveError);
                    }
                }
                results.push({
                    productId: product.id,
                    productName: product.name,
                    success: true,
                    images: savedImages,
                    count: savedImages.length
                });
                // Add a small delay to avoid rate limiting
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                console.error(`❌ Error generating images for ${product.name}:`, error);
                results.push({
                    productId: product.id,
                    productName: product.name,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        const successCount = results.filter(r => r.success).length;
        const totalImages = results.reduce((sum, r) => sum + (r.count || 0), 0);
        res.json({
            success: true,
            data: {
                results,
                summary: {
                    totalProducts: products.length,
                    successfulProducts: successCount,
                    failedProducts: products.length - successCount,
                    totalImagesGenerated: totalImages
                },
                message: `Batch generation completed: ${successCount}/${products.length} products processed successfully`
            }
        });
    }
    catch (error) {
        console.error('❌ Error in batch image generation:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        });
    }
}));
exports.default = router;
