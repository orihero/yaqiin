import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      onboarding: {
        step1: {
          title: 'Welcome to Yaqiin!',
          description: 'Discover fresh groceries delivered straight to your door. Start your journey with us and enjoy quality you can trust.'
        },
        step2: {
          title: 'Easy Shopping Experience',
          description: 'Browse, select, and order with just a few taps. Our intuitive app makes grocery shopping simple and enjoyable.'
        },
        step3: {
          title: 'Fast & Reliable Delivery',
          description: 'Get your groceries delivered quickly and reliably. Track your order in real-time and enjoy peace of mind.'
        },
        back: 'Back',
        next: 'Next',
        skip: 'Skip',
        getStarted: 'Get Started',
        selectLanguage: 'Select Language'
      },
      auth: {
        relaunchRequired: 'You cannot use the app at the moment please relaunch'
      },
      home: {
        title: 'Daily Grocery Food',
        title1: 'Daily',
        title2: 'Grocery Food',
        loadingCategories: 'Loading categories...',
        failedToLoadCategories: 'Failed to load categories.',
        allProducts: 'All products',
        popularFruits: 'Popular Fruits',
        seeAll: 'See all',
        loadingProducts: 'Loading products...',
        failedToLoadProducts: 'Failed to load products.',
        noMoreProducts: 'No more products',
      },
      productCard: {
        product: 'Product',
        kg: 'kg',
        addToCart: 'Add to cart'
      },
      tabBar: {
        home: 'Home',
        search: 'Search',
        cart: 'Cart',
        profile: 'Profile'
      },
      cart: {
        title: 'My Cart',
        empty: 'Your cart is empty.',
        totalAmount: 'Total amount',
        checkout: 'Checkout'
      },
      profile: {
        loading: 'Loading...',
        failedToLoad: 'Failed to load profile',
        account: 'Account',
        myShop: 'My shop',
        orders: 'Orders',
        settings: 'Settings'
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        logout: 'Log Out'
      },
      search: {
        title: 'Search',
        placeholder: 'Fresh lemon',
        loading: 'Loading...',
        noProducts: 'No products found.'
      },
      productDetails: {
        loading: 'Loading...',
        notFound: 'Product not found.',
        available: 'Available in stock',
        outOfStock: 'Out of stock',
        description: 'Product Description',
        reviews: 'Product Reviews',
        noReviews: 'No reviews yet.',
        similar: 'Similar Products',
        noSimilar: 'No similar products yet.'
      },
      myShop: {
        title: 'My Shop',
        placeholder: 'This is a placeholder for the My Shop page.'
      },
      account: {
        title: 'Account',
        info: 'Account Information',
        placeholder: 'This is a placeholder for the Account page.'
      },
      order: {
        all: 'All Order',
        pending: 'Pending',
        processing: 'Processing',
        delivered: 'Delivered',
        created: 'Created',
        packing: 'Packing',
        packed: 'Packed',
        courier_picked: 'Courier Picked',
        paid: 'Paid',
        rejected: 'Rejected',
        title1: 'Daily',
        title2: 'Grocery Food',
        noOrders: 'No orders found.',
        failedToLoad: 'Failed to load orders.'
      },
      loading: {
        appName: 'Gronur'
      }
    }
  },
  ru: {
    translation: {
      onboarding: {
        step1: {
          title: 'Добро пожаловать в Yaqiin!',
          description: 'Откройте для себя свежие продукты с доставкой прямо к вашей двери. Начните свой путь с нами и наслаждайтесь качеством, которому можно доверять.'
        },
        step2: {
          title: 'Лёгкий процесс покупок',
          description: 'Просматривайте, выбирайте и заказывайте всего в несколько кликов. Наше приложение делает покупки простыми и удобными.'
        },
        step3: {
          title: 'Быстрая и надёжная доставка',
          description: 'Получайте продукты быстро и надёжно. Отслеживайте заказ в реальном времени и будьте спокойны.'
        },
        back: 'Назад',
        next: 'Далее',
        skip: 'Пропустить',
        getStarted: 'Начать',
        selectLanguage: 'Выберите язык'
      },
      auth: {
        relaunchRequired: 'Вы не можете использовать приложение в данный момент, пожалуйста, перезапустите'
      },
      home: {
        title: 'Ежедневные продукты',
        title1: 'Ежедневные',
        title2: 'Продукты',
        loadingCategories: 'Загрузка категорий...',
        failedToLoadCategories: 'Не удалось загрузить категории.',
        allProducts: 'Все продукты',
        popularFruits: 'Популярные фрукты',
        seeAll: 'Смотреть все',
        loadingProducts: 'Загрузка продуктов...',
        failedToLoadProducts: 'Не удалось загрузить продукты.',
        noMoreProducts: 'Больше нет товаров',
      },
      productCard: {
        product: 'Продукт',
        kg: 'кг',
        addToCart: 'Добавить в корзину'
      },
      tabBar: {
        home: 'Главная',
        search: 'Поиск',
        cart: 'Корзина',
        profile: 'Профиль'
      },
      cart: {
        title: 'Моя корзина',
        empty: 'Ваша корзина пуста.',
        totalAmount: 'Общая сумма',
        checkout: 'Оформить заказ'
      },
      profile: {
        loading: 'Загрузка...',
        failedToLoad: 'Не удалось загрузить профиль',
        account: 'Аккаунт',
        myShop: 'Мой магазин',
        orders: 'Заказы',
        settings: 'Настройки'
      },
      settings: {
        title: 'Настройки',
        language: 'Язык',
        logout: 'Выйти'
      },
      search: {
        title: 'Поиск',
        placeholder: 'Свежий лимон',
        loading: 'Загрузка...',
        noProducts: 'Товары не найдены.'
      },
      productDetails: {
        loading: 'Загрузка...',
        notFound: 'Товар не найден.',
        available: 'В наличии',
        outOfStock: 'Нет в наличии',
        description: 'Описание товара',
        reviews: 'Отзывы о товаре',
        noReviews: 'Пока нет отзывов.',
        similar: 'Похожие товары',
        noSimilar: 'Похожих товаров пока нет.'
      },
      myShop: {
        title: 'Мой магазин',
        placeholder: 'Это заглушка для страницы моего магазина.'
      },
      account: {
        title: 'Аккаунт',
        info: 'Информация об аккаунте',
        placeholder: 'Это заглушка для страницы аккаунта.'
      },
      order: {
        all: 'Все заказы',
        pending: 'В ожидании',
        processing: 'В обработке',
        delivered: 'Доставлено',
        created: 'Создан',
        packing: 'Упаковывается',
        packed: 'Упакован',
        courier_picked: 'Курьер забрал',
        paid: 'Оплачен',
        rejected: 'Отклонён',
        title1: 'Ежедневные',
        title2: 'Продукты',
        noOrders: 'Заказы не найдены.',
        failedToLoad: 'Не удалось загрузить заказы.'
      },
      loading: {
        appName: 'Гронур'
      }
    }
  },
  uz: {
    translation: {
      onboarding: {
        step1: {
          title: 'Yaqiin-ga xush kelibsiz!',
          description: 'Yangi mahsulotlarni uyingizgacha yetkazib beramiz. Biz bilan sayohatingizni boshlang va ishonchli sifatdan bahramand bo‘ling.'
        },
        step2: {
          title: 'Oson xarid qilish tajribasi',
          description: 'Ko‘rib chiqing, tanlang va bir necha bosqichda buyurtma bering. Bizning ilovamiz xaridni oson va qulay qiladi.'
        },
        step3: {
          title: 'Tez va ishonchli yetkazib berish',
          description: 'Mahsulotlaringizni tez va ishonchli yetkazib olasiz. Buyurtmangizni real vaqtda kuzatib boring va xotirjam bo‘ling.'
        },
        back: 'Orqaga',
        next: 'Keyingi',
        skip: 'O‘tkazib yuborish',
        getStarted: 'Boshlash',
        selectLanguage: 'Tilni tanlang'
      },
      auth: {
        relaunchRequired: 'Hozirda ilovadan foydalana olmaysiz, iltimos, qayta ishga tushiring'
      },
      home: {
        title: 'Kundalik oziq-ovqat',
        title1: 'Kundalik',
        title2: 'Oziq-ovqat',
        loadingCategories: 'Kategoriyalar yuklanmoqda...',
        failedToLoadCategories: 'Kategoriyalarni yuklab boʻlmadi.',
        allProducts: 'Barcha mahsulotlar',
        popularFruits: 'Mashhur mevalar',
        seeAll: 'Hammasini ko‘rish',
        loadingProducts: 'Mahsulotlar yuklanmoqda...',
        failedToLoadProducts: 'Mahsulotlarni yuklab boʻlmadi.',
        noMoreProducts: 'Mahsulotlar tugadi',
      },
      productCard: {
        product: 'Mahsulot',
        kg: 'kg',
        addToCart: 'Savatga qo‘shish'
      },
      tabBar: {
        home: 'Bosh sahifa',
        search: 'Qidirish',
        cart: 'Savat',
        profile: 'Profil'
      },
      cart: {
        title: 'Mening savatim',
        empty: 'Savat bo‘sh.',
        totalAmount: 'Jami summa',
        checkout: 'Buyurtma berish'
      },
      profile: {
        loading: 'Yuklanmoqda...',
        failedToLoad: 'Profilni yuklab boʻlmadi',
        account: 'Hisob',
        myShop: 'Mening do‘konim',
        orders: 'Buyurtmalar',
        settings: 'Sozlamalar'
      },
      settings: {
        title: 'Sozlamalar',
        language: 'Til',
        logout: 'Chiqish'
      },
      search: {
        title: 'Qidirish',
        placeholder: 'Yangi limon',
        loading: 'Yuklanmoqda...',
        noProducts: 'Mahsulotlar topilmadi.'
      },
      productDetails: {
        loading: 'Yuklanmoqda...',
        notFound: 'Mahsulot topilmadi.',
        available: 'Omborda mavjud',
        outOfStock: 'Omborda yo‘q',
        description: 'Mahsulot tavsifi',
        reviews: 'Mahsulot sharhlari',
        noReviews: 'Hozircha sharhlar yo‘q.',
        similar: 'O‘xshash mahsulotlar',
        noSimilar: 'O‘xshash mahsulotlar yo‘q.'
      },
      myShop: {
        title: 'Mening do‘konim',
        placeholder: 'Bu Mening do‘konim sahifasi uchun zaxira matn.'
      },
      account: {
        title: 'Hisob',
        info: 'Hisob ma’lumotlari',
        placeholder: 'Bu Hisob sahifasi uchun zaxira matn.'
      },
      order: {
        all: 'Barcha buyurtmalar',
        pending: 'Kutilmoqda',
        processing: 'Qayta ishlanmoqda',
        delivered: 'Yetkazib berildi',
        created: 'Yaratildi',
        packing: 'Qadoqlanmoqda',
        packed: 'Qadoqlandi',
        courier_picked: 'Kuryer oldi',
        paid: 'Toʻlandi',
        rejected: 'Rad etildi',
        title1: 'Kundalik',
        title2: 'Oziq-ovqat',
        noOrders: 'Buyurtmalar topilmadi.',
        failedToLoad: 'Buyurtmalarni yuklab boʻlmadi.'
      },
      loading: {
        appName: 'Gronur'
      }
    }
  }
};

const savedLang = localStorage.getItem('lang') || 'uz';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 