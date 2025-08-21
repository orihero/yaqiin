import dotenv from "dotenv";
dotenv.config();
console.log("[mainBot] File loaded");
// @ts-ignore
import { Markup, Telegraf, Context as TelegrafContext } from "telegraf";
import User from "../models/User";
import { findShopForLocation } from "../utils/geoHelper";
import Order from "../models/Order"; // Added import for Order
import { t, getLang } from "../utils/i18n";
import mongoose from "mongoose";

console.log("[mainBot] TOKEN:", process.env.MAIN_BOT_TOKEN);

const token = process.env.MAIN_BOT_TOKEN;
if (!token) {
  throw new Error("MAIN_BOT_TOKEN is not set in environment variables");
}

// Extend Telegraf context to include registrationState and sessionUserMap
interface CustomContext extends TelegrafContext {
  registrationState: Map<string, any>;
  sessionUserMap: WeakMap<any, any>;
}

const mainBot = new Telegraf<CustomContext>(token);

// Universal message logger for debugging (middleware)
mainBot.use((ctx, next) => {
  if (ctx.message) {
    console.log(
      "[mainBot] .on(message) raw:",
      JSON.stringify(ctx.message, null, 2)
    );
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
  (ctx as CustomContext).registrationState = registrationState;
  (ctx as CustomContext).sessionUserMap = sessionUserMap;
  return next();
});

// Function to generate main menu keyboard
function getMainMenuKeyboard(ctx: CustomContext) {
  return Markup.keyboard([
    [t(ctx, "myOrders"), t(ctx, "settings")]
  ]).resize();
}

// Function to generate settings menu keyboard
function getSettingsMenuKeyboard(ctx: CustomContext) {
  return Markup.keyboard([
    [t(ctx, "changeLocation"), t(ctx, "changeLanguage")],
    ["🔙 " + t(ctx, "back")]
  ]).resize();
}

// Function to show main menu
async function showMainMenu(ctx: CustomContext) {
  await ctx.reply(t(ctx, "greeting"), getMainMenuKeyboard(ctx));
}

// Move .hears handler registration here, before any .on('message') or .on('text') handlers
mainBot.hears(
  LANGUAGES.map(
    (l) => l.label + (l.code === "uz" ? " 🇺🇿" : l.code === "ru" ? " 🇷🇺" : " 🇬🇧")
  ),
  async (ctx: CustomContext) => {
    if (!ctx.from) return;
    if (
      ctx.message &&
      "text" in ctx.message &&
      typeof ctx.message.text === "string"
    ) {
      const { text } = ctx.message;
      const telegramId = String(ctx.from.id);
      const state = registrationState.get(telegramId);
      console.log("[mainBot] .hears triggered with text:", text);
      console.log("[mainBot] registrationState for", telegramId, ":", state);
      
      // Match language by label+emoji
      const lang = LANGUAGES.find((l) => text.startsWith(l.label));
      console.log("[mainBot] .hears: Matched lang:", lang);
      if (!lang) return;
      
             if (state && state.step === "language") {
         // Registration flow
         state.language = lang.code;
         state.step = "location";
         console.log("[mainBot] .hears: Set language in registration state:", lang.code);
         await ctx.reply(
           t(ctx, "shareLocation"),
           Markup.keyboard([
             [Markup.button.locationRequest(t(ctx, "shareLocationBtn"))],
           ])
             .oneTime()
             .resize()
         );
         console.log("[mainBot] .hears: Sent location request");
       } else {
        // Settings flow - update existing user's language
        const user = await User.findOne({ telegramId });
        if (user) {
          sessionUserMap.set(ctx, user);
          user.preferences = user.preferences || {};
          user.preferences.language = lang.code as "uz" | "ru" | "en";
          await user.save();
          await ctx.reply(t(ctx, "languageUpdated"));
          await showMainMenu(ctx);
        }
      }
    }
  }
);

mainBot.start(async (ctx: CustomContext) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);
  const user = await User.findOne({ telegramId });
  if (user) {
    sessionUserMap.set(ctx, user);
    await showMainMenu(ctx);
    return;
  }
  registrationState.set(telegramId, { step: "contact" });
  await ctx.reply(
    t(ctx, "welcome"),
    Markup.keyboard([[Markup.button.contactRequest(t(ctx, "shareContact"))]])
      .oneTime()
      .resize()
  );
});

// Add /menu command to show main menu
mainBot.command('menu', async (ctx: CustomContext) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);
  const user = await User.findOne({ telegramId });
  if (user) {
    sessionUserMap.set(ctx, user);
    await showMainMenu(ctx);
  } else {
    await ctx.reply(t(ctx, "unknownCommand"));
  }
});

