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
const ShopContactInfoSchema = new mongoose_1.Schema({
    phoneNumber: { type: String, required: true },
    email: { type: String },
    telegramUsername: { type: String },
}, { _id: false });
const ShopAddressSchema = new mongoose_1.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
}, { _id: false });
const DeliveryZoneSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    polygon: [{ lat: Number, lng: Number }],
    deliveryFee: { type: Number, required: true },
    minOrderAmount: { type: Number, required: true },
    estimatedDeliveryTime: { type: Number, required: true },
});
const OperatingHoursDaySchema = new mongoose_1.Schema({
    open: { type: String, required: true },
    close: { type: String, required: true },
    isOpen: { type: Boolean, required: true },
}, { _id: false });
const ShopOperatingHoursSchema = new mongoose_1.Schema({
    monday: { type: OperatingHoursDaySchema, required: true },
    tuesday: { type: OperatingHoursDaySchema, required: true },
    wednesday: { type: OperatingHoursDaySchema, required: true },
    thursday: { type: OperatingHoursDaySchema, required: true },
    friday: { type: OperatingHoursDaySchema, required: true },
    saturday: { type: OperatingHoursDaySchema, required: true },
    sunday: { type: OperatingHoursDaySchema, required: true },
}, { _id: false });
const ShopRatingSchema = new mongoose_1.Schema({
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
}, { _id: false });
const ShopSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    contactInfo: { type: ShopContactInfoSchema, required: true },
    address: { type: ShopAddressSchema, required: true },
    deliveryZones: [DeliveryZoneSchema],
    operatingHours: { type: ShopOperatingHoursSchema, required: true },
    rating: { type: ShopRatingSchema, default: undefined },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], required: true },
    commission: { type: Number },
    couriers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    orders_chat_id: { type: String },
    photo: { type: String },
    logo: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('Shop', ShopSchema);
