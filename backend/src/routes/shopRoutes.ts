import { Router } from 'express';
import Shop from '../models/Shop';
import { parseQuery } from '../utils/queryHelper';

const router = Router();

// List all shops with pagination, filtering, and search
router.get('/', async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req, ['name', 'description']);
    const [shops, total] = await Promise.all([
      Shop.find(filter).skip(skip).limit(limit),
      Shop.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: shops,
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
    const shop = await Shop.findById(req.params.id);
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    res.json({ success: true, data: shop });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const shop = new Shop(req.body);
    await shop.save();
    res.status(201).json({ success: true, data: shop, message: 'Shop created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create shop', details: err });
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    res.json({ success: true, data: shop, message: 'Shop updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update shop', details: err });
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    res.json({ success: true, data: null, message: 'Shop deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 