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
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AddressSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    street: { type: String }, // not required
    city: { type: String }, // not required
    district: { type: String }, // not required
    postalCode: { type: String },
    building: { type: String },
    entrance: { type: String },
    apartment: { type: String },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    isDefault: { type: Boolean, default: false },
});
const UserPreferencesSchema = new mongoose_1.Schema({
    language: { type: String, enum: ['uz', 'ru', 'en'], required: true },
    notifications: {
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        newProducts: { type: Boolean, default: true },
    },
});
const UserSchema = new mongoose_1.Schema({
    telegramId: { type: String, unique: true, sparse: true },
    chat_id: { type: Number },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    password: { type: String, select: false },
    role: { type: String, enum: ['client', 'courier', 'admin', 'shop_owner', 'operator'], required: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], required: true },
    addresses: [AddressSchema],
    preferences: { type: UserPreferencesSchema, default: undefined },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date },
    shopId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Shop' }, // Added for shop-client binding
});
// Hash password if modified
UserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified('password') && this.password) {
            this.password = yield bcryptjs_1.default.hash(this.password, 10);
        }
        next();
    });
});
// Compare password method
UserSchema.methods.comparePassword = function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
exports.default = mongoose_1.default.model('User', UserSchema);
