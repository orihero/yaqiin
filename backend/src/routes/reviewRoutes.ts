import { Router } from 'express';
import Review from '../models/Review';
import { parseQuery } from '../utils/queryHelper';

const router = Router();

// List all reviews with pagination, filtering, and search
router.get('/', async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req);
    const [reviews, total] = await Promise.all([
      Review.find(filter).skip(skip).limit(limit),
      Review.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: reviews,
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

// Get review by ID
router.get('/:id', async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next({ status: 404, message: 'Review not found' });
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

// Create review
router.post('/', async (req, res, next) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json({ success: true, data: review, message: 'Review created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create review', details: err });
  }
});

// Update review
router.put('/:id', async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return next({ status: 404, message: 'Review not found' });
    res.json({ success: true, data: review, message: 'Review updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update review', details: err });
  }
});

// Delete review
router.delete('/:id', async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return next({ status: 404, message: 'Review not found' });
    res.json({ success: true, data: null, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 