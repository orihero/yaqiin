import dotenv from "dotenv";
dotenv.config();
console.log("[courierBot] File loaded");
import { Telegraf, Context as TelegrafContext } from "telegraf";
import Group from "../models/Group";
import Order from "../models/Order";
import User from "../models/User";
import { t } from "../utils/i18n";
import mongoose from "mongoose";
import { sendOrderStatusUpdateToGroup } from "./controllers/orderGroupNotifier";

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
    const customReason = ctx.message && "text" in ctx.message ? ctx.message["text"] : "";
    if (!ctx.from) return;
    const order = await Order.findById(orderId);
    if (order) {
      if (role === "client_reject") {
        await Order.updateStatus(orderId, "rejected_by_courier", String(ctx.from.id), customReason);
        await ctx.reply(t(ctx, "orderRejectedFinal", { reason: customReason }));
        
        // Send order status update to orders group
        const Shop = require("../models/Shop").default;
        const shop = await Shop.findById(order.shopId);
        if (shop) {
          const user = await User.findOne({ telegramId: String(ctx.from.id) });
          if (user) {
            await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, "rejected_by_courier", user);
          }
        }
      } else {
        await Order.updateStatus(orderId, "rejected_by_courier", String(ctx.from.id), customReason);
        await ctx.reply(t(ctx, "orderRejected"));
        
        // Send order status update to orders group
        const Shop = require("../models/Shop").default;
        const shop = await Shop.findById(order.shopId);
        if (shop) {
          const user = await User.findOne({ telegramId: String(ctx.from.id) });
          if (user) {
            await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, "rejected_by_courier", user);
          }
        }
      }
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
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    // Fetch the user who pressed the button
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    // Check if user is admin or operator
    if (user.role === "admin" || user.role === "operator") {
      if (order.status === "created") {
        // Accept: set to confirmed, update statusHistory
        await Order.updateStatus(orderId, "operator_confirmed", (user._id as mongoose.Types.ObjectId).toString());
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        await ctx.reply(t(ctx, "orderConfirmedSentToShop"));
        
        // Send order status update to orders group
        const Shop = require("../models/Shop").default;
        const shop = await Shop.findById(order.shopId);
        if (shop) {
          await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, "operator_confirmed", user);
        }
        
        // Send to shop owner with Accept/Reject buttons
        if (shop && shop.ownerId) {
          // Find shop owner user
          const shopOwner = await User.findById(shop.ownerId);
          if (shopOwner && shopOwner.telegramId && /^\d+$/.test(shopOwner.telegramId)) {
            // Compose detailed order notification
            let orderText = `🆕🛒 <b>${t(ctx, "newOrderLabel")}</b>\n<b>${t(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
            orderText += `<b>${t(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
            orderText += `\n<b>${t(ctx, "productsLabel")}</b>`;
            for (const item of order.items) {
              orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
            }
            orderText += `\n\n<b>${t(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
            orderText += `\n\n<b>${t(ctx, "nextStepLabel")}:</b> ${t(ctx, "acceptOrRejectOrder")}`;
            await ctx.telegram.sendMessage(
              shopOwner.telegramId,
              orderText,
              {
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: '✅ ' + t(ctx, "acceptBtn"), callback_data: `order_shop_accept_${order._id}` },
                      { text: '❌ ' + t(ctx, "rejectBtn"), callback_data: `order_shop_reject_${order._id}` }
                    ]
                  ]
                }
              }
            );
          } else {
            console.error('[Order Notify] Invalid or missing telegramId for shop owner:', shopOwner);
          }
        }
      } else {
        await ctx.answerCbQuery(t(ctx, "orderCannotBeAccepted"));
        return;
      }
      return;
    } else {
      // Default: courier accepts, send to shop group
      if (order.status === "created") {
        await Order.updateStatus(orderId, "packing", (user._id as mongoose.Types.ObjectId).toString());
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        await ctx.reply(t(ctx, "orderAcceptedSentToShop"));
        // Send to shop group (if exists)
        const Shop = require("../models/Shop").default;
        const shop = await Shop.findById(order.shopId);
        if (shop) {
          // Always reflect to orders group as status update
          await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, "packing", user);
          // Also keep legacy plain text message if chat id exists
          if (shop.orders_chat_id) {
            await ctx.telegram.sendMessage(
              shop.orders_chat_id,
              `${t(ctx, "newOrderLabel")}\n${t(ctx, "orderIdLabel")}: ${order._id}\n${t(ctx, "pleaseReviewOrder")}`
            );
          }
        }
      } else {
        await ctx.answerCbQuery(t(ctx, "orderCannotBeAccepted"));
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
    await ctx.reply(t(ctx, "pleaseProvideRejectionReason"));
    customReasonMap.set(userId, { orderId, role: "courier" });
    return;
  }
  // Match shop accept for shop owner
  const shopAcceptMatch = data.match(/^order_shop_accept_(.+)$/);
  if (shopAcceptMatch) {
    const orderId = shopAcceptMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    if (user.role === "shop_owner") {
      if (order.status === "operator_confirmed") {
        await Order.updateStatus(orderId, "packing", (user._id as mongoose.Types.ObjectId).toString());
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        await ctx.reply(t(ctx, "orderAcceptedPackingStage"));
        
        // Send order status update to orders group
        const Shop = require("../models/Shop").default;
        const shop = await Shop.findById(order.shopId);
        if (shop) {
          await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, "packing", user);
        }
        // Update notification: show only 'Finish Packing' button
        let orderText = `📦 <b>${t(ctx, "orderPackingStage")}</b>\n<b>${t(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
        orderText += `<b>${t(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
        orderText += `\n<b>${t(ctx, "productsLabel")}</b>`;
        for (const item of order.items) {
          orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
        }
        orderText += `\n\n<b>${t(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
        orderText += `\n\n<b>${t(ctx, "nextStepLabel")}:</b> ${t(ctx, "pressFinishPacking")}`;
        await ctx.telegram.sendMessage(
          user.telegramId,
          orderText,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                 { text: '📦 ' + t(ctx, "finishPackingBtn"), callback_data: `order_shop_finish_packing_${order._id}` }
                ]
              ]
            }
          }
        );
      } else {
        await ctx.answerCbQuery(t(ctx, "orderCannotBeAccepted"));
        return;
      }
      return;
    }
  }
  // Match finish packing for shop owner
  const finishPackingMatch = data.match(/^order_shop_finish_packing_(.+)$/);
  if (finishPackingMatch) {
    const orderId = finishPackingMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    if (user.role === "shop_owner") {
      if (order.status === "packing") {
        await Order.updateStatus(orderId, "packed", (user._id as mongoose.Types.ObjectId).toString());
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        await ctx.reply(t(ctx, "packingFinishedSentToCouriers"));
        
        // Send order status update to orders group
        const Shop = require("../models/Shop").default;
        const shop = await Shop.findById(order.shopId);
        if (shop) {
          await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, "packed", user);
        }
        
        // Couriers are already notified at order creation, no need to send again
        // They will get updated via their existing notification when they check status
      } else {
        await ctx.answerCbQuery(t(ctx, "orderCannotBeFinished"));
        return;
      }
      return;
    }
  }
  // Match shop reject for shop owner
  const shopRejectMatch = data.match(/^order_shop_reject_(.+)$/);
  if (shopRejectMatch) {
    const orderId = shopRejectMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    if (user.role === "shop_owner") {
      if (order.status === "operator_confirmed") {
        await Order.updateStatus(orderId, "rejected_by_shop", (user._id as mongoose.Types.ObjectId).toString());
        await ctx.answerCbQuery(t(ctx, "orderRejectedByShopOwner"));
        
        // Send order status update to orders group
        const Shop = require("../models/Shop").default;
        const shop = await Shop.findById(order.shopId);
        if (shop) {
          await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, "rejected_by_shop", user);
        }
      } else {
        await ctx.answerCbQuery(t(ctx, "orderCannotBeRejected"));
        return;
      }
      return;
    }
  }
  // Match courier picked up
  const courierPickedMatch = data.match(/^order_courier_picked_(.+)$/);
  if (courierPickedMatch) {
    const orderId = courierPickedMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    if (user.role === "courier") {
      if (order.status === "packed") {
        await Order.updateStatus(orderId, "courier_picked", (user._id as mongoose.Types.ObjectId).toString());
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        await ctx.reply(t(ctx, "orderPickedUp"));
        
        // Send order status update to orders group
        const Shop = require("../models/Shop").default;
        const shop = await Shop.findById(order.shopId);
        if (shop) {
          await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, "courier_picked", user);
        }
        
        // Update notification: show only 'Delivered' button
        let orderText = `🚚 <b>${t(ctx, "orderOnTheWay")}</b>\n<b>${t(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
        orderText += `<b>${t(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
        orderText += `\n<b>${t(ctx, "productsLabel")}:</b>`;
        for (const item of order.items) {
          orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
        }
        orderText += `\n\n<b>${t(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
        orderText += `\n\n<b>${t(ctx, "nextStepLabel")}:</b> ${t(ctx, "pressDeliveredWhenDone")}`;
        
        // Send the order details message
        await ctx.telegram.sendMessage(
          user.telegramId,
          orderText,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `📦 ${t(ctx, "deliveredBtn")}`, callback_data: `order_courier_delivered_${order._id}` }
                ]
              ]
            }
          }
        );
        
        // Send delivery location to courier when picking up
        if (order.deliveryAddress && order.deliveryAddress.coordinates) {
          const locationText = `📍 <b>${t(ctx, "deliveryLocationLabel")}</b>\n<b>${t(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
          const addressText = `${order.deliveryAddress.street}, ${order.deliveryAddress.district}, ${order.deliveryAddress.city}`;
          
          // Send location message with address
          await ctx.telegram.sendMessage(
            user.telegramId,
            locationText + addressText,
            { parse_mode: 'HTML' }
          );
          
          // Send actual location coordinates
          await ctx.telegram.sendLocation(
            user.telegramId,
            order.deliveryAddress.coordinates.lat,
            order.deliveryAddress.coordinates.lng
          );
        }
      } else {
        await ctx.answerCbQuery(t(ctx, "orderCannotBePickedUp"));
        return;
      }
      return;
    }
  }
  // Match courier delivered
  const courierDeliveredMatch = data.match(/^order_courier_delivered_(.+)$/);
  if (courierDeliveredMatch) {
    const orderId = courierDeliveredMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    if (user.role === "courier") {
      if (order.status === "courier_picked") {
        await Order.updateStatus(orderId, "delivered", (user._id as mongoose.Types.ObjectId).toString());
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        await ctx.reply(t(ctx, "orderDelivered"));
        
        // Send order status update to orders group
        const Shop = require("../models/Shop").default;
        const shop = await Shop.findById(order.shopId);
        if (shop) {
          await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, "delivered", user);
        }
        
        // Send notification with 'Client paid' and 'Client rejected' buttons
        let orderText = `✅ <b>${t(ctx, "orderDeliveredLabel")}</b>\n<b>${t(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
        orderText += `<b>${t(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
        orderText += `\n<b>${t(ctx, "productsLabel")}:</b>`;
        for (const item of order.items) {
          orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
        }
        orderText += `\n\n<b>${t(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
        orderText += `\n\n<b>${t(ctx, "nextStepLabel")}:</b> ${t(ctx, "pressPaidOrRejected")}`;
        
        // Send the order details message
        await ctx.telegram.sendMessage(
          user.telegramId,
          orderText,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `💵 ${t(ctx, "clientPaidBtn")}`, callback_data: `order_client_paid_${order._id}` },
                  { text: `❌ ${t(ctx, "clientRejectedBtn")}`, callback_data: `order_client_rejected_${order._id}` }
                ]
              ]
            }
          }
        );
        
        // Send delivery location to courier
        if (order.deliveryAddress && order.deliveryAddress.coordinates) {
          const locationText = `📍 <b>${t(ctx, "deliveryLocationLabel")}</b>\n<b>${t(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
          const addressText = `${order.deliveryAddress.street}, ${order.deliveryAddress.district}, ${order.deliveryAddress.city}`;
          
          // Send location message with address
          await ctx.telegram.sendMessage(
            user.telegramId,
            locationText + addressText,
            { parse_mode: 'HTML' }
          );
          
          // Send actual location coordinates
          await ctx.telegram.sendLocation(
            user.telegramId,
            order.deliveryAddress.coordinates.lat,
            order.deliveryAddress.coordinates.lng
          );
        }
      } else {
        await ctx.answerCbQuery(t(ctx, "orderCannotBeDelivered"));
        return;
      }
      return;
    }
  }
  // Match client paid
  const clientPaidMatch = data.match(/^order_client_paid_(.+)$/);
  if (clientPaidMatch) {
    const orderId = clientPaidMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    // Anyone pressing this is allowed to finish the order
    if (order.status === "delivered") {
      await Order.updateStatus(orderId, "paid", (user._id as mongoose.Types.ObjectId).toString());
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply(t(ctx, "orderPaidFinal"));
      
      // Send order status update to orders group
      const Shop = require("../models/Shop").default;
      const shop = await Shop.findById(order.shopId);
      if (shop) {
        await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, "paid", user);
      }
      // Optionally, send a final notification to shop/courier/client
    } else {
      await ctx.answerCbQuery(t(ctx, "orderCannotBePaid"));
      return;
    }
    return;
  }
  // Match client rejected
  const clientRejectedMatch = data.match(/^order_client_rejected_(.+)$/);
  if (clientRejectedMatch) {
    const orderId = clientRejectedMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    if (order.status === "delivered") {
      // Prompt for rejection reason
      await ctx.reply(t(ctx, "pleaseProvideRejectionReason"));
      customReasonMap.set(userId, { orderId, role: "client_reject" });
    } else {
      await ctx.answerCbQuery(t(ctx, "orderCannotBeRejected"));
      return;
    }
    return;
  }
  
  // Match admin status change
  const adminStatusMatch = data.match(/^admin_status_(.+)_(.+)$/);
  if (adminStatusMatch) {
    const newStatus = adminStatusMatch[1];
    const orderId = adminStatusMatch[2];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    
    // Check if user is admin or operator
    if (user.role === "admin" || user.role === "operator") {
      // If rejecting, prompt for reason
      if (newStatus === "rejected_by_courier" || newStatus === "rejected_by_shop") {
        await ctx.reply(t(ctx, "enterRejectionReason"));
        customReasonMap.set(userId, { orderId, role: "admin", isAdminRejection: true });
        return;
      }
      
      // Update order status
      await Order.updateStatus(orderId, newStatus, (user._id as mongoose.Types.ObjectId).toString());
      
      // Send confirmation
      await ctx.answerCbQuery(t(ctx, "orderStatusChanged", { status: newStatus }));
      
      // Send updated status to orders group
      const Shop = require("../models/Shop").default;
      const shop = await Shop.findById(order.shopId);
      if (shop) {
        await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, newStatus, user);
      }
      
      // Handle special cases for status changes
      if (newStatus === "operator_confirmed") {
        // Send to shop owner if order was confirmed
        if (shop && shop.ownerId) {
          const shopOwner = await User.findById(shop.ownerId);
          if (shopOwner && shopOwner.telegramId && /^\d+$/.test(shopOwner.telegramId)) {
            let orderText = `🆕🛒 <b>${t(ctx, "newOrderLabel")}</b>\n<b>${t(ctx, "orderIdLabel")}:</b> <code>${order._id}</code>\n`;
            orderText += `<b>${t(ctx, "clientLabel")}:</b> ${order.customerId}\n`;
            orderText += `\n<b>${t(ctx, "productsLabel")}</b>`;
            for (const item of order.items) {
              orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
            }
            orderText += `\n\n<b>${t(ctx, "totalLabel")}:</b> ${order.pricing.total}`;
            orderText += `\n\n<b>${t(ctx, "nextStepLabel")}:</b> ${t(ctx, "acceptOrRejectOrder")}`;
            await ctx.telegram.sendMessage(
              shopOwner.telegramId,
              orderText,
              {
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: '✅ ' + t(ctx, "acceptBtn"), callback_data: `order_shop_accept_${order._id}` },
                      { text: '❌ ' + t(ctx, "rejectBtn"), callback_data: `order_shop_reject_${order._id}` }
                    ]
                  ]
                }
              }
            );
          }
        }
      } else if (newStatus === "packed") {
        // Couriers are already notified at order creation, no need to send again
        // They will get updated via their existing notification when they check status
      }
    } else {
      await ctx.answerCbQuery(t(ctx, "noPermissionToChangeStatus"));
      return;
    }
    return;
  }
  
  // Match courier confirm (new order acceptance)
  const courierConfirmMatch = data.match(/^courier_confirm_(.+)$/);
  if (courierConfirmMatch) {
    const orderId = courierConfirmMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    
    if (user.role === "courier") {
      // Courier confirms order - assign courier and move to appropriate status
      if (!order.courierId) {
        order.courierId = user._id as mongoose.Types.ObjectId;
        await order.save();
      }
      
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.answerCbQuery("✅ Buyurtma qabul qilindi");
      
      // Send status update message with next action buttons
      await sendCourierOrderStatusMessage(ctx, order, user);
      
      // Notify orders group
      const Shop = require("../models/Shop").default;
      const shop = await Shop.findById(order.shopId);
      if (shop) {
        await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, order.status, user);
      }
    }
    return;
  }
  
  // Match courier reject (new order rejection)
  const courierRejectNewMatch = data.match(/^courier_reject_(.+)$/);
  if (courierRejectNewMatch) {
    const orderId = courierRejectNewMatch[1];
    await ctx.answerCbQuery("❌ Buyurtma rad etildi");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply("Buyurtma rad etildi");
    return;
  }
  
  // Match courier status change actions
  const courierStatusMatch = data.match(/^courier_status_(.+)_(.+)$/);
  if (courierStatusMatch) {
    const newStatus = courierStatusMatch[1];
    const orderId = courierStatusMatch[2];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, "orderNotFound"));
    if (!ctx.from) return ctx.answerCbQuery(t(ctx, "userNotFound"));
    const user = await User.findOne({ telegramId: userId });
    if (!user) return ctx.answerCbQuery(t(ctx, "userNotFoundInDB"));
    
    if (user.role === "courier") {
      // Handle rejection statuses
      if (newStatus === "rejected_by_courier") {
        await ctx.reply(t(ctx, "pleaseProvideRejectionReason"));
        customReasonMap.set(userId, { orderId, role: "courier" });
        return;
      }
      
      // Update order status
      await Order.updateStatus(orderId, newStatus, (user._id as mongoose.Types.ObjectId).toString());
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      
      // Status-specific messages
      const statusMessages: Record<string, string> = {
        'operator_confirmed': '✅ Buyurtma tasdiqlandi',
        'packing': '📦 Buyurtma tayyorlanmoqda',
        'packed': '📦 Buyurtma tayyor',
        'courier_picked': '🚚 Buyurtma olib ketildi',
        'delivered': '🎉 Buyurtma yetkazildi',
        'paid': '💰 To\'lov qabul qilindi'
      };
      
      const message = statusMessages[newStatus] || `Holat o'zgartirildi: ${newStatus}`;
      await ctx.reply(message);
      
      // Send updated status message with new action buttons
      await sendCourierOrderStatusMessage(ctx, order, user);
      
      // Notify orders group
      const Shop = require("../models/Shop").default;
      const shop = await Shop.findById(order.shopId);
      if (shop) {
        await sendOrderStatusUpdateToGroup(ctx.telegram, order, shop, newStatus, user);
      }
    }
    return;
  }
});

