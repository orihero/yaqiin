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
exports.OpenRouterImageService = void 0;
const axios_1 = __importDefault(require("axios"));
class OpenRouterImageService {
    constructor() {
        this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.apiKey = process.env.OPENROUTER_API_KEY || '';
        this.imageGenModel = process.env.OPENROUTER_IMAGE_GEN_MODEL || 'google/gemini-2.5-flash-image-preview';
        if (!this.apiKey) {
            console.warn('⚠️ OPENROUTER_API_KEY not found in environment variables');
        }
        console.log(`🎨 OpenRouter Image Service initialized with model: ${this.imageGenModel}`);
    }
    /**
     * Generate images using OpenRouter API
     * @param prompt - Text description for image generation
     * @param maxImages - Maximum number of images to generate (default: 1)
     * @returns Promise<GeneratedImage[]>
     */
    generateImages(prompt_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, maxImages = 1) {
            var _a, _b, _c, _d, _e, _f;
            try {
                if (!this.apiKey) {
                    throw new Error('OpenRouter API key not configured');
                }
                console.log(`🎨 Generating ${maxImages} image(s) with prompt: "${prompt}"`);
                console.log(`🤖 Using model: ${this.imageGenModel}`);
                const payload = {
                    model: this.imageGenModel,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    modalities: ['image', 'text'],
                    max_tokens: 1000
                };
                const response = yield axios_1.default.post(this.baseUrl, payload, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://yaqiin.uz',
                        'X-Title': 'Yaqiin Image Generator'
                    },
                    timeout: 60000 // 60 second timeout for image generation
                });
                const images = ((_b = (_a = response.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.images) || [];
                console.log(`✅ Generated ${images.length} images successfully`);
                // Limit to maxImages
                return images.slice(0, maxImages);
            }
            catch (error) {
                console.error('❌ Error generating images with OpenRouter:', error);
                if (axios_1.default.isAxiosError(error)) {
                    const status = (_c = error.response) === null || _c === void 0 ? void 0 : _c.status;
                    const message = ((_f = (_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.error) === null || _f === void 0 ? void 0 : _f.message) || error.message;
                    console.error(`HTTP ${status}: ${message}`);
                    if (status === 401) {
                        throw new Error('Invalid OpenRouter API key');
                    }
                    else if (status === 429) {
                        throw new Error('Rate limit exceeded. Please try again later.');
                    }
                    else if (status === 400) {
                        throw new Error(`Invalid request: ${message}`);
                    }
                }
                throw new Error(`Failed to generate images: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Generate product images with enhanced prompts
     * @param productName - Name of the product
     * @param category - Product category (optional)
     * @param maxImages - Maximum number of images to generate
     * @returns Promise<GeneratedImage[]>
     */
    generateProductImages(productName_1, category_1) {
        return __awaiter(this, arguments, void 0, function* (productName, category, maxImages = 3) {
            try {
                console.log(`🛍️ Generating product images for: ${productName}`);
                // Create enhanced prompt for better product images
                let prompt = `Generate a high-quality, professional product image of ${productName}`;
                if (category) {
                    prompt += ` in the ${category} category`;
                }
                prompt += `. The image should be: 
      - Clean and professional
      - Well-lit with good composition
      - Suitable for e-commerce
      - High resolution and clear
      - On a white or neutral background
      - Showing the product clearly and attractively
      - No text or watermarks
      - Photorealistic style`;
                return yield this.generateImages(prompt, maxImages);
            }
            catch (error) {
                console.error(`❌ Error generating product images for ${productName}:`, error);
                throw error;
            }
        });
    }
    /**
     * Generate category images
     * @param categoryName - Name of the category
     * @param maxImages - Maximum number of images to generate
     * @returns Promise<GeneratedImage[]>
     */
    generateCategoryImages(categoryName_1) {
        return __awaiter(this, arguments, void 0, function* (categoryName, maxImages = 2) {
            try {
                console.log(`📂 Generating category images for: ${categoryName}`);
                const prompt = `Generate a beautiful, modern category icon or illustration representing ${categoryName}. 
      The image should be:
      - Clean and minimalist design
      - Suitable for a category icon
      - Professional and modern
      - Easy to recognize
      - Scalable for different sizes
      - With a transparent or white background
      - No text or watermarks
      - Icon-style or flat design`;
                return yield this.generateImages(prompt, maxImages);
            }
            catch (error) {
                console.error(`❌ Error generating category images for ${categoryName}:`, error);
                throw error;
            }
        });
    }
    /**
     * Convert base64 data URL to buffer
     * @param dataUrl - Base64 data URL
     * @returns Buffer
     */
    static dataUrlToBuffer(dataUrl) {
        try {
            const base64Data = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
            return Buffer.from(base64Data, 'base64');
        }
        catch (error) {
            throw new Error('Invalid data URL format');
        }
    }
    /**
     * Save generated image to file system
     * @param image - Generated image object
     * @param filename - Filename to save as
     * @param uploadPath - Upload directory path
     * @returns Promise<string> - File path
     */
    static saveGeneratedImage(image_1, filename_1) {
        return __awaiter(this, arguments, void 0, function* (image, filename, uploadPath = 'uploads') {
            try {
                const fs = require('fs').promises;
                const path = require('path');
                // Ensure upload directory exists
                yield fs.mkdir(uploadPath, { recursive: true });
                // Convert data URL to buffer
                const buffer = this.dataUrlToBuffer(image.image_url.url);
                // Generate unique filename
                const timestamp = Date.now();
                const extension = 'png'; // OpenRouter typically returns PNG
                const uniqueFilename = `${timestamp}-${filename}.${extension}`;
                const filePath = path.join(uploadPath, uniqueFilename);
                // Save file
                yield fs.writeFile(filePath, buffer);
                console.log(`💾 Saved generated image: ${filePath}`);
                return filePath;
            }
            catch (error) {
                console.error('❌ Error saving generated image:', error);
                throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Check if the service is properly configured
     * @returns boolean
     */
    isConfigured() {
        return !!this.apiKey;
    }
    /**
     * Get the current image generation model
     * @returns string
     */
    getImageGenModel() {
        return this.imageGenModel;
    }
    /**
     * Get available models for image generation
     * @returns Promise<string[]>
     */
    getAvailableModels() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.apiKey) {
                    throw new Error('OpenRouter API key not configured');
                }
                const response = yield axios_1.default.get('https://openrouter.ai/api/v1/models', {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'HTTP-Referer': 'https://yaqiin.uz',
                        'X-Title': 'Yaqiin Image Generator'
                    }
                });
                const models = response.data.data || [];
                const imageModels = models
                    .filter((model) => model.output_modalities &&
                    model.output_modalities.includes('image'))
                    .map((model) => model.id);
                console.log(`📋 Found ${imageModels.length} image generation models`);
                return imageModels;
            }
            catch (error) {
                console.error('❌ Error fetching available models:', error);
                return [this.imageGenModel]; // Return current model as fallback
            }
        });
    }
}
exports.OpenRouterImageService = OpenRouterImageService;
exports.default = new OpenRouterImageService();
