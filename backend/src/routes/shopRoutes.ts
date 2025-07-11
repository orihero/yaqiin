import { Router } from 'express';
import Shop from '../models/Shop';
import { parseQuery } from '../utils/queryHelper';
import mongoose from 'mongoose';
import Courier from '../models/Courier';
import Group from '../models/Group';

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

// Assign a courier to a shop
router.post('/:id/couriers/:courierId', async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    const courierId = req.params.courierId;
    if (!shop.couriers) shop.couriers = [];
    if (!shop.couriers.some(id => id.toString() === courierId)) {
      shop.couriers.push(new mongoose.Types.ObjectId(courierId));
      await shop.save();
    }
    res.json({ success: true, data: shop, message: 'Courier assigned to shop' });
  } catch (err) {
    next({ status: 400, message: 'Failed to assign courier', details: err });
  }
});

// Unassign a courier from a shop
router.delete('/:id/couriers/:courierId', async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    const courierId = req.params.courierId;
    if (shop.couriers) {
      shop.couriers = shop.couriers.filter(id => id.toString() !== courierId);
      await shop.save();
    }
    res.json({ success: true, data: shop, message: 'Courier unassigned from shop' });
  } catch (err) {
    next({ status: 400, message: 'Failed to unassign courier', details: err });
  }
});

// Get all couriers assigned to a shop
router.get('/:id/couriers', async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('couriers');
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    res.json({ success: true, data: shop.couriers || [] });
  } catch (err) {
    next({ status: 400, message: 'Failed to get assigned couriers', details: err });
  }
});

// Get all couriers not assigned to a shop (available for assignment)
router.get('/:id/available-couriers', async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    const assignedIds = (shop.couriers || []).map(id => id.toString());
    const availableCouriers = await Courier.find({ _id: { $nin: assignedIds } });
    res.json({ success: true, data: availableCouriers });
  } catch (err) {
    next({ status: 400, message: 'Failed to get available couriers', details: err });
  }
});

// List all unassigned groups (shopId is null)
router.get('/groups/unassigned', async (req, res, next) => {
  try {
    const groups = await Group.find({ shopId: null });
    res.json({ success: true, data: groups });
  } catch (err) {
    next({ status: 400, message: 'Failed to fetch groups', details: err });
  }
});

export default router; 