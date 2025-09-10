import { UnitOption } from './types';

// Unit options for AI to choose from
export const UNIT_OPTIONS: UnitOption[] = [
  { value: "pcs", label: "Dona/Штук" },
  { value: "kg", label: "KG/КГ" },
  { value: "g", label: "Gramm/Грамм" },
  { value: "l", label: "Litr/Литр" },
  { value: "ml", label: "Millilitr/Миллилитр" },
  { value: "pack", label: "Paket/Пакет" },
  { value: "box", label: "Quti/Коробка" },
  { value: "bottle", label: "Shisha/Бутылка" },
  { value: "can", label: "Banka/Банка" },
  { value: "bag", label: "Paket/Мешок" },
  { value: "piece", label: "Parça/Кусок" },
  { value: "slice", label: "Tilim/Ломтик" },
  { value: "cup", label: "Fincan/Чашка" },
  { value: "tbsp", label: "Osh qoshiq/Столовая ложка" },
  { value: "tsp", label: "Choy qoshiq/Чайная ложка" },
  { value: "bunch", label: "Dasta/Пучок" },
  { value: "head", label: "Bosh/Головка" },
  { value: "clove", label: "Tish/Зубчик" },
  { value: "sprig", label: "Shoxcha/Веточка" },
  { value: "sheet", label: "Barg/Лист" },
  { value: "roll", label: "Rulon/Рулон" },
  { value: "bar", label: "Plita/Плитка" },
  { value: "stick", label: "Tayoq/Палочка" },
  { value: "cube", label: "Kubik/Кубик" },
  { value: "scoop", label: "Qoshiq/Ложка" },
  { value: "portion", label: "Porsiya/Порция" },
  { value: "serving", label: "Xizmat/Подача" },
  { value: "meal", label: "Ovqat/Блюдо" },
  { value: "set", label: "To'plam/Набор" },
  { value: "pair", label: "Juft/Пара" },
  { value: "dozen", label: "O'n ikki/Дюжина" },
  { value: "hundred", label: "Yuz/Сотня" },
  { value: "thousand", label: "Ming/Тысяча" },
];

// Environment variable defaults
export const DEFAULT_CONFIG = {
  OPENROUTER_BASE_URL: "https://openrouter.ai/api/v1",
  OPENROUTER_MODEL: "anthropic/claude-3.5-haiku",
  OPENROUTER_IMAGE_GEN_MODEL: "google/gemini-2.5-flash-image-preview",
  EXCEL_IMPORT_LIMIT: 500,
  THREAD_TIMEOUT_MS: 7*24*2*30 * 60 * 1000, // 7 days
  MAX_THREADS: 28,
  MIN_THREADS: 2,
  TOKEN_ESTIMATION_RATIO: 4, // 1 token ≈ 4 characters
  MAX_CATEGORY_TOKENS: 15000,
  MAX_CATEGORIES_IN_PROMPT: 100,
  MAX_ATTRIBUTES_PER_CATEGORY: 10,
  MAX_FALLBACK_CATEGORIES: 20,
  // Category checking mode - when enabled, checks and corrects categories for existing products
  EXCEL_IMPORT_CHECK_CATEGORIES: true,
} as const;
