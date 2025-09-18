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
exports.CategoryService = void 0;
const Category_1 = __importDefault(require("../../models/Category"));
const productCategoryMapping_1 = require("./productCategoryMapping");
/**
 * Category Service for Excel Import
 * Handles category creation and management
 */
class CategoryService {
    /**
     * Get all categories with their attributes
     */
    getAllCategoriesWithAttributes() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`📂 Fetching all categories with attributes...`);
                const categories = yield Category_1.default.find({ isActive: true })
                    .populate('attributes')
                    .lean();
                const categoriesWithAttributes = categories.map(category => {
                    var _a, _b;
                    return ({
                        _id: category._id.toString(),
                        name: category.name,
                        parentId: ((_a = category.parentId) === null || _a === void 0 ? void 0 : _a.toString()) || null,
                        attributes: ((_b = category.attributes) === null || _b === void 0 ? void 0 : _b.map((attr) => ({
                            _id: attr._id.toString(),
                            name: attr.name,
                            value: attr.value
                        }))) || []
                    });
                });
                console.log(`✅ Found ${categoriesWithAttributes.length} categories with attributes`);
                // If no categories exist, try to create comprehensive ones
                if (categoriesWithAttributes.length === 0) {
                    console.log(`⚠️ No categories found. Attempting to create comprehensive categories...`);
                    yield this.createComprehensiveCategories();
                    // Try to fetch again after creating comprehensive categories
                    const newCategories = yield Category_1.default.find({ isActive: true })
                        .populate('attributes')
                        .lean();
                    const newCategoriesWithAttributes = newCategories.map(category => {
                        var _a, _b;
                        return ({
                            _id: category._id.toString(),
                            name: category.name,
                            parentId: ((_a = category.parentId) === null || _a === void 0 ? void 0 : _a.toString()) || null,
                            attributes: ((_b = category.attributes) === null || _b === void 0 ? void 0 : _b.map((attr) => ({
                                _id: attr._id.toString(),
                                name: attr.name,
                                value: attr.value
                            }))) || []
                        });
                    });
                    console.log(`✅ Created and found ${newCategoriesWithAttributes.length} categories with attributes`);
                    return newCategoriesWithAttributes;
                }
                return categoriesWithAttributes;
            }
            catch (error) {
                console.error("❌ Error fetching categories with attributes:", error);
                throw new Error("Failed to fetch categories with attributes");
            }
        });
    }
    /**
     * Create comprehensive category structure as requested by user
     * This includes all 7 main categories with their subcategories and third-level categories
     */
    createComprehensiveCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                console.log(`🔧 Creating comprehensive category structure...`);
                // Clear existing categories first
                yield Category_1.default.deleteMany({});
                console.log(`🗑️ Cleared existing categories`);
                // Function to extract English translation from category name
                const extractEnglishName = (name) => {
                    const match = name.match(/\(([^)]+)\)/);
                    return match ? match[1] : name;
                };
                // Function to create category
                const createCategory = (name_1, ...args_1) => __awaiter(this, [name_1, ...args_1], void 0, function* (name, parentId = null, sortOrder = 0) {
                    const englishName = extractEnglishName(name);
                    const category = yield Category_1.default.create({
                        name: {
                            uz: name,
                            ru: name
                        },
                        description: {
                            uz: englishName,
                            ru: englishName
                        },
                        parentId: parentId,
                        sortOrder: sortOrder,
                        isActive: true
                    });
                    return category._id.toString();
                });
                const mainCategoryIds = {};
                const subCategoryIds = {};
                // Create main categories from the new structure
                let mainSortOrder = 1;
                const mainCategories = productCategoryMapping_1.PRODUCT_CATEGORY_STRUCTURE.filter(cat => !cat.parentCategory);
                for (const category of mainCategories) {
                    const mainCategoryId = yield createCategory(category.name.ru, null, mainSortOrder);
                    mainCategoryIds[category.name.ru] = mainCategoryId;
                    console.log(`✅ Created main category: ${category.name.ru} (ID: ${mainCategoryId})`);
                    mainSortOrder++;
                }
                // Create subcategories
                const subCategories = productCategoryMapping_1.PRODUCT_CATEGORY_STRUCTURE.filter(cat => cat.parentCategory && mainCategories.some(main => main.name.ru === cat.parentCategory));
                let subSortOrder = 1;
                for (const category of subCategories) {
                    if (category.parentCategory && mainCategoryIds[category.parentCategory]) {
                        const subCategoryId = yield createCategory(category.name.ru, mainCategoryIds[category.parentCategory], subSortOrder);
                        subCategoryIds[`${category.parentCategory}-${category.name.ru}`] = subCategoryId;
                        console.log(`  ✅ Created subcategory: ${category.name.ru} (ID: ${subCategoryId})`);
                        subSortOrder++;
                    }
                }
                // Create brand categories (third level)
                const brandCategories = productCategoryMapping_1.PRODUCT_CATEGORY_STRUCTURE.filter(cat => cat.parentCategory &&
                    subCategories.some(sub => sub.name.ru === cat.parentCategory));
                let brandSortOrder = 1;
                for (const category of brandCategories) {
                    if (category.parentCategory && subCategoryIds[`${(_a = subCategories.find(sub => sub.name.ru === category.parentCategory)) === null || _a === void 0 ? void 0 : _a.parentCategory}-${category.parentCategory}`]) {
                        const brandCategoryId = yield createCategory(category.name.ru, subCategoryIds[`${(_b = subCategories.find(sub => sub.name.ru === category.parentCategory)) === null || _b === void 0 ? void 0 : _b.parentCategory}-${category.parentCategory}`], brandSortOrder);
                        console.log(`    ✅ Created brand category: ${category.name.ru} (ID: ${brandCategoryId})`);
                        brandSortOrder++;
                    }
                }
                // Count total categories
                const totalCategories = yield Category_1.default.countDocuments();
                console.log(`\n🎉 Comprehensive category creation completed!`);
                console.log(`📊 Total categories created: ${totalCategories}`);
                console.log(`📂 Main categories: ${Object.keys(mainCategoryIds).length}`);
                return {
                    success: true,
                    totalCategories,
                    mainCategories: Object.keys(mainCategoryIds).length,
                    message: `Successfully created ${totalCategories} categories with ${Object.keys(mainCategoryIds).length} main categories`
                };
            }
            catch (error) {
                console.error(`❌ Failed to create comprehensive categories:`, error);
                return {
                    success: false,
                    totalCategories: 0,
                    mainCategories: 0,
                    message: `Failed to create categories: ${error.message || 'Unknown error'}`
                };
            }
        });
    }
}
exports.CategoryService = CategoryService;
