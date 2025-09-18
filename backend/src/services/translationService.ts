import OpenAI from 'openai';
import { RateLimitService } from './excelImport/rateLimitService';

/**
 * Translation Service
 * 
 * Features:
 * - Text translation using OpenRouter API
 * - Support for Russian <-> Uzbek translation
 * - Product name and description translation
 * - Rate limiting and error handling
 * - Multiple API key support with fallback
 * 
 * Environment Variables:
 * - OPENROUTER_API_KEY: Primary API key for OpenRouter service
 * - OPENROUTER_BASE_URL: Base URL for OpenRouter API (default: https://openrouter.ai/api/v1)
 * - OPENROUTER_MODEL: AI model for translation (default: anthropic/claude-3.5-haiku)
 * - OPENROUTER_API_KEY_1 to OPENROUTER_API_KEY_16: Additional API keys for rate limiting
 */

export interface TranslationRequest {
  text: string;
  sourceLanguage: 'ru' | 'uz';
  targetLanguage: 'ru' | 'uz';
  contentType?: 'name' | 'description';
}

export interface TranslationResponse {
  translatedText: string;
  success: boolean;
  error?: string;
  model?: string;
}

export class TranslationService {
  private openai: OpenAI;
  private rateLimitService: RateLimitService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    });
    this.rateLimitService = new RateLimitService();
    
    console.log(`🔑 TranslationService initialized with ${this.rateLimitService.getTotalKeys()} API keys`);
  }

  /**
   * Translate text from one language to another
   */
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
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
      const result = await this.rateLimitService.makeRequest(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        {
          max_tokens: 5000,
          temperature: 0.3,
        },
        `Translation: ${text.substring(0, 30)}...`
      );

      const translatedText = result.response.choices[0]?.message?.content?.trim();
      
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

    } catch (error: any) {
      console.error('Translation error:', error);
      return {
        translatedText: '',
        success: false,
        error: error.message || 'Translation failed'
      };
    }
  }

  /**
   * Create system prompt for translation
   */
  private createSystemPrompt(sourceLanguage: string, targetLanguage: string, contentType: string): string {
    const languageNames = {
      'ru': 'Russian',
      'uz': 'Uzbek'
    };

    const sourceLang = languageNames[sourceLanguage as keyof typeof languageNames];
    const targetLang = languageNames[targetLanguage as keyof typeof languageNames];

    let contextInstructions = '';
    if (contentType === 'name') {
      contextInstructions = 'This is a product name. Keep it concise and natural. Use common product naming conventions.';
    } else if (contentType === 'description') {
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
  async translateProductName(text: string, sourceLanguage: 'ru' | 'uz', targetLanguage: 'ru' | 'uz'): Promise<TranslationResponse> {
    return this.translateText({
      text,
      sourceLanguage,
      targetLanguage,
      contentType: 'name'
    });
  }

  /**
   * Translate product description
   */
  async translateProductDescription(text: string, sourceLanguage: 'ru' | 'uz', targetLanguage: 'ru' | 'uz'): Promise<TranslationResponse> {
    return this.translateText({
      text,
      sourceLanguage,
      targetLanguage,
      contentType: 'description'
    });
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
    const results: TranslationResponse[] = [];
    
    for (const request of requests) {
      const result = await this.translateText(request);
      results.push(result);
      
      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
}

// Export singleton instance
export const translationService = new TranslationService();
