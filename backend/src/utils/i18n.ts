const translations: Record<string, Record<string, string>> = {
  uz: {
    alreadyRegistered: '✅ Siz allaqachon ro‘yxatdan o‘tgansiz!',
    openMiniApp: '🚀 Mini ilovani ochish:',
    openMiniAppBtn: '🌐 Mini ilova',
    welcome: '👋 Xush kelibsiz! Ro‘yxatdan o‘tish uchun kontaktni ulashing.',
    shareContact: '📱 Kontaktni ulashish',
    selectLanguage: '🌍 Iltimos, tilni tanlang:',
    shareLocation: '📍 Iltimos, joylashuvingizni ulashing:',
    shareLocationBtn: '📍 Joylashuvni ulashish',
    enterApartment: '🏢 Iltimos, kvartira raqamingizni kiriting:',
    enterBlock: '🏢 Iltimos, blok/binoni kiriting:',
    enterEntrance: '🚪 Iltimos, kirish raqamini kiriting:',
    registrationComplete: '🎉 Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi! Rahmat.',
    shopArea: '🏪 Siz {shop} do‘konining hududidasiz! Buyurtmalar shu do‘kondan yetkaziladi. 😊',
    outOfService: '🚫 Afsuski, sizning hududingizda xizmat ko‘rsatmaymiz. Yangiliklar uchun ijtimoiy tarmoqlarimizni kuzatib boring! 📱\nInstagram, Telegram, Facebook: @yaqiin',
    orderPacked: '📦 Buyurtma qadoqlanmoqda!',
    orderPicked: '🚚 Kuryer buyurtmani oldi!',
    orderRejected: '❌ Buyurtma rad etildi!',
    rejectReasonPrompt: '❌ Buyurtmani rad etish sababi:',
    reasonOutOfStock: 'Tovar yo‘q',
    reasonClosed: 'Do‘kon yopiq',
    reasonOutOfArea: 'Xizmat hududidan tashqarida',
    reasonOther: 'Boshqa sabab',
    enterCustomReason: 'Sababni yozing:',
    noFurtherAction: 'Boshqa amal yo‘q.',
    orderNotFound: 'Buyurtma topilmadi',
    courierAccountConfigured: '✅ Hisob sozlandi!',
  },
  ru: {
    alreadyRegistered: '✅ Вы уже зарегистрированы!',
    openMiniApp: '🚀 Открыть мини-приложение:',
    openMiniAppBtn: '🌐 Мини-приложение',
    welcome: '👋 Добро пожаловать! Пожалуйста, поделитесь своим контактом для регистрации.',
    shareContact: '📱 Поделиться контактом',
    selectLanguage: '🌍 Пожалуйста, выберите язык:',
    shareLocation: '📍 Пожалуйста, поделитесь своим местоположением:',
    shareLocationBtn: '📍 Поделиться местоположением',
    enterApartment: '🏢 Пожалуйста, введите номер квартиры:',
    enterBlock: '🏢 Пожалуйста, введите блок/здание:',
    enterEntrance: '🚪 Пожалуйста, введите номер подъезда:',
    registrationComplete: '🎉 Регистрация успешно завершена! Спасибо.',
    shopArea: '🏪 Вы находитесь в зоне магазина {shop}! Ваши заказы будут доставляться из этого магазина. 😊',
    outOfService: '🚫 К сожалению, мы не обслуживаем ваш район. Следите за нашими новостями в социальных сетях! 📱\nInstagram, Telegram, Facebook: @yaqiin',
    orderPacked: '📦 Заказ упаковывается!',
    orderPicked: '🚚 Курьер забрал заказ!',
    orderRejected: '❌ Заказ отклонён!',
    rejectReasonPrompt: '❌ Причина отклонения заказа:',
    reasonOutOfStock: 'Нет товара',
    reasonClosed: 'Магазин закрыт',
    reasonOutOfArea: 'Вне зоны обслуживания',
    reasonOther: 'Другая причина',
    enterCustomReason: 'Напишите причину:',
    noFurtherAction: 'Нет дальнейших действий.',
    orderNotFound: 'Заказ не найден',
    courierAccountConfigured: '✅ Аккаунт настроен!',
  },
  en: {
    alreadyRegistered: '✅ You are already registered!',
    openMiniApp: '🚀 Open the Mini App:',
    openMiniAppBtn: '🌐 Open Mini App',
    welcome: '👋 Welcome! Please share your contact to register.',
    shareContact: '📱 Share Contact',
    selectLanguage: '🌍 Please select your language:',
    shareLocation: '📍 Please share your location:',
    shareLocationBtn: '📍 Share Location',
    enterApartment: '🏢 Please enter your apartment number:',
    enterBlock: '🏢 Please enter your block/building:',
    enterEntrance: '🚪 Please enter your entrance number:',
    registrationComplete: '🎉 Registration complete! Thank you.',
    shopArea: '🏪 You are in the delivery area of {shop}! Orders will be delivered from this shop. 😊',
    outOfService: '🚫 Unfortunately, we do not serve your area yet. Follow us on social media for updates! 📱\nInstagram, Telegram, Facebook: @yaqiin',
    orderPacked: '📦 Order is being packed!',
    orderPicked: '🚚 Courier picked up the order!',
    orderRejected: '❌ Order has been rejected!',
    rejectReasonPrompt: '❌ Reason for order rejection:',
    reasonOutOfStock: 'Out of stock',
    reasonClosed: 'Shop closed',
    reasonOutOfArea: 'Out of service area',
    reasonOther: 'Other reason',
    enterCustomReason: 'Please enter the reason:',
    noFurtherAction: 'No further action available.',
    orderNotFound: 'Order not found',
    courierAccountConfigured: '✅ Account configured!',
  },
};

