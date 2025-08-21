import express from 'express';
import authMiddleware from '../utils/authMiddleware';
import {
  createOutreach,
  getOutreachHistory,
  getOutreachById,
  sendOutreach,
  deleteOutreach,
  getOutreachStats,
} from '../outreachController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create new outreach
router.post('/', createOutreach);

// Get outreach history
router.get('/', getOutreachHistory);

// Get specific outreach by ID
router.get('/:id', getOutreachById);

// Send outreach (for draft outreach)
router.post('/:id/send', sendOutreach);

// Delete outreach (only for draft outreach)
router.delete('/:id', deleteOutreach);

// Get outreach statistics
router.get('/:id/stats', getOutreachStats);

export default router;
