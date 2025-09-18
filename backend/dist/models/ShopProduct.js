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
const ShopProductStockSchema = new mongoose_1.Schema({
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    lowStockThreshold: { type: Number },
}, { _id: false });
const ShopProductSchema = new mongoose_1.Schema({
    shopId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Shop', required: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true },
    stock: { type: ShopProductStockSchema, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isRefundable: { type: Boolean, default: false },
    maxOrderQuantity: { type: Number },
    minOrderQuantity: { type: Number, default: 1 },
    deliveryTime: { type: Number }, // in minutes
    specialNotes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
// Create compound index to ensure unique shop-product combinations
ShopProductSchema.index({ shopId: 1, productId: 1 }, { unique: true });
// Create indexes for better query performance
ShopProductSchema.index({ shopId: 1, isActive: 1 });
ShopProductSchema.index({ productId: 1 });
exports.default = mongoose_1.default.model('ShopProduct', ShopProductSchema);
