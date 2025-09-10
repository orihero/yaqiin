import { ExcelProduct, CategoryWithAttributes } from './types';
import { DEFAULT_CONFIG } from './constants';

/**
 * Utility functions for Excel Import Service
 */

/**
 * Estimate token count for a given text (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / DEFAULT_CONFIG.TOKEN_ESTIMATION_RATIO);
}

/**
 * Extract weight/quantity information from product name
 */
export function extractProductInfo(productName: string): { unit: string; quantity: number } {
  const weightMatch = productName.match(/(\d+(?:[,.]\d+)?)\s*(кг|kg|г|g|л|l|ml|мл)/i);
  const quantityMatch = productName.match(/(\d+)\s*(шт|pcs|pack|box|bottle|can)/i);
  
  let detectedUnit = "pcs";
  let detectedQuantity = 1;
  
  if (weightMatch) {
    const weight = parseFloat(weightMatch[1].replace(',', '.'));
    const unit = weightMatch[2].toLowerCase();
    
    if (unit === 'кг' || unit === 'kg') {
      detectedUnit = "kg";
      detectedQuantity = weight;
    } else if (unit === 'г' || unit === 'g') {
      detectedUnit = "g";
      detectedQuantity = weight;
    } else if (unit === 'л' || unit === 'l') {
      detectedUnit = "l";
      detectedQuantity = weight;
    } else if (unit === 'мл' || unit === 'ml') {
      detectedUnit = "ml";
      detectedQuantity = weight;
    }
  } else if (quantityMatch) {
    detectedQuantity = parseInt(quantityMatch[1]);
    const unit = quantityMatch[2].toLowerCase();
    
    if (unit === 'шт' || unit === 'pcs') {
      detectedUnit = "pcs";
    } else if (unit === 'pack') {
      detectedUnit = "pack";
    } else if (unit === 'box') {
      detectedUnit = "box";
    } else if (unit === 'bottle') {
      detectedUnit = "bottle";
    } else if (unit === 'can') {
      detectedUnit = "can";
    }
  }

  return { unit: detectedUnit, quantity: detectedQuantity };
}

// Note: AI-based category optimization functions removed as we now use index-based category assignment

/**
 * Generate fallback Uzbek name from Russian name
 */
export function generateFallbackUzbekName(russianName: string): string {
  // Basic Russian to Uzbek translations for common words
  const translations: { [key: string]: string } = {
    'порошок': 'kukuni',
    'стиральный': 'kir yuvish',
    'средство': 'vosita',
    'чистящее': 'tozalash',
    'свежесть': 'yangilik',
    'от': 'dan',
    'для': 'uchun',
    'профессиональный': 'professional',
    'универсальный': 'universal',
    'цветной': 'rangli',
    'белый': 'oq',
    'автомат': 'avtomat',
    'ручная': 'qo\'l',
    'стирка': 'yuvish',
    'лаванда': 'lavanda',
    'цвет': 'rang',
    'профессионал': 'professional'
  };

  let uzbekName = russianName;
  
  // Apply translations
  Object.entries(translations).forEach(([russian, uzbek]) => {
    const regex = new RegExp(russian, 'gi');
    uzbekName = uzbekName.replace(regex, uzbek);
  });

  // Keep numbers and units as they are
  return uzbekName;
}

/**
 * Generate fallback Russian description
 */