/**
 * Send order status message to courier with appropriate action buttons
 */
async function sendCourierOrderStatusMessage(ctx: any, orderOrId: any, courier: any) {
  const User = require("../models/User").default;
  
  // Reload order to get latest status
  const order = typeof orderOrId === 'string' 
    ? await Order.findById(orderOrId) 
    : (orderOrId._id ? await Order.findById(orderOrId._id) : orderOrId);
  
  if (!order) {
    console.error('[Courier] Order not found');
    return;
  }
  
  const client = await User.findById(order.customerId);
  const clientName = client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() : 'Client';
  
  let orderText = `📋 <b>Buyurtma ${order.orderNumber}</b>\n`;
  orderText += `<b>Status:</b> ${getStatusLabel(order.status)}\n`;
  orderText += `<b>Mijoz:</b> ${clientName}\n\n`;
  orderText += `<b>Mahsulotlar:</b>`;
  
  for (const item of order.items) {
    orderText += `\n- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
  }
  
  orderText += `\n\n<b>Jami:</b> ${order.pricing.total}`;
  
  // Add address info
  if (order.deliveryAddress) {
    const addr = order.deliveryAddress;
    orderText += `\n\n📍 <b>Manzil:</b>`;
    if (addr.street) orderText += `\n${addr.street}`;
    if (addr.city) orderText += `, ${addr.city}`;
    if (addr.district) orderText += `, ${addr.district}`;
    if (addr.building) orderText += `\nBino: ${addr.building}`;
    if (addr.entrance) orderText += `, Podyezd: ${addr.entrance}`;
    if (addr.apartment) orderText += `, Xonadon: ${addr.apartment}`;
  }
  
  // Get action buttons based on current status
  const buttons = getCourierActionButtons(order);
  
  await ctx.telegram.sendMessage(
    courier.telegramId,
    orderText,
    {
      parse_mode: 'HTML',
      reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
    }
  );
}

/**
 * Get action buttons for courier based on order status
 */
function getCourierActionButtons(order: any): any[][] {
  const buttons: any[][] = [];
  
  const statusTransitions: Record<string, { label: string; status: string }[]> = {
    'created': [
      { label: '✅ Tasdiqlash', status: 'operator_confirmed' },
      { label: '❌ Rad etish', status: 'rejected_by_courier' }
    ],
    'operator_confirmed': [
      { label: '📦 Tayyorlashni boshlash', status: 'packing' },
      { label: '❌ Rad etish', status: 'rejected_by_courier' }
    ],
    'packing': [
      { label: '📦 Tayyor', status: 'packed' },
      { label: '❌ Rad etish', status: 'rejected_by_courier' }
    ],
    'packed': [
      { label: '🚚 Olib ketish', status: 'courier_picked' },
      { label: '❌ Rad etish', status: 'rejected_by_courier' }
    ],
    'courier_picked': [
      { label: '🎉 Yetkazildi', status: 'delivered' },
      { label: '❌ Rad etish', status: 'rejected_by_courier' }
    ],
    'delivered': [
      { label: '💰 To\'lov qabul qilindi', status: 'paid' }
    ],
    'paid': [],
    'rejected_by_shop': [],
    'rejected_by_courier': [],
    'cancelled_by_client': []
  };
  
  const transitions = statusTransitions[order.status] || [];
  if (transitions.length > 0) {
    const row: any[] = [];
    transitions.forEach((t) => {
      row.push({ 
        text: t.label, 
        callback_data: `courier_status_${t.status}_${order._id}` 
      });
    });
    buttons.push(row);
  }
  
  return buttons;
}

/**
 * Get human-readable status label
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'created': '📝 Yaratildi',
    'operator_confirmed': '✅ Tasdiqlandi',
    'packing': '📦 Tayyorlanmoqda',
    'packed': '📦 Tayyor',
    'courier_picked': '🚚 Kuryer oldi',
    'delivered': '🎯 Yetkazildi',
    'paid': '💵 To\'landi',
    'rejected_by_shop': '❌ Do\'kon rad etdi',
    'rejected_by_courier': '❌ Kuryer rad etdi',
    'cancelled_by_client': '🚫 Mijoz bekor qildi'
  };
  
  return labels[status] || status;
}

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
