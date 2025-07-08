import { Router } from 'express';
import Category from '../models/Category';
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

router.delete('/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next({ status: 404, message: 'Category not found' });
    res.json({ success: true, data: null, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 