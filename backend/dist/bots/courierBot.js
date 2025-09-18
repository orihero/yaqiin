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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log("[courierBot] File loaded");
const telegraf_1 = require("telegraf");
const Group_1 = __importDefault(require("../models/Group"));
const Order_1 = __importDefault(require("../models/Order"));
const User_1 = __importDefault(require("../models/User"));
const i18n_1 = require("../utils/i18n");
const orderGroupNotifier_1 = require("./controllers/orderGroupNotifier");
const token = process.env.COURIER_BOT_TOKEN;
if (!token) {
    throw new Error("COURIER_BOT_TOKEN is not set in environment variables");
}
const courierBot = new telegraf_1.Telegraf(token);
// Registration wizard state
const registrationState = new Map();
// Temporary map for custom reason input
const customReasonMap = new Map();
const LANGUAGES = [
    { code: "uz", label: "Oʻzbekcha" },
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
];
// Attach registrationState to ctx
courierBot.use((ctx, next) => {
    ctx.registrationState = registrationState;
    return next();
});
courierBot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.from)
        return;
    const telegramId = String(ctx.from.id);
    registrationState.set(telegramId, { step: "code" });
    // Send welcome in all languages
    yield ctx.reply((0, i18n_1.t)(ctx, "courierWelcome", {}) +
        "\n\n" +
        (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "ru" }) }), "courierWelcome", {}) +
        "\n" +
        (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "en" }) }), "courierWelcome", {}));
    yield ctx.reply((0, i18n_1.t)(ctx, "courierAskCode", {}) +
        "\n" +
        (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "ru" }) }), "courierAskCode", {}) +
        "\n" +
        (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "en" }) }), "courierAskCode", {}));
}));
courierBot.on("text", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!ctx.from || !ctx.message)
        return;
    const telegramId = String(ctx.from.id);
    const state = registrationState.get(telegramId);
    const messageText = "text" in ctx.message && typeof ctx.message.text === "string"
        ? ctx.message.text
        : "";
    if (!state)
        return; // Only handle if in registration
    if (state.step === "code") {
        // Check if message is a 24-character user ID
        if (typeof messageText === "string" &&
            messageText.length === 24 &&
            /^[a-fA-F0-9]{24}$/.test(messageText)) {
            const user = yield User_1.default.findById(messageText);
            if (user) {
                user.telegramId = telegramId;
                user.chat_id = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
                yield user.save();
                state.userId = user._id;
                state.name = user.firstName || user.username || "";
                state.step = "language";
                yield ctx.reply((0, i18n_1.t)(ctx, "courierSuccess", { name: state.name }) +
                    "\n" +
                    (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "ru" }) }), "courierSuccess", { name: state.name }) +
                    "\n" +
                    (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "en" }) }), "courierSuccess", { name: state.name }));
                yield ctx.reply((0, i18n_1.t)(ctx, "courierAskLanguage") +
                    "\n" +
                    (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "ru" }) }), "courierAskLanguage") +
                    "\n" +
                    (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "en" }) }), "courierAskLanguage"), {
                    reply_markup: {
                        keyboard: [LANGUAGES.map((l) => l.label)],
                        one_time_keyboard: true,
                        resize_keyboard: true,
                    },
                });
            }
            else {
                yield ctx.reply((0, i18n_1.t)(ctx, "courierInvalidCode") +
                    "\n" +
                    (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "ru" }) }), "courierInvalidCode") +
                    "\n" +
                    (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "en" }) }), "courierInvalidCode"));
            }
        }
        else {
            yield ctx.reply((0, i18n_1.t)(ctx, "courierInvalidCode") +
                "\n" +
                (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "ru" }) }), "courierInvalidCode") +
                "\n" +
                (0, i18n_1.t)(Object.assign(Object.assign({}, ctx), { registrationState, from: Object.assign(Object.assign({}, ctx.from), { language_code: "en" }) }), "courierInvalidCode"));
        }
        return;
    }
    if (state.step === "language") {
        const lang = LANGUAGES.find((l) => l.label === messageText);
        if (!lang)
            return;
        state.language = lang.code;
        // Update user language preference
        if (state.userId) {
            yield User_1.default.findByIdAndUpdate(state.userId, {
                $set: { "preferences.language": lang.code },
            });
        }
        state.step = "configured";
        // Fetch user to get role
        const user = yield User_1.default.findById(state.userId);
        if (user) {
            if (user.role === "courier") {
                yield ctx.reply((0, i18n_1.t)(ctx, "courierConfiguredCourier"));
            }
            else if (user.role === "shop_owner") {
                yield ctx.reply((0, i18n_1.t)(ctx, "courierConfiguredShopOwner"));
            }
            else {
                yield ctx.reply((0, i18n_1.t)(ctx, "courierAccountConfigured"));
            }
        }
        registrationState.delete(telegramId);
        return;
    }
    // Handle custom reason input for rejection
    const userId = String(ctx.from.id);
    if (customReasonMap.has(userId)) {
        const { orderId, role } = customReasonMap.get(userId);
        const customReason = ctx.message && "text" in ctx.message ? ctx.message["text"] : "";
        if (!ctx.from)
            return;
        const order = yield Order_1.default.findById(orderId);
        if (order) {
            if (role === "client_reject") {
                yield Order_1.default.updateStatus(orderId, "rejected_by_courier", String(ctx.from.id), customReason);
                yield ctx.reply((0, i18n_1.t)(ctx, "orderRejectedFinal", { reason: customReason }));
                // Send order status update to orders group
                const Shop = require("../models/Shop").default;
                const shop = yield Shop.findById(order.shopId);
                if (shop) {
                    const user = yield User_1.default.findOne({ telegramId: String(ctx.from.id) });
                    if (user) {
                        yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, "rejected_by_courier", user);
                    }
                }
            }
            else {
                yield Order_1.default.updateStatus(orderId, "rejected_by_courier", String(ctx.from.id), customReason);
                yield ctx.reply((0, i18n_1.t)(ctx, "orderRejected"));
                // Send order status update to orders group
                const Shop = require("../models/Shop").default;
                const shop = yield Shop.findById(order.shopId);
                if (shop) {
                    const user = yield User_1.default.findOne({ telegramId: String(ctx.from.id) });
                    if (user) {
                        yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, "rejected_by_courier", user);
                    }
                }
            }
        }
        customReasonMap.delete(userId);
        return;
    }
}));
courierBot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const chat = ctx.chat;
    if (chat && (chat.type === "group" || chat.type === "supergroup")) {
        // Upsert group info
        yield Group_1.default.findOneAndUpdate({ chatId: (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id }, { $set: { title: chat.title, type: chat.type, dateAdded: new Date() } }, { upsert: true, new: true });
    }
}));
courierBot.on("callback_query", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const cbq = ctx.callbackQuery;
    const data = cbq.data;
    if (!data)
        return;
    const userId = ctx.from && ctx.from.id ? String(ctx.from.id) : "";
    // Match accept for courier
    const acceptMatch = data.match(/^order_accept_(.+)$/);
    if (acceptMatch) {
        const orderId = acceptMatch[1];
        const order = yield Order_1.default.findById(orderId);
        if (!order)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderNotFound"));
        if (!ctx.from)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFound"));
        // Fetch the user who pressed the button
        const user = yield User_1.default.findOne({ telegramId: userId });
        if (!user)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFoundInDB"));
        // Check if user is admin or operator
        if (user.role === "admin" || user.role === "operator") {
            if (order.status === "created") {
                // Accept: set to confirmed, update statusHistory
                yield Order_1.default.updateStatus(orderId, "operator_confirmed", user._id.toString());
                yield ctx.editMessageReplyMarkup({ inline_keyboard: [] });
                yield ctx.reply((0, i18n_1.t)(ctx, "orderConfirmedSentToShop"));
                // Send order status update to orders group
                const Shop = require("../models/Shop").default;
                const shop = yield Shop.findById(order.shopId);
                if (shop) {
                    yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, "operator_confirmed", user);
                }
                // Send to shop owner with Accept/Reject buttons
                if (shop && shop.ownerId) {
                    // Find shop owner user
                    const shopOwner = yield User_1.default.findById(shop.ownerId);
                    if (shopOwner && shopOwner.telegramId && /^\d+$/.test(shopOwner.telegramId)) {
                        // Compose detailed order notification
                        let orderText = `🆕🛒 <b>${(0, i18n_1.t)(ctx, "newOrderLabel")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                        orderText += `<b>${(0, i18n_1.t)(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
                        orderText += `\n<b>${(0, i18n_1.t)(ctx, "productsLabel")}</b>`;
                        for (const item of order.items) {
                            orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
                        }
                        orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
                        orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "nextStepLabel")}:</b> ${(0, i18n_1.t)(ctx, "acceptOrRejectOrder")}`;
                        yield ctx.telegram.sendMessage(shopOwner.telegramId, orderText, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: '✅ ' + (0, i18n_1.t)(ctx, "acceptBtn"), callback_data: `order_shop_accept_${order._id}` },
                                        { text: '❌ ' + (0, i18n_1.t)(ctx, "rejectBtn"), callback_data: `order_shop_reject_${order._id}` }
                                    ]
                                ]
                            }
                        });
                    }
                    else {
                        console.error('[Order Notify] Invalid or missing telegramId for shop owner:', shopOwner);
                    }
                }
            }
            else {
                yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderCannotBeAccepted"));
                return;
            }
            return;
        }
        else {
            // Default: courier accepts, send to shop group
            if (order.status === "created") {
                yield Order_1.default.updateStatus(orderId, "packing", user._id.toString());
                yield ctx.editMessageReplyMarkup({ inline_keyboard: [] });
                yield ctx.reply((0, i18n_1.t)(ctx, "orderAcceptedSentToShop"));
                // Send to shop group (if exists)
                const Shop = require("../models/Shop").default;
                const shop = yield Shop.findById(order.shopId);
                if (shop) {
                    // Always reflect to orders group as status update
                    yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, "packing", user);
                    // Also keep legacy plain text message if chat id exists
                    if (shop.orders_chat_id) {
                        yield ctx.telegram.sendMessage(shop.orders_chat_id, `${(0, i18n_1.t)(ctx, "newOrderLabel")}\n${(0, i18n_1.t)(ctx, "orderIdLabel")}: ${order._id}\n${(0, i18n_1.t)(ctx, "pleaseReviewOrder")}`);
                    }
                }
            }
            else {
                yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderCannotBeAccepted"));
                return;
            }
            return;
        }
    }
    // Match reject for courier
    const rejectMatch = data.match(/^order_reject_(.+)_courier$/);
    if (rejectMatch) {
        const orderId = rejectMatch[1];
        // Show reason picker
        yield ctx.reply((0, i18n_1.t)(ctx, "pleaseProvideRejectionReason"));
        customReasonMap.set(userId, { orderId, role: "courier" });
        return;
    }
    // Match shop accept for shop owner
    const shopAcceptMatch = data.match(/^order_shop_accept_(.+)$/);
    if (shopAcceptMatch) {
        const orderId = shopAcceptMatch[1];
        const order = yield Order_1.default.findById(orderId);
        if (!order)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderNotFound"));
        if (!ctx.from)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFound"));
        const user = yield User_1.default.findOne({ telegramId: userId });
        if (!user)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFoundInDB"));
        if (user.role === "shop_owner") {
            if (order.status === "operator_confirmed") {
                yield Order_1.default.updateStatus(orderId, "packing", user._id.toString());
                yield ctx.editMessageReplyMarkup({ inline_keyboard: [] });
                yield ctx.reply((0, i18n_1.t)(ctx, "orderAcceptedPackingStage"));
                // Send order status update to orders group
                const Shop = require("../models/Shop").default;
                const shop = yield Shop.findById(order.shopId);
                if (shop) {
                    yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, "packing", user);
                }
                // Update notification: show only 'Finish Packing' button
                let orderText = `📦 <b>${(0, i18n_1.t)(ctx, "orderPackingStage")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                orderText += `<b>${(0, i18n_1.t)(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
                orderText += `\n<b>${(0, i18n_1.t)(ctx, "productsLabel")}</b>`;
                for (const item of order.items) {
                    orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
                }
                orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
                orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "nextStepLabel")}:</b> ${(0, i18n_1.t)(ctx, "pressFinishPacking")}`;
                yield ctx.telegram.sendMessage(user.telegramId, orderText, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '📦 ' + (0, i18n_1.t)(ctx, "finishPackingBtn"), callback_data: `order_shop_finish_packing_${order._id}` }
                            ]
                        ]
                    }
                });
            }
            else {
                yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderCannotBeAccepted"));
                return;
            }
            return;
        }
    }
    // Match finish packing for shop owner
    const finishPackingMatch = data.match(/^order_shop_finish_packing_(.+)$/);
    if (finishPackingMatch) {
        const orderId = finishPackingMatch[1];
        const order = yield Order_1.default.findById(orderId);
        if (!order)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderNotFound"));
        if (!ctx.from)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFound"));
        const user = yield User_1.default.findOne({ telegramId: userId });
        if (!user)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFoundInDB"));
        if (user.role === "shop_owner") {
            if (order.status === "packing") {
                yield Order_1.default.updateStatus(orderId, "packed", user._id.toString());
                yield ctx.editMessageReplyMarkup({ inline_keyboard: [] });
                yield ctx.reply((0, i18n_1.t)(ctx, "packingFinishedSentToCouriers"));
                // Send order status update to orders group
                const Shop = require("../models/Shop").default;
                const shop = yield Shop.findById(order.shopId);
                if (shop) {
                    yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, "packed", user);
                }
                // Send to all couriers with 'Picked up' and 'Reject' buttons
                const couriers = yield User_1.default.find({ role: "courier" });
                let orderText = `🚚 <b>${(0, i18n_1.t)(ctx, "orderReadyLabel")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                orderText += `<b>${(0, i18n_1.t)(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
                orderText += `\n<b>${(0, i18n_1.t)(ctx, "productsLabel")}</b>`;
                for (const item of order.items) {
                    orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
                }
                orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
                orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "nextStepLabel")}:</b> ${(0, i18n_1.t)(ctx, "pressPickedUpOrReject")}`;
                for (const courier of couriers) {
                    if (courier.telegramId && /^\d+$/.test(courier.telegramId)) {
                        // Send order details message
                        yield ctx.telegram.sendMessage(courier.telegramId, orderText, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: '🚚 ' + (0, i18n_1.t)(ctx, "pickedUpBtn"), callback_data: `order_courier_picked_${order._id}` },
                                        { text: '❌ ' + (0, i18n_1.t)(ctx, "rejectBtn"), callback_data: `order_courier_reject_${order._id}` }
                                    ]
                                ]
                            }
                        });
                        // Send delivery location to courier
                        if (order.deliveryAddress && order.deliveryAddress.coordinates) {
                            const locationText = `📍 <b>${(0, i18n_1.t)(ctx, "deliveryLocationLabel")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                            const addressText = `${order.deliveryAddress.street}, ${order.deliveryAddress.district}, ${order.deliveryAddress.city}`;
                            // Send location message with address
                            yield ctx.telegram.sendMessage(courier.telegramId, locationText + addressText, { parse_mode: 'HTML' });
                            // Send actual location coordinates
                            yield ctx.telegram.sendLocation(courier.telegramId, order.deliveryAddress.coordinates.lat, order.deliveryAddress.coordinates.lng);
                        }
                    }
                    else {
                        console.error('[Order Notify] Invalid or missing telegramId for courier:', courier);
                    }
                }
            }
            else {
                yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderCannotBeFinished"));
                return;
            }
            return;
        }
    }
    // Match shop reject for shop owner
    const shopRejectMatch = data.match(/^order_shop_reject_(.+)$/);
    if (shopRejectMatch) {
        const orderId = shopRejectMatch[1];
        const order = yield Order_1.default.findById(orderId);
        if (!order)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderNotFound"));
        if (!ctx.from)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFound"));
        const user = yield User_1.default.findOne({ telegramId: userId });
        if (!user)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFoundInDB"));
        if (user.role === "shop_owner") {
            if (order.status === "operator_confirmed") {
                yield Order_1.default.updateStatus(orderId, "rejected_by_shop", user._id.toString());
                yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderRejectedByShopOwner"));
                // Send order status update to orders group
                const Shop = require("../models/Shop").default;
                const shop = yield Shop.findById(order.shopId);
                if (shop) {
                    yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, "rejected_by_shop", user);
                }
            }
            else {
                yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderCannotBeRejected"));
                return;
            }
            return;
        }
    }
    // Match courier picked up
    const courierPickedMatch = data.match(/^order_courier_picked_(.+)$/);
    if (courierPickedMatch) {
        const orderId = courierPickedMatch[1];
        const order = yield Order_1.default.findById(orderId);
        if (!order)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderNotFound"));
        if (!ctx.from)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFound"));
        const user = yield User_1.default.findOne({ telegramId: userId });
        if (!user)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFoundInDB"));
        if (user.role === "courier") {
            if (order.status === "packed") {
                yield Order_1.default.updateStatus(orderId, "courier_picked", user._id.toString());
                yield ctx.editMessageReplyMarkup({ inline_keyboard: [] });
                yield ctx.reply((0, i18n_1.t)(ctx, "orderPickedUp"));
                // Send order status update to orders group
                const Shop = require("../models/Shop").default;
                const shop = yield Shop.findById(order.shopId);
                if (shop) {
                    yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, "courier_picked", user);
                }
                // Update notification: show only 'Delivered' button
                let orderText = `🚚 <b>${(0, i18n_1.t)(ctx, "orderOnTheWay")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                orderText += `<b>${(0, i18n_1.t)(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
                orderText += `\n<b>${(0, i18n_1.t)(ctx, "productsLabel")}:</b>`;
                for (const item of order.items) {
                    orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
                }
                orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
                orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "nextStepLabel")}:</b> ${(0, i18n_1.t)(ctx, "pressDeliveredWhenDone")}`;
                // Send the order details message
                yield ctx.telegram.sendMessage(user.telegramId, orderText, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: `📦 ${(0, i18n_1.t)(ctx, "deliveredBtn")}`, callback_data: `order_courier_delivered_${order._id}` }
                            ]
                        ]
                    }
                });
                // Send delivery location to courier when picking up
                if (order.deliveryAddress && order.deliveryAddress.coordinates) {
                    const locationText = `📍 <b>${(0, i18n_1.t)(ctx, "deliveryLocationLabel")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                    const addressText = `${order.deliveryAddress.street}, ${order.deliveryAddress.district}, ${order.deliveryAddress.city}`;
                    // Send location message with address
                    yield ctx.telegram.sendMessage(user.telegramId, locationText + addressText, { parse_mode: 'HTML' });
                    // Send actual location coordinates
                    yield ctx.telegram.sendLocation(user.telegramId, order.deliveryAddress.coordinates.lat, order.deliveryAddress.coordinates.lng);
                }
            }
            else {
                yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderCannotBePickedUp"));
                return;
            }
            return;
        }
    }
    // Match courier delivered
    const courierDeliveredMatch = data.match(/^order_courier_delivered_(.+)$/);
    if (courierDeliveredMatch) {
        const orderId = courierDeliveredMatch[1];
        const order = yield Order_1.default.findById(orderId);
        if (!order)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderNotFound"));
        if (!ctx.from)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFound"));
        const user = yield User_1.default.findOne({ telegramId: userId });
        if (!user)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFoundInDB"));
        if (user.role === "courier") {
            if (order.status === "courier_picked") {
                yield Order_1.default.updateStatus(orderId, "delivered", user._id.toString());
                yield ctx.editMessageReplyMarkup({ inline_keyboard: [] });
                yield ctx.reply((0, i18n_1.t)(ctx, "orderDelivered"));
                // Send order status update to orders group
                const Shop = require("../models/Shop").default;
                const shop = yield Shop.findById(order.shopId);
                if (shop) {
                    yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, "delivered", user);
                }
                // Send notification with 'Client paid' and 'Client rejected' buttons
                let orderText = `✅ <b>${(0, i18n_1.t)(ctx, "orderDeliveredLabel")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                orderText += `<b>${(0, i18n_1.t)(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
                orderText += `\n<b>${(0, i18n_1.t)(ctx, "productsLabel")}:</b>`;
                for (const item of order.items) {
                    orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
                }
                orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
                orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "nextStepLabel")}:</b> ${(0, i18n_1.t)(ctx, "pressPaidOrRejected")}`;
                // Send the order details message
                yield ctx.telegram.sendMessage(user.telegramId, orderText, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: `💵 ${(0, i18n_1.t)(ctx, "clientPaidBtn")}`, callback_data: `order_client_paid_${order._id}` },
                                { text: `❌ ${(0, i18n_1.t)(ctx, "clientRejectedBtn")}`, callback_data: `order_client_rejected_${order._id}` }
                            ]
                        ]
                    }
                });
                // Send delivery location to courier
                if (order.deliveryAddress && order.deliveryAddress.coordinates) {
                    const locationText = `📍 <b>${(0, i18n_1.t)(ctx, "deliveryLocationLabel")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                    const addressText = `${order.deliveryAddress.street}, ${order.deliveryAddress.district}, ${order.deliveryAddress.city}`;
                    // Send location message with address
                    yield ctx.telegram.sendMessage(user.telegramId, locationText + addressText, { parse_mode: 'HTML' });
                    // Send actual location coordinates
                    yield ctx.telegram.sendLocation(user.telegramId, order.deliveryAddress.coordinates.lat, order.deliveryAddress.coordinates.lng);
                }
            }
            else {
                yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderCannotBeDelivered"));
                return;
            }
            return;
        }
    }
    // Match client paid
    const clientPaidMatch = data.match(/^order_client_paid_(.+)$/);
    if (clientPaidMatch) {
        const orderId = clientPaidMatch[1];
        const order = yield Order_1.default.findById(orderId);
        if (!order)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderNotFound"));
        if (!ctx.from)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFound"));
        const user = yield User_1.default.findOne({ telegramId: userId });
        if (!user)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFoundInDB"));
        // Anyone pressing this is allowed to finish the order
        if (order.status === "delivered") {
            yield Order_1.default.updateStatus(orderId, "paid", user._id.toString());
            yield ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            yield ctx.reply((0, i18n_1.t)(ctx, "orderPaidFinal"));
            // Send order status update to orders group
            const Shop = require("../models/Shop").default;
            const shop = yield Shop.findById(order.shopId);
            if (shop) {
                yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, "paid", user);
            }
            // Optionally, send a final notification to shop/courier/client
        }
        else {
            yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderCannotBePaid"));
            return;
        }
        return;
    }
    // Match client rejected
    const clientRejectedMatch = data.match(/^order_client_rejected_(.+)$/);
    if (clientRejectedMatch) {
        const orderId = clientRejectedMatch[1];
        const order = yield Order_1.default.findById(orderId);
        if (!order)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderNotFound"));
        if (!ctx.from)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFound"));
        const user = yield User_1.default.findOne({ telegramId: userId });
        if (!user)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFoundInDB"));
        if (order.status === "delivered") {
            // Prompt for rejection reason
            yield ctx.reply((0, i18n_1.t)(ctx, "pleaseProvideRejectionReason"));
            customReasonMap.set(userId, { orderId, role: "client_reject" });
        }
        else {
            yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderCannotBeRejected"));
            return;
        }
        return;
    }
    // Match admin status change
    const adminStatusMatch = data.match(/^admin_status_(.+)_(.+)$/);
    if (adminStatusMatch) {
        const newStatus = adminStatusMatch[1];
        const orderId = adminStatusMatch[2];
        const order = yield Order_1.default.findById(orderId);
        if (!order)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderNotFound"));
        if (!ctx.from)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFound"));
        const user = yield User_1.default.findOne({ telegramId: userId });
        if (!user)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFoundInDB"));
        // Check if user is admin or operator
        if (user.role === "admin" || user.role === "operator") {
            // If rejecting, prompt for reason
            if (newStatus === "rejected_by_courier" || newStatus === "rejected_by_shop") {
                yield ctx.reply((0, i18n_1.t)(ctx, "enterRejectionReason"));
                customReasonMap.set(userId, { orderId, role: "admin", isAdminRejection: true });
                return;
            }
            // Update order status
            yield Order_1.default.updateStatus(orderId, newStatus, user._id.toString());
            // Send confirmation
            yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderStatusChanged", { status: newStatus }));
            // Send updated status to orders group
            const Shop = require("../models/Shop").default;
            const shop = yield Shop.findById(order.shopId);
            if (shop) {
                yield (0, orderGroupNotifier_1.sendOrderStatusUpdateToGroup)(ctx.telegram, order, shop, newStatus, user);
            }
            // Handle special cases for status changes
            if (newStatus === "operator_confirmed") {
                // Send to shop owner if order was confirmed
                if (shop && shop.ownerId) {
                    const shopOwner = yield User_1.default.findById(shop.ownerId);
                    if (shopOwner && shopOwner.telegramId && /^\d+$/.test(shopOwner.telegramId)) {
                        let orderText = `🆕🛒 <b>${(0, i18n_1.t)(ctx, "newOrderLabel")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                        orderText += `<b>${(0, i18n_1.t)(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
                        orderText += `\n<b>${(0, i18n_1.t)(ctx, "productsLabel")}</b>`;
                        for (const item of order.items) {
                            orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
                        }
                        orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
                        orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "nextStepLabel")}:</b> ${(0, i18n_1.t)(ctx, "acceptOrRejectOrder")}`;
                        yield ctx.telegram.sendMessage(shopOwner.telegramId, orderText, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: '✅ ' + (0, i18n_1.t)(ctx, "acceptBtn"), callback_data: `order_shop_accept_${order._id}` },
                                        { text: '❌ ' + (0, i18n_1.t)(ctx, "rejectBtn"), callback_data: `order_shop_reject_${order._id}` }
                                    ]
                                ]
                            }
                        });
                    }
                }
            }
            else if (newStatus === "packed") {
                // Send to all couriers if order was packed
                const couriers = yield User_1.default.find({ role: "courier" });
                let orderText = `🚚 <b>${(0, i18n_1.t)(ctx, "orderReadyLabel")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                orderText += `<b>${(0, i18n_1.t)(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
                orderText += `\n<b>${(0, i18n_1.t)(ctx, "productsLabel")}</b>`;
                for (const item of order.items) {
                    orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
                }
                orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
                orderText += `\n\n<b>${(0, i18n_1.t)(ctx, "nextStepLabel")}:</b> ${(0, i18n_1.t)(ctx, "pressPickedUpOrReject")}`;
                for (const courier of couriers) {
                    if (courier.telegramId && /^\d+$/.test(courier.telegramId)) {
                        // Send order details message
                        yield ctx.telegram.sendMessage(courier.telegramId, orderText, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: '🚚 ' + (0, i18n_1.t)(ctx, "pickedUpBtn"), callback_data: `order_courier_picked_${order._id}` },
                                        { text: '❌ ' + (0, i18n_1.t)(ctx, "rejectBtn"), callback_data: `order_courier_reject_${order._id}` }
                                    ]
                                ]
                            }
                        });
                        // Send delivery location to courier
                        if (order.deliveryAddress && order.deliveryAddress.coordinates) {
                            const locationText = `📍 <b>${(0, i18n_1.t)(ctx, "deliveryLocationLabel")}</b>\n<b>${(0, i18n_1.t)(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
                            const addressText = `${order.deliveryAddress.street}, ${order.deliveryAddress.district}, ${order.deliveryAddress.city}`;
                            // Send location message with address
                            yield ctx.telegram.sendMessage(courier.telegramId, locationText + addressText, { parse_mode: 'HTML' });
                            // Send actual location coordinates
                            yield ctx.telegram.sendLocation(courier.telegramId, order.deliveryAddress.coordinates.lat, order.deliveryAddress.coordinates.lng);
                        }
                    }
                }
            }
        }
        else {
            yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "noPermissionToChangeStatus"));
            return;
        }
        return;
    }
}));
exports.default = courierBot;
// Launch the bot if this file is run directly
courierBot
    .launch()
    .then(() => {
    console.log("[courierBot] Bot started");
})
    .catch((err) => {
    console.error("[courierBot] Failed to start:", err);
});
