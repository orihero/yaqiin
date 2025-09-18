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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomExcelImportService = void 0;
const XLSX = __importStar(require("xlsx"));
class CustomExcelImportService {
    /**
     * Import products from Excel file and identify the first category
     * @param filename - Path to the Excel file
     * @returns Object containing category information and products
     */
    importFromExcel(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`📖 Reading Excel file: ${filename}`);
                // Read the Excel file
                const workbook = XLSX.readFile(filename);
                const sheetName = workbook.SheetNames[0];
                console.log(`📄 Using sheet: ${sheetName}`);
                const worksheet = workbook.Sheets[sheetName];
                // Convert to JSON with headers
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                console.log(`📊 Total rows in Excel: ${jsonData.length}`);
                if (jsonData.length < 2) {
                    return {
                        success: false,
                        products: [],
                        totalRows: jsonData.length,
                        errors: ['Excel file must have at least 2 rows (header + data)']
                    };
                }
                // Parse products and identify categories
                const result = this.parseProductsAndCategories(jsonData);
                console.log(`✅ Excel parsing completed successfully`);
                console.log(`📊 Found ${result.products.length} products`);
                if (result.firstCategory) {
                    console.log(`📂 First category: "${result.firstCategory.name}"`);
                    console.log(`📊 Category range: rows ${result.firstCategory.startIndex} to ${result.firstCategory.endIndex}`);
                    console.log(`📊 Products in first category: ${result.firstCategory.productCount}`);
                }
                return {
                    success: true,
                    firstCategory: result.firstCategory,
                    products: result.products,
                    totalRows: jsonData.length,
                    errors: result.errors
                };
            }
            catch (error) {
                console.error("❌ Error reading Excel file:", error);
                return {
                    success: false,
                    products: [],
                    totalRows: 0,
                    errors: [`Failed to read Excel file: ${error.message}`]
                };
            }
        });
    }
    /**
     * Parse products from Excel data and identify the first category
     */
    parseProductsAndCategories(jsonData) {
        var _a, _b;
        const products = [];
        const errors = [];
        let firstCategory;
        let currentCategoryStart = -1;
        let currentCategoryName = '';
        let zeroPriceCount = 0;
        // Skip header row (index 0) and start from index 1
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length < 3) {
                continue;
            }
            const code = ((_a = row[0]) === null || _a === void 0 ? void 0 : _a.toString()) || "";
            const name = ((_b = row[1]) === null || _b === void 0 ? void 0 : _b.toString()) || "";
            const price = parseFloat(row[2]) || 0;
            // Check if this is a category header (no code but has name)
            if (!code && name && price === 0) {
                // This is likely a category header
                console.log(`📂 Found potential category header at row ${i + 1}: "${name}"`);
                // If we were in a category, close it
                if (currentCategoryStart !== -1 && !firstCategory) {
                    firstCategory = {
                        name: currentCategoryName,
                        startIndex: currentCategoryStart,
                        endIndex: i - 1,
                        productCount: products.filter(p => p.rowIndex >= currentCategoryStart && p.rowIndex <= i - 1).length
                    };
                    console.log(`✅ Completed first category: "${firstCategory.name}" (rows ${firstCategory.startIndex} to ${firstCategory.endIndex})`);
                }
                // Start new category
                currentCategoryStart = i + 1; // Next row will be the first product
                currentCategoryName = name;
                continue;
            }
            // Skip rows with no code or zero price
            if (!code || price === 0) {
                if (price === 0 && code) {
                    zeroPriceCount++;
                    console.log(`⏭️ Skipping product with zero price: ${name} (${code}) at row ${i + 1}`);
                }
                continue;
            }
            // This is a product row
            const product = {
                code,
                name,
                price,
                rowIndex: i + 1 // Excel row number (1-indexed)
            };
            products.push(product);
        }
        // Handle the case where we have products but no category header was found
        if (currentCategoryStart !== -1 && !firstCategory && products.length > 0) {
            // If we have products but no category header, treat all products as one category
            firstCategory = {
                name: currentCategoryName || 'Default Category',
                startIndex: 2, // Assuming row 2 is the first data row
                endIndex: jsonData.length - 1,
                productCount: products.length
            };
            console.log(`📂 Created default category: "${firstCategory.name}" with ${firstCategory.productCount} products`);
        }
        // If no category was found at all, create a default one
        if (!firstCategory && products.length > 0) {
            firstCategory = {
                name: 'All Products',
                startIndex: 2,
                endIndex: jsonData.length - 1,
                productCount: products.length
            };
            console.log(`📂 No category headers found, created default category: "${firstCategory.name}"`);
        }
        if (zeroPriceCount > 0) {
            console.log(`⏭️ Skipped ${zeroPriceCount} products with zero price`);
        }
        return {
            products,
            firstCategory,
            errors
        };
    }
}
exports.CustomExcelImportService = CustomExcelImportService;
exports.default = new CustomExcelImportService();
