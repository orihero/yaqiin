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
console.log("[mainBot] File loaded");
// @ts-ignore
const telegraf_1 = require("telegraf");
const User_1 = __importDefault(require("../models/User"));
const geoHelper_1 = require("../utils/geoHelper");
const Order_1 = __importDefault(require("../models/Order")); // Added import for Order
const i18n_1 = require("../utils/i18n");
console.log("[mainBot] TOKEN:", process.env.MAIN_BOT_TOKEN);
const token = process.env.MAIN_BOT_TOKEN;
if (!token) {
    throw new Error("MAIN_BOT_TOKEN is not set in environment variables");
}
const mainBot = new telegraf_1.Telegraf(token);
// Universal message logger for debugging (middleware)
mainBot.use((ctx, next) => {
    if (ctx.message) {
        console.log("[mainBot] .on(message) raw:", JSON.stringify(ctx.message, null, 2));
    }
    return next();
});
// Registration wizard state
const registrationState = new Map();
const LANGUAGES = [
    { code: "uz", label: "Oʻzbekcha" },
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
];
// Store session user for translation context
const sessionUserMap = new WeakMap();
// Attach to ctx for i18n context
mainBot.use((ctx, next) => {
    ctx.registrationState = registrationState;
    ctx.sessionUserMap = sessionUserMap;
    return next();
});
// Function to generate main menu keyboard
function getMainMenuKeyboard(ctx) {
    return telegraf_1.Markup.keyboard([
        [(0, i18n_1.t)(ctx, "myOrders"), (0, i18n_1.t)(ctx, "settings")]
    ]).resize();
}
// Function to generate settings menu keyboard
function getSettingsMenuKeyboard(ctx) {
    return telegraf_1.Markup.keyboard([
        [(0, i18n_1.t)(ctx, "changeLocation"), (0, i18n_1.t)(ctx, "changeLanguage")],
        ["🔙 " + (0, i18n_1.t)(ctx, "back")]
    ]).resize();
}
// Function to show main menu
function showMainMenu(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.reply((0, i18n_1.t)(ctx, "greeting"), getMainMenuKeyboard(ctx));
    });
}
// Function to send shop information with photo
function sendShopInfo(ctx, shop) {
    return __awaiter(this, void 0, void 0, function* () {
        const shopMessage = (0, i18n_1.t)(ctx, "shopArea", { shop: shop.name });
        if (shop.photo) {
            // Send photo with caption
            yield ctx.replyWithPhoto(shop.photo, {
                caption: shopMessage
            });
        }
        else {
            // Send text only if no photo available
            yield ctx.reply(shopMessage);
        }
    });
}
// Move .hears handler registration here, before any .on('message') or .on('text') handlers
mainBot.hears(LANGUAGES.map((l) => l.label + (l.code === "uz" ? " 🇺🇿" : l.code === "ru" ? " 🇷🇺" : " 🇬🇧")), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.from)
        return;
    if (ctx.message &&
        "text" in ctx.message &&
        typeof ctx.message.text === "string") {
        const { text } = ctx.message;
        const telegramId = String(ctx.from.id);
        const state = registrationState.get(telegramId);
        console.log("[mainBot] .hears triggered with text:", text);
        console.log("[mainBot] registrationState for", telegramId, ":", state);
        // Match language by label+emoji
        const lang = LANGUAGES.find((l) => text.startsWith(l.label));
        console.log("[mainBot] .hears: Matched lang:", lang);
        if (!lang)
            return;
        if (state && state.step === "language") {
            // Registration flow
            state.language = lang.code;
            state.step = "location";
            console.log("[mainBot] .hears: Set language in registration state:", lang.code);
            yield ctx.reply((0, i18n_1.t)(ctx, "shareLocation"), telegraf_1.Markup.keyboard([
                [telegraf_1.Markup.button.locationRequest((0, i18n_1.t)(ctx, "shareLocationBtn"))],
            ])
                .oneTime()
                .resize());
            console.log("[mainBot] .hears: Sent location request");
        }
        else {
            // Settings flow - update existing user's language
            const user = yield User_1.default.findOne({ telegramId });
            if (user) {
                sessionUserMap.set(ctx, user);
                user.preferences = user.preferences || {};
                user.preferences.language = lang.code;
                yield user.save();
                yield ctx.reply((0, i18n_1.t)(ctx, "languageUpdated"));
                yield showMainMenu(ctx);
            }
        }
    }
}));
mainBot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.from)
        return;
    const telegramId = String(ctx.from.id);
    const user = yield User_1.default.findOne({ telegramId });
    if (user) {
        sessionUserMap.set(ctx, user);
        yield showMainMenu(ctx);
        return;
    }
    registrationState.set(telegramId, { step: "contact" });
    yield ctx.reply((0, i18n_1.t)(ctx, "welcome"), telegraf_1.Markup.keyboard([[telegraf_1.Markup.button.contactRequest((0, i18n_1.t)(ctx, "shareContact"))]])
        .oneTime()
        .resize());
}));
// Add /menu command to show main menu
mainBot.command('menu', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.from)
        return;
    const telegramId = String(ctx.from.id);
    const user = yield User_1.default.findOne({ telegramId });
    if (user) {
        sessionUserMap.set(ctx, user);
        yield showMainMenu(ctx);
    }
    else {
        yield ctx.reply((0, i18n_1.t)(ctx, "unknownCommand"));
    }
}));
// Temporary map for custom reason input
const customReasonMap = new Map();
mainBot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.from || !ctx.message)
        return;
    // Handle location messages
    if ("location" in ctx.message && ctx.message.location) {
        const telegramId = String(ctx.from.id);
        const state = registrationState.get(telegramId);
        console.log("[mainBot] .on(message/location) triggered for", telegramId);
        console.log("[mainBot] registrationState for", telegramId, ":", state);
        if (state && state.step === "location") {
            // Registration flow
            state.location = ctx.message.location;
            console.log("[mainBot] .on(message/location): Received location:", ctx.message.location);
            // 🌍 Shop assignment logic
            const userLat = ctx.message.location.latitude;
            const userLng = ctx.message.location.longitude;
            const shop = yield (0, geoHelper_1.findShopForLocation)(userLat, userLng);
            console.log("[mainBot] .on(message/location): Shop found:", shop);
            if (shop) {
                // Check if user already exists
                const existingUser = yield User_1.default.findOne({ telegramId });
                if (existingUser) {
                    // Update shopId for existing user
                    console.log(`[mainBot] Assigning shopId to existing user: userId=${existingUser._id}, telegramId=${telegramId}, shopId=${shop._id}`);
                    existingUser.shopId = shop._id;
                    yield existingUser.save();
                    console.log(`[mainBot] shopId assigned and saved for existing user: userId=${existingUser._id}, shopId=${existingUser.shopId}`);
                    // Set user in session for proper language detection
                    sessionUserMap.set(ctx, existingUser);
                    yield sendShopInfo(ctx, shop);
                    yield showMainMenu(ctx);
                    return;
                }
                // Store shopId and location in registration state for new users
                state.shopId = shop._id;
                state.location = ctx.message.location;
                console.log(`[mainBot] Storing shopId and location in registration state for new user: telegramId=${telegramId}, shopId=${shop._id}`);
                // Move to building number step
                state.step = "building";
                yield ctx.reply((0, i18n_1.t)(ctx, "enterBlock"));
                return;
            }
            else {
                // 🚫 Out of service area message
                yield ctx.reply((0, i18n_1.t)(ctx, "outOfService"));
                registrationState.delete(telegramId);
                console.log("[mainBot] .on(message/location): Out of service area, registration state deleted");
                return;
            }
        }
        else {
            // Location update for existing user (from settings)
            const user = yield User_1.default.findOne({ telegramId });
            if (user) {
                sessionUserMap.set(ctx, user);
                const userLat = ctx.message.location.latitude;
                const userLng = ctx.message.location.longitude;
                const shop = yield (0, geoHelper_1.findShopForLocation)(userLat, userLng);
                if (shop) {
                    user.shopId = shop._id;
                    if (user.addresses && user.addresses.length > 0) {
                        user.addresses[0].coordinates = {
                            lat: userLat,
                            lng: userLng,
                        };
                    }
                    yield user.save();
                    yield sendShopInfo(ctx, shop);
                    yield ctx.reply((0, i18n_1.t)(ctx, "locationUpdated"));
                    yield showMainMenu(ctx);
                }
                else {
                    yield ctx.reply((0, i18n_1.t)(ctx, "outOfService"));
                    yield showMainMenu(ctx);
                }
            }
        }
        return;
    }
    // Handle contact messages
    if ("contact" in ctx.message && ctx.message.contact) {
        const telegramId = String(ctx.from.id);
        const state = registrationState.get(telegramId);
        if (!state || state.step !== "contact")
            return;
        state.phoneNumber = ctx.message.contact.phone_number;
        state.firstName = ctx.message.contact.first_name;
        state.lastName = ctx.message.contact.last_name;
        state.step = "language";
        yield ctx.reply((0, i18n_1.t)(ctx, "selectLanguage"), telegraf_1.Markup.keyboard([
            LANGUAGES.map((l) => l.label +
                (l.code === "uz" ? " 🇺🇿" : l.code === "ru" ? " 🇷🇺" : " 🇬🇧")),
        ])
            .oneTime()
            .resize());
        return;
    }
    // Handle text messages
    if ("text" in ctx.message && typeof ctx.message.text === "string") {
        console.log("[mainBot] .on(text) triggered with text:", ctx.message.text);
        const userId = String(ctx.from.id);
        const telegramId = userId;
        // Handle custom reason input
        if (customReasonMap.has(userId)) {
            const { orderId, role } = customReasonMap.get(userId);
            const customReason = ctx.message.text;
            if (!ctx.from)
                return;
            const order = yield Order_1.default.findById(orderId);
            if (order) {
                yield Order_1.default.updateStatus(orderId, "rejected_by_shop", String(ctx.from.id), customReason);
                yield ctx.reply((0, i18n_1.t)(ctx, "orderRejected"));
            }
            customReasonMap.delete(userId);
            return;
        }
        // Handle menu commands
        const user = yield User_1.default.findOne({ telegramId });
        if (user) {
            sessionUserMap.set(ctx, user);
            const text = ctx.message.text;
            // Main menu options
            if (text === (0, i18n_1.t)(ctx, "myOrders")) {
                // Get user's orders
                const orders = yield Order_1.default.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
                if (orders.length === 0) {
                    yield ctx.reply((0, i18n_1.t)(ctx, "noOrdersYet"));
                    yield ctx.reply((0, i18n_1.t)(ctx, "openMiniApp"), telegraf_1.Markup.inlineKeyboard([
                        telegraf_1.Markup.button.webApp((0, i18n_1.t)(ctx, "openMiniAppBtn"), "https://yaqiin-frontend.vercel.app/?expand=true&disable_closing=true"),
                    ]));
                }
                else {
                    let message = (0, i18n_1.t)(ctx, "recentOrders");
                    orders.forEach((order, index) => {
                        const status = (0, i18n_1.t)(ctx, `status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`);
                        const currency = (0, i18n_1.t)(ctx, "currency");
                        message += `${index + 1}. ${(0, i18n_1.t)(ctx, "orderNumber")}${order._id.toString().slice(-6)}\n`;
                        message += `   💰 ${order.total} ${currency}\n`;
                        message += `   📊 ${status}\n\n`;
                    });
                    yield ctx.reply(message);
                }
                return;
            }
            if (text === (0, i18n_1.t)(ctx, "settings")) {
                yield ctx.reply((0, i18n_1.t)(ctx, "settings"), getSettingsMenuKeyboard(ctx));
                return;
            }
            // Settings menu options
            if (text === (0, i18n_1.t)(ctx, "changeLocation")) {
                yield ctx.reply((0, i18n_1.t)(ctx, "shareLocation"), telegraf_1.Markup.keyboard([
                    [telegraf_1.Markup.button.locationRequest((0, i18n_1.t)(ctx, "shareLocationBtn"))],
                ])
                    .oneTime()
                    .resize());
                return;
            }
            if (text === (0, i18n_1.t)(ctx, "changeLanguage")) {
                yield ctx.reply((0, i18n_1.t)(ctx, "selectLanguage"), telegraf_1.Markup.keyboard([
                    LANGUAGES.map((l) => l.label +
                        (l.code === "uz" ? " 🇺🇿" : l.code === "ru" ? " 🇷🇺" : " 🇬🇧")),
                ])
                    .oneTime()
                    .resize());
                return;
            }
            // Back button
            if (text.includes("🔙")) {
                yield showMainMenu(ctx);
                return;
            }
            // Unknown command - show greeting and main menu
            yield ctx.reply((0, i18n_1.t)(ctx, "unknownCommand"));
            yield showMainMenu(ctx);
            return;
        }
        // Handle registration state (if user is not registered)
        const state = registrationState.get(telegramId);
        if (!state) {
            yield ctx.reply((0, i18n_1.t)(ctx, "unknownCommand"));
            return;
        }
        // Handle building, entrance, and apartment number steps
        if (state.step === "building") {
            state.building = ctx.message.text;
            state.step = "entrance";
            yield ctx.reply((0, i18n_1.t)(ctx, "enterEntrance"));
            return;
        }
        if (state.step === "entrance") {
            state.entrance = ctx.message.text;
            state.step = "apartment";
            yield ctx.reply((0, i18n_1.t)(ctx, "enterApartment"));
            return;
        }
        if (state.step === "apartment") {
            state.apartment = ctx.message.text;
            // Complete registration with all details
            const user = new User_1.default({
                telegramId,
                firstName: state.firstName || ctx.from.first_name,
                lastName: state.lastName || ctx.from.last_name,
                phoneNumber: state.phoneNumber,
                role: "client",
                status: "active",
                shopId: state.shopId,
                preferences: {
                    language: state.language,
                    notifications: {
                        orderUpdates: true,
                        promotions: true,
                        newProducts: true,
                    },
                },
                addresses: [
                    {
                        title: "Telegram Location",
                        street: "",
                        city: "",
                        district: "",
                        postalCode: "",
                        building: state.building,
                        entrance: state.entrance,
                        apartment: state.apartment,
                        coordinates: {
                            lat: state.location.latitude,
                            lng: state.location.longitude,
                        },
                        isDefault: true,
                    },
                ],
            });
            yield user.save();
            console.log(`[mainBot] New user registered with complete details: userId=${user._id}, telegramId=${telegramId}, shopId=${user.shopId}`);
            registrationState.delete(telegramId);
            // Set user in session for proper language detection
            sessionUserMap.set(ctx, user);
            // Get shop info for welcome message
            const shop = yield (0, geoHelper_1.findShopForLocation)(state.location.latitude, state.location.longitude);
            if (shop) {
                // Send shop info with photo first
                yield sendShopInfo(ctx, shop);
            }
            // Send registration completion message
            yield ctx.reply((0, i18n_1.t)(ctx, "registrationComplete"), getMainMenuKeyboard(ctx));
            // Also send the mini app button
            yield ctx.reply((0, i18n_1.t)(ctx, "openMiniApp"), telegraf_1.Markup.inlineKeyboard([
                telegraf_1.Markup.button.webApp((0, i18n_1.t)(ctx, "openMiniAppBtn"), "https://yaqiin-frontend.vercel.app/?expand=true&disable_closing=true"),
            ]));
            return;
        }
    }
}));
mainBot.on("callback_query", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const cbq = ctx.callbackQuery;
    const data = cbq.data;
    if (!data)
        return;
    const userId = ctx.from && ctx.from.id ? String(ctx.from.id) : "";
    // Match next step for shop
    const nextMatch = data.match(/^order_next_(.+)_shop$/);
    if (nextMatch) {
        const orderId = nextMatch[1];
        const order = yield Order_1.default.findById(orderId);
        if (!order)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "orderNotFound"));
        if (!ctx.from)
            return ctx.answerCbQuery((0, i18n_1.t)(ctx, "userNotFound"));
        if (order.status === "created") {
            yield Order_1.default.updateStatus(orderId, "packing", String(ctx.from.id));
            yield ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            yield ctx.reply((0, i18n_1.t)(ctx, "orderPacked"));
        }
        else if (order.status === "packing") {
            yield Order_1.default.updateStatus(orderId, "courier_picked", String(ctx.from.id));
            yield ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            yield ctx.reply((0, i18n_1.t)(ctx, "orderPickedByCourier"));
        }
        else {
            yield ctx.answerCbQuery((0, i18n_1.t)(ctx, "noFurtherAction"));
            return;
        }
        return;
    }
    // Match reject for shop
    const rejectMatch = data.match(/^order_reject_(.+)_shop$/);
    if (rejectMatch) {
        const orderId = rejectMatch[1];
        yield ctx.reply((0, i18n_1.t)(ctx, "enterRejectionReason"));
        customReasonMap.set(userId, { orderId, role: "shop" });
        return;
    }
}));
mainBot
    .launch()
    .then(() => {
    console.log("Main Telegram bot started");
})
    .catch((err) => {
    console.error("[mainBot] Error starting bot:", err);
});
exports.default = mainBot;
