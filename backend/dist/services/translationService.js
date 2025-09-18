"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translationService = exports.TranslationService = void 0;
const openai_1 = __importDefault(require("openai"));
const rateLimitService_1 = require("./excelImport/rateLimitService");
class TranslationService {
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
        });
        this.rateLimitService = new rateLimitService_1.RateLimitService();
        console.log(`🔑 TranslationService initialized with ${this.rateLimitService.getTotalKeys()} API keys`);
    }
    /**
     * Translate text from one language to another
     */
    translateText(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const { text, sourceLanguage, targetLanguage, contentType = 'name' } = request;
                // Validate input
                if (!text || text.trim().length === 0) {
                    return {
                        translatedText: '',
                        success: false,
                        error: 'Text is required for translation'
                    };
                }
                if (sourceLanguage === targetLanguage) {
                    return {
                        translatedText: text,
                        success: true
                    };
                }
                // Create translation prompt
                const systemPrompt = this.createSystemPrompt(sourceLanguage, targetLanguage, contentType);
                const userPrompt = `Please translate the following ${contentType}: "${text}"`;
                // Make API request using rate limit service
                const result = yield this.rateLimitService.makeRequest([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ], {
                    max_tokens: 5000,
                    temperature: 0.3,
                }, `Translation: ${text.substring(0, 30)}...`);
                const translatedText = (_c = (_b = (_a = result.response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim();
                if (!translatedText) {
                    return {
                        translatedText: '',
                        success: false,
                        error: 'No translation returned from API'
                    };
                }
                return {
                    translatedText,
                    success: true,
                    model: result.response.model
                };
            }
            catch (error) {
                console.error('Translation error:', error);
                return {
                    translatedText: '',
                    success: false,
                    error: error.message || 'Translation failed'
                };
            }
        });
    }
    /**
     * Create system prompt for translation
     */
    createSystemPrompt(sourceLanguage, targetLanguage, contentType) {
        const languageNames = {
            'ru': 'Russian',
            'uz': 'Uzbek'
        };
        const sourceLang = languageNames[sourceLanguage];
        const targetLang = languageNames[targetLanguage];
        let contextInstructions = '';
        if (contentType === 'name') {
            contextInstructions = 'This is a product name. Keep it concise and natural. Use common product naming conventions.';
        }
        else if (contentType === 'description') {
            contextInstructions = 'This is a product description. Maintain the meaning and style while adapting to the target language. Keep technical terms and measurements accurate.';
        }
        return `You are a professional translator specializing in ${sourceLang} to ${targetLang} translation for e-commerce products.

Instructions:
- Translate the text accurately from ${sourceLang} to ${targetLang}
- Maintain the original meaning and context
- ${contextInstructions}
- Do not add any explanations or additional text
- Return only the translated text
- If the text contains numbers, measurements, or technical terms, keep them as-is unless they need translation
- Use natural, commonly used terms in the target language
- For product names, prioritize clarity and market appeal

Language Guidelines:
- For Russian to Uzbek: Use modern Uzbek language, avoid archaic terms
- For Uzbek to Russian: Use standard Russian, avoid regionalisms
- Maintain proper grammar and spelling
- Keep the tone professional and commercial-appropriate

Return only the translated text, nothing else.`;
    }
    /**
     * Translate product name
     */
    translateProductName(text, sourceLanguage, targetLanguage) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.translateText({
                text,
                sourceLanguage,
                targetLanguage,
                contentType: 'name'
            });
        });
    }
    /**
     * Translate product description
     */
    translateProductDescription(text, sourceLanguage, targetLanguage) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.translateText({
                text,
                sourceLanguage,
                targetLanguage,
                contentType: 'description'
            });
        });
    }
    /**
     * Batch translate multiple texts
     */
    batchTranslate(requests) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (const request of requests) {
                const result = yield this.translateText(request);
                results.push(result);
                // Add small delay between requests to avoid rate limiting
                yield new Promise(resolve => setTimeout(resolve, 100));
            }
            return results;
        });
    }
}
exports.TranslationService = TranslationService;
// Export singleton instance
exports.translationService = new TranslationService();
