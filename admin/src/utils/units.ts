// Unit definitions with translations

export interface UnitOption {
  value: string;
  label: {
    uz: string;
    ru: string;
  };
}

export const UNIT_OPTIONS: UnitOption[] = [
  { value: 'pcs', label: { uz: 'Dona', ru: 'Штук' } },
  { value: 'kg', label: { uz: 'KG', ru: 'КГ' } },
  { value: 'g', label: { uz: 'Gramm', ru: 'Грамм' } },
  { value: 'l', label: { uz: 'Litr', ru: 'Литр' } },
  { value: 'ml', label: { uz: 'Millilitr', ru: 'Миллилитр' } },
  { value: 'pack', label: { uz: 'Paket', ru: 'Пакет' } },
  { value: 'box', label: { uz: 'Quti', ru: 'Коробка' } },
  { value: 'bottle', label: { uz: 'Shisha', ru: 'Бутылка' } },
  { value: 'can', label: { uz: 'Banka', ru: 'Банка' } },
  { value: 'bag', label: { uz: 'Paket', ru: 'Мешок' } },
  { value: 'piece', label: { uz: 'Parça', ru: 'Кусок' } },
  { value: 'slice', label: { uz: 'Tilim', ru: 'Ломтик' } },
  { value: 'cup', label: { uz: 'Fincan', ru: 'Чашка' } },
  { value: 'tbsp', label: { uz: 'Osh qoshiq', ru: 'Столовая ложка' } },
  { value: 'tsp', label: { uz: 'Choy qoshiq', ru: 'Чайная ложка' } },
  { value: 'bunch', label: { uz: 'Dasta', ru: 'Пучок' } },
  { value: 'head', label: { uz: 'Bosh', ru: 'Головка' } },
  { value: 'clove', label: { uz: 'Tish', ru: 'Зубчик' } },
  { value: 'sprig', label: { uz: 'Shoxcha', ru: 'Веточка' } },
  { value: 'sheet', label: { uz: 'Barg', ru: 'Лист' } },
  { value: 'roll', label: { uz: 'Rulon', ru: 'Рулон' } },
  { value: 'bar', label: { uz: 'Plita', ru: 'Плитка' } },
  { value: 'stick', label: { uz: 'Tayoq', ru: 'Палочка' } },
  { value: 'cube', label: { uz: 'Kubik', ru: 'Кубик' } },
  { value: 'scoop', label: { uz: 'Qoshiq', ru: 'Ложка' } },
  { value: 'portion', label: { uz: 'Porsiya', ru: 'Порция' } },
  { value: 'serving', label: { uz: 'Xizmat', ru: 'Подача' } },
  { value: 'meal', label: { uz: 'Ovqat', ru: 'Блюдо' } },
  { value: 'set', label: { uz: 'To\'plam', ru: 'Набор' } },
  { value: 'pair', label: { uz: 'Juft', ru: 'Пара' } },
  { value: 'dozen', label: { uz: 'O\'n ikki', ru: 'Дюжина' } },
  { value: 'hundred', label: { uz: 'Yuz', ru: 'Сотня' } },
  { value: 'thousand', label: { uz: 'Ming', ru: 'Тысяча' } },
];

export const getUnitLabel = (value: string, language: 'uz' | 'ru' = 'uz'): string => {
  const unit = UNIT_OPTIONS.find(u => u.value === value);
  return unit ? `${unit.label.uz}/${unit.label.ru}` : value;
};

export const getUnitOptions = (language: 'uz' | 'ru' = 'uz'): { value: string; label: string }[] => {
  return UNIT_OPTIONS.map(unit => ({
    value: unit.value,
    label: `${unit.label.uz}/${unit.label.ru}`
  }));
};
