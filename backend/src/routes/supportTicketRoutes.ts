import { Router } from 'express';
import SupportTicket from '../models/SupportTicket';
import { parseQuery } from '../utils/queryHelper';

const router = Router();

// List all support tickets with pagination, filtering, and search
router.get('/', async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req);
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter).skip(skip).limit(limit),
      SupportTicket.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: tickets,
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

// Get support ticket by ID
router.get('/:id', async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return next({ status: 404, message: 'Support ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
});

// Create support ticket
router.post('/', async (req, res, next) => {
  try {
    const ticket = new SupportTicket(req.body);
    await ticket.save();
    res.status(201).json({ success: true, data: ticket, message: 'Support ticket created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create support ticket', details: err });
  }
});

// Update support ticket
router.put('/:id', async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ticket) return next({ status: 404, message: 'Support ticket not found' });
    res.json({ success: true, data: ticket, message: 'Support ticket updated' });
  } catch (err) {
    next({ status: 400, message: 'Failed to update support ticket', details: err });
  }
});

// Delete support ticket
router.delete('/:id', async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return next({ status: 404, message: 'Support ticket not found' });
    res.json({ success: true, data: null, message: 'Support ticket deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 