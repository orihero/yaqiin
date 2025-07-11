import dotenv from 'dotenv';
dotenv.config();
console.log('[mainBot] File loaded');
// @ts-ignore
import { Markup, Telegraf, Context as TelegrafContext } from 'telegraf';
import User from '../models/User';
import { findShopForLocation } from '../utils/geoHelper';
import Order from '../models/Order'; // Added import for Order
import { t, getLang } from '../utils/i18n';

console.log('[mainBot] TOKEN:', process.env.MAIN_BOT_TOKEN);

const token = process.env.MAIN_BOT_TOKEN;
if (!token) {
  throw new Error('MAIN_BOT_TOKEN is not set in environment variables');
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
    console.log('[mainBot] .on(message) raw:', JSON.stringify(ctx.message, null, 2));
  }
  return next();
});

// Registration wizard state
const registrationState = new Map();

const LANGUAGES = [
  { code: 'uz', label: 'Oʻzbekcha' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
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
mainBot.hears(LANGUAGES.map(l => l.label + (l.code === 'uz' ? ' 🇺🇿' : l.code === 'ru' ? ' 🇷🇺' : ' 🇬🇧')), async (ctx: CustomContext) => {
  if (!ctx.from) return;
  if (ctx.message && 'text' in ctx.message && typeof ctx.message.text === 'string') {
    const { text } = ctx.message;
    const telegramId = String(ctx.from.id);
    const state = registrationState.get(telegramId);
    console.log('[mainBot] .hears triggered with text:', text);
    console.log('[mainBot] registrationState for', telegramId, ':', state);
    if (!state || state.step !== 'language') {
      console.log('[mainBot] .hears: No state or not at language step. State:', state);
      return;
    }
    // Match language by label+emoji
    const lang = LANGUAGES.find(l => text.startsWith(l.label));
    console.log('[mainBot] .hears: Matched lang:', lang);
    if (!lang) return;
    state.language = lang.code;
    state.step = 'location';
    await ctx.reply(
      t(ctx, 'shareLocation'),
      Markup.keyboard([
        [Markup.button.locationRequest(t(ctx, 'shareLocationBtn'))]
      ]).oneTime().resize()
    );
    console.log('[mainBot] .hears: Sent location request');
  }
});

mainBot.start(async (ctx: CustomContext) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);
  const user = await User.findOne({ telegramId });
  if (user) {
    sessionUserMap.set(ctx, user);
    await ctx.reply(t(ctx, 'alreadyRegistered'));
    await ctx.reply(t(ctx, 'openMiniApp'),
      Markup.inlineKeyboard([
        Markup.button.webApp(t(ctx, 'openMiniAppBtn'), 'https://yaqiin-frontend.vercel.app/')
      ])
    );
    return;
  }
  registrationState.set(telegramId, { step: 'contact' });
  await ctx.reply(t(ctx, 'welcome'),
    Markup.keyboard([
      [Markup.button.contactRequest(t(ctx, 'shareContact'))]
    ]).oneTime().resize()
  );
});

// Temporary map for custom reason input
const customReasonMap = new Map();

