import { Router } from 'express';
import Delivery from '../models/Delivery';
import { parseQuery } from '../utils/queryHelper';

const router = Router();

// List all deliveries with pagination, filtering, and search
router.get('/', async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req);
    const [deliveries, total] = await Promise.all([
      Delivery.find(filter).skip(skip).limit(limit),
      Delivery.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: deliveries,
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

// Get delivery by ID
router.get('/:id', async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return next({ status: 404, message: 'Delivery not found' });
    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
});

// Create delivery
router.post('/', async (req, res, next) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.status(201).json({ success: true, data: delivery, message: 'Delivery created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create delivery', details: err });
  }
});

// Update delivery
router.put('/:id', async (req, res, next) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!delivery) return next({ status: 404, message: 'Delivery not found' });
    res.json({ success: true, data: delivery, message: 'Delivery updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update delivery', details: err });
  }
});

// Delete delivery
router.delete('/:id', async (req, res, next) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return next({ status: 404, message: 'Delivery not found' });
    res.json({ success: true, data: null, message: 'Delivery deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 