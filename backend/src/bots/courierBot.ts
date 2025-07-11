import dotenv from 'dotenv';
dotenv.config();
console.log('[courierBot] File loaded');
// @ts-ignore
import { Context as TelegrafContext, Telegraf, Markup } from 'telegraf';
import mongoose from 'mongoose';
import User from '../models/User';
import { t, getLang } from '../utils/i18n';

const token = process.env.COURIER_BOT_TOKEN;
if (!token) {
  throw new Error('COURIER_BOT_TOKEN is not set in environment variables');
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
  { code: 'uz', label: 'Oʻzbekcha' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

// Attach registrationState to ctx
courierBot.use((ctx, next) => {
  (ctx as CustomContext).registrationState = registrationState;
  return next();
});

courierBot.start(async (ctx: CustomContext) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);
  registrationState.set(telegramId, { step: 'code' });
  // Send welcome in all languages
  await ctx.reply(
    t(ctx, 'courierWelcome', {}) + '\n\n' +
    t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'ru' } }, 'courierWelcome', {}) + '\n' +
    t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'en' } }, 'courierWelcome', {})
  );
  await ctx.reply(
    t(ctx, 'courierAskCode', {}) + '\n' +
    t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'ru' } }, 'courierAskCode', {}) + '\n' +
    t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'en' } }, 'courierAskCode', {})
  );
});

courierBot.on('text', async (ctx: CustomContext) => {
  if (!ctx.from || !ctx.message) return;
  const telegramId = String(ctx.from.id);
  const state = registrationState.get(telegramId);
  const messageText = 'text' in ctx.message && typeof ctx.message.text === 'string' ? ctx.message.text : '';

  if (!state) return; // Only handle if in registration

  if (state.step === 'code') {
    // Check if message is a 24-character user ID
    if (typeof messageText === 'string' && messageText.length === 24 && /^[a-fA-F0-9]{24}$/.test(messageText)) {
      const user = await User.findById(messageText);
      if (user) {
        user.telegramId = telegramId;
        user.chat_id = ctx.chat?.id;
        await user.save();
        state.userId = user._id;
        state.name = user.firstName || user.username || '';
        state.step = 'language';
        await ctx.reply(
          t(ctx, 'courierSuccess', { name: state.name }) + '\n' +
          t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'ru' } }, 'courierSuccess', { name: state.name }) + '\n' +
          t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'en' } }, 'courierSuccess', { name: state.name })
        );
        await ctx.reply(
          t(ctx, 'courierAskLanguage') + '\n' +
          t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'ru' } }, 'courierAskLanguage') + '\n' +
          t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'en' } }, 'courierAskLanguage'),
          {
            reply_markup: {
              keyboard: [LANGUAGES.map(l => l.label)],
              one_time_keyboard: true,
              resize_keyboard: true,
            },
          }
        );
      } else {
        await ctx.reply(
          t(ctx, 'courierInvalidCode') + '\n' +
          t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'ru' } }, 'courierInvalidCode') + '\n' +
          t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'en' } }, 'courierInvalidCode')
        );
      }
    } else {
      await ctx.reply(
        t(ctx, 'courierInvalidCode') + '\n' +
        t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'ru' } }, 'courierInvalidCode') + '\n' +
        t({ ...ctx, registrationState, from: { ...ctx.from, language_code: 'en' } }, 'courierInvalidCode')
      );
    }
    return;
  }

  if (state.step === 'language') {
    const lang = LANGUAGES.find(l => l.label === messageText);
    if (!lang) return;
    state.language = lang.code;
    // Update user language preference
    if (state.userId) {
      await User.findByIdAndUpdate(state.userId, {
        $set: { 'preferences.language': lang.code },
      });
    }
    state.step = 'configured';
    // Fetch user to get role
    const user = await User.findById(state.userId);
    if (user) {
      if (user.role === 'courier') {
        await ctx.reply(t(ctx, 'courierConfiguredCourier'));
      } else if (user.role === 'shop_owner') {
        await ctx.reply(t(ctx, 'courierConfiguredShopOwner'));
      } else {
        await ctx.reply(t(ctx, 'courierAccountConfigured'));
      }
    }
    registrationState.delete(telegramId);
    return;
  }

  // Handle custom reason input for rejection
  const userId = String(ctx.from.id);
  if (customReasonMap.has(userId)) {
    const { orderId, role } = customReasonMap.get(userId);
    const customReason = messageText;
    const order = await require('../models/Order').default.findById(orderId);
    if (order) {
      order.status = 'rejected_by_courier';
      order.rejectionReason = customReason;
      await order.save();
      await ctx.reply(t(ctx, 'courierOrderRejected'));
    }
    customReasonMap.delete(userId);
    return;
  }
});

courierBot.on('callback_query', async (ctx: CustomContext) => {
  const cbq = ctx.callbackQuery as any;
  const data = cbq.data;
  if (!data) return;
  const userId = ctx.from && ctx.from.id ? String(ctx.from.id) : '';
  // Match next step for courier
  const nextMatch = data.match(/^order_next_(.+)_courier$/);
  if (nextMatch) {
    const orderId = nextMatch[1];
    const order = await require('../models/Order').default.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, 'courierOrderNotFound'));
    if (order.status === 'packing') {
      order.status = 'courier_picked';
      await order.save();
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply(t(ctx, 'courierOrderPicked'));
    } else if (order.status === 'courier_picked') {
      order.status = 'delivered';
      await order.save();
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply(t(ctx, 'courierOrderDelivered'));
    } else {
      await ctx.answerCbQuery(t(ctx, 'courierNoFurtherAction'));
      return;
    }
  }
  // Match reject for courier
  const rejectMatch = data.match(/^order_reject_(.+)_courier$/);
  if (rejectMatch) {
    const orderId = rejectMatch[1];
    // Show reason picker
    await ctx.reply(t(ctx, 'courierRejectReasonPrompt'), Markup.inlineKeyboard([
      [Markup.button.callback(t(ctx, 'courierReasonNoContact'), `order_reject_reason_${orderId}_courier_no_contact`)],
      [Markup.button.callback(t(ctx, 'courierReasonNoAddress'), `order_reject_reason_${orderId}_courier_no_address`)],
      [Markup.button.callback(t(ctx, 'courierReasonOther'), `order_reject_reason_${orderId}_courier_other`)]
    ]));
    return;
  }
  // Handle reason selection
  const reasonMatch = data.match(/^order_reject_reason_(.+)_courier_(.+)$/);
  if (reasonMatch) {
    const orderId = reasonMatch[1];
    const reasonKey = reasonMatch[2];
    let reason = '';
    if (reasonKey === 'no_contact') reason = t(ctx, 'courierReasonNoContact');
    else if (reasonKey === 'no_address') reason = t(ctx, 'courierReasonNoAddress');
    else if (reasonKey === 'other') {
      // Ask for custom reason
      await ctx.reply(t(ctx, 'courierEnterCustomReason'));
      customReasonMap.set(userId, { orderId, role: 'courier' });
      return;
    }
    if (reason) {
      const order = await require('../models/Order').default.findById(orderId);
      if (order) {
        order.status = 'rejected_by_courier';
        order.rejectionReason = reason;
        await order.save();
        await ctx.reply(t(ctx, 'courierOrderRejected'));
      }
    }
    return;
  }
});

export default courierBot; 