mainBot.on('message', async (ctx: CustomContext) => {
  if (!ctx.from || !ctx.message) return;

  // Handle location messages
  if ('location' in ctx.message && ctx.message.location) {
    const telegramId = String(ctx.from.id);
    const state = registrationState.get(telegramId);
    console.log('[mainBot] .on(message/location) triggered for', telegramId);
    console.log('[mainBot] registrationState for', telegramId, ':', state);
    if (!state || state.step !== 'location') {
      console.log('[mainBot] .on(message/location): No state or not at location step. State:', state);
      return;
    }
    state.location = ctx.message.location;
    console.log('[mainBot] .on(message/location): Received location:', ctx.message.location);

    // 🌍 Shop assignment logic
    const userLat = ctx.message.location.latitude;
    const userLng = ctx.message.location.longitude;
    const shop = await findShopForLocation(userLat, userLng);
    console.log('[mainBot] .on(message/location): Shop found:', shop);

    if (shop) {
      // Assign shop to user (add shopId to user document)
      await User.findOneAndUpdate(
        { telegramId },
        { $set: { shopId: shop._id } }
      );
      // 🎉 Emoji-rich confirmation
      await ctx.reply(t(ctx, 'shopArea', { shop: shop.name }));
      state.step = 'apartment';
      await ctx.reply(t(ctx, 'enterApartment'));
      console.log('[mainBot] .on(message/location): Prompted for apartment');
    } else {
      // 🚫 Out of service area message
      await ctx.reply(t(ctx, 'outOfService'));
      registrationState.delete(telegramId);
      console.log('[mainBot] .on(message/location): Out of service area, registration state deleted');
      return;
    }
    return;
  }

  // Handle contact messages
  if ('contact' in ctx.message && ctx.message.contact) {
    const telegramId = String(ctx.from.id);
    const state = registrationState.get(telegramId);
    if (!state || state.step !== 'contact') return;
    state.phoneNumber = ctx.message.contact.phone_number;
    state.firstName = ctx.message.contact.first_name;
    state.lastName = ctx.message.contact.last_name;
    state.step = 'language';
    await ctx.reply(t(ctx, 'selectLanguage'),
      Markup.keyboard([
        LANGUAGES.map(l => l.label + (l.code === 'uz' ? ' 🇺🇿' : l.code === 'ru' ? ' 🇷🇺' : ' 🇬🇧'))
      ]).oneTime().resize()
    );
    return;
  }

  // Handle text messages (apartment, block, entrance, custom reason)
  if ('text' in ctx.message && typeof ctx.message.text === 'string') {
    console.log('[mainBot] .on(text) triggered with text:', ctx.message.text);
    const userId = String(ctx.from.id);
    const telegramId = userId;
    const state = registrationState.get(telegramId);
    if (!state) return;
    if (customReasonMap.has(userId)) {
      const { orderId, role } = customReasonMap.get(userId);
      const customReason = ctx.message.text;
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'rejected_by_shop';
        order.rejectionReason = customReason;
        await order.save();
        await ctx.reply(t(ctx, 'orderRejected'));
      }
      customReasonMap.delete(userId);
      return;
    }
    if (state.step === 'apartment') {
      state.apartment = ctx.message.text;
      state.step = 'block';
      await ctx.reply(t(ctx, 'enterBlock'));
      return;
    }
    if (state.step === 'block') {
      state.block = ctx.message.text;
      state.step = 'entrance';
      await ctx.reply(t(ctx, 'enterEntrance'));
      return;
    }
    if (state.step === 'entrance') {
      state.entrance = ctx.message.text;
      // Registration complete, save user
      const user = new User({
        telegramId,
        firstName: state.firstName || ctx.from.first_name,
        lastName: state.lastName || ctx.from.last_name,
        phoneNumber: state.phoneNumber,
        role: 'client',
        status: 'active',
        preferences: {
          language: state.language, // Save picked language
          notifications: {
            orderUpdates: true,
            promotions: true,
            newProducts: true,
          },
        },
        addresses: [{
          title: 'Telegram Location',
          street: '',
          city: '',
          district: '',
          postalCode: '',
          coordinates: {
            lat: state.location.latitude,
            lng: state.location.longitude,
          },
          isDefault: true,
          apartment: state.apartment,
          block: state.block,
          entrance: state.entrance,
        }],
      });
      await user.save();
      registrationState.delete(telegramId);
      await ctx.reply(t(ctx, 'registrationComplete'));
      // Send Telegram Mini App launch button
      await ctx.reply(t(ctx, 'openMiniApp'),
        Markup.inlineKeyboard([
          Markup.button.webApp(t(ctx, 'openMiniAppBtn'), 'https://yaqiin-frontend.vercel.app/')
        ])
      );
      return;
    }
  }
});

mainBot.on('callback_query', async (ctx: CustomContext) => {
  const cbq = ctx.callbackQuery as any;
  const data = cbq.data;
  if (!data) return;
  const userId = ctx.from && ctx.from.id ? String(ctx.from.id) : '';
  // Match next step for shop
  const nextMatch = data.match(/^order_next_(.+)_shop$/);
  if (nextMatch) {
    const orderId = nextMatch[1];
    const order = await Order.findById(orderId);
    if (!order) return ctx.answerCbQuery(t(ctx, 'orderNotFound'));
    if (order.status === 'created') {
      order.status = 'packing';
      await order.save();
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply(t(ctx, 'orderPacked'));
    } else if (order.status === 'packing') {
      order.status = 'courier_picked';
      await order.save();
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply(t(ctx, 'orderPicked'));
    } else {
      await ctx.answerCbQuery(t(ctx, 'noFurtherAction'));
      return;
    }
  }
  // Match reject for shop
  const rejectMatch = data.match(/^order_reject_(.+)_shop$/);
  if (rejectMatch) {
    const orderId = rejectMatch[1];
    // Show reason picker
    await ctx.reply(t(ctx, 'rejectReasonPrompt'), Markup.inlineKeyboard([
      [Markup.button.callback(t(ctx, 'reasonOutOfStock'), `order_reject_reason_${orderId}_shop_out_of_stock`)],
      [Markup.button.callback(t(ctx, 'reasonClosed'), `order_reject_reason_${orderId}_shop_closed`)],
      [Markup.button.callback(t(ctx, 'reasonOutOfArea'), `order_reject_reason_${orderId}_shop_out_of_area`)],
      [Markup.button.callback(t(ctx, 'reasonOther'), `order_reject_reason_${orderId}_shop_other`)]
    ]));
    return;
  }
  // Handle reason selection
  const reasonMatch = data.match(/^order_reject_reason_(.+)_shop_(.+)$/);
  if (reasonMatch) {
    const orderId = reasonMatch[1];
    const reasonKey = reasonMatch[2];
    let reason = '';
    if (reasonKey === 'out_of_stock') reason = t(ctx, 'reasonOutOfStock');
    else if (reasonKey === 'closed') reason = t(ctx, 'reasonClosed');
    else if (reasonKey === 'out_of_area') reason = t(ctx, 'reasonOutOfArea');
    else if (reasonKey === 'other') {
      // Ask for custom reason
      await ctx.reply(t(ctx, 'enterCustomReason'));
      customReasonMap.set(userId, { orderId, role: 'shop' });
      return;
    }
    if (reason) {
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'rejected_by_shop';
        order.rejectionReason = reason;
        await order.save();
        await ctx.reply(t(ctx, 'orderRejected'));
      }
    }
    return;
  }
});

mainBot.launch().then(() => {
  console.log('Main Telegram bot started');
}).catch((err) => {
  console.error('[mainBot] Error starting bot:', err);
});

export default mainBot; 