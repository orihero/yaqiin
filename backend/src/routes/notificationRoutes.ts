import { Router } from 'express';
import Notification from '../models/Notification';
import { parseQuery } from '../utils/queryHelper';

const router = Router();

// List all notifications with pagination, filtering, and search
router.get('/', async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req);
    const [notifications, total] = await Promise.all([
      Notification.find(filter).skip(skip).limit(limit),
      Notification.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: notifications,
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

// Get notification by ID
router.get('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return next({ status: 404, message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
});

// Create notification
router.post('/', async (req, res, next) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json({ success: true, data: notification, message: 'Notification created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create notification', details: err });
  }
});

// Update notification
router.put('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notification) return next({ status: 404, message: 'Notification not found' });
    res.json({ success: true, data: notification, message: 'Notification updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update notification', details: err });
  }
});

// Delete notification
router.delete('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return next({ status: 404, message: 'Notification not found' });
    res.json({ success: true, data: null, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 