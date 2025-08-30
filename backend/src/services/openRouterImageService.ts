import axios from 'axios';

export interface GeneratedImage {
  url: string;
  type: 'image_url';
  image_url: {
    url: string; // Base64 data URL
  };
}

export interface OpenRouterImageResponse {
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
      images?: GeneratedImage[];
    };
  }>;
}

export class OpenRouterImageService {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1/chat/completions';
  private imageGenModel: string;

  constructor() {
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
  async generateImages(
    prompt: string, 
    maxImages: number = 1
  ): Promise<GeneratedImage[]> {
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

      const response = await axios.post<OpenRouterImageResponse>(
        this.baseUrl,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://yaqiin.uz',
            'X-Title': 'Yaqiin Image Generator'
          },
          timeout: 60000 // 60 second timeout for image generation
        }
      );

      const images = response.data.choices[0]?.message?.images || [];
      
      console.log(`✅ Generated ${images.length} images successfully`);
      
      // Limit to maxImages
      return images.slice(0, maxImages);

    } catch (error) {
      console.error('❌ Error generating images with OpenRouter:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;
        
        console.error(`HTTP ${status}: ${message}`);
        
        if (status === 401) {
          throw new Error('Invalid OpenRouter API key');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (status === 400) {
          throw new Error(`Invalid request: ${message}`);
        }
      }
      
      throw new Error(`Failed to generate images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate product images with enhanced prompts
   * @param productName - Name of the product
   * @param category - Product category (optional)
   * @param maxImages - Maximum number of images to generate
   * @returns Promise<GeneratedImage[]>
   */
  async generateProductImages(
    productName: string,
    category?: string,
    maxImages: number = 3
  ): Promise<GeneratedImage[]> {
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

      return await this.generateImages(prompt, maxImages);

    } catch (error) {
      console.error(`❌ Error generating product images for ${productName}:`, error);
      throw error;
    }
  }

  /**
   * Generate category images
   * @param categoryName - Name of the category
   * @param maxImages - Maximum number of images to generate
   * @returns Promise<GeneratedImage[]>
   */
  async generateCategoryImages(
    categoryName: string,
    maxImages: number = 2
  ): Promise<GeneratedImage[]> {
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

      return await this.generateImages(prompt, maxImages);

    } catch (error) {
      console.error(`❌ Error generating category images for ${categoryName}:`, error);
      throw error;
    }
  }

  /**
   * Convert base64 data URL to buffer
   * @param dataUrl - Base64 data URL
   * @returns Buffer
   */
  static dataUrlToBuffer(dataUrl: string): Buffer {
    try {
      const base64Data = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
      return Buffer.from(base64Data, 'base64');
    } catch (error) {
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
  static async saveGeneratedImage(
    image: GeneratedImage,
    filename: string,
    uploadPath: string = 'uploads'
  ): Promise<string> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Ensure upload directory exists
      await fs.mkdir(uploadPath, { recursive: true });
      
      // Convert data URL to buffer
      const buffer = this.dataUrlToBuffer(image.image_url.url);
      
      // Generate unique filename
      const timestamp = Date.now();
      const extension = 'png'; // OpenRouter typically returns PNG
      const uniqueFilename = `${timestamp}-${filename}.${extension}`;
      const filePath = path.join(uploadPath, uniqueFilename);
      
      // Save file
      await fs.writeFile(filePath, buffer);
      
      console.log(`💾 Saved generated image: ${filePath}`);
      return filePath;
      
    } catch (error) {
      console.error('❌ Error saving generated image:', error);
      throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if the service is properly configured
   * @returns boolean
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get the current image generation model
   * @returns string
   */
  getImageGenModel(): string {
    return this.imageGenModel;
  }

  /**
   * Get available models for image generation
   * @returns Promise<string[]>
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://yaqiin.uz',
          'X-Title': 'Yaqiin Image Generator'
        }
      });

      const models = response.data.data || [];
      const imageModels = models
        .filter((model: any) => 
          model.output_modalities && 
          model.output_modalities.includes('image')
        )
        .map((model: any) => model.id);

      console.log(`📋 Found ${imageModels.length} image generation models`);
      return imageModels;

    } catch (error) {
      console.error('❌ Error fetching available models:', error);
      return [this.imageGenModel]; // Return current model as fallback
    }
  }
}

export default new OpenRouterImageService();
