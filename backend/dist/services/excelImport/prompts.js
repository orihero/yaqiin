"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMPORTANT_NOTES = exports.FALLBACK_JSON_STRUCTURE = exports.JSON_RESPONSE_STRUCTURE = exports.DESCRIPTION_REQUIREMENTS = exports.ATTRIBUTE_INSTRUCTIONS = exports.CATEGORY_INSTRUCTIONS = exports.SYSTEM_PROMPTS = void 0;
exports.generateMainPrompt = generateMainPrompt;
exports.generateFallbackPrompt = generateFallbackPrompt;
exports.generateCategorySection = generateCategorySection;
exports.generateMinimalCategorySection = generateMinimalCategorySection;
exports.generateFallbackCategorySection = generateFallbackCategorySection;
const constants_1 = require("./constants");
/**
 * AI Prompts and Templates for Excel Import Service
 */
exports.SYSTEM_PROMPTS = {
    MAIN: "You are a product data specialist with expertise in Russian and Uzbek languages. Create comprehensive, detailed product descriptions with HTML markup that include ALL relevant information about products. Focus on creating informative, engaging descriptions with proper HTML structure, including features, benefits, usage instructions, technical details, safety information, and practical recommendations. Use emojis sparingly and only where they enhance understanding. For product names, translate ONLY Russian words to Uzbek while preserving English words, brand names, numbers, and other languages as-is. CRITICAL: Always select the MOST SPECIFIC (third-level) categories available - prioritize brand-specific or product-specific categories over general main categories. For example, for 'PERSIL порошок' select the 'Persil' brand category under 'Стиральный Порошок', not just 'Химия'.",
    FALLBACK: "You are a product data specialist. Provide basic product information in JSON format."
};
exports.CATEGORY_INSTRUCTIONS = `CATEGORY SELECTION:
- You MUST select a valid category_id from the available categories list above
- ALWAYS prioritize the MOST SPECIFIC (third-level) categories when available
- For example: if a product is "PERSIL порошок", select "Persil" under "Стиральный Порошок" under "Химия", NOT just "Химия"
- Choose the deepest/most specific category that matches the product
- If a specific brand or product type exists in the third level, use that instead of the main category
- Consider the product type, purpose, brand, and target audience
- NEVER return an empty string, null, or "AUTO_ASSIGN_CATEGORY" for category_id
- You can only select from existing categories - DO NOT create new ones
- The hierarchy is: Main Category → Subcategory → Third-level Category/Brand`;
exports.ATTRIBUTE_INSTRUCTIONS = `ATTRIBUTE SELECTION:
- Select relevant attributes from the chosen category's attributes
- Only use attributes that already exist in the chosen category
- Each attribute should have both name and value in Russian and Uzbek`;
exports.DESCRIPTION_REQUIREMENTS = `DESCRIPTION REQUIREMENTS:
- Create comprehensive, detailed descriptions with NO length limit
- Use HTML markup for formatting (h3, p, ul, li, strong, em, br, etc.)
- Include ALL relevant information about the product:
  * Product features and benefits
  * Usage instructions and applications
  * Target audience and use cases
  * Technical specifications (if applicable)
  * Safety information and precautions
  * Storage and handling instructions
  * Effectiveness and performance details
  * Comparison with similar products
  * Environmental impact (if relevant)
  * Any certifications or quality standards
- Add relevant emojis sparingly and only where they enhance understanding
- Structure content with proper HTML headings and lists
- Make descriptions informative, engaging, and comprehensive
- Include practical tips and recommendations`;
exports.JSON_RESPONSE_STRUCTURE = `Return only valid JSON with this structure:
{
  "name_uz": "Proper Uzbek translation",
  "brand_ru": "Brand name in Russian",
  "brand_uz": "Brand name in Uzbek",
  "description_ru": "<h3>Comprehensive Russian description with HTML markup</h3><p>Detailed content with features, benefits, usage instructions, and all relevant information...</p>",
  "description_uz": "<h3>Comprehensive Uzbek description with HTML markup</h3><p>Detailed content with features, benefits, usage instructions, and all relevant information...</p>", 
  "unit": "most_appropriate_unit",
  "category_id": "selected_category_id_from_available_list",
  "attributes": [
    {
      "name_ru": "Attribute name in Russian",
      "name_uz": "Attribute name in Uzbek", 
      "value_ru": "Attribute value in Russian",
      "value_uz": "Attribute value in Uzbek"
    }
  ]
}`;
exports.FALLBACK_JSON_STRUCTURE = `Return JSON:
{
  "name_uz": "Uzbek translation",
  "brand_ru": "Brand in Russian",
  "brand_uz": "Brand in Uzbek",
  "description_ru": "Simple Russian description",
  "description_uz": "Simple Uzbek description",
  "unit": "appropriate_unit",
  "category_id": "selected_category_id",
  "attributes": []
}`;
exports.IMPORTANT_NOTES = `IMPORTANT: 
- Use proper JSON escaping for special characters and HTML tags
- Provide comprehensive, detailed descriptions with HTML formatting
- Choose the most logical unit based on product type and weight
- Make Uzbek translation natural and proper, not just transliteration
- Include ALL relevant product information in descriptions
- Use HTML tags like <h3>, <p>, <ul>, <li>, <strong>, <em>, <br> for structure
- Add emojis sparingly and only where they enhance understanding
- Select appropriate category and attributes for the product
- CRITICAL: category_id must be a valid ID from the available categories list, never empty, null, or "AUTO_ASSIGN_CATEGORY"
- You can ONLY select from existing categories - DO NOT create new ones`;
/**
 * Generate the main AI prompt for product enhancement
 */
