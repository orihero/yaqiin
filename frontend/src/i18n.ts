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
      common: {
        filter: 'Filter',
        priceRange: 'Price Range',
        categories: 'Categories',
        recentlySearched: 'Recently Searched',
        apply: 'Apply',
        addToCartFailed: 'Failed to add product to cart',
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
        checkout: 'Checkout',
        processing: 'Processing...',
        userNotLoaded: 'User not loaded.',
        noAddress: 'No delivery address found.',
        multipleShops: 'All items must be from the same shop.',
        orderSuccess: 'Order placed successfully!',
        checkoutFailed: 'Checkout failed'
      },
      profile: {
        title: 'Profile',
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
        noProducts: 'No products found.',
        recentSearches: {
          freshFruit: 'Fresh fruit',
          freshVegetable: 'Fresh vegetable',
          fastFood: 'Fast-food',
          coldDrinks: 'Cold drinks',
        }
      },
      productDetails: {
        loading: 'Loading...',
        notFound: 'Product not found.',
        available: 'Available in stock',
        outOfStock: 'Out of stock',
        description: 'Product Description',
        similar: 'Similar Products',
        noSimilar: 'No similar products yet.',
        failedToLoad: 'Failed to load similar products.'
      },
      myShop: {
        title: 'My Shop',
        placeholder: 'This is a placeholder for the My Shop page.'
      },
      account: {
        title: 'Account',
        info: 'Account Information',
        placeholder: 'This is a placeholder for the Account page.',
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        firstName: 'First Name',
        lastName: 'Last Name',
        phoneNumber: 'Phone Number',
        email: 'Email',
        role: 'Role',
        status: 'Status',
        createdAt: 'Created At',
        updatedAt: 'Updated At',
        loading: 'Loading...',
        failedToLoad: 'Failed to load account information',
        updateSuccess: 'Profile updated successfully',
        updateFailed: 'Failed to update profile',
        noData: 'No data available'
      },
      order: {
        orders: 'Orders',
        all: 'All',
        inProgress: 'In Progress',
        finished: 'Finished',
        in_progress: 'In Progress',
        pending: 'Pending',
        processing: 'Processing',
        delivered: 'Delivered',
        created: 'Created',
        operator_confirmed: 'Operator Confirmed',
        confirmed: 'Confirmed',
        packing: 'Packing',
        packed: 'Packed',
        courier_picked: 'Courier Picked',
        paid: 'Paid',
        rejected: 'Rejected',
        rejected_by_shop: 'Rejected by Shop',
        rejected_by_courier: 'Rejected by Courier',
        cancelled_by_client: 'Cancelled by Client',
        title1: 'Daily',
        title2: 'Grocery Food',
        noOrders: 'No orders found.',
        failedToLoad: 'Failed to load orders.',
        detailsNotFound: 'Order not found.',
        detailsTitle: 'Order #{{number}}',
        quantity: 'Quantity',
        subtotal: 'Subtotal',
        itemsTotal: 'Items total',
        deliveryFee: 'Delivery fee',
        total: 'Total',
        deliveryAddress: 'Delivery address',
        statusHistory: 'Status history',
        totalItems: 'Total Items',
        orderDate: 'Order Date',
        showItems: 'Show Items',
        hideItems: 'Hide Items',
        items: 'items',
        orderSummary: 'Order Summary',
        moreItems: '+{{count}} more'
      },
      loading: {
        appName: 'Yaqiin'
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
      common: {
        filter: 'Фильтр',
        priceRange: 'Диапазон цен',
        categories: 'Категории',
        recentlySearched: 'Недавние запросы',
        apply: 'Применить',
        addToCartFailed: 'Не удалось добавить товар в корзину',
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
        checkout: 'Оформить заказ',
        processing: 'Обработка...',
        userNotLoaded: 'Пользователь не загружен.',
        noAddress: 'Адрес доставки не найден.',
        multipleShops: 'Все товары должны быть из одного магазина.',
        orderSuccess: 'Заказ успешно оформлен!',
        checkoutFailed: 'Ошибка оформления заказа'
      },
      profile: {
        title: 'Профиль',
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
        noProducts: 'Товары не найдены.',
        recentSearches: {
          freshFruit: 'Свежие фрукты',
          freshVegetable: 'Свежие овощи',
          fastFood: 'Фастфуд',
          coldDrinks: 'Холодные напитки',
        }
      },
      productDetails: {
        loading: 'Загрузка...',
        notFound: 'Товар не найден.',
        available: 'В наличии',
        outOfStock: 'Нет в наличии',
        description: 'Описание товара',
        similar: 'Похожие товары',
        noSimilar: 'Похожих товаров пока нет.',
        failedToLoad: 'Не удалось загрузить похожие товары.'
      },
      myShop: {
        title: 'Мой магазин',
        placeholder: 'Это заглушка для страницы моего магазина.'
      },
      account: {
        title: 'Аккаунт',
        info: 'Информация об аккаунте',
        placeholder: 'Это заглушка для страницы аккаунта.',
        edit: 'Редактировать',
        save: 'Сохранить',
        cancel: 'Отмена',
        firstName: 'Имя',
        lastName: 'Фамилия',
        phoneNumber: 'Номер телефона',
        email: 'Электронная почта',
        role: 'Роль',
        status: 'Статус',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
        loading: 'Загрузка...',
        failedToLoad: 'Не удалось загрузить информацию об аккаунте',
        updateSuccess: 'Профиль успешно обновлен',
        updateFailed: 'Не удалось обновить профиль',
        noData: 'Данные недоступны'
      },
      order: {
        orders: 'Заказы',
        all: 'Все',
        inProgress: 'В процессе',
        finished: 'Завершено',
        in_progress: 'В процессе',
        pending: 'В ожидании',
        processing: 'В обработке',
        delivered: 'Доставлено',
        created: 'Создан',
        operator_confirmed: 'Подтвержден оператором',
        confirmed: 'Подтвержден',
        packing: 'Упаковывается',
        packed: 'Упакован',
        courier_picked: 'Курьер забрал',
        paid: 'Оплачен',
        rejected: 'Отклонён',
        rejected_by_shop: 'Отклонен магазином',
        rejected_by_courier: 'Отклонен курьером',
        cancelled_by_client: 'Отменен клиентом',
        title1: 'Ежедневные',
        title2: 'Продукты',
        noOrders: 'Заказы не найдены.',
        failedToLoad: 'Не удалось загрузить заказы.',
        detailsNotFound: 'Заказ не найден.',
        detailsTitle: 'Заказ №{{number}}',
        quantity: 'Количество',
        subtotal: 'Промежуточный итог',
        itemsTotal: 'Сумма товаров',
        deliveryFee: 'Стоимость доставки',
        total: 'Итого',
        deliveryAddress: 'Адрес доставки',
        statusHistory: 'История статусов',
        totalItems: 'Всего товаров',
        orderDate: 'Дата заказа',
        showItems: 'Показать товары',
        hideItems: 'Скрыть товары',
        items: 'товаров',
        orderSummary: 'Сводка заказа',
        moreItems: '+{{count}} еще'
      },
      loading: {
        appName: 'Yaqiin'
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
      common: {
        filter: 'Filtr',
        priceRange: 'Narx oraliği',
        categories: 'Kategoriyalar',
        recentlySearched: 'Yaqinda qidirilgan',
        apply: 'Qo‘llash',
        addToCartFailed: 'Mahsulotni savatga qo‘shib bo‘lmadi',
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
        checkout: 'Buyurtma berish',
        processing: 'Qayta ishlanmoqda...',
        userNotLoaded: 'Foydalanuvchi yuklanmadi.',
        noAddress: 'Yetkazib berish manzili topilmadi.',
        multipleShops: 'Barcha mahsulotlar bir doʻkondan bo‘lishi kerak.',
        orderSuccess: 'Buyurtma muvaffaqiyatli bajarildi!',
        checkoutFailed: 'To‘lovni amalga oshirishda xatolik'
      },
      profile: {
        title: 'Profil',
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
        noProducts: 'Mahsulotlar topilmadi.',
        recentSearches: {
          freshFruit: 'Yangi mevalar',
          freshVegetable: 'Yangi sabzavotlar',
          fastFood: 'Tezkor taomlar',
          coldDrinks: 'Sovuq ichimliklar',
        }
      },
      productDetails: {
        loading: 'Yuklanmoqda...',
        notFound: 'Mahsulot topilmadi.',
        available: 'Omborda mavjud',
        outOfStock: 'Omborda yo\'q',
        description: 'Mahsulot tavsifi',
        similar: 'O\'xshash mahsulotlar',
        noSimilar: 'O\'xshash mahsulotlar yo\'q.',
        failedToLoad: 'O\'xshash mahsulotlarni yuklab bo\'lmadi.'
      },
      myShop: {
        title: 'Mening do‘konim',
        placeholder: 'Bu Mening do‘konim sahifasi uchun zaxira matn.'
      },
      account: {
        title: 'Hisob',
        info: 'Hisob ma\'lumotlari',
        placeholder: 'Bu Hisob sahifasi uchun zaxira matn.',
        edit: 'Tahrirlash',
        save: 'Saqlash',
        cancel: 'Bekor qilish',
        firstName: 'Ism',
        lastName: 'Familiya',
        phoneNumber: 'Telefon raqami',
        email: 'Elektron pochta',
        role: 'Rol',
        status: 'Holat',
        createdAt: 'Yaratilgan sana',
        updatedAt: 'Yangilangan sana',
        loading: 'Yuklanmoqda...',
        failedToLoad: 'Hisob ma\'lumotlarini yuklab bo\'lmadi',
        updateSuccess: 'Profil muvaffaqiyatli yangilandi',
        updateFailed: 'Profilni yangilashda xatolik',
        noData: 'Ma\'lumotlar mavjud emas'
      },
      order: {
        orders: 'Buyurtmalar',
        all: 'Barcha',
        inProgress: 'Jarayonda',
        finished: 'Tugallangan',
        in_progress: 'Jarayonda',
        pending: 'Kutilmoqda',
        processing: 'Qayta ishlanmoqda',
        delivered: 'Yetkazib berildi',
        created: 'Yaratildi',
        operator_confirmed: 'Operator tasdiqladi',
        confirmed: 'Tasdiqlangan',
        packing: 'Qadoqlanmoqda',
        packed: 'Qadoqlandi',
        courier_picked: 'Kuryer oldi',
        paid: 'Toʻlandi',
        rejected: 'Rad etildi',
        rejected_by_shop: 'Do\'kon tomonidan rad etildi',
        rejected_by_courier: 'Kuryer tomonidan rad etildi',
        cancelled_by_client: 'Mijoz tomonidan bekor qilindi',
        title1: 'Kundalik',
        title2: 'Oziq-ovqat',
        noOrders: 'Buyurtmalar topilmadi.',
        failedToLoad: 'Buyurtmalarni yuklab boʻlmadi.',
        detailsNotFound: 'Buyurtma topilmadi.',
        detailsTitle: 'Buyurtma №{{number}}',
        quantity: 'Miqdor',
        subtotal: 'Yig\'indi',
        itemsTotal: 'Mahsulotlar summasi',
        deliveryFee: 'Yetkazib berish to\'lovi',
        total: 'Jami',
        deliveryAddress: 'Yetkazib berish manzili',
        statusHistory: 'Statuslar tarixi',
        totalItems: 'Jami mahsulotlar',
        orderDate: 'Buyurtma sanasi',
        showItems: 'Mahsulotlarni ko\'rsatish',
        hideItems: 'Mahsulotlarni yashirish',
        items: 'mahsulotlar',
        orderSummary: 'Buyurtma xulosasi',
        moreItems: '+{{count}} ta ko\'proq'
      },
      loading: {
        appName: 'Yaqiin'
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