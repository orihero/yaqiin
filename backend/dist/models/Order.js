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
const mongoose_1 = __importStar(require("mongoose"));
const OrderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    subtotal: { type: Number, required: true },
}, { _id: false });
const OrderPricingSchema = new mongoose_1.Schema({
    itemsTotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, required: true },
    total: { type: Number, required: true },
}, { _id: false });
const OrderAddressSchema = new mongoose_1.Schema({
    title: { type: String },
    street: { type: String },
    city: { type: String },
    district: { type: String },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    notes: { type: String },
}, { _id: false });
const OrderStatusHistorySchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    timestamp: { type: Date, required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
}, { _id: false });
const OrderScheduledDeliverySchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, unique: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Shop', required: true },
    courierId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    items: { type: [OrderItemSchema], required: true },
    pricing: { type: OrderPricingSchema, required: true },
    deliveryAddress: { type: OrderAddressSchema, required: true },
    paymentMethod: { type: String, enum: ['cash_on_delivery', 'bank_transfer'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], required: true },
    status: { type: String, enum: ['created', 'operator_confirmed', 'packing', 'packed', 'courier_picked', 'delivered', 'paid', 'rejected_by_shop', 'rejected_by_courier', 'cancelled_by_client'], required: true },
    rejectionReason: { type: String },
    statusHistory: [OrderStatusHistorySchema],
    scheduledDelivery: { type: OrderScheduledDeliverySchema },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    notes: { type: String },
    adminNotes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
OrderSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew && (!this.orderNumber || typeof this.orderNumber !== 'string' || this.orderNumber.trim() === '')) {
            // Find the latest order by orderNumber (descending)
            const lastOrder = yield this.constructor.findOne({}, {}, { sort: { orderNumber: -1 } });
            let nextNumber = 1;
            if (lastOrder && lastOrder.orderNumber) {
                // Remove leading zeros and increment
                nextNumber = parseInt(lastOrder.orderNumber, 10) + 1;
            }
            // Pad to 6 digits with leading zeros
            this.orderNumber = String(nextNumber).padStart(6, '0');
        }
        next();
    });
});
OrderSchema.statics.updateStatus = function (orderId, newStatus, updatedBy, reason) {
    return __awaiter(this, void 0, void 0, function* () {
        const order = yield this.findById(orderId);
        if (!order)
            return null;
        order.status = newStatus;
        if ((newStatus === 'rejected_by_shop' || newStatus === 'rejected_by_courier') && reason) {
            order.rejectionReason = reason;
        }
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date(),
            updatedBy,
            notes: reason || undefined
        });
        yield order.save();
        return order;
    });
};
exports.default = mongoose_1.default.model('Order', OrderSchema);
