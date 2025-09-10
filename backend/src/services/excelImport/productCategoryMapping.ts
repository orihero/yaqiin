/**
 * Product Category Structure with Index Ranges
 * 
 * This file contains the category structure based on actual product data
 * with start and end indexes for each category/brand.
 * Categories are cleaned (numbers/years removed) and translated to Uzbek.
 */

export interface CategoryRange {
  name: { ru: string; uz: string };
  startIndex: number;
  endIndex: number;
  parentCategory?: string;
}

export const PRODUCT_CATEGORY_STRUCTURE: CategoryRange[] = [
  // Main Categories
  {
    name: { ru: "Химия", uz: "Кимё" },
    startIndex: 1,
    endIndex: 17464,
    parentCategory: undefined
  },
  {
    name: { ru: "Напитки", uz: "Ичимликлар" },
    startIndex: 17468,
    endIndex: 19573,
    parentCategory: undefined
  },
  {
    name: { ru: "Бакалея", uz: "Бакалея" },
    startIndex: 19577,
    endIndex: 23610,
    parentCategory: undefined
  },
  {
    name: { ru: "Шоколад и сладости", uz: "Шоколад ва ширинликлар" },
    startIndex: 23614,
    endIndex: 26808,
    parentCategory: undefined
  },
  {
    name: { ru: "Печенье", uz: "Печенье" },
    startIndex: 26812,
    endIndex: 30497,
    parentCategory: undefined
  },
  {
    name: { ru: "Овощи и фрукты", uz: "Сабзавот ва мевалар" },
    startIndex: 30501,
    endIndex: 31215,
    parentCategory: undefined
  },
  {
    name: { ru: "Колбасные изделия", uz: "Колбаса махсулотлари" },
    startIndex: 31219,
    endIndex: 31760,
    parentCategory: undefined
  },
  {
    name: { ru: "Молочные продукты", uz: "Сут махсулотлари" },
    startIndex: 31765,
    endIndex: 33672,
    parentCategory: undefined
  },
  {
    name: { ru: "Замороженные продукты", uz: "Музлатилган махсулотлар" },
    startIndex: 33676,
    endIndex: 34763,
    parentCategory: undefined
  },

  // Chemistry Subcategories
  {
    name: { ru: "Стиральный порошок", uz: "Кир ювиш кукуни" },
    startIndex: 2,
    endIndex: 142,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Гель для стирки", uz: "Кир ювиш гели" },
    startIndex: 144,
    endIndex: 360,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Кондиционер для белья", uz: "Кийим кондиционери" },
    startIndex: 429,
    endIndex: 480,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Отбеливатель", uz: "Оқартирувчи" },
    startIndex: 482,
    endIndex: 521,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Дезинфицирующее средство", uz: "Дезинфекция воситаси" },
    startIndex: 523,
    endIndex: 554,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Средство для мытья посуды", uz: "Идиш ювиш воситаси" },
    startIndex: 556,
    endIndex: 588,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Чистящее средство", uz: "Тозалаш воситаси" },
    startIndex: 590,
    endIndex: 604,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Капсулы для стирки", uz: "Кир ювиш капсулалари" },
    startIndex: 643,
    endIndex: 753,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Средство для засоров", uz: "Тиқилик воситаси" },
    startIndex: 362,
    endIndex: 373,
    parentCategory: "Химия"
  },

  // Chemistry Brand Categories
  {
    name: { ru: "Persil", uz: "Персил" },
    startIndex: 3,
    endIndex: 40,
    parentCategory: "Стиральный порошок"
  },
  {
    name: { ru: "Ariel", uz: "Ариэль" },
    startIndex: 42,
    endIndex: 74,
    parentCategory: "Стиральный порошок"
  },
  {
    name: { ru: "Losk", uz: "Лоск" },
    startIndex: 76,
    endIndex: 91,
    parentCategory: "Стиральный порошок"
  },
  {
    name: { ru: "Tide", uz: "Тайд" },
    startIndex: 93,
    endIndex: 120,
    parentCategory: "Стиральный порошок"
  },
  {
    name: { ru: "Мэй Фу", uz: "Мэй Фу" },
    startIndex: 122,
    endIndex: 142,
    parentCategory: "Стиральный порошок"
  },
  {
    name: { ru: "ABC Bimax", uz: "ABC Бимакс" },
    startIndex: 144,
    endIndex: 167,
    parentCategory: "Гель для стирки"
  },
  {
    name: { ru: "Берёзовая Роща", uz: "Кавок ўрмони" },
    startIndex: 169,
    endIndex: 237,
    parentCategory: "Гель для стирки"
  },
  {
    name: { ru: "Lenor", uz: "Ленор" },
    startIndex: 429,
    endIndex: 480,
    parentCategory: "Кондиционер для белья"
  },
  {
    name: { ru: "Vanish", uz: "Ваниш" },
    startIndex: 482,
    endIndex: 521,
    parentCategory: "Отбеливатель"
  },
  {
    name: { ru: "Domestos", uz: "Доместос" },
    startIndex: 523,
    endIndex: 554,
    parentCategory: "Дезинфицирующее средство"
  },
  {
    name: { ru: "Fairy", uz: "Фея" },
    startIndex: 556,
    endIndex: 588,
    parentCategory: "Средство для мытья посуды"
  },
  {
    name: { ru: "Cif", uz: "Сиф" },
    startIndex: 590,
    endIndex: 604,
    parentCategory: "Чистящее средство"
  },
  {
    name: { ru: "Aos", uz: "Аос" },
    startIndex: 606,
    endIndex: 641,
    parentCategory: "Средство для мытья посуды"
  },

  // More Chemistry Brand Categories
  {
    name: { ru: "Миф", uz: "Миф" },
    startIndex: 755,
    endIndex: 793,
    parentCategory: "Капсулы для стирки"
  },
  {
    name: { ru: "Yumos", uz: "Юмос" },
    startIndex: 795,
    endIndex: 814,
    parentCategory: "Кондиционер для белья"
  },
  {
    name: { ru: "Cillit", uz: "Силлит" },
    startIndex: 816,
    endIndex: 837,
    parentCategory: "Средство для засоров"
  },
  {
    name: { ru: "Calgon", uz: "Калгон" },
    startIndex: 839,
    endIndex: 858,
    parentCategory: "Средство для засоров"
  },
  {
    name: { ru: "Vernel", uz: "Вернел" },
    startIndex: 860,
    endIndex: 897,
    parentCategory: "Кондиционер для белья"
  },
  {
    name: { ru: "Утёнок", uz: "Утёнок" },
    startIndex: 899,
    endIndex: 925,
    parentCategory: "Стиральный порошок"
  },
  {
    name: { ru: "Bref", uz: "Бреф" },
    startIndex: 927,
    endIndex: 972,
    parentCategory: "Средство для засоров"
  },
  {
    name: { ru: "Weelnax", uz: "Вилнакс" },
    startIndex: 927,
    endIndex: 972,
    parentCategory: "Средство для засоров"
  },
  {
    name: { ru: "Mr.Muscle", uz: "Мистер Маскл" },
    startIndex: 974,
    endIndex: 985,
    parentCategory: "Средство для засоров"
  },
  {
    name: { ru: "Grass", uz: "Грасс" },
    startIndex: 987,
    endIndex: 1082,
    parentCategory: "Чистящее средство"
  },
  {
    name: { ru: "Sanfor", uz: "Санфор" },
    startIndex: 1084,
    endIndex: 1150,
    parentCategory: "Чистящее средство"
  },
  {
    name: { ru: "Sanita", uz: "Санита" },
    startIndex: 1152,
    endIndex: 1167,
    parentCategory: "Чистящее средство"
  },
  {
    name: { ru: "Chirton", uz: "Чиртон" },
    startIndex: 1169,
    endIndex: 1181,
    parentCategory: "Чистящее средство"
  },
  {
    name: { ru: "Grocc", uz: "Гроц" },
    startIndex: 1183,
    endIndex: 1227,
    parentCategory: "Чистящее средство"
  },
  {
    name: { ru: "Monster", uz: "Монстер" },
    startIndex: 1229,
    endIndex: 1240,
    parentCategory: "Чистящее средство"
  },
  {
    name: { ru: "Большая стирка", uz: "Катта кир ювиш" },
    startIndex: 1242,
    endIndex: 1253,
    parentCategory: "Отбеливатель"
  },
  {
    name: { ru: "Чистин", uz: "Чистин" },
    startIndex: 1255,
    endIndex: 1596,
    parentCategory: "Чистящее средство"
  },
  {
    name: { ru: "Max гель", uz: "Макс гель" },
    startIndex: 1599,
    endIndex: 1607,
    parentCategory: "Гель для стирки"
  },
  {
    name: { ru: "Зеленый чай", uz: "Яшил чой" },
    startIndex: 1609,
    endIndex: 1662,
    parentCategory: "Средство для мытья посуды"
  },

  // Air Fresheners and Fragrances
  {
    name: { ru: "AirWick", uz: "ЭйрВик" },
    startIndex: 1665,
    endIndex: 1725,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Glade", uz: "Глейд" },
    startIndex: 1727,
    endIndex: 1803,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Air Time", uz: "Эйр Тайм" },
    startIndex: 1805,
    endIndex: 1807,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Brait", uz: "Брайт" },
    startIndex: 1809,
    endIndex: 1849,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Doctor-S", uz: "Доктор-С" },
    startIndex: 1851,
    endIndex: 1854,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Areon", uz: "Ареон" },
    startIndex: 1856,
    endIndex: 1890,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Do-Re-Mi", uz: "До-Ре-Ми" },
    startIndex: 1892,
    endIndex: 1972,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Go Out", uz: "Го Аут" },
    startIndex: 1975,
    endIndex: 1989,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Раптор", uz: "Раптор" },
    startIndex: 1991,
    endIndex: 2060,
    parentCategory: "Химия"
  },

  // Furniture Polish
  {
    name: { ru: "Полироль для мебели", uz: "Мебель полироли" },
    startIndex: 2062,
    endIndex: 2077,
    parentCategory: "Химия"
  },

  // Soap Categories
  {
    name: { ru: "Palmolive", uz: "Палмолив" },
    startIndex: 2080,
    endIndex: 2116,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Olivia", uz: "Оливия" },
    startIndex: 2118,
    endIndex: 2202,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Aura", uz: "Аура" },
    startIndex: 2204,
    endIndex: 2287,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Детское мыло", uz: "Болалар совуни" },
    startIndex: 2289,
    endIndex: 2318,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Жидкое мыло", uz: "Суюк совун" },
    startIndex: 2320,
    endIndex: 2426,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Perfetto", uz: "Перфетто" },
    startIndex: 2428,
    endIndex: 2486,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Duru", uz: "Дуру" },
    startIndex: 2488,
    endIndex: 2517,
    parentCategory: "Химия"
  },
  {
    name: { ru: "ROX", uz: "РОКС" },
    startIndex: 2519,
    endIndex: 2528,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Safeguard", uz: "Сейфгард" },
    startIndex: 2530,
    endIndex: 2549,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Dove", uz: "Дов" },
    startIndex: 2551,
    endIndex: 2555,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Absolut", uz: "Абсолют" },
    startIndex: 2557,
    endIndex: 2699,
    parentCategory: "Химия"
  },

  // Baby Care and Hygiene Products
  {
    name: { ru: "Sunlight", uz: "Санлайт" },
    startIndex: 2703,
    endIndex: 2726,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Elma", uz: "Элма" },
    startIndex: 2728,
    endIndex: 2752,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Fresh Life", uz: "Фреш Лайф" },
    startIndex: 2754,
    endIndex: 2760,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Huggies", uz: "Хаггис" },
    startIndex: 2762,
    endIndex: 2769,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Ultra Compact", uz: "Ультра Компакт" },
    startIndex: 2771,
    endIndex: 2813,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Cotton Club", uz: "Коттон Клаб" },
    startIndex: 2815,
    endIndex: 2836,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Sleepy", uz: "Слипи" },
    startIndex: 2815,
    endIndex: 2836,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Amra", uz: "Амра" },
    startIndex: 2838,
    endIndex: 2868,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Premial", uz: "Премиал" },
    startIndex: 2870,
    endIndex: 2874,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Cleanly", uz: "Клинли" },
    startIndex: 2876,
    endIndex: 3022,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Zewa", uz: "Зева" },
    startIndex: 3047,
    endIndex: 3068,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Esty", uz: "Эсти" },
    startIndex: 3103,
    endIndex: 3303,
    parentCategory: "Химия"
  },

  // Oral Care
  {
    name: { ru: "Listerine", uz: "Листерин" },
    startIndex: 3306,
    endIndex: 3316,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Зубная паста", uz: "Тиш пастаси" },
    startIndex: 3318,
    endIndex: 3357,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Aquafresh", uz: "Аквафреш" },
    startIndex: 3359,
    endIndex: 3399,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Colgate", uz: "Колгейт" },
    startIndex: 3401,
    endIndex: 3513,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Splat", uz: "Сплат" },
    startIndex: 3515,
    endIndex: 3579,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Sensodyne", uz: "Сенсодин" },
    startIndex: 3581,
    endIndex: 3595,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Biomed", uz: "Биомед" },
    startIndex: 3597,
    endIndex: 3608,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Parodontax", uz: "Пародонтакс" },
    startIndex: 3610,
    endIndex: 3624,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Lacalut", uz: "Лакалют" },
    startIndex: 3626,
    endIndex: 3634,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Oral-B", uz: "Орал-Б" },
    startIndex: 3636,
    endIndex: 3679,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Корега", uz: "Корега" },
    startIndex: 3681,
    endIndex: 3690,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Reach", uz: "Рич" },
    startIndex: 3692,
    endIndex: 3705,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Signal", uz: "Сигнал" },
    startIndex: 3707,
    endIndex: 3709,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Blend-a-med", uz: "Бленд-а-мед" },
    startIndex: 3711,
    endIndex: 3718,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Miswak", uz: "Мисвак" },
    startIndex: 3720,
    endIndex: 3736,
    parentCategory: "Химия"
  },
  {
    name: { ru: "R.O.C.S.", uz: "Р.О.К.С." },
    startIndex: 3750,
    endIndex: 3846,
    parentCategory: "Химия"
  },

  // Hair Care
  {
    name: { ru: "Gliss Kur", uz: "Глисс Кур" },
    startIndex: 3849,
    endIndex: 3892,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Clear", uz: "Клир" },
    startIndex: 3894,
    endIndex: 3951,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Schauma", uz: "Шаума" },
    startIndex: 3953,
    endIndex: 3967,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Nivea", uz: "Нивея" },
    startIndex: 3969,
    endIndex: 4033,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Pantene", uz: "Пантин" },
    startIndex: 4035,
    endIndex: 4108,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Elseve", uz: "Эльсев" },
    startIndex: 4110,
    endIndex: 4169,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Head & Shoulders", uz: "Хед энд Шолдерс" },
    startIndex: 4171,
    endIndex: 4226,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Dove", uz: "Дов" },
    startIndex: 4228,
    endIndex: 4297,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Syoss", uz: "Сьосс" },
    startIndex: 4299,
    endIndex: 4369,
    parentCategory: "Химия"
  },
  {
    name: { ru: "L'Oreal", uz: "Л'Ореаль" },
    startIndex: 4420,
    endIndex: 4425,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Kerasys", uz: "Керасис" },
    startIndex: 4427,
    endIndex: 4490,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Fructis", uz: "Фруктис" },
    startIndex: 4492,
    endIndex: 4545,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Sunsilk", uz: "Сансилк" },
    startIndex: 4547,
    endIndex: 4548,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Кря-Кря", uz: "Кря-Кря" },
    startIndex: 4550,
    endIndex: 4566,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Johnson's baby", uz: "Джонсонс бэби" },
    startIndex: 4568,
    endIndex: 4631,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Чистая Линия", uz: "Тоза линия" },
    startIndex: 4633,
    endIndex: 4709,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Ушастый Нянь", uz: "Кулокли няня" },
    startIndex: 4711,
    endIndex: 4739,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Моя Прелесть", uz: "Менинг гўзаллигим" },
    startIndex: 4741,
    endIndex: 4750,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Avon", uz: "Эйвон" },
    startIndex: 4752,
    endIndex: 4857,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Trichup", uz: "Тричап" },
    startIndex: 4859,
    endIndex: 4958,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Dr∙Rashel", uz: "Доктор Рашель" },
    startIndex: 4859,
    endIndex: 4958,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Bio", uz: "Био" },
    startIndex: 4960,
    endIndex: 4975,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Fa", uz: "Фа" },
    startIndex: 5014,
    endIndex: 5032,
    parentCategory: "Химия"
  },
  {
    name: { ru: "MY MUSE", uz: "МАЙ МЬЮЗ" },
    startIndex: 5034,
    endIndex: 5315,
    parentCategory: "Химия"
  },

  // Household Items and Accessories
  {
    name: { ru: "Zewa туалетная бумага", uz: "Зева хожжат қоғози" },
    startIndex: 5318,
    endIndex: 5337,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Papia", uz: "Папия" },
    startIndex: 5339,
    endIndex: 5357,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Plushe туалетная бумага", uz: "Плюше хожжат қоғози" },
    startIndex: 5359,
    endIndex: 5368,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Hadiya", uz: "Хадия" },
    startIndex: 5370,
    endIndex: 5428,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Ножи", uz: "Пичоклар" },
    startIndex: 5431,
    endIndex: 5516,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Губки", uz: "Губкалар" },
    startIndex: 5518,
    endIndex: 5721,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Пакет", uz: "Пакет" },
    startIndex: 5723,
    endIndex: 5764,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Зубочистка", uz: "Тиш чиқарувчи" },
    startIndex: 5766,
    endIndex: 5788,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Бокалы и чашки", uz: "Коса ва пиёлалар" },
    startIndex: 5790,
    endIndex: 5792,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Швабры", uz: "Швабралар" },
    startIndex: 5794,
    endIndex: 6240,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Термос", uz: "Термос" },
    startIndex: 6242,
    endIndex: 6433,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Мыльница вешалка мочалка", uz: "Совундон илак мочалка" },
    startIndex: 6435,
    endIndex: 6501,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Расческа", uz: "Тарақ" },
    startIndex: 6503,
    endIndex: 6579,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Show", uz: "Шоу" },
    startIndex: 6582,
    endIndex: 6624,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Salton", uz: "Салтон" },
    startIndex: 6626,
    endIndex: 6651,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Casper", uz: "Каспер" },
    startIndex: 6653,
    endIndex: 6662,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Silver", uz: "Силвер" },
    startIndex: 6664,
    endIndex: 6778,
    parentCategory: "Химия"
  },

  // Batteries and Electronics
  {
    name: { ru: "Duracell", uz: "Дюраселл" },
    startIndex: 6781,
    endIndex: 6804,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Beshr", uz: "Бешр" },
    startIndex: 6806,
    endIndex: 6837,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Energizer", uz: "Энерджайзер" },
    startIndex: 6839,
    endIndex: 6875,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Panasonic", uz: "Панасоник" },
    startIndex: 6877,
    endIndex: 6898,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Varta", uz: "Варта" },
    startIndex: 6900,
    endIndex: 6935,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Evereday", uz: "Эверидей" },
    startIndex: 6937,
    endIndex: 6979,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Липучки", uz: "Липучкалар" },
    startIndex: 6981,
    endIndex: 6985,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Бокалы&Чашки&Графины", uz: "Коса&Пиёла&Графин" },
    startIndex: 6988,
    endIndex: 7216,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Чайники", uz: "Чойниклар" },
    startIndex: 7218,
    endIndex: 7615,
    parentCategory: "Химия"
  },

  // Baby Products
  {
    name: { ru: "Bubchen", uz: "Бубчен" },
    startIndex: 7618,
    endIndex: 7657,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Avent", uz: "Эйвент" },
    startIndex: 7659,
    endIndex: 7728,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Canpol Babies", uz: "Канпол Бэбис" },
    startIndex: 7730,
    endIndex: 7791,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Kippers детская гигиена", uz: "Кипперс болалар гигиенаси" },
    startIndex: 7793,
    endIndex: 7809,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Rabito", uz: "Рабито" },
    startIndex: 7811,
    endIndex: 8052,
    parentCategory: "Химия"
  },

  // Cosmetics
  {
    name: { ru: "Palette", uz: "Палетта" },
    startIndex: 8055,
    endIndex: 8105,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Garnier", uz: "Гарнье" },
    startIndex: 8107,
    endIndex: 8174,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Прелест", uz: "Гўзаллик" },
    startIndex: 8278,
    endIndex: 8359,
    parentCategory: "Химия"
  },

  // Deodorants
  {
    name: { ru: "Rexona", uz: "Рексона" },
    startIndex: 8362,
    endIndex: 8431,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Lady Speed stick", uz: "Леди Спид стик" },
    startIndex: 8497,
    endIndex: 8515,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Axe", uz: "Акс" },
    startIndex: 8517,
    endIndex: 8527,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Deonica", uz: "Деоника" },
    startIndex: 8563,
    endIndex: 8585,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Old Spice", uz: "Олд Спайс" },
    startIndex: 8587,
    endIndex: 8628,
    parentCategory: "Химия"
  },

  // Shaving Products
  {
    name: { ru: "Nivea гель, бальзам, пена для бритья", uz: "Нивея гель, бальзам, соқол олиш кўпиги" },
    startIndex: 8630,
    endIndex: 8667,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Arko", uz: "Арко" },
    startIndex: 8669,
    endIndex: 8693,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Mennen Speed", uz: "Меннен Спид" },
    startIndex: 8695,
    endIndex: 8700,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Gillette", uz: "Жиллетт" },
    startIndex: 8702,
    endIndex: 8788,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Бархатные ручки", uz: "Бархат қўллар" },
    startIndex: 8791,
    endIndex: 8800,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Bic", uz: "Бик" },
    startIndex: 9246,
    endIndex: 9264,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Schick", uz: "Шик" },
    startIndex: 9266,
    endIndex: 9285,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Dorco", uz: "Дорко" },
    startIndex: 9287,
    endIndex: 9298,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Formen", uz: "Формен" },
    startIndex: 9300,
    endIndex: 9337,
    parentCategory: "Химия"
  },

  // Feminine Hygiene
  {
    name: { ru: "Bella", uz: "Белла" },
    startIndex: 9340,
    endIndex: 9437,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Always", uz: "Олвейс" },
    startIndex: 9439,
    endIndex: 9472,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Котекс", uz: "Котекс" },
    startIndex: 9474,
    endIndex: 9512,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Libresse", uz: "Либрессе" },
    startIndex: 9514,
    endIndex: 9555,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Discreet", uz: "Дискрит" },
    startIndex: 9557,
    endIndex: 9566,
    parentCategory: "Химия"
  },
  {
    name: { ru: "O.b Тампоны", uz: "О.б Тампонлар" },
    startIndex: 9568,
    endIndex: 9589,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Free Style", uz: "Фри Стайл" },
    startIndex: 9591,
    endIndex: 9672,
    parentCategory: "Химия"
  },

  // Diapers
  {
    name: { ru: "Pampers Active", uz: "Памперс Актив" },
    startIndex: 9762,
    endIndex: 9813,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Prima", uz: "Прима" },
    startIndex: 9815,
    endIndex: 9839,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Libero", uz: "Либеро" },
    startIndex: 9841,
    endIndex: 9877,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Lalaku", uz: "Лалаку" },
    startIndex: 9879,
    endIndex: 9959,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Эвони", uz: "Эвони" },
    startIndex: 9963,
    endIndex: 9979,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Seni", uz: "Сени" },
    startIndex: 9981,
    endIndex: 9986,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Evy Baby", uz: "Эви Бэби" },
    startIndex: 9988,
    endIndex: 10015,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Leylek", uz: "Лейлек" },
    startIndex: 10018,
    endIndex: 10027,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Tena памперс", uz: "Тена памперс" },
    startIndex: 10029,
    endIndex: 10030,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Kippers подгузники", uz: "Кипперс подгузниклар" },
    startIndex: 10032,
    endIndex: 10046,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Chikako", uz: "Чикако" },
    startIndex: 10048,
    endIndex: 10059,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Мама знает", uz: "Она билади" },
    startIndex: 10061,
    endIndex: 10070,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Monchico", uz: "Мончико" },
    startIndex: 10072,
    endIndex: 10080,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Sleepy", uz: "Слипи" },
    startIndex: 10082,
    endIndex: 10143,
    parentCategory: "Химия"
  },

  // Pet Products and Miscellaneous
  {
    name: { ru: "Одеколон", uz: "Одеколон" },
    startIndex: 10145,
    endIndex: 10146,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Антисептик", uz: "Антисептик" },
    startIndex: 10148,
    endIndex: 10183,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Вискас", uz: "Вискас" },
    startIndex: 10186,
    endIndex: 10243,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Friskies", uz: "Фрискис" },
    startIndex: 10245,
    endIndex: 10259,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Мираторг", uz: "Мираторг" },
    startIndex: 10261,
    endIndex: 10386,
    parentCategory: "Химия"
  },

  // Fireworks and Party Items
  {
    name: { ru: "Фейерверки", uz: "Фейерверклар" },
    startIndex: 10389,
    endIndex: 10398,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Свечи", uz: "Шамлар" },
    startIndex: 10400,
    endIndex: 10531,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Надувной", uz: "Шиширилган" },
    startIndex: 10533,
    endIndex: 10577,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Хлопушка", uz: "Хлопушка" },
    startIndex: 10579,
    endIndex: 10595,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Мягкая игрушки", uz: "Юмшок ўйинчоклар" },
    startIndex: 10597,
    endIndex: 10644,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Игрушка", uz: "Ўйинчок" },
    startIndex: 10646,
    endIndex: 10905,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Свечи Party_candles", uz: "Шамлар Парти_кандлс" },
    startIndex: 10907,
    endIndex: 10932,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Вентилятор", uz: "Вентилятор" },
    startIndex: 10934,
    endIndex: 10950,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Новогодний игрушки", uz: "Янги йил ўйинчоклари" },
    startIndex: 10952,
    endIndex: 11538,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Маска", uz: "Маска" },
    startIndex: 11540,
    endIndex: 11557,
    parentCategory: "Химия"
  },

  // Household Cleaning and Storage
  {
    name: { ru: "Пакеты для мусора", uz: "Чанг-тузок учун пакетлар" },
    startIndex: 11560,
    endIndex: 11666,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Расход, топлива, стрейч", uz: "Харажат, ёқилғи, стрейч" },
    startIndex: 11669,
    endIndex: 11752,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Сумаляк", uz: "Сумаляк" },
    startIndex: 11754,
    endIndex: 11761,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Перчатки", uz: "Элдонлар" },
    startIndex: 11763,
    endIndex: 11799,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Фольга и бумага для выпечки", uz: "Фольга ва пахталаш учун қоғоз" },
    startIndex: 11801,
    endIndex: 11837,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Стрейч", uz: "Стрейч" },
    startIndex: 11839,
    endIndex: 11866,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Коробки подарочные новогодние", uz: "Совға қутилари янги йил" },
    startIndex: 11868,
    endIndex: 11940,
    parentCategory: "Химия"
  },

  // Miscellaneous Items
  {
    name: { ru: "Ремень", uz: "Камар" },
    startIndex: 12316,
    endIndex: 12364,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Хна", uz: "Хна" },
    startIndex: 12367,
    endIndex: 12389,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Парфюм", uz: "Парфюм" },
    startIndex: 12391,
    endIndex: 12816,
    parentCategory: "Химия"
  },

  // Cosmetics and Beauty
  {
    name: { ru: "Тональный крем", uz: "Тональ крем" },
    startIndex: 12818,
    endIndex: 12923,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Тушь", uz: "Туш" },
    startIndex: 12925,
    endIndex: 13017,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Крем", uz: "Крем" },
    startIndex: 13019,
    endIndex: 13210,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Лосьон", uz: "Лосьон" },
    startIndex: 13212,
    endIndex: 13278,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Мицеллярная вода", uz: "Мицелляр сув" },
    startIndex: 13280,
    endIndex: 13334,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Помада", uz: "Помада" },
    startIndex: 13336,
    endIndex: 13382,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Скраб", uz: "Скраб" },
    startIndex: 13384,
    endIndex: 13402,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Dely", uz: "Дели" },
    startIndex: 13404,
    endIndex: 13443,
    parentCategory: "Химия"
  },
  {
    name: { ru: "FFLEUR", uz: "ФФЛЕУР" },
    startIndex: 13445,
    endIndex: 13963,
    parentCategory: "Химия"
  },

  // Electronics and Appliances
  {
    name: { ru: "Бытовая техника", uz: "Уй техникаси" },
    startIndex: 13965,
    endIndex: 14061,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Сахий.уз", uz: "Сахий.уз" },
    startIndex: 14063,
    endIndex: 14088,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Бальзамы и крема для волос", uz: "Соч учун бальзам ва кремлар" },
    startIndex: 14090,
    endIndex: 14108,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Маски для тела и волос", uz: "Тан ва соч учун маскалар" },
    startIndex: 14110,
    endIndex: 14110,
    parentCategory: "Химия"
  },

  // Stationery
  {
    name: { ru: "Ручки", uz: "Ручкалар" },
    startIndex: 14113,
    endIndex: 14303,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Карандаши", uz: "Қаламлар" },
    startIndex: 14305,
    endIndex: 14432,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Ножницы и ножи", uz: "Қайчи ва пичоклар" },
    startIndex: 14434,
    endIndex: 14491,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Клей канцелярский", uz: "Канцеляр клей" },
    startIndex: 14493,
    endIndex: 14541,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Калькуляторы", uz: "Калькуляторлар" },
    startIndex: 14543,
    endIndex: 14557,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Тетради", uz: "Дэфтарлар" },
    startIndex: 14559,
    endIndex: 14632,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Фломастеры и маркеры", uz: "Фломастер ва маркерлар" },
    startIndex: 14634,
    endIndex: 14746,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Листы белые", uz: "Оқ варақлар" },
    startIndex: 14748,
    endIndex: 14756,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Краски акварельные", uz: "Акварел бўёқлар" },
    startIndex: 14758,
    endIndex: 14778,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Пластилин", uz: "Пластилин" },
    startIndex: 14780,
    endIndex: 14810,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Точилки и резинки", uz: "Калам тешар ва резинкалар" },
    startIndex: 14812,
    endIndex: 14912,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Блокноты", uz: "Блокнотлар" },
    startIndex: 14914,
    endIndex: 15082,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Линейки", uz: "Линейкалар" },
    startIndex: 15084,
    endIndex: 15118,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Скотч", uz: "Скотч" },
    startIndex: 15120,
    endIndex: 15191,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Школьная форма", uz: "Мактаб формаси" },
    startIndex: 15193,
    endIndex: 15196,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Книги", uz: "Китоблар" },
    startIndex: 15198,
    endIndex: 15213,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Зажимы и заколки", uz: "Тиқич ва заколкалар" },
    startIndex: 15215,
    endIndex: 15691,
    parentCategory: "Химия"
  },

  // Clothing and Accessories
  {
    name: { ru: "Носки", uz: "Пайпоқлар" },
    startIndex: 15693,
    endIndex: 15869,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Чулки", uz: "Чулоклар" },
    startIndex: 15871,
    endIndex: 15892,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Уголь", uz: "Кўмир" },
    startIndex: 15894,
    endIndex: 15919,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Подарки", uz: "Совғалар" },
    startIndex: 15921,
    endIndex: 16011,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Лампочки и удлинители", uz: "Лампа ва удлинительлар" },
    startIndex: 16013,
    endIndex: 16168,
    parentCategory: "Химия"
  },

  // Flowers and Plants
  {
    name: { ru: "Цветы живые", uz: "Тирраклар" },
    startIndex: 16170,
    endIndex: 16189,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Цветы мыльные и искусственные", uz: "Совун гуллар ва сунъий" },
    startIndex: 16191,
    endIndex: 16222,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Корзины", uz: "Саватлар" },
    startIndex: 16224,
    endIndex: 16228,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Заколки и ободки", uz: "Заколка ва ободкалар" },
    startIndex: 16230,
    endIndex: 16419,
    parentCategory: "Химия"
  },

  // Personal Care
  {
    name: { ru: "Презервативы", uz: "Презервативлар" },
    startIndex: 16421,
    endIndex: 16473,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Аксессуары", uz: "Аксессуарлар" },
    startIndex: 16475,
    endIndex: 16797,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Одежда", uz: "Кийим" },
    startIndex: 16799,
    endIndex: 16821,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Полотенце", uz: "Сўзгич" },
    startIndex: 16823,
    endIndex: 16856,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Универсал Искандар", uz: "Универсал Искандар" },
    startIndex: 16858,
    endIndex: 16864,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Хозяюшка", uz: "Хўжайин" },
    startIndex: 16866,
    endIndex: 16990,
    parentCategory: "Химия"
  },

  // Empty sections and test items
  {
    name: { ru: "Пусто", uz: "Бўш" },
    startIndex: 16992,
    endIndex: 17000,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Порошок Dosia", uz: "Дозия кукуни" },
    startIndex: 17067,
    endIndex: 17071,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Тест", uz: "Тест" },
    startIndex: 17073,
    endIndex: 17075,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Тапочки", uz: "Тапочкалар" },
    startIndex: 17078,
    endIndex: 17284,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Букеты & Цветы", uz: "Букетлар ва гуллар" },
    startIndex: 17286,
    endIndex: 17331,
    parentCategory: "Химия"
  },
  {
    name: { ru: "Салат Master Chef", uz: "Салат Мастер Шеф" },
    startIndex: 17333,
    endIndex: 17464,
    parentCategory: "Химия"
  },

  // Beverages Section - Energy Drinks
  {
    name: { ru: "18+", uz: "18+" },
    startIndex: 17468,
    endIndex: 17474,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Adrenalin", uz: "Адреналин" },
    startIndex: 17476,
    endIndex: 17489,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Red Bull", uz: "Ред Булл" },
    startIndex: 17491,
    endIndex: 17500,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Jaguar", uz: "Ягуар" },
    startIndex: 17502,
    endIndex: 17510,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Tornado", uz: "Торнадо" },
    startIndex: 17512,
    endIndex: 17518,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Flash", uz: "Флеш" },
    startIndex: 17520,
    endIndex: 17538,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Gorilla", uz: "Горилла" },
    startIndex: 17540,
    endIndex: 17554,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Schweppes", uz: "Швепс" },
    startIndex: 17556,
    endIndex: 17570,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "EON", uz: "ЭОН" },
    startIndex: 17572,
    endIndex: 17574,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "LIT ENERGY", uz: "ЛИТ ЭНЕРДЖИ" },
    startIndex: 17576,
    endIndex: 17587,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Burn Rockstar", uz: "Берн Рокстар" },
    startIndex: 17589,
    endIndex: 17592,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Rani B Fresh", uz: "Рани Би Фреш" },
    startIndex: 17594,
    endIndex: 17668,
    parentCategory: "Напитки"
  },

  // Soft Drinks
  {
    name: { ru: "Fanta", uz: "Фанта" },
    startIndex: 17671,
    endIndex: 17707,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Coca Cola", uz: "Кока Кола" },
    startIndex: 17709,
    endIndex: 17757,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Pepsi", uz: "Пепси" },
    startIndex: 17759,
    endIndex: 17784,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Love is", uz: "Лав ис" },
    startIndex: 17786,
    endIndex: 17794,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Динай", uz: "Динай" },
    startIndex: 17796,
    endIndex: 17828,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сан Славия", uz: "Сан Славия" },
    startIndex: 17830,
    endIndex: 17843,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Aloe", uz: "Алоэ" },
    startIndex: 17845,
    endIndex: 17882,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Пульс", uz: "Пульс" },
    startIndex: 17884,
    endIndex: 17904,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Ессентуки", uz: "Ессентуки" },
    startIndex: 17906,
    endIndex: 17916,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "OKF", uz: "ОКФ" },
    startIndex: 17918,
    endIndex: 17946,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Mirinda", uz: "Миринда" },
    startIndex: 17948,
    endIndex: 17955,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Laimon Fresh", uz: "Лаймон Фреш" },
    startIndex: 17957,
    endIndex: 17971,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Черноголовка", uz: "Черноголовка" },
    startIndex: 17973,
    endIndex: 18003,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Ceylon", uz: "Цейлон" },
    startIndex: 18005,
    endIndex: 18020,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сады Тянь-Шаня", uz: "Тян-Шан боглари" },
    startIndex: 18022,
    endIndex: 18034,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Айс Tea", uz: "Айс Чой" },
    startIndex: 18036,
    endIndex: 18043,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Lipton чай", uz: "Липтон чой" },
    startIndex: 18045,
    endIndex: 18066,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Лимонад Гармония Вкуса", uz: "Лимонад Гармония Таъми" },
    startIndex: 18068,
    endIndex: 18076,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "7-Up", uz: "7-Ап" },
    startIndex: 18078,
    endIndex: 18089,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Sprite", uz: "Спрайт" },
    startIndex: 18091,
    endIndex: 18101,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Smile Tea & Biolife", uz: "Смайл Чой ва Биолайф" },
    startIndex: 18103,
    endIndex: 18122,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Натахтари", uz: "Натахтари" },
    startIndex: 18124,
    endIndex: 18142,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Asu", uz: "Асу" },
    startIndex: 18144,
    endIndex: 18173,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Lava Lava", uz: "Лава Лава" },
    startIndex: 18175,
    endIndex: 18186,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Fresh bar", uz: "Фреш бар" },
    startIndex: 18188,
    endIndex: 18208,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Mountain Dew", uz: "Маунтин Дью" },
    startIndex: 18210,
    endIndex: 18219,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Мохито Fresh", uz: "Мохито Фреш" },
    startIndex: 18221,
    endIndex: 18229,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Fuse tea Piala Палпи", uz: "Фьюз чой Пиала Палпи" },
    startIndex: 18231,
    endIndex: 18239,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Dada & ava", uz: "Дада ва ава" },
    startIndex: 18241,
    endIndex: 18265,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Barbican Barberry", uz: "Барбикан Барбери" },
    startIndex: 18267,
    endIndex: 18420,
    parentCategory: "Напитки"
  },

  // Juices
  {
    name: { ru: "Bagdan компот", uz: "Багдан компот" },
    startIndex: 18424,
    endIndex: 18456,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Bliss", uz: "Блисс шарбати" },
    startIndex: 18458,
    endIndex: 18501,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сочная Долина", uz: "Ширин Долина" },
    startIndex: 18503,
    endIndex: 18531,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Наш Сад", uz: "Бизнинг Бог шарбати" },
    startIndex: 18533,
    endIndex: 18540,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок J-7", uz: "Ж-7 шарбати" },
    startIndex: 18542,
    endIndex: 18553,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Swell", uz: "Свелл шарбати" },
    startIndex: 18555,
    endIndex: 18575,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Ararat", uz: "Арарат" },
    startIndex: 18577,
    endIndex: 18605,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Dena", uz: "Дена шарбати" },
    startIndex: 18607,
    endIndex: 18634,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Tropic", uz: "Тропик" },
    startIndex: 18636,
    endIndex: 18657,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Добрый", uz: "Добрый шарбати" },
    startIndex: 18659,
    endIndex: 18699,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Я", uz: "Мен шарбати" },
    startIndex: 18701,
    endIndex: 18712,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сады Придонья", uz: "Придонье боглари" },
    startIndex: 18714,
    endIndex: 18764,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Rich", uz: "Рич шарбати" },
    startIndex: 18766,
    endIndex: 18781,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Соки Viko", uz: "Вико шарбатлари" },
    startIndex: 18783,
    endIndex: 18795,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Granini", uz: "Гранини шарбати" },
    startIndex: 18797,
    endIndex: 18799,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Фруто Няня", uz: "Фруто Няня" },
    startIndex: 18801,
    endIndex: 18837,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Bizim Tarla", uz: "Бизим Тарла" },
    startIndex: 18839,
    endIndex: 18844,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "UzKand компот", uz: "УзКанд компот" },
    startIndex: 18846,
    endIndex: 18850,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Organic", uz: "Органик" },
    startIndex: 18852,
    endIndex: 18860,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Восточный Сад", uz: "Шарқий Бог" },
    startIndex: 18862,
    endIndex: 18874,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Dream Fruits", uz: "Дрим Фрутс" },
    startIndex: 18876,
    endIndex: 18876,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Кухмастер", uz: "Кухмастер шарбати" },
    startIndex: 18878,
    endIndex: 18895,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Up сок", uz: "Ап шарбати" },
    startIndex: 18897,
    endIndex: 18901,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Àsil & Ermak сок", uz: "Асил ва Эрмак шарбати" },
    startIndex: 18903,
    endIndex: 18928,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Дивный сад", uz: "Дивный сад шарбати" },
    startIndex: 18930,
    endIndex: 18948,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Sun Star", uz: "Сан Стар шарбати" },
    startIndex: 18950,
    endIndex: 18959,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Мой", uz: "Менинг шарбатим" },
    startIndex: 18961,
    endIndex: 18981,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Сок Behamad", uz: "Бехамад шарбати" },
    startIndex: 18983,
    endIndex: 19009,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Flavis", uz: "Флавис" },
    startIndex: 19011,
    endIndex: 19123,
    parentCategory: "Напитки"
  },

  // Water
  {
    name: { ru: "Вода Nestle", uz: "Нестле суви" },
    startIndex: 19126,
    endIndex: 19131,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Вода Borjomi", uz: "Боржоми суви" },
    startIndex: 19133,
    endIndex: 19147,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Вода Hydrolife", uz: "Гидролайф суви" },
    startIndex: 19149,
    endIndex: 19167,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Вода Chortoq", uz: "Чортоқ суви" },
    startIndex: 19169,
    endIndex: 19203,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Вода Bonaqua", uz: "Бонаква суви" },
    startIndex: 19205,
    endIndex: 19208,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Вода Зам зам", uz: "Зам зам суви" },
    startIndex: 19210,
    endIndex: 19224,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Вода Blanc Bleu", uz: "Бланк Бле суви" },
    startIndex: 19226,
    endIndex: 19237,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Вода Montella", uz: "Монтелла суви" },
    startIndex: 19239,
    endIndex: 19254,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Вода Legend", uz: "Легенд суви" },
    startIndex: 19256,
    endIndex: 19267,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "Вода Ever", uz: "Эвер суви" },
    startIndex: 19269,
    endIndex: 19358,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "OU7 SABER", uz: "ОУ7 САБЕР" },
    startIndex: 19360,
    endIndex: 19374,
    parentCategory: "Напитки"
  },
  {
    name: { ru: "AVA", uz: "АВА" },
    startIndex: 19376,
    endIndex: 19573,
    parentCategory: "Напитки"
  },

  // Бакалея Section - Oils and Condiments
  {
    name: { ru: "Сиропы", uz: "Сироплар" },
    startIndex: 19577,
    endIndex: 19587,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Стожар", uz: "Стожар" },
    startIndex: 19589,
    endIndex: 19593,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Олейна", uz: "Олейна" },
    startIndex: 19595,
    endIndex: 19611,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Хозяйка", uz: "Хўжайин" },
    startIndex: 19613,
    endIndex: 19618,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Tonny Gold", uz: "Тонни Голд" },
    startIndex: 19620,
    endIndex: 19630,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Слобода", uz: "Слобода" },
    startIndex: 19632,
    endIndex: 19638,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Затея", uz: "Затея" },
    startIndex: 19640,
    endIndex: 19643,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Coopoliva", uz: "Коополива" },
    startIndex: 19645,
    endIndex: 19648,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Monini", uz: "Монини" },
    startIndex: 19650,
    endIndex: 19662,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Оливковое масло", uz: "Зайтун ёғи" },
    startIndex: 19664,
    endIndex: 19731,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Соль", uz: "Туз" },
    startIndex: 19733,
    endIndex: 19792,
    parentCategory: "Бакалея"
  },

  // Canned Goods
  {
    name: { ru: "Bonduelle", uz: "Бондуэль" },
    startIndex: 19795,
    endIndex: 19818,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Riga Gold", uz: "Рига Голд" },
    startIndex: 19820,
    endIndex: 19880,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Lorado", uz: "Лорадо" },
    startIndex: 19882,
    endIndex: 19907,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Maestro de olivia", uz: "Маэстро де оливия" },
    startIndex: 19909,
    endIndex: 19934,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Kaija", uz: "Кайя" },
    startIndex: 19936,
    endIndex: 19983,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Veranda", uz: "Веранда" },
    startIndex: 19985,
    endIndex: 19996,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Барс", uz: "Барс" },
    startIndex: 19998,
    endIndex: 20018,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Heinz", uz: "Хайнц" },
    startIndex: 20020,
    endIndex: 20033,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Iberica", uz: "Иберика" },
    startIndex: 20035,
    endIndex: 20053,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "За Родину", uz: "Ватан учун" },
    startIndex: 20055,
    endIndex: 20081,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Ulutas", uz: "Улутас" },
    startIndex: 20083,
    endIndex: 20092,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Capella", uz: "Капелла" },
    startIndex: 20094,
    endIndex: 20210,
    parentCategory: "Бакалея"
  },

  // Pasta and Grains
  {
    name: { ru: "Makfa", uz: "Макфа" },
    startIndex: 20213,
    endIndex: 20256,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Макиз", uz: "Макиз" },
    startIndex: 20258,
    endIndex: 20279,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Grand di Pasta", uz: "Гранд ди Паста" },
    startIndex: 20281,
    endIndex: 20293,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Barilla", uz: "Барилла" },
    startIndex: 20295,
    endIndex: 20332,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Botegga", uz: "Ботегга" },
    startIndex: 20334,
    endIndex: 20449,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Маленькое Счастье", uz: "Кичик бахт" },
    startIndex: 20452,
    endIndex: 20483,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Олий немат", uz: "Олий немат" },
    startIndex: 20485,
    endIndex: 20490,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Мука Макиз", uz: "Макиз уни" },
    startIndex: 20492,
    endIndex: 20496,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Мука Макфа", uz: "Макфа уни" },
    startIndex: 20498,
    endIndex: 20506,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "МУКА", uz: "УН" },
    startIndex: 20508,
    endIndex: 20635,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Геркулес", uz: "Геркулес" },
    startIndex: 20638,
    endIndex: 20672,
    parentCategory: "Бакалея"
  },

  // Breakfast and Cereals
  {
    name: { ru: "Nesquik", uz: "Несквик" },
    startIndex: 20674,
    endIndex: 20701,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Каша Минутка", uz: "Дақиқа бош" },
    startIndex: 20703,
    endIndex: 20714,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Любятово", uz: "Любятово" },
    startIndex: 20716,
    endIndex: 20741,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Kosmostars", uz: "Космостарс" },
    startIndex: 20743,
    endIndex: 20774,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Nestle", uz: "Нестле" },
    startIndex: 20743,
    endIndex: 20774,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Fitness", uz: "Фитнес" },
    startIndex: 20776,
    endIndex: 20786,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Мистраль", uz: "Мистраль" },
    startIndex: 20805,
    endIndex: 20836,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Увелка", uz: "Увелка" },
    startIndex: 20838,
    endIndex: 20878,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Matti", uz: "Матти" },
    startIndex: 20880,
    endIndex: 20975,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Big Bon", uz: "Биг Бон" },
    startIndex: 20978,
    endIndex: 20991,
    parentCategory: "Бакалея"
  },

  // Instant Food
  {
    name: { ru: "Доширак", uz: "Доширак" },
    startIndex: 20993,
    endIndex: 21004,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Hot lunch", uz: "Хот ланч" },
    startIndex: 21006,
    endIndex: 21015,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Быстрый Суп", uz: "Тез суп" },
    startIndex: 21017,
    endIndex: 21106,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Питание", uz: "Овқат" },
    startIndex: 21109,
    endIndex: 21116,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Кукурузы", uz: "Маккажўхори" },
    startIndex: 21118,
    endIndex: 21135,
    parentCategory: "Бакалея"
  },

  // Baby Food
  {
    name: { ru: "Nutrilon", uz: "Нутрилон" },
    startIndex: 21137,
    endIndex: 21157,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Nan", uz: "Нан" },
    startIndex: 21159,
    endIndex: 21201,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Нутрилак", uz: "Нутрилак" },
    startIndex: 21203,
    endIndex: 21255,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Nuppi", uz: "Нуппи" },
    startIndex: 21257,
    endIndex: 21293,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Nestogen", uz: "Нестоген" },
    startIndex: 21295,
    endIndex: 21311,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Humana", uz: "Хумана" },
    startIndex: 21365,
    endIndex: 21401,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Фруто няня каша", uz: "Фруто няня бош" },
    startIndex: 21403,
    endIndex: 21438,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Heinz каша", uz: "Хайнц бош" },
    startIndex: 21440,
    endIndex: 21479,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Когда я вырасту", uz: "Мен улгурганимда" },
    startIndex: 21481,
    endIndex: 21499,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Винни Каша", uz: "Винни Бош" },
    startIndex: 21501,
    endIndex: 21502,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "пюре Nestle", uz: "пюре Нестле" },
    startIndex: 21504,
    endIndex: 21513,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Heinz пюре", uz: "Хайнц пюре" },
    startIndex: 21515,
    endIndex: 21546,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Фруто Няня пюре", uz: "Фруто Няня пюре" },
    startIndex: 21548,
    endIndex: 21621,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Агуша", uz: "Агуша" },
    startIndex: 21623,
    endIndex: 21657,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Gerber пюре", uz: "Гербер пюре" },
    startIndex: 21659,
    endIndex: 21686,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Тёма", uz: "Тёма" },
    startIndex: 21688,
    endIndex: 21695,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Ложка Ладошке", uz: "Қошик Ладошке" },
    startIndex: 21697,
    endIndex: 21710,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Malyuk", uz: "Малюк" },
    startIndex: 21712,
    endIndex: 21729,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Nutrish", uz: "Нутриш" },
    startIndex: 21712,
    endIndex: 21729,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Nutribén", uz: "Нутрибен" },
    startIndex: 21731,
    endIndex: 21737,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Беллакт", uz: "Беллакт" },
    startIndex: 21739,
    endIndex: 21782,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Hipp", uz: "Хипп" },
    startIndex: 21739,
    endIndex: 21782,
    parentCategory: "Бакалея"
  },

  // Condiments and Sauces
  {
    name: { ru: "Уксус", uz: "Сирка" },
    startIndex: 21784,
    endIndex: 21840,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Махеевь Джем", uz: "Махеев Жем" },
    startIndex: 21843,
    endIndex: 21864,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Главпродукт варенье", uz: "Главпродукт мураббо" },
    startIndex: 21866,
    endIndex: 21885,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Uzkand", uz: "УзКанд" },
    startIndex: 21887,
    endIndex: 21954,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Махеевъ", uz: "Махеев" },
    startIndex: 21957,
    endIndex: 22024,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Майонез Слобода", uz: "Майонез Слобода" },
    startIndex: 22026,
    endIndex: 22076,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Mr.Ricco", uz: "Мистер Рикко" },
    startIndex: 22139,
    endIndex: 22153,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Tanho", uz: "Танхо" },
    startIndex: 22155,
    endIndex: 22199,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Calve", uz: "Калве" },
    startIndex: 22201,
    endIndex: 22219,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Оливьез", uz: "Оливьез" },
    startIndex: 22221,
    endIndex: 22228,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Astoria", uz: "Астория" },
    startIndex: 22230,
    endIndex: 22248,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Чим чим соус", uz: "Чим чим соус" },
    startIndex: 22250,
    endIndex: 22259,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Камако", uz: "Камако" },
    startIndex: 22261,
    endIndex: 22267,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Балтимор", uz: "Балтимор" },
    startIndex: 22269,
    endIndex: 22284,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Elena", uz: "Елена" },
    startIndex: 22286,
    endIndex: 22398,
    parentCategory: "Бакалея"
  },

  // Canned Fruits and Vegetables
  {
    name: { ru: "Консервированные Фрукты", uz: "Консерваланган мевалар" },
    startIndex: 22400,
    endIndex: 22433,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "LTZ", uz: "ЛТЗ" },
    startIndex: 22436,
    endIndex: 22529,
    parentCategory: "Бакалея"
  },

  // Spices and Seasonings
  {
    name: { ru: "Spice Expert", uz: "Спайс Эксперт" },
    startIndex: 22531,
    endIndex: 22633,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Gallina Blanca", uz: "Галлина Бланка" },
    startIndex: 22635,
    endIndex: 22661,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Dr.Oetker", uz: "Доктор Эткер" },
    startIndex: 22663,
    endIndex: 22723,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Organic Baharat", uz: "Органик Бахарат" },
    startIndex: 22725,
    endIndex: 22758,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Maggi", uz: "Магги" },
    startIndex: 22760,
    endIndex: 22796,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Shafran", uz: "Шафран" },
    startIndex: 22798,
    endIndex: 22811,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Mega", uz: "Мега" },
    startIndex: 22813,
    endIndex: 22842,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Torto", uz: "Торто" },
    startIndex: 22844,
    endIndex: 22863,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Kikkoman", uz: "Киккоман" },
    startIndex: 22865,
    endIndex: 22873,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Kotanyi", uz: "Котани" },
    startIndex: 22875,
    endIndex: 22888,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Aleco", uz: "Алеко" },
    startIndex: 22890,
    endIndex: 22898,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Kent", uz: "Кент" },
    startIndex: 22900,
    endIndex: 23014,
    parentCategory: "Бакалея"
  },

  // Canned Meat
  {
    name: { ru: "Foodmaxx тушенка", uz: "Фудмакс тушилка" },
    startIndex: 23017,
    endIndex: 23035,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Osiyo Тушенка", uz: "Осиё Тушилка" },
    startIndex: 23037,
    endIndex: 23053,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Rital-D", uz: "Ритал-Д" },
    startIndex: 23055,
    endIndex: 23058,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Главпродукт", uz: "Главпродукт" },
    startIndex: 23060,
    endIndex: 23073,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Hame", uz: "Хаме" },
    startIndex: 23075,
    endIndex: 23088,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Savr Нишон Бахт", uz: "Савр Нишон Бахт" },
    startIndex: 23090,
    endIndex: 23092,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Дядя Ваня", uz: "Амма Ваня" },
    startIndex: 23138,
    endIndex: 23168,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Marinelle", uz: "Маринелле" },
    startIndex: 23170,
    endIndex: 23187,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Foodmax", uz: "Фудмакс" },
    startIndex: 23189,
    endIndex: 23212,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Marinova Garden's", uz: "Маринова Гарденс" },
    startIndex: 23214,
    endIndex: 23230,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Московский", uz: "Московский" },
    startIndex: 23232,
    endIndex: 23257,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Veranda грибы", uz: "Веранда қузиқотин" },
    startIndex: 23259,
    endIndex: 23267,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Ideal", uz: "Идеал" },
    startIndex: 23269,
    endIndex: 23273,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Столичный", uz: "Столичный" },
    startIndex: 23275,
    endIndex: 23283,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Бабушкины Рецепты", uz: "Бувиларнинг Рецептлари" },
    startIndex: 23285,
    endIndex: 23294,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Tukas", uz: "Тукас" },
    startIndex: 23296,
    endIndex: 23304,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Кубаночка", uz: "Кубаночка" },
    startIndex: 23306,
    endIndex: 23474,
    parentCategory: "Бакалея"
  },

  // Grains and Cereals
  {
    name: { ru: "Зерно", uz: "Дон" },
    startIndex: 23476,
    endIndex: 23552,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Mali", uz: "Мали" },
    startIndex: 23556,
    endIndex: 23572,
    parentCategory: "Бакалея"
  },
  {
    name: { ru: "Муза", uz: "Муза" },
    startIndex: 23574,
    endIndex: 23610,
    parentCategory: "Бакалея"
  },

  // Шоколад и сладости Section - Tea and Coffee
  {
    name: { ru: "Amir Чай", uz: "Амир Чой" },
    startIndex: 23614,
    endIndex: 23678,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Lipton Чай в коробке", uz: "Липтон қутидаги чой" },
    startIndex: 23680,
    endIndex: 23707,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Bayce Чай", uz: "Байсе Чой" },
    startIndex: 23709,
    endIndex: 23722,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Ahmad Чай", uz: "Ахмад Чой" },
    startIndex: 23724,
    endIndex: 23801,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Impra Чай", uz: "Импра Чой" },
    startIndex: 23803,
    endIndex: 23840,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Richard Чай", uz: "Ричард Чой" },
    startIndex: 23842,
    endIndex: 23849,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Чай Tudor", uz: "Тюдор Чой" },
    startIndex: 23851,
    endIndex: 23890,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Tess", uz: "Тесс" },
    startIndex: 23892,
    endIndex: 23946,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Greenfield", uz: "Гринфилд" },
    startIndex: 23948,
    endIndex: 23986,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Чай Развесной", uz: "Тартибдаги чой" },
    startIndex: 23988,
    endIndex: 24002,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Фиточай", uz: "Фиточой" },
    startIndex: 24004,
    endIndex: 24011,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Teaco Tea Library", uz: "Теако Чой Кутубхонаси" },
    startIndex: 24013,
    endIndex: 24045,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Azercay", uz: "Азерчай" },
    startIndex: 24047,
    endIndex: 24070,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Piala чай", uz: "Пиала чой" },
    startIndex: 24072,
    endIndex: 24088,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Akbar Чай", uz: "Акбар Чой" },
    startIndex: 24090,
    endIndex: 24103,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Caykur", uz: "Чайкур" },
    startIndex: 24105,
    endIndex: 24114,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Dilmah", uz: "Дилмах" },
    startIndex: 24116,
    endIndex: 24134,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Чай Aslan Tea", uz: "Аслан Чой" },
    startIndex: 24136,
    endIndex: 24192,
    parentCategory: "Шоколад и сладости"
  },

  // Coffee
  {
    name: { ru: "Jacobs", uz: "Жакобс" },
    startIndex: 24195,
    endIndex: 24257,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Nescafe", uz: "Нескафе" },
    startIndex: 24259,
    endIndex: 24333,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Maccoffee", uz: "Маккофе" },
    startIndex: 24335,
    endIndex: 24364,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Carte Noire", uz: "Карт Нуар" },
    startIndex: 24366,
    endIndex: 24377,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Черная карта", uz: "Қора карта" },
    startIndex: 24379,
    endIndex: 24385,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Tchibo", uz: "Чибо" },
    startIndex: 24387,
    endIndex: 24408,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Egoiste", uz: "Эгоист" },
    startIndex: 24410,
    endIndex: 24421,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Ambassador", uz: "Амбассадор" },
    startIndex: 24423,
    endIndex: 24426,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Lavazza", uz: "Лавацца" },
    startIndex: 24428,
    endIndex: 24472,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Jockey", uz: "Жокей" },
    startIndex: 24474,
    endIndex: 24497,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Jardin", uz: "Жардин" },
    startIndex: 24499,
    endIndex: 24525,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Maxwell House", uz: "Максвелл Хаус" },
    startIndex: 24527,
    endIndex: 24531,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Barista", uz: "Бариста" },
    startIndex: 24533,
    endIndex: 24551,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Torabika", uz: "Торабика" },
    startIndex: 24553,
    endIndex: 24559,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Davidoff", uz: "Давидофф" },
    startIndex: 24561,
    endIndex: 24563,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Starbucks", uz: "Старбакс" },
    startIndex: 24565,
    endIndex: 24584,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Цикорий", uz: "Цикорий" },
    startIndex: 24586,
    endIndex: 24674,
    parentCategory: "Шоколад и сладости"
  },

  // Chocolate and Sweets
  {
    name: { ru: "Nesquike", uz: "Несквике" },
    startIndex: 24677,
    endIndex: 24721,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Dirol", uz: "Дирол" },
    startIndex: 24724,
    endIndex: 24726,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Orbit", uz: "Орбит" },
    startIndex: 24728,
    endIndex: 24742,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Trident", uz: "Трайдент" },
    startIndex: 24744,
    endIndex: 24755,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Mentos", uz: "Ментос" },
    startIndex: 24757,
    endIndex: 24781,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Tic Tac", uz: "Тик Так" },
    startIndex: 24783,
    endIndex: 24793,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Mamba", uz: "Мамба" },
    startIndex: 24795,
    endIndex: 24810,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Stimorol", uz: "Стиморол" },
    startIndex: 24812,
    endIndex: 24812,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Cavendish", uz: "Кавендиш" },
    startIndex: 24814,
    endIndex: 24820,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Five 5", uz: "Файв 5" },
    startIndex: 24822,
    endIndex: 24829,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Sula", uz: "Сула" },
    startIndex: 24831,
    endIndex: 24834,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Bobbo", uz: "Боббо" },
    startIndex: 24836,
    endIndex: 24842,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Tofita", uz: "Тофита" },
    startIndex: 24844,
    endIndex: 24909,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Toffix", uz: "Тоффикс" },
    startIndex: 24844,
    endIndex: 24909,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "сахар развесной", uz: "тартибдаги қанд" },
    startIndex: 24912,
    endIndex: 24960,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Chococream", uz: "Чококрем" },
    startIndex: 24963,
    endIndex: 24973,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Nutella", uz: "Нутелла" },
    startIndex: 24975,
    endIndex: 25043,
    parentCategory: "Шоколад и сладости"
  },

  // Local Confectionery
  {
    name: { ru: "Азиза ойти кондитер", uz: "Азиза ойти кондитер" },
    startIndex: 25047,
    endIndex: 25059,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Сладкий Дом", uz: "Ширин Уй" },
    startIndex: 25061,
    endIndex: 25093,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Napoleon Bakery", uz: "Наполеон Бейкери" },
    startIndex: 25095,
    endIndex: 25097,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Vanille", uz: "Ваниль" },
    startIndex: 25099,
    endIndex: 25107,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Лола Кондитер", uz: "Лола Кондитер" },
    startIndex: 25109,
    endIndex: 25129,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Шахбоз Кондитер", uz: "Шахбоз Кондитер" },
    startIndex: 25131,
    endIndex: 25151,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Almond", uz: "Алмонд" },
    startIndex: 25153,
    endIndex: 25158,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Enfes", uz: "Энфес" },
    startIndex: 25160,
    endIndex: 25185,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Париж Золотой Сад", uz: "Париж Олтин Бог" },
    startIndex: 25187,
    endIndex: 25197,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Danacioglu пахлава", uz: "Даначиоглу пахлава" },
    startIndex: 25199,
    endIndex: 25216,
    parentCategory: "Шоколад и сладости"
  },

  // International Chocolate Brands
  {
    name: { ru: "Toy Box", uz: "Той Бокс" },
    startIndex: 25218,
    endIndex: 25303,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "M & M's", uz: "М энд Мс" },
    startIndex: 25306,
    endIndex: 25348,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Milka", uz: "Милка" },
    startIndex: 25350,
    endIndex: 25534,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Alpen Gold", uz: "Альпен Голд" },
    startIndex: 25536,
    endIndex: 25581,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Алёнка", uz: "Алёнка" },
    startIndex: 25583,
    endIndex: 25619,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Бабаевские", uz: "Бабаевские" },
    startIndex: 25621,
    endIndex: 25658,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Skittles", uz: "Скитлс" },
    startIndex: 25660,
    endIndex: 25685,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Kit kat", uz: "Кит кат" },
    startIndex: 25687,
    endIndex: 25719,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Ferrero", uz: "Ферреро" },
    startIndex: 25721,
    endIndex: 25757,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Twix", uz: "Твикс" },
    startIndex: 25759,
    endIndex: 25773,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Snickers", uz: "Сникерс" },
    startIndex: 25775,
    endIndex: 25796,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Chupa Chups", uz: "Чупа Чупс" },
    startIndex: 25798,
    endIndex: 25830,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Picnic", uz: "Пикник" },
    startIndex: 25832,
    endIndex: 25835,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Roshen", uz: "Рошен" },
    startIndex: 25906,
    endIndex: 25930,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Ritter Sport", uz: "Риттер Спорт" },
    startIndex: 25932,
    endIndex: 25942,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Raffaello", uz: "Раффаэлло" },
    startIndex: 25944,
    endIndex: 25962,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Millenium", uz: "Миллениум" },
    startIndex: 25964,
    endIndex: 26008,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Milky Way", uz: "Милки Вей" },
    startIndex: 26010,
    endIndex: 26018,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Kinder", uz: "Киндер" },
    startIndex: 26020,
    endIndex: 26096,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Merci", uz: "Мерси" },
    startIndex: 26163,
    endIndex: 26174,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Bounty", uz: "Баунти" },
    startIndex: 26176,
    endIndex: 26187,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "россия", uz: "россия" },
    startIndex: 26189,
    endIndex: 26196,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Для диабетиков", uz: "Диабетлилар учун" },
    startIndex: 26198,
    endIndex: 26228,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Победа", uz: "Ғалаба" },
    startIndex: 26230,
    endIndex: 26265,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Mars", uz: "Марс" },
    startIndex: 26267,
    endIndex: 26279,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "nuts", uz: "юғори" },
    startIndex: 26281,
    endIndex: 26292,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Ulker", uz: "Улкер" },
    startIndex: 26294,
    endIndex: 26350,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Maltesers", uz: "Мальтезерс" },
    startIndex: 26352,
    endIndex: 26359,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Озера", uz: "Кўллар" },
    startIndex: 26361,
    endIndex: 26722,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Joyca", uz: "Жойка" },
    startIndex: 26725,
    endIndex: 26737,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Toffifee", uz: "Тоффифи" },
    startIndex: 26739,
    endIndex: 26791,
    parentCategory: "Шоколад и сладости"
  },
  {
    name: { ru: "Halva Avvali", uz: "Халва Аввали" },
    startIndex: 26793,
    endIndex: 26808,
    parentCategory: "Шоколад и сладости"
  }
];

