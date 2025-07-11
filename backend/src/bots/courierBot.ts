import dotenv from "dotenv";
dotenv.config();
console.log("[courierBot] File loaded");
import { Telegraf, Context as TelegrafContext } from "telegraf";
import Group from "../models/Group";
import Order from "../models/Order";
import User from "../models/User";
import { t } from "../utils/i18n";

const token = process.env.COURIER_BOT_TOKEN;
if (!token) {
  throw new Error("COURIER_BOT_TOKEN is not set in environment variables");
}

// Extend Telegraf context to include registrationState
interface CustomContext extends TelegrafContext {
  registrationState: Map<string, any>;
}

const courierBot = new Telegraf<CustomContext>(token);

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
  (ctx as CustomContext).registrationState = registrationState;
  return next();
});

courierBot.start(async (ctx: CustomContext) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);
  registrationState.set(telegramId, { step: "code" });
  // Send welcome in all languages
  await ctx.reply(
    t(ctx, "courierWelcome", {}) +
      "\n\n" +
      t(
        {
          ...ctx,
          registrationState,
          from: { ...ctx.from, language_code: "ru" },
        },
        "courierWelcome",
        {}
      ) +
      "\n" +
      t(
        {
          ...ctx,
          registrationState,
          from: { ...ctx.from, language_code: "en" },
        },
        "courierWelcome",
        {}
      )
  );
  await ctx.reply(
    t(ctx, "courierAskCode", {}) +
      "\n" +
      t(
        {
          ...ctx,
          registrationState,
          from: { ...ctx.from, language_code: "ru" },
        },
        "courierAskCode",
        {}
      ) +
      "\n" +
      t(
        {
          ...ctx,
          registrationState,
          from: { ...ctx.from, language_code: "en" },
        },
        "courierAskCode",
        {}
      )
  );
});

courierBot.on("text", async (ctx: CustomContext) => {
  if (!ctx.from || !ctx.message) return;
  const telegramId = String(ctx.from.id);
  const state = registrationState.get(telegramId);
  const messageText =
    "text" in ctx.message && typeof ctx.message.text === "string"
      ? ctx.message.text
      : "";

  if (!state) return; // Only handle if in registration

  if (state.step === "code") {
    // Check if message is a 24-character user ID
    if (
      typeof messageText === "string" &&
      messageText.length === 24 &&
      /^[a-fA-F0-9]{24}$/.test(messageText)
    ) {
      const user = await User.findById(messageText);
      if (user) {
        user.telegramId = telegramId;
        user.chat_id = ctx.chat?.id;
        await user.save();
        state.userId = user._id;
        state.name = user.firstName || user.username || "";
        state.step = "language";
        await ctx.reply(
          t(ctx, "courierSuccess", { name: state.name }) +
            "\n" +
            t(
              {
                ...ctx,
                registrationState,
                from: { ...ctx.from, language_code: "ru" },
              },
              "courierSuccess",
              { name: state.name }
            ) +
            "\n" +
            t(
              {
                ...ctx,
                registrationState,
                from: { ...ctx.from, language_code: "en" },
              },
              "courierSuccess",
              { name: state.name }
            )
        );
        await ctx.reply(
          t(ctx, "courierAskLanguage") +
            "\n" +
            t(
              {
                ...ctx,
                registrationState,
                from: { ...ctx.from, language_code: "ru" },
              },
              "courierAskLanguage"
            ) +
            "\n" +
            t(
              {
                ...ctx,
                registrationState,
                from: { ...ctx.from, language_code: "en" },
              },
              "courierAskLanguage"
            ),
          {
            reply_markup: {
              keyboard: [LANGUAGES.map((l) => l.label)],
              one_time_keyboard: true,
              resize_keyboard: true,
            },
          }
        );
      } else {
        await ctx.reply(
          t(ctx, "courierInvalidCode") +
            "\n" +
            t(
              {
                ...ctx,
                registrationState,
                from: { ...ctx.from, language_code: "ru" },
              },
              "courierInvalidCode"
            ) +
            "\n" +
            t(
              {
                ...ctx,
                registrationState,
                from: { ...ctx.from, language_code: "en" },
              },
              "courierInvalidCode"
            )
        );
      }
    } else {
      await ctx.reply(
        t(ctx, "courierInvalidCode") +
          "\n" +
          t(
            {
              ...ctx,
              registrationState,
              from: { ...ctx.from, language_code: "ru" },
            },
            "courierInvalidCode"
          ) +
          "\n" +
          t(
            {
              ...ctx,
              registrationState,
              from: { ...ctx.from, language_code: "en" },
            },
            "courierInvalidCode"
          )
      );
    }
    return;
  }

  if (state.step === "language") {
    const lang = LANGUAGES.find((l) => l.label === messageText);
    if (!lang) return;
    state.language = lang.code;
    // Update user language preference
    if (state.userId) {
      await User.findByIdAndUpdate(state.userId, {
        $set: { "preferences.language": lang.code },
      });
    }
    state.step = "configured";
    // Fetch user to get role
    const user = await User.findById(state.userId);
    if (user) {
      if (user.role === "courier") {
        await ctx.reply(t(ctx, "courierConfiguredCourier"));
      } else if (user.role === "shop_owner") {
        await ctx.reply(t(ctx, "courierConfiguredShopOwner"));
      } else {
        await ctx.reply(t(ctx, "courierAccountConfigured"));
      }
    }
    registrationState.delete(telegramId);
    return;
  }

  // Handle custom reason input for rejection
  const userId = String(ctx.from.id);
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
});

