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
const SupportTicketResponseSchema = new mongoose_1.Schema({
    responderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    responderRole: { type: String, enum: ['admin', 'support', 'customer', 'operator'], required: true },
    message: { type: String, required: true },
    attachments: [{ type: String }],
    isInternal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
const SupportTicketResolutionSchema = new mongoose_1.Schema({
    summary: { type: String },
    resolvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    satisfactionRating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
}, { _id: false });
const SupportTicketSchema = new mongoose_1.Schema({
    ticketNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    userRole: { type: String, enum: ['client', 'courier', 'shop_owner', 'operator'], required: true },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' },
    category: { type: String, required: true },
    subcategory: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
    status: { type: String, enum: ['open', 'in_progress', 'waiting_for_response', 'resolved', 'closed'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [{ type: String }],
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    responses: [SupportTicketResponseSchema],
    resolution: { type: SupportTicketResolutionSchema },
    tags: [{ type: String }],
    isEscalated: { type: Boolean, default: false },
    escalatedAt: { type: Date },
    escalatedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    lastActivityAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('SupportTicket', SupportTicketSchema);
