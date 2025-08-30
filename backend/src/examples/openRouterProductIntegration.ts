import express from 'express';
import openRouterImageService, { OpenRouterImageService } from '../services/openRouterImageService';
import imageScraperService from '../services/imageScraperService';
import { telegramAuthMiddleware } from '../utils/authMiddleware';

const router = express.Router();

/**
 * Example: Enhanced product creation with AI-generated images
 * This shows how to integrate OpenRouter image generation into product workflows
 */
router.post('/create-with-ai-images', telegramAuthMiddleware, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      categoryId, 
      categoryName,
      useAIGeneration = true,
      maxImages = 3 
    } = req.body;

         if (!name) {
       res.status(400).json({
         success: false,
         error: { code: 400, message: 'Product name is required' }
       });
       return;
     }

    console.log(`🛍️ Creating product with AI images: ${name}`);

    // Step 1: Try to get images from scraping first
    let images: any[] = [];
    
    try {
      console.log('🔍 Attempting to scrape existing product images...');
      const scrapedImages = await imageScraperService.getProductImages(name, maxImages, false); // Disable generation initially
      
      if (scrapedImages.length > 0) {
        images = scrapedImages.map(img => ({
          url: img.url,
          alt: img.alt,
          title: img.title,
          source: 'scraped'
        }));
        console.log(`✅ Found ${images.length} scraped images`);
      }
    } catch (scrapeError) {
      console.warn('⚠️ Image scraping failed:', scrapeError);
    }

    // Step 2: If we don't have enough images and AI generation is enabled, generate some
    if (images.length < maxImages && useAIGeneration && openRouterImageService.isConfigured()) {
      try {
        console.log('🎨 Generating AI images to supplement scraped images...');
        const remainingCount = maxImages - images.length;
        const generatedImages = await openRouterImageService.generateProductImages(
          name, 
          categoryName, 
          remainingCount
        );

                 // Save generated images to file system
         const savedImages = [];
         for (let i = 0; i < generatedImages.length; i++) {
           const image = generatedImages[i];
           try {
             const filename = `${name.toLowerCase().replace(/\s+/g, '-')}-ai-${i + 1}`;
             const filePath = await OpenRouterImageService.saveGeneratedImage(
               image,
               filename,
               'uploads'
             );
            
            savedImages.push({
              url: filePath.replace('uploads/', '/uploads/'), // Make it accessible via HTTP
              alt: `AI Generated: ${name}`,
              title: `AI Generated Product Image: ${name}`,
              source: 'generated'
            });
          } catch (saveError) {
            console.warn(`⚠️ Failed to save generated image ${i + 1}:`, saveError);
          }
        }

        images = [...images, ...savedImages];
        console.log(`✨ Added ${savedImages.length} AI-generated images`);
        
      } catch (generationError) {
        console.warn('⚠️ AI image generation failed:', generationError);
      }
    }

    // Step 3: If we still don't have images, try scraping with generation fallback
    if (images.length === 0) {
      try {
        console.log('🔄 Trying scraping with AI generation fallback...');
        const fallbackImages = await imageScraperService.getProductImages(name, maxImages, true);
        images = fallbackImages.map(img => ({
          url: img.url,
          alt: img.alt,
          title: img.title,
          source: img.source
        }));
        console.log(`🔄 Got ${images.length} images from fallback method`);
      } catch (fallbackError) {
        console.warn('⚠️ Fallback image method failed:', fallbackError);
      }
    }

    // Step 4: Create the product with the collected images
    const productData = {
      name,
      description,
      categoryId,
      images: images.map(img => ({
        url: img.url,
        alt: img.alt,
        title: img.title
      })),
      // ... other product fields
    };

    console.log(`📦 Product data prepared with ${images.length} images`);
    console.log(`📊 Image sources: ${images.filter(img => img.source === 'scraped').length} scraped, ${images.filter(img => img.source === 'generated').length} generated`);

    // Here you would typically save the product to your database
    // const product = await Product.create(productData);

    res.json({
      success: true,
      data: {
        product: productData,
        images: {
          total: images.length,
          scraped: images.filter(img => img.source === 'scraped').length,
          generated: images.filter(img => img.source === 'generated').length
        },
        message: 'Product created successfully with AI-enhanced images'
      }
    });

  } catch (error) {
    console.error('❌ Error creating product with AI images:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    });
  }
});