// Courier bot translations
Object.assign(translations.uz, {
  courierWelcome: '👋 Xush kelibsiz! Bu bot orqali siz buyurtmalarni boshqarishingiz mumkin. Operator yoki administrator yuborgan kodni kiriting.',
  courierAskCode: 'Iltimos, operator yoki administrator yuborgan kodni kiriting.',
  courierInvalidCode: '❌ Kod noto‘g‘ri. Iltimos, to‘g‘ri kod kiriting.',
  courierAskLanguage: '🌍 Iltimos, tilni tanlang:',
  courierConfiguredCourier: '🚚 Sizning hisobingiz kuryer sifatida sozlandi. Endi buyurtmalarni qabul qilishingiz mumkin!',
  courierConfiguredShopOwner: '🏪 Sizning hisobingiz do‘kon egasi sifatida sozlandi. Endi buyurtmalarni boshqarishingiz mumkin!',
  courierSuccess: '✅ Xush kelibsiz, {name}! Tilni tanlang:',
  courierOrderPicked: '🚚 Buyurtma kuryerda!',
  courierOrderDelivered: '📦 Buyurtma yetkazib berildi!',
  courierOrderRejected: '❌ Buyurtma rad etildi!',
  courierRejectReasonPrompt: '❌ Buyurtmani rad etish sababi:',
  courierReasonNoContact: 'Mijoz bilan bog‘lanib bo‘lmadi',
  courierReasonNoAddress: 'Manzil topilmadi',
  courierReasonOther: 'Boshqa sabab',
  courierEnterCustomReason: 'Sababni yozing:',
  courierNoFurtherAction: 'Boshqa amal yo‘q.',
  courierOrderNotFound: 'Buyurtma topilmadi',
});
Object.assign(translations.ru, {
  courierWelcome: '👋 Добро пожаловать! С помощью этого бота вы можете управлять заказами. Введите код, который отправил оператор или администратор.',
  courierAskCode: 'Пожалуйста, введите код, отправленный оператором или администратором.',
  courierInvalidCode: '❌ Неверный код. Пожалуйста, введите правильный код.',
  courierAskLanguage: '🌍 Пожалуйста, выберите язык:',
  courierConfiguredCourier: '🚚 Ваша учетная запись настроена как курьер. Теперь вы можете принимать заказы!',
  courierConfiguredShopOwner: '🏪 Ваша учетная запись настроена как владелец магазина. Теперь вы можете управлять заказами!',
  courierSuccess: '✅ Добро пожаловать, {name}! Пожалуйста, выберите язык:',
  courierOrderPicked: '🚚 Заказ у курьера!',
  courierOrderDelivered: '📦 Заказ доставлен!',
  courierOrderRejected: '❌ Заказ отклонён!',
  courierRejectReasonPrompt: '❌ Причина отклонения заказа:',
  courierReasonNoContact: 'Не удалось связаться с клиентом',
  courierReasonNoAddress: 'Адрес не найден',
  courierReasonOther: 'Другая причина',
  courierEnterCustomReason: 'Напишите причину:',
  courierNoFurtherAction: 'Нет дальнейших действий.',
  courierOrderNotFound: 'Заказ не найден',
});
Object.assign(translations.en, {
  courierWelcome: '👋 Welcome! You can manage orders with this bot. Please enter the code sent by the operator or administrator.',
  courierAskCode: 'Please enter the code sent by the operator or administrator.',
  courierInvalidCode: '❌ Invalid code. Please enter the correct code.',
  courierAskLanguage: '🌍 Please select your language:',
  courierConfiguredCourier: '🚚 Your account is set up as a courier. You can now accept orders!',
  courierConfiguredShopOwner: '🏪 Your account is set up as a shop owner. You can now manage orders!',
  courierSuccess: '✅ Welcome, {name}! Please select your language:',
  courierOrderPicked: '🚚 Order is with the courier!',
  courierOrderDelivered: '📦 Order delivered!',
  courierOrderRejected: '❌ Order has been rejected!',
  courierRejectReasonPrompt: '❌ Reason for order rejection:',
  courierReasonNoContact: 'Could not contact customer',
  courierReasonNoAddress: 'Address not found',
  courierReasonOther: 'Other reason',
  courierEnterCustomReason: 'Please enter the reason:',
  courierNoFurtherAction: 'No further action available.',
  courierOrderNotFound: 'Order not found',
});

function getLang(ctx: any, fallback = 'en') {
  // Try to extract language from registration state, session, or fallback
  if (ctx) {
    const telegramId = ctx.from && ctx.from.id ? String(ctx.from.id) : undefined;
    if (telegramId && ctx.registrationState && ctx.registrationState.get) {
      const state = ctx.registrationState.get(telegramId);
      if (state && state.language) return state.language;
    }
    if (ctx.sessionUserMap && ctx.sessionUserMap.get) {
      const user = ctx.sessionUserMap.get(ctx);
      if (user && user.preferences && user.preferences.language) return user.preferences.language;
    }
    if (ctx.from && ctx.from.language_code) {
      // Telegram language code
      const code = ctx.from.language_code.split('-')[0];
      if (translations[code]) return code;
    }
  }
  return fallback;
}

function t(ctx: any, key: string, params?: Record<string, string | number>) {
  const lang = getLang(ctx);
  let str = translations[lang]?.[key] || translations['en'][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v));
    });
  }
  return str;
}

export { t, getLang, translations }; 