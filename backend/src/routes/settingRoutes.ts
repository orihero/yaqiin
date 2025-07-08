import { Router } from 'express';
import Setting from '../models/Setting';
import { parseQuery } from '../utils/queryHelper';

const router = Router();

// List all settings with pagination, filtering, and search
router.get('/', async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req);
    const [settings, total] = await Promise.all([
      Setting.find(filter).skip(skip).limit(limit),
      Setting.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: settings,
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

// Get setting by ID
router.get('/:id', async (req, res, next) => {
  try {
    const setting = await Setting.findById(req.params.id);
    if (!setting) return next({ status: 404, message: 'Setting not found' });
    res.json({ success: true, data: setting });
  } catch (err) {
    next(err);
  }
});

// Create setting
router.post('/', async (req, res, next) => {
  try {
    const setting = new Setting(req.body);
    await setting.save();
    res.status(201).json({ success: true, data: setting, message: 'Setting created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create setting', details: err });
  }
});

// Update setting
router.put('/:id', async (req, res, next) => {
  try {
    const setting = await Setting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!setting) return next({ status: 404, message: 'Setting not found' });
    res.json({ success: true, data: setting, message: 'Setting updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update setting', details: err });
  }
});

// Delete setting
router.delete('/:id', async (req, res, next) => {
  try {
    const setting = await Setting.findByIdAndDelete(req.params.id);
    if (!setting) return next({ status: 404, message: 'Setting not found' });
    res.json({ success: true, data: null, message: 'Setting deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 