/**
 * Example: Generate images for existing products
 */
router.post('/generate-images/:productId', telegramAuthMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { maxImages = 3, categoryName } = req.body;

    // Here you would typically fetch the product from your database
    // const product = await Product.findById(productId);
    // if (!product) {
    //   return res.status(404).json({
    //     success: false,
    //     error: { code: 404, message: 'Product not found' }
    //   });
    // }

    // For this example, we'll use a mock product
    const product = {
      name: 'Sample Product',
      categoryName: categoryName || 'General'
    };

    console.log(`🎨 Generating images for existing product: ${product.name}`);

    if (!openRouterImageService.isConfigured()) {
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'OpenRouter API is not configured'
        }
      });
      return;
    }

    // Generate images
    const generatedImages = await openRouterImageService.generateProductImages(
      product.name,
      product.categoryName,
      maxImages
    );

    // Save generated images
    const savedImages = [];
    for (let i = 0; i < generatedImages.length; i++) {
      const image = generatedImages[i];
             try {
         const filename = `${product.name.toLowerCase().replace(/\s+/g, '-')}-generated-${Date.now()}-${i + 1}`;
         const filePath = await OpenRouterImageService.saveGeneratedImage(
           image,
           filename,
           'uploads'
         );
        
        savedImages.push({
          url: filePath.replace('uploads/', '/uploads/'),
          alt: `Generated: ${product.name}`,
          title: `AI Generated: ${product.name}`,
          source: 'generated'
        });
      } catch (saveError) {
        console.warn(`⚠️ Failed to save generated image ${i + 1}:`, saveError);
      }
    }

    // Here you would typically update the product with new images
    // await Product.findByIdAndUpdate(productId, {
    //   $push: { images: { $each: savedImages } }
    // });

    res.json({
      success: true,
      data: {
        productId,
        generatedImages: savedImages,
        count: savedImages.length,
        message: 'Images generated and saved successfully'
      }
    });

  } catch (error) {
    console.error('❌ Error generating images for product:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    });
  }
});

/**
 * Example: Batch generate images for multiple products
 */
router.post('/batch-generate-images', telegramAuthMiddleware, async (req, res) => {
  try {
    const { products, maxImagesPerProduct = 2 } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 400, message: 'Products array is required' }
      });
      return;
    }

    if (!openRouterImageService.isConfigured()) {
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'OpenRouter API is not configured'
        }
      });
      return;
    }

    console.log(`🎨 Batch generating images for ${products.length} products`);

    const results = [];

    for (const product of products) {
      try {
        console.log(`🎨 Generating images for: ${product.name}`);
        
        const generatedImages = await openRouterImageService.generateProductImages(
          product.name,
          product.categoryName,
          maxImagesPerProduct
        );

        const savedImages = [];
        for (let i = 0; i < generatedImages.length; i++) {
          const image = generatedImages[i];
                     try {
             const filename = `${product.name.toLowerCase().replace(/\s+/g, '-')}-batch-${Date.now()}-${i + 1}`;
             const filePath = await OpenRouterImageService.saveGeneratedImage(
               image,
               filename,
               'uploads'
             );
            
            savedImages.push({
              url: filePath.replace('uploads/', '/uploads/'),
              alt: `Generated: ${product.name}`,
              title: `AI Generated: ${product.name}`,
              source: 'generated'
            });
          } catch (saveError) {
            console.warn(`⚠️ Failed to save image for ${product.name}:`, saveError);
          }
        }

        results.push({
          productId: product.id,
          productName: product.name,
          success: true,
          images: savedImages,
          count: savedImages.length
        });

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error generating images for ${product.name}:`, error);
        results.push({
          productId: product.id,
          productName: product.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalImages = results.reduce((sum, r) => sum + (r.count || 0), 0);

    res.json({
      success: true,
      data: {
        results,
        summary: {
          totalProducts: products.length,
          successfulProducts: successCount,
          failedProducts: products.length - successCount,
          totalImagesGenerated: totalImages
        },
        message: `Batch generation completed: ${successCount}/${products.length} products processed successfully`
      }
    });

  } catch (error) {
    console.error('❌ Error in batch image generation:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    });
  }
});

export default router;