export function generateFallbackDescriptionRu(productName: string): string {
  if (productName.toLowerCase().includes('порошок')) {
    return `<h3>🧽 Описание продукта</h3>
<p><strong>${productName}</strong> - эффективное моющее средство для стирки белья, обеспечивающее глубокую очистку и отличные результаты.</p>

<h3>✨ Основные преимущества</h3>
<ul>
<li>Глубокая очистка тканей</li>
<li>Удаление стойких пятен</li>
<li>Свежесть и приятный аромат</li>
<li>Подходит для различных типов тканей</li>
<li>Эффективен при разных температурных режимах</li>
</ul>

<h3>📋 Применение</h3>
<p>Идеально подходит для стирки белого и цветного белья. Обеспечивает отличные результаты как при ручной, так и при машинной стирке.</p>

<h3>⚠️ Рекомендации</h3>
<p>Храните в сухом месте, защищенном от прямых солнечных лучей. Используйте согласно инструкции на упаковке для достижения наилучших результатов.</p>`;
  }
  
  if (productName.toLowerCase().includes('чистящ')) {
    return `<h3>🧽 Описание продукта</h3>
<p><strong>${productName}</strong> - профессиональное чистящее средство для эффективной уборки различных поверхностей.</p>

<h3>✨ Основные преимущества</h3>
<ul>
<li>Мощная очищающая способность</li>
<li>Удаление загрязнений и пятен</li>
<li>Дезинфицирующие свойства</li>
<li>Приятный аромат после использования</li>
<li>Безопасность для различных поверхностей</li>
</ul>

<h3>📋 Применение</h3>
<p>Подходит для очистки кухонных поверхностей, ванных комнат, сантехники и других бытовых поверхностей. Эффективно справляется с жиром, накипью и другими загрязнениями.</p>

<h3>⚠️ Рекомендации</h3>
<p>Используйте в хорошо проветриваемых помещениях. Избегайте контакта с глазами и кожей. Храните в недоступном для детей месте.</p>`;
  }
  
  return `<h3>📦 Описание продукта</h3>
<p><strong>${productName}</strong> - качественный продукт для бытового использования, обеспечивающий отличные результаты и удобство в применении.</p>

<h3>✨ Основные преимущества</h3>
<ul>
<li>Высокое качество</li>
<li>Удобство использования</li>
<li>Надежность</li>
<li>Подходит для повседневного применения</li>
</ul>

<h3>📋 Применение</h3>
<p>Идеально подходит для повседневного использования в домашних условиях. Обеспечивает стабильные результаты и удовлетворяет потребности пользователей.</p>

<h3>⚠️ Рекомендации</h3>
<p>Следуйте инструкциям по использованию для достижения наилучших результатов. Храните в соответствии с рекомендациями производителя.</p>`;
}

/**
 * Generate fallback Uzbek description
 */
export function generateFallbackDescriptionUz(productName: string): string {
  if (productName.toLowerCase().includes('порошок')) {
    return `<h3>🧽 Mahsulot tavsifi</h3>
<p><strong>${productName}</strong> - kir yuvish uchun samarali yuvish vositasidir, chuqur tozalash va ajoyib natijalarni ta'minlaydi.</p>

<h3>✨ Asosiy afzalliklar</h3>
<ul>
<li>Mato turlarini chuqur tozalash</li>
<li>Qattiq dog'larni ketkazish</li>
<li>Yangilik va yoqimli hid</li>
<li>Turli xil mato turlari uchun mos</li>
<li>Turli harorat rejimlarida samarali</li>
</ul>

<h3>📋 Qo'llash</h3>
<p>Oq va rangli kirlarni yuvish uchun ideal. Qo'lda va mashinada yuvishda ham ajoyib natijalar beradi.</p>

<h3>⚠️ Tavsiyalar</h3>
<p>To'g'ridan-to'g'ri quyosh nurlaridan himoyalangan quruq joyda saqlang. Eng yaxshi natijalar uchun qadoqdagi ko'rsatmalarga amal qiling.</p>`;
  }
  
  if (productName.toLowerCase().includes('чистящ')) {
    return `<h3>🧽 Mahsulot tavsifi</h3>
<p><strong>${productName}</strong> - turli sirtlarni samarali tozalash uchun professional tozalash vositasidir.</p>

<h3>✨ Asosiy afzalliklar</h3>
<ul>
<li>Kuchli tozalash qobiliyati</li>
<li>Ifloslanish va dog'larni ketkazish</li>
<li>Dezinfektsiya xususiyatlari</li>
<li>Foydalanishdan keyin yoqimli hid</li>
<li>Turli sirt turlari uchun xavfsiz</li>
</ul>

<h3>📋 Qo'llash</h3>
<p>Oshxona sirtlari, hammom xonalari, sanitariya jihozlari va boshqa maishiy sirtlarni tozalash uchun mos. Yog', qotish va boshqa ifloslanishlar bilan samarali kurashadi.</p>

<h3>⚠️ Tavsiyalar</h3>
<p>Yaxshi shamollatiladigan joylarda ishlating. Ko'z va teri bilan aloqa qilishdan saqlaning. Bolalar qo'li yetmas joyda saqlang.</p>`;
  }
  
  return `<h3>📦 Mahsulot tavsifi</h3>
<p><strong>${productName}</strong> - maishiy foydalanish uchun sifatli mahsulot, ajoyib natijalar va qo'llashda qulaylikni ta'minlaydi.</p>

<h3>✨ Asosiy afzalliklar</h3>
<ul>
<li>Yuqori sifat</li>
<li>Foydalanish qulayligi</li>
<li>Ishonchlilik</li>
<li>Kundalik foydalanish uchun mos</li>
</ul>

<h3>📋 Qo'llash</h3>
<p>Uy sharoitida kundalik foydalanish uchun ideal. Barqaror natijalar beradi va foydalanuvchilar ehtiyojlarini qondiradi.</p>

<h3>⚠️ Tavsiyalar</h3>
<p>Eng yaxshi natijalar uchun foydalanish bo'yicha ko'rsatmalarga amal qiling. Ishlab chiqaruvchi tavsiyalariga muvofiq saqlang.</p>`;
}

