import { Router, Request, Response, NextFunction } from 'express';
import { translationService, TranslationRequest } from '../services/translationService';
import { telegramAuthMiddleware } from '../utils/authMiddleware';

const router = Router();

/**
 * POST /api/translation/translate
 * Translate text from one language to another
 */
router.post('/translate', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text, sourceLanguage, targetLanguage, contentType }: TranslationRequest = req.body;

    // Validate required fields
    if (!text || typeof text !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Text is required and must be a string'
      });
      return;
    }

    if (!sourceLanguage || !targetLanguage) {
      res.status(400).json({
        success: false,
        error: 'Source language and target language are required'
      });
      return;
    }

    if (!['ru', 'uz'].includes(sourceLanguage) || !['ru', 'uz'].includes(targetLanguage)) {
      res.status(400).json({
        success: false,
        error: 'Only Russian (ru) and Uzbek (uz) languages are supported'
      });
      return;
    }

    // Translate the text
    const result = await translationService.translateText({
      text,
      sourceLanguage,
      targetLanguage,
      contentType: contentType || 'name'
    });

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || 'Translation failed'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: result.translatedText,
        sourceLanguage,
        targetLanguage,
        contentType: contentType || 'name',
        model: result.model
      }
    });

  } catch (error: any) {
    console.error('Translation API error:', error);
    next({ status: 500, message: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/translation/translate-product-name
 * Specifically translate product names
 */
router.post('/translate-product-name', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;

    // Validate required fields
    if (!text || typeof text !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Product name text is required and must be a string'
      });
      return;
    }

    if (!sourceLanguage || !targetLanguage) {
      res.status(400).json({
        success: false,
        error: 'Source language and target language are required'
      });
      return;
    }

    if (!['ru', 'uz'].includes(sourceLanguage) || !['ru', 'uz'].includes(targetLanguage)) {
      res.status(400).json({
        success: false,
        error: 'Only Russian (ru) and Uzbek (uz) languages are supported'
      });
      return;
    }

    // Translate the product name
    const result = await translationService.translateProductName(text, sourceLanguage, targetLanguage);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || 'Product name translation failed'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        originalName: text,
        translatedName: result.translatedText,
        sourceLanguage,
        targetLanguage,
        model: result.model
      }
    });

  } catch (error: any) {
    console.error('Product name translation API error:', error);
    next({ status: 500, message: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/translation/translate-product-description
 * Specifically translate product descriptions
 */
router.post('/translate-product-description', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;

    // Validate required fields
    if (!text || typeof text !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Product description text is required and must be a string'
      });
      return;
    }

    if (!sourceLanguage || !targetLanguage) {
      res.status(400).json({
        success: false,
        error: 'Source language and target language are required'
      });
      return;
    }

    if (!['ru', 'uz'].includes(sourceLanguage) || !['ru', 'uz'].includes(targetLanguage)) {
      res.status(400).json({
        success: false,
        error: 'Only Russian (ru) and Uzbek (uz) languages are supported'
      });
      return;
    }

    // Translate the product description
    const result = await translationService.translateProductDescription(text, sourceLanguage, targetLanguage);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || 'Product description translation failed'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        originalDescription: text,
        translatedDescription: result.translatedText,
        sourceLanguage,
        targetLanguage,
        model: result.model
      }
    });

  } catch (error: any) {
    console.error('Product description translation API error:', error);
    next({ status: 500, message: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/translation/batch-translate
 * Translate multiple texts in batch
 */
router.post('/batch-translate', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { requests }: { requests: TranslationRequest[] } = req.body;

    // Validate required fields
    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Requests array is required and must contain at least one translation request'
      });
      return;
    }

    // Validate each request
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      if (!request.text || typeof request.text !== 'string') {
        res.status(400).json({
          success: false,
          error: `Request ${i + 1}: Text is required and must be a string`
        });
        return;
      }

      if (!request.sourceLanguage || !request.targetLanguage) {
        res.status(400).json({
          success: false,
          error: `Request ${i + 1}: Source language and target language are required`
        });
        return;
      }

      if (!['ru', 'uz'].includes(request.sourceLanguage) || !['ru', 'uz'].includes(request.targetLanguage)) {
        res.status(400).json({
          success: false,
          error: `Request ${i + 1}: Only Russian (ru) and Uzbek (uz) languages are supported`
        });
        return;
      }
    }

    // Limit batch size to prevent abuse
    if (requests.length > 10) {
      res.status(400).json({
        success: false,
        error: 'Maximum 10 translation requests allowed per batch'
      });
      return;
    }

    // Translate all texts
    const results = await translationService.batchTranslate(requests);

    res.json({
      success: true,
      data: results.map((result, index) => ({
        index,
        originalText: requests[index].text,
        translatedText: result.translatedText,
        sourceLanguage: requests[index].sourceLanguage,
        targetLanguage: requests[index].targetLanguage,
        contentType: requests[index].contentType || 'name',
        success: result.success,
        error: result.error,
        model: result.model
      }))
    });

  } catch (error: any) {
    console.error('Batch translation API error:', error);
    next({ status: 500, message: 'Internal server error', details: error.message });
  }
});

export default router;
