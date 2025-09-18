import { useState, useCallback } from 'react';
import { translationService, TranslationRequest } from '../services/translationService';

interface TranslationState {
  isTranslating: boolean;
  error: string | null;
  lastTranslation: string | null;
}

interface UseTranslationReturn {
  translateText: (request: TranslationRequest) => Promise<string | null>;
  translateProductName: (text: string, sourceLanguage: 'ru' | 'uz', targetLanguage: 'ru' | 'uz') => Promise<string | null>;
  translateProductDescription: (text: string, sourceLanguage: 'ru' | 'uz', targetLanguage: 'ru' | 'uz') => Promise<string | null>;
  isTranslating: boolean;
  error: string | null;
  clearError: () => void;
  lastTranslation: string | null;
}

export const useTranslation = (): UseTranslationReturn => {
  const [state, setState] = useState<TranslationState>({
    isTranslating: false,
    error: null,
    lastTranslation: null
  });

  const translateText = useCallback(async (request: TranslationRequest): Promise<string | null> => {
    setState(prev => ({ ...prev, isTranslating: true, error: null }));

    try {
      const response = await translationService.translateText(request);
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          isTranslating: false, 
          lastTranslation: response.data!.translatedText 
        }));
        return response.data.translatedText;
      } else {
        setState(prev => ({ 
          ...prev, 
          isTranslating: false, 
          error: response.error || 'Translation failed' 
        }));
        return null;
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isTranslating: false, 
        error: error.message || 'Translation failed' 
      }));
      return null;
    }
  }, []);

  const translateProductName = useCallback(async (
    text: string, 
    sourceLanguage: 'ru' | 'uz', 
    targetLanguage: 'ru' | 'uz'
  ): Promise<string | null> => {
    setState(prev => ({ ...prev, isTranslating: true, error: null }));

    try {
      const response = await translationService.translateProductName(text, sourceLanguage, targetLanguage);
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          isTranslating: false, 
          lastTranslation: response.data!.translatedName 
        }));
        return response.data.translatedName;
      } else {
        setState(prev => ({ 
          ...prev, 
          isTranslating: false, 
          error: response.error || 'Product name translation failed' 
        }));
        return null;
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isTranslating: false, 
        error: error.message || 'Product name translation failed' 
      }));
      return null;
    }
  }, []);

  const translateProductDescription = useCallback(async (
    text: string, 
    sourceLanguage: 'ru' | 'uz', 
    targetLanguage: 'ru' | 'uz'
  ): Promise<string | null> => {
    setState(prev => ({ ...prev, isTranslating: true, error: null }));

    try {
      const response = await translationService.translateProductDescription(text, sourceLanguage, targetLanguage);
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          isTranslating: false, 
          lastTranslation: response.data!.translatedDescription 
        }));
        return response.data.translatedDescription;
      } else {
        setState(prev => ({ 
          ...prev, 
          isTranslating: false, 
          error: response.error || 'Product description translation failed' 
        }));
        return null;
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isTranslating: false, 
        error: error.message || 'Product description translation failed' 
      }));
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    translateText,
    translateProductName,
    translateProductDescription,
    isTranslating: state.isTranslating,
    error: state.error,
    clearError,
    lastTranslation: state.lastTranslation
  };
};
