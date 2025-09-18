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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ProductNameDescSchema = new mongoose_1.Schema({
    uz: { type: String, required: true },
    ru: { type: String, required: true },
}, { _id: false });
const ProductStockSchema = new mongoose_1.Schema({
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    lowStockThreshold: { type: Number },
}, { _id: false });
const ProductAttributeSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true },
}, { _id: false });
const ProductNutritionalInfoSchema = new mongoose_1.Schema({
    calories: { type: Number },
    protein: { type: Number },
    fat: { type: Number },
    carbohydrates: { type: Number },
}, { _id: false });
const ProductRatingSchema = new mongoose_1.Schema({
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
}, { _id: false });
const ProductSchema = new mongoose_1.Schema({
    name: { type: ProductNameDescSchema, required: true },
    description: { type: ProductNameDescSchema },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: ProductNameDescSchema },
    images: [{ type: String }],
    basePrice: { type: Number, required: true }, // Changed from price to basePrice
    unit: { type: String, required: true },
    unitMeasure: { type: String }, // Optional unit measure field
    baseStock: { type: ProductStockSchema, required: true }, // Changed from stock to baseStock
    attributes: [ProductAttributeSchema],
    tags: [{ type: String }],
    nutritionalInfo: { type: ProductNutritionalInfoSchema },
    rating: { type: ProductRatingSchema, default: undefined },
    isActive: { type: Boolean, required: true },
    isFeatured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('Product', ProductSchema);
