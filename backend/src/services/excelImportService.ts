import * as XLSX from "xlsx";
import OpenAI from "openai";
import Category from "../models/Category";
import Product from "../models/Product";
import openRouterImageService, { OpenRouterImageService } from "./openRouterImageService";

// Unit options for AI to choose from
const UNIT_OPTIONS = [
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

interface ExcelProduct {
  code: string;
  name: string;
  price: number;
  category?: string;
  subcategory?: string;
  subsubcategory?: string;
}

interface EnhancedProduct {
  code: string;
  name: {
    ru: string;
    uz: string;
  };
  description?: {
    ru: string;
    uz: string;
  };
  price: number;
  unit: string;
  imageUrl?: string;
  categoryId: string;
}

export class ExcelImportService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    });
  }

  async parseExcelFile(filePath: string): Promise<ExcelProduct[]> {
    try {
      console.log(`📖 Reading Excel file: ${filePath}`);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      console.log(`📄 Using sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(`📊 Total rows in Excel: ${jsonData.length}`);

      // Skip header rows and find data rows
      const products: ExcelProduct[] = [];
      let currentCategory = "";
      let currentSubcategory = "";
      let currentSubsubcategory = "";

      for (let i = 2; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length < 3) continue;

        const code = row[0]?.toString() || "";
        const name = row[1]?.toString() || "";
        const price = parseFloat(row[2]) || 0;

        // Skip rows with no code or price (category headers)
        if (!code || price === 0) {
          // This might be a category header
          if (name && !code) {
            if (name.includes("BUYUK GAGARIN")) {
              currentCategory = "BUYUK GAGARIN";
              currentSubcategory = "";
              currentSubsubcategory = "";
            } else if (name.includes("Отдел Химия")) {
              currentSubcategory = "Отдел Химия";
              currentSubsubcategory = "";
            } else if (name.includes("Чистящее средство")) {
              currentSubsubcategory = "Чистящее средство";
            } else if (name.includes("Стиральный Порошок")) {
              currentSubsubcategory = "Стиральный Порошок";
            } else if (name.includes("Persil")) {
              currentSubsubcategory = "Persil";
            }
          }
          continue;
        }

        // This is a product row
        products.push({
          code,
          name,
          price,
          category: currentCategory,
          subcategory: currentSubcategory,
          subsubcategory: currentSubsubcategory,
        });
      }

      console.log(`✅ Excel parsing completed. Found ${products.length} products`);
      console.log(`📂 Category breakdown:`, {
        "BUYUK GAGARIN": products.filter((p) => p.category === "BUYUK GAGARIN").length,
        Other: products.filter((p) => p.category !== "BUYUK GAGARIN").length,
      });

      return products;
    } catch (error) {
      console.error("❌ Error parsing Excel file:", error);
      throw new Error("Failed to parse Excel file");
    }
  }

  async enhanceProductWithAI(product: ExcelProduct): Promise<Partial<EnhancedProduct>> {
    try {
      console.log(`🤖 Starting AI enhancement for product: ${product.name}`);

      // Generate product images using OpenRouter
      console.log(`🎨 Generating images for: ${product.name}`);
      let generatedImages: any[] = [];
      try {
        if (openRouterImageService.isConfigured()) {
          generatedImages = await openRouterImageService.generateProductImages(product.name, undefined, 3);
          console.log(`✅ Generated ${generatedImages.length} images for: ${product.name}`);
        } else {
          console.warn(`⚠️ OpenRouter not configured, skipping image generation for: ${product.name}`);
        }
      } catch (error) {
        console.error(`❌ Error generating images for ${product.name}:`, error);
        generatedImages = [];
      }

      // Save generated images to file system
      let savedImageUrls: string[] = [];
      if (generatedImages.length > 0) {
        console.log(`💾 Saving ${generatedImages.length} generated images to file system...`);
        for (let i = 0; i < generatedImages.length; i++) {
          const image = generatedImages[i];
          try {
            const filename = `${product.name.toLowerCase().replace(/\s+/g, '-')}-generated-${Date.now()}-${i + 1}`;
            const filePath = await OpenRouterImageService.saveGeneratedImage(
              { url: image.image_url.url, type: 'image_url', image_url: { url: image.image_url.url } },
              filename,
              'uploads'
            );
            // Convert file path to HTTP URL - handle both Windows and Unix paths
            const pathParts = filePath.replace(/\\/g, '/').split('/');
            const fileName = pathParts[pathParts.length - 1] || '';
            const apiUrl = process.env.API_URL || 'http://localhost:8080';
            const httpUrl = `${apiUrl}/uploads/${fileName}`;
            console.log(`📁 File saved at: ${filePath}`);
            console.log(`🌐 HTTP URL: ${httpUrl}`);
            savedImageUrls.push(httpUrl);
            console.log(`✅ Saved generated image: ${httpUrl}`);
          } catch (saveError) {
            console.warn(`⚠️ Failed to save generated image ${i + 1}:`, saveError);
          }
        }
      }

      // Extract weight/quantity information from product name
      const weightMatch = product.name.match(/(\d+(?:[,.]\d+)?)\s*(кг|kg|г|g|л|l|ml|мл)/i);
      const quantityMatch = product.name.match(/(\d+)\s*(шт|pcs|pack|box|bottle|can)/i);
      
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

      // Prepare the text prompt for AI enhancement
      const textPrompt = `
        Analyze this product and provide detailed information in JSON format:
        
        Product: ${product.name}
        Price: ${product.price} UZS
        Category: ${product.category} > ${product.subcategory} > ${product.subsubcategory}
        Detected Unit: ${detectedUnit} (${detectedQuantity})
        
        Please provide:
        1. Proper Uzbek translation of the product name (not just copying Russian)
        2. Detailed product description in Russian (at least 2-3 sentences)
        3. Detailed product description in Uzbek (at least 2-3 sentences)
        4. Most appropriate unit from this list: ${UNIT_OPTIONS.map((u) => u.value).join(", ")}
        
        IMPORTANT GUIDELINES:
        - For Uzbek translation: Translate properly, don't just copy Russian text
        - For descriptions: Include product benefits, features, usage instructions
        - For units: Use the most logical unit (kg for large weights, g for small weights, etc.)
        - Be specific about product features, benefits, and usage
        - Include information about effectiveness, suitability, and target use cases
        
        Return only valid JSON with this structure:
        {
          "name_uz": "Proper Uzbek translation",
          "description_ru": "Detailed Russian description with features and benefits",
          "description_uz": "Detailed Uzbek description with features and benefits", 
          "unit": "most_appropriate_unit"
        }
        
        IMPORTANT: 
        - Use proper JSON escaping for special characters
        - Provide meaningful, detailed descriptions
        - Choose the most logical unit based on product type and weight
        - Make Uzbek translation natural and proper, not just transliteration
      `;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-haiku",
        messages: [
          {
            role: "system",
            content: "You are a product data specialist with expertise in Russian and Uzbek languages. Provide accurate translations and detailed product information. Focus on creating meaningful, helpful descriptions that include product features, benefits, and usage instructions. Always provide proper Uzbek translations, not just transliterations.",
          },
          {
            role: "user",
            content: textPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      console.log(`📡 AI response received for: ${product.name}`);

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from AI service");
      }

      // Try to parse JSON response
      let aiData;
      try {
        console.log(`🔍 Attempting to parse AI response for: ${product.name}`);
        console.log(`📄 Raw AI response: ${response}`);

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

        console.log(`🧹 Cleaned response: ${cleanedResponse}`);

        aiData = JSON.parse(cleanedResponse);
        console.log(`✅ Successfully parsed AI response for: ${product.name}`);
      } catch (parseError) {
        console.error(`❌ Failed to parse AI response for: ${product.name}`);
        console.error(`🔍 Parse error:`, parseError);
        console.error(`📄 Original response:`, response);

        // Improved fallback data with better logic
        const fallbackNameUz = this.generateFallbackUzbekName(product.name);
        const fallbackDescriptionRu = this.generateFallbackDescriptionRu(product.name, product.category);
        const fallbackDescriptionUz = this.generateFallbackDescriptionUz(product.name, product.category);
        
        aiData = {
          name_uz: fallbackNameUz,
          description_ru: fallbackDescriptionRu,
          description_uz: fallbackDescriptionUz,
          unit: detectedUnit,
        };
        console.log(`🔄 Using improved fallback data for: ${product.name}`);
      }

      // Use the first saved generated image as the product image
      const finalImageUrl = savedImageUrls.length > 0 ? savedImageUrls[0] : "";
      console.log(`🖼️ Final image URL for product: ${finalImageUrl}`);

      const enhancedProduct = {
        code: product.code,
        name: {
          ru: product.name,
          uz: aiData.name_uz || this.generateFallbackUzbekName(product.name),
        },
        description: {
          ru: aiData.description_ru || this.generateFallbackDescriptionRu(product.name, product.category),
          uz: aiData.description_uz || this.generateFallbackDescriptionUz(product.name, product.category),
        },
        price: product.price,
        unit: aiData.unit || detectedUnit,
        imageUrl: finalImageUrl,
      };

      console.log(`✅ AI enhancement completed for: ${product.name}`);
      console.log(`📝 Enhanced data:`, {
        name_uz: enhancedProduct.name.uz,
        unit: enhancedProduct.unit,
        has_image: !!enhancedProduct.imageUrl,
        image_url: enhancedProduct.imageUrl,
      });

      return enhancedProduct;
    } catch (error) {
      console.error(`❌ Error enhancing product with AI for: ${product.name}`, error);
      // Return improved fallback data if AI fails
      return {
        code: product.code,
        name: {
          ru: product.name,
          uz: this.generateFallbackUzbekName(product.name),
        },
        description: {
          ru: this.generateFallbackDescriptionRu(product.name, product.category),
          uz: this.generateFallbackDescriptionUz(product.name, product.category),
        },
        price: product.price,
        unit: this.detectUnitFromName(product.name),
        imageUrl: "",
      };
    }
  }

  // Helper methods for better fallback data
  private generateFallbackUzbekName(russianName: string): string {
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

  private generateFallbackDescriptionRu(productName: string, category?: string): string {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('химия') || productName.toLowerCase().includes('порошок')) {
      return `${productName} - эффективное моющее средство для стирки белья. Обеспечивает глубокую очистку, удаляет стойкие пятна и придает белью свежесть. Подходит для различных типов тканей и температурных режимов стирки.`;
    }
    
    if (productName.toLowerCase().includes('чистящ')) {
      return `${productName} - профессиональное чистящее средство для эффективной уборки. Удаляет загрязнения, дезинфицирует поверхности и оставляет приятный аромат. Безопасно для различных типов поверхностей.`;
    }
    
    return `${productName} - качественный продукт для бытового использования. Обеспечивает отличные результаты и удобство в применении. Подходит для повседневного использования.`;
  }

  private generateFallbackDescriptionUz(productName: string, category?: string): string {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('химия') || productName.toLowerCase().includes('порошок')) {
      return `${productName} - kir yuvish uchun samarali yuvish vositasidir. Chuqur tozalashni ta'minlaydi, qattiq dog'larni ketkazadi va kirlarga yangilik beradi. Turli xil mato turlari va yuvish harorat rejimlari uchun javob beradi.`;
    }
    
    if (productName.toLowerCase().includes('чистящ')) {
      return `${productName} - samarali tozalash uchun professional tozalash vositasidir. Ifloslanishlarni ketkazadi, sirtlarni dezinfektsiya qiladi va yoqimli hid qoldiradi. Turli xil sirt turlari uchun xavfsiz.`;
    }
    
    return `${productName} - maishiy foydalanish uchun sifatli mahsulotdir. Ajoyib natijalarni ta'minlaydi va qo'llashda qulaydir. Kundalik foydalanish uchun javob beradi.`;
  }

  private detectUnitFromName(productName: string): string {
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

  async findOrCreateCategory(categoryPath: string[]): Promise<string> {
    try {
      const [categoryName, subcategoryName, subsubcategoryName] = categoryPath;

      // Find or create main category
      let category = await Category.findOne({
        "name.ru": categoryName,
        parentId: null,
      });

      if (!category) {
        category = await Category.create({
          name: {
            ru: categoryName,
            uz: categoryName, // Will be enhanced later
          },
          isActive: true,
        });
      }

      // If no subcategory, return main category
      if (!subcategoryName) {
        return (category._id as any).toString();
      }

      // Find or create subcategory
      let subcategory = await Category.findOne({
        "name.ru": subcategoryName,
        parentId: category._id,
      });

      if (!subcategory) {
        subcategory = await Category.create({
          name: {
            ru: subcategoryName,
            uz: subcategoryName, // Will be enhanced later
          },
          parentId: category._id,
          isActive: true,
        });
      }

      // If no subsubcategory, return subcategory
      if (!subsubcategoryName) {
        return (subcategory._id as any).toString();
      }

      // Find or create subsubcategory
      let subsubcategory = await Category.findOne({
        "name.ru": subsubcategoryName,
        parentId: subcategory._id,
      });

      if (!subsubcategory) {
        subsubcategory = await Category.create({
          name: {
            ru: subsubcategoryName,
            uz: subsubcategoryName, // Will be enhanced later
          },
          parentId: subcategory._id,
          isActive: true,
        });
      }

      return (subsubcategory._id as any).toString();
    } catch (error) {
      console.error("Error finding or creating category:", error);
      throw new Error("Failed to process category hierarchy");
    }
  }

  async importProducts(
    filePath: string,
    limit: number = 500
  ): Promise<{
    success: boolean;
    imported: number;
    errors: string[];
    message: string;
  }> {
    try {
      console.log(`🚀 Starting Excel import process from file: ${filePath}`);
      console.log(`📊 Import limit: ${limit === -1 ? "All products" : limit}`);
      console.log(`🎨 Image generation model: ${openRouterImageService.getImageGenModel()}`);

      const products = await this.parseExcelFile(filePath);
      console.log(`📋 Found ${products.length} products in Excel file`);

      const productsToProcess = limit === -1 ? products : products.slice(0, limit);
      console.log(`⚙️ Will process ${productsToProcess.length} products`);

      const results = {
        success: true,
        imported: 0,
        errors: [] as string[],
        message: "",
      };

      for (let i = 0; i < productsToProcess.length; i++) {
        const product = productsToProcess[i];
        console.log(`\n🔄 Processing product ${i + 1}/${productsToProcess.length}: ${product.name}`);

        try {
          // Check if product already exists
          console.log(`🔍 Checking if product already exists: ${product.name}`);
          const existingProduct = await Product.findOne({
            "name.ru": product.name,
          });
          if (existingProduct) {
            console.log(`⚠️ Product already exists: ${product.name}`);
            results.errors.push(`Product ${product.name} already exists`);
            continue;
          }

          // Enhance product with AI
          const enhancedProduct = await this.enhanceProductWithAI(product);

          // Find or create category
          console.log(`📂 Processing category for: ${product.name}`);
          const categoryId = await this.findOrCreateCategory([
            product.category || "General",
            product.subcategory || "",
            product.subsubcategory || "",
          ]);
          console.log(`✅ Category ID: ${categoryId}`);

          // Create product
          console.log(`💾 Creating product in database: ${product.name}`);
          
          // Use the image URL from enhanced product
          const finalImages = enhancedProduct.imageUrl ? [enhancedProduct.imageUrl] : [];
          
          const newProduct = await Product.create({
            name: enhancedProduct.name,
            description: enhancedProduct.description,
            categoryId,
            basePrice: enhancedProduct.price,
            unit: enhancedProduct.unit,
            baseStock: {
              quantity: 0,
              unit: enhancedProduct.unit,
            },
            images: finalImages,
            isActive: true,
          });

          console.log(`✅ Successfully created product: ${product.name} (ID: ${newProduct._id})`);
          results.imported++;
        } catch (error: any) {
          console.error(`❌ Error importing product ${product.name}:`, error);
          console.error(`🔍 Error details:`, error.message || "Unknown error");
          results.errors.push(
            `Failed to import ${product.name}: ${error.message || "Unknown error"}`
          );
        }
      }

      console.log(`\n🎉 Import process completed!`);
      console.log(`✅ Successfully imported: ${results.imported} products`);
      console.log(`❌ Errors: ${results.errors.length}`);
      console.log(`🎨 Image source: AI-generated images only`);

      results.message = `Successfully imported ${results.imported} products. ${results.errors.length} errors occurred.`;
      return results;
    } catch (error: any) {
      console.error("Error in import process:", error);
      return {
        success: false,
        imported: 0,
        errors: [error.message || "Unknown error"],
        message: "Import failed",
      };
    }
  }
}

export default new ExcelImportService();
