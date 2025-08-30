import express from 'express';
import openRouterImageService, { GeneratedImage, OpenRouterImageService } from '../services/openRouterImageService';
import { telegramAuthMiddleware } from '../utils/authMiddleware';

const router = express.Router();

/**
 * @route POST /api/image-generation/generate
 * @desc Generate images using OpenRouter API
 * @access Private (Telegram auth required)
 */
router.post('/generate', telegramAuthMiddleware, async (req, res) => {
  try {
    const { prompt, model, maxImages = 1 } = req.body;

    if (!prompt) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Prompt is required'
        }
      });
      return;
    }

    if (!openRouterImageService.isConfigured()) {
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable.'
        }
      });
      return;
    }

    const images = await openRouterImageService.generateImages(prompt, maxImages);

    res.json({
      success: true,
      data: {
        images,
        count: images.length,
        prompt,
        model: model || 'google/gemini-2.5-flash-image-preview'
      }
    });

  } catch (error) {
    console.error('Error in image generation:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    const status = message.includes('API key') ? 401 : 
                   message.includes('Rate limit') ? 429 : 
                   message.includes('Invalid request') ? 400 : 500;

    res.status(status).json({
      success: false,
      error: {
        code: status,
        message
      }
    });
  }
});

/**
 * @route POST /api/image-generation/product
 * @desc Generate product images with enhanced prompts
 * @access Private (Telegram auth required)
 */
router.post('/product', telegramAuthMiddleware, async (req, res) => {
  try {
    const { productName, category, maxImages = 3 } = req.body;

    if (!productName) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Product name is required'
        }
      });
      return;
    }

    if (!openRouterImageService.isConfigured()) {
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable.'
        }
      });
      return;
    }

    const images = await openRouterImageService.generateProductImages(productName, category, maxImages);

    res.json({
      success: true,
      data: {
        images,
        count: images.length,
        productName,
        category,
        model: 'google/gemini-2.5-flash-image-preview'
      }
    });

  } catch (error) {
    console.error('Error in product image generation:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    const status = message.includes('API key') ? 401 : 
                   message.includes('Rate limit') ? 429 : 
                   message.includes('Invalid request') ? 400 : 500;

    res.status(status).json({
      success: false,
      error: {
        code: status,
        message
      }
    });
  }
});

/**
 * @route POST /api/image-generation/category
 * @desc Generate category images
 * @access Private (Telegram auth required)
 */
router.post('/category', telegramAuthMiddleware, async (req, res) => {
  try {
    const { categoryName, maxImages = 2 } = req.body;

    if (!categoryName) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Category name is required'
        }
      });
      return;
    }

    if (!openRouterImageService.isConfigured()) {
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable.'
        }
      });
      return;
    }

    const images = await openRouterImageService.generateCategoryImages(categoryName, maxImages);

    res.json({
      success: true,
      data: {
        images,
        count: images.length,
        categoryName,
        model: 'google/gemini-2.5-flash-image-preview'
      }
    });

  } catch (error) {
    console.error('Error in category image generation:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    const status = message.includes('API key') ? 401 : 
                   message.includes('Rate limit') ? 429 : 
                   message.includes('Invalid request') ? 400 : 500;

    res.status(status).json({
      success: false,
      error: {
        code: status,
        message
      }
    });
  }
});

/**
 * @route POST /api/image-generation/save
 * @desc Save generated image to file system
 * @access Private (Telegram auth required)
 */
router.post('/save', telegramAuthMiddleware, async (req, res) => {
  try {
    const { image, filename, uploadPath = 'uploads' } = req.body;

    if (!image || !filename) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Image data and filename are required'
        }
      });
      return;
    }

    const filePath = await OpenRouterImageService.saveGeneratedImage(image, filename, uploadPath);

    res.json({
      success: true,
      data: {
        filePath,
        filename,
        message: 'Image saved successfully'
      }
    });

  } catch (error) {
    console.error('Error saving generated image:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message
      }
    });
  }
});

/**
 * @route GET /api/image-generation/models
 * @desc Get available image generation models
 * @access Private (Telegram auth required)
 */
router.get('/models', telegramAuthMiddleware, async (req, res) => {
  try {
    if (!openRouterImageService.isConfigured()) {
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable.'
        }
      });
      return;
    }

    const models = await openRouterImageService.getAvailableModels();

    res.json({
      success: true,
      data: {
        models,
        count: models.length,
        defaultModel: 'google/gemini-2.5-flash-image-preview'
      }
    });

  } catch (error) {
    console.error('Error fetching available models:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message
      }
    });
  }
});

/**
 * @route GET /api/image-generation/status
 * @desc Check if OpenRouter image generation is configured and available
 * @access Private (Telegram auth required)
 */
router.get('/status', telegramAuthMiddleware, async (req, res) => {
  try {
    const isConfigured = openRouterImageService.isConfigured();
    
    let models: string[] = [];
    if (isConfigured) {
      try {
        models = await openRouterImageService.getAvailableModels();
      } catch (error) {
        console.warn('Could not fetch models, but service is configured');
      }
    }

    res.json({
      success: true,
      data: {
        configured: isConfigured,
        availableModels: models.length,
        defaultModel: 'google/gemini-2.5-flash-image-preview'
      }
    });

  } catch (error) {
    console.error('Error checking image generation status:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Error checking service status'
      }
    });
  }
});

export default router;