courierBot.on("message", async (ctx: CustomContext) => {
  const chat = ctx.chat;
  if (chat && (chat.type === "group" || chat.type === "supergroup")) {
    // Upsert group info
    await Group.findOneAndUpdate(
      { chatId: ctx.message?.chat?.id },
      { $set: { title: chat.title, type: chat.type, dateAdded: new Date() } },
      { upsert: true, new: true }
    );
  }
});

courierBot.on("callback_query", async (ctx: CustomContext) => {
  const cbq = ctx.callbackQuery as any;
  const data = cbq.data;
  if (!data) return;
  const userId = ctx.from && ctx.from.id ? String(ctx.from.id) : "";
  // Match accept for courier
  const acceptMatch = data.match(/^order_accept_(.+)$/);
  if (acceptMatch) {
    const orderId = acceptMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery("Order not found");
    if (!ctx.from) return ctx.answerCbQuery("User not found");
    if (order.status === "created") {
      // Accept: set to packing, update statusHistory, send to shop group
      await Order.updateStatus(orderId, "packing", String(ctx.from.id));
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply("Order accepted and sent to shop!");
      // Send to shop group (if exists)
      const Shop = require("../models/Shop").default;
      const shop = await Shop.findById(order.shopId);
      if (shop && shop.orders_chat_id) {
        await ctx.telegram.sendMessage(
          shop.orders_chat_id,
          `🆕🛒 Yangi buyurtma!\nOrder ID: ${order._id}\nIltimos, buyurtmani ko'rib chiqing.`
        );
      }
    } else {
      await ctx.answerCbQuery("Order cannot be accepted in this status.");
      return;
    }
    return;
  }
  // Match reject for courier
  const rejectMatch = data.match(/^order_reject_(.+)_courier$/);
  if (rejectMatch) {
    const orderId = rejectMatch[1];
    // Show reason picker
    await ctx.reply("Please provide a reason for rejection:");
    customReasonMap.set(userId, { orderId, role: "courier" });
    return;
  }
});

export default courierBot;

// Launch the bot if this file is run directly
courierBot
  .launch()
  .then(() => {
    console.log("[courierBot] Bot started");
  })
  .catch((err) => {
    console.error("[courierBot] Failed to start:", err);
  });
