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
      if (!state || state.step !== "language") {
        console.log(
          "[mainBot] .hears: No state or not at language step. State:",
          state
        );
        return;
      }
      // Match language by label+emoji
      const lang = LANGUAGES.find((l) => text.startsWith(l.label));
      console.log("[mainBot] .hears: Matched lang:", lang);
      if (!lang) return;
      state.language = lang.code;
      state.step = "location";
      await ctx.reply(
        t(ctx, "shareLocation"),
        Markup.keyboard([
          [Markup.button.locationRequest(t(ctx, "shareLocationBtn"))],
        ])
          .oneTime()
          .resize()
      );
      console.log("[mainBot] .hears: Sent location request");
    }
  }
);

mainBot.start(async (ctx: CustomContext) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);
  const user = await User.findOne({ telegramId });
  if (user) {
    sessionUserMap.set(ctx, user);
    await ctx.reply(t(ctx, "alreadyRegistered"));
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
  }
  registrationState.set(telegramId, { step: "contact" });
  await ctx.reply(
    t(ctx, "welcome"),
    Markup.keyboard([[Markup.button.contactRequest(t(ctx, "shareContact"))]])
      .oneTime()
      .resize()
  );
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
    if (!state || state.step !== "location") {
      console.log(
        "[mainBot] .on(message/location): No state or not at location step. State:",
        state
      );
      return;
    }
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
        await ctx.reply(t(ctx, "shopArea", { shop: shop.name }));
        // Optionally, you may want to skip the rest of registration for existing users
        return;
      }
      // Store shopId in registration state for new users
      state.shopId = shop._id;
      console.log(
        `[mainBot] Storing shopId in registration state for new user: telegramId=${telegramId}, shopId=${shop._id}`
      );
      // 🎉 Emoji-rich confirmation
      await ctx.reply(t(ctx, "shopArea", { shop: shop.name }));
      state.step = "apartment";
      await ctx.reply(t(ctx, "enterApartment"));
      console.log("[mainBot] .on(message/location): Prompted for apartment");
    } else {
      // 🚫 Out of service area message
      await ctx.reply(t(ctx, "outOfService"));
      registrationState.delete(telegramId);
      console.log(
        "[mainBot] .on(message/location): Out of service area, registration state deleted"
      );
      return;
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

  // Handle text messages (apartment, block, entrance, custom reason)
  if ("text" in ctx.message && typeof ctx.message.text === "string") {
    console.log("[mainBot] .on(text) triggered with text:", ctx.message.text);
    const userId = String(ctx.from.id);
    const telegramId = userId;
    const state = registrationState.get(telegramId);
    if (!state) return;
    if (customReasonMap.has(userId)) {
      const { orderId, role } = customReasonMap.get(userId);
      const customReason =
        ctx.message && "text" in ctx.message ? ctx.message["text"] : "";
      if (!ctx.from) return;
      const order = await Order.findById(orderId);
      if (order) {
        await Order.updateStatus(
          orderId,
          "rejected",
          String(ctx.from.id),
          customReason
        );
        await ctx.reply("Order rejected.");
      }
      customReasonMap.delete(userId);
      return;
    }
    if (state.step === "apartment") {
      state.apartment = ctx.message.text;
      state.step = "block";
      await ctx.reply(t(ctx, "enterBlock"));
      return;
    }
    if (state.step === "block") {
      state.block = ctx.message.text;
      state.step = "entrance";
      await ctx.reply(t(ctx, "enterEntrance"));
      return;
    }
    if (state.step === "entrance") {
      state.entrance = ctx.message.text;
      // Registration complete, save user
      const user = new User({
        telegramId,
        firstName: state.firstName || ctx.from.first_name,
        lastName: state.lastName || ctx.from.last_name,
        phoneNumber: state.phoneNumber,
        role: "client",
        status: "active",
        shopId: state.shopId, // <-- Add shopId from registration state
        preferences: {
          language: state.language, // Save picked language
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
            apartment: state.apartment,
            block: state.block,
            entrance: state.entrance,
          },
        ],
      });
      await user.save();
      console.log("[DEBUG] shopId type:", typeof state.shopId);
      console.log("[DEBUG] shopId value:", state.shopId);
      console.log(
        "[DEBUG] Is valid ObjectId:",
        mongoose.Types.ObjectId.isValid(state.shopId)
      );
      console.log(
        `[mainBot] New user registered with shopId: userId=${user._id}, telegramId=${telegramId}, shopId=${user.shopId}`
      );
      registrationState.delete(telegramId);
      await ctx.reply(t(ctx, "registrationComplete"));
      // Send Telegram Mini App launch button
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
    if (!order) return ctx.answerCbQuery("Order not found");
    if (!ctx.from) return ctx.answerCbQuery("User not found");
    if (order.status === "created") {
      await Order.updateStatus(orderId, "packing", String(ctx.from.id));
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply("Order packed!");
    } else if (order.status === "packing") {
      await Order.updateStatus(orderId, "courier_picked", String(ctx.from.id));
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply("Order picked by courier!");
    } else {
      await ctx.answerCbQuery("No further action.");
      return;
    }
    return;
  }
  // Match reject for shop
  const rejectMatch = data.match(/^order_reject_(.+)_shop$/);
  if (rejectMatch) {
    const orderId = rejectMatch[1];
    await ctx.reply("Please provide a reason for rejection:");
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
