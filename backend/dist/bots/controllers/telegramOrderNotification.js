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
exports.sendOrderCreatedTelegramNotification = sendOrderCreatedTelegramNotification;
const telegraf_1 = require("telegraf");
const courierBot_1 = __importDefault(require("../../bots/courierBot"));
const telegram_1 = require("../../utils/telegram");
const i18n_1 = require("../../utils/i18n");
/**
 * Sends a Telegram notification to the shop's order group when an order is created.
 * @param order The order document (with items, pricing, etc.)
 * @param shop The shop document (with orders_chat_id, ownerId, etc.)
 * @param client The user document for the client (with name, phone, etc.)
 */
function sendOrderCreatedTelegramNotification(order, shop, client) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!shop || !shop.orders_chat_id)
            return;
        let clientName = client
            ? `${client.firstName || ''} ${client.lastName || ''}`.trim()
            : 'Client';
        let clientPhone = (client === null || client === void 0 ? void 0 : client.phoneNumber) || '';
        // Create a mock context for translation (since we don't have a real context here)
        const mockCtx = { from: { language_code: 'uz' } };
        // Compose order details
        let orderText = `${(0, telegram_1.escapeMarkdownV2)((0, i18n_1.t)(mockCtx, 'newOrderLabel'))}
${(0, i18n_1.t)(mockCtx, 'orderIdLabel')} ${(0, telegram_1.escapeMarkdownV2)(String(order._id))}
${(0, i18n_1.t)(mockCtx, 'clientLabel')} ${(0, telegram_1.escapeMarkdownV2)(clientName)}`;
        if (clientPhone) {
            const safePhone = clientPhone.replace(/[-()\s]/g, '');
            orderText += `\nTelefon: [${(0, telegram_1.escapeMarkdownV2)('📞 ' + clientPhone)}](tel:${(0, telegram_1.escapeMarkdownV2Url)('+' + safePhone)})`;
        }
        orderText += `\n\n${(0, telegram_1.escapeMarkdownV2)((0, i18n_1.t)(mockCtx, 'productsLabel'))}`;
        for (const item of order.items) {
            const productLine = `- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
            orderText += `\n${(0, telegram_1.escapeMarkdownV2)(productLine)}`;
        }
        orderText += `\n\n${(0, telegram_1.escapeMarkdownV2)((0, i18n_1.t)(mockCtx, 'totalLabel'))} ${(0, telegram_1.escapeMarkdownV2)(String(order.pricing.total))}`;
        // Buttons: Confirm/Accept
        const callbackRow = [
            telegraf_1.Markup.button.callback(`✅ ${(0, i18n_1.t)(mockCtx, 'acceptBtn')}`, `order_accept_${order._id}`),
        ];
        const keyboard = [callbackRow];
        try {
            // Collect all product images from order items
            const allProductImages = [];
            order.items.forEach((item) => {
                if (item.images && Array.isArray(item.images)) {
                    allProductImages.push(...item.images);
                }
            });
            // Remove duplicates and filter out empty strings
            const uniqueImages = [...new Set(allProductImages)].filter(img => img && img.trim() !== '');
            // Send order message with buttons
            yield courierBot_1.default.telegram.sendMessage(shop.orders_chat_id, orderText, {
                reply_markup: telegraf_1.Markup.inlineKeyboard(keyboard).reply_markup,
                parse_mode: 'MarkdownV2'
            });
            // Send product images as album if there are any
            if (uniqueImages.length > 0) {
                console.log(`[Order Create] Sending ${uniqueImages.length} product images to Telegram group`);
                yield (0, telegram_1.sendTelegramPhotoAlbum)(shop.orders_chat_id, uniqueImages, `🖼️ Mahsulot rasmlari - Buyurtma #${order._id}`);
            }
            else {
                console.log('[Order Create] No product images found for this order');
            }
        }
        catch (err) {
            console.error('[Order Create] Telegram notification error:', err);
            // Don't throw error to avoid breaking order creation
            // Just log the error and continue
        }
    });
}
/**
 * Sends order status updates to the orders group with action buttons for admins/operators
 * @param order The order document
 * @param shop The shop document
 * @param status The new status
 * @param updatedBy The user who updated the status
 */
// This module kept for order creation; status updates moved to orderGroupNotifier to avoid circular imports.
