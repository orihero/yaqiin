import { Router, Request } from 'express';
import Product from '../models/Product';
import { parseQuery } from '../utils/queryHelper';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

const router = Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// List all products with pagination, filtering, and search
router.get('/', async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req, ['name.uz', 'name.ru', 'description.uz', 'description.ru', 'tags']);
    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next({ status: 404, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Get related products (same category, excluding current product)
router.get('/:id/related', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next({ status: 404, message: 'Product not found' });
    
    const relatedProducts = await Product.find({
      categoryId: product.categoryId,
      _id: { $ne: product._id },
      isActive: true
    })
    .limit(10)
    .select('_id name images price unit isActive');
    
    res.json({ success: true, data: relatedProducts });
  } catch (err) {
    next(err);
  }
});

router.post('/', upload.array('images', 10), async (req: Request, res, next) => {
  try {
    const body = req.body;
    // Parse JSON fields if sent as strings
    if (typeof body.name === 'string') body.name = JSON.parse(body.name);
    if (typeof body.description === 'string') body.description = JSON.parse(body.description);
    if (typeof body.stock === 'string') body.stock = JSON.parse(body.stock);
    // Handle images
    const baseUrl = req.protocol + '://' + req.get('host');
    let imageUrls: string[] = [];
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      imageUrls = (req.files as Express.Multer.File[]).map(f => baseUrl + '/uploads/' + f.filename);
    }
    // Accept imageUrls from body (external URLs)
    let urlImages: string[] = [];
    if (body.imageUrls) {
      if (typeof body.imageUrls === 'string') {
        try {
          urlImages = JSON.parse(body.imageUrls);
        } catch {
          urlImages = [body.imageUrls];
        }
      } else if (Array.isArray(body.imageUrls)) {
        urlImages = body.imageUrls;
      }
      urlImages = urlImages.filter((img: string) => img.startsWith('http://') || img.startsWith('https://'));
    }
    // Also accept images from body.images (for legacy/external support)
    if (body.images) {
      let legacyImages: string[] = [];
      if (typeof body.images === 'string') {
        try {
          legacyImages = JSON.parse(body.images);
        } catch {
          legacyImages = [body.images];
        }
      } else if (Array.isArray(body.images)) {
        legacyImages = body.images;
      }
      legacyImages = legacyImages.filter((img: string) => img.startsWith('http://') || img.startsWith('https://'));
      urlImages = [...urlImages, ...legacyImages];
    }
    const allImages = [...imageUrls, ...urlImages];
    if (allImages.length) body.images = allImages;
    const product = new Product(body);
    await product.save();
    res.status(201).json({ success: true, data: product, message: 'Product created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create product', details: err });
  }
});

router.put('/:id', upload.array('images', 10), async (req: Request, res, next) => {
  try {
    const body = req.body;
    if (typeof body.name === 'string') body.name = JSON.parse(body.name);
    if (typeof body.description === 'string') body.description = JSON.parse(body.description);
    if (typeof body.stock === 'string') body.stock = JSON.parse(body.stock);
    const baseUrl = req.protocol + '://' + req.get('host');
    let imageUrls: string[] = [];
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      imageUrls = (req.files as Express.Multer.File[]).map(f => baseUrl + '/uploads/' + f.filename);
    }
    let urlImages: string[] = [];
    if (body.imageUrls) {
      if (typeof body.imageUrls === 'string') {
        try {
          urlImages = JSON.parse(body.imageUrls);
        } catch {
          urlImages = [body.imageUrls];
        }
      } else if (Array.isArray(body.imageUrls)) {
        urlImages = body.imageUrls;
      }
      urlImages = urlImages.filter((img: string) => img.startsWith('http://') || img.startsWith('https://'));
    }
    if (body.images) {
      let legacyImages: string[] = [];
      if (typeof body.images === 'string') {
        try {
          legacyImages = JSON.parse(body.images);
        } catch {
          legacyImages = [body.images];
        }
      } else if (Array.isArray(body.images)) {
        legacyImages = body.images;
      }
      legacyImages = legacyImages.filter((img: string) => img.startsWith('http://') || img.startsWith('https://'));
      urlImages = [...urlImages, ...legacyImages];
    }
    const allImages = [...imageUrls, ...urlImages];
    if (allImages.length) body.images = allImages;
    const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!product) return next({ status: 404, message: 'Product not found' });
    res.json({ success: true, data: product, message: 'Product updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update product', details: err });
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next({ status: 404, message: 'Product not found' });
    res.json({ success: true, data: null, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 