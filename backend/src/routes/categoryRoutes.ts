import { Router } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { parseQuery } from '../utils/queryHelper';

const router = Router();

// List all categories with pagination, filtering, and search
router.get('/', async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req, ['name.uz', 'name.ru', 'description.uz', 'description.ru']);
    const [categories, total] = await Promise.all([
      Category.find(filter).skip(skip).limit(limit),
      Category.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: categories,
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
    const category = await Category.findById(req.params.id);
    if (!category) return next({ status: 404, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, data: category, message: 'Category created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create category', details: err });
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return next({ status: 404, message: 'Category not found' });
    res.json({ success: true, data: category, message: 'Category updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update category', details: err });
  }
});

// Bulk delete categories
router.delete('/bulk', async (req, res, next) => {
  try {
    const { categoryIds } = req.body;
    
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return next({ status: 400, message: 'Category IDs array is required' });
    }

    const result = await Category.deleteMany({ _id: { $in: categoryIds } });
    
    res.json({ 
      success: true, 
      data: { deletedCount: result.deletedCount }, 
      message: `Successfully deleted ${result.deletedCount} categories` 
    });
  } catch (err) {
    next({ status: 400, message: 'Failed to delete categories', details: err });
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next({ status: 404, message: 'Category not found' });
    res.json({ success: true, data: null, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

// Get product counts for all categories
router.get('/product-counts', async (req, res, next) => {
  try {
    const productCounts = await Product.aggregate([
      {
        $match: {
          categoryId: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 }
        }
      }
    ]);

    const countsMap: { [key: string]: number } = {};
    productCounts.forEach(item => {
      if (item._id) {
        countsMap[item._id.toString()] = item.count;
      }
    });

    res.json({
      success: true,
      data: countsMap
    });
  } catch (err) {
    next(err);
  }
});

// Seed categories endpoint
router.post('/seed', async (req, res, next) => {
  try {
    const excelImportService = await import('../services/excelImportService');
    const result = await excelImportService.default.createComprehensiveCategories();
    
    res.json({
      success: result.success,
      data: {
        totalCategories: result.totalCategories,
        mainCategories: result.mainCategories
      },
      message: result.message
    });
  } catch (err) {
    next({ status: 500, message: 'Failed to seed categories', details: err });
  }
});

export default router; 