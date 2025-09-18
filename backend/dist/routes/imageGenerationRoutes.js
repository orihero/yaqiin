"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importDefault(require("express"));
const openRouterImageService_1 = __importStar(require("../services/openRouterImageService"));
const authMiddleware_1 = require("../utils/authMiddleware");
const router = express_1.default.Router();
/**
 * @route POST /api/image-generation/generate
 * @desc Generate images using OpenRouter API
 * @access Private (Telegram auth required)
 */
router.post('/generate', authMiddleware_1.telegramAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!openRouterImageService_1.default.isConfigured()) {
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: 'OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable.'
                }
            });
            return;
        }
        const images = yield openRouterImageService_1.default.generateImages(prompt, maxImages);
        res.json({
            success: true,
            data: {
                images,
                count: images.length,
                prompt,
                model: model || 'google/gemini-2.5-flash-image-preview'
            }
        });
    }
    catch (error) {
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
}));
/**
 * @route POST /api/image-generation/product
 * @desc Generate product images with enhanced prompts
 * @access Private (Telegram auth required)
 */
router.post('/product', authMiddleware_1.telegramAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!openRouterImageService_1.default.isConfigured()) {
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: 'OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable.'
                }
            });
            return;
        }
        const images = yield openRouterImageService_1.default.generateProductImages(productName, category, maxImages);
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
    }
    catch (error) {
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
}));
/**
 * @route POST /api/image-generation/category
 * @desc Generate category images
 * @access Private (Telegram auth required)
 */
router.post('/category', authMiddleware_1.telegramAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!openRouterImageService_1.default.isConfigured()) {
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: 'OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable.'
                }
            });
            return;
        }
        const images = yield openRouterImageService_1.default.generateCategoryImages(categoryName, maxImages);
        res.json({
            success: true,
            data: {
                images,
                count: images.length,
                categoryName,
                model: 'google/gemini-2.5-flash-image-preview'
            }
        });
    }
    catch (error) {
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
}));
/**
 * @route POST /api/image-generation/save
 * @desc Save generated image to file system
 * @access Private (Telegram auth required)
 */
router.post('/save', authMiddleware_1.telegramAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const filePath = yield openRouterImageService_1.OpenRouterImageService.saveGeneratedImage(image, filename, uploadPath);
        res.json({
            success: true,
            data: {
                filePath,
                filename,
                message: 'Image saved successfully'
            }
        });
    }
    catch (error) {
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
}));
/**
 * @route GET /api/image-generation/models
 * @desc Get available image generation models
 * @access Private (Telegram auth required)
 */
router.get('/models', authMiddleware_1.telegramAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!openRouterImageService_1.default.isConfigured()) {
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: 'OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable.'
                }
            });
            return;
        }
        const models = yield openRouterImageService_1.default.getAvailableModels();
        res.json({
            success: true,
            data: {
                models,
                count: models.length,
                defaultModel: 'google/gemini-2.5-flash-image-preview'
            }
        });
    }
    catch (error) {
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
}));
/**
 * @route GET /api/image-generation/status
 * @desc Check if OpenRouter image generation is configured and available
 * @access Private (Telegram auth required)
 */
router.get('/status', authMiddleware_1.telegramAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isConfigured = openRouterImageService_1.default.isConfigured();
        let models = [];
        if (isConfigured) {
            try {
                models = yield openRouterImageService_1.default.getAvailableModels();
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('Error checking image generation status:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: 'Error checking service status'
            }
        });
    }
}));
exports.default = router;
