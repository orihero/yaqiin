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
exports.ExcelImportService = void 0;
const XLSX = __importStar(require("xlsx"));
const openai_1 = __importDefault(require("openai"));
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const CategoryAttribute_1 = __importDefault(require("../models/CategoryAttribute"));
const openRouterImageService_1 = __importStar(require("./openRouterImageService"));
const constants_1 = require("./excelImport/constants");
const categoryService_1 = require("./excelImport/categoryService");
const WorkQueue_1 = require("./excelImport/WorkQueue");
const utils_1 = require("./excelImport/utils");
const rateLimitService_1 = require("./excelImport/rateLimitService");
const productCategoryMapping_1 = require("./excelImport/productCategoryMapping");
/**
 * Excel Import Service
 *
 * Features:
 * - Index-based category assignment: Uses predefined category structure with start/end indexes
 * - Automatic category creation: Creates categories based on predefined structure
 * - Brand field support: Extracts and assigns brand information to products
 * - Comprehensive product descriptions with HTML markup and emojis
 * - Selective translation (only Russian words to Uzbek, preserving other languages)
 * - Zero-price product filtering
 * - Optional AI image generation
 * - Category checking mode: Verifies and corrects categories for existing products
 *
 * Import Process:
 * 1. Parse products from Excel file
 * 2. For each product, determine category based on its index in the Excel file
 * 3. Create categories if they don't exist
 * 4. Import products with enhanced descriptions, brand info, and optional image generation
 *
 * Category Checking Mode:
 * When EXCEL_IMPORT_CHECK_CATEGORIES is enabled, the service will:
 * 1. Check all existing products in the database
 * 2. Find their correct category based on their position in the Excel file
 * 3. Update products with incorrect categories
 * 4. Log all category corrections made
 *
 * IMPORTANT: Categories are automatically created based on the predefined structure.
 * No manual category creation is required.
 *
 * Environment Variables:
 * - EXCEL_IMPORT_GENERATE_IMAGES: Set to 'true' to enable AI image generation during import (default: disabled)
 * - EXCEL_IMPORT_LIMIT: Maximum number of products to import per batch (default: 500)
 * - EXCEL_IMPORT_CHECK_CATEGORIES: Set to 'true' to enable category checking mode (default: disabled)
 * - OPENROUTER_API_KEY: API key for OpenRouter service (required for image generation)
 * - OPENROUTER_BASE_URL: Base URL for OpenRouter API (default: https://openrouter.ai/api/v1)
 * - OPENROUTER_IMAGE_GEN_MODEL: AI model for image generation (default: google/gemini-2.5-flash-image-preview)
 */