/**
 * Detect unit from product name
 */
export function detectUnitFromName(productName: string): string {
  const nameLower = productName.toLowerCase();
  
  if (nameLower.includes('кг') || nameLower.includes('kg')) {
    return 'kg';
  }
  if (nameLower.includes('г') || nameLower.includes('g')) {
    return 'g';
  }
  if (nameLower.includes('л') || nameLower.includes('l')) {
    return 'l';
  }
  if (nameLower.includes('мл') || nameLower.includes('ml')) {
    return 'ml';
  }
  if (nameLower.includes('шт') || nameLower.includes('pcs')) {
    return 'pcs';
  }
  if (nameLower.includes('pack')) {
    return 'pack';
  }
  if (nameLower.includes('box')) {
    return 'box';
  }
  if (nameLower.includes('bottle')) {
    return 'bottle';
  }
  if (nameLower.includes('can')) {
    return 'can';
  }
  
  return 'pcs'; // default
}

/**
 * Get optimal thread count based on system capabilities
 */
export function getOptimalThreadCount(): number {
  try {
    // Get CPU core count
    const cpuCount = require('os').cpus().length;
    console.log(`💻 System has ${cpuCount} CPU cores`);
    
    // Calculate optimal thread count
    // Use CPU cores as base, but cap at reasonable limits for I/O bound tasks
    let optimalCount = cpuCount;
    
    // For I/O bound tasks like AI API calls and database operations,
    // we can use more threads than CPU cores
    optimalCount = Math.min(optimalCount * 2, DEFAULT_CONFIG.MAX_THREADS);
    optimalCount = Math.max(optimalCount, DEFAULT_CONFIG.MIN_THREADS);
    
    console.log(`🧵 Optimal thread count calculated: ${optimalCount} (based on ${cpuCount} CPU cores)`);
    return optimalCount;
  } catch (error) {
    console.warn(`⚠️ Could not detect CPU cores, using default thread count: 4`);
    return 4; // Fallback to 4 threads
  }
}

/**
 * Clean and parse AI response JSON
 */
export function cleanAndParseAIResponse(response: string): any {
  // Clean the response to handle common JSON issues
  let cleanedResponse = response.trim();

  // Remove any markdown code blocks if present
  if (cleanedResponse.startsWith("```json")) {
    cleanedResponse = cleanedResponse
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "");
  }
  if (cleanedResponse.startsWith("```")) {
    cleanedResponse = cleanedResponse
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "");
  }

  // Fix common JSON escaping issues
  cleanedResponse = cleanedResponse
    .replace(/(?<!\\)'/g, "\\'") // Escape unescaped single quotes
    .replace(/(?<!\\)"/g, '\\"') // Escape unescaped double quotes
    .replace(/\\'/g, "'") // Convert escaped single quotes back to regular
    .replace(/\\"/g, '"'); // Convert escaped double quotes back to regular

  return JSON.parse(cleanedResponse);
}
