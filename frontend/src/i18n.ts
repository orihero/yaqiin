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