class ExcelImportService {
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: process.env.OPENROUTER_BASE_URL || constants_1.DEFAULT_CONFIG.OPENROUTER_BASE_URL,
        });
        this.categoryService = new categoryService_1.CategoryService();
        this.rateLimitService = new rateLimitService_1.RateLimitService();
        // Log the total number of available API keys
        console.log(`🔑 ExcelImportService initialized with ${this.rateLimitService.getTotalKeys()} API keys`);
    }
    /**
     * Get all categories with attributes (delegated to CategoryService)
     */
    getAllCategoriesWithAttributes() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.categoryService.getAllCategoriesWithAttributes();
        });
    }
    /**
     * Create comprehensive categories (delegated to CategoryService)
     */
    createComprehensiveCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.categoryService.createComprehensiveCategories();
        });
    }
    /**
     * Check categories for existing products (public method for direct access)
     * This can be called independently of the import process
     */
    checkCategoriesOnly(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`🔍 Running category checking only mode...`);
            return this.checkAndCorrectCategories(filePath);
        });
    }
    /**
     * Pre-create all categories from the product category mapping using bulk operations
     * This ensures all categories exist before starting multi-threaded import
     */
    preCreateAllCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`🏗️ Pre-creating all categories from product category mapping using bulk operations...`);
                const results = {
                    success: true,
                    created: 0,
                    existing: 0,
                    errors: []
                };
                // Import the product category structure
                const { PRODUCT_CATEGORY_STRUCTURE } = yield Promise.resolve().then(() => __importStar(require('./excelImport/productCategoryMapping')));
                // Build a map of all unique categories
                const allCategories = new Map();
                for (const category of PRODUCT_CATEGORY_STRUCTURE) {
                    const key = category.name.ru;
                    if (!allCategories.has(key)) {
                        allCategories.set(key, category);
                    }
                }
                console.log(`📊 Found ${allCategories.size} unique categories to create/verify`);
                // Separate categories into 3 levels
                const mainCategories = Array.from(allCategories.values()).filter(cat => !cat.parentCategory);
                // Subcategories are those that have main categories as parents
                const subCategories = Array.from(allCategories.values()).filter(cat => cat.parentCategory && mainCategories.some(main => main.name.ru === cat.parentCategory));
                // Brand categories are those that have subcategories as parents
                const brandCategories = Array.from(allCategories.values()).filter(cat => cat.parentCategory && subCategories.some(sub => sub.name.ru === cat.parentCategory));
                console.log(`📂 Main categories: ${mainCategories.length}`);
                console.log(`📁 Sub categories: ${subCategories.length}`);
                console.log(`🏷️ Brand categories: ${brandCategories.length}`);
                // Step 1: Bulk create main categories
                console.log(`\n🏗️ Step 1: Bulk creating main categories...`);
                const mainResults = yield this.bulkCreateCategories(mainCategories, null);
                results.created += mainResults.created;
                results.existing += mainResults.existing;
                results.errors.push(...mainResults.errors);
                // Step 2: Bulk create subcategories
                console.log(`\n🏗️ Step 2: Bulk creating subcategories...`);
                const subResults = yield this.bulkCreateCategories(subCategories, mainCategories);
                results.created += subResults.created;
                results.existing += subResults.existing;
                results.errors.push(...subResults.errors);
                // Step 3: Bulk create brand categories
                console.log(`\n🏗️ Step 3: Bulk creating brand categories...`);
                const brandResults = yield this.bulkCreateCategories(brandCategories, subCategories);
                results.created += brandResults.created;
                results.existing += brandResults.existing;
                results.errors.push(...brandResults.errors);
                console.log(`\n🎉 Category pre-creation completed!`);
                console.log(`🆕 Categories created: ${results.created}`);
                console.log(`✅ Categories already existed: ${results.existing}`);
                console.log(`❌ Errors: ${results.errors.length}`);
                if (results.errors.length > 0) {
                    console.log(`\n❌ Errors encountered:`);
                    results.errors.forEach((error, index) => {
                        console.log(`${index + 1}. ${error}`);
                    });
                }
                return results;
            }
            catch (error) {
                console.error(`❌ Error in category pre-creation:`, error);
                return {
                    success: false,
                    created: 0,
                    existing: 0,
                    errors: [error.message || 'Unknown error']
                };
            }
        });
    }
    /**
     * Bulk create categories with proper parent relationships
     */
    bulkCreateCategories(categories, parentCategories) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = {
                created: 0,
                existing: 0,
                errors: []
            };
            if (categories.length === 0) {
                return results;
            }
            try {
                // Get existing categories from database
                const categoryNames = categories.map(cat => cat.name.ru);
                const existingCategories = yield Category_1.default.find({
                    "name.ru": { $in: categoryNames }
                }).lean();
                const existingCategoryNames = new Set(existingCategories.map(cat => cat.name.ru));
                // Filter out existing categories
                const categoriesToCreate = categories.filter(cat => !existingCategoryNames.has(cat.name.ru));
                results.existing = categories.length - categoriesToCreate.length;
                console.log(`✅ ${results.existing} categories already exist`);
                if (categoriesToCreate.length === 0) {
                    console.log(`⏭️ No new categories to create`);
                    return results;
                }
                console.log(`🆕 Creating ${categoriesToCreate.length} new categories...`);
                // Prepare bulk insert data
                const bulkInsertData = [];
                for (const category of categoriesToCreate) {
                    let parentCategoryId;
                    // Find parent category ID if parent is specified
                    if (category.parentCategory && parentCategories) {
                        const parentCategory = parentCategories.find(p => p.name.ru === category.parentCategory);
                        if (parentCategory) {
                            // Find the parent category in database
                            const parentInDb = yield Category_1.default.findOne({
                                "name.ru": parentCategory.name.ru
                            });
                            if (parentInDb) {
                                parentCategoryId = parentInDb._id.toString();
                            }
                        }
                    }
                    bulkInsertData.push({
                        name: category.name,
                        description: {
                            ru: `Категория: ${category.name.ru}`,
                            uz: `Тоифа: ${category.name.uz}`
                        },
                        parentId: parentCategoryId,
                        isActive: true,
                        attributes: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
                // Perform bulk insert
                if (bulkInsertData.length > 0) {
                    yield Category_1.default.insertMany(bulkInsertData, { ordered: false });
                    results.created = bulkInsertData.length;
                    console.log(`✅ Bulk created ${results.created} categories`);
                }
            }
            catch (error) {
                console.error(`❌ Error in bulk category creation:`, error);
                results.errors.push(`Bulk creation error: ${error.message}`);
            }
            return results;
        });
    }
    /**
     * Check and correct categories for existing products
     * This method is used when EXCEL_IMPORT_CHECK_CATEGORIES is enabled
     */
    checkAndCorrectCategories(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`🔍 Starting category checking and correction process...`);
                console.log(`📁 Excel file: ${filePath}`);
                // Parse products from Excel file to get the correct order
                const excelProducts = yield this.parseExcelFile(filePath);
                console.log(`📊 Found ${excelProducts.length} products in Excel file`);
                // Get all existing products from database
                const existingProducts = yield Product_1.default.find({ isActive: true })
                    .populate('categoryId', 'name')
                    .lean();
                console.log(`📋 Found ${existingProducts.length} existing products in database`);
                const results = {
                    success: true,
                    checked: 0,
                    corrected: 0,
                    errors: [],
                    corrections: []
                };
                // Create a map of product names to their Excel index for quick lookup
                const productNameToIndex = new Map();
                excelProducts.forEach((product, index) => {
                    productNameToIndex.set(product.name, index + 1); // +1 because Excel is 1-indexed
                });
                console.log(`🔄 Checking categories for existing products...`);
                for (const existingProduct of existingProducts) {
                    try {
                        results.checked++;
                        const productName = existingProduct.name.ru;
                        const currentCategoryName = existingProduct.categoryId ? existingProduct.categoryId.name.ru : 'No Category';
                        // Find the product's index in the Excel file
                        const excelIndex = productNameToIndex.get(productName);
                        if (excelIndex === undefined) {
                            console.warn(`⚠️ Product "${productName}" not found in Excel file, skipping`);
                            continue;
                        }
                        // Find the correct category based on Excel index
                        const correctCategoryRange = (0, productCategoryMapping_1.findCategoryByIndex)(excelIndex);
                        if (!correctCategoryRange) {
                            console.warn(`⚠️ No category found for product "${productName}" at index ${excelIndex}, skipping`);
                            continue;
                        }
                        const correctCategoryName = correctCategoryRange.name.ru;
                        // Check if the category needs to be corrected
                        if (currentCategoryName !== correctCategoryName) {
                            console.log(`🔄 Correcting category for "${productName}":`);
                            console.log(`   Old: ${currentCategoryName}`);
                            console.log(`   New: ${correctCategoryName}`);
                            // Create or find the correct category
                            const categoryResult = yield this.createOrFindCategory(correctCategoryRange);
                            const correctCategoryId = categoryResult.id;
                            // Update the product with the correct category
                            yield Product_1.default.findByIdAndUpdate(existingProduct._id, {
                                categoryId: correctCategoryId
                            });
                            results.corrected++;
                            results.corrections.push({
                                productName,
                                oldCategory: currentCategoryName,
                                newCategory: correctCategoryName
                            });
                            console.log(`✅ Updated category for "${productName}" to "${correctCategoryName}"`);
                        }
                        else {
                            console.log(`✅ Category is correct for "${productName}": ${currentCategoryName}`);
                        }
                    }
                    catch (error) {
                        console.error(`❌ Error checking category for product "${existingProduct.name.ru}":`, error);
                        results.errors.push(`Failed to check product "${existingProduct.name.ru}": ${error.message}`);
                    }
                }
                console.log(`\n🎉 Category checking completed!`);
                console.log(`📊 Products checked: ${results.checked}`);
                console.log(`🔄 Categories corrected: ${results.corrected}`);
                console.log(`❌ Errors: ${results.errors.length}`);
                if (results.corrections.length > 0) {
                    console.log(`\n📝 Category Corrections Made:`);
                    console.log(`═══════════════════════════════════════`);
                    results.corrections.forEach((correction, index) => {
                        console.log(`${index + 1}. ${correction.productName}`);
                        console.log(`   ${correction.oldCategory} → ${correction.newCategory}`);
                    });
                }
                return results;
            }
            catch (error) {
                console.error(`❌ Error in category checking process:`, error);
                return {
                    success: false,
                    checked: 0,
                    corrected: 0,
                    errors: [error.message || 'Unknown error'],
                    corrections: []
                };
            }
        });
    }
    /**
     * Print thread performance summary
     */
    printThreadPerformanceSummary(threadStatus) {
        console.log(`\n📊 Thread Performance Summary:`);
        console.log(`═══════════════════════════════════════`);
        threadStatus.forEach((status, threadId) => {
            var _a;
            const duration = status.startTime && status.endTime
                ? status.endTime.getTime() - status.startTime.getTime()
                : 0;
            const durationMinutes = Math.round(duration / 1000 / 60 * 100) / 100;
            const avgTimePerProduct = status.processed > 0 ? Math.round(duration / status.processed) : 0;
            console.log(`Thread ${threadId}:`);
            console.log(`  Status: ${status.status}`);
            console.log(`  Processed: ${status.processed} products`);
            console.log(`  Errors: ${status.errors}`);
            console.log(`  Duration: ${durationMinutes} minutes`);
            console.log(`  Avg time per product: ${avgTimePerProduct}ms`);
            console.log(`  Current product: ${((_a = status.currentProduct) === null || _a === void 0 ? void 0 : _a.name) || 'None'}`);
            console.log(``);
        });
    }
    parseExcelFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                console.log(`📖 Reading Excel file: ${filePath}`);
                const workbook = XLSX.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                console.log(`📄 Using sheet: ${sheetName}`);
                const worksheet = workbook.Sheets[sheetName];
                // Convert to JSON with headers
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                console.log(`📊 Total rows in Excel: ${jsonData.length}`);
                // Skip header rows and find data rows
                const products = [];
                let zeroPriceCount = 0;
                for (let i = 2; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length < 3)
                        continue;
                    const code = ((_a = row[0]) === null || _a === void 0 ? void 0 : _a.toString()) || "";
                    const name = ((_b = row[1]) === null || _b === void 0 ? void 0 : _b.toString()) || "";
                    const price = parseFloat(row[2]) || 0;
                    // Skip rows with no code or price (category headers or zero-price products)
                    if (!code || price === 0) {
                        // Skip zero-price products
                        if (price === 0 && code) {
                            zeroPriceCount++;
                            console.log(`⏭️ Skipping product with zero price: ${name} (${code})`);
                        }
                        continue;
                    }
                    // This is a product row
                    products.push({
                        code,
                        name,
                        price,
                    });
                }
                console.log(`✅ Excel parsing completed. Found ${products.length} products`);
                console.log(`⏭️ Skipped ${zeroPriceCount} products with zero price`);
                return products;
            }
            catch (error) {
                console.error("❌ Error parsing Excel file:", error);
                throw new Error("Failed to parse Excel file");
            }
        });
    }
    enhanceProductWithIndex(product, productIndex, threadNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`📊 Starting index-based enhancement for product: ${product.name} (index: ${productIndex})`);
                // Generate product images using OpenRouter (if enabled)
                console.log(`🎨 Image generation enabled: ${process.env.EXCEL_IMPORT_GENERATE_IMAGES === 'true'}`);
                let generatedImages = [];
                try {
                    if (process.env.EXCEL_IMPORT_GENERATE_IMAGES === 'true' && openRouterImageService_1.default.isConfigured()) {
                        console.log(`🎨 Generating images for: ${product.name}`);
                        generatedImages = yield openRouterImageService_1.default.generateProductImages(product.name, undefined, 3);
                        console.log(`✅ Generated ${generatedImages.length} images for: ${product.name}`);
                    }
                    else {
                        if (process.env.EXCEL_IMPORT_GENERATE_IMAGES !== 'true') {
                            console.log(`⏭️ Image generation disabled via EXCEL_IMPORT_GENERATE_IMAGES env var for: ${product.name}`);
                        }
                        else {
                            console.warn(`⚠️ OpenRouter not configured, skipping image generation for: ${product.name}`);
                        }
                    }
                }
                catch (error) {
                    console.error(`❌ Error generating images for ${product.name}:`, error);
                    generatedImages = [];
                }
                // Save generated images to file system
                let savedImageUrls = [];
                if (generatedImages.length > 0) {
                    console.log(`💾 Saving ${generatedImages.length} generated images to file system...`);
                    for (let i = 0; i < generatedImages.length; i++) {
                        const image = generatedImages[i];
                        try {
                            const filename = `${product.name.toLowerCase().replace(/\s+/g, '-')}-generated-${Date.now()}-${i + 1}`;
                            const filePath = yield openRouterImageService_1.OpenRouterImageService.saveGeneratedImage({ url: image.image_url.url, type: 'image_url', image_url: { url: image.image_url.url } }, filename, 'uploads');
                            // Convert file path to HTTP URL - handle both Windows and Unix paths
                            const pathParts = filePath.replace(/\\/g, '/').split('/');
                            const fileName = pathParts[pathParts.length - 1] || '';
                            const apiUrl = process.env.API_URL || 'http://localhost:8080';
                            const httpUrl = `${apiUrl}/uploads/${fileName}`;
                            console.log(`📁 File saved at: ${filePath}`);
                            console.log(`🌐 HTTP URL: ${httpUrl}`);
                            savedImageUrls.push(httpUrl);
                            console.log(`✅ Saved generated image: ${httpUrl}`);
                        }
                        catch (saveError) {
                            console.warn(`⚠️ Failed to save generated image ${i + 1}:`, saveError);
                        }
                    }
                }
                // Extract weight/quantity information from product name
                const { unit: detectedUnit, quantity: detectedQuantity } = (0, utils_1.extractProductInfo)(product.name);
                // Find category based on product index
                const categoryRange = (0, productCategoryMapping_1.findCategoryByIndex)(productIndex);
                if (!categoryRange) {
                    console.warn(`⚠️ No category found for product index ${productIndex}: ${product.name}`);
                    throw new Error(`No category found for product index ${productIndex}`);
                }
                console.log(`📂 Found category: ${categoryRange.name.ru} (${categoryRange.name.uz}) for product: ${product.name}`);
                // Find the category in database (should already exist from pre-creation)
                let categoryId;
                try {
                    const category = yield Category_1.default.findOne({
                        "name.ru": categoryRange.name.ru,
                        "name.uz": categoryRange.name.uz
                    });
                    if (category) {
                        categoryId = category._id.toString();
                        console.log(`✅ Found existing category: ${categoryRange.name.ru} (ID: ${categoryId}) for ${product.name}`);
                    }
                    else {
                        // Fallback: create category if it doesn't exist (shouldn't happen after pre-creation)
                        console.warn(`⚠️ Category not found after pre-creation, creating: ${categoryRange.name.ru}`);
                        const categoryResult = yield this.createOrFindCategory(categoryRange);
                        categoryId = categoryResult.id;
                        console.log(`🆕 Created fallback category: ${categoryRange.name.ru} (ID: ${categoryId}) for ${product.name}`);
                    }
                }
                catch (error) {
                    console.error(`❌ Error finding category for ${product.name}:`, error);
                    throw error;
                }
                // Use the first saved generated image as the product image
                const finalImageUrl = savedImageUrls.length > 0 ? savedImageUrls[0] : "";
                console.log(`🖼️ Final image URL for product: ${finalImageUrl}`);
                const enhancedProduct = {
                    code: product.code,
                    name: {
                        ru: product.name,
                        uz: (0, utils_1.generateFallbackUzbekName)(product.name),
                    },
                    brand: this.extractBrandFromName(product.name),
                    description: {
                        ru: (0, utils_1.generateFallbackDescriptionRu)(product.name),
                        uz: (0, utils_1.generateFallbackDescriptionUz)(product.name),
                    },
                    price: product.price,
                    unit: detectedUnit,
                    imageUrl: finalImageUrl,
                    categoryId: categoryId,
                    attributes: []
                };
                console.log(`✅ Index-based enhancement completed for: ${product.name}`);
                console.log(`📝 Enhanced data:`, {
                    name_uz: enhancedProduct.name.uz,
                    brand: enhancedProduct.brand,
                    unit: enhancedProduct.unit,
                    category_id: enhancedProduct.categoryId,
                    attributes_count: enhancedProduct.attributes.length,
                    has_image: !!enhancedProduct.imageUrl,
                    image_url: enhancedProduct.imageUrl,
                });
                return enhancedProduct;
            }
            catch (error) {
                console.error(`❌ Error enhancing product with index for: ${product.name}`, error);
                return {
                    code: product.code,
                    name: {
                        ru: product.name,
                        uz: (0, utils_1.generateFallbackUzbekName)(product.name),
                    },
                    description: {
                        ru: (0, utils_1.generateFallbackDescriptionRu)(product.name),
                        uz: (0, utils_1.generateFallbackDescriptionUz)(product.name),
                    },
                    price: product.price,
                    unit: (0, utils_1.detectUnitFromName)(product.name),
                    imageUrl: "",
                    categoryId: undefined,
                    attributes: []
                };
            }
        });
    }
    /**
     * Create or find a category in the database based on category range
     * Returns the category ID and whether it was newly created
     */
    createOrFindCategory(categoryRange) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First, try to find existing category
                let category = yield Category_1.default.findOne({
                    "name.ru": categoryRange.name.ru,
                    "name.uz": categoryRange.name.uz
                });
                if (category) {
                    return { id: category._id.toString(), wasCreated: false };
                }
                // If not found, create new category
                console.log(`📝 Creating new category: ${categoryRange.name.ru} (${categoryRange.name.uz})`);
                // Find parent category if specified
                let parentCategoryId;
                if (categoryRange.parentCategory) {
                    const parentCategory = yield Category_1.default.findOne({
                        "name.ru": categoryRange.parentCategory
                    });
                    if (parentCategory) {
                        parentCategoryId = parentCategory._id.toString();
                        console.log(`📂 Found parent category: ${categoryRange.parentCategory} (ID: ${parentCategoryId})`);
                    }
                    else {
                        console.warn(`⚠️ Parent category not found: ${categoryRange.parentCategory}`);
                    }
                }
                const newCategory = yield Category_1.default.create({
                    name: categoryRange.name,
                    description: {
                        ru: `Категория: ${categoryRange.name.ru}`,
                        uz: `Тоифа: ${categoryRange.name.uz}`
                    },
                    parentId: parentCategoryId,
                    isActive: true,
                    attributes: []
                });
                console.log(`✅ Created new category: ${categoryRange.name.ru} (ID: ${newCategory._id})`);
                return { id: newCategory._id.toString(), wasCreated: true };
            }
            catch (error) {
                console.error(`❌ Error creating/finding category:`, error);
                throw error;
            }
        });
    }
    /**
     * Extract brand information from product name
     */
    extractBrandFromName(productName) {
        // Common brand patterns
        const brandPatterns = [
            'Persil', 'Ariel', 'Losk', 'Tide', 'Fairy', 'Cif', 'Domestos', 'Vanish',
            'Lenor', 'Aos', 'Colgate', 'Sensodyne', 'Oral-B', 'Nivea', 'Dove',
            'Palmolive', 'Gillette', 'Schick', 'Bic', 'Coca Cola', 'Pepsi',
            'Fanta', 'Sprite', 'Milka', 'Kit Kat', 'Snickers', 'Mars'
        ];
        for (const brand of brandPatterns) {
            if (productName.toLowerCase().includes(brand.toLowerCase())) {
                return {
                    ru: brand,
                    uz: brand // Keep brand names in original language
                };
            }
        }
        return undefined;
    }
    createOrUpdateCategoryAttribute(categoryId, attributeName, attributeValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if attribute already exists for this category
                let existingAttribute = yield CategoryAttribute_1.default.findOne({
                    categoryId,
                    "name.ru": attributeName.ru,
                    "name.uz": attributeName.uz,
                });
                if (existingAttribute) {
                    // Update existing attribute
                    existingAttribute.value = attributeValue;
                    yield existingAttribute.save();
                    console.log(`✅ Updated existing attribute: ${attributeName.ru} for category ${categoryId}`);
                    return existingAttribute._id.toString();
                }
                else {
                    // Create new attribute
                    const newAttribute = yield CategoryAttribute_1.default.create({
                        name: attributeName,
                        value: attributeValue,
                        categoryId,
                        isActive: true,
                    });
                    // Add attribute to category
                    yield Category_1.default.findByIdAndUpdate(categoryId, {
                        $addToSet: { attributes: newAttribute._id }
                    });
                    console.log(`✅ Created new attribute: ${attributeName.ru} for category ${categoryId}`);
                    return newAttribute._id.toString();
                }
            }
            catch (error) {
                console.error(`❌ Error creating/updating category attribute:`, error);
                throw new Error("Failed to create/update category attribute");
            }
        });
    }
    importProducts(filePath_1) {
        return __awaiter(this, arguments, void 0, function* (filePath, limit = constants_1.DEFAULT_CONFIG.EXCEL_IMPORT_LIMIT) {
            try {
                console.log(`🚀 Starting Excel import process from file: ${filePath}`);
                console.log(`📊 Import limit: ${limit === -1 ? "All products" : limit}`);
                console.log(`🎨 Image generation: ${process.env.EXCEL_IMPORT_GENERATE_IMAGES === 'true' ? 'ENABLED' : 'DISABLED'}`);
                console.log(`🔍 Category checking: ${process.env.EXCEL_IMPORT_CHECK_CATEGORIES === 'true' ? 'ENABLED' : 'DISABLED'}`);
                if (process.env.EXCEL_IMPORT_GENERATE_IMAGES === 'true') {
                    console.log(`🎨 Image generation model: ${openRouterImageService_1.default.getImageGenModel()}`);
                }
                // Step 0: Category checking mode (if enabled)
                if (process.env.EXCEL_IMPORT_CHECK_CATEGORIES === 'true') {
                    console.log(`\n🔍 STEP 0: Category checking mode enabled - checking existing products...`);
                    const categoryCheckResults = yield this.checkAndCorrectCategories(filePath);
                    if (categoryCheckResults.success) {
                        console.log(`✅ Category checking completed successfully!`);
                        console.log(`📊 Products checked: ${categoryCheckResults.checked}`);
                        console.log(`🔄 Categories corrected: ${categoryCheckResults.corrected}`);
                        if (categoryCheckResults.errors.length > 0) {
                            console.log(`❌ Category checking errors: ${categoryCheckResults.errors.length}`);
                        }
                    }
                    else {
                        console.error(`❌ Category checking failed:`, categoryCheckResults.errors);
                    }
                    // If we're only doing category checking, return early
                    if (limit === 0) {
                        console.log(`🔍 Category checking mode only - skipping product import`);
                        return {
                            success: categoryCheckResults.success,
                            imported: 0,
                            errors: categoryCheckResults.errors,
                            message: `Category checking completed. Checked: ${categoryCheckResults.checked}, Corrected: ${categoryCheckResults.corrected}`,
                        };
                    }
                }
                // Step 0.5: Pre-create all categories to prevent duplicate creation in threads
                console.log(`\n🏗️ STEP 0.5: Pre-creating all categories to prevent duplicate creation...`);
                const categoryPreCreationResults = yield this.preCreateAllCategories();
                if (categoryPreCreationResults.success) {
                    console.log(`✅ Category pre-creation completed successfully!`);
                    console.log(`🆕 Categories created: ${categoryPreCreationResults.created}`);
                    console.log(`✅ Categories already existed: ${categoryPreCreationResults.existing}`);
                    if (categoryPreCreationResults.errors.length > 0) {
                        console.log(`❌ Category pre-creation errors: ${categoryPreCreationResults.errors.length}`);
                    }
                }
                else {
                    console.error(`❌ Category pre-creation failed:`, categoryPreCreationResults.errors);
                    // Continue with import even if some categories failed to create
                }
                // Step 1: Parse products from Excel file
                console.log(`\n📋 STEP 1: Parsing products from Excel file...`);
                const products = yield this.parseExcelFile(filePath);
                console.log(`📋 Found ${products.length} products in Excel file`);
                const productsToProcess = limit === -1 ? products : products.slice(0, limit);
                console.log(`⚙️ Will process ${productsToProcess.length} products`);
                // Step 2: Multi-threaded import with index-based category assignment
                console.log(`\n🧵 STEP 2: Starting multi-threaded import with index-based category assignment...`);
                const results = yield this.importProductsMultiThreaded(productsToProcess);
                console.log(`\n🎉 Import process completed!`);
                console.log(`✅ Successfully imported: ${results.imported} products`);
                console.log(`❌ Errors: ${results.errors.length}`);
                console.log(`🎨 Image generation: ${process.env.EXCEL_IMPORT_GENERATE_IMAGES === 'true' ? 'ENABLED' : 'DISABLED'}`);
                console.log(`🔍 Category checking: ${process.env.EXCEL_IMPORT_CHECK_CATEGORIES === 'true' ? 'ENABLED' : 'DISABLED'}`);
                results.message = `Successfully imported ${results.imported} products using index-based category assignment. ${results.errors.length} errors occurred.`;
                // Print performance report
                console.log(`\n📊 ===== IMPORT PERFORMANCE REPORT =====`);
                this.rateLimitService.printPerformanceReport();
                this.rateLimitService.printRateLimitStatus();
                console.log(`📊 ======================================\n`);
                return results;
            }
            catch (error) {
                console.error("Error in import process:", error);
                return {
                    success: false,
                    imported: 0,
                    errors: [error.message || "Unknown error"],
                    message: "Import failed",
                };
            }
        });
    }
    findResumeIndex(products) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`🔍 Finding the last inserted product in database...`);
                // Get the most recently created product from the database
                const lastInsertedProduct = yield Product_1.default.findOne()
                    .sort({ createdAt: -1 })
                    .select('name.ru createdAt')
                    .lean();
                if (!lastInsertedProduct) {
                    console.log(`📋 No products found in database, starting from beginning`);
                    return -1;
                }
                const lastProductName = lastInsertedProduct.name.ru;
                console.log(`📋 Last inserted product: "${lastProductName}" (created: ${lastInsertedProduct.createdAt})`);
                // Find this product in the Excel file
                const productIndex = products.findIndex(product => product.name === lastProductName);
                if (productIndex === -1) {
                    console.log(`⚠️ Last inserted product "${lastProductName}" not found in Excel file`);
                    console.log(`📋 Starting from beginning (product may have been manually added or Excel file changed)`);
                    return -1;
                }
                console.log(`✅ Found last inserted product at index ${productIndex} in Excel file`);
                return productIndex;
            }
            catch (error) {
                console.error(`❌ Error finding resume index:`, error);
                console.log(`📋 Starting from beginning due to error`);
                return -1;
            }
        });
    }
    importProductsMultiThreaded(products) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const totalProducts = products.length;
            const results = {
                success: true,
                imported: 0,
                errors: [],
                message: "",
            };
            if (totalProducts === 0) {
                return results;
            }
            // Find the last inserted product and determine where to resume
            console.log(`🔍 Finding last inserted product to determine resume point...`);
            const resumeIndex = yield this.findResumeIndex(products);
            if (resumeIndex === -1) {
                console.log(`📋 No previous import found, starting from beginning`);
            }
            else {
                console.log(`📋 Resuming from product at index ${resumeIndex}: ${(_a = products[resumeIndex]) === null || _a === void 0 ? void 0 : _a.name}`);
                console.log(`⏭️ Skipping ${resumeIndex} already imported products`);
            }
            // Filter products to only include those after the resume point
            const productsToProcess = resumeIndex === -1 ? products : products.slice(resumeIndex + 1);
            console.log(`⚙️ Will process ${productsToProcess.length} products (${totalProducts - productsToProcess.length} already imported)`);
            if (productsToProcess.length === 0) {
                console.log(`✅ All products have already been imported!`);
                results.message = "All products have already been imported";
                return results;
            }
            // Calculate optimal thread count based on rate limits
            const optimalThreadCount = this.rateLimitService.getOptimalThreadCount();
            const distributionStats = this.rateLimitService.getKeyDistributionStats(optimalThreadCount);
            console.log(`🧵 Using ${optimalThreadCount} threads (rate-limit optimized)`);
            console.log(`🔑 Available API keys: ${distributionStats.totalKeys}`);
            console.log(`📊 Key distribution analysis:`);
            console.log(`   Base threads per key: ${distributionStats.threadsPerKey}`);
            console.log(`   Evenly distributed: ${distributionStats.isEvenlyDistributed ? 'Yes' : 'No'}`);
            // Show detailed distribution
            distributionStats.distribution.forEach(stat => {
                const keyConfig = this.rateLimitService.getApiKeyConfigs()[stat.keyIndex];
                console.log(`   Key ${stat.keyIndex + 1} (${keyConfig.model}): ${stat.threadCount} threads (${stat.percentage}%)`);
            });
            // Create work queue system
            const workQueue = new WorkQueue_1.WorkQueue(productsToProcess);
            const threadStatus = new Map();
            // Initialize thread status tracking
            for (let i = 1; i <= optimalThreadCount; i++) {
                threadStatus.set(i, {
                    id: i,
                    status: 'idle',
                    currentProduct: null,
                    processed: 0,
                    errors: 0,
                    startTime: null,
                    endTime: null
                });
            }
            // Create abort controllers for each thread
            const abortControllers = Array.from({ length: optimalThreadCount }, () => new AbortController());
            // Create promises for each thread with work queue
            const threadTimeout = constants_1.DEFAULT_CONFIG.THREAD_TIMEOUT_MS;
            const threadPromises = Array.from({ length: optimalThreadCount }, (_, index) => this.processProductThreadWithWorkQueue(workQueue, index + 1, threadStatus, abortControllers[index].signal, threadTimeout));
            // Circuit breaker: if more than half of threads fail, cancel remaining threads
            let criticalFailureCount = 0;
            const maxCriticalFailures = Math.ceil(optimalThreadCount / 2);
            try {
                // Use Promise.allSettled to handle individual thread failures gracefully
                const threadResults = yield Promise.allSettled(threadPromises);
                // Process results from all threads
                for (let i = 0; i < threadResults.length; i++) {
                    const result = threadResults[i];
                    const threadNumber = i + 1;
                    if (result.status === 'fulfilled') {
                        const threadResult = result.value;
                        results.imported += threadResult.imported;
                        results.errors.push(...threadResult.errors);
                        console.log(`✅ Thread ${threadNumber}: Completed successfully - Imported: ${threadResult.imported}, Errors: ${threadResult.errors.length}`);
                    }
                    else {
                        // Thread failed or was rejected
                        const error = result.reason;
                        results.success = false;
                        if (error.name === 'AbortError') {
                            console.log(`🛑 Thread ${threadNumber}: Was cancelled due to critical error`);
                            results.errors.push(`Thread ${threadNumber} was cancelled due to critical error`);
                        }
                        else {
                            console.error(`❌ Thread ${threadNumber}: Failed with error:`, error);
                            results.errors.push(`Thread ${threadNumber} failed: ${error.message || "Unknown error"}`);
                            // Increment critical failure count for circuit breaker
                            criticalFailureCount++;
                            // If we have too many critical failures, cancel remaining threads
                            if (criticalFailureCount >= maxCriticalFailures) {
                                console.error(`🚨 Circuit breaker triggered: ${criticalFailureCount} threads failed, cancelling remaining threads...`);
                                // Cancel all remaining threads
                                abortControllers.forEach((controller, index) => {
                                    if (!controller.signal.aborted) {
                                        controller.abort();
                                        console.log(`🛑 Thread ${index + 1}: Cancelled by circuit breaker`);
                                    }
                                });
                                results.errors.push(`Circuit breaker triggered: ${criticalFailureCount} threads failed, remaining threads cancelled`);
                                break; // Exit the loop early
                            }
                        }
                    }
                }
                console.log(`🎉 Multi-threaded import completed!`);
                console.log(`📊 Work Queue Status: ${workQueue.getProcessedCount()} processed, ${workQueue.getRemainingCount()} remaining`);
                console.log(`✅ Total imported: ${results.imported} products`);
                console.log(`❌ Total errors: ${results.errors.length}`);
                // Print thread performance summary
                this.printThreadPerformanceSummary(threadStatus);
                // If any thread failed, mark overall as unsuccessful
                if (criticalFailureCount > 0) {
                    results.success = false;
                    results.message = `Import completed with issues: ${optimalThreadCount - criticalFailureCount} threads succeeded, ${criticalFailureCount} failed`;
                    // Add detailed error summary
                    if (criticalFailureCount >= maxCriticalFailures) {
                        results.message += ` (Circuit breaker triggered after ${criticalFailureCount} failures)`;
                    }
                }
            }
            catch (error) {
                console.error("❌ Critical error in multi-threaded import:", error);
                // Cancel all remaining threads
                console.log(`🛑 Cancelling all remaining threads due to critical error...`);
                abortControllers.forEach((controller, index) => {
                    if (!controller.signal.aborted) {
                        controller.abort();
                        console.log(`🛑 Thread ${index + 1}: Cancelled`);
                    }
                });
                results.success = false;
                results.errors.push(`Critical error in multi-threaded import: ${error.message || "Unknown error"}`);
            }
            // Print performance report
            console.log(`\n📊 ===== IMPORT PERFORMANCE REPORT =====`);
            this.rateLimitService.printPerformanceReport();
            this.rateLimitService.printRateLimitStatus();
            console.log(`📊 ======================================\n`);
            return results;
        });
    }
    processProductThreadWithWorkQueue(workQueue_1, threadNumber_1, threadStatus_1, abortSignal_1) {
        return __awaiter(this, arguments, void 0, function* (workQueue, threadNumber, threadStatus, abortSignal, timeoutMs = constants_1.DEFAULT_CONFIG.THREAD_TIMEOUT_MS) {
            console.log(`⏰ Thread ${threadNumber}: Starting with work queue and ${timeoutMs / 1000 / 60} minute timeout`);
            // Update thread status
            const status = threadStatus.get(threadNumber);
            status.status = 'working';
            status.startTime = new Date();
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                const timeoutId = setTimeout(() => {
                    status.status = 'failed';
                    status.endTime = new Date();
                    reject(new Error(`Thread ${threadNumber} timed out after ${timeoutMs / 1000 / 60} minutes`));
                }, timeoutMs);
                // Clear timeout if abort signal is received
                if (abortSignal) {
                    abortSignal.addEventListener('abort', () => {
                        clearTimeout(timeoutId);
                    });
                }
            });
            // Race between the actual processing and timeout
            try {
                const result = yield Promise.race([
                    this.processProductThreadWithWorkQueueInternal(workQueue, threadNumber, threadStatus, abortSignal),
                    timeoutPromise
                ]);
                // Update thread status on completion
                status.status = 'completed';
                status.endTime = new Date();
                return result;
            }
            catch (error) {
                // Update thread status on failure
                status.status = 'failed';
                status.endTime = new Date();
                if (error.message.includes('timed out')) {
                    console.error(`⏰ Thread ${threadNumber}: Timed out after ${timeoutMs / 1000 / 60} minutes`);
                    throw new Error(`Thread ${threadNumber} timed out after ${timeoutMs / 1000 / 60} minutes`);
                }
                throw error;
            }
        });
    }
    processProductThreadWithWorkQueueInternal(workQueue, threadNumber, threadStatus, abortSignal) {
        return __awaiter(this, void 0, void 0, function* () {
            const threadResults = {
                imported: 0,
                errors: [],
            };
            const status = threadStatus.get(threadNumber);
            console.log(`🧵 Thread ${threadNumber}: Starting work queue processing`);
            // Assign API key to this thread
            this.rateLimitService.assignKeyToThread(threadNumber);
            // Check if thread is already aborted
            if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
                console.log(`🛑 Thread ${threadNumber}: Already aborted before starting`);
                throw new Error('Thread was aborted before starting');
            }
            // Set up abort signal listener
            const abortHandler = () => {
                console.log(`🛑 Thread ${threadNumber}: Received abort signal, stopping gracefully...`);
            };
            if (abortSignal) {
                abortSignal.addEventListener('abort', abortHandler);
            }
            try {
                let productCount = 0;
                while (true) {
                    // Check if thread should be aborted
                    if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
                        console.log(`🛑 Thread ${threadNumber}: Aborted during processing`);
                        throw new Error('Thread was aborted during processing');
                    }
                    // Get next product from work queue
                    const product = workQueue.getNextProduct();
                    if (!product) {
                        console.log(`🧵 Thread ${threadNumber}: No more products in queue, finishing`);
                        break;
                    }
                    productCount++;
                    status.currentProduct = product;
                    console.log(`🧵 Thread ${threadNumber}: Processing product ${productCount}: ${product.name} (Queue progress: ${workQueue.getProgress().toFixed(1)}%)`);
                    try {
                        // Check abort signal before enhancement (which can take time)
                        if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
                            console.log(`🛑 Thread ${threadNumber}: Aborted before enhancement of ${product.name}`);
                            throw new Error('Thread was aborted before enhancement');
                        }
                        // Calculate product index (assuming products are in order from Excel)
                        const productIndex = workQueue.getProcessedCount() + productCount;
                        // Enhance product with index-based category assignment
                        console.log(`📊 Thread ${threadNumber}: Enhancing product with index-based assignment: ${product.name} (index: ${productIndex})`);
                        const enhancedProduct = yield this.enhanceProductWithIndex(product, productIndex, threadNumber);
                        // Check abort signal after enhancement
                        if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
                            console.log(`🛑 Thread ${threadNumber}: Aborted after enhancement of ${product.name}`);
                            throw new Error('Thread was aborted after enhancement');
                        }
                        // Process category attributes if any were suggested
                        console.log(`📂 Thread ${threadNumber}: Processing attributes for: ${product.name}`);
                        const processedAttributes = [];
                        for (const attr of enhancedProduct.attributes || []) {
                            try {
                                // Check if categoryId is valid
                                if (!enhancedProduct.categoryId) {
                                    console.warn(`⚠️ Thread ${threadNumber}: No category ID for ${product.name}, skipping attributes`);
                                    break;
                                }
                                const attributeId = yield this.createOrUpdateCategoryAttribute(enhancedProduct.categoryId, { ru: attr.name_ru || attr.name, uz: attr.name_uz || attr.name }, { ru: attr.value_ru || attr.value, uz: attr.value_uz || attr.value });
                                processedAttributes.push({
                                    name: attr.name_ru || attr.name,
                                    value: attr.value_ru || attr.value
                                });
                            }
                            catch (attrError) {
                                console.warn(`⚠️ Thread ${threadNumber}: Failed to create attribute for ${product.name}:`, attrError);
                            }
                        }
                        console.log(`✅ Thread ${threadNumber}: Processed ${processedAttributes.length} attributes for ${product.name}`);
                        // Check abort signal before database creation
                        if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
                            console.log(`🛑 Thread ${threadNumber}: Aborted before database creation of ${product.name}`);
                            throw new Error('Thread was aborted before database creation');
                        }
                        // Validate categoryId before creating product
                        if (!enhancedProduct.categoryId) {
                            console.warn(`⚠️ Thread ${threadNumber}: No valid category ID for ${product.name}, skipping product creation`);
                            threadResults.errors.push(`No valid category ID for product: ${product.name}`);
                            status.errors++;
                            continue;
                        }
                        // Create product
                        console.log(`💾 Thread ${threadNumber}: Creating product in database: ${product.name}`);
                        // Use the image URL from enhanced product
                        const finalImages = enhancedProduct.imageUrl ? [enhancedProduct.imageUrl] : [];
                        const newProduct = yield Product_1.default.create({
                            name: enhancedProduct.name,
                            description: enhancedProduct.description,
                            brand: enhancedProduct.brand,
                            categoryId: enhancedProduct.categoryId,
                            basePrice: enhancedProduct.price,
                            unit: enhancedProduct.unit,
                            baseStock: {
                                quantity: 0,
                                unit: enhancedProduct.unit,
                            },
                            attributes: processedAttributes,
                            images: finalImages,
                            isActive: true,
                        });
                        console.log(`✅ Thread ${threadNumber}: Successfully created product: ${product.name} (ID: ${newProduct._id})`);
                        threadResults.imported++;
                        status.processed++;
                        workQueue.markAsProcessed();
                    }
                    catch (error) {
                        // Check if this is an abort error
                        if ((abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) || error.name === 'AbortError') {
                            console.log(`🛑 Thread ${threadNumber}: Aborted during processing of ${product.name}`);
                            throw new Error('Thread was aborted during product processing');
                        }
                        // Handle other errors
                        console.error(`❌ Thread ${threadNumber}: Error importing product ${product.name}:`, error);
                        console.error(`🔍 Thread ${threadNumber}: Error details:`, error.message || "Unknown error");
                        threadResults.errors.push(`Thread ${threadNumber} - Failed to import ${product.name}: ${error.message || "Unknown error"}`);
                        status.errors++;
                        // If we have too many consecutive errors, consider stopping the thread
                        if (threadResults.errors.length > 10 && threadResults.imported === 0) {
                            console.error(`❌ Thread ${threadNumber}: Too many consecutive errors (${threadResults.errors.length}), stopping thread`);
                            throw new Error(`Thread ${threadNumber} stopped due to too many consecutive errors`);
                        }
                    }
                }
                console.log(`🎉 Thread ${threadNumber}: Completed processing ${productCount} products`);
                console.log(`✅ Thread ${threadNumber}: Imported: ${threadResults.imported} products`);
                console.log(`❌ Thread ${threadNumber}: Errors: ${threadResults.errors.length}`);
            }
            catch (error) {
                // Clean up abort signal listener
                if (abortSignal) {
                    abortSignal.removeEventListener('abort', abortHandler);
                }
                // Re-throw abort errors
                if ((abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) || error.name === 'AbortError') {
                    console.log(`🛑 Thread ${threadNumber}: Was aborted - ${error.message}`);
                    throw new Error(`Thread ${threadNumber} was aborted: ${error.message}`);
                }
                // Handle other critical errors
                console.error(`❌ Thread ${threadNumber}: Critical error:`, error);
                throw error;
            }
            finally {
                // Clean up abort signal listener
                if (abortSignal) {
                    abortSignal.removeEventListener('abort', abortHandler);
                }
                // Clear current product
                status.currentProduct = null;
            }
            return threadResults;
        });
    }
}
exports.ExcelImportService = ExcelImportService;
exports.default = new ExcelImportService();