// Temporary map for custom reason input
const customReasonMap = new Map();

mainBot.on("message", async (ctx: CustomContext) => {
  if (!ctx.from || !ctx.message) return;

  // Handle location messages
  if ("location" in ctx.message && ctx.message.location) {
    const telegramId = String(ctx.from.id);
    const state = registrationState.get(telegramId);
    console.log("[mainBot] .on(message/location) triggered for", telegramId);
    console.log("[mainBot] registrationState for", telegramId, ":", state);
    
    if (state && state.step === "location") {
      // Registration flow
      state.location = ctx.message.location;
      console.log(
        "[mainBot] .on(message/location): Received location:",
        ctx.message.location
      );

      // 🌍 Shop assignment logic
      const userLat = ctx.message.location.latitude;
      const userLng = ctx.message.location.longitude;
      const shop = await findShopForLocation(userLat, userLng);
      console.log("[mainBot] .on(message/location): Shop found:", shop);

      if (shop) {
        // Check if user already exists
        const existingUser = await User.findOne({ telegramId });
                 if (existingUser) {
           // Update shopId for existing user
           console.log(
             `[mainBot] Assigning shopId to existing user: userId=${existingUser._id}, telegramId=${telegramId}, shopId=${shop._id}`
           );
           existingUser.shopId = shop._id as import("mongoose").Types.ObjectId;
           await existingUser.save();
           console.log(
             `[mainBot] shopId assigned and saved for existing user: userId=${existingUser._id}, shopId=${existingUser.shopId}`
           );
           
           // Set user in session for proper language detection
           sessionUserMap.set(ctx, existingUser);
           
           await ctx.reply(t(ctx, "shopArea", { shop: shop.name }));
           await showMainMenu(ctx);
           return;
         }
        // Store shopId in registration state for new users
        state.shopId = shop._id;
        console.log(
          `[mainBot] Storing shopId in registration state for new user: telegramId=${telegramId}, shopId=${shop._id}`
        );
                 // Complete registration immediately without apartment/block/entrance
         const user = new User({
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
               coordinates: {
                 lat: state.location.latitude,
                 lng: state.location.longitude,
               },
               isDefault: true,
             },
           ],
         });
         await user.save();
         console.log(
           `[mainBot] New user registered with shopId: userId=${user._id}, telegramId=${telegramId}, shopId=${user.shopId}`
         );
         registrationState.delete(telegramId);
         
         // Set user in session for proper language detection
         sessionUserMap.set(ctx, user);
         
         // Send single welcome message with shop info and menu
         const welcomeMessage = `${t(ctx, "shopArea", { shop: shop.name })}\n\n${t(ctx, "registrationComplete")}`;
         await ctx.reply(welcomeMessage, getMainMenuKeyboard(ctx));
         
         // Also send the mini app button
         await ctx.reply(
           t(ctx, "openMiniApp"),
           Markup.inlineKeyboard([
             Markup.button.webApp(
               t(ctx, "openMiniAppBtn"),
               "https://yaqiin-frontend.vercel.app/"
             ),
           ])
         );
        return;
      } else {
        // 🚫 Out of service area message
        await ctx.reply(t(ctx, "outOfService"));
        registrationState.delete(telegramId);
        console.log(
          "[mainBot] .on(message/location): Out of service area, registration state deleted"
        );
        return;
      }
    } else {
      // Location update for existing user (from settings)
      const user = await User.findOne({ telegramId });
      if (user) {
        sessionUserMap.set(ctx, user);
        const userLat = ctx.message.location.latitude;
        const userLng = ctx.message.location.longitude;
        const shop = await findShopForLocation(userLat, userLng);
        
        if (shop) {
          user.shopId = shop._id as import("mongoose").Types.ObjectId;
          if (user.addresses && user.addresses.length > 0) {
            user.addresses[0].coordinates = {
              lat: userLat,
              lng: userLng,
            };
          }
          await user.save();
          await ctx.reply(t(ctx, "locationUpdated"));
          await showMainMenu(ctx);
        } else {
          await ctx.reply(t(ctx, "outOfService"));
          await showMainMenu(ctx);
        }
      }
    }
    return;
  }

  // Handle contact messages
  if ("contact" in ctx.message && ctx.message.contact) {
    const telegramId = String(ctx.from.id);
    const state = registrationState.get(telegramId);
    if (!state || state.step !== "contact") return;
    state.phoneNumber = ctx.message.contact.phone_number;
    state.firstName = ctx.message.contact.first_name;
    state.lastName = ctx.message.contact.last_name;
    state.step = "language";
    await ctx.reply(
      t(ctx, "selectLanguage"),
      Markup.keyboard([
        LANGUAGES.map(
          (l) =>
            l.label +
            (l.code === "uz" ? " 🇺🇿" : l.code === "ru" ? " 🇷🇺" : " 🇬🇧")
        ),
      ])
        .oneTime()
        .resize()
    );
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
      if (!ctx.from) return;
      const order = await Order.findById(orderId);
      if (order) {
        await Order.updateStatus(
          orderId,
          "rejected",
          String(ctx.from.id),
          customReason
        );
        await ctx.reply(t(ctx, "orderRejected"));
      }
      customReasonMap.delete(userId);
      return;
    }

    // Handle menu commands
    const user = await User.findOne({ telegramId });
    if (user) {
      sessionUserMap.set(ctx, user);
      
      const text = ctx.message.text;
      
      // Main menu options
      if (text === t(ctx, "myOrders")) {
        // Get user's orders
        const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
        if (orders.length === 0) {
          await ctx.reply(t(ctx, "noOrdersYet"));
          await ctx.reply(
            t(ctx, "openMiniApp"),
            Markup.inlineKeyboard([
              Markup.button.webApp(
                t(ctx, "openMiniAppBtn"),
                "https://yaqiin-frontend.vercel.app/"
              ),
            ])
          );
        } else {
          let message = t(ctx, "recentOrders");
          
          orders.forEach((order, index) => {
            const status = t(ctx, `status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`);
            const currency = t(ctx, "currency");
            message += `${index + 1}. ${t(ctx, "orderNumber")}${(order._id as any).toString().slice(-6)}\n`;
            message += `   💰 ${(order as any).total} ${currency}\n`;
            message += `   📊 ${status}\n\n`;
          });
          await ctx.reply(message);
        }
        return;
      }
      
      if (text === t(ctx, "settings")) {
        await ctx.reply(
          t(ctx, "settings"),
          getSettingsMenuKeyboard(ctx)
        );
        return;
      }
      
      // Settings menu options
      if (text === t(ctx, "changeLocation")) {
        await ctx.reply(
          t(ctx, "shareLocation"),
          Markup.keyboard([
            [Markup.button.locationRequest(t(ctx, "shareLocationBtn"))],
          ])
            .oneTime()
            .resize()
        );
        return;
      }
      
      if (text === t(ctx, "changeLanguage")) {
        await ctx.reply(
          t(ctx, "selectLanguage"),
          Markup.keyboard([
            LANGUAGES.map(
              (l) =>
                l.label +
                (l.code === "uz" ? " 🇺🇿" : l.code === "ru" ? " 🇷🇺" : " 🇬🇧")
            ),
          ])
            .oneTime()
            .resize()
        );
        return;
      }
      
      // Back button
      if (text.includes("🔙")) {
        await showMainMenu(ctx);
        return;
      }
      
      // Unknown command - show greeting and main menu
      await ctx.reply(t(ctx, "unknownCommand"));
      await showMainMenu(ctx);
      return;
    }

    // Handle registration state (if user is not registered)
    const state = registrationState.get(telegramId);
    if (!state) {
      await ctx.reply(t(ctx, "unknownCommand"));
      return;
    }
  }
});

