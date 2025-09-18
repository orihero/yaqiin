import api from './api';

export interface TranslationRequest {
  text: string;
  sourceLanguage: 'ru' | 'uz';
  targetLanguage: 'ru' | 'uz';
  contentType?: 'name' | 'description';
}

export interface TranslationResponse {
  success: boolean;
  data?: {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    contentType: string;
    model?: string;
  };
  error?: string;
}

export interface ProductNameTranslationResponse {
  success: boolean;
  data?: {
    originalName: string;
    translatedName: string;
    sourceLanguage: string;
    targetLanguage: string;
    model?: string;
  };
  error?: string;
}

export interface ProductDescriptionTranslationResponse {
  success: boolean;
  data?: {
    originalDescription: string;
    translatedDescription: string;
    sourceLanguage: string;
    targetLanguage: string;
    model?: string;
  };
  error?: string;
}

class TranslationService {
  constructor() {
    // No need to set baseURL as it's handled by the api service
  }

  /**
   * Translate text from one language to another
   */
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const response = await api.post('/translation/translate', request);
      return response.data;
    } catch (error: any) {
      console.error('Translation service error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Translation failed'
      };
    }
  }

  /**
   * Translate product name specifically
   */
  async translateProductName(text: string, sourceLanguage: 'ru' | 'uz', targetLanguage: 'ru' | 'uz'): Promise<ProductNameTranslationResponse> {
    try {
      const response = await api.post('/translation/translate-product-name', {
        text,
        sourceLanguage,
        targetLanguage
      });

      return response.data;
    } catch (error: any) {
      console.error('Product name translation service error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Product name translation failed'
      };
    }
  }

  /**
   * Translate product description specifically
   */
  async translateProductDescription(text: string, sourceLanguage: 'ru' | 'uz', targetLanguage: 'ru' | 'uz'): Promise<ProductDescriptionTranslationResponse> {
    try {
      const response = await api.post('/translation/translate-product-description', {
        text,
        sourceLanguage,
        targetLanguage
      });

      return response.data;
    } catch (error: any) {
      console.error('Product description translation service error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Product description translation failed'
      };
    }
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
    try {
      const response = await api.post('/translation/batch-translate', {
        requests
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Batch translation service error:', error);
      return requests.map(() => ({
        success: false,
        error: error.response?.data?.error || error.message || 'Batch translation failed'
      }));
    }
  }
}

// Export singleton instance
export const translationService = new TranslationService();
export default translationService;