/**
 * Find the appropriate category for a product based on its index in the Excel file
 */
export function findCategoryByIndex(productIndex: number): CategoryRange | null {
  // Find the most specific category that contains this index
  let bestMatch: CategoryRange | null = null;
  let bestSpecificity = 0;

  for (const category of PRODUCT_CATEGORY_STRUCTURE) {
    if (productIndex >= category.startIndex && productIndex <= category.endIndex) {
      // Calculate specificity (more specific = smaller range)
      const range = category.endIndex - category.startIndex;
      const specificity = 1 / (range + 1); // +1 to avoid division by zero
      
      if (specificity > bestSpecificity) {
        bestMatch = category;
        bestSpecificity = specificity;
      }
    }
  }

  return bestMatch;
}

/**
 * Get all main categories (top level)
 */
export function getMainCategories(): CategoryRange[] {
  return PRODUCT_CATEGORY_STRUCTURE.filter(cat => !cat.parentCategory);
}

/**
 * Get subcategories for a specific main category
 */
export function getSubcategories(mainCategoryName: string): CategoryRange[] {
  return PRODUCT_CATEGORY_STRUCTURE.filter(cat => cat.parentCategory === mainCategoryName);
}

/**
 * Get brand categories for a specific subcategory
 */
export function getBrandCategories(subcategoryName: string): CategoryRange[] {
  return PRODUCT_CATEGORY_STRUCTURE.filter(cat => cat.parentCategory === subcategoryName);
}

/**
 * Clean category name by removing numbers and years
 */
export function cleanCategoryName(name: string): string {
  return name
    .replace(/\s+\d{4}\s*$/, '') // Remove year at the end
    .replace(/\s+\d+\s*$/, '') // Remove numbers at the end
    .replace(/\s+\d{1,2}\s*-\s*\d{1,2}\s*$/, '') // Remove ranges like "15-20"
    .replace(/\s+готов\s*$/, '') // Remove "готов" at the end
    .replace(/\s+\?\s*$/, '') // Remove "?" at the end
    .trim();
}