mainBot.on("callback_query", async (ctx: CustomContext) => {
  const cbq = ctx.callbackQuery as any;
  const data = cbq.data;
  if (!data) return;
  const userId = ctx.from && ctx.from.id ? String(ctx.from.id) : "";
  // Match next step for shop
  const nextMatch = data.match(/^order_next_(.+)_shop$/);
  if (nextMatch) {
    const orderId = nextMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    if (order.status === "created") {
      await Order.updateStatus(orderId, "packing", String(ctx.from.id));
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply(t(ctx, "orderPacked"));
    } else if (order.status === "packing") {
      await Order.updateStatus(orderId, "courier_picked", String(ctx.from.id));
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply(t(ctx, "orderPickedByCourier"));
    } else {
      await ctx.answerCbQuery(t(ctx, "noFurtherAction"));
      return;
    }
    return;
  }
  // Match reject for shop
  const rejectMatch = data.match(/^order_reject_(.+)_shop$/);
  if (rejectMatch) {
    const orderId = rejectMatch[1];
    await ctx.reply(t(ctx, "enterRejectionReason"));
    customReasonMap.set(userId, { orderId, role: "shop" });
    return;
  }
});

mainBot
  .launch()
  .then(() => {
    console.log("Main Telegram bot started");
  })
  .catch((err) => {
    console.error("[mainBot] Error starting bot:", err);
  });

export default mainBot;
