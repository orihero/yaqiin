import { Router } from 'express';
import Courier from '../models/Courier';
import { parseQuery } from '../utils/queryHelper';

const router = Router();

// List all couriers with pagination, filtering, and search
router.get('/', async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req, ['availability', 'vehicleType', 'licenseNumber']);
    const [couriers, total] = await Promise.all([
      Courier.find(filter).populate('userId', 'firstName lastName username').skip(skip).limit(limit),
      Courier.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: couriers,
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
    const courier = await Courier.findById(req.params.id);
    if (!courier) return next({ status: 404, message: 'Courier not found' });
    res.json({ success: true, data: courier });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const courier = new Courier(req.body);
    await courier.save();
    res.status(201).json({ success: true, data: courier, message: 'Courier created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create courier', details: err });
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const courier = await Courier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!courier) return next({ status: 404, message: 'Courier not found' });
    res.json({ success: true, data: courier, message: 'Courier updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update courier', details: err });
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const courier = await Courier.findByIdAndDelete(req.params.id);
    if (!courier) return next({ status: 404, message: 'Courier not found' });
    res.json({ success: true, data: null, message: 'Courier deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 