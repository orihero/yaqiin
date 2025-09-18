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
const NotificationTitleMessageSchema = new mongoose_1.Schema({
    uz: { type: String, required: true },
    ru: { type: String, required: true },
}, { _id: false });
const NotificationSchema = new mongoose_1.Schema({
    recipientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientType: { type: String, enum: ['client', 'courier', 'admin', 'shop_owner', 'operator'], required: true },
    type: { type: String, enum: ['order_update', 'promotion', 'system', 'chat_message'], required: true },
    title: { type: NotificationTitleMessageSchema, required: true },
    message: { type: NotificationTitleMessageSchema, required: true },
    data: { type: mongoose_1.Schema.Types.Mixed },
    channels: [{ type: String, required: true }],
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], required: true },
    isRead: { type: Boolean, required: true },
    readAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('Notification', NotificationSchema);