function generateMainPrompt(productName, productPrice, detectedUnit, detectedQuantity, categorySection) {
    return `
    Analyze this product and provide detailed information in JSON format:
    
    Product: ${productName}
    Price: ${productPrice} UZS
    Detected Unit: ${detectedUnit} (${detectedQuantity})
    
    ${categorySection}
    
    Please provide:
    1. Proper Uzbek translation of the product name (translate ONLY Russian words, keep other languages as-is)
    2. Brand name in both Russian and Uzbek (extract from product name if present)
    3. Comprehensive product description in Russian with HTML markup (detailed, no length limit)
    4. Comprehensive product description in Uzbek with HTML markup (detailed, no length limit)
    5. Most appropriate unit from this list: ${constants_1.UNIT_OPTIONS.map((u) => u.value).join(", ")}
    6. Select the most appropriate category ID from the available categories list
    7. Select relevant attributes for this product from the chosen category's attributes
    
    ${exports.CATEGORY_INSTRUCTIONS}
    
    ${exports.ATTRIBUTE_INSTRUCTIONS}
    
    ${exports.DESCRIPTION_REQUIREMENTS}
    
    ${exports.JSON_RESPONSE_STRUCTURE}
    
    ${exports.IMPORTANT_NOTES}
  `;
}
/**
 * Generate the fallback AI prompt for when token limit is exceeded
 */
function generateFallbackPrompt(productName, productPrice, detectedUnit, detectedQuantity, categorySection) {
    return `
    Analyze this product and provide basic information in JSON format:
    
    Product: ${productName}
    Price: ${productPrice} UZS
    Detected Unit: ${detectedUnit} (${detectedQuantity})
    
    ${categorySection}
    
    Please provide basic information:
    1. Uzbek translation of the product name
    2. Brand name in Russian and Uzbek
    3. Simple description in Russian and Uzbek
    4. Most appropriate unit
    5. Select category ID from the limited list above
    
    ${exports.FALLBACK_JSON_STRUCTURE}
  `;
}
/**
 * Generate category section for AI prompt
 */
function generateCategorySection(categoriesData) {
    return `Available Categories and Subcategories with Attributes:
    ${JSON.stringify(categoriesData, null, 2)}`;
}
/**
 * Generate minimal category section for token optimization
 */
function generateMinimalCategorySection(categoriesData) {
    const minimalCategories = categoriesData.slice(0, 20).map(cat => ({
        id: cat.id,
        name_ru: cat.name_ru,
        name_uz: cat.name_uz,
        // Only include first 2 attributes to save space
        attributes: cat.attributes.slice(0, 2).map((attr) => ({
            id: attr.id,
            name_ru: attr.name_ru,
            name_uz: attr.name_uz
        }))
    }));
    return `Available Categories (limited for token constraints):
    ${JSON.stringify(minimalCategories, null, 1)}`;
}
/**
 * Generate ultra-minimal category section for fallback
 */
function generateFallbackCategorySection(categories) {
    if (categories.length === 0) {
        return `No categories available. Please create categories first.`;
    }
    return `Available Categories (ultra-minimal):
    ${categories.map(cat => `ID: ${cat._id}, Name: ${cat.name.ru} / ${cat.name.uz}`).join('\n    ')}`;
}
